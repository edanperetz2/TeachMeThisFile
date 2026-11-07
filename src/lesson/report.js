// The end-of-lesson report for the teacher, built only from the lesson state.

const UNDERSTOOD_LABELS = { yes: 'Understood', partial: 'Partly', no: 'Not yet' }

export function lessonReport(lesson) {
  const steps = lesson.plan.steps.map((step, i) => {
    const p = lesson.progress[i]
    return {
      title: step.title,
      attempts: p.attempts,
      understood: UNDERSTOOD_LABELS[p.understood] ?? '—',
      minutes: p.startedAt != null && p.finishedAt != null ? minutesBetween(p.startedAt, p.finishedAt) : null,
    }
  })
  const first = lesson.progress[0]?.startedAt
  const last = lesson.progress.at(-1)?.finishedAt
  return { steps, totalMinutes: first != null && last != null ? minutesBetween(first, last) : null }
}

// Plain text the teacher can paste anywhere (email, LMS, notes).
export function reportText(lesson) {
  const { steps, totalMinutes } = lessonReport(lesson)
  const lines = steps.map(
    (s, i) =>
      `${i + 1}. ${s.title}: ${s.understood}, ${s.attempts} answer(s)${s.minutes === null ? '' : `, ${s.minutes} min`}`,
  )
  const total = totalMinutes === null ? '' : ` (${totalMinutes} min)`
  return [`Lesson: ${lesson.plan.title}${total}`, `File: ${lesson.document.fileName}`, ...lines].join('\n')
}

function minutesBetween(start, end) {
  return Math.max(1, Math.round((end - start) / 60000))
}
