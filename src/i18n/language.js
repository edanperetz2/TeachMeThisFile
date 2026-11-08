import { createContext, useContext, useEffect, useState } from 'react'
import { LANGUAGES, STRINGS } from './strings.js'

// The interface language (English or Hebrew), chosen by the user. It is a display
// preference, not a secret, so it is remembered in localStorage across visits.
const STORAGE_KEY = 'ui-language'

function initialLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved in LANGUAGES) return saved
  } catch {
    // storage blocked: fall back to the browser's language
  }
  return navigator.language?.startsWith('he') ? 'he' : 'en'
}

export function useLanguageSetting() {
  const [language, setLanguageState] = useState(initialLanguage)

  // Hebrew turns the whole page right-to-left; layouts use start/end so they mirror.
  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = LANGUAGES[language].dir
  }, [language])

  function setLanguage(next) {
    setLanguageState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // storage blocked: the choice lasts until the page is closed
    }
  }

  return [language, setLanguage]
}

export const LanguageContext = createContext({ language: 'en', setLanguage: () => {} })

// The texts for the chosen language: const t = useT(); t.send, t.stepOf(2, 5)
export function useT() {
  return STRINGS[useContext(LanguageContext).language]
}

export function useLanguage() {
  return useContext(LanguageContext)
}
