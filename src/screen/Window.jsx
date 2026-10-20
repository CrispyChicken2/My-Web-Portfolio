import { useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { DESKTOP } from './windows'
import { AppIcon, Glyph } from './glyphs'

// A window in the Windows 11 manner: rounded corners, a Mica surface, a
// 32-pixel title bar with the three caption buttons on the right. The
// title bar is the handle to drag it by; a double click maximises it; the
// bottom-right corner resizes it. An application may put its own content in
// the title bar (a browser's tabs) through `bar`.

export default function Window({ frame, focused, title, strings, dispatch, bar, children }) {
  const reduce = useReducedMotion()
  const drag = useRef(null)
  const { id, app, x, y, width, height, z, minimized, maximized } = frame

  const box = maximized
    ? { x: 0, y: 0, width: DESKTOP.width, height: DESKTOP.height - DESKTOP.taskbar }
    : { x, y, width, height }

  // Dragging and resizing both capture the pointer, so a fast move that
  // outruns the window does not drop it.
  const begin = (mode) => (event) => {
    if (event.button !== 0) return
    if (mode === 'move' && event.target.closest('button, input, a')) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    dispatch({ type: 'focus', id })
    drag.current = { mode, startX: event.clientX, startY: event.clientY, frame: box }
  }
  const moveTo = (event) => {
    const d = drag.current
    if (!d) return
    const dx = event.clientX - d.startX
    const dy = event.clientY - d.startY
    if (d.mode === 'move') {
      dispatch({ type: 'move', id, frame: { ...d.frame, x: d.frame.x + dx, y: d.frame.y + dy } })
    } else {
      dispatch({ type: 'resize', id, frame: { ...d.frame, width: d.frame.width + dx, height: d.frame.height + dy } })
    }
  }
  const end = () => {
    drag.current = null
  }

  return (
    <motion.section
      className="os-window"
      data-focused={focused ? '' : undefined}
      data-maximized={maximized ? '' : undefined}
      aria-label={title}
      style={{ zIndex: z, left: box.x, top: box.y, width: box.width, height: box.height }}
      initial={reduce ? false : { opacity: 0, scale: 0.94 }}
      animate={
        minimized
          ? { opacity: 0, scale: 0.86, y: 140, transitionEnd: { visibility: 'hidden' } }
          : { opacity: 1, scale: 1, y: 0, visibility: 'visible' }
      }
      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94, transition: { duration: 0.16, ease: 'easeIn' } }}
      transition={{ type: 'spring', stiffness: 520, damping: 40, mass: 0.6 }}
      onPointerDownCapture={() => dispatch({ type: 'focus', id })}
    >
      <header
        className="os-titlebar"
        onPointerDown={begin('move')}
        onPointerMove={moveTo}
        onPointerUp={end}
        onPointerCancel={end}
        onDoubleClick={(event) => {
          if (!event.target.closest('button, input, a')) dispatch({ type: 'maximize', id })
        }}
      >
        {bar ?? (
          <div className="os-titlebar-title">
            <AppIcon app={app} size={16} />
            <span>{title}</span>
          </div>
        )}
        <div className="os-captions">
          <button type="button" aria-label={strings.minimize} onClick={() => dispatch({ type: 'minimize', id })}>
            <Glyph kind="minimize" size={14} />
          </button>
          <button
            type="button"
            aria-label={maximized ? strings.restore : strings.maximize}
            onClick={() => dispatch({ type: 'maximize', id })}
          >
            <Glyph kind={maximized ? 'restore' : 'maximize'} size={13} />
          </button>
          <button type="button" className="os-caption-close" aria-label={strings.close} onClick={() => dispatch({ type: 'close', id })}>
            <Glyph kind="close" size={14} />
          </button>
        </div>
      </header>
      <div className="os-window-body">{children}</div>
      {!maximized && (
        <div
          className="os-window-grip"
          aria-hidden="true"
          onPointerDown={begin('resize')}
          onPointerMove={moveTo}
          onPointerUp={end}
          onPointerCancel={end}
        />
      )}
    </motion.section>
  )
}
