import { useEffect, useState } from 'react'
import { useLang } from '../i18n'
import { AppIcon, Glyph, StartLogo } from './glyphs'

// The taskbar: the start button, search, and the apps — pinned or running —
// centred; the tray on the right with the input language (EN/FR is the
// site's language switch), the sound, and the clock.

const PINNED = ['portfolio', 'terminal', 'recycle']

function useClock(lang) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 10_000)
    return () => clearInterval(id)
  }, [])
  const locale = lang === 'fr' ? 'fr-FR' : 'en-GB'
  return {
    time: new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(now),
    date: new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(now),
  }
}

export default function Taskbar({ ui, windows, focused, dispatch, openApp, startOpen, onStart, muted, onMute, showSound }) {
  const { lang, setLang } = useLang()
  const { time, date } = useClock(lang)
  const running = new Map(windows.map((w) => [w.app, w]))
  const apps = [...PINNED, ...windows.map((w) => w.app).filter((app) => !PINNED.includes(app))]

  const press = (app) => {
    const w = running.get(app)
    if (!w) openApp(app)
    else if (focused === w.id && !w.minimized) dispatch({ type: 'minimize', id: w.id })
    else dispatch({ type: 'focus', id: w.id })
  }

  return (
    <footer className="os-taskbar">
      <div className="os-taskbar-centre">
        <button
          type="button"
          className="os-task os-start-button"
          aria-label={ui.taskbar.start}
          aria-expanded={startOpen}
          data-start-toggle
          onClick={onStart}
        >
          <StartLogo size={22} />
        </button>
        <button type="button" className="os-search" onClick={onStart} data-start-toggle>
          <Glyph kind="search" size={15} />
          <span>{ui.taskbar.search}</span>
        </button>
        {apps.map((app) => {
          const w = running.get(app)
          const state = !w ? 'idle' : focused === w.id && !w.minimized ? 'active' : 'running'
          return (
            <button
              key={app}
              type="button"
              className="os-task"
              data-state={state}
              aria-label={ui.apps[app]}
              title={ui.apps[app]}
              onClick={() => press(app)}
            >
              <AppIcon app={app} size={26} />
            </button>
          )
        })}
      </div>

      <div className="os-tray">
        <span className="os-tray-glyph" aria-hidden="true">
          <Glyph kind="chevronUp" size={14} />
        </span>
        <button
          type="button"
          className="os-tray-button os-ime"
          aria-label={ui.taskbar.language}
          title={ui.taskbar.language}
          onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
        >
          <span>{lang === 'fr' ? 'FRA' : 'ENG'}</span>
          <span>{lang === 'fr' ? 'FR' : 'UK'}</span>
        </button>
        <button
          type="button"
          className="os-tray-button os-tray-cluster"
          onClick={showSound ? onMute : undefined}
          aria-label={muted ? ui.taskbar.soundOff : ui.taskbar.soundOn}
          title={muted ? ui.taskbar.soundOff : ui.taskbar.soundOn}
        >
          <Glyph kind="wifi" size={16} />
          <Glyph kind={muted ? 'muted' : 'volume'} size={16} />
        </button>
        <div className="os-clock">
          <span>{time}</span>
          <span>{date}</span>
        </div>
        <span className="os-tray-glyph" aria-hidden="true">
          <Glyph kind="bell" size={15} />
        </span>
      </div>
    </footer>
  )
}
