import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLang } from '../../i18n'
import LanguageToggle from './LanguageToggle'

// The loader reads like the workstation's own firmware coming up: a header,
// a memory count, then one line per part of the Room as it is built. When
// everything is in place the text gives way to the start card — the press
// that unlocks sound and sends the camera in.

const MEMORY_MB = 32768

function dots(label, width = 26) {
  return `${label} ${'.'.repeat(Math.max(2, width - label.length))}`
}

export default function Loader({ ui, parts, loaded, phase, onStart }) {
  const { t, lang } = useLang()
  const [memory, setMemory] = useState(0)
  const [showCard, setShowCard] = useState(false)

  useEffect(() => {
    let value = 0
    const id = setInterval(() => {
      value = Math.min(MEMORY_MB, value + 1024 + Math.floor(Math.random() * 1024))
      setMemory(value)
      if (value >= MEMORY_MB) clearInterval(id)
    }, 28)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (phase !== 'ready') return undefined
    const id = setTimeout(() => setShowCard(true), 250)
    return () => clearTimeout(id)
  }, [phase])

  const date = new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())

  return (
    <motion.div
      className="room-loader"
      data-ui
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.9, ease: [0.4, 0, 0.2, 1] } }}
    >
      <motion.div
        className="room-loader-log font-mono"
        animate={{ opacity: showCard ? 0 : 1 }}
        transition={{ duration: 0.4 }}
        aria-live="polite"
      >
        <div className="room-loader-head">
          <span className="room-loader-mark" aria-hidden="true">OH</span>
          <div>
            <p>{ui.loader.firmware}</p>
            <p className="room-dim">{ui.loader.copyright}</p>
          </div>
        </div>

        <p>
          {dots(ui.loader.memory)} {memory.toLocaleString('en-US')} MB{' '}
          {memory >= MEMORY_MB && <span className="room-ok">ok</span>}
        </p>
        <p className="room-gap">
          {ui.loader.loading} ({loaded.length}/{parts.length})
        </p>
        <ul className="room-loader-parts">
          {loaded.map((part) => (
            <li key={part}>
              {dots(ui.loader.parts[part])} <span className="room-ok">{ui.loader.done}</span>
            </li>
          ))}
        </ul>
        {phase === 'ready' && <p className="room-gap">{ui.loader.ready}</p>}
        {phase === 'failed' && (
          <div className="room-gap">
            <p>{ui.loader.failed}</p>
            <a className="lg-pill room-loader-plain" href="/classic.html">
              {ui.start.plain}
            </a>
          </div>
        )}
        {phase !== 'failed' && <span className="room-caret" aria-hidden="true" />}
      </motion.div>

      <div className="room-loader-foot font-mono">
        <span>{date}</span>
        <LanguageToggle label={ui.hud.language} />
      </div>

      <AnimatePresence>
        {showCard && (
          <motion.div
            className="room-start"
            role="dialog"
            aria-labelledby="room-start-name"
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            <h1 id="room-start-name" className="room-start-name">
              {t.profile.name}
            </h1>
            <p className="room-start-title">{ui.start.title}</p>
            <p className="room-start-body">{ui.start.body}</p>
            <p className="room-start-sound">{ui.start.sound}</p>
            <div className="room-start-actions">
              <button type="button" className="lg-cta room-button" onClick={onStart} autoFocus>
                {ui.start.start}
              </button>
              <a className="lg-pill room-button room-button-quiet" href="/classic.html">
                {ui.start.plain}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
