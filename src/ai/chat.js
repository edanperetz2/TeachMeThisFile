import { AppError } from '../errors.js'
import { currentStep, isLastAttempt, passagesByIds } from '../lesson/selectors.js'
import { postToApi } from './api.js'
import { splitControl, visibleText } from './control.js'

// The tutor sees the recent conversation only; the plan and progress carry the rest.
const HISTORY_MESSAGES = 10

// What the server needs for one tutor turn, taken from the lesson state.
// Only the current step's passages are sent: cheaper, and keeps the tutor on topic.
export function tutorTurnRequest(lesson, studentText, now = Date.now()) {
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
    // Lets the tutor respect the teacher's time budget (the plan's durationMinutes).
    minutesUsed: lesson.progress[0].startedAt ? Math.floor((now - lesson.progress[0].startedAt) / 60000) : null,
  }
}

// Streams one tutor reply. onText gets the visible text so far; the return value
// is the parsed control signal (or null). Now and then the model sends no visible
// text at all; since the student saw nothing, we quietly ask once more.
export async function streamTutorTurn({ request, apiKey, signal, onText }) {
  for (let attempt = 1; ; attempt++) {
    const { text, control } = splitControl(await readReply(request, apiKey, signal, onText))
    if (text) {
      onText(text)
      return control
    }
    if (attempt === 2) throw new AppError('UPSTREAM', "The tutor didn't answer. Please try again.")
  }
}

async function readReply(request, apiKey, signal, onText) {
  const response = await postToApi('/api/chat', request, { apiKey, signal })
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
  let raw = ''
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) return raw
      raw += value
      onText(visibleText(raw))
    }
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new AppError('NETWORK', 'The connection was interrupted. Please try again.')
  }
}
