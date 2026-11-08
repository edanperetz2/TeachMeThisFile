import { useEffect, useReducer, useRef } from 'react'
import { streamTutorTurn, tutorTurnRequest } from '../ai/chat.js'
import { readScannedPages } from '../ai/extract.js'
import { requestPlan } from '../ai/plan.js'
import { toErrorState } from '../errors.js'
import { readDocument } from '../files/readDocument.js'
import { lessonReducer } from './lessonReducer.js'
import { loadLesson, saveLesson } from './savedLesson.js'
import { languageQuestion, needsOpeningTurn } from './selectors.js'

// Connects the lesson store to file reading and the AI calls. The UI only calls
// these functions; it never talks to the network or changes lesson state directly.
export function useLesson(apiKey) {
  // A lesson in progress is restored after a reload of this tab.
  const [lesson, dispatch] = useReducer(lessonReducer, undefined, loadLesson)
  const turnController = useRef(null)

  async function startLesson({ file, teacherPrompt }) {
    dispatch({ type: 'EXTRACTION_STARTED', teacherPrompt })
    const readScanned = (scanned) =>
      readScannedPages(scanned, {
        apiKey,
        onProgress: ({ done, total }) => dispatch({ type: 'SCAN_PROGRESS', done, total }),
      })
    try {
      const document = await readDocument(file, readScanned)
      dispatch({ type: 'DOCUMENT_READY', document })
      const plan = await requestPlan({ teacherPrompt, passages: document.passages, apiKey })
      if (languageQuestion(plan)) dispatch({ type: 'LANGUAGE_QUESTION', plan })
      else dispatch({ type: 'PLAN_READY', plan, at: Date.now() })
    } catch (error) {
      dispatch({ type: 'FAILED', error: toErrorState(error) })
    }
  }

  // The teacher's answer to "which language?" (an ISO code). The plan already made in that
  // language is used as is; for the other one the lesson is planned again in it.
  async function chooseLanguage(code) {
    const plan = lesson.pendingPlan
    const name = new Intl.DisplayNames(['en'], { type: 'language' }).of(code)
    const teacherPrompt = `${lesson.teacherPrompt}\n\nTeach the lesson in ${name}.`
    dispatch({ type: 'LANGUAGE_CHOSEN', teacherPrompt })
    try {
      const chosenPlan =
        code === plan.languages.lesson
          ? plan
          : await requestPlan({ teacherPrompt, passages: lesson.document.passages, apiKey })
      dispatch({ type: 'PLAN_READY', plan: chosenPlan, at: Date.now() })
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
      dispatch({ type: 'TURN_FINISHED', control, at: Date.now() })
    } catch (error) {
      if (error.name === 'AbortError') dispatch({ type: 'TURN_STOPPED' })
      else dispatch({ type: 'TURN_FAILED', error: toErrorState(error) })
    }
  }

  // The tutor speaks first: at the start and whenever a new step begins.
  useEffect(() => {
    if (needsOpeningTurn(lesson)) runTurn(null)
  }, [lesson])

  useEffect(() => saveLesson(lesson), [lesson])

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

  return { lesson, startLesson, chooseLanguage, sendMessage, stopTurn, retryTurn, newLesson }
}
