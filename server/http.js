// Shared helpers for the /api functions: one error type and one error response shape,
// so the browser always gets { error: { code, message } } and never upstream details.

export class ApiError extends Error {
  constructor(code, message, status) {
    super(message)
    this.code = code
    this.status = status
  }
}

export async function readJson(request) {
  try {
    return await request.json()
  } catch {
    throw new ApiError('BAD_REQUEST', 'The request was not valid JSON.', 400)
  }
}

export function errorResponse(error) {
  // The student pressed Stop before the answer started: nobody is waiting for a reply.
  if (error?.name === 'AbortError') {
    return new Response(null, { status: 499 })
  }
  if (error instanceof ApiError) {
    return Response.json({ error: { code: error.code, message: error.message } }, { status: error.status })
  }
  // Log only the error type: messages could echo request data.
  console.error('Unexpected server error:', error?.name)
  return Response.json(
    { error: { code: 'UPSTREAM', message: 'Something went wrong on the server. Please try again.' } },
    { status: 500 },
  )
}
