import { useCallback, useEffect, useRef, useState } from 'react'
import { sourcePassages } from '../lesson/selectors.js'
import ChatMessage from './ChatMessage.jsx'
import Composer from './Composer.jsx'
import LessonHeader from './LessonHeader.jsx'
import SourcePanel from './SourcePanel.jsx'

export default function LessonScreen({ lesson, onSend, onStop, onRetry, onNewLesson }) {
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

  return (
    <div className="flex h-dvh flex-col bg-slate-50">
      <LessonHeader
        plan={plan}
        progress={progress}
        currentStepIndex={currentStepIndex}
        finished={status === 'done'}
        onNewLesson={onNewLesson}
      />

      <main ref={scroller} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-3xl space-y-5">
          {messages.map((message, i) => (
            <ChatMessage
              key={message.id}
              message={message}
              streaming={status === 'streaming' && i === messages.length - 1}
              onShowSource={() => setSourceMessage(message)}
            />
          ))}

          {status === 'done' && (
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 text-center">
              <p className="font-semibold text-indigo-900">Lesson complete</p>
              <p className="mt-1 text-sm text-indigo-800">
                You worked through all {plan.steps.length} steps. Nice work!
              </p>
              <button
                type="button"
                onClick={onNewLesson}
                className="mt-4 rounded-xl bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-700"
              >
                Start a new lesson
              </button>
            </div>
          )}
        </div>
      </main>

      {status !== 'done' && (
        <footer className="border-t border-slate-200 bg-white px-4 py-3">
          {status === 'error' && (
            <div
              role="alert"
              className="mx-auto mb-3 flex max-w-3xl items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-800"
            >
              <span>{error.message}</span>
              <button
                type="button"
                onClick={onRetry}
                className="shrink-0 rounded-lg bg-white px-3 py-1 font-medium text-red-700 ring-1 ring-red-200 hover:bg-red-100"
              >
                Retry
              </button>
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
