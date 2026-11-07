import { useState } from 'react'

export default function ApiKeyField({ value, onChange }) {
  const [visible, setVisible] = useState(false)

  return (
    <div>
      <label htmlFor="api-key" className="text-sm font-medium text-slate-900">
        Gemini API key
      </label>
      <div className="relative mt-2">
        <input
          id="api-key"
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="AIza…"
          autoComplete="off"
          spellCheck={false}
          dir="ltr"
          className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pr-16 pl-3 font-mono text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute inset-y-0 right-0 px-3 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-slate-500">
        Kept only in this browser tab and sent only to this app&apos;s server, never stored there.{' '}
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
