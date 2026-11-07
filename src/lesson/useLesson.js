import { useReducer } from 'react'
import { initialLessonState, lessonReducer } from './lessonReducer.js'

// Connects the lesson store to the AI calls. The UI only calls these functions;
// it never talks to the network or changes lesson state directly.
export function useLesson() {
  const [lesson, dispatch] = useReducer(lessonReducer, initialLessonState)

  function startLesson({ teacherPrompt }) {
    dispatch({ type: 'EXTRACTION_STARTED', teacherPrompt })
  }

  return { lesson, startLesson }
}
