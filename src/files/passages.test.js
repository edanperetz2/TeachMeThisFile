import { describe, expect, it } from 'vitest'
import { splitIntoPassages } from './passages.js'

const sentence = (n) => `This is sentence number ${n} about photosynthesis in plants. `
const paragraph = (sentences) => Array.from({ length: sentences }, (_, i) => sentence(i)).join('').trim()

describe('splitIntoPassages', () => {
  it('numbers passages p1, p2, … across pages and keeps page numbers', () => {
    const passages = splitIntoPassages([
      { page: 1, text: paragraph(3) },
      { page: 2, text: paragraph(3) },
    ])
    expect(passages.map((p) => [p.id, p.page])).toEqual([
      ['p1', 1],
      ['p2', 2],
    ])
  })

  it('never merges text from different pages', () => {
    const passages = splitIntoPassages([
      { page: 1, text: 'Short page one.' },
      { page: 2, text: 'Short page two.' },
    ])
    expect(passages).toHaveLength(2)
  })

  it('merges tiny paragraphs into one passage', () => {
    const passages = splitIntoPassages([{ page: null, text: 'Title\n\nA short line.\n\nAnother short line.' }])
    expect(passages).toHaveLength(1)
    expect(passages[0].text).toBe('Title\n\nA short line.\n\nAnother short line.')
  })

  it('keeps paragraph-sized blocks apart', () => {
    const text = [paragraph(10), paragraph(10), paragraph(10)].join('\n\n')
    const passages = splitIntoPassages([{ page: 1, text }])
    expect(passages).toHaveLength(3)
  })

  it('splits a huge block with no line breaks into passages under the size limit', () => {
    const passages = splitIntoPassages([{ page: 1, text: paragraph(200) }])
    expect(passages.length).toBeGreaterThan(5)
    for (const p of passages) expect(p.text.length).toBeLessThanOrEqual(1600)
    // No text is lost (only whitespace between sentences may change).
    expect(passages.map((p) => p.text).join(' ').replace(/\s+/g, ' ')).toBe(paragraph(200))
  })

  it('splits a long PDF page (single line breaks only) at line boundaries', () => {
    const lines = Array.from({ length: 60 }, (_, i) => `Line ${i} of the scanned-free text layer here.`)
    const passages = splitIntoPassages([{ page: 3, text: lines.join('\n') }])
    expect(passages.length).toBeGreaterThan(1)
    expect(passages.every((p) => p.text.startsWith('Line'))).toBe(true)
  })

  it('cleans up whitespace and Windows line endings', () => {
    const passages = splitIntoPassages([{ page: null, text: '  Hello   world \r\n\r\n\r\n\r\n  Bye  ' }])
    expect(passages[0].text).toBe('Hello world\n\nBye')
  })

  it('keeps right-to-left text intact', () => {
    const hebrew = 'התא הוא יחידת החיים הבסיסית.\n\nלכל תא יש קרום.'
    expect(splitIntoPassages([{ page: 1, text: hebrew }])[0].text).toBe(hebrew)
  })

  it('returns no passages for empty text', () => {
    expect(splitIntoPassages([{ page: 1, text: ' \n\n ' }])).toEqual([])
  })
})
