import * as THREE from 'three'
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js'
import { palette } from '../palette'
import { noiseTexture } from '../textures'
import { DEG, emissive, group, place, rbox, standard } from './kit'

// The right-hand wall of the room, closing the corner the dog sleeps in: two
// floating oak shelves of books and football trophies — a gold cup, a
// statuette of a player striking a ball, a match ball on its stand, two
// medals hanging off the edge on their ribbons, a supporter's scarf draped
// over it, a framed team photo — lit from beneath each shelf by a warm LED
// strip.
//
// The wall faces −x; things on the shelves are placed in "shelf space":
// u along the wall (towards the front of the room), up, and out from it.

export const RIGHT_X = 205

function random(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

// --- books -------------------------------------------------------------------------

// A spine: its cloth colour, a band or two in foil, a title and an author
// set as fine strokes, a publisher's mark at the foot.
function spineTexture(colour, rand) {
  const element = document.createElement('canvas')
  element.width = 64
  element.height = 320
  const ctx = element.getContext('2d')
  ctx.fillStyle = colour
  ctx.fillRect(0, 0, 64, 320)
  const shade = ctx.createLinearGradient(0, 0, 64, 0)
  shade.addColorStop(0, 'rgba(0,0,0,0.25)')
  shade.addColorStop(0.25, 'rgba(255,255,255,0.06)')
  shade.addColorStop(0.75, 'rgba(0,0,0,0)')
  shade.addColorStop(1, 'rgba(0,0,0,0.3)')
  ctx.fillStyle = shade
  ctx.fillRect(0, 0, 64, 320)
  const foil = rand() > 0.5 ? 'rgba(232, 200, 120, 0.9)' : 'rgba(240, 236, 228, 0.85)'
  ctx.fillStyle = foil
  if (rand() > 0.4) {
    ctx.fillRect(4, 24, 56, 3)
    ctx.fillRect(4, 290, 56, 3)
  }
  // the title, written down the spine
  let y = 46
  const words = 2 + Math.floor(rand() * 3)
  for (let w = 0; w < words; w += 1) {
    const length = 18 + rand() * 40
    for (let c = 0; c < length; c += 5.5) ctx.fillRect(26 + rand() * 2, y + c, 10 + rand() * 4, 3.6)
    y += length + 9
  }
  ctx.globalAlpha = 0.7
  for (let c = 0; c < 34; c += 5) ctx.fillRect(28, 236 + c, 7, 2.6)
  ctx.globalAlpha = 1
  ctx.beginPath()
  ctx.arc(32, 306, 5, 0, Math.PI * 2)
  ctx.fill()
  const texture = new THREE.CanvasTexture(element)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

const COVERS = ['#7a2f2a', '#2f4a6b', '#d8cdb7', '#3d5a3f', '#1f2328', '#a87e3c', '#5b3d6e', '#c4572f', '#e9e4da', '#284f5c', '#8a8f96', '#4a2c22']

function book(width, height, depth, colour, rand) {
  const cover = standard(colour, { roughness: 0.7 })
  const pages = standard('#efe8d8', { roughness: 0.95 })
  const spine = new THREE.MeshStandardMaterial({ map: spineTexture(colour, rand), roughness: 0.65 })
  // box faces: +x, -x, +y, -y, +z, -z. The spine faces out of the wall (+z
  // in shelf space); the page block shows at the top, the bottom and the back.
  const materials = [cover, cover, pages, pages, spine, pages]
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), materials)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

// A row of books standing on the shelf from u0, ending with one leaning on
// the last of them (and resting on the shelf, not hanging in the air).
function bookRow(u0, count, rand, { lean = true } = {}) {
  const parts = []
  let u = u0
  for (let i = 0; i < count; i += 1) {
    const w = 2.2 + rand() * 2.4
    const h = 19 + rand() * 9
    const d = 13 + rand() * 4
    const b = book(w, h, d, COVERS[Math.floor(rand() * COVERS.length)], rand)
    b.position.set(u + w / 2, h / 2, d / 2 + 0.5)
    parts.push(b)
    u += w + 0.15
  }
  if (lean) {
    // Lean one on the last: it pivots on its bottom-left edge, which stays
    // on the shelf, and its left face rests against the neighbour — on its
    // top corner if the neighbour is short, along its side if it is tall.
    const last = parts[parts.length - 1]
    const neighbour = last.geometry.parameters.height
    const uEnd = u - 0.15
    const w = 2.8
    const h = 24
    const theta = 17 * DEG
    const base = uEnd + (neighbour < h * Math.cos(theta) ? neighbour * Math.tan(theta) : h * Math.sin(theta))
    const b = book(w, h, 15, COVERS[Math.floor(rand() * COVERS.length)], rand)
    b.position.set(
      base + (w / 2) * Math.cos(theta) - (h / 2) * Math.sin(theta),
      (w / 2) * Math.sin(theta) + (h / 2) * Math.cos(theta),
      8,
    )
    b.rotation.z = theta
    parts.push(b)
    u = base + w * Math.cos(theta)
  }
  return { parts, end: u }
}

function bookStack(u, count, rand) {
  const parts = []
  let y = 0
  for (let i = 0; i < count; i += 1) {
    const h = 2.4 + rand() * 1.6
    // lying flat, the spine still facing the room
    const b = book(18 + rand() * 4, h, 13 + rand() * 3, COVERS[Math.floor(rand() * COVERS.length)], rand)
    b.position.set(u + (rand() - 0.5) * 1.2, y + h / 2, 8)
    b.rotation.y = (rand() - 0.5) * 0.08
    parts.push(b)
    y += h
  }
  return { parts, top: y }
}

// --- trophies ---------------------------------------------------------------------

const gold = () => standard('#d9b25b', { roughness: 0.22, metalness: 1 })
const marble = () => standard('#15161a', { roughness: 0.25, metalness: 0.1, bumpMap: noiseTexture({ seed: 45, contrast: 0.6, repeat: [2, 2] }), bumpScale: 0.2 })

function plaque(width, height, text) {
  const element = document.createElement('canvas')
  element.width = 256
  element.height = 96
  const ctx = element.getContext('2d')
  const g = ctx.createLinearGradient(0, 0, 256, 96)
  g.addColorStop(0, '#c9a24a')
  g.addColorStop(0.5, '#f1d48a')
  g.addColorStop(1, '#b8913d')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 96)
  ctx.fillStyle = 'rgba(60, 40, 10, 0.85)'
  ctx.font = '700 30px Archivo, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(text[0], 128, 42)
  ctx.font = '500 20px Archivo, sans-serif'
  ctx.fillText(text[1], 128, 74)
  const texture = new THREE.CanvasTexture(element)
  texture.colorSpace = THREE.SRGBColorSpace
  return place(new THREE.PlaneGeometry(width, height), standard('#ffffff', { map: texture, roughness: 0.3, metalness: 0.8 }), { cast: false })
}

function cupTrophy() {
  const g = gold()
  const parts = []
  parts.push(place(rbox(11, 3, 11, 0.4), marble(), { at: [0, 1.5, 0] }))
  parts.push(place(rbox(9, 2.6, 9, 0.4), marble(), { at: [0, 4.3, 0] }))
  const p = plaque(6, 1.8, ['CHAMPIONS', '2019 / 2020'])
  p.position.set(0, 2.2, 5.52)
  parts.push(p)
  // foot, stem, knop and the bowl, turned in one profile
  const profile = [
    [0, 0], [4, 0], [4, 0.6], [2.6, 1.2], [1.1, 2.4], [0.9, 5.5], [1.6, 6.2], [1.6, 6.8], [0.9, 7.4], [1.2, 8.6],
    [3.6, 10], [5, 12.6], [5.6, 16], [5.8, 18.6], [6.1, 19.2], [5.8, 19.4], [5.4, 18.8], [5.2, 16.2], [4.6, 13], [0, 11.6],
  ]
  parts.push(place(new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), 64), g, { at: [0, 5.6, 0] }))
  // the two handles, ears on either side of the bowl
  for (const side of [-1, 1]) {
    parts.push(place(new THREE.TorusGeometry(3.2, 0.42, 12, 32, Math.PI * 1.25), g, {
      at: [side * 6.2, 20.4, 0],
      rotate: [0, 0, side > 0 ? -Math.PI * 0.62 : Math.PI * 1.62],
    }))
  }
  return group(parts)
}

// A small gold player striking a ball, on a column.
function playerTrophy() {
  const g = gold()
  const parts = []
  parts.push(place(rbox(9, 3, 9, 0.4), marble(), { at: [0, 1.5, 0] }))
  // the column: black with two gold rings and gold corner trims
  parts.push(place(rbox(6.4, 15, 6.4, 0.3), marble(), { at: [0, 10.5, 0] }))
  for (const y of [4.2, 16.8]) parts.push(place(rbox(6.9, 0.6, 6.9, 0.2), g, { at: [0, y, 0] }))
  const p = plaque(5, 1.6, ['TOP SCORER', '2021'])
  p.position.set(0, 10.5, 3.22)
  parts.push(p)
  parts.push(place(new THREE.CylinderGeometry(3.2, 3.4, 1, 32), g, { at: [0, 18.5, 0] }))

  // the player: torso, head, arms out for balance, the standing leg and the
  // striking leg swung through, the ball leaving the boot
  const fig = new THREE.Group()
  fig.position.set(0, 19, 0)
  const limb = (a, b, r) => {
    const start = new THREE.Vector3(...a)
    const end = new THREE.Vector3(...b)
    const mesh = place(new THREE.CapsuleGeometry(r, start.distanceTo(end), 6, 12), g)
    mesh.position.copy(start).add(end).multiplyScalar(0.5)
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(start).normalize())
    return mesh
  }
  fig.add(limb([0, 0.2, 0], [0.4, 3.6, -0.3], 0.55)) // standing leg
  fig.add(limb([0.4, 3.8, 0], [-1.2, 5.6, 1.6], 0.5)) // thigh, swinging
  fig.add(limb([-1.2, 5.6, 1.6], [-0.4, 4.2, 3.6], 0.45)) // shin, striking
  fig.add(limb([0.2, 4.2, 0], [0.5, 7.4, -0.3], 0.95)) // torso
  fig.add(place(new THREE.SphereGeometry(0.85, 20, 14), g, { at: [0.6, 8.9, -0.4] }))
  fig.add(limb([0.5, 7.2, -0.3], [2.6, 7.6, 0.6], 0.32)) // arm out
  fig.add(limb([0.4, 7.2, -0.3], [-1.6, 6.6, -1.6], 0.32)) // arm back
  fig.add(place(new THREE.IcosahedronGeometry(0.95, 1), g, { at: [-0.2, 4.4, 4.9] }))
  parts.push(fig)
  return group(parts)
}

// A match ball: twelve black pentagons where the icosahedron's vertices are,
// twenty white hexagons over its faces, seams between. The panels are
// painted into the ball's texture pixel by pixel, so their edges stay crisp.
function football(radius) {
  const ico = new THREE.IcosahedronGeometry(1, 0).attributes.position
  const pentagons = []
  for (let i = 0; i < ico.count; i += 1) {
    const v = new THREE.Vector3().fromBufferAttribute(ico, i).normalize()
    if (!pentagons.some((q) => q.distanceTo(v) < 1e-3)) pentagons.push(v)
  }
  const hexagons = []
  for (let i = 0; i < ico.count; i += 3) {
    hexagons.push(
      new THREE.Vector3()
        .fromBufferAttribute(ico, i)
        .add(new THREE.Vector3().fromBufferAttribute(ico, i + 1))
        .add(new THREE.Vector3().fromBufferAttribute(ico, i + 2))
        .normalize(),
    )
  }
  // The pentagons are a touch smaller than the hexagons, as on a real ball.
  const panels = [...pentagons.map((v) => ({ v, black: true, bias: 0.035 })), ...hexagons.map((v) => ({ v, black: false, bias: 0 }))]

  const W = 1024
  const H = 512
  const element = document.createElement('canvas')
  element.width = W
  element.height = H
  const ctx = element.getContext('2d')
  const image = ctx.createImageData(W, H)
  const n = new THREE.Vector3()
  for (let y = 0; y < H; y += 1) {
    // the same mapping SphereGeometry uses for its UVs
    const theta = ((y + 0.5) / H) * Math.PI
    for (let x = 0; x < W; x += 1) {
      const phi = ((x + 0.5) / W) * Math.PI * 2
      n.set(-Math.cos(phi) * Math.sin(theta), Math.cos(theta), Math.sin(phi) * Math.sin(theta))
      let best = null
      let nearest = Infinity
      let second = Infinity
      for (const panel of panels) {
        const d = n.angleTo(panel.v) + panel.bias
        if (d < nearest) {
          second = nearest
          nearest = d
          best = panel
        } else if (d < second) second = d
      }
      const seam = THREE.MathUtils.smoothstep(second - nearest, 0.006, 0.016)
      const panel = best.black ? 18 : 236
      const c = Math.round(panel * seam + 70 * (1 - seam))
      const i = (y * W + x) * 4
      image.data[i] = c
      image.data[i + 1] = c
      image.data[i + 2] = c
      image.data[i + 3] = 255
    }
  }
  ctx.putImageData(image, 0, 0)
  const map = new THREE.CanvasTexture(element)
  map.colorSpace = THREE.SRGBColorSpace
  map.anisotropy = 8
  return place(new THREE.SphereGeometry(radius, 64, 48), new THREE.MeshPhysicalMaterial({ map, roughness: 0.42, clearcoat: 0.5, clearcoatRoughness: 0.3 }))
}

function ballOnStand() {
  const parts = []
  parts.push(place(new THREE.CylinderGeometry(4.5, 5, 1.2, 40), marble(), { at: [0, 0.6, 0] }))
  parts.push(place(new THREE.TorusGeometry(3.4, 0.35, 10, 40), gold(), { at: [0, 2.2, 0], rotate: [90 * DEG, 0, 0] }))
  const ball = football(11)
  ball.position.set(0, 2.2 + Math.sqrt(11 * 11 - 3.4 * 3.4), 0)
  ball.rotation.set(0.4, 0.9, 0.2)
  parts.push(ball)
  return group(parts)
}

function medal(ribbonColours, faceText) {
  const parts = []
  // the ribbon: a V of two strips, striped in the club's colours
  const element = document.createElement('canvas')
  element.width = 32
  element.height = 128
  const ctx = element.getContext('2d')
  ribbonColours.forEach((c, i) => {
    ctx.fillStyle = c
    ctx.fillRect((i * 32) / ribbonColours.length, 0, 32 / ribbonColours.length, 128)
  })
  const ribbonMap = new THREE.CanvasTexture(element)
  ribbonMap.colorSpace = THREE.SRGBColorSpace
  const ribbon = new THREE.MeshStandardMaterial({ map: ribbonMap, roughness: 0.6, side: THREE.DoubleSide })
  for (const side of [-1, 1]) {
    parts.push(place(new THREE.PlaneGeometry(2.2, 16), ribbon, { at: [side * 1.6, -7.4, 0.1 * side], rotate: [0, 0, side * 0.1], cast: true }))
  }
  // the medal: a gold disc with a raised rim and a star
  const g = gold()
  const face = document.createElement('canvas')
  face.width = 128
  face.height = 128
  const fctx = face.getContext('2d')
  const fg = fctx.createRadialGradient(54, 50, 6, 64, 64, 64)
  fg.addColorStop(0, '#fbe6a4')
  fg.addColorStop(1, '#b98e36')
  fctx.fillStyle = fg
  fctx.fillRect(0, 0, 128, 128)
  fctx.fillStyle = 'rgba(110, 76, 20, 0.6)'
  fctx.beginPath()
  for (let i = 0; i < 10; i += 1) {
    const r = i % 2 ? 14 : 32
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2
    fctx.lineTo(64 + Math.cos(a) * r, 58 + Math.sin(a) * r)
  }
  fctx.fill()
  fctx.font = '700 15px Archivo, sans-serif'
  fctx.textAlign = 'center'
  fctx.fillText(faceText, 64, 112)
  const faceMap = new THREE.CanvasTexture(face)
  faceMap.colorSpace = THREE.SRGBColorSpace
  parts.push(place(new THREE.CylinderGeometry(3.2, 3.2, 0.45, 40), [g, standard('#ffffff', { map: faceMap, roughness: 0.3, metalness: 0.9 }), g], {
    at: [0, -16.6, 0.3],
    rotate: [90 * DEG, 0, 0],
  }))
  parts.push(place(new THREE.TorusGeometry(3.2, 0.25, 8, 40), g, { at: [0, -16.6, 0.3] }))
  parts.push(place(new THREE.TorusGeometry(0.7, 0.14, 6, 16), g, { at: [0, -13.1, 0.3], rotate: [0, 90 * DEG, 0] }))
  return group(parts)
}

// A supporter's scarf: lying along the shelf, then over the edge and down,
// in blocks of the club's colours, with a fringe at the end.
function scarf() {
  const element = document.createElement('canvas')
  element.width = 64
  element.height = 512
  const ctx = element.getContext('2d')
  const blocks = ['#1f3c88', '#f4f1ea', '#1f3c88', '#c8262c', '#1f3c88', '#f4f1ea', '#1f3c88', '#c8262c']
  blocks.forEach((c, i) => {
    ctx.fillStyle = c
    ctx.fillRect(0, i * 64, 64, 64)
  })
  // knitted ribs
  ctx.fillStyle = 'rgba(0,0,0,0.12)'
  for (let x = 0; x < 64; x += 6) ctx.fillRect(x, 0, 2, 512)
  const map = new THREE.CanvasTexture(element)
  map.colorSpace = THREE.SRGBColorSpace
  const material = new THREE.MeshPhysicalMaterial({ map, roughness: 0.95, sheen: 0.8, sheenRoughness: 0.6, side: THREE.DoubleSide })
  // laid in shelf space: along the shelf top from the back, over the front
  // edge, hanging down
  const geometry = new THREE.PlaneGeometry(14, 90, 8, 90)
  const p = geometry.attributes.position
  for (let i = 0; i < p.count; i += 1) {
    const x = p.getX(i)
    const s = (p.getY(i) + 45) / 90 // 0..1 along its length
    const along = s * 90
    let y
    let z
    if (along < 18) {
      y = 0.6 + Math.sin(along * 0.4) * 0.15
      z = 4 + along
    } else if (along < 24) {
      const t = (along - 18) / 6
      y = 0.6 - Math.sin(t * Math.PI * 0.5) * 2.4
      z = 22 + Math.sin(t * Math.PI * 0.5) * 1.8
    } else {
      y = -1.8 - (along - 24)
      z = 23.8 + Math.sin(along * 0.18) * 0.5
    }
    p.setXYZ(i, x + Math.sin(along * 0.12) * 0.6, y, z)
  }
  geometry.computeVertexNormals()
  const parts = [place(geometry, material)]
  // fringe
  for (let i = 0; i < 9; i += 1) {
    parts.push(place(new THREE.CylinderGeometry(0.22, 0.18, 5, 5), standard(i % 2 ? '#1f3c88' : '#f4f1ea', { roughness: 0.95 }), {
      at: [-6 + i * 1.5, -66.5 - 2.5, 24 + Math.sin(66 * 0.18) * 0.5],
    }))
  }
  return group(parts)
}

// A framed team photo, leaning back against the wall.
function teamPhoto() {
  const element = document.createElement('canvas')
  element.width = 360
  element.height = 250
  const ctx = element.getContext('2d')
  const sky = ctx.createLinearGradient(0, 0, 0, 120)
  sky.addColorStop(0, '#9bb7cf')
  sky.addColorStop(1, '#d7dfe2')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, 360, 250)
  ctx.fillStyle = '#4c7d3d'
  ctx.fillRect(0, 128, 360, 122)
  // two rows of players: back row standing, front row crouching
  const rand = random(3)
  for (let row = 0; row < 2; row += 1) {
    for (let i = 0; i < 8 - row; i += 1) {
      const x = 34 + i * 41 + row * 20
      const y = row ? 160 : 112
      ctx.fillStyle = '#e7c8a7'
      ctx.beginPath()
      ctx.arc(x, y - 22, 8, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = rand() > 0.9 ? '#2e7d32' : '#1f3c88'
      ctx.fillRect(x - 12, y - 14, 24, row ? 22 : 34)
      ctx.fillStyle = '#f4f1ea'
      ctx.fillRect(x - 12, y + (row ? 8 : 20), 24, 10)
    }
  }
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(180, 232, 9, 0, Math.PI * 2)
  ctx.fill()
  const map = new THREE.CanvasTexture(element)
  map.colorSpace = THREE.SRGBColorSpace
  const parts = [
    place(rbox(22, 16, 1.4, 0.3), standard('#101114', { roughness: 0.4 }), { at: [0, 8, 0] }),
    place(new THREE.PlaneGeometry(17.5, 12), standard('#ffffff', { map, roughness: 0.35 }), { at: [0, 8, 0.72], cast: false }),
    place(rbox(1.2, 10, 1.2, 0.3), standard('#101114', { roughness: 0.4 }), { at: [0, 5, -3.4], rotate: [0.42, 0, 0] }),
  ]
  const photo = group(parts)
  photo.rotation.x = -12 * DEG
  return photo
}

// --- the wall --------------------------------------------------------------------------

export function buildRightWall(wallMaterial, trimMaterial) {
  RectAreaLightUniformsLib.init()
  const parts = []
  parts.push(place(new THREE.PlaneGeometry(360, 285), wallMaterial, { at: [RIGHT_X, 142.5, 132], rotate: [0, -90 * DEG, 0], cast: false }))
  parts.push(place(rbox(1.6, 9, 360, 0.3), trimMaterial, { at: [RIGHT_X - 0.8, 4.5, 132] }))

  // Shelf space: u along the wall towards the front of the room (+z), up,
  // and out of the wall (−x).
  const shelf = (centreZ, y, length) => {
    const s = new THREE.Group()
    s.position.set(RIGHT_X, y, centreZ - length / 2)
    s.rotation.y = -90 * DEG // local +z (out of the wall) is world −x; local +x (u) is world +z
    s.add(place(rbox(length, 3.2, 24, 0.6), standard(palette.oak, { roughness: 0.55 }), { at: [length / 2, -1.6, 12] }))
    // the LED strip along its underside, and the light it throws down
    s.add(place(rbox(length - 8, 0.4, 1, 0.1), emissive(palette.warm, 2.4), { at: [length / 2, -3.35, 20], cast: false, receive: false }))
    const light = new THREE.RectAreaLight(palette.warm, 9, length - 8, 1.6)
    light.position.set(length / 2, -3.6, 18)
    light.rotation.set(-90 * DEG, 0, 0) // a RectAreaLight shines down its −z
    s.add(light)
    return s
  }

  const rand = random(11)
  const upper = shelf(6, 170, 112)
  const lower = shelf(6, 128, 112)

  // Upper shelf: a run of books ending in one leaning, the cup, a short
  // stack lying flat, and the team photo at the front end.
  const upperRow = bookRow(4, 11, rand)
  upperRow.parts.forEach((b) => upper.add(b))
  const cup = cupTrophy()
  cup.position.set(upperRow.end + 12, 0, 11)
  upper.add(cup)
  const stack = bookStack(upperRow.end + 30, 3, rand)
  stack.parts.forEach((b) => upper.add(b))
  const photo = teamPhoto()
  photo.position.set(100, 0, 8)
  upper.add(photo)

  // Lower shelf: the statuette, the match ball, medals over the edge, the
  // scarf, and more books with a bookend.
  const statuette = playerTrophy()
  statuette.position.set(12, 0, 11)
  lower.add(statuette)
  const ball = ballOnStand()
  ball.position.set(34, 0, 12)
  lower.add(ball)
  const lowerRow = bookRow(62, 8, rand, { lean: false })
  lowerRow.parts.forEach((b) => lower.add(b))
  lower.add(place(rbox(1, 14, 12, 0.3), standard('#1b1c20', { roughness: 0.4, metalness: 0.6 }), { at: [lowerRow.end + 0.7, 7, 8] }))
  const sc = scarf()
  sc.position.set(54, 0, 0)
  lower.add(sc)
  // medals hang from the lower shelf's front edge
  const m1 = medal(['#1f3c88', '#f4f1ea', '#1f3c88'], 'U15')
  m1.position.set(24, -3.2, 24.4)
  const m2 = medal(['#c8262c', '#f4f1ea', '#c8262c'], 'U17')
  m2.position.set(82, -3.2, 24.4)
  m2.rotation.z = 0.05
  lower.add(m1, m2)

  parts.push(upper, lower)
  return group(parts, { name: 'right-wall' })
}
