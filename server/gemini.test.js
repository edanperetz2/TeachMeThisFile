import { afterEach, describe, expect, it, vi } from 'vitest'
import { generate, MODELS, responseText, toApiError } from './gemini.js'

afterEach(() => vi.unstubAllGlobals())

describe('generate', () => {
  const dailyQuota = () => new Response('{"quotaId":"GenerateRequestsPerDayPerProjectPerModel-FreeTier"}', { status: 429 })

  it('moves to the next model when one is out of quota', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(dailyQuota()).mockResolvedValueOnce(new Response('{}'))
    vi.stubGlobal('fetch', fetch)
    const response = await generate({ apiKey: 'k', body: {} })
    expect(response.ok).toBe(true)
    expect(fetch.mock.calls.map(([url]) => url.split('/').pop())).toEqual([
      `${MODELS[0]}:generateContent`,
      `${MODELS[1]}:generateContent`,
    ])
  })

  it('reports the last error when every model is out of quota', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async () => dailyQuota()))
    await expect(generate({ apiKey: 'k', body: {} })).rejects.toMatchObject({ code: 'QUOTA_EXCEEDED' })
  })

  it('does not try other models with a wrong key', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('API_KEY_INVALID', { status: 400 }))
    vi.stubGlobal('fetch', fetch)
    await expect(generate({ apiKey: 'k', body: {} })).rejects.toMatchObject({ code: 'INVALID_KEY' })
    expect(fetch).toHaveBeenCalledTimes(1)
  })
})

describe('toApiError', () => {
  it.each([
    [429, '', 'RATE_LIMITED'],
    [401, '', 'INVALID_KEY'],
    [403, '', 'INVALID_KEY'],
    [400, '{"error":{"details":[{"reason":"API_KEY_INVALID"}]}}', 'INVALID_KEY'],
    [400, '{"error":{"message":"Invalid schema"}}', 'UPSTREAM'],
    [500, '', 'UPSTREAM'],
    [503, '', 'UPSTREAM'],
  ])('maps HTTP %i to %s', (status, body, code) => {
    expect(toApiError(status, body).code).toBe(code)
  })

  it('recognises a used-up daily quota (no point retrying)', () => {
    const body = '{"error":{"details":[{"violations":[{"quotaId":"GenerateRequestsPerDayPerProjectPerModel-FreeTier"}]}]}}'
    expect(toApiError(429, body).code).toBe('QUOTA_EXCEEDED')
  })

  it('tells the user when the model is busy', () => {
    expect(toApiError(503, '').message).toContain('busy')
  })

  it('never passes the upstream body on to the user', () => {
    const error = toApiError(400, 'secret upstream details')
    expect(error.message).not.toContain('secret')
  })
})

describe('responseText', () => {
  it('joins text parts and skips thoughts', () => {
    const data = { candidates: [{ content: { parts: [{ text: 'hmm', thought: true }, { text: 'Hello ' }, { text: 'world' }] } }] }
    expect(responseText(data)).toBe('Hello world')
  })

  it('fails clearly when the prompt was blocked', () => {
    expect(() => responseText({ promptFeedback: { blockReason: 'SAFETY' } })).toThrow('declined')
  })
})
