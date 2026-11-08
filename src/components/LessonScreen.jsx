import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { useT } from '../i18n/language.js'
import { errorText } from '../i18n/strings.js'
import { sourcePassages } from '../lesson/selectors.js'
import ApiKeyField from './ApiKeyField.jsx'
import ChatMessage from './ChatMessage.jsx'
import { RetryIcon } from './icons.jsx'
import Composer from './Composer.jsx'
import LessonHeader from './LessonHeader.jsx'
import LessonReport from './LessonReport.jsx'
import SourcePanel from './SourcePanel.jsx'

// Errors that a new key can fix, so the key field is offered right in the lesson.
const KEY_ERRORS = ['INVALID_KEY', 'QUOTA_EXCEEDED']

export default function LessonScreen({ lesson, apiKey, onApiKeyChange, onSend, onStop, onRetry, onNewLesson }) {
  const t = useT()
  const [sourceMessage, setSourceMessage] = useState(null)
  const closeSource = useCallback(() => setSourceMessage(null), [])
  const { plan, progress, currentStepIndex, messages, status, error } = lesson
  const scroller = useRef(null)
  const lastText = messages.at(-1)?.text

  // Follow new text as it streams in, unless the student scrolled up to read.
  useEffect(() => {
    const el = scroller.current
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 200) el.scrollTop = el.scrollHeight
  }, [messages.length, lastText])

  // A stray tap on "New lesson" shouldn't throw away a lesson in progress.
  function leaveLesson() {
    if (status === 'done' || window.confirm(t.leaveConfirm)) onNewLesson()
  }

  return (
    <div className="flex h-dvh flex-col bg-slate-50">
      <LessonHeader
        plan={plan}
        progress={progress}
        currentStepIndex={currentStepIndex}
        finished={status === 'done'}
        onNewLesson={leaveLesson}
      />

      <main ref={scroller} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-3xl space-y-5">
          {lesson.document.skippedPages.length > 0 && (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
              {t.skippedPages(lesson.document.skippedPages.join(', '))}
            </p>
          )}

          {messages.map((message, i) => (
            <Fragment key={message.id}>
              {/* A divider where a new step begins, so progress shows in the chat too. */}
              {message.stepIndex !== messages[i - 1]?.stepIndex && (
                <StepDivider label={t.stepNumber(message.stepIndex + 1)} title={plan.steps[message.stepIndex].title} />
              )}
              <ChatMessage
                message={message}
                streaming={status === 'streaming' && i === messages.length - 1}
                sourceLabel={sourceLabel(t, sourcePassages(lesson, message))}
                onShowSource={() => setSourceMessage(message)}
              />
            </Fragment>
          ))}

          {status === 'done' && <LessonReport lesson={lesson} onNewLesson={onNewLesson} />}
        </div>
      </main>

      {status !== 'done' && (
        <footer className="border-t border-slate-200 bg-white px-4 py-3">
          {status === 'error' && (
            <div
              role="alert"
              className="mx-auto mb-3 max-w-3xl space-y-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-800"
            >
              <div className="flex items-center justify-between gap-3">
                <span>{errorText(t, error)}</span>
                <button
                  type="button"
                  onClick={onRetry}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white px-3 py-1 font-medium text-red-700 ring-1 ring-red-200 hover:bg-red-100"
                >
                  <RetryIcon className="size-4" />
                  {t.retry}
                </button>
              </div>
              {KEY_ERRORS.includes(error.code) && <ApiKeyField value={apiKey} onChange={onApiKeyChange} />}
            </div>
          )}
          <Composer status={status} onSend={onSend} onStop={onStop} />
        </footer>
      )}

      {sourceMessage && (
        <SourcePanel passages={sourcePassages(lesson, sourceMessage)} onClose={closeSource} />
      )}
    </div>
  )
}

function StepDivider({ label, title }) {
  return (
    <div className="flex items-center gap-3 pt-2 text-xs font-medium text-slate-500">
      <span className="h-px flex-1 bg-slate-200" />
      {/* <bdi> keeps a title in another script (e.g. Hebrew in the English interface) in its own order. */}
      <span className="max-w-[75%] truncate rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
        {label} · <bdi>{title}</bdi>
      </span>
      <span className="h-px flex-1 bg-slate-200" />
    </div>
  )
}

// "Source · p. 3" so the student sees where in the file an answer comes from.
function sourceLabel(t, passages) {
  const pages = [...new Set(passages.map((p) => p.page).filter((page) => page !== null))]
  if (pages.length === 0) return t.source
  return t.sourcePages(pages.length <= 3 ? pages.join(', ') : `${pages[0]}–${pages.at(-1)}`)
}
