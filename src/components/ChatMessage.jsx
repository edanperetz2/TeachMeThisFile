import { useEffect, useState } from 'react'
import { useT } from '../i18n/language.js'
import { BookIcon, LogoMark } from './icons.jsx'
import Markdown from './Markdown.jsx'

export default function ChatMessage({ message, streaming, sourceLabel, onShowSource }) {
  if (message.role === 'student') {
    return (
      <div className="rise-in flex justify-end">
        <p
          dir="auto"
          className="max-w-[85%] rounded-2xl rounded-ee-md bg-indigo-600 px-4 py-2.5 whitespace-pre-wrap text-white shadow-sm [overflow-wrap:anywhere]"
        >
          {message.text}
        </p>
      </div>
    )
  }

  return <TutorMessage message={message} streaming={streaming} sourceLabel={sourceLabel} onShowSource={onShowSource} />
}

function TutorMessage({ message, streaming, sourceLabel, onShowSource }) {
  const t = useT()
  const shown = useRevealedText(message.text, message.stopped)
  const revealing = shown.length < message.text.length

  // Stopped before any text arrived: nothing to show but a quiet note.
  if (!message.text && !streaming) {
    return <p className="ps-11 text-xs text-slate-400 italic">{t.replyStopped}</p>
  }

  return (
    <div className="rise-in flex items-start gap-2.5">
      <LogoMark className="mt-0.5 size-8.5" />
      <div className="max-w-[88%] min-w-0">
        <div className="rounded-2xl rounded-ss-md border border-slate-200 bg-white px-4 py-3 text-slate-800 shadow-sm">
          {shown ? <Markdown>{shown}</Markdown> : <Thinking />}
        </div>

        {!streaming && !revealing && (
          <div className="mt-1.5 flex items-center gap-3 text-xs">
            <button
              type="button"
              onClick={onShowSource}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 font-medium text-slate-600 transition-colors hover:border-indigo-300 hover:text-indigo-700"
            >
              <BookIcon className="size-3.5" />
              {sourceLabel}
            </button>
            {message.stopped && <span className="text-slate-400 italic">{t.stopped}</span>}
          </div>
        )}
      </div>
    </div>
  )
}

// The reply really is streamed, but the fast model often sends a whole reply in a few big
// chunks within a fraction of a second, so it would pop in all at once. This shows the text
// received so far at a steady reading pace instead (never waiting for anything: it only
// catches up). Messages already in the chat when it opens (a reloaded lesson) show at once,
// and so does everything after Stop or with "reduce motion" turned on.
function useRevealedText(text, stopped) {
  const [length, setLength] = useState(() => (text ? Infinity : 0))
  const target = stopped || prefersReducedMotion() ? Infinity : text.length

  useEffect(() => {
    if (length >= target) return
    const frame = requestAnimationFrame(() =>
      // A bigger step when far behind, so a long reply never lags more than ~2 seconds.
      setLength((n) => Math.min(text.length, n + Math.max(2, Math.ceil((text.length - n) / 40)))),
    )
    return () => cancelAnimationFrame(frame)
  }, [length, target, text.length])

  return text.slice(0, Math.min(length, target))
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function Thinking() {
  const t = useT()
  return (
    <div className="flex items-center gap-2 py-0.5 text-sm text-slate-500" role="status">
      <span className="flex gap-1">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="size-1.5 animate-bounce rounded-full bg-indigo-400"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </span>
      {t.thinking}
    </div>
  )
}
