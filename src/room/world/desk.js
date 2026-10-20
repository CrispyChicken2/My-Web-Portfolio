import * as THREE from 'three'
import { palette } from '../palette'
import { noiseTexture, oakTexture } from '../textures'
import { emissive, group, place, rbox, roundedPlate, standard } from './kit'
import { WALL_Z } from './room'

// A standing desk: a solid oak top on a black steel frame with two lifting
// columns, a felt mat, and an LED strip along its back edge that washes the
// wall behind it in ice-cyan.

export const DESK = { width: 160, depth: 76, top: 75, thickness: 3.2 }

export function buildDesk() {
  const { width, depth, top, thickness } = DESK
  const steel = standard(palette.steel, { roughness: 0.38, metalness: 0.65 })

  const oak = oakTexture()
  const slab = place(
    rbox(width, thickness, depth, 1.1, 4),
    standard('#ffffff', { map: oak, roughness: 0.5, metalness: 0 }),
    { at: [0, top - thickness / 2, 0], name: 'desk-top' },
  )

  // The frame: a foot and a two-stage column at each end, a crossbar under
  // the top, and a control pad under the front-right edge.
  const frame = []
  for (const side of [-1, 1]) {
    const x = side * (width / 2 - 14)
    frame.push(place(rbox(8, 3.2, 70, 1.2), steel, { at: [x, 1.8, 0] }))
    frame.push(place(rbox(9, 1, 3, 0.4), steel, { at: [x, 0.5, 33] }))
    frame.push(place(rbox(9, 1, 3, 0.4), steel, { at: [x, 0.5, -33] }))
    frame.push(place(rbox(8.4, 34, 6.4, 0.8), steel, { at: [x, 20, 0] }))
    frame.push(place(rbox(7, 36, 5.2, 0.7), steel, { at: [x, 52, 0] }))
    frame.push(place(rbox(6, 3, depth - 10, 0.8), steel, { at: [x, top - thickness - 1.5, 0] }))
  }
  frame.push(place(rbox(width - 30, 4, 4, 0.8), steel, { at: [0, top - thickness - 2.2, -12] }))
  const pad = place(rbox(12, 1.4, 4, 0.6), standard('#0f1013', { roughness: 0.3 }), {
    at: [width / 2 - 26, top - thickness - 0.8, depth / 2 - 4],
  })
  const padLight = place(new THREE.PlaneGeometry(1.4, 0.5), emissive(palette.ice, 3), {
    at: [width / 2 - 22, top - thickness - 0.8, depth / 2 - 1.99],
    cast: false,
  })

  // A cable tray under the back edge, with the bundle of cables it carries.
  const tray = place(rbox(90, 7, 10, 0.4), steel, { at: [6, top - thickness - 7, -26] })

  // The mat.
  const felt = noiseTexture({ seed: 31, contrast: 0.8, repeat: [8, 4] })
  const mat = place(
    roundedPlate(92, 40, 0.35, 3, 0.1),
    standard(palette.felt, { roughness: 0.95, bumpMap: felt, bumpScale: 0.4 }),
    { at: [-6, top, 14], name: 'desk-mat' },
  )

  // The bias light: a strip under the back edge of the top, facing the wall.
  const strip = place(rbox(140, 0.6, 1.2, 0.2), emissive(palette.ice, 5), {
    at: [0, top - thickness - 0.4, -depth / 2 + 2],
    cast: false,
    receive: false,
  })

  return group([slab, ...frame, pad, padLight, tray, mat, strip, wallWash()], { name: 'desk' })
}

// The light the strip throws up the wall, painted on: a soft band that is
// brightest at the desk's edge and gone a metre up. A real area light adds
// the shading (lighting.js); this carries the colour the eye expects.
function wallWash() {
  const element = document.createElement('canvas')
  element.width = 256
  element.height = 256
  const ctx = element.getContext('2d')
  const vertical = ctx.createLinearGradient(0, 256, 0, 0)
  vertical.addColorStop(0, 'rgba(255, 255, 255, 0)')
  vertical.addColorStop(0.1, 'rgba(255, 255, 255, 0.85)')
  vertical.addColorStop(0.32, 'rgba(255, 255, 255, 0.4)')
  vertical.addColorStop(1, 'rgba(255, 255, 255, 0)')
  ctx.fillStyle = vertical
  ctx.fillRect(0, 0, 256, 256)
  // fade the ends, wide enough that no edge is ever seen
  ctx.globalCompositeOperation = 'destination-in'
  const horizontal = ctx.createLinearGradient(0, 0, 256, 0)
  horizontal.addColorStop(0, 'rgba(0, 0, 0, 0)')
  horizontal.addColorStop(0.36, 'rgba(0, 0, 0, 1)')
  horizontal.addColorStop(0.64, 'rgba(0, 0, 0, 1)')
  horizontal.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = horizontal
  ctx.fillRect(0, 0, 256, 256)
  const texture = new THREE.CanvasTexture(element)
  const wash = place(
    new THREE.PlaneGeometry(300, 105),
    new THREE.MeshBasicMaterial({
      color: palette.ice,
      map: texture,
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
    { at: [0, DESK.top - 10 + 105 / 2, WALL_Z + 0.25], cast: false, receive: false, name: 'wall-wash' },
  )
  return wash
}

// The cables that run from the monitor arm and the computer down into the
// tray, then off to the wall. Soft curves, so they read as cables rather
// than pipes.
export function buildCables() {
  const rubber = standard('#141518', { roughness: 0.7 })
  const curves = [
    // the monitor, down its column and into the tray
    [
      [-8, 92, -29.5],
      [-8, 80, -31],
      [-6, 70, -30],
      [2, 66, -27],
      [30, 64, -30],
      [70, 40, -42],
      [80, 4, -45],
    ],
    // the PC, out of its back and along the tray to the wall
    [
      [56, 80, -31],
      [52, 76, -35],
      [40, 67, -28],
      [10, 66, -26],
      [-20, 60, -32],
      [-60, 30, -44],
      [-70, 3, -45],
    ],
  ]
  return group(
    curves.map((points) =>
      place(
        new THREE.TubeGeometry(
          new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z))),
          80,
          0.45,
          8,
        ),
        rubber,
      ),
    ),
    { name: 'cables' },
  )
}
