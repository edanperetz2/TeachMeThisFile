import { useState } from 'react'
import { lessonReport, reportText } from '../lesson/report.js'

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
    <section className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
      <div className="text-center">
        <p className="font-semibold text-indigo-900">Lesson complete</p>
        <p className="mt-1 text-sm text-indigo-800">
          All {steps.length} steps done{totalMinutes === null ? '' : ` in about ${totalMinutes} min`}. Nice work!
        </p>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl bg-white">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-slate-500">
            <tr>
              <th className="px-3 py-2 font-medium">Step</th>
              <th className="px-3 py-2 font-medium">Understanding</th>
              <th className="px-3 py-2 text-right font-medium">Answers</th>
              <th className="px-3 py-2 text-right font-medium">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {steps.map((s, i) => (
              <tr key={i}>
                <td className="px-3 py-2" dir="auto">
                  {s.title}
                </td>
                <td className="px-3 py-2">{s.understood}</td>
                <td className="px-3 py-2 text-right">{s.attempts}</td>
                <td className="px-3 py-2 text-right whitespace-nowrap">{s.minutes === null ? '—' : `${s.minutes} min`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={copySummary}
          className="rounded-xl border border-indigo-300 bg-white px-4 py-2.5 font-medium text-indigo-700 hover:bg-indigo-100"
        >
          {copied ? 'Copied' : 'Copy summary'}
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
