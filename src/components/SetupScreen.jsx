import { useState } from 'react'
import { fileProblem } from '../files/fileTypes.js'
import ApiKeyField from './ApiKeyField.jsx'
import FilePicker from './FilePicker.jsx'
import Spinner from './Spinner.jsx'

const EXAMPLE_PROMPT = 'Teach this to 7th graders, in French. Be Socratic. Keep it under 15 minutes.'

const BUSY_TEXT = {
  extracting: 'Reading your file…',
  planning: 'Planning the lesson…',
}

export default function SetupScreen({ status, error, scanProgress, apiKey, onApiKeyChange, onStart }) {
  const [file, setFile] = useState(null)
  const [teacherPrompt, setTeacherPrompt] = useState('')

  const busy = status in BUSY_TEXT
  const busyText =
    status === 'extracting' && scanProgress
      ? `Reading scanned pages: ${scanProgress.done} of ${scanProgress.total} done…`
      : BUSY_TEXT[status]
  const fileError = file ? fileProblem(file) : null
  const ready = file && !fileError && teacherPrompt.trim() && apiKey

  function handleSubmit(e) {
    e.preventDefault()
    if (ready && !busy) onStart({ file, teacherPrompt: teacherPrompt.trim() })
  }

  return (
    <main className="min-h-dvh bg-slate-50 px-4 py-8 sm:py-14">
      <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-5">
        <header className="mb-7">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Teach Me This File</h1>
          <p className="mt-1 text-slate-600">
            Upload a file and say how to teach it. The tutor turns it into a step-by-step lesson.
          </p>
        </header>

        <fieldset disabled={busy} className="space-y-5 disabled:opacity-60">
          <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <h2 className="mb-2 text-sm font-medium text-slate-900">File to teach</h2>
              <FilePicker file={file} onChange={setFile} />
              {fileError && <p className="mt-2 text-sm text-red-600">{fileError}</p>}
            </div>

            <div>
              <label htmlFor="teacher-prompt" className="text-sm font-medium text-slate-900">
                How should it be taught?
              </label>
              <textarea
                id="teacher-prompt"
                value={teacherPrompt}
                onChange={(e) => setTeacherPrompt(e.target.value)}
                placeholder={EXAMPLE_PROMPT}
                rows={3}
                dir="auto"
                className="mt-2 w-full resize-y rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
              {!teacherPrompt && (
                <button
                  type="button"
                  onClick={() => setTeacherPrompt(EXAMPLE_PROMPT)}
                  className="mt-1 text-xs font-medium text-indigo-600 hover:underline"
                >
                  Use the example
                </button>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <ApiKeyField value={apiKey} onChange={onApiKeyChange} />
          </section>
        </fieldset>

        {status === 'error' && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error.message}
          </div>
        )}

        {busy ? (
          <div
            role="status"
            className="flex items-center justify-center gap-3 rounded-xl bg-indigo-50 px-4 py-3 font-medium text-indigo-700"
          >
            <Spinner />
            {busyText}
          </div>
        ) : (
          <>
            <button
              type="submit"
              disabled={!ready}
              className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            >
              {status === 'error' ? 'Try again' : 'Start lesson'}
            </button>
            {!ready && (
              <p className="text-center text-xs text-slate-500">Add a file, a prompt and your API key to start.</p>
            )}
          </>
        )}
      </form>
    </main>
  )
}
