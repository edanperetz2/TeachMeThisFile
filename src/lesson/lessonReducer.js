// The lesson store: everything the app knows about the current lesson.
// Pure functions only — no React, no network. The UI dispatches actions,
// the AI wrappers report results as actions, and this file decides what
// they mean (including when the lesson moves to the next step).

// Wrong answers allowed on one step before the tutor explains and moves on.
export const MAX_ATTEMPTS = 3

export const initialLessonState = {
  // What is in flight right now: idle | extracting | planning | streaming | done | error
  status: 'idle',
  error: null, // { code, message } while status is 'error'
  teacherPrompt: '',
  document: null, // { fileName, passages: [{ id, text, page }] }
  plan: null, // { language, steps: [{ title, objective, passageIds, question }] }
  currentStepIndex: 0,
  progress: [], // one per plan step: { status: pending | active | done, attempts, understood }
  messages: [], // { id, role: tutor | student, text, stepIndex, passageIds, stopped }
}

export function lessonReducer(state, action) {
  switch (action.type) {
    case 'EXTRACTION_STARTED':
      return {
        ...initialLessonState,
        status: 'extracting',
        teacherPrompt: action.teacherPrompt,
      }

    case 'DOCUMENT_READY':
      return { ...state, status: 'planning', document: action.document }

    case 'PLAN_READY':
      return {
        ...state,
        status: 'idle',
        plan: action.plan,
        currentStepIndex: 0,
        progress: action.plan.steps.map((_, i) => ({
          status: i === 0 ? 'active' : 'pending',
          attempts: 0,
          understood: null,
        })),
      }

    case 'TURN_STARTED': {
      // studentText is null for turns the tutor opens on its own
      // (lesson start, new step) and for retries of a failed turn.
      const messages = [...state.messages]
      if (action.studentText) {
        messages.push(newMessage(messages, 'student', action.studentText, state.currentStepIndex))
      }
      messages.push(newMessage(messages, 'tutor', '', state.currentStepIndex))
      return { ...state, status: 'streaming', error: null, messages }
    }

    case 'TEXT_RECEIVED':
      return updateLastMessage(state, (m) => ({ ...m, text: m.text + action.text }))

    case 'TURN_FINISHED':
      return finishTurn(state, action.control)

    case 'TURN_STOPPED':
      // Student pressed Stop: keep the partial text, no attempt, no advance.
      return updateLastMessage({ ...state, status: 'idle' }, markStopped)

    case 'TURN_FAILED': {
      // Keep whatever text already arrived; drop an empty placeholder.
      const last = state.messages.at(-1)
      const failed = { ...state, status: 'error', error: action.error }
      if (last.text === '') {
        return { ...failed, messages: state.messages.slice(0, -1) }
      }
      return updateLastMessage(failed, markStopped)
    }

    case 'FAILED':
      // Extraction or planning failed: nothing to keep from this step.
      return { ...state, status: 'error', error: action.error }

    case 'RESET':
      return initialLessonState

    default:
      throw new Error(`Unknown lesson action: ${action.type}`)
  }
}

function finishTurn(state, control) {
  const index = state.currentStepIndex
  const step = state.plan.steps[index]
  const stepProgress = state.progress[index]

  // Source passages must belong to the current step, so "Source" always works.
  const validIds = (control?.passageIds ?? []).filter((id) => step.passageIds.includes(id))
  const passageIds = validIds.length > 0 ? validIds : step.passageIds

  // A turn that answered the student counts as an attempt; an opening turn does not.
  const answeredStudent = state.messages.at(-2)?.role === 'student'
  const attempts = stepProgress.attempts + (answeredStudent ? 1 : 0)

  // A missing or malformed control signal means "don't advance".
  // After MAX_ATTEMPTS the tutor was told to explain and move on, so we advance anyway.
  const advance = control?.advance === true || attempts >= MAX_ATTEMPTS
  const understood = control?.understood ?? stepProgress.understood
  const isLastStep = index === state.plan.steps.length - 1

  const progress = state.progress.map((p, i) => {
    if (i === index) return { attempts, understood, status: advance ? 'done' : 'active' }
    if (i === index + 1 && advance) return { ...p, status: 'active' }
    return p
  })

  return {
    ...updateLastMessage(state, (m) => ({ ...m, passageIds })),
    progress,
    status: advance && isLastStep ? 'done' : 'idle',
    currentStepIndex: advance && !isLastStep ? index + 1 : index,
  }
}

function newMessage(messages, role, text, stepIndex) {
  return { id: `m${messages.length + 1}`, role, text, stepIndex, passageIds: [], stopped: false }
}

function markStopped(message) {
  return { ...message, stopped: true }
}

function updateLastMessage(state, update) {
  const messages = [...state.messages]
  messages[messages.length - 1] = update(messages.at(-1))
  return { ...state, messages }
}
