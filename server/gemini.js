// Thin wrapper around the Gemini REST API. Plain fetch, no SDK: we only need
// generateContent and its streaming twin.
import { ApiError } from './http.js'

// Tried in order. Free-tier quotas are per model: the Flash-Lite models allow 500
// requests a day (15 a minute), gemini-3.6-flash only 20 (5 a minute). When a model is
// busy, out of quota or retired we use the next one, so a free key lasts many lessons.
export const MODELS = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.6-flash']
const TRY_NEXT_MODEL_STATUS = new Set([404, 429, 503])

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
// Errors arrive before any streamed text, so switching models never mixes two answers.
export async function generate({ apiKey, body, stream = false, signal }) {
  const method = stream ? 'streamGenerateContent?alt=sse' : 'generateContent'
  let error
  for (const model of MODELS) {
    const response = await callModel(`${BASE_URL}/${model}:${method}`, apiKey, body, signal)
    if (response.ok) return response
    error = toApiError(response.status, await response.text().catch(() => ''))
    if (!TRY_NEXT_MODEL_STATUS.has(response.status)) break
  }
  throw error
}

async function callModel(url, apiKey, body, signal) {
  try {
    return await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify(body),
      signal,
    })
  } catch (error) {
    if (error.name === 'TimeoutError') {
      throw new ApiError('TIMEOUT', 'The AI took too long to answer. Please try again.', 504)
    }
    if (error.name === 'AbortError') throw error // the student pressed Stop
    throw new ApiError('UPSTREAM', "We couldn't reach the AI service. Please try again.", 502)
  }
}

// Maps a Gemini error to one of the codes the UI understands. The upstream body
// is only inspected here, never passed on.
export function toApiError(status, body) {
  if (status === 429 && body.includes('PerDay')) {
    return new ApiError(
      'QUOTA_EXCEEDED',
      "This API key has used up today's free AI requests. Try again tomorrow or use another key.",
      429,
    )
  }
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
  const text = answerText(data)
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

// Turns Gemini's server-sent events ("data: {json}" lines) into plain answer text chunks.
export function sseToText() {
  let buffer = ''
  const textOf = (line) => {
    if (!line.startsWith('data:')) return ''
    try {
      return answerText(JSON.parse(line.slice(5)))
    } catch {
      return ''
    }
  }
  return new TransformStream({
    transform(chunk, controller) {
      buffer += chunk
      const lines = buffer.split('\n')
      buffer = lines.pop() // the last line may be incomplete; keep it for the next chunk
      for (const line of lines) {
        const text = textOf(line.trim())
        if (text) controller.enqueue(text)
      }
    },
    flush(controller) {
      const text = textOf(buffer.trim())
      if (text) controller.enqueue(text)
    },
  })
}

function answerText(data) {
  const parts = data.candidates?.[0]?.content?.parts ?? []
  return parts
    .filter((part) => !part.thought)
    .map((part) => part.text ?? '')
    .join('')
}
