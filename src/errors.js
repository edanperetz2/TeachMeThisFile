// An error the UI knows how to show: a short code plus a message for the user.
export class AppError extends Error {
  constructor(code, message) {
    super(message)
    this.code = code
  }
}

// Turns anything thrown into the { code, message } shape the lesson state stores.
export function toErrorState(error) {
  if (error instanceof AppError) {
    return { code: error.code, message: error.message }
  }
  console.error(error)
  return { code: 'UNEXPECTED', message: 'Something went wrong. Please try again.' }
}
