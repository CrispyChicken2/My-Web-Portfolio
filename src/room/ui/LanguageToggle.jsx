import { useLang } from '../../i18n'

// EN | FR, the same switch as the plain version's nav. The choice is
// remembered, and the Screen inside the monitor follows it.
export default function LanguageToggle({ label, className = '' }) {
  const { lang, setLang } = useLang()
  return (
    <div role="group" aria-label={label} className={`room-lang ${className}`}>
      {['en', 'fr'].map((code) => (
        <button
          key={code}
          type="button"
          aria-pressed={lang === code}
          onClick={() => setLang(code)}
          className="room-lang-option"
        >
          {code}
        </button>
      ))}
    </div>
  )
}
