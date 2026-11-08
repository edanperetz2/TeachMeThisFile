import { useState } from 'react'
import { useLanguage, useT } from '../i18n/language.js'

// Asked only when the teacher named no language and their instructions and the file
// are written in different languages. options = [instructions language, file language].
export default function LanguageQuestion({ options: [instructionsLanguage, fileLanguage], onChoose }) {
  const t = useT()
  const { language } = useLanguage()
  const [askingOther, setAskingOther] = useState(false)
  const [other, setOther] = useState('')
  const chooseOther = () => other.trim() && onChoose({ name: other.trim() })
  const choices = [
    { code: instructionsLanguage, hint: t.likeInstructions },
    { code: fileLanguage, hint: t.likeFile },
  ]

  return (
    <section
      role="group"
      aria-labelledby="language-question"
      className="rise-in rounded-2xl border border-indigo-200 bg-white p-5 shadow-sm"
    >
      <h2 id="language-question" className="font-semibold text-slate-900">
        {t.languageQuestion}
      </h2>
      <p className="mt-1 text-sm text-slate-600">{t.languageQuestionNote}</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {choices.map(({ code, hint }) => (
          <button
            key={code}
            type="button"
            onClick={() => onChoose({ code })}
            className="rounded-xl border border-slate-300 px-4 py-3 text-start transition-colors hover:border-indigo-500 hover:bg-indigo-50"
          >
            <span className="block font-semibold text-slate-900">{languageName(code, language)}</span>
            <span className="block text-xs text-slate-500">{hint}</span>
          </button>
        ))}
      </div>

      {/* Neither: the teacher types the language (in any language, e.g. "Russian" or "רוסית").
          Not a <form>: this sits inside the Setup screen's form, and forms can't be nested. */}
      {askingOther ? (
        <div className="mt-3 flex gap-2">
          <input
            value={other}
            onChange={(e) => setOther(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                chooseOther()
              }
            }}
            placeholder={t.otherLanguagePlaceholder}
            aria-label={t.otherLanguage}
            dir="auto"
            autoFocus
            className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2.5 text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 sm:text-sm"
          />
          <button
            type="button"
            onClick={chooseOther}
            disabled={!other.trim()}
            className="shrink-0 rounded-xl bg-indigo-600 px-4 font-medium text-white hover:bg-indigo-700 disabled:bg-slate-300"
          >
            {t.teachInIt}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAskingOther(true)}
          className="mt-3 text-sm font-medium text-indigo-600 hover:underline"
        >
          {t.otherLanguage}
        </button>
      )}
    </section>
  )
}

// "he" → "Hebrew" in the English interface, "עברית" in the Hebrew one.
function languageName(code, interfaceLanguage) {
  try {
    return new Intl.DisplayNames([interfaceLanguage], { type: 'language' }).of(code)
  } catch {
    return code
  }
}
