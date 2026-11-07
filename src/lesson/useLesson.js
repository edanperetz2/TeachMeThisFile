import { useReducer } from 'react'
import { toErrorState } from '../errors.js'
import { readDocument } from '../files/readDocument.js'
import { initialLessonState, lessonReducer } from './lessonReducer.js'

// Connects the lesson store to file reading and the AI calls. The UI only calls
// these functions; it never talks to the network or changes lesson state directly.
export function useLesson() {
  const [lesson, dispatch] = useReducer(lessonReducer, initialLessonState)

  async function startLesson({ file, teacherPrompt }) {
    dispatch({ type: 'EXTRACTION_STARTED', teacherPrompt })
    try {
      const document = await readDocument(file)
      dispatch({ type: 'DOCUMENT_READY', document })
    } catch (error) {
      dispatch({ type: 'FAILED', error: toErrorState(error) })
    }
  }

  return { lesson, startLesson }
}
