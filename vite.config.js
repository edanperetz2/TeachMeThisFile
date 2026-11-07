import { existsSync } from 'node:fs'
import { Readable } from 'node:stream'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss(), localApi()],
})

// Local development only: serves /api/<name> from api/<name>.js the same way Vercel
// does (web Request in, web Response out, streaming included), so `npm run dev` runs
// the whole app. In production Vercel runs these files as serverless functions.
function localApi() {
  return {
    name: 'local-api',
    configureServer(server) {
      try {
        process.loadEnvFile('.env.local') // optional GEMINI_API_KEY fallback for local testing
      } catch {
        // no .env.local: the key must come from the settings field
      }

      server.middlewares.use('/api', async (req, res) => {
        const name = req.url.split('?')[0].slice(1)
        const file = `api/${name}.js`
        if (!/^[\w-]+$/.test(name) || !existsSync(file)) {
          res.statusCode = 404
          return res.end()
        }

        const handler = (await server.ssrLoadModule(`/${file}`))[req.method]
        if (!handler) {
          res.statusCode = 405
          return res.end()
        }

        // Like Vercel, abort the request's signal when the browser disconnects (e.g. Stop).
        const disconnected = new AbortController()
        res.on('close', () => disconnected.abort())

        const hasBody = req.method !== 'GET' && req.method !== 'HEAD'
        const response = await handler(
          new Request(`http://localhost${req.originalUrl}`, {
            method: req.method,
            headers: req.headers,
            body: hasBody ? Readable.toWeb(req) : undefined,
            duplex: 'half',
            signal: disconnected.signal,
          }),
        )
        res.writeHead(response.status, Object.fromEntries(response.headers))
        if (response.body) Readable.fromWeb(response.body).pipe(res)
        else res.end()
      })
    },
  }
}
