import { describe, expect, it } from 'vitest'
import { initialLessonState, lessonReducer, MAX_ATTEMPTS } from './lessonReducer.js'
import { isLastAttempt, needsOpeningTurn } from './selectors.js'

const document = {
  fileName: 'cells.pdf',
  passages: [
    { id: 'p1', text: 'Cells are the basic unit of life.', page: 1 },
    { id: 'p2', text: 'The nucleus holds DNA.', page: 1 },
    { id: 'p3', text: 'Mitochondria make energy.', page: 2 },
  ],
}

const plan = {
  language: 'en',
  steps: [
    { title: 'What is a cell', objective: 'o1', passageIds: ['p1', 'p2'], question: 'q1' },
    { title: 'Energy', objective: 'o2', passageIds: ['p3'], question: 'q2' },
  ],
}

function run(state, ...actions) {
  return actions.reduce(lessonReducer, state)
}

function plannedLesson() {
  return run(
    initialLessonState,
    { type: 'EXTRACTION_STARTED', teacherPrompt: 'Teach 7th graders' },
    { type: 'DOCUMENT_READY', document },
    { type: 'PLAN_READY', plan },
  )
}

// One full tutor turn: optional student message, streamed text, control signal.
function turn(state, studentText, control) {
  return run(
    state,
    { type: 'TURN_STARTED', studentText },
    { type: 'TEXT_RECEIVED', text: 'Tutor says something.' },
    { type: 'TURN_FINISHED', control },
  )
}

const noAdvance = { advance: false, passageIds: [], understood: 'no' }
const advance = { advance: true, passageIds: ['p1'], understood: 'yes' }

describe('setup flow', () => {
  it('goes extracting → planning → idle with step 1 active', () => {
    let state = lessonReducer(initialLessonState, { type: 'EXTRACTION_STARTED', teacherPrompt: 'x' })
    expect(state.status).toBe('extracting')

    state = lessonReducer(state, { type: 'DOCUMENT_READY', document })
    expect(state.status).toBe('planning')

    state = lessonReducer(state, { type: 'PLAN_READY', plan })
    expect(state.status).toBe('idle')
    expect(state.currentStepIndex).toBe(0)
    expect(state.progress.map((p) => p.status)).toEqual(['active', 'pending'])
  })

  it('tracks progress while scanned pages are read, and resets it for a new lesson', () => {
    let state = lessonReducer(initialLessonState, { type: 'EXTRACTION_STARTED', teacherPrompt: 'x' })
    state = lessonReducer(state, { type: 'SCAN_PROGRESS', done: 4, total: 12 })
    expect(state.scanProgress).toEqual({ done: 4, total: 12 })
    state = lessonReducer(state, { type: 'EXTRACTION_STARTED', teacherPrompt: 'y' })
    expect(state.scanProgress).toBeNull()
  })

  it('records extraction and planning errors', () => {
    const error = { code: 'INVALID_KEY', message: 'Bad key' }
    const state = lessonReducer(plannedLesson(), { type: 'FAILED', error })
    expect(state.status).toBe('error')
    expect(state.error).toEqual(error)
  })
})

describe('opening turns', () => {
  it('needs an opening turn once the plan is ready', () => {
    expect(needsOpeningTurn(plannedLesson())).toBe(true)
  })

  it('does not count an opening turn as an attempt', () => {
    const state = turn(plannedLesson(), null, noAdvance)
    expect(state.progress[0].attempts).toBe(0)
    expect(needsOpeningTurn(state)).toBe(false)
  })

  it('needs a new opening turn after advancing to the next step', () => {
    let state = turn(plannedLesson(), null, noAdvance)
    state = turn(state, 'A cell is the smallest living unit', advance)
    expect(state.currentStepIndex).toBe(1)
    expect(needsOpeningTurn(state)).toBe(true)
  })
})

describe('streaming', () => {
  it('shows the streamed text so far in the tutor message', () => {
    const state = run(
      plannedLesson(),
      { type: 'TURN_STARTED', studentText: 'Hi' },
      { type: 'TEXT_RECEIVED', text: 'Hel' },
      { type: 'TEXT_RECEIVED', text: 'Hello' },
    )
    expect(state.status).toBe('streaming')
    expect(state.messages.map((m) => [m.role, m.text])).toEqual([
      ['student', 'Hi'],
      ['tutor', 'Hello'],
    ])
  })

  it('ignores events from a turn that is no longer running', () => {
    const fresh = lessonReducer(plannedLesson(), { type: 'RESET' })
    expect(lessonReducer(fresh, { type: 'TURN_STOPPED' })).toBe(fresh)
    expect(lessonReducer(fresh, { type: 'TEXT_RECEIVED', text: 'late' })).toBe(fresh)
  })
})

describe('advancing', () => {
  it('advances when the control signal says so', () => {
    const state = turn(turn(plannedLesson(), null, noAdvance), 'answer', advance)
    expect(state.currentStepIndex).toBe(1)
    expect(state.progress[0]).toMatchObject({ status: 'done', attempts: 1, understood: 'yes' })
    expect(state.progress[1].status).toBe('active')
  })

  it("never advances on the tutor's opening message, even if the model says so", () => {
    const state = turn(plannedLesson(), null, advance)
    expect(state.currentStepIndex).toBe(0)
    expect(state.progress[0].status).toBe('active')
  })

  it('records when each step starts and finishes', () => {
    let state = lessonReducer(plannedLesson(), { type: 'PLAN_READY', plan, at: 1000 })
    state = run(
      state,
      { type: 'TURN_STARTED', studentText: 'answer' },
      { type: 'TEXT_RECEIVED', text: 'Right!' },
      { type: 'TURN_FINISHED', control: advance, at: 61000 },
    )
    expect(state.progress[0]).toMatchObject({ startedAt: 1000, finishedAt: 61000 })
    expect(state.progress[1]).toMatchObject({ startedAt: 61000, finishedAt: null })
  })

  it('does not advance when the control signal is missing', () => {
    const state = turn(turn(plannedLesson(), null, null), 'answer', null)
    expect(state.currentStepIndex).toBe(0)
    expect(state.status).toBe('idle')
    expect(state.progress[0].attempts).toBe(1)
  })

  it(`advances anyway after ${MAX_ATTEMPTS} attempts without understanding`, () => {
    let state = turn(plannedLesson(), null, noAdvance)
    state = turn(state, 'wrong 1', noAdvance)
    expect(isLastAttempt(state)).toBe(false)
    state = turn(state, 'wrong 2', noAdvance)
    expect(isLastAttempt(state)).toBe(true)
    state = turn(state, 'wrong 3', noAdvance)
    expect(state.currentStepIndex).toBe(1)
    expect(state.progress[0]).toMatchObject({ status: 'done', attempts: 3, understood: 'no' })
  })

  it('finishes the lesson after the last step', () => {
    let state = turn(turn(plannedLesson(), null, noAdvance), 'answer', advance)
    state = turn(turn(state, null, noAdvance), 'answer', { ...advance, passageIds: ['p3'] })
    expect(state.status).toBe('done')
    expect(state.currentStepIndex).toBe(1)
    expect(state.progress.map((p) => p.status)).toEqual(['done', 'done'])
    expect(needsOpeningTurn(state)).toBe(false)
  })
})

describe('source passages', () => {
  it('keeps valid passage ids from the control signal', () => {
    const state = turn(plannedLesson(), null, { advance: false, passageIds: ['p2'] })
    expect(state.messages.at(-1).passageIds).toEqual(['p2'])
  })

  it("drops ids outside the current step and falls back to the step's passages", () => {
    const state = turn(plannedLesson(), null, { advance: false, passageIds: ['p3', 'p99'] })
    expect(state.messages.at(-1).passageIds).toEqual(['p1', 'p2'])
  })

  it('falls back to the step passages when the control signal is missing', () => {
    const state = turn(plannedLesson(), null, null)
    expect(state.messages.at(-1).passageIds).toEqual(['p1', 'p2'])
  })
})

describe('stop and failures', () => {
  it('keeps partial text on Stop, without counting an attempt or advancing', () => {
    const state = run(
      turn(plannedLesson(), null, noAdvance),
      { type: 'TURN_STARTED', studentText: 'answer' },
      { type: 'TEXT_RECEIVED', text: 'Partial' },
      { type: 'TURN_STOPPED' },
    )
    expect(state.status).toBe('idle')
    expect(state.messages.at(-1)).toMatchObject({ text: 'Partial', stopped: true })
    expect(state.progress[0].attempts).toBe(0)
    expect(state.currentStepIndex).toBe(0)
  })

  it('drops the empty tutor message when a turn fails before any text', () => {
    const error = { code: 'RATE_LIMITED', message: 'Slow down' }
    const state = run(
      plannedLesson(),
      { type: 'TURN_STARTED', studentText: 'Hi' },
      { type: 'TURN_FAILED', error },
    )
    expect(state.status).toBe('error')
    expect(state.error).toEqual(error)
    expect(state.messages.map((m) => m.role)).toEqual(['student'])
  })

  it('keeps partial text when a turn fails mid-stream, marked as stopped', () => {
    const state = run(
      plannedLesson(),
      { type: 'TURN_STARTED', studentText: null },
      { type: 'TEXT_RECEIVED', text: 'Half a sent' },
      { type: 'TURN_FAILED', error: { code: 'NETWORK', message: 'Offline' } },
    )
    expect(state.messages.at(-1)).toMatchObject({ text: 'Half a sent', stopped: true })
  })

  it('clears the error when the turn is retried', () => {
    let state = run(
      plannedLesson(),
      { type: 'TURN_STARTED', studentText: 'Hi' },
      { type: 'TURN_FAILED', error: { code: 'TIMEOUT', message: 'Timed out' } },
    )
    state = turn(state, null, noAdvance)
    expect(state.status).toBe('idle')
    expect(state.error).toBeNull()
    expect(state.messages.map((m) => m.role)).toEqual(['student', 'tutor'])
    expect(state.progress[0].attempts).toBe(1)
  })
})

it('resets to a fresh lesson', () => {
  expect(lessonReducer(plannedLesson(), { type: 'RESET' })).toBe(initialLessonState)
})

it('throws on unknown actions so typos fail loudly', () => {
  expect(() => lessonReducer(initialLessonState, { type: 'NOPE' })).toThrow('Unknown lesson action')
})
