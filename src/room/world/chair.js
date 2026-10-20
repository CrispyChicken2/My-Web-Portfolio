import * as THREE from 'three'
import { palette } from '../palette'
import { meshWeaveTexture, noiseTexture } from '../textures'
import { DEG, group, place, rbox, standard } from './kit'

// An ergonomic high-back office chair — the kind sold for long days at a
// desk, not a gaming seat:
//
//   · a moulded, upholstered seat cushion: dished in the middle, raised a
//     little at the sides, two soft channels for the thighs, and a waterfall
//     front edge that rolls away under the knees; piped round its top;
//   · a tall mesh back drawn as a real spine curve: tilted pelvis support at
//     the base, a strong lumbar bulge, the thoracic section reclining, the
//     shoulders wrapping forward; the mesh wraps round the body more at the
//     waist than at the shoulders;
//   · an adjustable lumbar pad behind the mesh, with its knobs on the frame;
//   · a contoured, padded headrest on a sliding stem;
//   · 4D arms with soft pads; a synchro-tilt mechanism with its paddles and
//     tension knob; a gas lift; a polished five-star base on twin casters.
//
// It stands pushed back from the desk and turned a little, as if someone has
// just got up.

// A superellipsoid: a box whose edges and corners are as round as `e`
// allows (e → 0 sharp, e = 1 a sphere).
function superellipsoid(size, e = 0.35, segments = [48, 24]) {
  const geometry = new THREE.SphereGeometry(1, segments[0], segments[1])
  const p = geometry.attributes.position
  const f = (v) => Math.sign(v) * Math.abs(v) ** e
  for (let i = 0; i < p.count; i += 1) {
    p.setXYZ(i, f(p.getX(i)) * size[0], f(p.getY(i)) * size[1], f(p.getZ(i)) * size[2])
  }
  geometry.computeVertexNormals()
  return geometry
}

// The seat cushion, shaped by its top surface.
function seatCushion() {
  const W = 26 // half-width
  const T = 4.6 // half-thickness
  const D = 25 // half-depth
  const geometry = superellipsoid([W, T, D], 0.28, [64, 32])
  const p = geometry.attributes.position
  for (let i = 0; i < p.count; i += 1) {
    let x = p.getX(i)
    let y = p.getY(i)
    let z = p.getZ(i)
    const u = x / W // −1..1 across
    const v = z / D // −1 back .. 1 front
    if (y > 0) {
      const top = y / T
      // the dish under the sit bones, towards the back
      y -= top * 1.6 * Math.exp(-(u * u) / 0.35 - ((v + 0.25) ** 2) / 0.3)
      // the thigh channels running forward
      y -= top * 0.55 * Math.exp(-((Math.abs(u) - 0.42) ** 2) / 0.02) * THREE.MathUtils.smoothstep(v, -0.2, 0.4)
      // side bolsters
      y += top * 0.8 * THREE.MathUtils.smoothstep(Math.abs(u), 0.7, 0.98)
    }
    // the waterfall: the front rolls down and under
    const fall = THREE.MathUtils.smoothstep(v, 0.6, 1)
    y -= fall * 2.4 * (y > 0 ? 1 : 0.4)
    z -= fall * 1.2 * (y > 0 ? 1 : 0)
    // a slight taper towards the front
    x *= 1 - 0.06 * THREE.MathUtils.smoothstep(v, 0, 1)
    p.setXYZ(i, x, y, z)
  }
  geometry.computeVertexNormals()
  return geometry
}

// The back's mesh: in its own space, y up the spine from 0 to `length`, z
// forward. The profile is a spine's: forward at the pelvis, a lumbar bulge,
// then the recline handled by the frame's angle, the shoulders brought
// forward again at the top. The width narrows at the waist and widens at
// the shoulders; the sides wrap forwards, most at the waist.
const BACK = { length: 62, columns: 36, rows: 48 }

function backProfile(v) {
  return (
    1.2 * Math.exp(-((v - 0.04) ** 2) / 0.004) +
    3.4 * Math.exp(-((v - 0.24) ** 2) / 0.014) -
    0.6 * Math.exp(-((v - 0.6) ** 2) / 0.03) +
    1.6 * Math.exp(-((v - 0.93) ** 2) / 0.006)
  )
}

function backWidth(v) {
  // half-width: 19 at the base, 18 at the waist, 24 at the shoulders, rounded off at the top
  const shoulders = 24 - 6 * Math.exp(-((v - 0.3) ** 2) / 0.03)
  const top = v > 0.9 ? Math.sqrt(Math.max(0, 1 - ((v - 0.9) / 0.1) ** 2)) * 0.35 + 0.65 : 1
  return shoulders * top
}

function backMesh() {
  const { length, columns, rows } = BACK
  const geometry = new THREE.PlaneGeometry(2, length, columns, rows)
  const p = geometry.attributes.position
  for (let i = 0; i < p.count; i += 1) {
    const u = p.getX(i) // −1..1
    const v = p.getY(i) / length + 0.5
    const half = backWidth(v)
    const wrap = (3 + 4 * Math.exp(-((v - 0.28) ** 2) / 0.04)) * u * u
    p.setXYZ(i, u * half, v * length, backProfile(v) + wrap)
  }
  geometry.computeVertexNormals()
  return geometry
}

function backRim() {
  const { length } = BACK
  const points = []
  const steps = 64
  // up the right side, over the top, down the left, across the bottom
  for (let i = 0; i <= steps; i += 1) {
    const v = i / steps
    points.push([1, v])
  }
  for (let i = 1; i < 16; i += 1) points.push([1 - (i / 16) * 2, 1])
  for (let i = steps; i >= 0; i -= 1) points.push([-1, i / steps])
  for (let i = 1; i < 16; i += 1) points.push([-1 + (i / 16) * 2, 0])
  const at = ([u, v]) => {
    const half = backWidth(v)
    const wrap = (3 + 4 * Math.exp(-((v - 0.28) ** 2) / 0.04)) * u * u
    return new THREE.Vector3(u * half, v * length, backProfile(v) + wrap)
  }
  return new THREE.CatmullRomCurve3(points.map(at), true, 'centripetal', 0.4)
}

// The headrest: a wide pad, curved round the back of the head, its front
// softly domed.
function headrestPad() {
  const geometry = superellipsoid([15, 6.4, 3.6], 0.3, [48, 24])
  const p = geometry.attributes.position
  for (let i = 0; i < p.count; i += 1) {
    const x = p.getX(i)
    const u = x / 15
    p.setZ(i, p.getZ(i) + 3.4 * u * u + (p.getZ(i) > 0 ? 0.8 * (1 - u * u) : 0))
  }
  geometry.computeVertexNormals()
  return geometry
}

export function buildChair() {
  const polished = standard(palette.chrome, { roughness: 0.16, metalness: 1 })
  const frame = standard('#1b1c20', { roughness: 0.42, metalness: 0.1 })
  const dark = standard('#111215', { roughness: 0.6 })
  const upholstery = new THREE.MeshPhysicalMaterial({
    color: '#2a2c32',
    roughness: 0.92,
    sheen: 0.8,
    sheenRoughness: 0.6,
    sheenColor: new THREE.Color('#6c707a'),
    bumpMap: noiseTexture({ seed: 61, contrast: 0.9, repeat: [7, 7] }),
    bumpScale: 0.3,
  })
  const weave = meshWeaveTexture()
  weave.repeat.set(16, 20)
  const mesh = new THREE.MeshStandardMaterial({ color: '#16171b', roughness: 0.8, alphaMap: weave, alphaTest: 0.35, side: THREE.DoubleSide })
  const parts = []
  const noAO = []

  // --- base, casters, lift -------------------------------------------------------
  for (let i = 0; i < 5; i += 1) {
    const angle = (i / 5) * Math.PI * 2 + 18 * DEG
    const dir = new THREE.Vector3(Math.cos(angle), 0, -Math.sin(angle))
    const at = (r, y) => dir.clone().multiplyScalar(r).setY(y)
    const spoke = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([at(4, 9.4), at(14, 9), at(24, 7.4), at(31, 6.2)]), 24, 1.3, 12)
    spoke.scale(1, 0.75, 1)
    parts.push(place(spoke, polished))
    const tip = at(31, 0)
    const caster = angle + 70 * DEG
    parts.push(place(new THREE.CylinderGeometry(0.9, 1.1, 2.4, 16), polished, { at: [tip.x, 5.1, tip.z] }))
    parts.push(place(rbox(2.6, 2.6, 4.4, 1, 4), dark, { at: [tip.x, 3.6, tip.z], rotate: [0, caster, 0] }))
    for (const side of [-1, 1]) {
      const o = new THREE.Vector3(Math.cos(caster + 90 * DEG), 0, -Math.sin(caster + 90 * DEG)).multiplyScalar(side * 1.55)
      parts.push(place(new THREE.CylinderGeometry(2.3, 2.3, 1.15, 28), dark, { at: [tip.x + o.x, 2.3, tip.z + o.z], rotate: [0, caster, 90 * DEG] }))
      parts.push(place(new THREE.CylinderGeometry(0.9, 0.9, 1.2, 16), polished, { at: [tip.x + o.x * 1.02, 2.3, tip.z + o.z * 1.02], rotate: [0, caster, 90 * DEG], cast: false }))
    }
  }
  parts.push(place(new THREE.CylinderGeometry(4.6, 5.6, 4.2, 40), polished, { at: [0, 9.3, 0] }))
  parts.push(place(new THREE.CylinderGeometry(2.8, 2.8, 12, 32), dark, { at: [0, 17, 0] }))
  parts.push(place(new THREE.CylinderGeometry(1.6, 1.6, 12, 24), polished, { at: [0, 28, 0] }))

  // --- synchro mechanism ---------------------------------------------------------
  parts.push(place(rbox(18, 5.5, 24, 1.6), frame, { at: [0, 36.5, 0] }))
  parts.push(place(new THREE.CylinderGeometry(2.4, 2.4, 3.2, 28), dark, { at: [0, 34.6, 12.4], rotate: [90 * DEG, 0, 0] })) // tension knob
  parts.push(place(new THREE.TorusGeometry(2.4, 0.25, 6, 28), polished, { at: [0, 34.6, 14], cast: false }))
  for (const side of [-1, 1]) {
    parts.push(place(rbox(8, 0.9, 2.2, 0.4), dark, { at: [side * 11, 36.2, 7], rotate: [0, 0, side * -10 * DEG] })) // paddles
  }
  // the seat slider rails
  for (const side of [-1, 1]) parts.push(place(rbox(2, 1.4, 34, 0.4), frame, { at: [side * 12, 39.8, 2] }))

  // --- seat -------------------------------------------------------------------------
  parts.push(place(rbox(46, 2.4, 44, 2, 4), frame, { at: [0, 41.2, 2] })) // the shell under the cushion
  const cushion = place(seatCushion(), upholstery, { at: [0, 46.6, 2.5] })
  parts.push(cushion)
  // piping round the cushion's top edge
  const piping = []
  for (let i = 0; i < 96; i += 1) {
    const a = (i / 96) * Math.PI * 2
    const c = Math.cos(a)
    const s = Math.sin(a)
    const k = (v) => Math.sign(v) * Math.abs(v) ** 0.28
    const front = THREE.MathUtils.smoothstep(k(s), 0.6, 1)
    piping.push(new THREE.Vector3(k(c) * 25.2 * (1 - 0.06 * Math.max(0, k(s))), 46.6 + 3.8 - front * 2.2, 2.5 + k(s) * 24.2 - front * 1))
  }
  parts.push(place(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(piping, true), 200, 0.32, 6, true), standard('#202227', { roughness: 0.8 })))

  // --- back -------------------------------------------------------------------------
  // In its own frame: base just above the rear of the seat, reclined 12°.
  const back = new THREE.Group()
  back.position.set(0, 49, -24.5)
  back.rotation.x = -12 * DEG
  const membrane = place(backMesh(), mesh)
  back.add(membrane)
  noAO.push(membrane)
  back.add(place(new THREE.TubeGeometry(backRim(), 260, 1.5, 10, true), frame))
  // The adjustable lumbar pad behind the mesh, and its knobs on the frame.
  const lumbarY = BACK.length * 0.24
  const lumbar = place(superellipsoid([15, 4, 1.4], 0.4), frame, { at: [0, lumbarY, backProfile(0.24) - 2.6] })
  lumbar.geometry = lumbar.geometry.clone()
  {
    const lp = lumbar.geometry.attributes.position
    for (let i = 0; i < lp.count; i += 1) {
      const u = lp.getX(i) / 15
      lp.setZ(i, lp.getZ(i) + 5.5 * u * u)
    }
    lumbar.geometry.computeVertexNormals()
  }
  back.add(lumbar)
  for (const side of [-1, 1]) {
    const x = side * (backWidth(0.24) + 1.2)
    back.add(place(new THREE.CylinderGeometry(1.4, 1.4, 1.6, 20), dark, { at: [x, lumbarY, backProfile(0.24) + 7 - 0.6], rotate: [0, 0, 90 * DEG] }))
  }
  // The spine: a broad curved blade down the back of the frame and into the
  // mechanism, which carries the back and the headrest.
  const spine = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, BACK.length * 0.98, -1.6),
      new THREE.Vector3(0, BACK.length * 0.6, -3.4),
      new THREE.Vector3(0, BACK.length * 0.25, -3.2),
      new THREE.Vector3(0, BACK.length * 0.02, -2.6),
      new THREE.Vector3(0, -6, 3),
      new THREE.Vector3(0, -10, 14),
    ]),
    48,
    1.6,
    12,
  )
  spine.scale(2.6, 1, 1)
  back.add(place(spine, frame))

  // The headrest: the pad on a stem that slides out of the top of the spine,
  // angled forward to meet the back of the head.
  const stemTop = new THREE.Vector3(0, BACK.length + 9, 1.4)
  back.add(place(rbox(5, 14, 1.6, 0.6), polished, { at: [0, BACK.length + 2.4, -0.4], rotate: [0.08, 0, 0] }))
  back.add(place(rbox(7, 3, 3.2, 1), frame, { at: [0, BACK.length - 1, -1.2] })) // the slide collar
  const headrest = place(headrestPad(), upholstery, { at: [stemTop.x, stemTop.y, stemTop.z + 2.6], rotate: [16 * DEG, 0, 0] })
  back.add(headrest)
  back.add(place(rbox(9, 5, 2.2, 1), frame, { at: [0, stemTop.y - 0.5, stemTop.z - 0.4], rotate: [16 * DEG, 0, 0] })) // its hinge
  parts.push(back)

  // --- arms ---------------------------------------------------------------------------
  for (const side of [-1, 1]) {
    const x = side * 25.5
    // the bracket from under the seat, the post with its height collar and
    // button, the pad on its swivel plate
    parts.push(place(rbox(14, 2.2, 6, 0.8), frame, { at: [side * 18, 39.6, -4], rotate: [0, 0, side * 6 * DEG] }))
    parts.push(place(rbox(3.6, 22, 6, 1.4, 4), frame, { at: [x, 51, -4] }))
    parts.push(place(rbox(4.6, 4.6, 7, 1.4, 4), dark, { at: [x, 56, -4] }))
    parts.push(place(new THREE.CylinderGeometry(0.8, 0.8, 1, 16), dark, { at: [x, 57.5, -0.3], rotate: [90 * DEG, 0, 0], cast: false }))
    parts.push(place(rbox(6, 1, 9, 0.4), frame, { at: [x, 62, -1] }))
    const pad = place(superellipsoid([4, 1.4, 12], 0.4), standard('#232428', { roughness: 0.75 }), { at: [x, 63.6, 0], rotate: [0, side * -6 * DEG, 0] })
    parts.push(pad)
  }

  const chair = group(parts, { at: [12, 0, 92], rotate: [0, 200 * DEG, 0], name: 'chair' })
  return { chair, noAO }
}
