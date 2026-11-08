import { apiKeyFrom, generate, responseText, sseToText } from '../server/gemini.js'
import { errorResponse, readJson } from '../server/http.js'
import { buildChatRequest, buildControlRequest, ensureControlLine, readChatInput } from '../server/tutor.js'

const TIMEOUT_MS = 120_000
const CONTROL_TIMEOUT_MS = 15_000

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

    // Only used when the model forgot the control line (about 1 reply in 10 in testing).
    const requestControl = async (reply) => {
      const response = await generate({
        apiKey,
        body: buildControlRequest(input, reply),
        signal: AbortSignal.any([request.signal, AbortSignal.timeout(CONTROL_TIMEOUT_MS)]),
      })
      return JSON.parse(responseText(await response.json()))
    }

    const text = upstream.body
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(sseToText())
      .pipeThrough(ensureControlLine(requestControl))
      .pipeThrough(new TextEncoderStream())
    return new Response(text, {
      headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
    })
  } catch (error) {
    return errorResponse(error)
  }
}
