import * as THREE from 'three'
import { palette } from '../palette'
import { DESK } from './desk'
import { DEG, emissive, group, place, rbox, roundedPlate, standard } from './kit'

// A 34-inch 21:9 ultrawide with hairline bezels on a matte black stand — a
// height-adjustable column on a wide, low V-shaped foot — and a light bar
// clipped to its top edge. The screen itself is not drawn here: the Screen is
// a real web page laid over the panel (see ../screen.js), and this file only
// marks where it goes.

// The visible area of a 34-inch 3440 × 1440 panel, in centimetres.
export const SCREEN = { width: 79.7, height: 33.36 }

const BEZEL = 0.65
const CHIN = 1.6
const TILT = -4 * DEG
export const MONITOR_X = -8
const CENTRE_Y = 104.5

export function buildMonitor() {
  const aluminium = standard(palette.aluminium, { roughness: 0.32, metalness: 0.85 })
  const shell = standard(palette.bezel, { roughness: 0.42, metalness: 0.2 })
  // The stand: matte, slightly textured black, the finish monitor stands
  // are sold in.
  const matte = standard('#141518', { roughness: 0.62, metalness: 0.35 })

  // The panel, tilted back on its hinge. Everything that tilts with it is a
  // child of `panel`; the hinge sits behind the panel's centre.
  const panel = new THREE.Group()
  panel.rotation.x = TILT

  const outerW = SCREEN.width + BEZEL * 2
  const outerH = SCREEN.height + BEZEL + CHIN
  const chinOffset = (CHIN - BEZEL) / 2

  const face = place(rbox(outerW, outerH, 0.9, 0.35), shell, { at: [0, -chinOffset, 2.6] })
  // The glass, black and glossy: what shows when the Screen is off.
  const glass = place(
    new THREE.PlaneGeometry(SCREEN.width, SCREEN.height),
    new THREE.MeshPhysicalMaterial({
      color: '#030405',
      roughness: 0.12,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
    }),
    { at: [0, 0, 3.06], cast: false, name: 'screen-glass' },
  )
  // The back: a shallow tray behind the whole panel, a deeper hump for the
  // electronics and the mount, and a thin slot of vents across the top.
  const back = place(rbox(outerW - 3, outerH - 3, 2.2, 1.2), shell, { at: [0, -chinOffset, 1.2] })
  const hump = place(rbox(44, 22, 3.4, 2.2), shell, { at: [0, -2.5, -1.2] })
  const vents = []
  for (let i = 0; i < 18; i += 1) {
    vents.push(
      place(rbox(1.2, 0.3, 0.2, 0.1), standard('#050506', { roughness: 0.9 }), {
        at: [-15 + i * 1.75, 8.1, -2.95],
        cast: false,
      }),
    )
  }
  const chinLine = place(rbox(outerW - 1.4, 0.08, 0.06, 0.03), standard('#2a2c31', { roughness: 0.3, metalness: 0.8 }), {
    at: [0, -SCREEN.height / 2 - CHIN + 0.35, 3.08],
    cast: false,
  })
  const led = place(new THREE.CircleGeometry(0.15, 16), emissive(palette.ice, 4), {
    at: [outerW / 2 - 2.6, -SCREEN.height / 2 - CHIN + 0.75, 3.07],
    cast: false,
  })
  const joystick = place(new THREE.CylinderGeometry(0.35, 0.35, 0.6, 16), shell, {
    at: [0, -SCREEN.height / 2 - CHIN + 0.2, 2.2],
  })

  // The anchor the Screen and the camera read their position from: the
  // centre of the glass, facing out of it.
  const anchor = new THREE.Object3D()
  anchor.name = 'screen-anchor'
  anchor.position.set(0, 0, 3.08)

  // The light bar: a slim cylinder on a clip that hooks over the top edge,
  // its LED face turned down and forward onto the desk.
  const barY = SCREEN.height / 2 + BEZEL + 1.9
  const barLength = 52
  const bar = place(new THREE.CylinderGeometry(1.25, 1.25, barLength, 32), aluminium, {
    at: [0, barY, 1.3],
    rotate: [0, 0, 90 * DEG],
  })
  const barCaps = [-barLength / 2 - 0.2, barLength / 2 + 0.2].map((x) =>
    place(new THREE.CylinderGeometry(1.32, 1.32, 0.5, 32), shell, {
      at: [x, barY, 1.3],
      rotate: [0, 0, 90 * DEG],
    }),
  )
  const barFace = place(new THREE.PlaneGeometry(barLength - 4, 0.9), emissive(palette.warm, 1.1), {
    at: [0, barY - 1.2, 1.9],
    rotate: [70 * DEG, 0, 0],
    cast: false,
    receive: false,
  })
  const clip = place(rbox(5, 4.2, 4.4, 0.6), shell, { at: [0, barY - 1.8, 0.4] })
  const counterweight = place(rbox(5, 3, 2, 0.6), shell, { at: [0, barY - 4.4, -1.6] })

  panel.add(face, glass, back, hump, ...vents, chinLine, led, joystick, anchor, bar, ...barCaps, barFace, clip, counterweight)

  // The stand. A column with a sliding carriage the panel hangs from, a
  // cable loop cut through it, and a wide V-shaped foot: two splayed arms
  // meeting at the column, low and flat on the desk.
  const columnHeight = CENTRE_Y - DESK.top + 2
  const column = place(rbox(7.5, columnHeight, 3.6, 1.2), matte, {
    at: [0, DESK.top + columnHeight / 2, -27],
    rotate: [-3 * DEG, 0, 0],
  })
  const carriage = place(rbox(10, 9, 2.4, 1), matte, { at: [0, CENTRE_Y - 1, -24.4] })
  const cableLoop = place(new THREE.TorusGeometry(1.5, 0.45, 10, 28), shell, {
    at: [0, DESK.top + 9, -28.9],
    scale: [1, 1.6, 1],
  })
  const collar = place(rbox(9, 3, 7, 1.2), matte, { at: [0, DESK.top + 1.7, -26.5] })
  const foot = []
  for (const side of [-1, 1]) {
    const arm = place(roundedPlate(30, 6.5, 1.4, 3, 0.3), matte, {
      at: [side * 12.5, DESK.top, -20],
      rotate: [0, side * -32 * DEG, 0],
    })
    foot.push(arm)
    foot.push(
      place(rbox(4, 0.3, 3, 0.15), standard('#0b0b0d', { roughness: 0.95 }), {
        at: [side * 24, DESK.top + 0.1, -13.2],
        rotate: [0, side * -32 * DEG, 0],
        cast: false,
      }),
    )
  }

  const mount = new THREE.Group()
  mount.position.set(0, CENTRE_Y, -21)
  mount.add(panel)

  // The light the bar throws: a broad warm cone onto the keyboard and mat.
  const lamp = new THREE.SpotLight(palette.warm, 5200, 170, 62 * DEG, 0.85, 2)
  lamp.position.set(0, barY - 1, 3)
  panel.add(lamp)
  lamp.target.position.set(0, -58, 52)
  panel.add(lamp.target)
  lamp.castShadow = true
  lamp.shadow.mapSize.set(2048, 2048)
  lamp.shadow.bias = -0.0004
  lamp.shadow.normalBias = 0.02
  lamp.shadow.radius = 6
  lamp.shadow.camera.near = 4
  lamp.shadow.camera.far = 140

  const monitor = group([column, carriage, cableLoop, collar, ...foot, mount], { at: [MONITOR_X, 0, 0], name: 'monitor' })
  return { monitor, anchor, lamp, glass }
}
