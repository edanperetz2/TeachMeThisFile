import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { initialLessonState } from './lessonReducer.js'
import { loadLesson, saveLesson } from './savedLesson.js'

const plan = { title: 'Cells', language: 'English', steps: [{ title: 's1', objective: 'o', passageIds: ['p1'], question: 'q' }] }
const lesson = (status) => ({ ...initialLessonState, status, plan })

function memoryStorage() {
  const items = new Map()
  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => items.set(key, value),
    removeItem: (key) => items.delete(key),
  }
}

beforeEach(() => vi.stubGlobal('sessionStorage', memoryStorage()))
afterEach(() => vi.unstubAllGlobals())

describe('saved lesson', () => {
  it('starts fresh when nothing is saved', () => {
    expect(loadLesson()).toBe(initialLessonState)
  })

  it('restores a lesson saved between turns', () => {
    saveLesson(lesson('idle'))
    expect(loadLesson()).toEqual(lesson('idle'))
  })

  it('does not save while a reply is streaming', () => {
    saveLesson(lesson('idle'))
    saveLesson({ ...lesson('streaming'), currentStepIndex: 3 })
    expect(loadLesson().currentStepIndex).toBe(0)
  })

  it('forgets the lesson when a new one starts', () => {
    saveLesson(lesson('done'))
    saveLesson(initialLessonState)
    expect(loadLesson()).toBe(initialLessonState)
  })

  it('keeps working when storage is full or blocked', () => {
    vi.stubGlobal('sessionStorage', {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
    })
    expect(() => saveLesson(lesson('idle'))).not.toThrow()
    expect(loadLesson()).toBe(initialLessonState)
  })
})
