import { AppError } from '../errors.js'

// "Busy" (503) and "too many requests per minute" (429) are usually over in seconds
// on the free tier, so we quietly retry a few times before showing an error.
// A used-up daily quota (QUOTA_EXCEEDED) is not retried: it won't clear for hours.
const RETRY_DELAYS_MS = [2000, 5000, 10000]

// Every call to our own /api goes through here: the key travels in a header,
// and any failure becomes an AppError with a code the UI understands.
export async function postToApi(path, body, { apiKey, signal }) {
  for (let attempt = 0; ; attempt++) {
    const response = await send(path, body, apiKey, signal)
    if (response.ok) return response
    const error = await apiError(response)
    const retryable = response.status === 503 || error.code === 'RATE_LIMITED'
    if (!retryable || attempt === RETRY_DELAYS_MS.length) throw error
    await wait(RETRY_DELAYS_MS[attempt], signal)
  }
}

async function send(path, body, apiKey, signal) {
  try {
    return await fetch(path, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify(body),
      signal,
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error // the user stopped it; not an error to show
    throw new AppError('NETWORK', "We couldn't reach the server. Check your connection and try again.")
  }
}

// A pause that ends early (with an AbortError) if the user presses Stop.
function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason)
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        reject(signal.reason)
      },
      { once: true },
    )
  })
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
