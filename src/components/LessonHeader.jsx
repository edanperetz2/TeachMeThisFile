import { useState } from 'react'
import { LogoMark } from './icons.jsx'

const SEGMENT_COLORS = {
  done: 'bg-indigo-600',
  active: 'bg-indigo-300',
  pending: 'bg-slate-200',
}

const STEP_MARKERS = {
  done: { symbol: '✓', className: 'bg-indigo-600 text-white' },
  active: { symbol: '•', className: 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-400' },
  pending: { symbol: '', className: 'bg-slate-100 text-slate-400' },
}

export default function LessonHeader({ plan, progress, currentStepIndex, finished, onNewLesson }) {
  const [showPlan, setShowPlan] = useState(false)
  const step = plan.steps[currentStepIndex]

  return (
    <header className="border-b border-slate-200 bg-white px-4 py-3">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-3">
          <LogoMark className="hidden size-9 sm:grid" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium tracking-wide text-indigo-600 uppercase">
              {finished ? 'Lesson complete' : `Step ${currentStepIndex + 1} of ${plan.steps.length}`}
            </p>
            <h1 className="truncate font-semibold text-slate-900" dir="auto">
              {finished ? plan.title : step.title}
            </h1>
          </div>
          <button
            type="button"
            onClick={onNewLesson}
            className="shrink-0 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            New lesson
          </button>
        </div>

        {/* The progress bar doubles as the button that shows the lesson plan. */}
        <button
          type="button"
          onClick={() => setShowPlan(!showPlan)}
          aria-expanded={showPlan}
          aria-controls="lesson-plan"
          className="group mt-3 flex w-full items-center gap-2"
        >
          <span className="flex flex-1 gap-1">
            {plan.steps.map((s, i) => (
              <span
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${SEGMENT_COLORS[progress[i].status]}`}
              />
            ))}
          </span>
          <span className="shrink-0 text-xs font-medium text-slate-500 group-hover:text-slate-900">
            {showPlan ? 'Hide plan' : 'Plan'}
          </span>
        </button>

        {showPlan && (
          <ol id="lesson-plan" className="mt-3 space-y-2 border-t border-slate-100 pt-3">
            {plan.steps.map((s, i) => {
              const marker = STEP_MARKERS[progress[i].status]
              return (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span
                    className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-xs font-semibold ${marker.className}`}
                    aria-label={progress[i].status}
                  >
                    {marker.symbol}
                  </span>
                  <span dir="auto" className={progress[i].status === 'pending' ? 'text-slate-500' : 'text-slate-900'}>
                    {s.title}
                  </span>
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </header>
  )
}
