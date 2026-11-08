import { useState } from 'react'
import { lessonReport, reportText } from '../lesson/report.js'
import { CheckIcon, CopyIcon, TrophyIcon } from './icons.jsx'

const BADGE_COLORS = {
  Understood: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Partly: 'bg-amber-50 text-amber-700 ring-amber-200',
  'Not yet': 'bg-rose-50 text-rose-700 ring-rose-200',
}

// Shown when the lesson is complete: how each step went, for the teacher.
export default function LessonReport({ lesson, onNewLesson }) {
  const [copied, setCopied] = useState(false)
  const { steps, totalMinutes } = lessonReport(lesson)

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(reportText(lesson))
      setCopied(true)
    } catch {
      setCopied(false) // clipboard blocked: the table is still on screen
    }
  }

  return (
    <section className="rise-in rounded-2xl border border-indigo-200 bg-gradient-to-b from-indigo-50 to-white p-5">
      <div className="text-center">
        <span className="mx-auto mb-2 grid size-12 place-items-center rounded-full bg-amber-100 text-amber-600">
          <TrophyIcon className="size-6" />
        </span>
        <p className="text-lg font-semibold text-indigo-900">Lesson complete</p>
        <p className="mt-1 text-sm text-indigo-800">
          All {steps.length} steps done{totalMinutes === null ? '' : ` in about ${totalMinutes} min`}. Nice work!
        </p>
      </div>

      <ol className="mt-4 divide-y divide-slate-100 rounded-xl bg-white ring-1 ring-slate-200">
        {steps.map((s, i) => (
          <li key={i} className="flex items-start justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800" dir="auto">
                {i + 1}. {s.title}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {s.attempts} {s.attempts === 1 ? 'answer' : 'answers'}
                {s.minutes === null ? '' : ` · ${s.minutes} min`}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${BADGE_COLORS[s.understood] ?? 'text-slate-500 ring-slate-200'}`}
            >
              {s.understood}
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={copySummary}
          className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-300 bg-white px-4 py-2.5 font-medium text-indigo-700 hover:bg-indigo-100"
        >
          {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
          {copied ? 'Copied' : 'Copy summary for the teacher'}
        </button>
        <button
          type="button"
          onClick={onNewLesson}
          className="rounded-xl bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-700"
        >
          Start a new lesson
        </button>
      </div>
    </section>
  )
}
