import { describe, expect, it } from 'vitest'
import { initialLessonState, lessonReducer } from './lessonReducer.js'
import { languageQuestion } from './selectors.js'

const planWith = (languages) => ({ title: 'Cells', language: 'Hebrew', languages, steps: [] })

describe('languageQuestion', () => {
  it('asks when the teacher named no language and the instructions and the file differ', () => {
    expect(languageQuestion(planWith({ lesson: 'he', prompt: 'en', document: 'he', requested: false }))).toEqual(['en', 'he'])
  })

  it('does not ask when the teacher named the language', () => {
    expect(languageQuestion(planWith({ lesson: 'fr', prompt: 'en', document: 'he', requested: true }))).toBeNull()
  })

  it('does not ask when the instructions and the file are in the same language', () => {
    expect(languageQuestion(planWith({ lesson: 'en', prompt: 'en', document: 'en', requested: false }))).toBeNull()
  })

  it('does not ask when a language is unknown (or the plan predates this field)', () => {
    expect(languageQuestion(planWith({ lesson: 'he', prompt: '', document: 'he', requested: false }))).toBeNull()
    expect(languageQuestion({ steps: [] })).toBeNull()
  })
})

describe('choosing the lesson language', () => {
  const plan = { ...planWith({ lesson: 'he', prompt: 'en', document: 'he', requested: false }), steps: [{ title: 's', passageIds: [] }] }

  it('waits for the teacher, then records the choice in the instructions', () => {
    let state = lessonReducer(initialLessonState, { type: 'EXTRACTION_STARTED', teacherPrompt: 'Teach 7th graders.' })
    state = lessonReducer(state, { type: 'LANGUAGE_QUESTION', plan })
    expect(state).toMatchObject({ status: 'choosingLanguage', pendingPlan: plan, plan: null })

    state = lessonReducer(state, { type: 'LANGUAGE_CHOSEN', teacherPrompt: 'Teach 7th graders.\n\nTeach the lesson in English.' })
    expect(state).toMatchObject({ status: 'planning', pendingPlan: null, teacherPrompt: 'Teach 7th graders.\n\nTeach the lesson in English.' })

    state = lessonReducer(state, { type: 'PLAN_READY', plan, at: 0 })
    expect(state).toMatchObject({ status: 'idle', plan, pendingPlan: null })
  })
})
