// Automated checks of the tutor's behaviour. Scripted students talk to the real /api
// through the app's own client code (reducer, request builder, streaming, control line);
// rule checks and an AI judge grade the result.
//
//   npm run dev   (in another terminal)  then  npm run eval
//   EVAL_URL=https://teach-me-this-files.vercel.app npm run eval   (the live site)
//
// Needs GEMINI_API_KEY in the environment or in .env.local. Uses ~40-60 requests.
import { existsSync, readFileSync } from 'node:fs'
import { generate, responseText } from '../server/gemini.js'
import { streamTutorTurn, tutorTurnRequest } from '../src/ai/chat.js'
import { requestPlan } from '../src/ai/plan.js'
import { splitIntoPassages } from '../src/files/passages.js'
import { initialLessonState, lessonReducer } from '../src/lesson/lessonReducer.js'
import { needsOpeningTurn } from '../src/lesson/selectors.js'
import { scenarios } from './scenarios.js'

if (existsSync('.env.local')) process.loadEnvFile('.env.local')
const apiKey = process.env.GEMINI_API_KEY
const baseUrl = process.env.EVAL_URL ?? 'http://localhost:5173'
if (!apiKey) {
  console.error('Set GEMINI_API_KEY (or put it in .env.local).')
  process.exit(1)
}

// The app's client code calls relative /api paths; send them to the app under test.
const nodeFetch = globalThis.fetch
globalThis.fetch = (url, options) => nodeFetch(url.startsWith('/') ? baseUrl + url : url, options)

const JUDGE_SCHEMA = {
  type: 'object',
  properties: { pass: { type: 'boolean' }, reason: { type: 'string' } },
  required: ['pass', 'reason'],
}

// A lesson driven like the UI drives it: same actions, same requests.
async function startLesson(documentText, teacherPrompt) {
  let state = lessonReducer(initialLessonState, { type: 'EXTRACTION_STARTED', teacherPrompt })
  const passages = splitIntoPassages([{ page: 1, text: documentText }])
  state = lessonReducer(state, { type: 'DOCUMENT_READY', document: { fileName: 'eval', passages, skippedPages: [] } })
  const plan = await requestPlan({ teacherPrompt, passages, apiKey })
  state = lessonReducer(state, { type: 'PLAN_READY', plan, at: Date.now() })
  const replies = []

  async function turn(studentText) {
    const request = tutorTurnRequest(state, studentText)
    state = lessonReducer(state, { type: 'TURN_STARTED', studentText })
    let text = ''
    const control = await streamTutorTurn({ request, apiKey, onText: (t) => (text = t) })
    state = lessonReducer(state, { type: 'TEXT_RECEIVED', text })
    state = lessonReducer(state, { type: 'TURN_FINISHED', control, at: Date.now() })
    replies.push({ student: studentText, tutor: text, control })
    return text
  }

  // Like useLesson: the tutor opens the lesson and every new step by itself.
  async function openSteps() {
    while (needsOpeningTurn(state)) await turn(null)
  }

  await openSteps()
  return {
    state: () => state,
    replies: () => replies,
    opening: () => replies[0].tutor,
    // The student's answer → the tutor's reply to it (any opening of a next step follows).
    async say(text) {
      const reply = await turn(text)
      await openSteps()
      return reply
    },
  }
}

async function askGemini(prompt, schema) {
  const generationConfig = { thinkingConfig: { thinkingLevel: 'LOW' } }
  if (schema) Object.assign(generationConfig, { responseMimeType: 'application/json', responseJsonSchema: schema })
  const response = await generate({ apiKey, body: { contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig } })
  return responseText(await response.json())
}

async function judge(name, question, message, context) {
  const prompt = `You are grading one message from an AI tutor in a lesson with a student.
${context ? `\nThe tutor's previous message, for context:\n"""\n${context}\n"""\n` : ''}
The message to grade:
"""
${message}
"""

Question: ${question}
Answer pass = true only if the answer is clearly yes. Give a one-sentence reason.`
  const { pass, reason } = JSON.parse(await askGemini(prompt, JUDGE_SCHEMA))
  return { name, pass, detail: reason }
}

function rule(name, pass, detail = '') {
  return { name, pass, detail }
}

async function runScenario(scenario) {
  const documentText = readFileSync(scenario.document, 'utf8')
  const lesson = await startLesson(documentText, scenario.teacherPrompt)
  // A simulated student who reads the document and answers the tutor's last question well.
  const sayAsGoodStudent = async () => {
    const answer = await askGemini(`You are a hard-working student in a short lesson about this text:
"""
${documentText}
"""
The tutor just said:
"""
${lesson.replies().at(-1).tutor}
"""
Reply as the student, in one or two sentences, answering correctly in the tutor's language.`)
    return lesson.say(answer.trim())
  }
  return scenario.run({ lesson, say: lesson.say, sayAsGoodStudent, judge, rule })
}

console.log(`Evaluating the tutor at ${baseUrl}\n`)
let passed = 0
let total = 0
for (const scenario of scenarios) {
  console.log(scenario.name)
  try {
    for (const check of await runScenario(scenario)) {
      total++
      if (check.pass) passed++
      console.log(`  ${check.pass ? 'PASS' : 'FAIL'}  ${check.name}${check.detail ? ` — ${check.detail}` : ''}`)
    }
  } catch (error) {
    total++
    console.log(`  FAIL  scenario stopped: ${error.code ?? error.name}: ${error.message}`)
  }
  console.log()
}
console.log(`${passed}/${total} checks passed`)
process.exitCode = passed === total ? 0 : 1
