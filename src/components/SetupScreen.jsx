import { useState } from 'react'
import { fileProblem } from '../files/fileTypes.js'
import ApiKeyField from './ApiKeyField.jsx'
import FilePicker from './FilePicker.jsx'
import { ArrowRightIcon, ChatIcon, CheckIcon, LogoMark, PenIcon, UploadIcon } from './icons.jsx'
import Spinner from './Spinner.jsx'

// Ready-made teacher prompts: one tap fills the box, and they show what a prompt can ask for.
const PROMPT_PRESETS = [
  { label: '7th grade · French · Socratic', prompt: 'Teach this to 7th graders, in French. Be Socratic. Keep it under 15 minutes.' },
  { label: 'Simple, for 10-year-olds', prompt: 'Explain this simply for 10-year-olds, with everyday examples. About 10 minutes.' },
  { label: 'Exam revision', prompt: 'Help a high-school student revise this for an exam: short explanations and lots of quick questions. 15 minutes.' },
  { label: 'בעברית', prompt: 'למדו את החומר לתלמידי כיתה ח׳, בעברית, צעד אחר צעד. בערך 15 דקות.' },
]

const HOW_IT_WORKS = [
  { icon: UploadIcon, text: 'Upload a file' },
  { icon: PenIcon, text: 'Say how to teach it' },
  { icon: ChatIcon, text: 'Learn it step by step' },
]

export default function SetupScreen({ status, error, scanProgress, apiKey, onApiKeyChange, onStart }) {
  const [file, setFile] = useState(null)
  const [teacherPrompt, setTeacherPrompt] = useState('')

  const busy = status === 'extracting' || status === 'planning'
  const fileError = file ? fileProblem(file) : null
  const ready = file && !fileError && teacherPrompt.trim() && apiKey
  const missing = [!file && 'a file', !teacherPrompt.trim() && 'how to teach it', !apiKey && 'your API key'].filter(Boolean)

  function handleSubmit(e) {
    e.preventDefault()
    if (ready && !busy) onStart({ file, teacherPrompt: teacherPrompt.trim() })
  }

  return (
    <main className="min-h-dvh bg-gradient-to-b from-indigo-100/70 via-slate-50 to-slate-50 px-4 py-8 sm:py-12">
      <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-5">
        <header className="mb-8">
          <div className="flex items-center gap-2.5">
            <LogoMark />
            <span className="font-semibold text-slate-900">Teach Me This File</span>
          </div>
          <h1 className="mt-6 text-[1.75rem] leading-tight font-bold tracking-tight text-slate-900 sm:text-4xl">
            Turn any file into a lesson
          </h1>
          <p className="mt-2 text-slate-600">
            Upload your material and say how it should be taught. A patient AI tutor teaches it one step at a time,
            checks understanding and stays true to your file.
          </p>
          <ol className="mt-5 grid grid-cols-3 gap-2">
            {HOW_IT_WORKS.map(({ icon: Icon, text }, i) => (
              <li key={text} className="flex flex-col items-center gap-1.5 rounded-xl bg-white/70 px-2 py-3 text-center shadow-sm ring-1 ring-slate-200/70">
                <span className="grid size-8 place-items-center rounded-full bg-indigo-100 text-indigo-700">
                  <Icon className="size-4.5" />
                </span>
                <span className="text-xs leading-snug font-medium text-slate-700">
                  <span className="text-indigo-600">{i + 1}.</span> {text}
                </span>
              </li>
            ))}
          </ol>
        </header>

        <fieldset disabled={busy} className="space-y-4 disabled:opacity-60">
          <Card number={1} title="Your file">
            <FilePicker file={file} onChange={setFile} />
            {fileError && <p className="mt-2 text-sm text-red-600">{fileError}</p>}
          </Card>

          <Card number={2} title="How should it be taught?" labelFor="teacher-prompt">
            <textarea
              id="teacher-prompt"
              value={teacherPrompt}
              onChange={(e) => setTeacherPrompt(e.target.value)}
              placeholder="Who is the student, which language, what style, how long…"
              rows={3}
              dir="auto"
              className="w-full resize-y rounded-xl border border-slate-300 px-3 py-2.5 text-base outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 sm:text-sm"
            />
            <p className="mt-3 mb-2 text-xs font-medium text-slate-500">Or start from an example:</p>
            <div className="flex flex-wrap gap-1.5">
              {PROMPT_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setTeacherPrompt(preset.prompt)}
                  aria-pressed={teacherPrompt === preset.prompt}
                  className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-indigo-400 hover:text-indigo-700 aria-pressed:border-indigo-500 aria-pressed:bg-indigo-50 aria-pressed:text-indigo-700"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </Card>

          <Card number={3} title="Your Gemini API key" labelFor="api-key">
            <ApiKeyField value={apiKey} onChange={onApiKeyChange} hideLabel />
          </Card>
        </fieldset>

        {status === 'error' && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error.message}
          </div>
        )}

        {busy ? (
          <Preparing status={status} scanProgress={scanProgress} />
        ) : (
          <>
            <button
              type="submit"
              disabled={!ready}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-lg font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            >
              {status === 'error' ? 'Try again' : 'Start the lesson'}
              <ArrowRightIcon className="size-5 transition-transform group-enabled:group-hover:translate-x-0.5" />
            </button>
            {!ready && <p className="text-center text-xs text-slate-500">Add {joinWithAnd(missing)} to start.</p>}
          </>
        )}

        <p className="pt-2 text-center text-xs text-slate-400">
          Your file is read in your browser. Your key stays in this tab.
        </p>
      </form>
    </main>
  )
}

function Card({ number, title, labelFor, children }) {
  const Title = labelFor ? 'label' : 'h2'
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <Title htmlFor={labelFor} className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
        <span className="grid size-6 place-items-center rounded-full bg-indigo-600 text-xs text-white">{number}</span>
        {title}
      </Title>
      {children}
    </section>
  )
}

// A short checklist while the lesson is being prepared, so waiting feels like progress.
function Preparing({ status, scanProgress }) {
  const reading = scanProgress
    ? `Reading scanned pages (${scanProgress.done} of ${scanProgress.total} done)`
    : 'Reading your file'
  const steps = [
    { label: reading, state: status === 'extracting' ? 'active' : 'done' },
    { label: 'Planning the lesson', state: status === 'planning' ? 'active' : 'pending' },
    { label: 'Meeting your tutor', state: 'pending' },
  ]
  return (
    <ol role="status" className="space-y-3 rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
      {steps.map((step) => (
        <li key={step.label} className="flex items-center gap-3 text-sm">
          {step.state === 'done' && (
            <span className="grid size-6 place-items-center rounded-full bg-emerald-500 text-white">
              <CheckIcon className="size-4" />
            </span>
          )}
          {step.state === 'active' && (
            <span className="grid size-6 place-items-center text-indigo-600">
              <Spinner className="size-5" />
            </span>
          )}
          {step.state === 'pending' && <span className="mx-1.5 size-3 rounded-full border-2 border-slate-300" />}
          <span className={step.state === 'pending' ? 'text-slate-400' : 'font-medium text-slate-800'}>{step.label}</span>
        </li>
      ))}
    </ol>
  )
}

function joinWithAnd(items) {
  return items.length > 1 ? `${items.slice(0, -1).join(', ')} and ${items.at(-1)}` : items[0]
}
