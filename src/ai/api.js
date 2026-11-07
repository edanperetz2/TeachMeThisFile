import { AppError } from '../errors.js'

// Every call to our own /api goes through here: the key travels in a header,
// and any failure becomes an AppError with a code the UI understands.
export async function postToApi(path, body, { apiKey, signal }) {
  let response
  try {
    response = await fetch(path, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify(body),
      signal,
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error // the user stopped it; not an error to show
    throw new AppError('NETWORK', "We couldn't reach the server. Check your connection and try again.")
  }
  if (!response.ok) throw await apiError(response)
  return response
}

async function apiError(response) {
  const data = await response.json().catch(() => null)
  if (data?.error?.code) return new AppError(data.error.code, data.error.message)
  // Errors from the host itself (not our code) come without our JSON shape.
  if (response.status === 413) {
    return new AppError('TOO_LARGE', 'This file is too large to send. Try a smaller file or split it.')
  }
  if (response.status === 504) {
    return new AppError('TIMEOUT', 'The server took too long to answer. Please try again.')
  }
  return new AppError('UPSTREAM', 'The server had a problem. Please try again.')
}
