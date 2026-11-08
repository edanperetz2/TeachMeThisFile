import { useEffect, useRef } from 'react'
import { BookIcon } from './icons.jsx'
import Markdown from './Markdown.jsx'

// The passages behind a tutor message: a bottom sheet on phones, a side drawer on wider screens.
export default function SourcePanel({ passages, onClose }) {
  const closeButton = useRef(null)

  useEffect(() => {
    closeButton.current.focus()
    const closeOnEscape = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-20">
      <div className="absolute inset-0 bg-slate-900/30" onClick={onClose} aria-hidden="true" />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="source-title"
        className="rise-in absolute inset-x-0 bottom-0 flex max-h-[75dvh] flex-col rounded-t-2xl bg-white shadow-xl sm:inset-y-0 sm:right-0 sm:left-auto sm:max-h-none sm:w-[26rem] sm:rounded-none"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 id="source-title" className="flex items-center gap-2 font-semibold text-slate-900">
            <BookIcon className="size-5 text-indigo-600" />
            From your file
          </h2>
          <button
            ref={closeButton}
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            Close
          </button>
        </div>
        <div className="space-y-4 overflow-y-auto p-4">
          {passages.map((passage) => (
            <article key={passage.id} className="rounded-xl bg-slate-50 p-4 text-sm whitespace-pre-line text-slate-700">
              <p className="mb-2 text-xs font-medium text-slate-500">
                {passage.page ? `Page ${passage.page}` : 'Passage'} · {passage.id}
              </p>
              <Markdown>{passage.text}</Markdown>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
