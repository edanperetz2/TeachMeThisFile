// Turning a PDF text line back into reading order when it is mostly Hebrew/Arabic.
// pdf.js gives a line as pieces in drawing order (left to right on the page). Each piece
// is right-to-left text, left-to-right text, or neutral (a space, punctuation, a bracket).

const RTL_CHARS = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/g
const LTR_CHARS = /[A-Za-z\u00C0-\u024F\u0370-\u03FF\u0400-\u04FF]/g

// items: pdf.js text items of one line ({ str, transform }) → the line's text.
export function lineText(items) {
  const text = items.map((item) => item.str).join('')
  const rtl = text.match(RTL_CHARS)?.length ?? 0
  const ltr = text.match(LTR_CHARS)?.length ?? 0
  if (rtl <= ltr) return text

  const x = (item) => item.transform[4]
  const pieces = attachMarks(items.filter((item) => item.str)).sort((a, b) => x(a) - x(b))
  const strong = pieces.map((item) => strongDirection(item.str))
  // As in the Unicode bidi rules: a neutral piece goes with left-to-right text only when the
  // letters on both sides of it are left-to-right; otherwise it belongs to the right-to-left line.
  const directions = strong.map(
    (dir, i) => dir ?? (nearest(strong, i, -1) === 'ltr' && nearest(strong, i, 1) === 'ltr' ? 'ltr' : 'rtl'),
  )

  // Group neighbours of the same direction into runs and read the runs right to left;
  // a left-to-right run like "(", "DNA", ")" keeps its own order.
  const runs = []
  pieces.forEach((item, i) => {
    const isRtl = directions[i] === 'rtl'
    // A neutral piece in right-to-left text is stored as drawn, so its brackets are mirrored.
    const piece = isRtl && !strong[i] ? mirrorBrackets(item.str) : item.str
    if (runs.at(-1)?.isRtl === isRtl) runs.at(-1).pieces.push(piece)
    else runs.push({ isRtl, pieces: [piece] })
  })
  return runs
    .reverse()
    .map((run) => (run.isRtl ? run.pieces.reverse() : run.pieces).join(''))
    .join('')
}

// Vowel marks (Arabic tanween, Hebrew niqqud) sometimes come as pieces of their own, drawn on
// top of their letter. Sorting by position could put them on the wrong side of it, so each one
// is glued to the letter piece it is drawn over (or the closest one).
function attachMarks(items) {
  const isMark = (item) => /^\p{M}+$/u.test(item.str)
  const letters = items.filter((item) => !isMark(item)).map((item) => ({ ...item }))
  const candidates = letters.filter((item) => strongDirection(item.str))
  for (const mark of items.filter(isMark)) {
    const markX = mark.transform[4]
    const distance = (item) => {
      const start = item.transform[4]
      const end = start + (item.width ?? 0)
      return markX < start ? start - markX : markX > end ? markX - end : 0
    }
    const base = candidates.reduce((best, item) => (best && distance(best) <= distance(item) ? best : item), null)
    if (base) base.str += mark.str
  }
  return letters
}

// 'rtl' or 'ltr' for text with letters (digits count as left-to-right), null for neutral text.
function strongDirection(text) {
  if (text.search(RTL_CHARS) >= 0) return 'rtl'
  if (text.search(LTR_CHARS) >= 0 || /[0-9]/.test(text)) return 'ltr'
  return null
}

// The closest non-neutral direction before (step -1) or after (step 1) position i.
function nearest(strong, i, step) {
  for (let j = i + step; j >= 0 && j < strong.length; j += step) {
    if (strong[j]) return strong[j]
  }
  return null
}

function mirrorBrackets(text) {
  const pairs = { '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{' }
  return text.replace(/[()[\]{}]/g, (bracket) => pairs[bracket])
}

// Some PDFs store Arabic as its drawn letter shapes ("presentation forms", e.g. ﺗﺳﻣﻰ)
// instead of normal letters (تسمى). They look the same but read badly for the AI, so
// those characters (and only those: NFKC on everything would turn t² into t2) are mapped back.
export function normalizeArabicForms(text) {
  return text.replace(/[\uFB50-\uFDFF\uFE70-\uFEFE]/g, (char) => char.normalize('NFKC'))
}
