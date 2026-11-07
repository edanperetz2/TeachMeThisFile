import { describe, expect, it } from 'vitest'
import { responseText, toApiError } from './gemini.js'

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
