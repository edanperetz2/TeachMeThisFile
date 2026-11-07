import { describe, expect, it } from 'vitest'
import { fitToBudget } from './plan.js'

const passages = [
  { id: 'p1', page: 1, text: 'a'.repeat(60) },
  { id: 'p2', page: 2, text: 'b'.repeat(60) },
]

describe('fitToBudget', () => {
  it('sends everything when the document fits', () => {
    expect(fitToBudget(passages, 1000)).toBe(passages)
  })

  it('gives every passage an equal share when it does not fit', () => {
    const trimmed = fitToBudget(passages, 50)
    expect(trimmed.map((p) => [p.id, p.page, p.text.length])).toEqual([
      ['p1', 1, 25],
      ['p2', 2, 25],
    ])
  })
})
