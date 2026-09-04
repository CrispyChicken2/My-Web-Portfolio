import { Component, useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import FlatBackdrop from './FlatBackdrop'
import { useField } from '../field/FieldContext'
import { createFieldRenderer } from '../field/renderer'
import { readPalette } from '../field/palette'
import { readTier, sameTier } from '../field/tier'
import { approach, pointerToField, scrollVelocity, settle } from '../motion/params'

// If the surface cannot be built, or is lost mid-session, the designed flat
// Backdrop takes its place and the page stays complete.
class GLBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? <FlatBackdrop /> : this.props.children
  }
}

function FieldSurface() {
  const canvasRef = useRef(null)
  const [failed, setFailed] = useState(false)
  const reduce = useReducedMotion()
  const { setLive, bus } = useField()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    let renderer
    try {
      renderer = createFieldRenderer(canvas, { palette: readPalette() })
    } catch {
      setFailed(true)
      return undefined
    }

    let tier = readTier()
    let raf = 0
    let disposed = false
    let last = performance.now()
    const started = last

    // Smoothed Visitor input. Targets are set by the listeners; the loop eases
    // the live values toward them, which is what makes the Field follow the
    // cursor rather than snap to it.
    const target = { x: 0, y: 0 }
    const pointer = { x: 0, y: 0 }
    let velocity = 0
    let velocityTarget = 0
    let lastScrollY = window.scrollY
    let lastScrollAt = 0

    const state = () => ({
      time: reduce ? 12 : (performance.now() - started) / 1000,
      pointer: reduce ? { x: 0, y: 0 } : pointer,
      pointerAmount: !reduce && tier.pointer ? 1 : 0,
      velocity: reduce ? 0 : velocity,
      nav: bus.navRect,
    })

    let pointerBound = false
    const syncPointerListener = () => {
      const wanted = !reduce && tier.pointer
      if (wanted === pointerBound) return
      if (wanted) window.addEventListener('pointermove', onPointerMove, { passive: true })
      else window.removeEventListener('pointermove', onPointerMove)
      pointerBound = wanted
    }

    const applyTier = () => {
      const next = readTier()
      if (!sameTier(tier, next)) {
        tier = next
        renderer.setPoints(tier.points)
        if (!tier.pointer) {
          target.x = 0
          target.y = 0
        }
        syncPointerListener()
      }
      renderer.resize(window.innerWidth, window.innerHeight, tier.pixelScale)
    }

    // A frame that throws is a surface that has failed. React's error boundary
    // cannot see it — a rAF callback runs outside the render and commit
    // phases — so the fallback has to be triggered here, or the Backdrop would
    // simply stop with no flat Backdrop taking its place.
    const draw = () => {
      if (disposed) return false
      try {
        renderer.render(state())
        return true
      } catch {
        disposed = true
        setFailed(true)
        return false
      }
    }

    const renderOnce = () => {
      draw()
    }

    const frame = (now) => {
      const dt = Math.min(now - last, 64)
      last = now
      pointer.x = approach(pointer.x, target.x, dt, 180)
      pointer.y = approach(pointer.y, target.y, dt, 180)
      // No scroll event for a moment means the page has stopped: settle.
      velocity =
        now - lastScrollAt > 90
          ? settle(velocity, dt)
          : approach(velocity, velocityTarget, dt, 90)
      if (!draw()) return
      raf = requestAnimationFrame(frame)
    }

    const onPointerMove = (event) => {
      if (!tier.pointer) return
      const next = pointerToField(
        event.clientX,
        event.clientY,
        window.innerWidth,
        window.innerHeight,
      )
      target.x = next.x
      target.y = next.y
    }

    const onScroll = () => {
      const now = performance.now()
      const delta = window.scrollY - lastScrollY
      lastScrollY = window.scrollY
      // The first event of a burst has no meaningful frame time behind it;
      // bounding it keeps one stale timestamp from reading as a flick.
      velocityTarget = scrollVelocity(delta, Math.min(Math.max(now - lastScrollAt, 1), 200))
      lastScrollAt = now
    }

    const onResize = () => {
      applyTier()
      if (reduce) renderOnce()
    }

    const onLost = (event) => {
      event.preventDefault()
      setFailed(true)
    }

    canvas.addEventListener('webglcontextlost', onLost)
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)

    applyTier()
    bus.requestRender = renderOnce

    if (reduce) {
      // A completely still page: one frame, redrawn only when the geometry
      // it depends on changes.
      renderOnce()
    } else {
      window.addEventListener('scroll', onScroll, { passive: true })
      // No pointer listener at all on touch — the work is never performed.
      syncPointerListener()
      raf = requestAnimationFrame(frame)
    }

    setLive(true)

    return () => {
      disposed = true
      setLive(false)
      bus.requestRender = () => {}
      cancelAnimationFrame(raf)
      canvas.removeEventListener('webglcontextlost', onLost)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointermove', onPointerMove)
      renderer.dispose()
    }
  }, [reduce, setLive, bus])

  if (failed) return <FlatBackdrop />

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      style={{ background: 'var(--bg)' }}
    />
  )
}

export default function Field() {
  return (
    <GLBoundary>
      <FieldSurface />
    </GLBoundary>
  )
}
