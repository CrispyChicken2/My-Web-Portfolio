import * as THREE from 'three'
import { CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { palette } from './palette'
import { MOVES, createCamera, createRig } from './camera'
import { createScreen } from './screen'
import { createAudio } from './audio'
import { clamp01 } from './framing'
import { buildRoom } from './world/room'
import { buildCables, buildDesk } from './world/desk'
import { buildMonitor } from './world/monitor'
import { KEYBOARD_X, buildKeyboard } from './world/keyboard'
import { buildMouse } from './world/mouse'
import { buildComputer } from './world/computer'
import { buildChair } from './world/chair'
import { buildProps } from './world/props'
import { buildDogCorner } from './world/dogbed'
import { buildLaundry, buildSlippers } from './world/laundry'
import { buildEnvironment, buildLighting } from './world/lighting'
import { mergeRigid, mergeStatic } from './world/merge'

// The Room: builds the scene, runs the loop, and wires the Visitor's input
// to the camera, the keyboard, the mouse and the sound.
//
// It owns no interface of its own. The loader, the overlay and the start
// button are React (./ui), and they talk to the Room through `events` and
// the handful of methods below.

const frame = () => new Promise((resolve) => requestAnimationFrame(() => resolve()))

// Three quality steps. The Room starts on the step the graphics chip is
// likely to hold (see guessQuality) and steps down, one at a time, while the
// first seconds run slow. `?quality=high|medium|low` forces one.
//   · high   — ambient occlusion, bloom, fur, up to 2× pixels;
//   · medium — bloom and fur, up to 1.5× pixels;
//   · low    — no post-processing, no fur (the fabrics keep their sheen),
//              smaller shadow maps, 1× pixels.
const QUALITY = [
  { name: 'high', pixelRatio: 2, ao: true, bloom: true, fur: true, shadow: 2048 },
  { name: 'medium', pixelRatio: 1.5, ao: false, bloom: true, fur: true, shadow: 2048 },
  { name: 'low', pixelRatio: 1, ao: false, bloom: false, fur: false, shadow: 1024 },
]

// A first guess from the graphics chip's name, so a weak laptop starts light
// instead of stuttering through seconds of the full Room before stepping
// down. Integrated Intel HD/UHD graphics, phones' and software renderers, or
// a machine with little memory or few cores: low. Recent integrated
// graphics (Iris Xe, Radeon integrated): medium. Anything else: high.
function guessQuality(renderer) {
  const forced = ['high', 'medium', 'low'].indexOf(new URLSearchParams(window.location.search).get('quality'))
  if (forced >= 0) return forced
  let chip = ''
  try {
    const gl = renderer.getContext()
    const info = gl.getExtension('WEBGL_debug_renderer_info')
    chip = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : ''
  } catch {
    /* no chip name: guess from the machine */
  }
  const cores = navigator.hardwareConcurrency || 8
  const memory = navigator.deviceMemory || 8
  if (/SwiftShader|llvmpipe|Software|Mali|Adreno|PowerVR|Intel\(R\) (U)?HD|Intel (U)?HD/i.test(chip) || cores <= 4 || memory <= 4) return 2
  if (/Iris|Radeon\(TM\) Graphics|Radeon Graphics|Vega/i.test(chip)) return 1
  return 0
}

// The character a key on the overlay stands for, as the code of the key
// that types it — so the overlay typing itself out presses real keys.
function codeFor(character) {
  if (/[a-z]/i.test(character)) return `Key${character.toUpperCase()}`
  if (/[0-9]/.test(character)) return `Digit${character}`
  const map = { ' ': 'Space', ':': 'Semicolon', '.': 'Period', ',': 'Comma', '-': 'Minus', '/': 'Slash', '&': 'Digit7', "'": 'Quote' }
  return map[character] ?? null
}

export class Experience {
  constructor({ mount, events, reducedMotion }) {
    this.mount = mount
    this.events = events
    this.reducedMotion = reducedMotion
    this.started = false
    this.muted = readMuted()
    this.screenLevel = 0
    this.screenTarget = 0
    this.qualityIndex = 0
    this.frameTimes = []
  }

  async build(report) {
    // --- the engine ------------------------------------------------------
    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' })
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.domElement.className = 'room-canvas'
    this.mount.appendChild(renderer.domElement)
    renderer.domElement.addEventListener('webglcontextlost', (event) => {
      event.preventDefault()
      this.events.emit('lost')
    })
    this.renderer = renderer

    const css = new CSS3DRenderer()
    css.setSize(window.innerWidth, window.innerHeight)
    css.domElement.className = 'room-css'
    this.mount.appendChild(css.domElement)
    this.css = css

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(palette.night)
    scene.fog = new THREE.Fog(palette.night, 520, 1300)
    this.scene = scene
    this.cssScene = new THREE.Scene()
    const camera = createCamera()
    this.camera = camera
    report('engine')
    await frame()

    // --- the world ---------------------------------------------------------
    const noAO = []
    scene.add(buildRoom())
    report('room')
    await frame()

    scene.add(buildDesk(), buildCables())
    report('desk')
    await frame()

    const { monitor, anchor } = buildMonitor()
    scene.add(monitor)
    scene.updateMatrixWorld(true)
    this.anchor = anchor
    report('monitor')
    await frame()

    const keyboard = buildKeyboard()
    const mouse = buildMouse()
    scene.add(keyboard.keyboard, mouse.mouse)
    noAO.push(keyboard.keyboard.children.at(-1))
    this.keyboard = keyboard
    this.mouse = mouse
    report('keyboard')
    await frame()

    const computer = buildComputer()
    scene.add(computer.computer)
    noAO.push(...computer.noAO)
    this.computer = computer
    report('computer')
    await frame()

    const chair = buildChair()
    scene.add(chair.chair)
    noAO.push(...chair.noAO)
    report('chair')
    await frame()

    const props = buildProps({ keyboardX: KEYBOARD_X })
    scene.add(props.props)
    noAO.push(...props.noAO)
    this.props = props
    const corner = buildDogCorner()
    const slippers = buildSlippers()
    scene.add(corner.corner, buildLaundry(), slippers.slippers)
    noAO.push(...corner.noAO, ...slippers.noAO)
    this.dog = corner
    report('props')
    await frame()

    const lighting = buildLighting(anchor)
    scene.add(lighting.lights)
    this.lighting = lighting
    await buildEnvironment(renderer, scene)
    report('lighting')
    await frame()

    // --- the camera and the Screen ----------------------------------------
    scene.updateMatrixWorld(true)
    // The dog's bed: where the dog Viewpoint looks, and the invisible
    // ellipsoid round the bed the pointer is tested against (cheaper than
    // the dog's own mesh, and a little larger, so the hover is easy to find).
    const bed = corner.corner.getObjectByName('dog-bed')
    const centre = bed.localToWorld(new THREE.Vector3(0, 16, 2))
    const from = new THREE.Vector3(-0.62, 0.52, 0.58).normalize()
    this.dogHit = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), new THREE.MeshBasicMaterial())
    this.dogHit.position.copy(bed.localToWorld(new THREE.Vector3(0, 12, 0)))
    this.dogHit.quaternion.copy(bed.getWorldQuaternion(new THREE.Quaternion()))
    this.dogHit.scale.set(50, 26, 40)
    this.dogHit.updateMatrixWorld(true)
    this.rig = createRig(camera, anchor, { reducedMotion: this.reducedMotion, dog: { centre, from } })
    this.audio = createAudio()
    this.audio.setMuted(this.muted)

    const screen = createScreen(anchor, {
      onEnter: () => this.enterMonitor(),
      onLeave: () => this.leaveMonitor(),
      onKey: (code, down, repeat) => this.key(code, down, repeat),
      onPointer: (u, v) => mouse.point(u, v),
      onButton: (down) => {
        mouse.button(down)
        this.audio.click(down)
      },
      onMessage: (message) => this.message(message),
    })
    screen.place()
    this.cssScene.add(screen.object)
    this.screen = screen
    await Promise.race([
      new Promise((resolve) => screen.iframe.addEventListener('load', resolve, { once: true })),
      new Promise((resolve) => setTimeout(resolve, 6000)),
    ])
    report('screen')
    await frame()

    // --- one mesh per material for everything that never moves ------------
    noAO.forEach((object) => {
      object.userData.keep = true
    })
    mergeStatic(scene)
    mergeRigid(scene)
    this.furs = []
    scene.traverse((object) => {
      if (object.name.endsWith('-fur')) this.furs.push(object)
    })

    // --- post-processing ---------------------------------------------------
    this.qualityIndex = guessQuality(renderer)
    this.setupComposer(noAO)
    this.applyQuality()
    this.rig.update(0)
    await renderer.compileAsync(scene, camera)
    report('shaders')

    this.listen()
    this.clock = new THREE.Timer()
    this.clock.connect?.(document)
    renderer.setAnimationLoop((time) => this.tick(time))
  }

  setupComposer(noAO) {
    const { renderer, scene, camera } = this
    const target = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
      type: THREE.HalfFloatType,
      samples: 4,
    })
    const composer = new EffectComposer(renderer, target)
    composer.addPass(new RenderPass(scene, camera))

    const ao = new GTAOPass(scene, camera, window.innerWidth, window.innerHeight)
    ao.updateGtaoMaterial({ radius: 9, distanceExponent: 1.6, thickness: 4, scale: 1.1, samples: 16 })
    ao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 16 })
    ao.blendIntensity = 0.85
    // Glass, mesh, steam and legends are see-through: they must not occlude
    // what is behind them in the ambient-occlusion pass.
    const render = ao.render.bind(ao)
    ao.render = (...args) => {
      noAO.forEach((object) => {
        object.userData.wasVisible = object.visible
        object.visible = false
      })
      render(...args)
      noAO.forEach((object) => {
        object.visible = object.userData.wasVisible
      })
    }
    composer.addPass(ao)

    const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.55, 0.55, 0.92)
    composer.addPass(bloom)
    composer.addPass(new OutputPass())

    this.composer = composer
    this.passes = { ao, bloom }
  }

  applyQuality() {
    const quality = QUALITY[this.qualityIndex]
    const ratio = Math.min(window.devicePixelRatio || 1, quality.pixelRatio)
    this.renderer.setPixelRatio(ratio)
    this.composer.setPixelRatio(ratio)
    this.composer.setSize(window.innerWidth, window.innerHeight)
    this.passes.ao.enabled = quality.ao
    this.passes.bloom.enabled = quality.bloom
    this.furs.forEach((fur) => {
      fur.visible = quality.fur
    })
    this.scene.traverse((object) => {
      if (!object.isLight || !object.castShadow || object.shadow.mapSize.x === quality.shadow) return
      object.shadow.mapSize.set(quality.shadow, quality.shadow)
      object.shadow.map?.dispose()
      object.shadow.map = null
    })
    this.renderer.shadowMap.needsUpdate = true
  }

  listen() {
    this.onResize = () => {
      const { innerWidth: width, innerHeight: height } = window
      this.camera.aspect = width / height
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(width, height)
      this.composer.setSize(width, height)
      this.css.setSize(width, height)
    }
    window.addEventListener('resize', this.onResize)

    // Pointing at the dog takes the camera to him, the way pointing at the
    // monitor does; pointing away brings it back to where it came from.
    const ray = new THREE.Raycaster()
    const ndc = new THREE.Vector2()
    const overDog = (event) => {
      ndc.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1)
      ray.setFromCamera(ndc, this.camera)
      return ray.intersectObject(this.dogHit, false).length > 0
    }

    window.addEventListener('pointermove', (event) => {
      this.rig.setPointer((event.clientX / window.innerWidth) * 2 - 1, (event.clientY / window.innerHeight) * 2 - 1)
      if (!this.started || event.target.closest?.('[data-ui]')) return
      const view = this.rig.view
      const over = overDog(event)
      this.renderer.domElement.style.cursor = over && view !== 'monitor' ? 'zoom-in' : ''
      if (over && (view === 'idle' || view === 'desk')) this.enterDog()
      else if (!over && view === 'dog') this.leaveDog()
    })

    // A press anywhere that is not the Screen or the overlay moves between
    // standing back and sitting at the desk.
    window.addEventListener('pointerdown', (event) => {
      if (!this.started) return
      if (event.target.closest?.('[data-ui]')) return
      if (this.screen.container.contains(event.target)) return
      const view = this.rig.view
      if (view === 'idle') this.go('desk', MOVES.toggle)
      else if (view === 'desk') this.go('idle', MOVES.toggle)
      else if (view === 'monitor') this.go('desk', MOVES.leaveMonitor)
      // a tap on the dog on a touch screen goes to him; a tap elsewhere comes back
      else if (view === 'dog' && !overDog(event)) this.leaveDog()
      if (event.pointerType === 'touch' && view !== 'dog' && overDog(event)) this.enterDog()
    })

    window.addEventListener('keydown', (event) => this.keyboard.press(event.code, true))
    window.addEventListener('keyup', (event) => this.keyboard.press(event.code, false))
  }

  go(view, move) {
    this.rig.go(view, move)
    this.events.emit('view', view)
  }

  // --- the Visitor ---------------------------------------------------------

  start() {
    if (this.started) return
    this.started = true
    this.audio.start()
    this.go('idle', MOVES.start)
    setTimeout(() => this.powerOn(), this.reducedMotion ? 0 : 700)
  }

  powerOn() {
    this.screenTarget = 1
    this.screen.powerOn()
    this.screen.send({ type: 'screen:audio', muted: this.muted })
  }

  enterMonitor() {
    if (!this.started) return
    this.go('monitor', MOVES.enterMonitor)
  }

  leaveMonitor() {
    if (!this.started || this.rig.view !== 'monitor') return
    this.go('desk', MOVES.leaveMonitor)
  }

  enterDog() {
    if (!this.started || this.rig.view === 'dog') return
    this.returnFromDog = this.rig.view === 'desk' ? 'desk' : 'idle'
    this.go('dog', MOVES.enterDog)
  }

  leaveDog() {
    if (!this.started || this.rig.view !== 'dog') return
    this.go(this.returnFromDog ?? 'idle', MOVES.leaveDog)
  }

  key(code, down, repeat) {
    this.keyboard.press(code, down)
    if (!repeat) this.audio.key(code, down)
    // Esc steps back from the monitor, for a Visitor who came in by keyboard.
    if (code === 'Escape' && down && this.rig.view === 'monitor') this.go('desk', MOVES.leaveMonitor)
  }

  // The overlay types itself out on the Room's keyboard.
  type(character) {
    const code = codeFor(character)
    if (code) this.keyboard.tap(code)
    this.audio.tick()
  }

  setMuted(muted) {
    this.muted = muted
    this.audio.setMuted(muted)
    writeMuted(muted)
    this.screen?.send({ type: 'screen:audio', muted })
    this.events.emit('muted', muted)
  }

  message(message) {
    if (message.type === 'screen:hello') {
      if (this.screenTarget > 0) this.screen.powerOn()
      this.screen.send({ type: 'screen:audio', muted: this.muted })
    } else if (message.type === 'screen:mute') {
      this.setMuted(!this.muted)
    } else if (message.type === 'screen:booted') {
      this.audio.chime()
    }
  }

  // --- the loop ------------------------------------------------------------

  tick(time) {
    this.clock.update(time)
    const delta = Math.min(this.clock.getDelta(), 0.05)
    const elapsed = this.clock.getElapsed()

    this.rig.update(delta)
    this.keyboard.update(delta)
    this.mouse.update(delta)
    if (!this.reducedMotion) {
      this.computer.update(delta, elapsed)
      this.props.update(elapsed)
      this.dog.update(elapsed)
    }

    this.screenLevel += (this.screenTarget - this.screenLevel) * Math.min(1, delta * 1.6)
    this.lighting.setScreen(this.screenLevel)

    if (this.started) {
      const distance = this.rig.distanceTo(this.anchor.getWorldPosition(new THREE.Vector3()))
      this.audio.setDistance(clamp01((distance - 70) / 420))
    }

    this.composer.render(delta)
    this.css.render(this.cssScene, this.camera)
    this.watchFrameRate(delta)
  }

  // After the opening move has settled, sample a couple of seconds of frames
  // and step the quality down once if they are too slow.
  watchFrameRate(delta) {
    if (!this.started || this.qualityIndex >= QUALITY.length - 1 || this.qualityChecked) return
    this.frameTimes.push(delta)
    if (this.frameTimes.length < 90) return
    const recent = this.frameTimes.slice(-60)
    const average = recent.reduce((sum, value) => sum + value, 0) / recent.length
    this.frameTimes = []
    if (average > 1 / 40) {
      this.qualityIndex += 1
      this.applyQuality()
      this.events.emit('quality', QUALITY[this.qualityIndex].name)
    } else {
      this.qualityChecked = true
    }
  }
}

const MUTE_KEY = 'room-muted'

function readMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}

function writeMuted(muted) {
  try {
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0')
  } catch {
    /* storage unavailable */
  }
}
