import * as THREE from 'three'
import { MarchingCubes } from 'three/addons/objects/MarchingCubes.js'
import { noiseTexture } from '../textures'
import { addFur } from './fur'
import { DEG, group, place, rbox, standard } from './kit'

// The dog: an English Springer Spaniel, liver and white, asleep in his bed
// in the right-hand corner of the room. He lies on his chest with his head
// resting on his front paws, his hind legs curled round to one side and his
// tail laid along them, and he breathes.
//
// The body is a single surface built from a signed distance field: tapered
// limbs and ellipsoids at their true sizes, blended smoothly into one
// another, then polygonised with marching cubes. Its coat is painted on as
// patches the way a springer's is marked — liver head and ears, a white
// blaze up the forehead, a white muzzle and chest and legs, a liver saddle
// over the back, roan where the two meet. The face is then dressed by
// finding the surface with rays: closed eyes with lids and lashes, the liver
// nose with its nostrils, the line of the lips, whiskers, freckles on the
// white of the muzzle. The long ears are separate and wavy and hang over
// his paws. A short dense coat, longer feathering on the ears, and a leather
// collar with a brass tag finish him.

const LIVER = new THREE.Color('#5a2a19')
const LIVER_DARK = '#3f1c10'
const WHITE = new THREE.Color('#ece5d8')
const ROAN = new THREE.Color('#9c7a66')

// --- distance functions (cm) ------------------------------------------------------------

// These run millions of times while the dog is built, so each shape works
// out its constants once and the distance itself uses only plain arithmetic
// (Math.hypot is far slower than a square root).

// An ellipsoid centred on c with radii r.
function sdEllipsoid([cx, cy, cz], [rx, ry, rz]) {
  const ax = 1 / rx
  const ay = 1 / ry
  const az = 1 / rz
  const bx = ax * ax
  const by = ay * ay
  const bz = az * az
  const inner = -Math.min(rx, ry, rz)
  return (px, py, pz) => {
    const x = px - cx
    const y = py - cy
    const z = pz - cz
    const k0 = Math.sqrt(x * x * bx + y * y * by + z * z * bz)
    const k1 = Math.sqrt(x * x * bx * bx + y * y * by * by + z * z * bz * bz)
    return k1 === 0 ? inner : (k0 * (k0 - 1)) / k1
  }
}

// A tapered capsule from a (radius ra) to b (radius rb).
function sdCone(a, b, ra, rb) {
  const [ax, ay, az] = a
  const bax = b[0] - ax
  const bay = b[1] - ay
  const baz = b[2] - az
  const inverse = 1 / (bax * bax + bay * bay + baz * baz)
  const taper = rb - ra
  return (px, py, pz) => {
    const pax = px - ax
    const pay = py - ay
    const paz = pz - az
    const h = Math.min(1, Math.max(0, (pax * bax + pay * bay + paz * baz) * inverse))
    const dx = pax - bax * h
    const dy = pay - bay * h
    const dz = paz - baz * h
    return Math.sqrt(dx * dx + dy * dy + dz * dz) - (ra + taper * h)
  }
}

function smin(a, b, k) {
  const h = Math.max(k - Math.abs(a - b), 0) / k
  return Math.min(a, b) - h * h * k * 0.25
}

// --- the anatomy ---------------------------------------------------------------------------
// Dog space: +z is where his nose points, +y up, +x his right-hand side.

const E = sdEllipsoid
const C = sdCone

const BODY = [
  E([0, 11.5, 2], [10.5, 11, 13]), // ribcage, deep
  C([1, 12, -6], [4, 11, -15], 9.6, 9), // loin
  E([6, 10.5, -18], [10, 10, 9]), // rump
  E([0, 13.5, 9], [9.5, 9.5, 7]), // shoulders
  C([0, 14, 11], [-0.5, 11.5, 19], 7.2, 6.2), // neck
]
const LIMBS = [
  // hind legs curled round to his right side
  E([12, 8.5, -13], [5.5, 7.5, 9.5]), // right haunch
  C([14, 4, -10], [14.5, 2.6, 2], 2.8, 2.5), // right hock to foot
  E([14.5, 2.4, 4], [2.8, 2.1, 3.6]), // right hind paw
  E([-7, 7, -15], [4.5, 6, 8]), // left haunch, under him
  C([-9, 3.2, -10], [-9.5, 2.4, -2], 2.6, 2.3),
  E([-9.5, 2.2, 0], [2.6, 2, 3.4]),
  // front legs stretched forward, the head resting on them
  C([6, 6, 9], [4.4, 2.8, 26], 3.2, 2.7),
  C([-6, 6, 9], [-4.4, 2.8, 26], 3.2, 2.7),
  E([4.4, 2.5, 28.5], [3.1, 2.2, 4]),
  E([-4.4, 2.5, 28.5], [3.1, 2.2, 4]),
  // tail, along the outside of the curled hind leg
  C([6, 11, -26], [13, 5.5, -27], 2.6, 2.2),
  C([13, 5.5, -27], [19, 3, -19], 2.2, 1.9),
  C([19, 3, -19], [20, 2.6, -11], 1.9, 1.3),
]
// A springer's head: a rounded skull a little longer than it is wide, a
// marked stop between two brows, then a muzzle as long as the skull, deep and
// squarish, its lips hanging a little below the jaw. The eyes sit at the
// stop, looking forward, under the brows.
const HEAD = [
  E([-0.8, 10.4, 21.6], [4.9, 5, 6]), // skull
  E([-0.8, 12.8, 18.6], [3.2, 2.6, 3]), // occiput
  E([1.6, 12.1, 25.3], [2.1, 1.6, 2]), // brows, either side of the stop
  E([-3.2, 12.1, 25.3], [2.1, 1.6, 2]),
  C([-0.8, 9.2, 26.4], [-0.8, 8.6, 33.4], 3.1, 2.7), // muzzle
  C([-0.8, 7.2, 27.4], [-0.8, 6.9, 32.8], 2.8, 2.4), // flews, the hanging lips
  C([-0.8, 5.8, 27], [-0.8, 5.7, 31.4], 2.1, 1.7), // lower jaw, the chin on the paws
  E([2.5, 8.8, 23.6], [2, 2.6, 2.8]), // cheeks
  E([-4.1, 8.8, 23.6], [2, 2.6, 2.8]),
]
// toes: three small knuckles across the front of each front paw
const TOES = [4.4, -4.4].flatMap((x) => [-1.4, 0, 1.4].map((dx) => E([x + dx, 2.3, 31.6], [1.1, 1.3, 1.3])))

// Each group of parts and how softly it blends into what came before.
const GROUPS = [
  [BODY, 4],
  [LIMBS, 2.2],
  [HEAD, 2.4],
  [TOES, 0.8],
]

function distance(x, y, z) {
  let d = Infinity
  for (let g = 0; g < GROUPS.length; g += 1) {
    const [parts, k] = GROUPS[g]
    for (let i = 0; i < parts.length; i += 1) d = smin(d, parts[i](x, y, z), k)
  }
  return d
}

// The markings, painted over white in order; each a soft-edged ellipsoid.
const PATCHES = [
  [[2, 22, -6], [14, 10, 19], LIVER, 1], // the saddle over the back
  [[11, 10, -14], [6.5, 7, 8.5], LIVER, 0.85], // the outside of the curled haunch
  [[0, 19, 13], [8, 6.5, 6.5], LIVER, 1], // top of the neck
  [[-0.8, 11, 21.5], [8.5, 7.5, 8], LIVER, 1], // the head
  [[-0.8, 15, 23.6], [1.3, 5.2, 6.2], WHITE, 1], // the blaze up the forehead
  [[-0.8, 7, 33.2], [4.4, 5.4, 5], WHITE, 1], // the muzzle
  [[0, 5.5, 12], [10, 6, 6], WHITE, 1], // the chest
  [[9.5, 8, -27], [7, 6, 5], LIVER, 1], // the root of the tail
  [[5, 3.5, 18], [3.4, 3, 6], ROAN, 0.45], // ticking down the forelegs
  [[-5, 3.5, 18], [3.4, 3, 6], ROAN, 0.45],
  [[14, 4, -2], [3.4, 3, 6], ROAN, 0.4],
]

function colourAt(x, y, z, out) {
  out.copy(WHITE)
  PATCHES.forEach(([c, r, colour, strength]) => {
    const u = (x - c[0]) / r[0]
    const v = (y - c[1]) / r[1]
    const w = (z - c[2]) / r[2]
    const k = Math.sqrt(u * u + v * v + w * w)
    const t = THREE.MathUtils.smoothstep(1.15 - k, 0, 0.3) * strength
    if (t > 0) out.lerp(colour, t)
  })
  return out
}

const CENTRE = [6, 13, 3]
const HALF = 36 // the field covers 72 cm a side

// The field is only meaningful within 6 cm of the surface: further out it is
// clamped, and colour is only read within 2.5 cm. So the grid is walked in
// blocks of 4 × 4 × 4 points, and a block whose centre is far from the dog is
// filled with the clamped value without measuring each point. The distance
// changes at most about as fast as the point moves, so a block is skipped
// only when its centre is further than 6 cm plus twice its own reach.
const BLOCK = 4

function grow() {
  const resolution = 112
  const mc = new MarchingCubes(resolution, new THREE.MeshBasicMaterial(), false, true, 260000)
  mc.isolation = 80
  const size = mc.size
  const half = size / 2
  const at = (i, c) => ((i - half) / half) * HALF + c
  const reach = ((BLOCK - 1) / 2) * (HALF / half) * Math.sqrt(3)
  const colour = new THREE.Color()

  const measure = (xi, yi, zi) => {
    const x = at(xi, CENTRE[0])
    const y = at(yi, CENTRE[1])
    const z = at(zi, CENTRE[2])
    const q = xi + yi * size + zi * size * size
    const d = y < -0.2 ? 5 : distance(x, y, z)
    mc.field[q] = 80 - Math.max(-6, Math.min(6, d)) * 10
    if (Math.abs(d) < 2.5) {
      colourAt(x, y, z, colour)
      mc.palette[q * 3] = colour.r
      mc.palette[q * 3 + 1] = colour.g
      mc.palette[q * 3 + 2] = colour.b
    }
  }

  const middle = (BLOCK - 1) / 2
  for (let zb = 0; zb < size; zb += BLOCK) {
    for (let yb = 0; yb < size; yb += BLOCK) {
      for (let xb = 0; xb < size; xb += BLOCK) {
        const d = distance(at(xb + middle, CENTRE[0]), at(yb + middle, CENTRE[1]), at(zb + middle, CENTRE[2]))
        const far = Math.abs(d) - 2 * reach > 6
        for (let zi = zb; zi < zb + BLOCK; zi += 1) {
          for (let yi = yb; yi < yb + BLOCK; yi += 1) {
            const below = at(yi, CENTRE[1]) < -0.2
            for (let xi = xb; xi < xb + BLOCK; xi += 1) {
              if (!far) measure(xi, yi, zi)
              else mc.field[xi + yi * size + zi * size * size] = below ? 30 : d > 0 ? 20 : 140
            }
          }
        }
      }
    }
  }
  mc.update()

  const count = mc.count
  const geometry = new THREE.BufferGeometry()
  const position = mc.positionArray.slice(0, count * 3)
  for (let i = 0; i < position.length; i += 3) {
    position[i] = position[i] * HALF + CENTRE[0]
    position[i + 1] = position[i + 1] * HALF + CENTRE[1]
    position[i + 2] = position[i + 2] * HALF + CENTRE[2]
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(position, 3))
  geometry.setAttribute('normal', new THREE.BufferAttribute(mc.normalArray.slice(0, count * 3), 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(mc.colorArray.slice(0, count * 3), 3))
  geometry.computeBoundingSphere()
  mc.geometry.dispose()
  return geometry
}

// --- the face, found on the surface -----------------------------------------------------

// Every ray that dresses the face is cast at the head, from in front of it,
// so it is tested only against the triangles there (z beyond `fromZ`)
// rather than the whole body: the same hits, far fewer tests.
function frontOf(geometry, fromZ) {
  const source = geometry.attributes.position.array
  const kept = []
  for (let i = 0; i < source.length; i += 9) {
    if (Math.max(source[i + 2], source[i + 5], source[i + 8]) > fromZ) {
      for (let j = 0; j < 9; j += 1) kept.push(source[i + j])
    }
  }
  const front = new THREE.BufferGeometry()
  front.setAttribute('position', new THREE.Float32BufferAttribute(kept, 3))
  return front
}

function surfaceFinder(mesh) {
  const ray = new THREE.Raycaster()
  return (from, toward) => {
    const origin = new THREE.Vector3(...from)
    ray.set(origin, new THREE.Vector3(...toward).sub(origin).normalize())
    const hit = ray.intersectObject(mesh, false)[0]
    if (!hit) return null
    const normal = hit.face.normal.clone()
    if (normal.dot(ray.ray.direction) > 0) normal.negate()
    return { point: hit.point, normal }
  }
}

function face(object, normal) {
  object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal.clone().normalize())
}

// A closed eye on one side (side = +1 right, −1 left): the slit, a soft
// lid above it, a few lashes along it.
function closedEye(find, side, m) {
  const parts = []
  const points = []
  // An almond slit across the face, below the brow, its outer corner a
  // little lower than the inner one; found by looking at the face head-on.
  const centre = side > 0 ? 1.6 : -3.2
  for (let i = 0; i <= 8; i += 1) {
    const t = i / 8
    const x = centre + side * (-1.05 + t * 2.1)
    const y = 10.75 + Math.sin(t * Math.PI) * 0.28 - t * 0.35
    const at = find([x + side * 1.2, y + 0.6, 44], [x, y, 22])
    if (at) points.push(at.point.clone().addScaledVector(at.normal, 0.04))
  }
  if (points.length < 4) return parts
  parts.push(place(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 24, 0.1, 6), m.lid, { cast: false }))
  const lid = points.map((p, i) => p.clone().add(new THREE.Vector3(0, 0.22 + Math.sin((i / (points.length - 1)) * Math.PI) * 0.1, 0)))
  parts.push(place(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(lid), 24, 0.2, 8), m.liverSoft, { cast: false }))
  for (let i = 1; i < points.length - 1; i += 1) {
    const root = points[i]
    const tip = root.clone().add(new THREE.Vector3(side * 0.05, -0.34, 0.24))
    parts.push(place(new THREE.TubeGeometry(new THREE.LineCurve3(root, tip), 1, 0.022, 3), m.lid, { cast: false }))
  }
  return parts
}

function nose(find, m) {
  const at = find([-0.8, 9.2, 50], [-0.8, 9, 30])
  if (!at) return []
  const n = new THREE.Group()
  n.position.copy(at.point).addScaledVector(at.normal, -0.6)
  face(n, at.normal)
  n.add(place(rbox(3.3, 2.4, 2.1, 0.85, 5), m.nose, { at: [0, 0.3, 0.8] }))
  n.add(place(rbox(0.12, 1.1, 0.3, 0.05), m.noseDeep, { at: [0, -0.4, 1.9], cast: false }))
  for (const s of [-1, 1]) {
    n.add(place(new THREE.SphereGeometry(0.42, 16, 10), m.noseDeep, { at: [s * 0.82, 0.3, 1.8], rotate: [0, 0, s * 28 * DEG], scale: [1, 0.55, 0.5], cast: false }))
  }
  return [n]
}

function lips(find, side, m) {
  const points = []
  for (let i = 0; i <= 10; i += 1) {
    const z = 33.2 - i * 0.6
    const y = 6.2 + i * 0.05
    const at = find([side * 12, y, z], [side * 0.5, y, z])
    if (at) points.push(at.point.clone().addScaledVector(at.normal, 0.03))
  }
  if (points.length < 4) return []
  return [place(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 30, 0.12, 6), m.lid, { cast: false })]
}

function whiskers(find, side, m) {
  const parts = []
  ;[[31.5, 8.9], [32.4, 8.4], [30.6, 8.2], [31.8, 7.6], [29.8, 9.2]].forEach(([z, y], index) => {
    const at = find([side * 12, y, z], [side * 0.5, y, z])
    if (!at) return
    const root = at.point
    const out = at.normal.clone().multiplyScalar(2.4)
    const curve = new THREE.QuadraticBezierCurve3(
      root,
      root.clone().add(out).add(new THREE.Vector3(0, 0.3, 1.4)),
      root.clone().add(out.clone().multiplyScalar(1.5)).add(new THREE.Vector3(0, -1, 2.8 + index * 0.3)),
    )
    parts.push(place(new THREE.TubeGeometry(curve, 10, 0.02, 3), index % 2 ? m.whiskerLight : m.whiskerDark, { cast: false }))
  })
  return parts
}

// Liver freckles on the white of the muzzle, small and scattered.
function freckles(find, side, m) {
  const parts = []
  let seed = side > 0 ? 9 : 23
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  const dot = new THREE.SphereGeometry(1, 8, 6)
  for (let i = 0; i < 16; i += 1) {
    const z = 28.5 + rand() * 4
    const y = 7.6 + rand() * 2.4
    const at = find([side * 12, y, z], [side * 0.5, y, z])
    if (!at) continue
    const s = 0.12 + rand() * 0.14
    const d = place(dot, m.freckle, { scale: [s, s, s * 0.35], cast: false })
    d.position.copy(at.point).addScaledVector(at.normal, 0.02)
    face(d, at.normal)
    parts.push(d)
  }
  return parts
}

// A long Springer ear: narrow at the root, broad and rounded at the tip,
// cupped, rippled with the waves of its feathering. Built pointing down its
// −y; its outer face is +z.
function earGeometry() {
  const length = 15
  const width = 10.4
  const geometry = new THREE.SphereGeometry(1, 40, 48)
  const p = geometry.attributes.position
  for (let i = 0; i < p.count; i += 1) {
    const x = p.getX(i)
    const y = p.getY(i)
    const z = p.getZ(i)
    const t = (1 - y) / 2 // 0 at the root, 1 at the tip
    const breadth = 0.42 + 0.58 * Math.sin(Math.min(1, t * 1.15) * Math.PI * 0.62)
    let px = x * (width / 2) * breadth
    const py = y * (length / 2)
    let pz = z * 1.05 - Math.cos((px / width) * Math.PI) * 1.2 * t
    pz += Math.sin(py * 1.6 + px * 0.6) * 0.28 * t + Math.sin(px * 2.1) * 0.15 * t
    px += Math.sin(py * 1.2) * 0.3 * t
    p.setXYZ(i, px, py, pz)
  }
  geometry.computeVertexNormals()
  return geometry
}

function ears(m) {
  const shape = earGeometry()
  return [1, -1].map((side) => {
    // set high on the side of the skull, level with the eyes, hanging down
    // past the cheek to lie on the paws and the bed
    const x0 = side > 0 ? 4.6 : -6.2
    const root = new THREE.Vector3(x0 + side * 1.2, 12.6, 20.6)
    const tip = new THREE.Vector3(x0 + side * 3.8, 1.5, 25)
    const yAxis = root.clone().sub(tip).normalize()
    const zAxis = new THREE.Vector3(side, 0, 0.3).normalize()
    const xAxis = new THREE.Vector3().crossVectors(yAxis, zAxis).normalize()
    zAxis.crossVectors(xAxis, yAxis).normalize()
    const ear = new THREE.Mesh(shape, m.ear)
    ear.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(xAxis, yAxis, zAxis))
    ear.position.copy(root).add(tip).multiplyScalar(0.5).addScaledVector(zAxis, 1)
    ear.scale.setScalar(root.distanceTo(tip) / 15)
    ear.castShadow = true
    ear.receiveShadow = true
    return ear
  })
}

function collar(m) {
  const c = new THREE.Group()
  const a = new THREE.Vector3(0, 14, 11)
  const b = new THREE.Vector3(-0.5, 11.5, 19)
  c.position.copy(a).lerp(b, 0.45)
  c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), b.clone().sub(a).normalize())
  c.add(place(new THREE.TorusGeometry(6.9, 0.5, 10, 48), m.leather))
  c.add(place(rbox(1.6, 1.3, 0.5, 0.2), m.brass, { at: [0, 7.2, 0], cast: false }))
  c.add(place(new THREE.TorusGeometry(0.5, 0.1, 6, 20), m.brass, { at: [0, -7.4, 0.3], cast: false }))
  c.add(place(new THREE.CylinderGeometry(1.2, 1.2, 0.16, 28), m.brass, { at: [0, -8.8, 0.6], rotate: [90 * DEG, 0, 0] }))
  return c
}

export function buildSpaniel() {
  const coat = new THREE.MeshPhysicalMaterial({
    vertexColors: true,
    roughness: 0.85,
    sheen: 1,
    sheenRoughness: 0.5,
    sheenColor: new THREE.Color('#c9a68e'),
  })
  const m = {
    lid: standard('#1c0d07', { roughness: 0.45 }),
    liverSoft: standard('#4d2416', { roughness: 0.85 }),
    nose: new THREE.MeshPhysicalMaterial({ color: '#4a2215', roughness: 0.38, clearcoat: 0.6, clearcoatRoughness: 0.4, bumpMap: noiseTexture({ seed: 77, contrast: 1, repeat: [3, 3] }), bumpScale: 0.6 }),
    noseDeep: standard('#160804', { roughness: 0.7 }),
    whiskerDark: standard('#2a1a12', { roughness: 0.5 }),
    whiskerLight: standard('#e9e2d6', { roughness: 0.5 }),
    freckle: standard('#6a3622', { roughness: 0.9 }),
    ear: new THREE.MeshPhysicalMaterial({ color: LIVER_DARK, roughness: 0.82, sheen: 1, sheenRoughness: 0.45, sheenColor: new THREE.Color('#a8735a'), side: THREE.DoubleSide }),
    leather: standard('#7a4a26', { roughness: 0.6 }),
    brass: standard('#c9a24a', { roughness: 0.28, metalness: 1 }),
  }

  const geometry = grow()
  const body = new THREE.Mesh(geometry, coat)
  body.castShadow = true
  body.receiveShadow = true
  body.name = 'spaniel-body'

  const find = surfaceFinder(new THREE.Mesh(frontOf(geometry, 14), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })))
  const details = [
    ...closedEye(find, 1, m),
    ...closedEye(find, -1, m),
    ...nose(find, m),
    ...lips(find, 1, m),
    ...lips(find, -1, m),
    ...whiskers(find, 1, m),
    ...whiskers(find, -1, m),
    ...freckles(find, 1, m),
    ...freckles(find, -1, m),
  ]
  const earParts = ears(m)

  // A short, dense coat; longer, drooping feathering on the ears.
  const bodyFur = addFur(body, { layers: 6, length: 0.35, density: 5, thickness: 0.95, clump: 0.5, shade: 0.18 })
  const earFur = earParts.map((ear) => addFur(ear, { layers: 6, length: 0.6, density: 4.2, thickness: 0.95, clump: 0.6, droop: 0.5, shade: 0.2 }))

  const dog = group([body, ...details, ...earParts, collar(m)], { name: 'spaniel' })
  dog.userData.keep = true // he breathes
  dog.userData.rigid = true // ...as one piece

  // Breathing: slow and deep, the ribs rising most.
  const update = (elapsed) => {
    const breath = Math.sin((elapsed / 4.4) * Math.PI * 2)
    dog.scale.set(1 + breath * 0.006, 1 + breath * 0.014, 1 + breath * 0.004)
  }

  return { dog, update, noAO: [bodyFur, ...earFur] }
}
