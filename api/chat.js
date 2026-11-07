import { apiKeyFrom, generate, sseToText } from '../server/gemini.js'
import { errorResponse, readJson } from '../server/http.js'
import { buildChatRequest, readChatInput } from '../server/tutor.js'

const TIMEOUT_MS = 120_000

// POST lesson context for the current step → the tutor's reply as a plain text stream,
// ending with a hidden control line the browser turns into lesson state.
export async function POST(request) {
  try {
    const apiKey = apiKeyFrom(request)
    const input = readChatInput(await readJson(request))
    const upstream = await generate({
      apiKey,
      body: buildChatRequest(input),
      stream: true,
      // Stop when the student presses Stop (request.signal) or the turn takes too long.
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(TIMEOUT_MS)]),
    })
    const text = upstream.body
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(sseToText())
      .pipeThrough(new TextEncoderStream())
    return new Response(text, {
      headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
    })
  } catch (error) {
    return errorResponse(error)
  }
}
