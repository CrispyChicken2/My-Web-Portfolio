import * as THREE from 'three'
import { CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js'
import { SCREEN } from './world/monitor'

// The Screen: a real web page (screen.html) running in an iframe, laid over
// the monitor's glass with a CSS 3D transform so it moves with the camera.
//
// The page is drawn on top of the WebGL canvas, not behind it. Nothing in
// the Room ever passes in front of the monitor from any Viewpoint, so the
// page needs no hole cut for it — and that leaves the canvas free to run
// its post-processing.
//
// The iframe has a fixed resolution, like a real panel: 1720 × 720, the
// ultrawide's 21:9.

export const RESOLUTION = { width: 1720, height: 720 }

export function createScreen(anchor, { onEnter, onLeave, onKey, onPointer, onButton, onMessage }) {
  const container = document.createElement('div')
  container.className = 'room-screen'
  container.style.width = `${RESOLUTION.width}px`
  container.style.height = `${RESOLUTION.height}px`

  const iframe = document.createElement('iframe')
  iframe.src = '/screen.html'
  iframe.title = 'Screen'
  iframe.width = String(RESOLUTION.width)
  iframe.height = String(RESOLUTION.height)
  iframe.setAttribute('allow', 'clipboard-write')

  // The glass: a faint sheen across the panel, never in the way of a click.
  const glare = document.createElement('div')
  glare.className = 'room-screen-glare'
  // Black until the Screen is powered on, then it fades away.
  const power = document.createElement('div')
  power.className = 'room-screen-power'

  container.append(iframe, glare, power)

  const object = new CSS3DObject(container)
  object.scale.setScalar(SCREEN.width / RESOLUTION.width)

  // Follow the anchor on the glass. The monitor does not move once built,
  // but reading it every frame costs nothing and keeps the two in step.
  const place = () => {
    anchor.updateWorldMatrix(true, false)
    anchor.matrixWorld.decompose(object.position, object.quaternion, new THREE.Vector3())
  }

  // Entering and leaving. A pointer that leaves while a button is held (a
  // window being dragged past the edge of the Screen) leaves only once the
  // button is released.
  let inside = false
  let held = false
  let leaveLater = false
  container.addEventListener('pointerenter', () => {
    inside = true
    leaveLater = false
    onEnter()
  })
  container.addEventListener('pointerleave', () => {
    inside = false
    if (held) leaveLater = true
    else onLeave()
  })
  const release = () => {
    held = false
    if (leaveLater && !inside) {
      leaveLater = false
      onLeave()
    }
  }
  window.addEventListener('pointerup', release)
  // A Visitor on a keyboard tabs into the Screen rather than pointing at
  // it: focus moving in takes the camera there too.
  container.addEventListener('focusin', () => onEnter())

  // The page is same-origin, so its events can be listened to directly.
  iframe.addEventListener('load', () => {
    const inner = iframe.contentWindow
    if (!inner) return
    inner.addEventListener('keydown', (event) => onKey(event.code, true, event.repeat))
    inner.addEventListener('keyup', (event) => onKey(event.code, false, false))
    inner.addEventListener('pointermove', (event) =>
      onPointer(event.clientX / RESOLUTION.width, event.clientY / RESOLUTION.height),
    )
    inner.addEventListener('pointerdown', () => {
      held = true
      onButton(true)
    })
    inner.addEventListener('pointerup', () => {
      onButton(false)
      release()
    })
    // A tap on a touch screen never "enters" anything: treat it as one.
    inner.addEventListener('touchstart', () => onEnter(), { passive: true })
  })

  window.addEventListener('message', (event) => {
    if (event.origin !== window.location.origin || event.source !== iframe.contentWindow) return
    onMessage(event.data ?? {})
  })

  const send = (data) => iframe.contentWindow?.postMessage(data, window.location.origin)

  return {
    object,
    container,
    iframe,
    place,
    send,
    powerOn() {
      container.classList.add('is-on')
      send({ type: 'screen:power', on: true })
    },
    get inside() {
      return inside
    },
  }
}
