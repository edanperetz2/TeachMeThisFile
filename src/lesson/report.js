// The end-of-lesson report for the teacher, built only from the lesson state.

// → { steps: [{ title, attempts, understood: 'yes' | 'partial' | 'no' | null, minutes }], totalMinutes }
export function lessonReport(lesson) {
  const steps = lesson.plan.steps.map((step, i) => {
    const p = lesson.progress[i]
    return {
      title: step.title,
      attempts: p.attempts,
      understood: p.understood,
      minutes: p.startedAt != null && p.finishedAt != null ? minutesBetween(p.startedAt, p.finishedAt) : null,
    }
  })
  const first = lesson.progress[0]?.startedAt
  const last = lesson.progress.at(-1)?.finishedAt
  return { steps, totalMinutes: first != null && last != null ? minutesBetween(first, last) : null }
}

// Plain text the teacher can paste anywhere (email, LMS, notes), in the interface language t.
export function reportText(lesson, t) {
  const { steps, totalMinutes } = lessonReport(lesson)
  const lines = steps.map((s, i) => {
    const details = [t.understood[s.understood] ?? '—', t.answers(s.attempts)]
    if (s.minutes !== null) details.push(t.minutes(s.minutes))
    return `${i + 1}. ${s.title}: ${details.join(', ')}`
  })
  const total = totalMinutes === null ? '' : ` (${t.minutes(totalMinutes)})`
  return [`${t.summaryLesson}: ${lesson.plan.title}${total}`, `${t.summaryFile}: ${lesson.document.fileName}`, ...lines].join(
    '\n',
  )
}

function minutesBetween(start, end) {
  return Math.max(1, Math.round((end - start) / 60000))
}
