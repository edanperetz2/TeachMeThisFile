// Text files are usually UTF-8, but older Hebrew and Arabic files are often saved in the
// Windows encodings (1255 / 1256). bytes: ArrayBuffer or Uint8Array → the file's text.
const LEGACY_ENCODINGS = [
  { encoding: 'windows-1255', letters: /[\u05D0-\u05EA]/g }, // Hebrew
  { encoding: 'windows-1256', letters: /[\u0621-\u064A]/g }, // Arabic
]

export function decodeText(bytes) {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    // Not valid UTF-8: try the legacy encodings below.
  }
  // Every byte decodes to *something* in these encodings, so we take the one that gives the
  // most letters of its own script, and only if they make up at least a fifth of the text.
  const best = LEGACY_ENCODINGS.map(({ encoding, letters }) => {
    const text = new TextDecoder(encoding).decode(bytes)
    return { text, count: text.match(letters)?.length ?? 0, visible: text.replace(/\s/g, '').length }
  }).sort((a, b) => b.count - a.count)[0]
  if (best.count > 0 && best.count >= best.visible / 5) return best.text
  // Neither: keep the UTF-8 reading, so a binary file still shows up as unreadable.
  return new TextDecoder('utf-8').decode(bytes)
}
