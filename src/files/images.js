// Scanned pages and photos are sent to the server as compressed JPEGs: big enough to
// read small print and formulas, small enough (~300-500 KB) to stay far below the
// host's 4.5 MB request limit with two pages per request.
export const MAX_IMAGE_SIDE = 2000
const JPEG_QUALITY = 0.7

// A photo file (JPG/PNG/WebP) → base64 JPEG, shrunk so its long side is at most MAX_IMAGE_SIDE.
export async function imageFileToJpeg(file) {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const context = canvas.getContext('2d')
  context.fillStyle = 'white' // transparent PNGs would otherwise turn black
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return canvasToJpeg(canvas)
}

export async function canvasToJpeg(canvas) {
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY))
  const dataUrl = await new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.readAsDataURL(blob)
  })
  return dataUrl.slice(dataUrl.indexOf(',') + 1) // just the base64 part
}
