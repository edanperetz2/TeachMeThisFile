import * as pdfjs from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { AppError } from '../errors.js'
import { canvasToJpeg, MAX_IMAGE_SIDE } from './images.js'

// Vite bundles the worker as its own file and gives us its URL (works in dev and in the build).
pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

// A page with less text than this, that also contains an image, is treated as scanned.
const SCANNED_PAGE_CHARS = 30

const IMAGE_OPS = new Set([
  pdfjs.OPS.paintImageXObject,
  pdfjs.OPS.paintInlineImageXObject,
  pdfjs.OPS.paintImageMaskXObject,
])

const RTL_CHARS = /[֐-ࣿיִ-﷿ﹰ-﻿]/g
const LTR_CHARS = /[A-Za-zÀ-ɏͰ-ϿЀ-ӿ]/g

// → [{ page, text }] from the PDF's own text layer, or [{ page, image }] (a base64
// JPEG to be read by the AI) for scanned pages that have no usable text layer.
export async function readPdfPages(file) {
  const pdf = await openPdf(file)
  const pages = []
  for (let page = 1; page <= pdf.numPages; page++) {
    const pdfPage = await pdf.getPage(page)
    const text = await pageText(pdfPage)
    const scanned = text.replace(/\s/g, '').length < SCANNED_PAGE_CHARS && (await hasImage(pdfPage))
    pages.push(scanned ? { page, image: await renderPage(pdfPage) } : { page, text })
  }
  return pages
}

async function renderPage(page) {
  const { width, height } = page.getViewport({ scale: 1 })
  const viewport = page.getViewport({ scale: MAX_IMAGE_SIDE / Math.max(width, height) })
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(viewport.width)
  canvas.height = Math.round(viewport.height)
  await page.render({ canvas, viewport }).promise
  return canvasToJpeg(canvas)
}

async function openPdf(file) {
  try {
    return await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise
  } catch (error) {
    if (error.name === 'PasswordException') {
      throw new AppError('UNREADABLE', 'This PDF is password-protected. Remove the password and try again.')
    }
    throw new AppError('UNREADABLE', "We couldn't open this PDF. It may be damaged.")
  }
}

// Text items come in drawing order. We group them into lines and, for lines that are
// mostly Hebrew/Arabic, put the pieces in right-to-left order so mixed lines read correctly.
async function pageText(page) {
  const { items } = await page.getTextContent()
  const lines = [[]]
  for (const item of items) {
    lines.at(-1).push(item)
    if (item.hasEOL) lines.push([])
  }
  return lines.map(lineText).join('\n')
}

function lineText(items) {
  const text = items.map((item) => item.str).join('')
  const rtl = text.match(RTL_CHARS)?.length ?? 0
  const ltr = text.match(LTR_CHARS)?.length ?? 0
  if (rtl <= ltr) return text

  // Sort pieces left to right as drawn, group neighbours of the same direction into runs,
  // then read the runs right to left. An English run like "(", "DNA", ")" keeps its own order.
  const x = (item) => item.transform[4]
  const runs = []
  for (const item of [...items].sort((a, b) => x(a) - x(b))) {
    const isRtl = item.dir === 'rtl'
    if (runs.at(-1)?.isRtl === isRtl) runs.at(-1).items.push(item)
    else runs.push({ isRtl, items: [item] })
  }
  return runs
    .reverse()
    .map((run) => (run.isRtl ? run.items.reverse() : run.items).map((item) => item.str).join(''))
    .join('')
}

async function hasImage(page) {
  const { fnArray } = await page.getOperatorList()
  return fnArray.some((op) => IMAGE_OPS.has(op))
}
