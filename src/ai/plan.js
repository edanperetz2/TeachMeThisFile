import { postToApi } from './api.js'

// How much document text the planner gets. Keeps the request well under the host's
// 4.5 MB body limit and the free tier's per-minute token limit.
const PLAN_CHAR_BUDGET = 400_000

export async function requestPlan({ teacherPrompt, passages, apiKey }) {
  const response = await postToApi(
    '/api/plan',
    { teacherPrompt, passages: fitToBudget(passages, PLAN_CHAR_BUDGET) },
    { apiKey },
  )
  return response.json()
}

// For very long documents every passage keeps an equal share of the budget, so the
// planner still sees the whole document, just less of each part.
export function fitToBudget(passages, budget) {
  const total = passages.reduce((sum, p) => sum + p.text.length, 0)
  if (total <= budget) return passages
  const share = Math.floor(budget / passages.length)
  return passages.map((p) => ({ ...p, text: p.text.slice(0, share) }))
}
