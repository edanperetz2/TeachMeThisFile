import { useState } from 'react'

// The key lives in sessionStorage only: it is cleared when the tab closes,
// and it is only ever sent to this app's own /api, in a request header.
const STORAGE_KEY = 'gemini-api-key'

function readStoredKey() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) ?? ''
  } catch {
    return '' // storage blocked (e.g. strict privacy settings): start empty
  }
}

export function useApiKey() {
  const [apiKey, setApiKeyState] = useState(readStoredKey)

  function setApiKey(value) {
    const key = value.trim()
    setApiKeyState(key)
    try {
      if (key) sessionStorage.setItem(STORAGE_KEY, key)
      else sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // Storage blocked: the key still works for this page, it just won't survive a reload.
    }
  }

  return [apiKey, setApiKey]
}
