import { afterEach, describe, expect, it, vi } from 'vitest'
import { postToApi } from './api.js'

const json = (status, body) => new Response(JSON.stringify(body), { status })
const busy = () => json(503, { error: { code: 'UPSTREAM', message: 'The AI model is busy right now.' } })

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('postToApi', () => {
  it('sends the key in a header', async () => {
    const fetch = vi.fn().mockResolvedValue(json(200, {}))
    vi.stubGlobal('fetch', fetch)
    await postToApi('/api/plan', { a: 1 }, { apiKey: 'k' })
    expect(fetch.mock.calls[0][1].headers['x-api-key']).toBe('k')
  })

  it('retries a busy answer and returns the first success', async () => {
    vi.useFakeTimers()
    const fetch = vi.fn().mockResolvedValueOnce(busy()).mockResolvedValueOnce(json(200, { ok: true }))
    vi.stubGlobal('fetch', fetch)
    const pending = postToApi('/api/plan', {}, { apiKey: 'k' })
    await vi.runAllTimersAsync()
    expect((await pending).ok).toBe(true)
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('gives up after a few retries with the server message', async () => {
    vi.useFakeTimers()
    const fetch = vi.fn().mockImplementation(async () => busy())
    vi.stubGlobal('fetch', fetch)
    const pending = postToApi('/api/plan', {}, { apiKey: 'k' })
    const result = expect(pending).rejects.toMatchObject({ code: 'UPSTREAM', message: 'The AI model is busy right now.' })
    await vi.runAllTimersAsync()
    await result
    expect(fetch).toHaveBeenCalledTimes(4)
  })

  it('does not retry a used-up daily quota', async () => {
    const fetch = vi.fn().mockResolvedValue(json(429, { error: { code: 'QUOTA_EXCEEDED', message: 'Daily limit' } }))
    vi.stubGlobal('fetch', fetch)
    await expect(postToApi('/api/plan', {}, { apiKey: 'k' })).rejects.toMatchObject({ code: 'QUOTA_EXCEEDED' })
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('does not retry a wrong key', async () => {
    const fetch = vi.fn().mockResolvedValue(json(401, { error: { code: 'INVALID_KEY', message: 'Bad key' } }))
    vi.stubGlobal('fetch', fetch)
    await expect(postToApi('/api/plan', {}, { apiKey: 'k' })).rejects.toMatchObject({ code: 'INVALID_KEY' })
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('maps host errors without our JSON shape', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Request Entity Too Large', { status: 413 })))
    await expect(postToApi('/api/plan', {}, { apiKey: 'k' })).rejects.toMatchObject({ code: 'TOO_LARGE' })
  })

  it('reports a network failure as NETWORK', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    await expect(postToApi('/api/plan', {}, { apiKey: 'k' })).rejects.toMatchObject({ code: 'NETWORK' })
  })

  it('stops waiting between retries when the user presses Stop', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async () => busy()))
    const controller = new AbortController()
    const pending = postToApi('/api/chat', {}, { apiKey: 'k', signal: controller.signal })
    controller.abort()
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' })
  })
})
