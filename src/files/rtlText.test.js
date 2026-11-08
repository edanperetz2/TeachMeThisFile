import { describe, expect, it } from 'vitest'
import { lineText, normalizeArabicForms } from './rtlText.js'

// A pdf.js text item: its text and where it is drawn (x, left to right on the page).
const item = (str, x, width = 0) => ({ str, transform: [1, 0, 0, 1, x, 0], width })

// The pieces below are what pdf.js returned for the test files (test-files/), in drawing order.
describe('lineText for right-to-left lines', () => {
  it('keeps the full stop after an English term at the end of an Arabic sentence', () => {
    const line = [
      item('.', 371),
      item('(', 374),
      item('chloroplasts', 378),
      item(')', 442),
      item(' ', 446),
      item('الخضراء', 449),
      item(' ', 500),
      item('البلاستيدات', 505),
    ]
    expect(lineText(line)).toBe('البلاستيدات الخضراء (chloroplasts).')
  })

  it('keeps a colon with the word before it', () => {
    const line = [item('ثاني', 420), item(' ', 435), item(':', 439), item('بالمعادلة', 442)]
    expect(lineText(line)).toBe('بالمعادلة: ثاني')
  })

  it('keeps an English term in brackets inside a Hebrew sentence', () => {
    const line = [
      item('ומנהל את פעילות התא.', 172),
      item(' ', 274),
      item('(', 277),
      item('DNA', 281),
      item(')', 305),
      item(' ', 308),
      item('גרעין התא מכיל את החומר התורשתי', 311),
    ]
    expect(lineText(line)).toBe('גרעין התא מכיל את החומר התורשתי (DNA) ומנהל את פעילות התא.')
  })

  it('keeps a number in place inside a Hebrew sentence', () => {
    const line = [item('דקות', 100), item(' ', 130), item('15', 134), item(' ', 150), item('בערך', 154)]
    expect(lineText(line)).toBe('בערך 15 דקות')
  })

  it('keeps a vowel mark drawn as its own piece on its letter', () => {
    // "مهمًا": the tanween is a separate piece drawn over the second م.
    const line = [item('ا', 100, 3), item('م', 104, 6), item('ً', 105), item('ه', 111, 5), item('م', 117, 6)]
    expect(lineText(line)).toBe('مهمًا')
  })

  it('leaves a mostly left-to-right line as drawn', () => {
    const line = [item('The nucleus holds ', 10), item('DNA', 120), item(' (חומר תורשתי).', 150)]
    expect(lineText(line)).toBe('The nucleus holds DNA (חומר תורשתי).')
  })
})

describe('normalizeArabicForms', () => {
  it('turns Arabic presentation forms into normal letters', () => {
    expect(normalizeArabicForms('ﺗﺳﻣﻰ')).toBe('تسمى')
  })

  it('leaves everything else alone, including superscripts in formulas', () => {
    expect(normalizeArabicForms('s = ½·a·t² and ﬁne')).toBe('s = ½·a·t² and ﬁne')
  })
})
