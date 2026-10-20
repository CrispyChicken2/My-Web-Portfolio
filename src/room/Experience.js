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

// The Room: builds the scene, runs the loop, and wires the Visitor's input
// to the camera, the keyboard, the mouse and the sound.
//
// It owns no interface of its own. The loader, the overlay and the start
// button are React (./ui), and they talk to the Room through `events` and
// the handful of methods below.

const frame = () => new Promise((resolve) => requestAnimationFrame(() => resolve()))

// Three quality steps. The Room starts on the highest the device is likely
// to hold and steps down once if it cannot keep up.
const QUALITY = [
  { name: 'high', pixelRatio: 2, ao: true, bloom: true },
  { name: 'medium', pixelRatio: 1.5, ao: false, bloom: true },
  { name: 'low', pixelRatio: 1, ao: false, bloom: false },
]

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
    this.rig = createRig(camera, anchor, { reducedMotion: this.reducedMotion })
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

    // --- post-processing ---------------------------------------------------
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

    window.addEventListener('pointermove', (event) => {
      this.rig.setPointer((event.clientX / window.innerWidth) * 2 - 1, (event.clientY / window.innerHeight) * 2 - 1)
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
    if (this.frameTimes.length < 150) return
    const recent = this.frameTimes.slice(-90)
    const average = recent.reduce((sum, value) => sum + value, 0) / recent.length
    this.frameTimes = []
    if (average > 1 / 42) {
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
