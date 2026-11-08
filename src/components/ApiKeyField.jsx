import { useState } from 'react'
import { CheckIcon, KeyIcon } from './icons.jsx'

// hideLabel: the setup screen shows its own heading for this field.
export default function ApiKeyField({ value, onChange, hideLabel = false }) {
  const [visible, setVisible] = useState(false)

  return (
    <div>
      {!hideLabel && (
        <label htmlFor="api-key" className="text-sm font-medium text-slate-900">
          Gemini API key
        </label>
      )}
      <div className={`relative ${hideLabel ? '' : 'mt-2'}`}>
        <KeyIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
        <input
          id="api-key"
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste your key here"
          autoComplete="off"
          spellCheck={false}
          dir="ltr"
          className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pr-16 pl-9 font-mono text-base text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 sm:text-sm"
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute inset-y-0 right-0 px-3 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
      <p className="mt-2 flex flex-wrap items-center gap-x-1.5 text-xs leading-relaxed text-slate-500">
        {value && (
          <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
            <CheckIcon className="size-3.5" /> Saved for this tab.
          </span>
        )}
        <span>Sent only to this app&apos;s server, never stored there.</span>
        <a
          href="https://aistudio.google.com/apikey"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-indigo-600 hover:underline"
        >
          Get a free key
        </a>
      </p>
    </div>
  )
}
