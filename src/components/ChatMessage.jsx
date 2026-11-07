import Markdown from './Markdown.jsx'

export default function ChatMessage({ message, streaming, onShowSource }) {
  if (message.role === 'student') {
    return (
      <div className="flex justify-end">
        <p
          dir="auto"
          className="max-w-[85%] rounded-2xl rounded-br-md bg-indigo-600 px-4 py-2.5 whitespace-pre-wrap text-white [overflow-wrap:anywhere]"
        >
          {message.text}
        </p>
      </div>
    )
  }

  // Stopped before any text arrived: nothing to show but a quiet note.
  if (!message.text && !streaming) {
    return <p className="px-1 text-xs text-slate-400 italic">Reply stopped</p>
  }

  return (
    <div className="max-w-[92%]">
      <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-slate-800 shadow-sm">
        {message.text ? <Markdown>{message.text}</Markdown> : <TypingDots />}
      </div>

      {!streaming && (
        <div className="mt-1.5 flex items-center gap-3 px-1 text-xs">
          <button
            type="button"
            onClick={onShowSource}
            className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 font-medium text-slate-600 hover:border-indigo-300 hover:text-indigo-700"
          >
            Source
          </button>
          {message.stopped && <span className="text-slate-400 italic">Stopped</span>}
        </div>
      )}
    </div>
  )
}

function TypingDots() {
  return (
    <div className="flex gap-1 py-1.5" role="status" aria-label="The tutor is typing">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="size-2 animate-bounce rounded-full bg-slate-400"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  )
}
