// Read-only questions about the lesson state, shared by the UI and the AI wrappers.
import { MAX_ATTEMPTS } from './lessonReducer.js'

export function currentStep(state) {
  return state.plan?.steps[state.currentStepIndex] ?? null
}

export function passagesByIds(state, ids) {
  return state.document.passages.filter((p) => ids.includes(p.id))
}

// The passages behind a tutor message. A message that was stopped before its control
// line arrived has no ids of its own, so it shows its step's passages.
export function sourcePassages(state, message) {
  const ids = message.passageIds.length > 0 ? message.passageIds : state.plan.steps[message.stepIndex].passageIds
  return passagesByIds(state, ids)
}

// The tutor speaks first: at the start of the lesson and of every new step.
export function needsOpeningTurn(state) {
  return (
    state.status === 'idle' &&
    state.plan !== null &&
    !state.messages.some((m) => m.role === 'tutor' && m.stepIndex === state.currentStepIndex)
  )
}

// The student's next answer is the last try on this step: if it is still wrong,
// the tutor should explain clearly and move on (the reducer then advances).
export function isLastAttempt(state) {
  return state.progress[state.currentStepIndex].attempts >= MAX_ATTEMPTS - 1
}
