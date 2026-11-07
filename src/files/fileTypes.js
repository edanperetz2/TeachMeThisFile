export const MAX_FILE_MB = 30

export const ACCEPTED_EXTENSIONS = ['.pdf', '.docx', '.txt', '.md', '.jpg', '.jpeg', '.png', '.webp']

// Returns a message for the teacher if the file can't be used, otherwise null.
export function fileProblem(file) {
  const name = file.name.toLowerCase()
  if (!ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext))) {
    return "This file type isn't supported. Use a PDF, Word (.docx), text or image file."
  }
  if (file.size === 0) {
    return 'This file is empty.'
  }
  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    return `This file is larger than ${MAX_FILE_MB} MB. Try a smaller file or split it into parts.`
  }
  return null
}
