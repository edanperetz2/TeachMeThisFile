// Thin wrapper around the Gemini REST API. Plain fetch, no SDK: we only need
// generateContent and its streaming twin.
import { ApiError } from './http.js'

// Stable Flash model. (The newer 3.8 Flash was often overloaded on the free tier.)
export const MODEL = 'gemini-3.6-flash'

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

// The user's key arrives in a header and is used for this request only.
// A key in the host's environment is an optional fallback (handy for local dev).
// The key is never logged, stored or sent back.
export function apiKeyFrom(request) {
  const key = request.headers.get('x-api-key')?.trim() || process.env.GEMINI_API_KEY
  if (!key) {
    throw new ApiError('INVALID_KEY', 'Add your Gemini API key to start.', 401)
  }
  return key
}

// Calls Gemini and returns the raw fetch Response (JSON, or an SSE stream when stream is true).
export async function generate({ apiKey, body, stream = false, signal }) {
  const method = stream ? 'streamGenerateContent?alt=sse' : 'generateContent'
  let response
  try {
    response = await fetch(`${BASE_URL}/${MODEL}:${method}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify(body),
      signal,
    })
  } catch (error) {
    if (error.name === 'TimeoutError') {
      throw new ApiError('TIMEOUT', 'The AI took too long to answer. Please try again.', 504)
    }
    throw new ApiError('UPSTREAM', "We couldn't reach the AI service. Please try again.", 502)
  }
  if (!response.ok) {
    throw toApiError(response.status, await response.text().catch(() => ''))
  }
  return response
}

// Maps a Gemini error to one of the codes the UI understands. The upstream body
// is only inspected here, never passed on.
export function toApiError(status, body) {
  if (status === 429) {
    return new ApiError('RATE_LIMITED', 'The AI is getting too many requests. Wait a moment and try again.', 429)
  }
  if (status === 401 || status === 403 || body.includes('API_KEY_INVALID') || body.includes('API key not valid')) {
    return new ApiError('INVALID_KEY', 'This Gemini API key was not accepted. Check it and try again.', 401)
  }
  if (status === 503) {
    return new ApiError('UPSTREAM', 'The AI model is busy right now. Try again in a minute.', 503)
  }
  return new ApiError('UPSTREAM', 'The AI service had a problem. Please try again.', 502)
}

// The model's answer text from a generateContent response, skipping "thought" parts.
export function responseText(data) {
  const parts = data.candidates?.[0]?.content?.parts ?? []
  const text = parts
    .filter((part) => !part.thought)
    .map((part) => part.text ?? '')
    .join('')
  if (!text) {
    const blocked = Boolean(data.promptFeedback?.blockReason)
    throw new ApiError(
      'UPSTREAM',
      blocked ? 'The AI declined to work with this content.' : 'The AI returned an empty answer. Please try again.',
      502,
    )
  }
  return text
}
