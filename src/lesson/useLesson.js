import { useEffect, useReducer, useRef } from 'react'
import { streamTutorTurn, tutorTurnRequest } from '../ai/chat.js'
import { requestPlan } from '../ai/plan.js'
import { toErrorState } from '../errors.js'
import { readDocument } from '../files/readDocument.js'
import { initialLessonState, lessonReducer } from './lessonReducer.js'
import { needsOpeningTurn } from './selectors.js'

// Connects the lesson store to file reading and the AI calls. The UI only calls
// these functions; it never talks to the network or changes lesson state directly.
export function useLesson(apiKey) {
  const [lesson, dispatch] = useReducer(lessonReducer, initialLessonState)
  const turnController = useRef(null)

  async function startLesson({ file, teacherPrompt }) {
    dispatch({ type: 'EXTRACTION_STARTED', teacherPrompt })
    try {
      const document = await readDocument(file)
      dispatch({ type: 'DOCUMENT_READY', document })
      const plan = await requestPlan({ teacherPrompt, passages: document.passages, apiKey })
      dispatch({ type: 'PLAN_READY', plan })
    } catch (error) {
      dispatch({ type: 'FAILED', error: toErrorState(error) })
    }
  }

  // One tutor turn. studentText is null when the tutor speaks on its own
  // (opening a step) or when a failed turn is retried.
  async function runTurn(studentText) {
    const request = tutorTurnRequest(lesson, studentText)
    const controller = new AbortController()
    turnController.current = controller
    dispatch({ type: 'TURN_STARTED', studentText })
    try {
      const control = await streamTutorTurn({
        request,
        apiKey,
        signal: controller.signal,
        onText: (text) => dispatch({ type: 'TEXT_RECEIVED', text }),
      })
      dispatch({ type: 'TURN_FINISHED', control })
    } catch (error) {
      if (error.name === 'AbortError') dispatch({ type: 'TURN_STOPPED' })
      else dispatch({ type: 'TURN_FAILED', error: toErrorState(error) })
    }
  }

  // The tutor speaks first: at the start and whenever a new step begins.
  useEffect(() => {
    if (needsOpeningTurn(lesson)) runTurn(null)
  }, [lesson])

  function sendMessage(text) {
    if (lesson.status === 'idle' && text.trim()) runTurn(text.trim())
  }

  function stopTurn() {
    turnController.current?.abort()
  }

  function retryTurn() {
    runTurn(null)
  }

  function newLesson() {
    turnController.current?.abort()
    dispatch({ type: 'RESET' })
  }

  return { lesson, startLesson, sendMessage, stopTurn, retryTurn, newLesson }
}
