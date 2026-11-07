const SEGMENT_COLORS = {
  done: 'bg-indigo-600',
  active: 'bg-indigo-300',
  pending: 'bg-slate-200',
}

export default function LessonHeader({ plan, progress, currentStepIndex, finished, onNewLesson }) {
  const step = plan.steps[currentStepIndex]

  return (
    <header className="border-b border-slate-200 bg-white px-4 py-3">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
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

        <ol className="mt-3 flex gap-1" aria-label="Lesson progress">
          {plan.steps.map((s, i) => (
            <li
              key={i}
              title={`${i + 1}. ${s.title}`}
              className={`h-1.5 flex-1 rounded-full transition-colors ${SEGMENT_COLORS[progress[i].status]}`}
            >
              <span className="sr-only">
                Step {i + 1}: {s.title} ({progress[i].status})
              </span>
            </li>
          ))}
        </ol>
      </div>
    </header>
  )
}
