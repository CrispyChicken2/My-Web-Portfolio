import { useCallback, useEffect, useReducer, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useLang } from '../i18n'
import { interfaceStrings } from '../data/interface'
import { initialWindows, windowsReducer } from './windows'
import Window from './Window'
import Taskbar from './Taskbar'
import StartMenu from './StartMenu'
import Wallpaper from './Wallpaper'
import Avatar from './Avatar'
import Browser, { BrowserTabs } from './apps/Browser'
import Terminal, { TerminalTabs } from './apps/Terminal'
import RecycleBin from './apps/RecycleBin'
import { AppIcon, StartLogo } from './glyphs'

// The Screen: the desktop that runs on the Room's monitor, dressed as a dark
// Windows 11 desktop. It powers on when the Room says so — the boot logo,
// the sign-in, the desktop — and opens the Portfolio by itself. From then on
// it is an ordinary desktop: icons, windows, a taskbar, a start menu.
//
// Opened on its own (screen.html straight in a browser) it powers itself on.

const ICONS = [
  { label: 'portfolio', app: 'portfolio' },
  { label: 'terminal', app: 'terminal' },
  { label: 'contact', app: 'portfolio', props: { page: 'contact' } },
  { label: 'recycle', app: 'recycle' },
]

const inRoom = window.parent !== window
const tell = (data) => inRoom && window.parent.postMessage(data, window.location.origin)

export default function Screen() {
  const { lang } = useLang()
  const ui = interfaceStrings[lang].screen
  const reduce = useReducedMotion()
  const [power, setPower] = useState(inRoom ? 'off' : 'boot') // off → boot → login → on
  const [muted, setMuted] = useState(false)
  const [selected, setSelected] = useState(null)
  const [startOpen, setStartOpen] = useState(false)
  const [state, dispatch] = useReducer(windowsReducer, initialWindows)

  // Messages from the Room.
  useEffect(() => {
    const onMessage = (event) => {
      if (event.origin !== window.location.origin) return
      const { type } = event.data ?? {}
      if (type === 'screen:power' && event.data.on) setPower((p) => (p === 'off' ? 'boot' : p))
      if (type === 'screen:audio') setMuted(Boolean(event.data.muted))
    }
    window.addEventListener('message', onMessage)
    tell({ type: 'screen:hello' })
    return () => window.removeEventListener('message', onMessage)
  }, [])

  // Boot, then sign in, then the desktop with the Portfolio open.
  useEffect(() => {
    if (power === 'boot') {
      const id = setTimeout(() => setPower('login'), reduce ? 150 : 2400)
      return () => clearTimeout(id)
    }
    if (power === 'login') {
      const id = setTimeout(() => {
        setPower('on')
        tell({ type: 'screen:booted' })
        dispatch({ type: 'open', app: 'portfolio' })
      }, reduce ? 150 : 1700)
      return () => clearTimeout(id)
    }
    return undefined
  }, [power, reduce])

  const openApp = useCallback((app, props) => dispatch({ type: 'open', app, props }), [])
  const closeStart = useCallback(() => setStartOpen(false), [])
  const restart = useCallback(() => {
    state.windows.forEach((w) => dispatch({ type: 'close', id: w.id }))
    setPower('boot')
  }, [state.windows])

  return (
    <div className="os" data-power={power}>
      <AnimatePresence>
        {power === 'boot' && (
          <motion.div
            key="boot"
            className="os-boot"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.35 } }}
          >
            <StartLogo size={92} />
            <div className="os-spinner" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((i) => (
                <span key={i} style={{ animationDelay: `${i * 0.11}s` }} />
              ))}
            </div>
          </motion.div>
        )}

        {power === 'login' && (
          <motion.div
            key="login"
            className="os-login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.45 } }}
          >
            <Wallpaper blur />
            <div className="os-login-card">
              <Avatar size={150} />
              <LoginName />
              <p className="os-login-welcome">
                <span className="os-spinner os-spinner-small" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <span key={i} style={{ animationDelay: `${i * 0.11}s` }} />
                  ))}
                </span>
                {ui.login.welcome}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {power === 'on' && (
        <motion.div
          className="os-desktop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          onPointerDown={(event) => {
            if (event.target.closest('.os-icons, .os-window, .os-taskbar, .os-startmenu')) return
            setSelected(null)
          }}
        >
          <Wallpaper />

          <div className="os-icons" role="list">
            {ICONS.map((icon, index) => (
              <button
                key={icon.label}
                type="button"
                role="listitem"
                className="os-icon"
                aria-pressed={selected === index}
                onClick={() => setSelected(index)}
                onDoubleClick={() => openApp(icon.app, icon.props)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') openApp(icon.app, icon.props)
                }}
              >
                <AppIcon app={icon.label} size={44} />
                <span>{ui.apps[icon.label]}</span>
              </button>
            ))}
          </div>

          <AnimatePresence>
            {state.windows.map((w) => {
              const focused = state.focused === w.id
              const title = w.app === 'portfolio' ? ui.apps.portfolio : ui.apps[w.app]
              const bar =
                w.app === 'portfolio' ? <BrowserTabs /> : w.app === 'terminal' ? <TerminalTabs /> : undefined
              return (
                <Window key={w.id} frame={w} focused={focused} title={title} strings={ui.window} dispatch={dispatch} bar={bar}>
                  {w.app === 'portfolio' && <Browser page={w.props.page} />}
                  {w.app === 'terminal' && <Terminal focused={focused} openApp={openApp} />}
                  {w.app === 'recycle' && <RecycleBin ui={ui} />}
                </Window>
              )
            })}
          </AnimatePresence>

          <AnimatePresence>
            {startOpen && <StartMenu ui={ui} openApp={openApp} onClose={closeStart} onRestart={restart} />}
          </AnimatePresence>

          <Taskbar
            ui={ui}
            windows={state.windows}
            focused={state.focused}
            dispatch={dispatch}
            openApp={openApp}
            startOpen={startOpen}
            onStart={() => setStartOpen((open) => !open)}
            muted={muted}
            onMute={() => tell({ type: 'screen:mute' })}
            showSound={inRoom}
          />
        </motion.div>
      )}
    </div>
  )
}

function LoginName() {
  const { t } = useLang()
  return <h1 className="os-login-name">{t.profile.name}</h1>
}
