import * as THREE from 'three'
import { palette } from '../palette'
import { DESK } from './desk'
import { DEG, group, place, rbox, standard } from './kit'

// A low, sculpted wireless mouse. It follows the pointer on the Screen: when
// the cursor crosses the monitor, the mouse slides across the mat with it,
// and its buttons dip when they are clicked.

const REST = new THREE.Vector3(24, DESK.top + 0.35, 19)
const TRAVEL = { x: 7, z: 5 }

function shellGeometry() {
  // A sphere, stretched into a mouse's proportions, with its lower half
  // pressed flat onto the mat and its back swelled under the palm.
  const geometry = new THREE.SphereGeometry(1, 64, 40)
  const position = geometry.attributes.position
  for (let i = 0; i < position.count; i += 1) {
    let x = position.getX(i)
    let y = position.getY(i)
    let z = position.getZ(i)
    const back = THREE.MathUtils.smoothstep(z, -1, 1) // 0 at the front, 1 at the back
    x *= 3.15 * (0.86 + 0.14 * back)
    z *= 5.9
    y = y < 0 ? y * 0.25 : y * (2.2 + 1.4 * Math.sin(back * Math.PI * 0.85))
    position.setXYZ(i, x, y, z)
  }
  geometry.computeVertexNormals()
  return geometry
}

export function buildMouse() {
  const body = standard('#1c1e23', { roughness: 0.46, metalness: 0.1 })
  const shell = place(shellGeometry(), body, { at: [0, 0.3, 0] })
  const seam = place(rbox(0.12, 0.6, 4.4, 0.05), standard('#0b0c0e', { roughness: 0.9 }), {
    at: [0, 2.35, -2.9],
    rotate: [-12 * DEG, 0, 0],
    cast: false,
  })
  const wheel = place(
    new THREE.CylinderGeometry(0.62, 0.62, 0.55, 28),
    standard(palette.graphite, { roughness: 0.4, metalness: 0.7 }),
    { at: [0, 2.3, -3.1], rotate: [0, 0, 90 * DEG] },
  )
  const skirt = place(
    new THREE.TorusGeometry(1, 0.06, 6, 64),
    standard(palette.aluminium, { roughness: 0.3, metalness: 0.9 }),
    { at: [0, 0.32, 0], rotate: [90 * DEG, 0, 0], scale: [3.05, 5.75, 1], cast: false },
  )

  const mouse = group([shell, seam, wheel, skirt], { name: 'mouse' })
  mouse.userData.keep = true // it follows the cursor
  mouse.position.copy(REST)
  mouse.rotation.y = -6 * DEG

  // Where the pointer sits on the Screen, 0..1 on each axis, and whether a
  // button is down.
  const target = new THREE.Vector2(0.5, 0.5)
  let click = 0
  let clickTarget = 0

  const point = (u, v) => target.set(THREE.MathUtils.clamp(u, 0, 1), THREE.MathUtils.clamp(v, 0, 1))
  const button = (down) => {
    clickTarget = down ? 1 : 0
  }

  const update = (delta) => {
    const x = REST.x + (target.x - 0.5) * TRAVEL.x
    const z = REST.z + (target.y - 0.5) * TRAVEL.z
    const ease = Math.min(1, delta * 10)
    mouse.position.x += (x - mouse.position.x) * ease
    mouse.position.z += (z - mouse.position.z) * ease
    click += (clickTarget - click) * Math.min(1, delta * 40)
    shell.position.y = 0.3 - click * 0.08
  }

  return { mouse, point, button, update }
}
