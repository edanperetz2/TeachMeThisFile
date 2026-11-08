import { useLanguage, useT } from '../i18n/language.js'
import { LANGUAGES } from '../i18n/strings.js'

// EN | עב — switches the interface language.
export default function LanguageSwitch() {
  const { language, setLanguage } = useLanguage()
  const t = useT()

  return (
    <div role="group" aria-label={t.languageSwitch} className="flex shrink-0 rounded-lg bg-slate-100 p-0.5 text-xs font-semibold">
      {Object.entries(LANGUAGES).map(([code, { label, name }]) => (
        <button
          key={code}
          type="button"
          lang={code}
          title={name}
          aria-pressed={language === code}
          onClick={() => setLanguage(code)}
          className="rounded-md px-2 py-1 text-slate-500 transition-colors hover:text-slate-900 aria-pressed:bg-white aria-pressed:text-indigo-700 aria-pressed:shadow-sm"
        >
          {label}
        </button>
      ))}
    </div>
  )
}
