import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { palette } from '../palette'
import { labelTexture, notebookPageTexture } from '../textures'
import { DESK } from './desk'
import { DEG, group, place, rbox, roundedPlate, standard } from './kit'

// The things that make it someone's desk: a bag of Haribo Goldbären with a
// few bears escaped onto the desk, a Razer BlackShark V2 X on its stand, a
// notebook with a pen, a phone on its charger, a coiled keyboard cable, and
// a tall snake plant on the floor beside the desk.

const TOP = DESK.top

// --- Haribo ------------------------------------------------------------------

function hariboFront() {
  const element = document.createElement('canvas')
  element.width = 512
  element.height = 720
  const ctx = element.getContext('2d')
  const gold = ctx.createLinearGradient(0, 0, 512, 720)
  gold.addColorStop(0, '#ffd83a')
  gold.addColorStop(0.5, palette.haribo)
  gold.addColorStop(1, '#e9a90f')
  ctx.fillStyle = gold
  ctx.fillRect(0, 0, 512, 720)
  // crimped seals at both ends
  for (const y of [0, 664]) {
    ctx.fillStyle = 'rgba(160, 100, 0, 0.35)'
    ctx.fillRect(0, y, 512, 56)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
    for (let x = 0; x < 512; x += 12) ctx.fillRect(x, y, 5, 56)
  }
  // the wordmark on its red ground, slanted
  ctx.save()
  ctx.translate(256, 170)
  ctx.rotate(-0.06)
  ctx.fillStyle = palette.hariboRed
  ctx.beginPath()
  ctx.ellipse(0, 0, 210, 74, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.lineWidth = 8
  ctx.strokeStyle = '#ffffff'
  ctx.stroke()
  ctx.fillStyle = '#ffffff'
  ctx.font = 'italic 900 92px Archivo, Arial Black, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('HARIBO', 0, 6)
  ctx.restore()
  ctx.textAlign = 'center'
  ctx.fillStyle = palette.hariboRed
  ctx.font = 'italic 800 58px Archivo, sans-serif'
  ctx.fillText('Goldbären', 256, 300)
  // a big gold bear, and a few small ones in the other colours
  const bear = (x, y, s, fill, shine = true) => {
    ctx.fillStyle = fill
    const blob = (bx, by, rx, ry) => {
      ctx.beginPath()
      ctx.ellipse(x + bx * s, y + by * s, rx * s, ry * s, 0, 0, Math.PI * 2)
      ctx.fill()
    }
    blob(0, 40, 46, 56) // body
    blob(0, -32, 36, 32) // head
    blob(-26, -60, 12, 12) // ears
    blob(26, -60, 12, 12)
    blob(-44, 22, 14, 18) // arms
    blob(44, 22, 14, 18)
    blob(-26, 92, 18, 16) // feet
    blob(26, 92, 18, 16)
    if (shine) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)'
      blob(-14, -42, 10, 6)
      blob(-18, 22, 9, 22)
    }
  }
  bear(256, 470, 1.9, '#f1b40f')
  bear(256, 470, 1.75, '#f9cb2e')
  const small = [['#e8352f', 92, 560], ['#4fb83b', 420, 580], ['#f28a1d', 104, 418], ['#f2ece1', 410, 420]]
  small.forEach(([c, x, y]) => bear(x, y, 0.62, c))
  ctx.fillStyle = 'rgba(120, 60, 0, 0.8)'
  ctx.font = '700 30px Archivo, sans-serif'
  ctx.fillText('200 g', 420, 640)
  const texture = new THREE.CanvasTexture(element)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

// A sealed bag: a puffed pillow, flat at its crimped ends, lying on the desk.
function pillow(width, length, puff) {
  const geometry = new THREE.PlaneGeometry(width, length, 28, 36)
  const position = geometry.attributes.position
  for (let i = 0; i < position.count; i += 1) {
    const u = position.getX(i) / (width / 2)
    const v = position.getY(i) / (length / 2)
    const across = Math.max(0, 1 - u * u)
    const along = Math.max(0, 1 - Math.max(0, Math.abs(v) - 0.84) / 0.16) * Math.max(0, 1 - v * v * 0.25)
    position.setZ(i, puff * Math.sqrt(across) * along)
    // the seams pull in a little where the bag is fullest
    position.setX(i, position.getX(i) * (1 - 0.05 * Math.sqrt(across) * along))
  }
  geometry.computeVertexNormals()
  return geometry
}

function gummyBear() {
  const parts = [
    [0, 0, 0, 0.55, 0.7, 0.42],
    [0, 0.88, 0, 0.44, 0.42, 0.38],
    [-0.28, 1.2, 0, 0.16, 0.16, 0.14],
    [0.28, 1.2, 0, 0.16, 0.16, 0.14],
    [-0.5, 0.25, 0.05, 0.2, 0.24, 0.18],
    [0.5, 0.25, 0.05, 0.2, 0.24, 0.18],
    [-0.28, -0.66, 0.05, 0.24, 0.22, 0.2],
    [0.28, -0.66, 0.05, 0.24, 0.22, 0.2],
  ].map(([x, y, z, sx, sy, sz]) => {
    const g = new THREE.SphereGeometry(1, 16, 12)
    g.scale(sx, sy, sz)
    g.translate(x, y, z)
    return g
  })
  const bear = mergeGeometries(parts)
  bear.scale(1.05, 1.05, 1.05)
  return bear
}

function buildHaribo() {
  const front = hariboFront()
  const bag = new THREE.Group()
  const top = place(pillow(14.5, 20, 2.1), standard('#ffffff', { map: front, roughness: 0.32, metalness: 0.15 }), {
    rotate: [-90 * DEG, 0, 0],
  })
  const bottom = place(pillow(14.5, 20, 0.9), standard(palette.haribo, { roughness: 0.35, metalness: 0.15 }), {
    rotate: [90 * DEG, 0, 0],
  })
  bag.add(top, bottom)
  bag.position.set(-44, TOP + 0.95, 22)
  bag.rotation.y = 24 * DEG

  // The bears that got out.
  const spilled = [
    [-29.5, 31, 20, 0], [-31.8, 33.6, 140, 2], [-28.2, 34.4, 75, 1], [-33.6, 30.4, 300, 3],
    [-26.6, 29.2, 210, 4], [-30.6, 28.4, 35, 5], [-35.4, 34.8, 260, 0], [-27.2, 32, 165, 2],
  ]
  const bears = new THREE.InstancedMesh(
    gummyBear(),
    new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      roughness: 0.22,
      transparent: true,
      opacity: 0.86,
      clearcoat: 1,
      clearcoatRoughness: 0.15,
      sheen: 0.4,
    }),
    spilled.length,
  )
  const matrix = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  spilled.forEach(([x, z, yaw, colour], index) => {
    q.setFromEuler(new THREE.Euler(-90 * DEG, 0, yaw * DEG))
    matrix.compose(new THREE.Vector3(x, TOP + 0.45, z), q, new THREE.Vector3(1, 1, 1))
    bears.setMatrixAt(index, matrix)
    bears.setColorAt(index, new THREE.Color(palette.gummies[colour]))
  })
  bears.castShadow = true
  bears.receiveShadow = true
  return { haribo: group([bag, bears], { name: 'haribo' }), noAO: [bears] }
}

// --- Razer BlackShark V2 X ------------------------------------------------------

function razerMark() {
  // A small green mark for the cups: three coils round a point.
  const element = document.createElement('canvas')
  element.width = 128
  element.height = 128
  const ctx = element.getContext('2d')
  ctx.strokeStyle = '#44d62c'
  ctx.lineWidth = 9
  ctx.lineCap = 'round'
  for (let i = 0; i < 3; i += 1) {
    ctx.save()
    ctx.translate(64, 64)
    ctx.rotate((i / 3) * Math.PI * 2)
    ctx.beginPath()
    ctx.arc(0, -20, 20, Math.PI * 0.95, Math.PI * 2.1)
    ctx.stroke()
    ctx.restore()
  }
  const texture = new THREE.CanvasTexture(element)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function buildHeadset() {
  const metal = standard(palette.aluminium, { roughness: 0.28, metalness: 0.92 })
  const plastic = standard('#141416', { roughness: 0.55, metalness: 0.05 })
  const leatherette = standard('#1b1b1e', { roughness: 0.62, metalness: 0 })
  const fabric = standard('#232327', { roughness: 0.95 })

  // The stand.
  const stand = [
    place(new THREE.CylinderGeometry(6, 6.4, 1.1, 56), metal, { at: [0, 0.55, 0] }),
    place(new THREE.CylinderGeometry(5.2, 5.2, 0.12, 56), standard('#0d0d0f', { roughness: 0.9 }), { at: [0, 1.15, 0], cast: false }),
    place(new THREE.CylinderGeometry(0.75, 0.75, 26, 24), metal, { at: [0, 14, 0] }),
    place(rbox(10, 1.6, 4.4, 0.7), metal, { at: [0, 27.4, 0] }),
    place(rbox(9.2, 0.5, 3.8, 0.2), standard('#0d0d0f', { roughness: 0.9 }), { at: [0, 28.3, 0], cast: false }),
  ]

  // The headband: a wide padded arc over the saddle, with the wordmark on
  // top and steel sliders running down to the cups.
  const bandRadius = 10
  const bandY = 19.7
  const band = place(new THREE.TorusGeometry(bandRadius, 1.05, 14, 56, Math.PI), leatherette, {
    at: [0, bandY, 0],
    scale: [1, 1, 2],
  })
  const stitch = place(new THREE.TorusGeometry(bandRadius + 0.95, 0.06, 6, 56, Math.PI), standard('#2c2c31', { roughness: 0.7 }), {
    at: [0, bandY, 0],
    scale: [1, 1, 1],
    cast: false,
  })
  const wordmark = labelTexture('RAZER', { width: 256, height: 64, size: 40, weight: 700, color: '#6c6f76', spacing: 8 })
  const logo = place(new THREE.PlaneGeometry(4.2, 1.05), new THREE.MeshStandardMaterial({ map: wordmark, transparent: true, roughness: 0.6 }), {
    at: [0, bandY + bandRadius + 1.07, 0],
    rotate: [-90 * DEG, 0, 0],
    cast: false,
  })
  const sliders = [-1, 1].map((side) =>
    place(rbox(0.35, 6.2, 1.5, 0.12), metal, { at: [side * (bandRadius + 0.2), bandY - 2.6, 0] }),
  )
  const yokes = [-1, 1].map((side) =>
    place(new THREE.TorusGeometry(2.9, 0.32, 10, 32, Math.PI), plastic, {
      at: [side * (bandRadius + 0.7), bandY - 6.9, 0],
      rotate: [0, side * 90 * DEG, Math.PI],
    }),
  )

  // The cups: oval, matte, closed; leatherette cushions with a memory-foam
  // fill; the mark on each outer plate.
  const mark = razerMark()
  const cups = [-1, 1].flatMap((side) => {
    const cx = side * (bandRadius + 1.1)
    const cy = bandY - 9.6
    const shell = place(new THREE.CylinderGeometry(4.2, 4.7, 4.4, 48), plastic, {
      at: [cx, cy, 0],
      rotate: [0, 0, 90 * DEG],
      scale: [1.25, 1, 1],
    })
    const plate = place(new THREE.CircleGeometry(3.6, 48), standard('#101012', { roughness: 0.4, metalness: 0.2 }), {
      at: [cx + side * 2.22, cy, 0],
      rotate: [0, side * 90 * DEG, 0],
      scale: [1, 1.25, 1],
      cast: false,
    })
    const emblem = place(new THREE.PlaneGeometry(2.4, 2.4), new THREE.MeshStandardMaterial({ map: mark, transparent: true, roughness: 0.5 }), {
      at: [cx + side * 2.24, cy, 0],
      rotate: [0, side * 90 * DEG, 0],
      cast: false,
    })
    const cushion = place(new THREE.TorusGeometry(3.3, 1.6, 16, 48), leatherette, {
      at: [cx - side * 2.7, cy, 0],
      rotate: [0, 90 * DEG, 0],
      scale: [1, 1.24, 1],
    })
    const inner = place(new THREE.CircleGeometry(2.3, 32), fabric, {
      at: [cx - side * 2.6, cy, 0],
      rotate: [0, -side * 90 * DEG, 0],
      scale: [1, 1.2, 1],
      cast: false,
    })
    return [shell, plate, emblem, cushion, inner]
  })

  // The left cup carries the volume wheel and the bendable cardioid mic, a
  // slim boom curving forward with a foam capsule at its tip.
  const left = -(bandRadius + 1.1)
  const wheel = place(new THREE.CylinderGeometry(0.85, 0.85, 0.5, 24), plastic, {
    at: [left - 0.4, bandY - 13.6, -2.6],
    rotate: [0, 0, 90 * DEG],
  })
  const boom = place(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
      new THREE.Vector3(left - 1.2, bandY - 12.4, 2.4),
      new THREE.Vector3(left - 1.9, bandY - 13.6, 6),
      new THREE.Vector3(left - 1.5, bandY - 13, 10.5),
      new THREE.Vector3(left - 0.4, bandY - 11.6, 13.2),
    ]), 40, 0.32, 10),
    plastic,
  )
  const capsule = place(new THREE.CapsuleGeometry(0.62, 1.2, 6, 16), fabric, {
    at: [left + 0.1, bandY - 11.1, 14],
    rotate: [70 * DEG, 0, 30 * DEG],
  })
  // The cable, down off the cup and round the back of the desk.
  const cable = place(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
      new THREE.Vector3(left, bandY - 14, 0),
      new THREE.Vector3(left + 0.5, 3, 1.5),
      new THREE.Vector3(left + 5, 0.4, 3),
      new THREE.Vector3(12, 0.3, 0),
      new THREE.Vector3(24, 0.3, 4),
    ]), 60, 0.2, 8),
    standard('#0e0e10', { roughness: 0.6 }),
  )

  return group([...stand, band, stitch, logo, ...sliders, ...yokes, ...cups, wheel, boom, capsule, cable], {
    at: [-64, TOP, -21],
    rotate: [0, 22 * DEG, 0],
    name: 'headset',
  })
}

// --- the floor plant -------------------------------------------------------------

function buildFloorPlant() {
  const pot = place(
    new THREE.LatheGeometry(
      [[0, 0], [12, 0], [13.5, 2], [15, 34], [15.4, 36], [14.2, 36], [14, 34.5]].map(([r, y]) => new THREE.Vector2(r, y)),
      64,
    ),
    standard('#d4cec4', { roughness: 0.9 }),
  )
  const soil = place(new THREE.CircleGeometry(14, 40), standard('#2a2019', { roughness: 1 }), {
    at: [0, 33.4, 0],
    rotate: [-90 * DEG, 0, 0],
    cast: false,
  })
  const leafMaterial = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.5, side: THREE.DoubleSide, vertexColors: true })
  const base = new THREE.Color(palette.leaf)
  const edge = new THREE.Color(palette.leafEdge)
  const leaves = []
  const count = 15
  for (let i = 0; i < count; i += 1) {
    const height = 42 + ((i * 37) % 30)
    const width = 6 + ((i * 13) % 5) * 0.7
    const geometry = new THREE.PlaneGeometry(width, height, 4, 28)
    const position = geometry.attributes.position
    const colors = []
    for (let v = 0; v < position.count; v += 1) {
      const x = position.getX(v)
      const y = position.getY(v)
      const t = y / height + 0.5
      const narrow = Math.sin(Math.PI * Math.min(1, t * 0.95 + 0.08)) ** 0.7
      position.setX(v, x * narrow)
      position.setZ(v, Math.abs(x) * 0.4 + t * t * 9)
      position.setY(v, y + height / 2)
      const edgeAmount = Math.abs(x) / (width / 2) > 0.82 ? 0.6 : 0
      const banded = 0.82 + 0.18 * Math.sin(t * 46 + i * 1.7)
      const c = base.clone().lerp(edge, edgeAmount).multiplyScalar(banded)
      colors.push(c.r, c.g, c.b)
    }
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    geometry.computeVertexNormals()
    const angle = (i / count) * Math.PI * 2 + i * 0.4
    const leaf = place(geometry, leafMaterial, {
      at: [Math.cos(angle) * 4, 33, Math.sin(angle) * 4],
      rotate: [0, -angle + Math.PI / 2, 0],
    })
    leaf.rotateX(-(4 + (i % 4) * 4) * DEG)
    leaves.push(leaf)
  }
  return group([pot, soil, ...leaves], { at: [-104, 0, -31], name: 'plant' })
}

// --- notebook, phone, keyboard cable -----------------------------------------------

function buildNotebook() {
  const cover = standard(palette.notebook, { roughness: 0.7 })
  const pages = standard(palette.paper, { roughness: 0.9 })
  const book = place(rbox(15, 1.2, 21, 0.3), cover, { at: [0, 0.6, 0] })
  const block = place(rbox(14.4, 1, 20.4, 0.1), pages, { at: [0.25, 0.6, 0], cast: false })
  const open = place(
    new THREE.PlaneGeometry(14, 20),
    standard('#ffffff', { map: notebookPageTexture(), roughness: 0.9 }),
    { at: [0.2, 1.22, 0], rotate: [-90 * DEG, 0, 0], cast: false },
  )
  const band = place(rbox(0.4, 1.3, 21.2, 0.15), standard('#c9c2b6', { roughness: 0.8 }), { at: [6.2, 0.62, 0] })
  const pen = place(new THREE.CylinderGeometry(0.42, 0.42, 14, 20), standard('#101114', { roughness: 0.3, metalness: 0.6 }), {
    at: [10.2, 0.5, 1],
    rotate: [90 * DEG, 0, 6 * DEG],
  })
  const tip = place(new THREE.ConeGeometry(0.42, 1.2, 20), standard(palette.aluminium, { roughness: 0.2, metalness: 1 }), {
    at: [10.95, 0.5, -6.6],
    rotate: [-90 * DEG, 0, 6 * DEG],
  })
  return group([book, block, open, band, pen, tip], { at: [-66, TOP, 5], rotate: [0, 10 * DEG, 0], name: 'notebook' })
}

function buildPhone() {
  const pad = place(roundedPlate(8.5, 8.5, 0.7, 4.25, 0.2), standard('#d4d0c9', { roughness: 0.8 }), { at: [0, 0, 0] })
  const ring = place(new THREE.TorusGeometry(3.2, 0.06, 6, 48), standard('#ffffff', { emissive: '#ffffff', emissiveIntensity: 0.9 }), {
    at: [0, 0.71, 0],
    rotate: [90 * DEG, 0, 0],
    cast: false,
  })
  const phone = place(rbox(7.2, 0.8, 14.7, 0.4, 4), standard('#1a1c21', { roughness: 0.3, metalness: 0.5 }), {
    at: [0, 1.15, 0],
  })
  const face = place(
    new THREE.PlaneGeometry(6.8, 14.3),
    new THREE.MeshPhysicalMaterial({ color: '#050607', roughness: 0.08, clearcoat: 1 }),
    { at: [0, 1.56, 0], rotate: [-90 * DEG, 0, 0], cast: false },
  )
  const camera = place(rbox(2.6, 0.3, 2.6, 0.5), standard('#2a2c31', { roughness: 0.3 }), { at: [-1.8, 0.65, -5], cast: false })
  return group([pad, ring, phone, face, camera], { at: [46, TOP, 26], rotate: [0, -20 * DEG, 0], name: 'phone' })
}

// A coiled, sleeved keyboard cable with an aviator connector, running from
// the back of the keyboard to the back edge of the desk.
function buildKeyboardCable(keyboardX) {
  const sleeve = standard('#8f76f0', { roughness: 0.75 })
  const startX = keyboardX - 9
  const y = TOP + 1.4
  const coilPoints = []
  const turns = 16
  for (let i = 0; i <= turns * 16; i += 1) {
    const t = i / (turns * 16)
    const a = t * turns * Math.PI * 2
    coilPoints.push(new THREE.Vector3(startX + Math.cos(a) * 0.55, y + Math.sin(a) * 0.55, 11.5 - t * 9))
  }
  const coil = place(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(coilPoints), turns * 32, 0.17, 6), sleeve)
  const aviator = place(new THREE.CylinderGeometry(0.62, 0.62, 2.6, 24), standard(palette.aluminium, { roughness: 0.25, metalness: 0.95 }), {
    at: [startX, y, 1.1],
    rotate: [90 * DEG, 0, 0],
  })
  const tail = place(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
      new THREE.Vector3(startX, y, -0.2),
      new THREE.Vector3(startX - 6, TOP + 0.35, -6),
      new THREE.Vector3(-40, TOP + 0.35, -10),
      new THREE.Vector3(-44, TOP + 0.35, -30),
      new THREE.Vector3(-44, TOP - 2, -38.6),
      new THREE.Vector3(-44, TOP - 12, -39),
    ]), 60, 0.2, 8),
    sleeve,
  )
  const plug = place(rbox(1.4, 0.8, 1.8, 0.3), standard('#1b1c20', { roughness: 0.5 }), { at: [startX, TOP + 1.3, 13.2] })
  return group([coil, aviator, tail, plug], { name: 'keyboard-cable' })
}

export function buildProps({ keyboardX }) {
  const props = group(
    [buildHeadset(), buildNotebook(), buildPhone(), buildKeyboardCable(keyboardX)],
    { name: 'props' },
  )
  return { props, update: () => {}, noAO: [] }
}
