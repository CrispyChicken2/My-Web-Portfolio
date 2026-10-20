import * as THREE from 'three'
import { noiseTexture } from '../textures'
import { addFur } from './fur'
import { DEG, group, place, standard } from './kit'

// Two lived-in things: a woven laundry hamper in the left-hand corner, full
// past its rim with the week's clothes — a hoodie with a sleeve hanging out,
// jeans with a leg over the side, T-shirts, socks, one sock that missed —
// and a pair of fluffy slippers kicked off under the desk.

// A seeded random, so the clothes fall the same way on every visit.
function random(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

// Smooth value noise in 3D, for the folds of fabric.
function noise3(seed) {
  const rand = random(seed)
  const table = Array.from({ length: 512 }, () => rand())
  const hash = (x, y, z) => table[((x * 73856093) ^ (y * 19349663) ^ (z * 83492791)) & 511]
  const smooth = (t) => t * t * (3 - 2 * t)
  return (x, y, z) => {
    const xi = Math.floor(x)
    const yi = Math.floor(y)
    const zi = Math.floor(z)
    const xf = smooth(x - xi)
    const yf = smooth(y - yi)
    const zf = smooth(z - zi)
    const lerp = (a, b, t) => a + (b - a) * t
    const c = (dx, dy, dz) => hash(xi + dx, yi + dy, zi + dz)
    return lerp(
      lerp(lerp(c(0, 0, 0), c(1, 0, 0), xf), lerp(c(0, 1, 0), c(1, 1, 0), xf), yf),
      lerp(lerp(c(0, 0, 1), c(1, 0, 1), xf), lerp(c(0, 1, 1), c(1, 1, 1), xf), yf),
      zf,
    ) * 2 - 1
  }
}

const fabric = (color, options = {}) =>
  new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.96,
    sheen: 0.7,
    sheenRoughness: 0.7,
    sheenColor: new THREE.Color(color).lerp(new THREE.Color('#ffffff'), 0.35),
    bumpMap: noiseTexture({ seed: 13, contrast: 0.9, repeat: [10, 10] }),
    bumpScale: 0.35,
    side: THREE.DoubleSide,
    ...options,
  })

// A heap of crumpled cloth: a squashed sphere with deep, soft folds.
function crumple(size, { seed = 1, flat = 0.5, folds = 1 } = {}) {
  const geometry = new THREE.SphereGeometry(1, 48, 32)
  const n = noise3(seed)
  const p = geometry.attributes.position
  for (let i = 0; i < p.count; i += 1) {
    const x = p.getX(i)
    const y = p.getY(i)
    const z = p.getZ(i)
    const fold = n(x * 2.4 * folds, y * 2.4 * folds, z * 2.4 * folds) * 0.26 + n(x * 6 * folds, y * 6 * folds, z * 6 * folds) * 0.07
    const r = 1 + fold
    const squash = y < 0 ? 0.35 : 1 - flat * 0.5
    p.setXYZ(i, x * r * size[0], y * r * size[1] * squash, z * r * size[2])
  }
  geometry.computeVertexNormals()
  return geometry
}

// A sleeve or a trouser leg: a tube along a curve, its radius wandering a
// little, creased across, and closed at the end by a cuff or a hem.
function garmentTube(points, radius, { seed = 3, cuff = null, creases = 6, squash = 'y' } = {}) {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)))
  const geometry = new THREE.TubeGeometry(curve, 64, radius, 16, false)
  const n = noise3(seed)
  const p = geometry.attributes.position
  const centre = new THREE.Vector3()
  const offset = new THREE.Vector3()
  for (let i = 0; i < p.count; i += 1) {
    const ring = Math.floor(i / 17) / 64
    curve.getPointAt(ring, centre)
    offset.set(p.getX(i), p.getY(i), p.getZ(i)).sub(centre)
    // cloth, not a pipe: the tube lies flattened — under its own weight on
    // the floor, against the side of the hamper where it hangs — narrows
    // towards its end, and carries soft, shallow creases
    if (squash === 'y') offset.y *= 0.5
    else {
      const out = new THREE.Vector3(centre.x, 0, centre.z).normalize()
      offset.addScaledVector(out, -offset.dot(out) * 0.55)
    }
    const crease = Math.sin(ring * Math.PI * 2 * creases + offset.x * 0.3) * 0.035
    const fold = n(p.getX(i) * 0.25, p.getY(i) * 0.25, p.getZ(i) * 0.25) * 0.07
    offset.multiplyScalar((1 - ring * 0.22) * (1 + crease + fold))
    p.setXYZ(i, centre.x + offset.x, centre.y + offset.y, centre.z + offset.z)
  }
  geometry.computeVertexNormals()
  const parts = [geometry]
  if (cuff) {
    const end = curve.getPoint(1)
    const tangent = curve.getTangent(1)
    // the cuff matches the narrowed, flattened end of the tube
    const ring = new THREE.TorusGeometry(radius * 0.78, radius * 0.16, 10, 32)
    ring.lookAt(tangent)
    ring.scale(1, 0.6, 1)
    ring.translate(end.x, end.y, end.z)
    parts.push(ring)
  }
  return parts
}

function hamperTexture() {
  const element = document.createElement('canvas')
  element.width = 512
  element.height = 512
  const ctx = element.getContext('2d')
  ctx.fillStyle = '#7c6a55'
  ctx.fillRect(0, 0, 512, 512)
  // a tight basket weave of seagrass: alternating blocks of strands
  const block = 32
  for (let y = 0; y < 512; y += block) {
    for (let x = 0; x < 512; x += block) {
      const vertical = ((x + y) / block) % 2 === 0
      for (let s = 0; s < 4; s += 1) {
        const g = vertical ? ctx.createLinearGradient(x + s * 8, 0, x + s * 8 + 8, 0) : ctx.createLinearGradient(0, y + s * 8, 0, y + s * 8 + 8)
        g.addColorStop(0, '#8b765c')
        g.addColorStop(0.5, '#c9b28c')
        g.addColorStop(1, '#7d684f')
        ctx.fillStyle = g
        if (vertical) ctx.fillRect(x + s * 8 + 0.5, y + 1, 7, block - 2)
        else ctx.fillRect(x + 1, y + s * 8 + 0.5, block - 2, 7)
      }
    }
  }
  const texture = new THREE.CanvasTexture(element)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(5, 2.6)
  texture.anisotropy = 8
  return texture
}

export function buildLaundry() {
  const parts = []
  const weave = hamperTexture()
  const seagrass = standard('#ffffff', { map: weave, bumpMap: weave, bumpScale: 0.9, roughness: 0.88, side: THREE.DoubleSide })

  // The hamper: a round woven basket, narrower at the foot, its cotton liner
  // folded down over the rim, two rope handles.
  const H = 52
  const profile = [[0, 0], [17.5, 0], [18.5, 1.5], [21.5, H - 2], [22, H]]
  parts.push(place(new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), 72), seagrass))
  parts.push(place(new THREE.TorusGeometry(22, 1.3, 12, 72), seagrass, { at: [0, H, 0], rotate: [90 * DEG, 0, 0] }))
  // the liner's fold, hanging a hand's width down the outside
  const liner = fabric('#e6dfd2')
  const fold = new THREE.CylinderGeometry(22.9, 22.4, 9, 72, 6, true)
  const fp = fold.attributes.position
  for (let i = 0; i < fp.count; i += 1) {
    const a = Math.atan2(fp.getZ(i), fp.getX(i))
    const t = (fp.getY(i) + 4.5) / 9
    // scalloped hem: it sags between the points where it is gathered
    const sag = (1 - t) * (1.4 + Math.sin(a * 8) * 1.2)
    fp.setY(i, fp.getY(i) - sag)
    const out = 1 + (1 - t) * 0.02
    fp.setX(i, fp.getX(i) * out)
    fp.setZ(i, fp.getZ(i) * out)
  }
  fold.computeVertexNormals()
  parts.push(place(fold, liner, { at: [0, H - 3.5, 0] }))
  // rope handles
  for (const side of [-1, 1]) {
    parts.push(place(new THREE.TorusGeometry(4.5, 0.75, 10, 24, Math.PI), standard('#d8c9ac', { roughness: 0.9, bumpMap: noiseTexture({ seed: 21, contrast: 1, repeat: [6, 1] }), bumpScale: 0.6 }), {
      at: [side * 22.6, H - 13, 0],
      rotate: [0, side * 90 * DEG, 0],
    }))
  }

  // The clothes. The hamper is full: a mass of clothes fills it to the
  // rim, and the last few things thrown in are heaped on top, sinking into
  // it and spilling over the edge — nothing sits on the rim like a lid.
  parts.push(place(crumple([15.5, 6.5, 15.5], { seed: 2, flat: 0.2, folds: 1.3 }), fabric('#4b4f57'), { at: [0, H - 4.5, 0] }))
  const pile = [
    // size, colour, at, rotation, seed
    [[16, 7, 15], '#6b6f76', [-1, H - 0.5, 1], [0, 0.3, 0], 4], // grey hoodie, the bulk of it
    [[11, 5, 10], '#1d1e22', [-8, H + 2.2, 6], [0.25, 1.1, 0.15], 8], // black T-shirt, sliding off the front
    [[12, 5, 9], '#34507a', [8, H + 1.6, -6], [-0.2, 2.2, -0.1], 12], // jeans
    [[8, 4.2, 8], '#f1ede4', [3, H + 4.6, 3], [0.25, 0.5, 0.2], 16], // white T-shirt, thrown in last
    [[5.5, 3.2, 5], '#9a3b36', [-5, H + 4.4, -5], [0.1, 0.8, 0.3], 20], // a red training top
  ]
  pile.forEach(([size, colour, at, rotate, seed]) => {
    parts.push(place(crumple(size, { seed, flat: 0.55 }), fabric(colour), { at, rotate }))
  })

  // The hoodie's sleeve, out over the rim and down the outside.
  garmentTube(
    [[6, H + 2, 8], [14, H + 1.6, 16], [21, H + 0.8, 21.6], [24.2, H - 7, 21.6], [24, H - 15, 21.2]],
    3.4,
    { seed: 6, creases: 7, squash: 'radial' },
  ).forEach((geometry) => parts.push(place(geometry, fabric('#6b6f76'))))
  // The drawstring of the hood, dangling.
  parts.push(place(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
    new THREE.Vector3(-13, H + 1.8, 9), new THREE.Vector3(-19, H + 1, 14), new THREE.Vector3(-22.4, H - 6, 15.5), new THREE.Vector3(-22.6, H - 11, 15),
  ]), 24, 0.32, 6), standard('#e8e4dc', { roughness: 0.8 })))
  // A jeans leg over the back.
  garmentTube(
    [[2, H + 1.5, -10], [-6, H + 1.4, -18], [-13, H + 0.4, -21], [-16, H - 9, -21.5], [-16.5, H - 22, -21]],
    4.6,
    { seed: 9, creases: 9, squash: 'radial' },
  ).forEach((geometry) => parts.push(place(geometry, fabric('#34507a'))))
  // A sock hooked over the rim at the front, and one that missed.
  garmentTube([[-9, H + 1.2, 15], [-11.6, H + 0.8, 20], [-12.8, H - 3, 22.2], [-13, H - 8, 22.4]], 1.5, { seed: 14, creases: 4, squash: 'radial' })
    .forEach((geometry) => parts.push(place(geometry, fabric('#f3f0ea'))))
  const sock = garmentTube([[0, 1.4, 0], [6, 1.4, 1], [11, 1.5, -1], [14, 1.6, -4]], 1.6, { seed: 19, creases: 5 })
  const sockGroup = group(sock.map((g) => place(g, fabric('#f3f0ea'))), { at: [26, 0, 34], rotate: [0, 0.6, 0] })
  // its toe and heel are grey
  sockGroup.add(place(new THREE.SphereGeometry(1.75, 16, 12), fabric('#9aa0a8'), { at: [14.2, 1.6, -4.4] }))
  sockGroup.add(place(new THREE.SphereGeometry(1.6, 16, 12), fabric('#9aa0a8'), { at: [5.6, 1.1, 1.6] }))

  return group([...parts, sockGroup], { at: [-118, 0, -24], rotate: [0, 0.4, 0], name: 'laundry' })
}

// --- the slippers -----------------------------------------------------------------------

// A foot's outline: narrow heel, wide round toes.
function footShape(length, width) {
  const s = new THREE.Shape()
  const l = length / 2
  const w = width / 2
  s.moveTo(0, -l)
  s.bezierCurveTo(w * 0.85, -l, w * 0.9, -l * 0.35, w * 0.95, 0)
  s.bezierCurveTo(w * 1.05, l * 0.55, w * 0.75, l, 0.05, l)
  s.bezierCurveTo(-w * 0.95, l, -w * 1.08, l * 0.45, -w * 0.9, 0)
  s.bezierCurveTo(-w * 0.85, -l * 0.35, -w * 0.8, -l, 0, -l)
  return s
}

function slipper(side) {
  const parts = []
  const length = 27
  const width = 10.5
  const sole = new THREE.ExtrudeGeometry(footShape(length, width), { depth: 1.6, bevelEnabled: true, bevelThickness: 0.3, bevelSize: 0.3, bevelSegments: 3, curveSegments: 24 })
  sole.rotateX(-90 * DEG)
  if (side < 0) sole.scale(-1, 1, 1)
  parts.push(place(sole, standard('#a59b8e', { roughness: 0.75 })))

  // The upper: a soft dome over the front of the foot, open at the back, its
  // collar rolled. Shaped from a sphere: the top half kept, the back opened.
  const upper = new THREE.SphereGeometry(1, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2)
  const p = upper.attributes.position
  for (let i = 0; i < p.count; i += 1) {
    let x = p.getX(i) * width * 0.56
    let y = p.getY(i) * 8
    let z = p.getZ(i) * length * 0.5
    // open the back third: the dome drops to a low heel collar there
    const back = THREE.MathUtils.smoothstep(-z, length * 0.02, length * 0.32)
    y *= 1 - back * 0.7
    // toes a little lower, instep higher
    y *= 0.82 + 0.18 * THREE.MathUtils.smoothstep(z, length * 0.4, -length * 0.05)
    // follow the foot's outline in plan
    const t = z / (length / 2)
    x *= 0.82 + 0.2 * Math.sin((t + 1) * Math.PI * 0.42)
    p.setXYZ(i, x, y + 1.7, z)
  }
  upper.computeVertexNormals()
  const fleece = new THREE.MeshPhysicalMaterial({ color: '#d9cfc2', roughness: 1, sheen: 1, sheenRoughness: 0.45, sheenColor: new THREE.Color('#fff8ee'), side: THREE.DoubleSide })
  const shell = place(upper, fleece)
  parts.push(shell)
  const fur = addFur(shell, { layers: 10, length: 0.9, density: 3.2, thickness: 0.95, clump: 0.5, droop: 0.15, shade: 0.25 })
  // the inside: a darker lining where the foot goes
  parts.push(place(new THREE.ShapeGeometry(footShape(length * 0.62, width * 0.72), 16), standard('#b9ad9e', { roughness: 1 }), {
    at: [0, 2.0, -length * 0.16],
    rotate: [-90 * DEG, 0, 0],
    cast: false,
  }))
  return { slipper: group(parts), fur }
}

export function buildSlippers() {
  const left = slipper(-1)
  const right = slipper(1)
  // half under the front edge of the desk, where they were stepped out of
  left.slipper.position.set(-12, 0, 36)
  left.slipper.rotation.y = 0.28
  right.slipper.position.set(6, 0, 45)
  right.slipper.rotation.y = -0.55
  return { slippers: group([left.slipper, right.slipper], { name: 'slippers' }), noAO: [left.fur, right.fur] }
}
