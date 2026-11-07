import { apiKeyFrom, generate, responseText } from '../server/gemini.js'
import { errorResponse, readJson } from '../server/http.js'
import { buildPlanRequest, parsePlan, readPlanInput } from '../server/plan.js'

// Not streamed, so it must finish inside Vercel's 300 s function limit.
const TIMEOUT_MS = 240_000

// POST { teacherPrompt, passages } → { title, language, steps }
export async function POST(request) {
  try {
    const apiKey = apiKeyFrom(request)
    const { teacherPrompt, passages } = readPlanInput(await readJson(request))
    const response = await generate({
      apiKey,
      body: buildPlanRequest(teacherPrompt, passages),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    return Response.json(parsePlan(responseText(await response.json()), passages))
  } catch (error) {
    return errorResponse(error)
  }
}
