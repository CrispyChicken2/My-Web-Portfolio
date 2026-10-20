import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

// The few shapes everything in the Room is assembled from. The Room is
// measured in centimetres: the desk is 160 wide and its top sits at 75.

const geometryCache = new Map()

// A box with softened edges — almost nothing in a modern setup has a sharp
// corner, and a rounded edge is what catches the light.
export function rbox(width, height, depth, radius = 0.4, segments = 3) {
  const key = `${width}|${height}|${depth}|${radius}|${segments}`
  if (!geometryCache.has(key)) {
    const r = Math.min(radius, width / 2 - 1e-3, height / 2 - 1e-3, depth / 2 - 1e-3)
    geometryCache.set(key, new RoundedBoxGeometry(width, height, depth, segments, Math.max(r, 1e-3)))
  }
  return geometryCache.get(key)
}

// A flat plate with rounded corners in plan, extruded upwards with a small
// bevel: a desk mat, a monitor base, a phone.
export function roundedPlate(width, depth, height, radius, bevel = 0.15) {
  const shape = new THREE.Shape()
  const w = width / 2
  const d = depth / 2
  const r = Math.min(radius, w, d)
  shape.moveTo(-w + r, -d)
  shape.lineTo(w - r, -d)
  shape.quadraticCurveTo(w, -d, w, -d + r)
  shape.lineTo(w, d - r)
  shape.quadraticCurveTo(w, d, w - r, d)
  shape.lineTo(-w + r, d)
  shape.quadraticCurveTo(-w, d, -w, d - r)
  shape.lineTo(-w, -d + r)
  shape.quadraticCurveTo(-w, -d, -w + r, -d)
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(height - bevel * 2, 0.01),
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: 12,
  })
  // Extruded along +z; lay it flat so its thickness runs up the y axis.
  geometry.rotateX(-Math.PI / 2)
  geometry.translate(0, bevel, 0)
  return geometry
}

// Places a mesh and opts it into shadows in one call, so the scene files
// read as a list of objects rather than a list of property assignments.
export function place(geometry, material, { at = [0, 0, 0], rotate = [0, 0, 0], scale, cast = true, receive = true, name } = {}) {
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(at[0], at[1], at[2])
  mesh.rotation.set(rotate[0], rotate[1], rotate[2])
  if (scale) mesh.scale.set(scale[0], scale[1], scale[2])
  mesh.castShadow = cast
  mesh.receiveShadow = receive
  if (name) mesh.name = name
  return mesh
}

export function group(children = [], { at = [0, 0, 0], rotate = [0, 0, 0], name } = {}) {
  const g = new THREE.Group()
  g.position.set(at[0], at[1], at[2])
  g.rotation.set(rotate[0], rotate[1], rotate[2])
  if (name) g.name = name
  children.forEach((child) => g.add(child))
  return g
}

export const standard = (color, options = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0, ...options })

export const emissive = (color, intensity = 2) =>
  new THREE.MeshStandardMaterial({
    color: '#000000',
    emissive: color,
    emissiveIntensity: intensity,
    roughness: 0.4,
  })

export const DEG = Math.PI / 180
