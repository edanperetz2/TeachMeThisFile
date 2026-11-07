// Keeps a running lesson across a page reload (phones reload background tabs often).
// sessionStorage: it stays in this tab only and is gone when the tab closes.
import { initialLessonState } from './lessonReducer.js'

const STORAGE_KEY = 'lesson-v1'

// Only calm moments are saved: between turns, after the lesson ended, or after an error.
// While a reply streams the state changes many times a second.
const SAVED_STATUSES = ['idle', 'done', 'error']

export function loadLesson() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY))
    return saved?.plan ? saved : initialLessonState
  } catch {
    return initialLessonState // nothing saved, storage blocked or unreadable data
  }
}

export function saveLesson(lesson) {
  try {
    if (!lesson.plan) sessionStorage.removeItem(STORAGE_KEY)
    else if (SAVED_STATUSES.includes(lesson.status)) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(lesson))
  } catch {
    // Too big for storage (a very long document) or storage blocked: the lesson just won't survive a reload.
  }
}
