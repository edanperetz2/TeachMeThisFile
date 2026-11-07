import { AppError } from '../errors.js'
import { currentStep, isLastAttempt, passagesByIds } from '../lesson/selectors.js'
import { postToApi } from './api.js'
import { splitControl, visibleText } from './control.js'

// The tutor sees the recent conversation only; the plan and progress carry the rest.
const HISTORY_MESSAGES = 10

// What the server needs for one tutor turn, taken from the lesson state.
// Only the current step's passages are sent: cheaper, and keeps the tutor on topic.
export function tutorTurnRequest(lesson, studentText) {
  const step = currentStep(lesson)
  const messages = studentText ? [...lesson.messages, { role: 'student', text: studentText }] : lesson.messages
  return {
    teacherPrompt: lesson.teacherPrompt,
    plan: lesson.plan,
    stepIndex: lesson.currentStepIndex,
    progress: lesson.progress[lesson.currentStepIndex],
    passages: passagesByIds(lesson, step.passageIds),
    messages: messages
      .filter((m) => m.text.trim())
      .slice(-HISTORY_MESSAGES)
      .map(({ role, text }) => ({ role, text })),
    opening: !lesson.messages.some((m) => m.role === 'tutor' && m.stepIndex === lesson.currentStepIndex),
    lastAttempt: isLastAttempt(lesson),
  }
}

// Streams one tutor reply. onText gets the visible text so far; the return value
// is the parsed control signal (or null).
export async function streamTutorTurn({ request, apiKey, signal, onText }) {
  const response = await postToApi('/api/chat', request, { apiKey, signal })
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
  let raw = ''
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      raw += value
      onText(visibleText(raw))
    }
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new AppError('NETWORK', 'The connection was interrupted. Please try again.')
  }

  const { text, control } = splitControl(raw)
  if (!text) throw new AppError('UPSTREAM', "The tutor didn't answer. Please try again.")
  onText(text)
  return control
}
