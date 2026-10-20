import * as THREE from 'three'
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js'
import { palette } from '../palette'
import { SCREEN } from './monitor'
import { WALL_X, WALL_Z } from './room'
import { DESK } from './desk'

// An evening room. Four sources, each with a job:
//   · the window — cool night light from the left, the only hard shadows;
//   · the bias strip — ice-cyan washed up the wall behind the desk;
//   · the monitor — its own glow, which only exists once the Screen is on;
//   · the light bar — a warm pool on the keyboard (built in monitor.js).
// Plus a faint sky/ground fill so nothing is pure black.

export function buildLighting(anchor) {
  RectAreaLightUniformsLib.init()
  const lights = new THREE.Group()
  lights.name = 'lighting'

  lights.add(new THREE.HemisphereLight(palette.hemiSky, palette.hemiGround, 0.5))

  const moon = new THREE.DirectionalLight(palette.moon, 1.15)
  moon.position.set(WALL_X - 60, 230, 150)
  moon.target.position.set(10, 70, 0)
  moon.castShadow = true
  moon.shadow.mapSize.set(2048, 2048)
  moon.shadow.camera.left = -170
  moon.shadow.camera.right = 170
  moon.shadow.camera.top = 150
  moon.shadow.camera.bottom = -110
  moon.shadow.camera.near = 50
  moon.shadow.camera.far = 600
  moon.shadow.bias = -0.0005
  moon.shadow.normalBias = 0.6
  moon.shadow.radius = 5
  lights.add(moon, moon.target)

  const windowGlow = new THREE.RectAreaLight(palette.moon, 2.2, 118, 136)
  windowGlow.position.set(WALL_X + 1.5, 158, 92)
  windowGlow.lookAt(0, 140, 92)
  lights.add(windowGlow)

  const bias = new THREE.RectAreaLight(palette.ice, 45, 140, 2.5)
  bias.position.set(0, DESK.top - 4.5, -DESK.depth / 2 + 1.5)
  bias.lookAt(0, DESK.top + 30, WALL_Z)
  lights.add(bias)

  // The screen's glow sits on the glass and shines out of it. Off until the
  // Screen powers on.
  const screenGlow = new THREE.RectAreaLight(palette.screenGlow, 0, SCREEN.width, SCREEN.height)
  screenGlow.position.set(0, 0, 0.3)
  screenGlow.rotation.y = Math.PI // a RectAreaLight shines down its -z; turn it to face out
  anchor.add(screenGlow)

  const fill = new THREE.AmbientLight('#8090b0', 0.06)
  lights.add(fill)

  const setScreen = (level) => {
    screenGlow.intensity = 3.2 * level
  }

  return { lights, setScreen }
}

export function buildEnvironment(renderer, scene) {
  // Reflections come from a generated room rather than a downloaded HDR, so
  // nothing leaves the origin. Kept low: it is a night scene.
  return import('three/addons/environments/RoomEnvironment.js').then(({ RoomEnvironment }) => {
    const pmrem = new THREE.PMREMGenerator(renderer)
    const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = environment
    scene.environmentIntensity = 0.16
    pmrem.dispose()
  })
}
