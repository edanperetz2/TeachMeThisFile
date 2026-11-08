import { useState } from 'react'
import { useT } from '../i18n/language.js'
import { CheckIcon, KeyIcon } from './icons.jsx'

// hideLabel: the setup screen shows its own heading for this field.
export default function ApiKeyField({ value, onChange, hideLabel = false }) {
  const t = useT()
  const [visible, setVisible] = useState(false)

  return (
    <div>
      {!hideLabel && (
        <label htmlFor="api-key" className="text-sm font-medium text-slate-900">
          {t.keyLabel}
        </label>
      )}
      {/* A key is always left-to-right, so the field keeps that layout in Hebrew too. */}
      <div dir="ltr" className={`relative ${hideLabel ? '' : 'mt-2'}`}>
        <KeyIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
        <input
          id="api-key"
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t.keyPlaceholder}
          autoComplete="off"
          spellCheck={false}
          className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pr-16 pl-9 font-mono text-base text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 sm:text-sm"
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute inset-y-0 right-0 px-3 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          {visible ? t.hide : t.show}
        </button>
      </div>
      <p className="mt-2 flex flex-wrap items-center gap-x-1.5 text-xs leading-relaxed text-slate-500">
        {value && (
          <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
            <CheckIcon className="size-3.5" /> {t.keySaved}
          </span>
        )}
        <span>{t.keyNote}</span>
        <a
          href="https://aistudio.google.com/apikey"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-indigo-600 hover:underline"
        >
          {t.getKey}
        </a>
      </p>
    </div>
  )
}
