import { buildExtractRequest, parseExtract, readExtractInput } from '../server/extract.js'
import { apiKeyFrom, generate, responseText } from '../server/gemini.js'
import { errorResponse, readJson } from '../server/http.js'

// Not streamed, so it must finish inside Vercel's 300 s function limit.
const TIMEOUT_MS = 120_000

// POST { images: [{ id, data: base64 JPEG }] } → { pages: [{ id, text }] }
export async function POST(request) {
  try {
    const apiKey = apiKeyFrom(request)
    const images = readExtractInput(await readJson(request))
    const response = await generate({
      apiKey,
      body: buildExtractRequest(images),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    return Response.json({ pages: parseExtract(responseText(await response.json()), images) })
  } catch (error) {
    return errorResponse(error)
  }
}
