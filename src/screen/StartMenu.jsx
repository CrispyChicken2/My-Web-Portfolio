import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useLang } from '../i18n'
import { social } from '../data/content'
import { AppIcon, Glyph } from './glyphs'
import Avatar from './Avatar'

// The start menu: pinned apps, and — under Recommended — the Projects, each
// one opening the Portfolio at its page. The footer carries the account and
// the power button, which restarts the Screen.

export default function StartMenu({ ui, openApp, onClose, onRestart }) {
  const { t } = useLang()
  const panel = useRef(null)

  useEffect(() => {
    const close = (event) => {
      if (panel.current?.contains(event.target)) return
      if (event.target.closest?.('[data-start-toggle]')) return
      onClose()
    }
    const escape = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('pointerdown', close)
    window.addEventListener('keydown', escape)
    return () => {
      window.removeEventListener('pointerdown', close)
      window.removeEventListener('keydown', escape)
    }
  }, [onClose])

  const launch = (action) => () => {
    action()
    onClose()
  }

  const pinned = [
    ['portfolio', () => openApp('portfolio')],
    ['terminal', () => openApp('terminal')],
    ['contact', () => openApp('portfolio', { page: 'contact' })],
    ['recycle', () => openApp('recycle')],
    ['github', () => window.open(social.github, '_blank', 'noopener,noreferrer')],
    ['linkedin', () => window.open(social.linkedin, '_blank', 'noopener,noreferrer')],
  ]

  return (
    <motion.div
      ref={panel}
      className="os-startmenu"
      role="dialog"
      aria-label={ui.taskbar.start}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 18, transition: { duration: 0.14 } }}
      transition={{ type: 'spring', stiffness: 520, damping: 38 }}
    >
      <div className="os-startmenu-search">
        <Glyph kind="search" size={15} />
        <span>{ui.start.search}</span>
      </div>

      <section className="os-startmenu-section">
        <h2>{ui.start.pinned}</h2>
        <ul className="os-pinned">
          {pinned.map(([app, action]) => (
            <li key={app}>
              <button type="button" onClick={launch(action)}>
                <AppIcon app={app} size={34} />
                <span>{ui.apps[app]}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="os-startmenu-section">
        <h2>{ui.start.recommended}</h2>
        <ul className="os-recommended">
          {t.projects.items.map((project) => (
            <li key={project.title}>
              <button type="button" onClick={launch(() => openApp('portfolio', { page: 'projects' }))}>
                <AppIcon app="document" size={30} />
                <span>
                  <strong>{project.title}</strong>
                  <small>{project.category}</small>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <footer className="os-startmenu-foot">
        <div className="os-account">
          <Avatar size={30} />
          <span>{t.profile.name}</span>
        </div>
        <button type="button" className="os-power" aria-label={ui.start.restart} title={ui.start.restart} onClick={launch(onRestart)}>
          <Glyph kind="power" size={17} />
        </button>
      </footer>
    </motion.div>
  )
}
