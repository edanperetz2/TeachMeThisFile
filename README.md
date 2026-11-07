# Teach Me This File

A teacher uploads a file and writes a prompt; an AI tutor then teaches the file's content to a student in a chat, one step at a time.

Live: https://teach-me-this-files.vercel.app

Edventure AI Engineer home assignment. Stack: React + Vite + Tailwind (JavaScript) front end, Node.js serverless functions in `/api` on Vercel.

## Run locally

Requires Node.js 20+ and the Vercel CLI (`npm i -g vercel`).

```bash
npm install
vercel dev      # runs the Vite front end and the /api functions together
```

Front end only: `npm run dev`. Production build: `npm run build`.
