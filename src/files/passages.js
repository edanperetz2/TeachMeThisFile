// Splits extracted text into numbered, roughly paragraph-sized passages.
// Passages are the unit the lesson plan points at and the "Source" the student sees.

const MIN_CHARS = 150 // smaller pieces get merged into a neighbour
const TARGET_CHARS = 800 // merge pieces until a passage is about this long
const MAX_CHARS = 1600 // longer blocks are split

// pages: [{ page, text }] → passages: [{ id: 'p1', page, text }]
// Passages never cross a page boundary, so each one keeps its page number.
export function splitIntoPassages(pages) {
  const passages = []
  for (const { page, text } of pages) {
    for (const passageText of splitPage(text)) {
      passages.push({ id: `p${passages.length + 1}`, page, text: passageText })
    }
  }
  return passages
}

function splitPage(text) {
  const blocks = normalize(text).split(/\n{2,}/).filter(Boolean)
  const pieces = blocks.flatMap((block) =>
    block.length <= MAX_CHARS ? [block] : mergeSmall(splitLongBlock(block), '\n'),
  )
  return mergeSmall(pieces, '\n\n')
}

function normalize(text) {
  return text
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t ]+/g, ' ')
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// Long block → lines → sentences → fixed-size chunks, each step only where still too long.
function splitLongBlock(block) {
  return block
    .split('\n')
    .flatMap((line) => (line.length <= MAX_CHARS ? [line] : line.split(/(?<=[.!?。؟])\s+/)))
    .flatMap((piece) => (piece.length <= MAX_CHARS ? [piece] : chunk(piece, MAX_CHARS)))
}

function chunk(text, size) {
  const chunks = []
  for (let i = 0; i < text.length; i += size) chunks.push(text.slice(i, i + size))
  return chunks
}

function mergeSmall(pieces, separator) {
  const merged = []
  for (const piece of pieces) {
    const last = merged.at(-1)
    const combined = last === undefined ? Infinity : last.length + separator.length + piece.length
    const eitherTiny = last !== undefined && (last.length < MIN_CHARS || piece.length < MIN_CHARS)
    if (combined <= TARGET_CHARS || (eitherTiny && combined <= MAX_CHARS)) {
      merged[merged.length - 1] = last + separator + piece
    } else {
      merged.push(piece)
    }
  }
  return merged
}
