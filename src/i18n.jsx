import { createContext, useContext, useEffect, useState } from 'react'
import { locales } from './data/content'

// Tiny i18n: `useLang()` returns the active locale dictionary plus the
// switcher. First visit follows the browser language; the choice is then
// remembered in localStorage. <html lang> and the tab title follow along.

const STORAGE_KEY = 'lang'

const LanguageContext = createContext(null)

function initialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'en' || saved === 'fr') return saved
  } catch {
    /* storage unavailable */
  }
  return (navigator.language || 'en').toLowerCase().startsWith('fr') ? 'fr' : 'en'
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(initialLang)

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = locales[lang].meta.title
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      /* storage unavailable */
    }
  }, [lang])

  // The Room and the Screen inside its monitor are two documents. A switch
  // made in either is written to storage, and storage tells the other one.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === STORAGE_KEY && (event.newValue === 'en' || event.newValue === 'fr')) {
        setLang(event.newValue)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: locales[lang] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  return useContext(LanguageContext)
}
