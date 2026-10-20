import * as THREE from 'three'
import { noiseTexture } from '../textures'
import { addFur } from './fur'
import { buildSpaniel } from './dog'
import { DEG, group, place, standard } from './kit'

// The dog's corner: a cushioned bolster bed with the springer asleep in it,
// his two plushies — a teddy slumped against the bolster and a plush bone by
// his paws — and, beside the bed, his water bowl and a tennis ball.

function tennisBallTexture() {
  const element = document.createElement('canvas')
  element.width = 256
  element.height = 128
  const ctx = element.getContext('2d')
  ctx.fillStyle = '#cfe03a'
  ctx.fillRect(0, 0, 256, 128)
  ctx.strokeStyle = '#f4f4ea'
  ctx.lineWidth = 5
  ctx.beginPath()
  for (let x = 0; x <= 256; x += 2) {
    const y = 64 + Math.sin((x / 256) * Math.PI * 4) * 30
    if (x === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()
  const texture = new THREE.CanvasTexture(element)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

// Plush fabric: a soft sheen at the edges and a fine nap in the bump.
const nap = noiseTexture({ seed: 88, contrast: 1, repeat: [6, 6] })
const plush = (color, sheenColor) =>
  new THREE.MeshPhysicalMaterial({ color, roughness: 1, sheen: 1, sheenRoughness: 0.4, sheenColor: new THREE.Color(sheenColor), bumpMap: nap, bumpScale: 0.6 })

// A plush teddy bear, a little slumped, as toys sit when they have been
// carried about in a mouth.
function teddy() {
  const fur = plush('#b4824f', '#f1d2a8')
  const cream = plush('#e8d4b4', '#fff4e0')
  const parts = []
  const ball = new THREE.SphereGeometry(1, 32, 24)
  const add = (material, at, scale) => {
    const mesh = place(ball, material, { at, scale })
    parts.push(mesh)
  }
  add(fur, [0, 7, 0], [6.2, 7.2, 5.4]) // body
  add(cream, [0, 6.4, 3.4], [3.8, 4.6, 2.4]) // tummy
  add(fur, [0, 16.4, 0.6], [5.2, 4.8, 4.6]) // head
  add(cream, [0, 15.2, 4.6], [2.3, 1.7, 1.8]) // snout
  for (const side of [-1, 1]) {
    add(fur, [side * 3.9, 20.2, 0.2], [1.8, 1.8, 1.1]) // ears
    add(cream, [side * 3.9, 20.2, 0.9], [1.1, 1.1, 0.5]) // inner ears
    add(fur, [side * 6.4, 8.6, 1.6], [1.9, 4.2, 2]) // arms, hanging forward
    add(fur, [side * 3.6, 1.6, 4.2], [2.4, 2.2, 4.4]) // legs, out in front
    add(cream, [side * 3.6, 1.8, 8.4], [1.8, 1.9, 0.6]) // foot pads
  }
  const bead = standard('#0d0a08', { roughness: 0.15, metalness: 0.2 })
  for (const side of [-1, 1]) parts.push(place(new THREE.SphereGeometry(0.55, 16, 12), bead, { at: [side * 1.9, 17.4, 4.6] }))
  parts.push(place(new THREE.SphereGeometry(1, 16, 12), standard('#2a1a12', { roughness: 0.5 }), { at: [0, 16, 6.3], scale: [0.9, 0.6, 0.55] }))
  // the stitched smile
  parts.push(place(new THREE.TorusGeometry(0.7, 0.07, 6, 16, Math.PI), standard('#2a1a12', { roughness: 0.8 }), { at: [0, 14.8, 6.25], rotate: [0, 0, Math.PI], cast: false }))
  return { toy: group(parts), fluff: [] }
}

// A plush bone, pale blue, with a seam round its middle.
function plushBone() {
  const fleece = plush('#9db8d6', '#e8f2ff')
  const parts = []
  parts.push(place(new THREE.CapsuleGeometry(2.4, 12, 8, 20), fleece, { rotate: [0, 0, 90 * DEG] }))
  for (const x of [-8, 8]) {
    for (const z of [-2.2, 2.2]) parts.push(place(new THREE.SphereGeometry(3.1, 24, 18), fleece, { at: [x, 0, z] }))
  }
  parts.push(place(new THREE.TorusGeometry(2.45, 0.12, 6, 32), standard('#7f9cbd', { roughness: 0.9 }), { rotate: [0, 90 * DEG, 0], cast: false }))
  const fluff = parts.slice(0, 5).map((m) => addFur(m, { layers: 5, length: 0.3, density: 5, thickness: 0.95, clump: 0.2, shade: 0.15 }))
  return { toy: group(parts), fluff }
}

export function buildDogCorner() {
  const parts = []
  const noAO = []
  const RX = 46 // the bed's half-length
  const RZ = 36 // and half-depth

  // A thick oval roll all round — tall at the back, squashed low at the
  // front where he steps in — round a deep, soft base cushion, in a grey
  // velvet with a short pile, on a darker non-slip base.
  const velvet = new THREE.MeshPhysicalMaterial({ color: '#8f8b86', roughness: 0.95, sheen: 1, sheenRoughness: 0.45, sheenColor: new THREE.Color('#d9d5ce') })
  const ring = []
  for (let i = 0; i < 128; i += 1) {
    const a = (i / 128) * Math.PI * 2
    ring.push(new THREE.Vector3(Math.cos(a) * (RX - 9), 9, Math.sin(a) * (RZ - 9)))
  }
  const bolster = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ring, true), 256, 9.5, 24, true)
  const bp = bolster.attributes.position
  for (let i = 0; i < bp.count; i += 1) {
    const a = Math.atan2(bp.getZ(i) / (RZ - 9), bp.getX(i) / (RX - 9))
    const front = Math.max(0, Math.sin(a)) ** 1.6
    const squash = 1 - 0.55 * front
    bp.setY(i, Math.max(0.6, (bp.getY(i) - 9) * squash + 9 * squash))
  }
  bolster.computeVertexNormals()
  const bolsterMesh = place(bolster, velvet)
  parts.push(bolsterMesh)
  noAO.push(addFur(bolsterMesh, { layers: 5, length: 0.3, density: 4.5, thickness: 0.95, clump: 0.25, shade: 0.15 }))

  // the base cushion, softly domed with a dip where he lies
  const cushion = new THREE.SphereGeometry(1, 64, 24)
  const cp = cushion.attributes.position
  for (let i = 0; i < cp.count; i += 1) {
    const x = cp.getX(i)
    const y = cp.getY(i)
    const z = cp.getZ(i)
    const dish = y > 0 ? -2 * Math.max(0, 1 - Math.hypot(x, z) * 1.25) : 0
    cp.setXYZ(i, x * (RX - 10), y * 4 + dish, z * (RZ - 10))
  }
  cushion.computeVertexNormals()
  const cushionMesh = place(cushion, velvet, { at: [0, 5, 0] })
  parts.push(cushionMesh)
  noAO.push(addFur(cushionMesh, { layers: 5, length: 0.35, density: 4.5, thickness: 0.95, clump: 0.3, shade: 0.15 }))
  // the dark non-slip base underneath
  parts.push(place(new THREE.CylinderGeometry(1, 1, 1.2, 96), standard('#2a2a2e', { roughness: 0.9 }), { at: [0, 0.6, 0], scale: [RX - 1, 1, RZ - 1] }))

  // The dog, settled into the cushion.
  const spaniel = buildSpaniel()
  spaniel.dog.position.set(2, 7.6, -3)
  spaniel.dog.rotation.y = 6 * DEG
  parts.push(spaniel.dog)
  noAO.push(...spaniel.noAO)

  // His plushies.
  const bear = teddy()
  // sitting on the cushion, its back against the inside of the bolster
  bear.toy.position.set(-21, 5.6, -13)
  bear.toy.rotation.set(-0.22, 0.75, 0.06)
  parts.push(bear.toy)
  const bone = plushBone()
  bone.toy.position.set(17, 8.6, 21)
  bone.toy.rotation.set(0.1, -0.5, 0.15)
  parts.push(bone.toy)
  noAO.push(...bear.fluff, ...bone.fluff)

  const bed = group(parts, { at: [150, 0, 2], rotate: [0, -42 * DEG, 0], name: 'dog-bed' })

  // Beside the bed: his water bowl and a tennis ball.
  const steel = standard('#c9ced4', { roughness: 0.18, metalness: 1 })
  const bowl = place(
    new THREE.LatheGeometry([[0, 0], [9, 0], [10.5, 0.6], [11, 5.5], [11.6, 6], [10.6, 6], [8.6, 1.4], [0, 1.4]].map(([r, y]) => new THREE.Vector2(r, y)), 64),
    steel,
  )
  const water = place(new THREE.CircleGeometry(9.6, 48), new THREE.MeshPhysicalMaterial({ color: '#7d93a8', roughness: 0.04, opacity: 0.6, transparent: true, clearcoat: 1 }), {
    at: [0, 4.2, 0],
    rotate: [-90 * DEG, 0, 0],
    cast: false,
  })
  const bowlGroup = group([bowl, water], { at: [104, 0, 32] })
  const ball = place(new THREE.SphereGeometry(3.3, 32, 20), standard('#ffffff', { map: tennisBallTexture(), roughness: 0.95 }), {
    at: [128, 3.3, 52],
    rotate: [0.4, 1.2, 0.2],
  })

  const corner = group([bed, bowlGroup, ball], { name: 'dog-corner' })
  return { corner, update: spaniel.update, noAO }
}
