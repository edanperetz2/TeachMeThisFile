import { AppError } from '../errors.js'
import { imageFileToJpeg } from './images.js'
import { splitIntoPassages } from './passages.js'

// Below this much real text we say the file has nothing to teach.
const MIN_TEXT_CHARS = 20

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp']

// File → { fileName, passages, skippedPages }. Text is read in the browser, so the file
// itself is never uploaded. Pages that are images (scans, photos) are handed to
// readScannedPages, which returns { pages: [{ page, text }], skippedPages }.
export async function readDocument(file, readScannedPages) {
  const pages = await readPages(file)
  const scanned = pages.filter((p) => p.image)
  const ocr = scanned.length > 0 ? await readScannedPages(scanned) : { pages: [], skippedPages: [] }
  const textPages = pages.flatMap((p) => (p.image ? ocr.pages.filter((o) => o.page === p.page) : [p]))
  const text = textPages.map((p) => p.text).join('\n')

  if (looksBinary(text)) {
    throw new AppError('UNREADABLE', "This file doesn't look like readable text. Try a PDF, Word or text file.")
  }
  if (text.replace(/\s/g, '').length < MIN_TEXT_CHARS) {
    throw new AppError('NO_TEXT', "We couldn't find any text in this file.")
  }

  return {
    fileName: file.name,
    passages: splitIntoPassages(textPages),
    skippedPages: ocr.skippedPages,
  }
}

// → [{ page, text }] or [{ page, image }]. page is null for files without pages.
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
  if (IMAGE_EXTENSIONS.includes(extension)) {
    return [{ page: null, image: await readImage(file) }]
  }
  return [{ page: null, text: await file.text() }]
}

async function readImage(file) {
  try {
    return await imageFileToJpeg(file)
  } catch {
    throw new AppError('UNREADABLE', "We couldn't open this image. Try a JPG or PNG file.")
  }
}

// A renamed binary file decodes to lots of replacement and control characters.
function looksBinary(text) {
  const bad = text.match(/[�\u0000-\u0008\u000E-\u001F]/g)?.length ?? 0
  return bad > text.length * 0.1
}
