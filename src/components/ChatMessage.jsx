import { BookIcon, LogoMark } from './icons.jsx'
import Markdown from './Markdown.jsx'

export default function ChatMessage({ message, streaming, sourceLabel, onShowSource }) {
  if (message.role === 'student') {
    return (
      <div className="rise-in flex justify-end">
        <p
          dir="auto"
          className="max-w-[85%] rounded-2xl rounded-br-md bg-indigo-600 px-4 py-2.5 whitespace-pre-wrap text-white shadow-sm [overflow-wrap:anywhere]"
        >
          {message.text}
        </p>
      </div>
    )
  }

  // Stopped before any text arrived: nothing to show but a quiet note.
  if (!message.text && !streaming) {
    return <p className="pl-11 text-xs text-slate-400 italic">Reply stopped</p>
  }

  return (
    <div className="rise-in flex items-start gap-2.5">
      <LogoMark className="mt-0.5 size-8.5" />
      <div className="max-w-[88%] min-w-0">
        <div className="rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3 text-slate-800 shadow-sm">
          {message.text ? <Markdown>{message.text}</Markdown> : <Thinking />}
        </div>

        {!streaming && (
          <div className="mt-1.5 flex items-center gap-3 text-xs">
            <button
              type="button"
              onClick={onShowSource}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 font-medium text-slate-600 transition-colors hover:border-indigo-300 hover:text-indigo-700"
            >
              <BookIcon className="size-3.5" />
              {sourceLabel}
            </button>
            {message.stopped && <span className="text-slate-400 italic">Stopped</span>}
          </div>
        )}
      </div>
    </div>
  )
}

function Thinking() {
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
      Tutor is thinking…
    </div>
  )
}
