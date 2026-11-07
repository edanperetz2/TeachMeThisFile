import { postToApi } from './api.js'

// Two pages per request keeps each request ~1 MB and halves the number of calls
// (the free tier allows 15 a minute). Requests run one after another.
const PAGES_PER_REQUEST = 2
// More scanned pages than this would take minutes and much of a free daily quota.
const MAX_SCANNED_PAGES = 30
// These won't get better by moving on to the next pages, so they stop the whole read.
const FATAL_CODES = new Set(['INVALID_KEY', 'QUOTA_EXCEEDED'])

// scanned: [{ page, image }] → { pages: [{ page, text }], skippedPages }.
// A batch that still fails after the usual retries is skipped, and the lesson goes on.
export async function readScannedPages(scanned, { apiKey, onProgress }) {
  const toRead = scanned.slice(0, MAX_SCANNED_PAGES)
  const pages = []
  const skippedPages = scanned.slice(MAX_SCANNED_PAGES).map((p) => p.page)

  for (let start = 0; start < toRead.length; start += PAGES_PER_REQUEST) {
    onProgress({ done: start, total: toRead.length })
    const batch = toRead.slice(start, start + PAGES_PER_REQUEST)
    try {
      const response = await postToApi(
        '/api/extract',
        { images: batch.map((p, i) => ({ id: String(i), data: p.image })) },
        { apiKey },
      )
      const { pages: texts } = await response.json()
      batch.forEach((p, i) => pages.push({ page: p.page, text: texts[i].text }))
    } catch (error) {
      if (FATAL_CODES.has(error.code)) throw error
      skippedPages.push(...batch.map((p) => p.page))
    }
  }
  return { pages, skippedPages }
}
