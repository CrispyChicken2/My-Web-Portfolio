import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, useReducedMotion } from 'framer-motion'
import { useLang } from '../../i18n'
import { interfaceStrings } from '../../data/interface'
import Loader from './Loader'
import Hud from './Hud'

// The parts the loader lists, in the order the Room builds them.
const PARTS = ['engine', 'room', 'desk', 'monitor', 'keyboard', 'computer', 'chair', 'props', 'lighting', 'screen', 'shaders']

// A tiny emitter: the Room speaks, the overlay listens.
function createEvents() {
  const listeners = new Map()
  return {
    on(name, fn) {
      if (!listeners.has(name)) listeners.set(name, new Set())
      listeners.get(name).add(fn)
      return () => listeners.get(name).delete(fn)
    },
    emit(name, data) {
      listeners.get(name)?.forEach((fn) => fn(data))
    },
  }
}

// The Room is built once per page, whatever React does with effects in
// development.
let building = null

export default function RoomApp({ autostart = false }) {
  const { lang } = useLang()
  const ui = interfaceStrings[lang]
  const reducedMotion = useReducedMotion()
  const mount = useRef(null)
  const events = useMemo(createEvents, [])
  const [experience, setExperience] = useState(null)
  const [loaded, setLoaded] = useState([])
  const [phase, setPhase] = useState('loading') // loading → ready → started, or failed
  const [view, setView] = useState('loading')
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    if (building || mount.current.hasChildNodes()) return
    building = import('../Experience')
      .then(async ({ Experience }) => {
        const room = new Experience({ mount: mount.current, events, reducedMotion: Boolean(reducedMotion) })
        setMuted(room.muted)
        await room.build((part) => setLoaded((list) => (list.includes(part) ? list : [...list, part])))
        setExperience(room)
        setPhase('ready')
        // In development, the Room is reachable from the console.
        if (import.meta.env.DEV) window.__room = room
      })
      .catch((error) => {
        console.error(error)
        setPhase('failed')
      })
  }, [events, reducedMotion])

  useEffect(() => {
    const off = [
      events.on('view', setView),
      events.on('muted', setMuted),
      events.on('lost', () => setPhase('failed')),
    ]
    return () => off.forEach((fn) => fn())
  }, [events])

  const start = () => {
    if (!experience) return
    experience.start()
    setPhase('started')
  }

  useEffect(() => {
    if (autostart && phase === 'ready') start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autostart, phase])

  return (
    <div className="room">
      <div ref={mount} className="room-stage" aria-hidden={phase !== 'started'} />
      <AnimatePresence>
        {phase !== 'started' && (
          <Loader key="loader" ui={ui} parts={PARTS} loaded={loaded} phase={phase} onStart={start} />
        )}
      </AnimatePresence>
      {phase === 'started' && (
        <Hud
          ui={ui}
          view={view}
          muted={muted}
          onMute={() => experience.setMuted(!muted)}
          onType={(character) => experience.type(character)}
        />
      )}
    </div>
  )
}
