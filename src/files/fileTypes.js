export const MAX_FILE_MB = 30

export const ACCEPTED_EXTENSIONS = ['.pdf', '.docx', '.txt', '.md', '.jpg', '.jpeg', '.png', '.webp']

// Why a file can't be used ('unsupported' | 'empty' | 'tooLarge'), or null if it can.
// The screen turns this into a message in the interface language.
export function fileProblem(file) {
  const name = file.name.toLowerCase()
  if (!ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext))) return 'unsupported'
  if (file.size === 0) return 'empty'
  if (file.size > MAX_FILE_MB * 1024 * 1024) return 'tooLarge'
  return null
}
