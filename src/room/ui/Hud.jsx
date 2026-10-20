import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLang } from '../../i18n'
import LanguageToggle from './LanguageToggle'

// The overlay on the Room: who this is, what they do, the time where the
// Visitor is, and the three controls — sound, language, plain version. It
// types itself out on the Room's keyboard, then gets out of the way while
// the camera is at the monitor.

// Types `text` once `active` is true, calling `onCharacter` per character.
function useTyped(text, active, onCharacter, onDone) {
  const [shown, setShown] = useState('')
  const callbacks = useRef({ onCharacter, onDone })
  callbacks.current = { onCharacter, onDone }

  useEffect(() => {
    if (!active) return undefined
    let index = 0
    let timer
    const step = () => {
      index += 1
      setShown(text.slice(0, index))
      callbacks.current.onCharacter?.(text[index - 1])
      if (index < text.length) timer = setTimeout(step, 45 + Math.random() * 55)
      else callbacks.current.onDone?.()
    }
    timer = setTimeout(step, 60)
    return () => clearTimeout(timer)
  }, [active, text])

  return active ? shown : ''
}

function useClock(lang) {
  const format = () =>
    new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date())
  const [time, setTime] = useState(format)
  useEffect(() => {
    const id = setInterval(() => setTime(format()), 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])
  return time
}

export default function Hud({ ui, view, muted, onMute, onType }) {
  const { t, lang } = useLang()
  const [name, role] = t.meta.title.split(' — ')
  const time = useClock(lang)
  const [step, setStep] = useState(0)
  const [helped, setHelped] = useState(false)
  const touch = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches

  const typedName = useTyped(name, step >= 0, onType, () => setStep(1))
  const typedRole = useTyped(role ?? '', step >= 1, onType, () => setStep(2))
  // The clock types its first reading, then simply keeps time.
  const [clockTyped, setClockTyped] = useState(false)
  const [firstReading] = useState(time)
  const typedTime = useTyped(firstReading, step >= 2 && !clockTyped, onType, () => {
    setClockTyped(true)
    setStep(3)
  })

  useEffect(() => {
    if (view === 'desk' || view === 'monitor') setHelped(true)
  }, [view])

  const help = touch ? ui.hud.helpTouch : ui.hud.help
  const typedHelp = useTyped(help, step >= 3 && !helped, onType)
  // At the desk and at the monitor, the name and role step aside so they do
  // not sit over the Screen. The clock and the three controls — sound,
  // language, plain version — stay, whatever the camera is doing.
  const overScreen = view === 'monitor' || view === 'desk'

  return (
    <div className="room-hud">
      <div className="room-hud-stack font-mono" data-ui>
        <AnimatePresence initial={false}>
          {typedName && !overScreen && (
            <motion.p
              key="name"
              className="room-tag room-tag-strong"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6, transition: { duration: 0.25 } }}
            >
              {typedName}
            </motion.p>
          )}
          {typedRole && !overScreen && (
            <motion.p
              key="role"
              className="room-tag"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6, transition: { duration: 0.25 } }}
            >
              {typedRole}
            </motion.p>
          )}
        </AnimatePresence>
        {(typedTime || clockTyped) && (
          <div className="room-hud-row">
            <p className="room-tag" aria-label={time}>
              {clockTyped ? time : typedTime}
            </p>
            {step >= 3 && (
              <>
                <motion.button
                  type="button"
                  className="room-tag room-icon-button"
                  onClick={onMute}
                  aria-label={muted ? ui.hud.unmute : ui.hud.mute}
                  aria-pressed={muted}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <SoundIcon muted={muted} />
                </motion.button>
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
                  <LanguageToggle label={ui.hud.language} className="room-tag" />
                </motion.div>
                <motion.a
                  className="room-tag room-link"
                  href="/classic.html"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.24 }}
                >
                  {ui.hud.plain}
                </motion.a>
              </>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {typedHelp && !helped && (
          <motion.p
            className="room-help font-mono"
            exit={{ opacity: 0, y: 10, transition: { duration: 0.4 } }}
          >
            {typedHelp}
            <span className="room-caret" aria-hidden="true" />
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

function SoundIcon({ muted }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 5 6 9H3v6h3l5 4V5z" />
      {muted ? (
        <>
          <path d="m17 9 5 6" />
          <path d="m22 9-5 6" />
        </>
      ) : (
        <>
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          <path d="M18.4 5.6a9 9 0 0 1 0 12.8" />
        </>
      )}
    </svg>
  )
}
