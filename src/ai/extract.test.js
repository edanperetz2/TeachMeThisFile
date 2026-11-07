import { afterEach, describe, expect, it, vi } from 'vitest'
import { readScannedPages } from './extract.js'

const scanned = [1, 2, 3, 4, 5].map((page) => ({ page, image: `img${page}` }))

const ok = (count) =>
  new Response(JSON.stringify({ pages: Array.from({ length: count }, (_, i) => ({ id: String(i), text: `text ${i}` })) }))
const fail = (code, status) => new Response(JSON.stringify({ error: { code, message: code } }), { status })

afterEach(() => vi.unstubAllGlobals())

describe('readScannedPages', () => {
  it('reads pages two at a time, in order, and reports progress', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(ok(2)).mockResolvedValueOnce(ok(2)).mockResolvedValueOnce(ok(1))
    vi.stubGlobal('fetch', fetch)
    const progress = []
    const result = await readScannedPages(scanned, { apiKey: 'k', onProgress: (p) => progress.push(p.done) })
    expect(fetch).toHaveBeenCalledTimes(3)
    expect(result.pages.map((p) => p.page)).toEqual([1, 2, 3, 4, 5])
    expect(result.skippedPages).toEqual([])
    expect(progress).toEqual([0, 2, 4])
  })

  it('skips a batch that fails and carries on', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(ok(2))
      .mockResolvedValueOnce(fail('UPSTREAM', 500))
      .mockResolvedValueOnce(ok(1))
    vi.stubGlobal('fetch', fetch)
    const result = await readScannedPages(scanned, { apiKey: 'k', onProgress: () => {} })
    expect(result.pages.map((p) => p.page)).toEqual([1, 2, 5])
    expect(result.skippedPages).toEqual([3, 4])
  })

  it('stops everything when the key is wrong', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fail('INVALID_KEY', 401)))
    await expect(readScannedPages(scanned, { apiKey: 'k', onProgress: () => {} })).rejects.toMatchObject({
      code: 'INVALID_KEY',
    })
  })

  it('leaves pages beyond the limit out and lists them as skipped', async () => {
    const many = Array.from({ length: 33 }, (_, i) => ({ page: i + 1, image: 'x' }))
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async () => ok(2)))
    const result = await readScannedPages(many, { apiKey: 'k', onProgress: () => {} })
    expect(result.pages).toHaveLength(30)
    expect(result.skippedPages).toEqual([31, 32, 33])
  })
})
