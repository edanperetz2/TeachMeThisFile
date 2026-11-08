import { useLanguage, useT } from '../i18n/language.js'

// Asked only when the teacher named no language and their instructions and the file
// are written in different languages. options = [instructions language, file language].
export default function LanguageQuestion({ options: [instructionsLanguage, fileLanguage], onChoose }) {
  const t = useT()
  const { language } = useLanguage()
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
            onClick={() => onChoose(code)}
            className="rounded-xl border border-slate-300 px-4 py-3 text-start transition-colors hover:border-indigo-500 hover:bg-indigo-50"
          >
            <span className="block font-semibold text-slate-900">{languageName(code, language)}</span>
            <span className="block text-xs text-slate-500">{hint}</span>
          </button>
        ))}
      </div>
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
