import * as THREE from 'three'
import { palette } from '../palette'
import {
  backplateTexture,
  brushedTexture,
  circuitTexture,
  labelTexture,
  perforationAlpha,
  radiatorTexture,
  slotsAlpha,
} from '../textures'
import { DESK } from './desk'
import { DEG, group, place, rbox, standard } from './kit'

// The gaming PC: a Lian Li O11 Dynamic Mini V2 in black, built the way the
// case is laid out.
//
//   · Two tempered-glass panels, front and left, meeting at a corner with no
//     pillar; slightly dark-tinted, as the black model's glass is.
//   · Dual chamber: the motherboard stands on a tray that splits the case; the
//     power supply and the side fans live in the chamber behind it.
//   · Nine 120 mm fans, every mount the case has: three under the top
//     radiator, three on the 10°-tilted bottom tray, two on the side panel in
//     the rear chamber, one exhausting at the rear.
//   · An Arctic Liquid Freezer III A-RGB 360: radiator at the top, and on the
//     CPU the pump block with its turbofan-style intake and VRM fan.
//   · An ASUS TUF Gaming RTX 5070 (329 × 140 × 62.5 mm), gunmetal shroud with
//     its diagonal webs, backplate, three axial fans facing the bottom fans.
//
// Every light in it is lavender, and it breathes slowly.
//
// Axes: x runs from the left glass (−) to the right panel (+), z from the
// rear (−) to the front glass (+). Centimetres.

const W = 27.33
const H = 39.2
const D = 42.36
const TRAY_X = W / 2 - 9 // the motherboard tray; behind it, the rear chamber
const FAN = 12

// --- shared materials and geometry -----------------------------------------

function materials() {
  const brushed = brushedTexture({ repeat: [2, 1] })
  return {
    steel: standard('#0e0f12', { roughness: 0.42, metalness: 0.6 }),
    tray: standard('#0b0c0e', { roughness: 0.55, metalness: 0.5 }),
    aluminium: standard('#1c1d21', { roughness: 0.32, metalness: 0.9, roughnessMap: brushed, bumpMap: brushed, bumpScale: 0.05 }),
    frame: standard('#121317', { roughness: 0.5, metalness: 0.2 }),
    blade: new THREE.MeshStandardMaterial({
      color: '#4a4366',
      emissive: palette.lavender,
      emissiveIntensity: 0.9,
      roughness: 0.35,
      transparent: true,
      opacity: 0.78,
      side: THREE.DoubleSide,
    }),
    rgb: new THREE.MeshStandardMaterial({ color: '#000', emissive: palette.lavender, emissiveIntensity: 2.6, roughness: 0.4 }),
    rgbSoft: new THREE.MeshStandardMaterial({ color: '#000', emissive: palette.lavender, emissiveIntensity: 1.2, roughness: 0.4 }),
    rubber: standard('#0b0b0d', { roughness: 0.85 }),
    gunmetal: standard('#3a3d43', { roughness: 0.38, metalness: 0.78 }),
    gunmetalDark: standard('#24262a', { roughness: 0.45, metalness: 0.7 }),
    sleeve: standard('#16151b', { roughness: 0.7 }),
    sleeveLavender: standard('#5a4d8c', { roughness: 0.65 }),
    pcb: standard('#ffffff', { map: circuitTexture(), roughness: 0.65 }),
  }
}

// A 120 mm fan: a square frame round a circular throat, an LED ring at the
// lip, nine translucent blades that pick up the light, and a hub. It faces +z.
function fanParts(m) {
  const shape = new THREE.Shape()
  const s = FAN / 2
  const r = 0.9
  shape.moveTo(-s + r, -s)
  shape.lineTo(s - r, -s)
  shape.quadraticCurveTo(s, -s, s, -s + r)
  shape.lineTo(s, s - r)
  shape.quadraticCurveTo(s, s, s - r, s)
  shape.lineTo(-s + r, s)
  shape.quadraticCurveTo(-s, s, -s, s - r)
  shape.lineTo(-s, -s + r)
  shape.quadraticCurveTo(-s, -s, -s + r, -s)
  const throat = new THREE.Path()
  throat.absarc(0, 0, 5.75, 0, Math.PI * 2, true)
  shape.holes.push(throat)
  const frame = new THREE.ExtrudeGeometry(shape, { depth: 2.5, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 2, curveSegments: 40 })
  frame.translate(0, 0, -1.25)

  const blade = new THREE.Shape()
  blade.moveTo(1.9, -0.75)
  blade.quadraticCurveTo(3.8, -1.2, 5.45, -0.35)
  blade.quadraticCurveTo(5.7, 0.7, 5.2, 1.55)
  blade.quadraticCurveTo(3.6, 0.9, 1.9, 0.75)
  blade.closePath()
  const bladeGeometry = new THREE.ExtrudeGeometry(blade, { depth: 0.08, bevelEnabled: false, curveSegments: 10 })
  bladeGeometry.rotateX(28 * DEG) // pitch

  const ring = new THREE.TorusGeometry(5.72, 0.26, 10, 72)
  const hub = new THREE.CylinderGeometry(1.95, 1.95, 1.4, 40)
  hub.rotateX(90 * DEG)
  const cap = new THREE.CircleGeometry(1.5, 32)
  const strut = rbox(0.45, 5, 0.3, 0.1)
  const screw = new THREE.CylinderGeometry(0.28, 0.28, 2.6, 12)
  screw.rotateX(90 * DEG)

  return (rotors, { label = true } = {}) => {
    const fan = new THREE.Group()
    fan.add(place(frame, m.frame, { cast: true }))
    for (const [x, y] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      fan.add(place(screw, m.rubber, { at: [x * (s - 0.75), y * (s - 0.75), 0], cast: false }))
    }
    fan.add(place(ring, m.rgb, { at: [0, 0, 1.18], cast: false, receive: false }))
    fan.add(place(ring, m.rgbSoft, { at: [0, 0, -1.18], cast: false, receive: false }))
    // the motor struts, on the far face
    for (let i = 0; i < 4; i += 1) {
      const a = (i / 4) * Math.PI * 2 + 45 * DEG
      const st = place(strut, m.frame, { at: [Math.cos(a) * 3.8, Math.sin(a) * 3.8, -1.05], rotate: [0, 0, a + 90 * DEG], cast: false })
      fan.add(st)
    }
    const rotor = new THREE.Group()
    for (let i = 0; i < 9; i += 1) {
      const b = place(bladeGeometry, m.blade, { rotate: [0, 0, (i / 9) * Math.PI * 2], cast: false, receive: false })
      rotor.add(b)
    }
    rotor.add(place(hub, m.frame, { cast: false }))
    if (label) rotor.add(place(cap, m.rgbSoft, { at: [0, 0, 0.72], cast: false }))
    fan.add(rotor)
    rotor.userData.keep = true
    rotor.userData.rigid = true
    rotors.push(rotor)
    return fan
  }
}

// --- the case ------------------------------------------------------------------

function buildCase(m, parts, noAO) {
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: '#2a2c36',
    transparent: true,
    opacity: 0.2,
    roughness: 0.03,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    envMapIntensity: 2.4,
    depthWrite: false,
    side: THREE.DoubleSide,
  })
  // The black ceramic print round a glass panel's edge.
  const frit = standard('#060607', { roughness: 0.3 })

  // Bottom plate, rear panel, motherboard tray.
  parts.push(place(rbox(W, 1, D, 0.3), m.steel, { at: [0, -H / 2 + 0.5, 0] }))
  parts.push(place(rbox(W, H, 0.8, 0.3), m.steel, { at: [0, 0, -D / 2 + 0.4] }))
  parts.push(place(rbox(0.4, H - 2, D - 1.6, 0.1), m.tray, { at: [TRAY_X + 0.2, 0, 0] }))
  // Cable grommets in the tray, along the front edge of the board.
  for (const [y, h] of [[8, 6], [-1, 7], [-12, 6]]) {
    parts.push(place(rbox(0.12, h, 1.6, 0.7), m.rubber, { at: [TRAY_X - 0.02, y, 5.4], cast: false }))
  }
  // The rear chamber is closed off at the front by a steel cover behind the
  // glass: through the case's glass only the components show, never the
  // power supply or the cables.
  parts.push(place(rbox(W / 2 - TRAY_X - 0.4, H - 2.2, 0.6, 0.2), m.steel, { at: [(TRAY_X + W / 2) / 2, 0, D / 2 - 1.1] }))

  // The right panel: steel, perforated where the two side fans breathe in.
  const perforation = perforationAlpha()
  perforation.wrapS = perforation.wrapT = THREE.RepeatWrapping
  perforation.repeat.set(3, 2)
  const rightMesh = place(
    new THREE.PlaneGeometry(D - 8, 15),
    standard('#0e0f12', { roughness: 0.45, metalness: 0.6, alphaMap: perforation, alphaTest: 0.5, side: THREE.DoubleSide }),
    { at: [W / 2 + 0.01, 4, 2], rotate: [0, 90 * DEG, 0], cast: false },
  )
  parts.push(rightMesh)
  noAO.push(rightMesh)
  parts.push(place(rbox(0.6, H, 4, 0.2), m.steel, { at: [W / 2 - 0.3, 0, -D / 2 + 2] }))
  parts.push(place(rbox(0.6, H, 4, 0.2), m.steel, { at: [W / 2 - 0.3, 0, D / 2 - 2] }))
  parts.push(place(rbox(0.6, 16.1, D - 8, 0.2), m.steel, { at: [W / 2 - 0.3, -11.55, 0] }))
  parts.push(place(rbox(0.6, 7.8, D - 8, 0.2), m.steel, { at: [W / 2 - 0.3, 15.4, 0] }))

  // The top: a slotted vent over the radiator, and the brushed-aluminium
  // strip along its right edge where the I/O can be moved.
  const slots = slotsAlpha({ slots: 24 })
  const vent = place(
    new THREE.PlaneGeometry(D - 3, W - 5.4),
    standard('#0d0e11', { roughness: 0.45, metalness: 0.6, alphaMap: slots, alphaTest: 0.5, side: THREE.DoubleSide }),
    { at: [-2.7, H / 2 - 0.05, 0], rotate: [-90 * DEG, 0, 90 * DEG], cast: false },
  )
  parts.push(vent)
  noAO.push(vent)
  parts.push(place(rbox(5.4, 0.9, D, 0.3), m.aluminium, { at: [W / 2 - 2.7, H / 2 - 0.45, 0] }))
  parts.push(place(rbox(W - 5.4, 0.9, 1.5, 0.3), m.steel, { at: [-2.7, H / 2 - 0.45, D / 2 - 0.75] }))
  parts.push(place(rbox(W - 5.4, 0.9, 1.5, 0.3), m.steel, { at: [-2.7, H / 2 - 0.45, -D / 2 + 0.75] }))

  // The glass: front and left, meeting with no pillar. Each pane carries a
  // thin black print along its edges, the way tempered panels do.
  const front = place(new THREE.PlaneGeometry(W - 0.4, H - 1.4), glassMaterial, {
    at: [-0.2, 0.2, D / 2 - 0.1],
    cast: false,
    receive: false,
    name: 'pc-glass-front',
  })
  const side = place(new THREE.PlaneGeometry(D - 0.6, H - 1.4), glassMaterial, {
    at: [-W / 2 + 0.1, 0.2, -0.3],
    rotate: [0, -90 * DEG, 0],
    cast: false,
    receive: false,
    name: 'pc-glass-side',
  })
  parts.push(front, side)
  noAO.push(front, side)
  const fritBands = [
    // front pane: top, bottom, right
    [W - 0.4, 0.7, 0.05, [-0.2, H / 2 - 1.05, D / 2 - 0.12]],
    [W - 0.4, 0.7, 0.05, [-0.2, -H / 2 + 1.05, D / 2 - 0.12]],
    [0.7, H - 1.4, 0.05, [W / 2 - 0.75, 0.2, D / 2 - 0.12]],
    // side pane: top, bottom, rear
    [0.05, 0.7, D - 0.6, [-W / 2 + 0.12, H / 2 - 1.05, -0.3]],
    [0.05, 0.7, D - 0.6, [-W / 2 + 0.12, -H / 2 + 1.05, -0.3]],
    [0.05, H - 1.4, 0.7, [-W / 2 + 0.12, 0.2, -D / 2 + 0.35]],
  ]
  fritBands.forEach(([w, h, d, at]) => parts.push(place(rbox(w, h, d, 0.02), frit, { at, cast: false })))

  // The front I/O, on the bottom edge under the front glass: a strip of
  // brushed aluminium with the ports and the power button.
  parts.push(place(rbox(W, 1.1, 2, 0.3), m.aluminium, { at: [0, -H / 2 + 0.55, D / 2 - 1] }))
  const portMaterial = standard('#050506', { roughness: 0.8 })
  ;[[4.5, 1.3], [7, 1.3], [9.3, 0.9]].forEach(([x, w]) =>
    parts.push(place(rbox(w, 0.42, 0.1, 0.08), portMaterial, { at: [x, -H / 2 + 0.55, D / 2 + 0.01], cast: false })),
  )
  parts.push(place(new THREE.CircleGeometry(0.22, 16), portMaterial, { at: [2.6, -H / 2 + 0.55, D / 2 + 0.02], cast: false }))
  parts.push(place(new THREE.CylinderGeometry(0.42, 0.42, 0.2, 24), m.aluminium, { at: [11.4, -H / 2 + 0.55, D / 2 + 0.05], rotate: [90 * DEG, 0, 0], cast: false }))
  parts.push(place(new THREE.TorusGeometry(0.45, 0.05, 6, 32), m.rgb, { at: [11.4, -H / 2 + 0.55, D / 2 + 0.16], cast: false }))

  // Feet: four short aluminium bars.
  for (const z of [-D / 2 + 4, D / 2 - 4]) {
    for (const x of [-W / 2 + 3, W / 2 - 3]) {
      parts.push(place(rbox(4.2, 1.2, 2.6, 0.5), m.aluminium, { at: [x, -H / 2 - 0.6, z] }))
    }
  }
}

// --- the motherboard -----------------------------------------------------------

function buildBoard(m, parts) {
  const face = TRAY_X - 0.05
  const top = H / 2 - 8.2
  const centreY = top - 30.5 / 2
  const rearZ = -D / 2 + 1.1
  const centreZ = rearZ + 24.4 / 2

  parts.push(place(new THREE.PlaneGeometry(24.4, 30.5), m.pcb, {
    at: [face, centreY, centreZ],
    rotate: [0, -90 * DEG, 0],
    cast: false,
  }))

  // VRM heatsinks: one above the socket, one down the rear edge — finned,
  // gunmetal, with a lavender line on the rear one.
  parts.push(place(rbox(2.2, 3.2, 10, 0.4), m.gunmetal, { at: [face - 1.1, top - 3, rearZ + 9.5] }))
  parts.push(place(rbox(2.2, 11, 3.2, 0.4), m.gunmetal, { at: [face - 1.1, top - 8, rearZ + 3.2] }))
  for (let i = 0; i < 7; i += 1) {
    parts.push(place(rbox(0.3, 3.4, 0.15, 0.05), m.gunmetalDark, { at: [face - 2.25, top - 3, rearZ + 5.5 + i * 1.3], cast: false }))
  }
  // The rear I/O shroud, with the board's own strip of light.
  parts.push(place(rbox(3, 12.5, 3.4, 0.6), m.gunmetalDark, { at: [face - 1.5, top - 7.5, rearZ + 1.4] }))
  parts.push(place(rbox(0.08, 10, 0.3, 0.04), m.rgb, { at: [face - 3.05, top - 7.5, rearZ + 2.9], cast: false }))
  // Chipset and M.2 heatsinks lower down.
  parts.push(place(rbox(1.2, 6, 6, 0.6), m.gunmetal, { at: [face - 0.6, top - 24, rearZ + 18] }))
  parts.push(place(rbox(0.7, 2.6, 11, 0.3), m.gunmetal, { at: [face - 0.35, top - 18.5, rearZ + 9] }))
  parts.push(place(rbox(0.7, 2.6, 11, 0.3), m.gunmetal, { at: [face - 0.35, top - 26.5, rearZ + 9] }))

  // Memory: two sticks beside the socket, a lavender bar along each top edge.
  for (let i = 0; i < 2; i += 1) {
    const z = rearZ + 15.8 + i * 1.4
    parts.push(place(rbox(4.2, 13.3, 0.72, 0.15), m.gunmetalDark, { at: [face - 2.1, top - 9.5, z] }))
    parts.push(place(rbox(0.7, 13, 0.6, 0.2), m.rgb, { at: [face - 4.45, top - 9.5, z], cast: false }))
  }

  // The 24-pin connector and its sleeved cable, which dives into the tray.
  parts.push(place(rbox(1.6, 5.4, 1.3, 0.2), m.rubber, { at: [face - 0.8, top - 11, rearZ + 23.2] }))
  for (let i = 0; i < 6; i += 1) {
    parts.push(place(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
      new THREE.Vector3(face - 1.6, top - 8.8 - i * 0.85, rearZ + 23.2),
      new THREE.Vector3(face - 3.4, top - 8.8 - i * 0.85, rearZ + 24.8),
      new THREE.Vector3(face - 0.4, top - 8.6 - i * 0.85, rearZ + 25.3),
    ]), 16, 0.32, 8), i % 2 ? m.sleeveLavender : m.sleeve, { cast: false }))
  }
  // The 8-pin CPU power, at the top-rear corner.
  for (let i = 0; i < 3; i += 1) {
    parts.push(place(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
      new THREE.Vector3(face - 1, top - 0.8, rearZ + 4 + i * 0.75),
      new THREE.Vector3(face - 2.4, top + 0.3, rearZ + 4 + i * 0.75),
      new THREE.Vector3(face + 0.2, top + 1.2, rearZ + 4 + i * 0.75),
    ]), 12, 0.3, 8), m.sleeve, { cast: false }))
  }

  return { face, top, rearZ, socket: new THREE.Vector3(face, top - 9, rearZ + 10.4) }
}

// --- the cooler ----------------------------------------------------------------

function buildCooler(m, parts, rotors, fan, socket) {
  // Radiator under the top vent, its three fans below it.
  const radiatorY = H / 2 - 1.1 - 1.9
  const radiatorX = -4.4
  parts.push(place(rbox(12, 3.8, 39.8, 0.3), standard('#ffffff', { map: radiatorTexture(), roughness: 0.6, metalness: 0.4 }), {
    at: [radiatorX, radiatorY, -0.3],
  }))
  for (const z of [-19.6, 19.0]) {
    parts.push(place(rbox(12.6, 4.2, 1.6, 0.4), m.frame, { at: [radiatorX, radiatorY, z] }))
  }
  for (let i = 0; i < 3; i += 1) {
    const f = fan(rotors)
    f.position.set(radiatorX, radiatorY - 3.2, -12.3 + i * 12.2)
    f.rotation.x = 90 * DEG // facing down into the case
    parts.push(f)
  }

  // The pump block: a rounded square with the turbofan intake on its face —
  // a deep ring of light round a small decorative rotor — and, at its top,
  // the vent of the VRM fan.
  const block = new THREE.Group()
  block.position.copy(socket)
  block.rotation.y = -90 * DEG // its face looks out through the side glass
  block.add(place(rbox(7.8, 7.8, 3.6, 1.6, 4), m.frame, { at: [0, 0, 1.8] }))
  block.add(place(rbox(6.8, 6.8, 0.6, 1.3, 4), m.gunmetalDark, { at: [0, 0, 3.75] }))
  block.add(place(new THREE.TorusGeometry(2.55, 0.42, 16, 64), m.frame, { at: [0, -0.2, 4.1] }))
  block.add(place(new THREE.TorusGeometry(2.25, 0.16, 10, 64), m.rgb, { at: [0, -0.2, 4.2], cast: false }))
  const intake = new THREE.Group()
  intake.position.set(0, -0.2, 3.9)
  for (let i = 0; i < 11; i += 1) {
    intake.add(place(rbox(1.9, 0.5, 0.08, 0.05), m.gunmetal, {
      at: [Math.cos((i / 11) * Math.PI * 2) * 1.1, Math.sin((i / 11) * Math.PI * 2) * 1.1, 0],
      rotate: [24 * DEG, 0, (i / 11) * Math.PI * 2],
      cast: false,
    }))
  }
  intake.add(place(new THREE.CylinderGeometry(0.55, 0.7, 0.6, 24), m.gunmetal, { rotate: [90 * DEG, 0, 0], cast: false }))
  block.add(intake)
  intake.userData.keep = true
  intake.userData.rigid = true
  rotors.push(intake)
  // The VRM fan's slot along the block's top edge.
  block.add(place(rbox(5.2, 0.5, 2.6, 0.2), m.rubber, { at: [0, 3.95, 2.2], cast: false }))
  block.add(place(rbox(4.6, 0.08, 0.2, 0.04), m.rgbSoft, { at: [0, 4.2, 3.4], cast: false }))
  parts.push(block)

  // The hoses: thick, sleeved, leaving the block's side and climbing to the
  // radiator's front tank.
  block.updateMatrixWorld(true)
  const exit = block.localToWorld(new THREE.Vector3(3.6, 1.5, 1.8))
  const exit2 = block.localToWorld(new THREE.Vector3(3.6, -1.5, 1.8))
  ;[exit, exit2].forEach((start, index) => {
    parts.push(place(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
      start,
      start.clone().add(new THREE.Vector3(-1.5, 0, 4)),
      new THREE.Vector3(radiatorX - 2 + index * 3, radiatorY - 6, 12),
      new THREE.Vector3(radiatorX - 2 + index * 3, radiatorY - 1.4, 18.6),
    ]), 40, 0.62, 10), m.sleeve))
  })
}

// --- the graphics card -----------------------------------------------------------

function buildGraphicsCard(m, parts, rotors, fan, board) {
  const L = 32.9
  const T = 6.25
  const P = 14 // how far it stands out from the board
  const card = new THREE.Group()
  // The slot sits 16 cm below the top of the board; the card hangs below it
  // with its fans facing down at the bottom fans.
  card.position.set(board.face - 0.3 - P / 2, board.top - 16.2 - T / 2, board.rearZ + L / 2 - 0.4)

  // Body and shroud.
  card.add(place(rbox(P, T - 0.6, L, 0.5), m.gunmetal, { at: [0, -0.3, 0] }))
  // Backplate on top, with its vent pattern and mark.
  card.add(place(rbox(P, 0.35, L, 0.15), m.gunmetalDark, { at: [0, T / 2 - 0.18, 0] }))
  card.add(place(new THREE.PlaneGeometry(L - 0.6, P - 0.6), standard('#ffffff', { map: backplateTexture('TUF'), roughness: 0.45, metalness: 0.7 }), {
    at: [0, T / 2 + 0.01, 0],
    rotate: [-90 * DEG, 0, -90 * DEG],
    cast: false,
  }))

  // The edge that faces the glass: diagonal webs over a dark ground, the
  // branding, and the lavender light bar.
  const edgeX = -P / 2 - 0.02
  card.add(place(new THREE.PlaneGeometry(L - 1, T - 1.2), standard('#1b1c20', { roughness: 0.5, metalness: 0.5 }), {
    at: [edgeX, -0.2, 0],
    rotate: [0, -90 * DEG, 0],
    cast: false,
  }))
  for (let i = 0; i < 7; i += 1) {
    card.add(place(rbox(0.5, T - 1, 0.7, 0.15), m.gunmetal, {
      at: [edgeX - 0.2, -0.2, -L / 2 + 4 + i * 4.2],
      rotate: [28 * DEG, 0, 0],
      cast: false,
    }))
  }
  const logo = labelTexture('TUF GAMING', { width: 512, height: 96, size: 56 })
  card.add(place(new THREE.PlaneGeometry(8.4, 1.6), new THREE.MeshStandardMaterial({ map: logo, transparent: true, roughness: 0.4, metalness: 0.4 }), {
    at: [edgeX - 0.46, 0.7, 7.5],
    rotate: [0, -90 * DEG, 0],
    cast: false,
  }))
  const model = labelTexture('GEFORCE RTX 5070', { width: 640, height: 80, size: 40, weight: 700, color: '#b9bec6', spacing: 6 })
  card.add(place(new THREE.PlaneGeometry(8, 1), new THREE.MeshStandardMaterial({ map: model, transparent: true, roughness: 0.4 }), {
    at: [edgeX - 0.46, -1.3, -8.5],
    rotate: [0, -90 * DEG, 0],
    cast: false,
  }))
  card.add(place(rbox(0.12, 0.36, L - 6, 0.05), m.rgb, { at: [edgeX - 0.08, T / 2 - 0.9, 1], cast: false }))

  // Three axial fans underneath.
  for (let i = 0; i < 3; i += 1) {
    const f = fan(rotors, { label: false })
    f.scale.setScalar(0.85)
    f.position.set(0, -T / 2 - 0.2, -L / 2 + 5.8 + i * 10.6)
    f.rotation.x = -90 * DEG
    card.add(f)
  }

  // The bracket at the rear, and the power cable from the top edge.
  card.add(place(rbox(P + 0.6, T + 0.4, 0.2, 0.05), standard('#9aa0a7', { roughness: 0.3, metalness: 0.95 }), {
    at: [0.1, 0, -L / 2 - 0.1],
  }))
  card.add(place(rbox(2.2, 1, 1.2, 0.2), m.rubber, { at: [-P / 2 + 2, T / 2 + 0.5, 4] }))
  for (let i = 0; i < 4; i += 1) {
    card.add(place(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
      new THREE.Vector3(-P / 2 + 1.6 + i * 0.3, T / 2 + 1, 4),
      new THREE.Vector3(-P / 2 + 2 + i * 0.3, T / 2 + 4, 6),
      new THREE.Vector3(P / 2 - 1 + i * 0.3, T / 2 + 5, 11),
      new THREE.Vector3(P / 2 + 0.4, T / 2 + 4, 13.4),
    ]), 24, 0.26, 8), i % 2 ? m.sleeveLavender : m.sleeve, { cast: false }))
  }

  parts.push(card)
}

// --- everything ------------------------------------------------------------------

export function buildComputer() {
  const m = materials()
  const parts = []
  const noAO = []
  const rotors = []
  const fan = fanParts(m)

  buildCase(m, parts, noAO)
  const board = buildBoard(m, parts)

  // Everything is built in the case's own space, then grouped.
  const caseGroup = group([], { name: 'computer' })
  buildCooler(m, parts, rotors, fan, board.socket)
  buildGraphicsCard(m, parts, rotors, fan, board)

  // Bottom tray: three fans tilted 10° towards the board.
  for (let i = 0; i < 3; i += 1) {
    const f = fan(rotors)
    f.position.set(-5.4, -H / 2 + 2.6, -13.2 + i * 12.4)
    f.rotation.set(-90 * DEG, 10 * DEG, 0)
    parts.push(f)
  }
  parts.push(place(rbox(14, 0.4, 38, 0.1), m.steel, { at: [-5.4, -H / 2 + 1.1, -0.6], rotate: [0, 0, 10 * DEG] }))

  // Rear exhaust, beside the board's I/O.
  const rear = fan(rotors)
  rear.position.set(-4.2, H / 2 - 13.6, -D / 2 + 2.1)
  parts.push(rear)

  // The two side fans. One sits on the right panel in the rear chamber,
  // out of sight behind the board; the other is mounted at the same height
  // on the component side of the tray, in front of the board, its light
  // turned to the glass.
  const hidden = fan(rotors)
  hidden.position.set(W / 2 - 2, 4, -4.2)
  hidden.rotation.y = 90 * DEG
  parts.push(hidden)
  const side = fan(rotors)
  side.position.set(TRAY_X - 1.5, 4, 12.4)
  side.rotation.y = -90 * DEG
  parts.push(side)

  // The power supply in the rear chamber, under the side fans.
  parts.push(place(rbox(8.4, 8.6, 15, 0.4), standard('#0d0d10', { roughness: 0.5, metalness: 0.4 }), {
    at: [TRAY_X + 4.6, -H / 2 + 5.4, -D / 2 + 8.6],
  }))

  // The light inside: lavender from the fans, the strongest above and below.
  const glowTop = new THREE.PointLight(palette.lavender, 380, 60, 2)
  glowTop.position.set(-5, H / 2 - 9, 0)
  const glowBottom = new THREE.PointLight(palette.lavender, 300, 50, 2)
  glowBottom.position.set(-5, -H / 2 + 6, 2)
  // what spills through the glass onto the desk and the wall
  const spill = new THREE.PointLight(palette.lavender, 520, 110, 2)
  spill.position.set(-W / 2 - 4, -4, D / 2)
  parts.push(glowTop, glowBottom, spill)

  parts.forEach((p) => caseGroup.add(p))
  caseGroup.position.set(58, DESK.top + H / 2 + 1.2, -8)
  caseGroup.rotation.y = -7 * DEG

  // The RGB breathes, slowly; the fans turn.
  const update = (delta, elapsed) => {
    rotors.forEach((rotor, index) => {
      rotor.rotation.z += delta * (index % 3 === 0 ? 7.5 : 8.5)
    })
    const breath = 0.82 + 0.18 * Math.sin(elapsed * 0.9)
    m.rgb.emissiveIntensity = 2.6 * breath
    m.rgbSoft.emissiveIntensity = 1.2 * breath
    m.blade.emissiveIntensity = 0.9 * breath
    glowTop.intensity = 380 * breath
    glowBottom.intensity = 300 * breath
  }

  return { computer: caseGroup, update, noAO }
}
