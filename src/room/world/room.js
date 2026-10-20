import * as THREE from 'three'
import { palette } from '../palette'
import { floorTexture, landscapeTexture, noiseTexture } from '../textures'
import { buildRightWall } from './rightwall'
import { DEG, group, place, rbox, standard } from './kit'

// The corner of a room the desk stands in: two walls, an oak-plank floor, a
// window on the left wall with the night outside, a floating shelf and a
// framed print on the back wall, and a rug under the chair.

export const WALL_Z = -48
export const WALL_X = -205

function windowSky() {
  const element = document.createElement('canvas')
  element.width = 256
  element.height = 512
  const ctx = element.getContext('2d')
  const gradient = ctx.createLinearGradient(0, 0, 0, 512)
  gradient.addColorStop(0, '#0b1020')
  gradient.addColorStop(0.62, '#1d2742')
  gradient.addColorStop(1, '#3a3550')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 256, 512)
  // far-off windows of the building opposite
  for (let i = 0; i < 70; i += 1) {
    const x = Math.random() * 256
    const y = 300 + Math.random() * 200
    ctx.fillStyle = `rgba(255, 214, 160, ${0.15 + Math.random() * 0.5})`
    ctx.fillRect(x, y, 3, 4)
  }
  for (let i = 0; i < 40; i += 1) {
    ctx.fillStyle = `rgba(220, 230, 255, ${Math.random() * 0.7})`
    ctx.fillRect(Math.random() * 256, Math.random() * 240, 1.4, 1.4)
  }
  const texture = new THREE.CanvasTexture(element)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function buildRoom() {
  const plaster = noiseTexture({ seed: 11, contrast: 0.35, repeat: [6, 4] })
  const wall = standard(palette.wall, { roughness: 0.92, bumpMap: plaster, bumpScale: 0.25 })
  const trim = standard(palette.wallTrim, { roughness: 0.7 })
  const floor = standard('#ffffff', { map: floorTexture(), roughness: 0.42, metalness: 0 })

  const backWall = place(new THREE.PlaneGeometry(470, 285), wall, {
    at: [27, 142.5, WALL_Z],
    cast: false,
  })
  const leftWall = place(new THREE.PlaneGeometry(360, 285), wall, {
    at: [WALL_X, 142.5, 132],
    rotate: [0, 90 * DEG, 0],
    cast: false,
  })
  const ground = place(new THREE.PlaneGeometry(470, 370), floor, {
    at: [27, 0, 137],
    rotate: [-90 * DEG, 0, 0],
    cast: false,
  })

  const skirtingBack = place(rbox(470, 9, 1.6, 0.3), trim, { at: [27, 4.5, WALL_Z + 0.8] })
  const skirtingLeft = place(rbox(1.6, 9, 360, 0.3), trim, { at: [WALL_X + 0.8, 4.5, 132] })

  // The window. The pane is lit from behind by the night itself, so it is
  // drawn without shading.
  const frameMaterial = standard('#d9d6d0', { roughness: 0.5 })
  const pane = place(
    new THREE.PlaneGeometry(118, 136),
    new THREE.MeshBasicMaterial({ map: windowSky(), toneMapped: false }),
    { at: [WALL_X + 0.4, 158, 92], rotate: [0, 90 * DEG, 0], cast: false, receive: false },
  )
  const frameParts = [
    [3, 144, 4, [WALL_X + 1.5, 158, 92 - 61]],
    [3, 144, 4, [WALL_X + 1.5, 158, 92 + 61]],
    [3, 4, 126, [WALL_X + 1.5, 158 + 70, 92]],
    [6, 5, 132, [WALL_X + 3, 158 - 70, 92]],
    [2.4, 136, 2.4, [WALL_X + 1.6, 158, 92]],
    [2.4, 2.4, 118, [WALL_X + 1.6, 172, 92]],
  ].map(([w, h, d, at]) => place(rbox(w, h, d, 0.4), frameMaterial, { at }))

  // A floating shelf, with a short row of books and two small objects.
  const shelfMaterial = standard(palette.oak, { roughness: 0.55 })
  const shelf = place(rbox(78, 3, 22, 0.6), shelfMaterial, { at: [-48, 158, WALL_Z + 11] })
  const books = []
  let x = -82
  palette.books.forEach((color, index) => {
    const height = 19 + ((index * 7) % 6)
    const thickness = 2.6 + ((index * 5) % 3) * 0.6
    books.push(
      place(rbox(thickness, height, 16, 0.25), standard(color, { roughness: 0.75 }), {
        at: [x + thickness / 2, 159.5 + height / 2, WALL_Z + 11],
      }),
    )
    x += thickness + 0.3
  })
  // The last book leans on the row: it pivots on its bottom-left edge, on
  // the shelf, and rests its left face along the side of its taller
  // neighbour.
  {
    const w = 3
    const h = 18
    const theta = 17 * DEG
    const base = x - 0.3 + h * Math.sin(theta)
    books.push(
      place(rbox(w, h, 15, 0.25), standard(palette.books[4], { roughness: 0.75 }), {
        at: [base + (w / 2) * Math.cos(theta) - (h / 2) * Math.sin(theta), 159.5 + (w / 2) * Math.sin(theta) + (h / 2) * Math.cos(theta), WALL_Z + 11],
        rotate: [0, 0, theta],
      }),
    )
  }
  const ornamentBase = place(rbox(7, 7, 7, 0.8), standard('#2c3038', { roughness: 0.35 }), {
    at: [-28, 163, WALL_Z + 10],
  })
  // the orb sits in a shallow brass cup on its block, not balanced on it
  const ornament = place(
    new THREE.SphereGeometry(4.2, 48, 24),
    standard(palette.ice, { roughness: 0.15, metalness: 0.9 }),
    { at: [-28, 170.2, WALL_Z + 10] },
  )
  const cradle = place(new THREE.TorusGeometry(2.5, 0.45, 12, 40), standard('#b89a5a', { roughness: 0.3, metalness: 1 }), {
    at: [-28, 166.8, WALL_Z + 10],
    rotate: [90 * DEG, 0, 0],
  })
  const speaker = place(rbox(10, 16, 10, 1.4), standard('#d5d1ca', { roughness: 0.8 }), {
    at: [-5, 167.5, WALL_Z + 11],
  })
  const speakerCone = place(
    new THREE.CylinderGeometry(3.2, 3.2, 0.6, 40),
    standard('#2a2c31', { roughness: 0.9 }),
    { at: [-5, 165, WALL_Z + 16.1], rotate: [90 * DEG, 0, 0] },
  )

  // The framed print: mountains at sunset, behind glass, in a slim black
  // frame with a wide white mount.
  const frame = place(rbox(86, 60, 2.6, 0.4), standard('#121318', { roughness: 0.4 }), {
    at: [66, 163, WALL_Z + 1.4],
  })
  const mount = place(new THREE.PlaneGeometry(80, 54), standard('#f1ede6', { roughness: 0.9 }), {
    at: [66, 163, WALL_Z + 2.72],
    cast: false,
  })
  const print = place(
    new THREE.PlaneGeometry(66, 42.4),
    standard('#ffffff', { map: landscapeTexture(), roughness: 0.6 }),
    { at: [66, 163, WALL_Z + 2.76], cast: false },
  )
  // the mount's bevelled inner edge, and the glass over it all
  const bevel = place(new THREE.PlaneGeometry(66.8, 43.2), standard('#ffffff', { roughness: 0.8 }), {
    at: [66, 163, WALL_Z + 2.74],
    cast: false,
  })
  const glazing = place(
    new THREE.PlaneGeometry(80, 54),
    new THREE.MeshPhysicalMaterial({ color: '#ffffff', transparent: true, opacity: 0.08, roughness: 0.02, clearcoat: 1, depthWrite: false }),
    { at: [66, 163, WALL_Z + 2.9], cast: false, receive: false },
  )

  // The rug under the chair, a dense low pile.
  const rug = place(
    new THREE.CircleGeometry(95, 64),
    standard(palette.rug, {
      roughness: 1,
      bumpMap: noiseTexture({ seed: 23, contrast: 0.9, repeat: [10, 10] }),
      bumpScale: 0.6,
    }),
    { at: [22, 0.25, 82], rotate: [-90 * DEG, 0, 0], cast: false },
  )

  return group(
    [
      backWall,
      leftWall,
      ground,
      skirtingBack,
      skirtingLeft,
      pane,
      ...frameParts,
      shelf,
      ...books,
      ornamentBase,
      ornament,
      cradle,
      speaker,
      speakerCone,
      frame,
      bevel,
      mount,
      print,
      glazing,
      rug,
      buildRightWall(wall, trim),
    ],
    { name: 'room' },
  )
}
