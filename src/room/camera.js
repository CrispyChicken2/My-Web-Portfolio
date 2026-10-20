import * as THREE from 'three'
import { SCREEN } from './world/monitor'
import { cubicBezier, easeInOutQuint, easeOutExpo, fitDistance, idleSway } from './framing'

// Where the camera can be, and how it travels between those places.
//
// Five Viewpoints, each a function of the moment rather than a fixed pose:
//   loading — far out and high, before the Visitor starts;
//   idle    — a slow orbit round the desk;
//   desk    — sat in front of it, leaning with the pointer;
//   monitor — square on to the Screen, close enough to use it;
//   dog     — crouched by the dog's bed, the whole bed in view.
// A move between two of them starts from wherever the camera actually is
// and lands on where the destination is *now*, so a Viewpoint that drifts
// is met without a jump.

const FOV = 32
const PIVOT = new THREE.Vector3(4, 84, 0)

export const MOVES = {
  start: { duration: 2600, ease: easeOutExpo },
  toggle: { duration: 1100, ease: easeInOutQuint },
  enterMonitor: { duration: 1900, ease: cubicBezier(0.13, 0.99, 0, 1) },
  leaveMonitor: { duration: 1100, ease: easeInOutQuint },
  enterDog: { duration: 1600, ease: cubicBezier(0.13, 0.99, 0, 1) },
  leaveDog: { duration: 1100, ease: easeInOutQuint },
}

export function createCamera() {
  return new THREE.PerspectiveCamera(FOV, window.innerWidth / window.innerHeight, 2, 3000)
}

// `dog` is where the dog's bed is: { centre, from } — the point to look at,
// and the direction (towards the room) to look at it from.
export function createRig(camera, anchor, { reducedMotion, dog }) {
  const pointer = new THREE.Vector2() // -1..1, smoothed
  const pointerTarget = new THREE.Vector2()
  const screenCentre = new THREE.Vector3()
  const screenNormal = new THREE.Vector3()
  let elapsed = 0

  const pose = () => ({ position: new THREE.Vector3(), target: new THREE.Vector3() })

  const viewpoints = {
    loading(out) {
      const angle = -58 * THREE.MathUtils.DEG2RAD
      out.position.set(Math.sin(angle) * 640, 430, Math.cos(angle) * 640)
      out.target.set(0, 40, 0)
    },
    idle(out) {
      const sway = reducedMotion
        ? { angle: 0, height: 0 }
        : idleSway(elapsed, { swing: 0.27, period: 72, lift: 9, liftPeriod: 47 })
      const angle = -31 * THREE.MathUtils.DEG2RAD + sway.angle
      const radius = 282 + (camera.aspect < 1.2 ? 120 : 0)
      out.position.set(PIVOT.x + Math.sin(angle) * radius, 172 + sway.height, PIVOT.z + Math.cos(angle) * radius)
      out.target.copy(PIVOT)
    },
    desk(out) {
      const back = 112 + Math.max(0, 1.6 - camera.aspect) * 90
      out.position.set(-2 + pointer.x * 16, 128 - pointer.y * 7, back)
      out.target.set(-2 + pointer.x * 7, 94 - pointer.y * 4, -10)
    },
    monitor(out) {
      anchor.getWorldPosition(screenCentre)
      screenNormal.set(0, 0, 1).transformDirection(anchor.matrixWorld)
      const distance = fitDistance({
        width: SCREEN.width,
        height: SCREEN.height,
        fov: FOV,
        aspect: camera.aspect,
        margin: 0.045,
      })
      out.position.copy(screenCentre).addScaledVector(screenNormal, distance)
      out.target.copy(screenCentre)
    },
    // Crouched by the dog's bed: the same glide in as the monitor, but framed
    // wider — the whole bed, his plushies and a little floor round it — and
    // leaning gently with the pointer.
    dog(out) {
      if (!dog) return viewpoints.idle(out)
      const distance = fitDistance({ width: 118, height: 66, fov: FOV, aspect: camera.aspect, margin: 0.08 })
      out.position.copy(dog.centre).addScaledVector(dog.from, distance)
      out.position.x += pointer.x * 6
      out.position.y -= pointer.y * 4
      out.target.copy(dog.centre)
      out.target.x += pointer.x * 2
      return undefined
    },
  }

  const live = pose()
  const from = pose()
  const current = pose()
  let active = 'loading'
  let move = null // { to, start, duration, ease, done }

  viewpoints.loading(current)

  const go = (to, { duration, ease }, done) => {
    if (move ? move.to === to : active === to) return
    from.position.copy(current.position)
    from.target.copy(current.target)
    move = { to, start: elapsed, duration: reducedMotion ? 0 : duration / 1000, ease, done }
  }

  const update = (delta) => {
    elapsed += delta
    const follow = reducedMotion ? 0 : Math.min(1, delta * 3.2)
    pointer.x += (pointerTarget.x - pointer.x) * follow
    pointer.y += (pointerTarget.y - pointer.y) * follow

    if (move) {
      viewpoints[move.to](live)
      const p = move.duration === 0 ? 1 : Math.min(1, (elapsed - move.start) / move.duration)
      const t = move.ease(p)
      current.position.lerpVectors(from.position, live.position, t)
      current.target.lerpVectors(from.target, live.target, t)
      if (p >= 1) {
        active = move.to
        const { done } = move
        move = null
        done?.()
      }
    } else {
      viewpoints[active](current)
    }

    camera.position.copy(current.position)
    camera.lookAt(current.target)
  }

  return {
    go,
    update,
    // The Viewpoint the camera is at or heading to.
    get view() {
      return move ? move.to : active
    },
    setPointer(x, y) {
      pointerTarget.set(x, y)
    },
    distanceTo(point) {
      return camera.position.distanceTo(point)
    },
  }
}

