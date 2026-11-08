import { describe, expect, it } from 'vitest'
import { STRINGS } from '../i18n/strings.js'
import { lessonReport, reportText } from './report.js'

const minute = 60000
const lesson = {
  document: { fileName: 'cells.pdf' },
  plan: {
    title: 'Cells',
    steps: [{ title: 'What is a cell' }, { title: 'Energy' }],
  },
  progress: [
    { attempts: 1, understood: 'yes', startedAt: 0, finishedAt: 3 * minute },
    { attempts: 3, understood: 'no', startedAt: 3 * minute, finishedAt: 7 * minute },
  ],
}

describe('lessonReport', () => {
  it('summarises each step and the total time', () => {
    expect(lessonReport(lesson)).toEqual({
      steps: [
        { title: 'What is a cell', attempts: 1, understood: 'yes', minutes: 3 },
        { title: 'Energy', attempts: 3, understood: 'no', minutes: 4 },
      ],
      totalMinutes: 7,
    })
  })

  it('leaves out times that were not recorded', () => {
    const unfinished = { ...lesson, progress: [lesson.progress[0], { attempts: 0, understood: null, startedAt: null, finishedAt: null }] }
    const report = lessonReport(unfinished)
    expect(report.steps[1]).toMatchObject({ understood: null, minutes: null })
    expect(report.totalMinutes).toBeNull()
  })
})

describe('reportText', () => {
  it('produces a plain-text summary for the teacher', () => {
    expect(reportText(lesson, STRINGS.en)).toBe(
      'Lesson: Cells (7 min)\nFile: cells.pdf\n1. What is a cell: Understood, 1 answer, 3 min\n2. Energy: Not yet, 3 answers, 4 min',
    )
  })

  it('is written in the interface language', () => {
    expect(reportText(lesson, STRINGS.he)).toContain('1. What is a cell: הובן, תשובה אחת, 3 דק׳')
  })
})
