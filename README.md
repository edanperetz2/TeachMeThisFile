# Teach Me This File

A teacher uploads a file and writes how it should be taught. An AI tutor then teaches the file's content to a student in a chat — one step at a time, checking understanding, giving hints instead of answers, and staying grounded in the file.

**Live:** https://teach-me-this-files.vercel.app

Edventure AI Engineer home assignment. Stack: React + Vite + Tailwind (JavaScript) in the browser, Node.js serverless functions in `/api` on Vercel, Google Gemini as the AI. Design choices, known weaknesses and test results are in [DECISIONS.md](DECISIONS.md).

## How to use it

0. Choose the interface language with the **EN | עב** switch (Hebrew turns the app right-to-left). The lesson itself is taught in the language the teacher asks for.
1. **Get a free Gemini API key** at [Google AI Studio](https://aistudio.google.com/apikey) → *Create API key*.
2. Open the app and **pick a file**: PDF (text or scanned), Word (.docx), text/Markdown, or a photo (JPG/PNG/WebP), up to 30 MB.
3. **Say how it should be taught**, for example: *"Teach this to 7th graders, in French. Be Socratic. Keep it under 15 minutes."* — or tap one of the examples. The tutor follows the language, level, style and time you ask for. If you don't name a language and your instructions and the file are in different languages, the app asks which one to teach in.
4. **Paste your key** and press **Start the lesson**. The app reads the file (scanned pages are read by the AI, with progress shown) and plans the lesson.
5. **The lesson** opens with the tutor's first question. Answer in the chat.
   - The header shows *Step x of N* and a progress bar; tap it to see the whole lesson plan.
   - **Source** under a tutor message shows the passage of your file it is based on (with page number).
   - Stuck? Tap **I don't know**, **Give me a hint** or **Explain it differently**.
   - **Stop** cuts a reply short; **Retry** appears if something fails. A reload keeps the lesson.
   - After the last step the tutor gives a short recap, and a **report** shows how each step went (understanding, answers, minutes) with **Copy summary** for the teacher.

The key is kept only in this browser tab (sessionStorage) and sent only to this app's own server with each request. The server uses it for that request and never stores or logs it.

The `test-files/` folder has small files to try: Hebrew text, formulas and tables, a scanned page, a photo, a long PDF, a prompt-injection file and broken files ([list](test-files/README.md)).

## Run it locally

Requires Node.js 24.

```bash
npm install
npm run dev        # app + /api functions on http://localhost:5173
npm test           # unit tests (Vitest)
npm run build      # production build into dist/
npm run eval       # tutor behaviour checks against the running app (needs a key, see below)
```

`npm run dev` serves the `/api` functions from the Vite dev server (a small plugin in `vite.config.js`), so one command runs everything. Optionally, put `GEMINI_API_KEY=...` in a `.env.local` file (git-ignored) to use a key from the environment when the settings field is empty — handy for local testing. The live deployment has no such key: every user brings their own.

**Eval:** `npm run eval` runs scripted lessons against the app (start `npm run dev` first, or set `EVAL_URL=https://teach-me-this-files.vercel.app`) and grades the tutor with rules and an AI judge. It needs `GEMINI_API_KEY` in the environment or `.env.local`, and uses about 40–60 requests.

**Deploy:** the repo is connected to Vercel; every push to `main` deploys. Vercel builds the Vite app as static files and runs each file in `api/` as a Node.js function (`vercel.json` lets `/api/chat` stop when the student presses Stop).

## How the code is organised

```
api/                 Serverless endpoints (thin: read input → call Gemini → respond)
  plan.js            POST passages + teacher prompt → structured lesson plan
  chat.js            POST current step context → streamed tutor reply
  extract.js         POST page images → text (OCR for scans and photos)
server/              Server logic, no HTTP details
  gemini.js          Gemini REST calls, model fallback, error mapping
  plan.js            Planning prompt, JSON schema, plan validation
  tutor.js           Teaching rules, per-turn notes, chat history format
  extract.js         OCR prompt and schema
src/
  lesson/            Lesson state: reducer (all lesson rules), selectors, useLesson hook,
                     saving across reloads, the end-of-lesson report
  ai/                Browser-side calls to /api (retries, streaming, control line)
  files/             Reading files in the browser and splitting them into passages
  components/        UI only: Setup screen, Lesson screen and their parts
  i18n/              Interface text in English and Hebrew, and the language switch setting
  settings/          The API key field's storage
eval/                npm run eval: scripted lessons, rule checks and an AI judge
test-files/          Small files for manual testing
```

The UI only calls functions from `useLesson`; it never talks to the network or changes lesson state itself. The lesson plan and the student's progress live in the reducer's state, not only in the chat history.
