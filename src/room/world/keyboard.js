import * as THREE from 'three'
import { palette } from '../palette'
import { legendAtlas } from '../textures'
import { DESK } from './desk'
import { DEG, group, place, rbox, standard } from './kit'

// A 75% mechanical keyboard in an aluminium case. Every key is real: it is
// mapped to the KeyboardEvent.code it stands for, and it goes down when that
// key is pressed — on this page or on the Screen.

export const KEYBOARD_X = -8
const U = 1.905 // one key unit, 19.05 mm
const CAP = 1.72 // the keycap's footprint inside its unit
const CAP_HEIGHT = 0.95
const TRAVEL = 0.38

// [code, legend, width in units, tone]. Tone: l light, m mid, d dark, a accent.
const LAYOUT = [
  [
    ['Escape', 'esc', 1, 'a'], ['F1', 'F1', 1, 'm'], ['F2', 'F2', 1, 'm'], ['F3', 'F3', 1, 'm'],
    ['F4', 'F4', 1, 'm'], ['F5', 'F5', 1, 'd'], ['F6', 'F6', 1, 'd'], ['F7', 'F7', 1, 'd'],
    ['F8', 'F8', 1, 'd'], ['F9', 'F9', 1, 'm'], ['F10', 'F10', 1, 'm'], ['F11', 'F11', 1, 'm'],
    ['F12', 'F12', 1, 'm'], ['PrintScreen', 'prt', 1, 'd'], ['Delete', 'del', 1, 'd'], ['Insert', 'ins', 1, 'd'],
  ],
  [
    ['Backquote', '`', 1, 'l'], ['Digit1', '1', 1, 'l'], ['Digit2', '2', 1, 'l'], ['Digit3', '3', 1, 'l'],
    ['Digit4', '4', 1, 'l'], ['Digit5', '5', 1, 'l'], ['Digit6', '6', 1, 'l'], ['Digit7', '7', 1, 'l'],
    ['Digit8', '8', 1, 'l'], ['Digit9', '9', 1, 'l'], ['Digit0', '0', 1, 'l'], ['Minus', '-', 1, 'l'],
    ['Equal', '=', 1, 'l'], ['Backspace', '⌫', 2, 'd'], ['Home', 'hm', 1, 'd'],
  ],
  [
    ['Tab', 'tab', 1.5, 'd'], ['KeyQ', 'Q', 1, 'l'], ['KeyW', 'W', 1, 'l'], ['KeyE', 'E', 1, 'l'],
    ['KeyR', 'R', 1, 'l'], ['KeyT', 'T', 1, 'l'], ['KeyY', 'Y', 1, 'l'], ['KeyU', 'U', 1, 'l'],
    ['KeyI', 'I', 1, 'l'], ['KeyO', 'O', 1, 'l'], ['KeyP', 'P', 1, 'l'], ['BracketLeft', '[', 1, 'l'],
    ['BracketRight', ']', 1, 'l'], ['Backslash', '\\', 1.5, 'd'], ['PageUp', 'pgup', 1, 'd'],
  ],
  [
    ['CapsLock', 'caps', 1.75, 'd'], ['KeyA', 'A', 1, 'l'], ['KeyS', 'S', 1, 'l'], ['KeyD', 'D', 1, 'l'],
    ['KeyF', 'F', 1, 'l'], ['KeyG', 'G', 1, 'l'], ['KeyH', 'H', 1, 'l'], ['KeyJ', 'J', 1, 'l'],
    ['KeyK', 'K', 1, 'l'], ['KeyL', 'L', 1, 'l'], ['Semicolon', ';', 1, 'l'], ['Quote', "'", 1, 'l'],
    ['Enter', '⏎', 2.25, 'a'], ['PageDown', 'pgdn', 1, 'd'],
  ],
  [
    ['ShiftLeft', 'shift', 2.25, 'd'], ['KeyZ', 'Z', 1, 'l'], ['KeyX', 'X', 1, 'l'], ['KeyC', 'C', 1, 'l'],
    ['KeyV', 'V', 1, 'l'], ['KeyB', 'B', 1, 'l'], ['KeyN', 'N', 1, 'l'], ['KeyM', 'M', 1, 'l'],
    ['Comma', ',', 1, 'l'], ['Period', '.', 1, 'l'], ['Slash', '/', 1, 'l'], ['ShiftRight', 'shift', 1.75, 'd'],
    ['ArrowUp', '↑', 1, 'd'], ['End', 'end', 1, 'd'],
  ],
  [
    ['ControlLeft', 'ctrl', 1.25, 'd'], ['MetaLeft', '◆', 1.25, 'd'], ['AltLeft', 'alt', 1.25, 'd'],
    ['Space', '', 6.25, 'l'], ['AltRight', 'alt', 1, 'd'], ['Fn', 'fn', 1, 'd'], ['ControlRight', 'ctrl', 1, 'd'],
    ['ArrowLeft', '←', 1, 'd'], ['ArrowDown', '↓', 1, 'd'], ['ArrowRight', '→', 1, 'd'],
  ],
]

const TONES = {
  l: [palette.keyLight, palette.legendOnLight],
  m: [palette.keyMid, palette.legendOnLight],
  d: [palette.keyDark, palette.legendOnDark],
  a: [palette.keyAccent, palette.legendOnLight],
}

// A keycap: a rounded block whose top is pulled in, so it reads as a
// sculpted cap and not a cube.
function capGeometry(units) {
  const width = units * U - (U - CAP)
  const geometry = rbox(width, CAP_HEIGHT, CAP, 0.22, 3).clone()
  const position = geometry.attributes.position
  for (let i = 0; i < position.count; i += 1) {
    const y = position.getY(i)
    if (y > 0) {
      const pull = 1 - 0.16 * (y / (CAP_HEIGHT / 2))
      position.setX(i, position.getX(i) * (1 - (1 - pull) * (0.9 / units)) - 0)
      position.setZ(i, position.getZ(i) * pull)
    }
  }
  geometry.computeVertexNormals()
  return geometry
}

// The legends are one instanced plane: each instance reads its own cell of
// the atlas through `legendRect`, and takes its own colour.
function legendMaterial(texture) {
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
  })
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec4 legendRect;')
      .replace('#include <uv_vertex>', '#include <uv_vertex>\nvMapUv = vMapUv * legendRect.zw + legendRect.xy;')
  }
  return material
}

export function buildKeyboard() {
  const keys = []
  let longest = 0
  LAYOUT.forEach((row, rowIndex) => {
    let cursor = 0
    row.forEach(([code, legend, units, tone]) => {
      keys.push({ code, legend, units, tone, row: rowIndex, x: cursor + units / 2 })
      cursor += units
    })
    longest = Math.max(longest, cursor)
  })

  const plateWidth = longest * U
  const plateDepth = LAYOUT.length * U
  const xOf = (key) => -plateWidth / 2 + key.x * U
  // The top row sits a little apart from the rest, as on a real 75%.
  const zOf = (key) => -plateDepth / 2 + (key.row + 0.5) * U + (key.row === 0 ? -0.18 : 0)

  // The case.
  const caseMaterial = standard(palette.caseTop, { roughness: 0.34, metalness: 0.75 })
  const caseBody = place(rbox(plateWidth + 1.6, 2.2, plateDepth + 1.6, 0.6), caseMaterial, { at: [0, 0.5, 0] })
  const plate = place(
    new THREE.PlaneGeometry(plateWidth + 0.2, plateDepth + 0.2),
    standard('#15171b', { roughness: 0.8 }),
    { at: [0, 1.62, 0], rotate: [-90 * DEG, 0, 0], cast: false },
  )
  const feet = [-1, 1].map((side) =>
    place(rbox(4, 0.6, 1.2, 0.2), standard('#0e0f12', { roughness: 0.9 }), {
      at: [side * (plateWidth / 2 - 3), -0.75, -plateDepth / 2 + 1.2],
    }),
  )

  // Caps, one instanced mesh per width so a wide key keeps round corners.
  const byWidth = new Map()
  keys.forEach((key) => {
    if (!byWidth.has(key.units)) byWidth.set(key.units, [])
    byWidth.get(key.units).push(key)
  })
  const capMaterial = standard('#ffffff', { roughness: 0.55 })
  const restY = 1.62 + CAP_HEIGHT / 2 + 0.25
  const meshes = []
  const matrix = new THREE.Matrix4()
  byWidth.forEach((list, units) => {
    const mesh = new THREE.InstancedMesh(capGeometry(units), capMaterial, list.length)
    mesh.castShadow = true
    mesh.receiveShadow = true
    list.forEach((key, index) => {
      key.capMesh = mesh
      key.capIndex = index
      matrix.makeTranslation(xOf(key), restY, zOf(key))
      mesh.setMatrixAt(index, matrix)
      mesh.setColorAt(index, new THREE.Color(TONES[key.tone][0]))
    })
    meshes.push(mesh)
  })

  // Legends, offset towards the front-left of wide keys like printed caps.
  const labelled = keys.filter((key) => key.legend)
  const { texture, rects } = legendAtlas(labelled.map((key) => key.legend))
  const legendGeometry = new THREE.PlaneGeometry(1, 1)
  legendGeometry.rotateX(-90 * DEG)
  const legends = new THREE.InstancedMesh(legendGeometry, legendMaterial(texture), labelled.length)
  const rectAttribute = new Float32Array(labelled.length * 4)
  const legendY = restY + CAP_HEIGHT / 2 + 0.012
  labelled.forEach((key, index) => {
    key.legendIndex = index
    key.legendOffset = key.units > 1.25 ? -(key.units * U) / 2 + 1.0 : 0
    const size = key.legend.length > 3 ? 1.25 : 1.05
    key.legendSize = size
    matrix.compose(
      new THREE.Vector3(xOf(key) + key.legendOffset, legendY, zOf(key)),
      new THREE.Quaternion(),
      new THREE.Vector3(size, 1, size),
    )
    legends.setMatrixAt(index, matrix)
    legends.setColorAt(index, new THREE.Color(TONES[key.tone][1]))
    rectAttribute.set(rects[index], index * 4)
  })
  legendGeometry.setAttribute('legendRect', new THREE.InstancedBufferAttribute(rectAttribute, 4))

  const board = group([caseBody, plate, ...feet, ...meshes, legends], {
    at: [KEYBOARD_X, DESK.top + 0.35 + 1.05, 19],
    rotate: [4 * DEG, 0, 0],
    name: 'keyboard',
  })
  board.userData.keep = true // its keys move
  board.userData.rigid = true // ...the case does not

  // Pressing. Each key eases towards its target depth; only keys that are
  // moving are rewritten.
  const byCode = new Map(keys.map((key) => [key.code, key]))
  const moving = new Set()
  keys.forEach((key) => {
    key.depth = 0
    key.target = 0
  })

  const write = (key) => {
    const y = restY - key.depth * TRAVEL
    matrix.makeTranslation(xOf(key), y, zOf(key))
    key.capMesh.setMatrixAt(key.capIndex, matrix)
    key.capMesh.instanceMatrix.needsUpdate = true
    if (key.legendIndex !== undefined) {
      matrix.compose(
        new THREE.Vector3(xOf(key) + key.legendOffset, y + CAP_HEIGHT / 2 + 0.012, zOf(key)),
        new THREE.Quaternion(),
        new THREE.Vector3(key.legendSize, 1, key.legendSize),
      )
      legends.setMatrixAt(key.legendIndex, matrix)
      legends.instanceMatrix.needsUpdate = true
    }
  }

  const press = (code, down) => {
    const key = byCode.get(code)
    if (!key) return null
    key.target = down ? 1 : 0
    moving.add(key)
    return key
  }

  // A key that is only tapped (no keyup reaches us, e.g. autotyping) comes
  // back up on its own.
  const tap = (code) => {
    const key = press(code, true)
    if (key) key.release = 0.07
  }

  const update = (delta) => {
    moving.forEach((key) => {
      if (key.release !== undefined) {
        key.release -= delta
        if (key.release <= 0) {
          key.target = 0
          key.release = undefined
        }
      }
      const speed = key.target > key.depth ? 60 : 22
      key.depth += (key.target - key.depth) * Math.min(1, delta * speed)
      if (Math.abs(key.target - key.depth) < 0.002) {
        key.depth = key.target
        if (key.target === 0 && key.release === undefined) moving.delete(key)
      }
      write(key)
    })
  }

  const codes = keys.map((key) => key.code)
  return { keyboard: board, press, tap, update, codes }
}
