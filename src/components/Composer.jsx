import { useState } from 'react'
import { SendIcon, StopIcon } from './icons.jsx'

// One-tap answers for a stuck student (handy on a phone). The tutor's rules already
// cover each of them: break the idea down, give a hint, explain another way.
const QUICK_REPLIES = ["I don't know", 'Give me a hint', 'Explain it differently']

export default function Composer({ status, onSend, onStop }) {
  const [text, setText] = useState('')
  const streaming = status === 'streaming'
  const canSend = status === 'idle' && text.trim() !== ''

  function send() {
    if (!canSend) return
    onSend(text)
    setText('')
  }

  return (
    <div className="mx-auto max-w-3xl">
      {status === 'idle' && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {QUICK_REPLIES.map((reply) => (
            <button
              key={reply}
              type="button"
              onClick={() => onSend(reply)}
              className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-700 hover:border-indigo-300 hover:text-indigo-700 sm:text-sm"
            >
              {reply}
            </button>
          ))}
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          send()
        }}
        className="flex items-end gap-2"
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            // Enter sends, Shift+Enter adds a line (and IME composition is left alone).
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault()
              send()
            }
          }}
          placeholder="Type your answer…"
          aria-label="Your answer"
          rows={1}
          dir="auto"
          className="field-sizing-content max-h-40 min-h-11 flex-1 resize-none rounded-xl border border-slate-300 bg-white px-3 py-2.5 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        />
        {streaming ? (
          <button
            type="button"
            onClick={onStop}
            className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 font-medium text-slate-700 hover:bg-slate-50"
          >
            <StopIcon className="size-4" />
            Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={!canSend}
            className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-indigo-600 px-4 font-medium text-white shadow-sm shadow-indigo-600/20 transition-colors hover:bg-indigo-700 disabled:bg-slate-300 disabled:shadow-none"
          >
            <SendIcon className="size-4" />
            Send
          </button>
        )}
      </form>
    </div>
  )
}
