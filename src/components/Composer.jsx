import { useState } from 'react'

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
    <form
      onSubmit={(e) => {
        e.preventDefault()
        send()
      }}
      className="mx-auto flex max-w-3xl items-end gap-2"
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
          className="h-11 shrink-0 rounded-xl border border-slate-300 bg-white px-4 font-medium text-slate-700 hover:bg-slate-50"
        >
          Stop
        </button>
      ) : (
        <button
          type="submit"
          disabled={!canSend}
          className="h-11 shrink-0 rounded-xl bg-indigo-600 px-4 font-medium text-white hover:bg-indigo-700 disabled:bg-slate-300"
        >
          Send
        </button>
      )}
    </form>
  )
}
