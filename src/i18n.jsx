import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { locales } from './data/content'
import { refreshLiquidGlass } from './components/GlassBox'

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
  const firstRender = useRef(true)

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = locales[lang].meta.title
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      /* storage unavailable */
    }
  }, [lang])

  // The liquid-glass layers refract a frozen page snapshot — retake it once
  // the page has re-rendered in the new language.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    refreshLiquidGlass()
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: locales[lang] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  return useContext(LanguageContext)
}
