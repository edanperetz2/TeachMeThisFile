import { useT } from '../i18n/language.js'
import { CheckIcon } from './icons.jsx'
import Spinner from './Spinner.jsx'

// A short checklist while the lesson is being prepared, so waiting feels like progress.
export default function Preparing({ status, scanProgress }) {
  const t = useT()
  const steps = [
    {
      label: scanProgress ? t.readingScans(scanProgress.done, scanProgress.total) : t.readingFile,
      state: status === 'extracting' ? 'active' : 'done',
    },
    { label: t.planning, state: status === 'planning' ? 'active' : 'pending' },
    { label: t.meetingTutor, state: 'pending' },
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
