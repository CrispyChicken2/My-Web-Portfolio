import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

// Most of the Room never moves: walls, desk, monitor, shelves, books, the
// chair, the PC's case. Drawn one mesh at a time that is thousands of draw
// calls a frame — every shadow pass and every post-processing pass repeats
// them. This bakes every static mesh that shares a material into one mesh,
// in world space, once the Room is built.
//
// Left alone: anything marked `userData.keep` (and everything under it) —
// what moves (the keyboard's keys, the mouse, the fans, the dog breathing),
// what carries fur shells, what the ambient-occlusion pass must skip — and
// instanced meshes, multi-material meshes and mirrored ones.
//
// A thing that moves as one piece (a fan's rotor, the dog) is marked
// `userData.rigid` as well, and merged on its own, in its own space: its
// parts become one mesh that still moves with it.

const ATTRIBUTES = ['position', 'normal', 'uv', 'color']

function prepare(mesh, toSpace) {
  const source = mesh.geometry
  const geometry = source.index ? source.toNonIndexed() : source.clone()
  for (const name of Object.keys(geometry.attributes)) {
    if (!ATTRIBUTES.includes(name)) geometry.deleteAttribute(name)
  }
  if (!geometry.attributes.normal) geometry.computeVertexNormals()
  if (!geometry.attributes.uv) {
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(geometry.attributes.position.count * 2), 2))
  }
  if (!mesh.material.vertexColors && geometry.attributes.color) geometry.deleteAttribute('color')
  if (mesh.material.vertexColors && !geometry.attributes.color) return null
  geometry.morphAttributes = {}
  geometry.clearGroups()
  geometry.applyMatrix4(toSpace ? toSpace.clone().multiply(mesh.matrixWorld) : mesh.matrixWorld)
  return geometry
}

// `local`: merge into `root` in its own space (for a rigid moving group)
// rather than into world space.
export function mergeStatic(root, { local = false } = {}) {
  root.updateMatrixWorld(true)
  const toSpace = local ? root.matrixWorld.clone().invert() : null
  const buckets = new Map()

  const walk = (object) => {
    if (object.userData.keep) return
    const mergeable =
      object.isMesh &&
      !object.isInstancedMesh &&
      !Array.isArray(object.material) &&
      object.visible &&
      object.children.length === 0 &&
      object.matrixWorld.determinant() > 0
    if (mergeable) {
      const key = `${object.material.uuid}|${object.castShadow}|${object.receiveShadow}`
      if (!buckets.has(key)) buckets.set(key, [])
      buckets.get(key).push(object)
    }
    object.children.forEach(walk)
  }
  root.children.forEach(walk)

  let removed = 0
  let added = 0
  buckets.forEach((meshes) => {
    if (meshes.length < 2) return
    const geometries = meshes.map((m) => prepare(m, toSpace))
    if (geometries.some((g) => g === null)) return
    const merged = mergeGeometries(geometries, false)
    geometries.forEach((g) => g.dispose())
    if (!merged) return
    merged.computeBoundingSphere()
    const mesh = new THREE.Mesh(merged, meshes[0].material)
    mesh.castShadow = meshes[0].castShadow
    mesh.receiveShadow = meshes[0].receiveShadow
    mesh.name = 'merged'
    root.add(mesh)
    meshes.forEach((m) => m.parent?.remove(m))
    removed += meshes.length
    added += 1
  })
  return { removed, added }
}

// Merges every rigid group under `root` within itself.
export function mergeRigid(root) {
  const rigid = []
  root.traverse((object) => {
    if (object.userData.rigid) rigid.push(object)
  })
  rigid.forEach((object) => mergeStatic(object, { local: true }))
}
