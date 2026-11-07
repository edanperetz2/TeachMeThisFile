// Placeholder: streams a fixed sentence word by word to prove chunked
// streaming works on the host. Replaced by the real tutor turn later.
export function POST() {
  const words = 'Hello! Streaming from a Vercel function works, one chunk at a time.'.split(' ')
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      for (const word of words) {
        controller.enqueue(encoder.encode(word + ' '))
        await new Promise((resolve) => setTimeout(resolve, 300))
      }
      controller.close()
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
