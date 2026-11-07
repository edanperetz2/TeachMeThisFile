import { AppError } from '../errors.js'
import { splitIntoPassages } from './passages.js'

// Below this much real text we say the file has nothing to teach.
const MIN_TEXT_CHARS = 20

// File → { fileName, passages, skippedPages }. Runs entirely in the browser,
// so the file itself is never uploaded; only its text is sent later.
export async function readDocument(file) {
  const pages = await readPages(file)
  const usable = pages.filter((p) => !p.scanned)
  const text = usable.map((p) => p.text).join('\n')

  if (looksBinary(text)) {
    throw new AppError('UNREADABLE', "This file doesn't look like readable text. Try a PDF, Word or text file.")
  }
  if (text.replace(/\s/g, '').length < MIN_TEXT_CHARS) {
    throw new AppError('NO_TEXT', "We couldn't find any text in this file.")
  }

  return {
    fileName: file.name,
    passages: splitIntoPassages(usable),
    skippedPages: pages.filter((p) => p.scanned).map((p) => p.page),
  }
}

// The PDF and Word readers are large, so each is loaded only when such a file is picked.
async function readPages(file) {
  const extension = file.name.toLowerCase().split('.').pop()
  if (extension === 'pdf') {
    const { readPdfPages } = await import('./readPdf.js')
    return readPdfPages(file)
  }
  if (extension === 'docx') {
    const { readDocxText } = await import('./readDocx.js')
    return [{ page: null, text: await readDocxText(file) }]
  }
  if (extension === 'txt' || extension === 'md') return [{ page: null, text: await file.text() }]
  throw new AppError('UNSUPPORTED', 'Images are not supported yet.')
}

// A renamed binary file decodes to lots of replacement and control characters.
function looksBinary(text) {
  const bad = text.match(/[�\u0000-\u0008\u000E-\u001F]/g)?.length ?? 0
  return bad > text.length * 0.1
}
