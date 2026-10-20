import * as THREE from 'three'
import { palette } from './palette'

// Every surface texture in the Room is drawn here, on a canvas, when the
// Room is built. Nothing is downloaded: the content-security policy allows
// no external origin, and a procedural grain never shows a tiling seam.

// A small seeded generator, so the oak and the floor come out the same on
// every visit rather than reshuffling their grain.
function random(seed) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function canvas(width, height) {
  const element = document.createElement('canvas')
  element.width = width
  element.height = height
  return [element, element.getContext('2d')]
}

function finish(element, { srgb = true, repeat = null, anisotropy = 8 } = {}) {
  const texture = new THREE.CanvasTexture(element)
  texture.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace
  texture.anisotropy = anisotropy
  if (repeat) {
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(repeat[0], repeat[1])
  }
  return texture
}

const shade = (hex, amount) => {
  const color = new THREE.Color(hex)
  const hsl = {}
  color.getHSL(hsl)
  color.setHSL(hsl.h, hsl.s, Math.min(1, Math.max(0, hsl.l + amount)))
  return `#${color.getHexString()}`
}

// Long grain along the width of a board: fine lines whose spacing and
// darkness wander, a few slow waves where the grain bends round a knot.
function drawGrain(ctx, x, y, w, h, base, rand, density = 1) {
  ctx.fillStyle = base
  ctx.fillRect(x, y, w, h)

  const bands = Math.floor(h * 0.9 * density)
  for (let i = 0; i < bands; i += 1) {
    const row = y + rand() * h
    const amplitude = 0.6 + rand() * 2.4
    const frequency = 0.002 + rand() * 0.01
    const phase = rand() * Math.PI * 2
    const dark = rand() < 0.5
    ctx.strokeStyle = dark
      ? `rgba(70, 40, 20, ${0.035 + rand() * 0.09})`
      : `rgba(255, 236, 205, ${0.02 + rand() * 0.06})`
    ctx.lineWidth = 0.5 + rand() * 1.6
    ctx.beginPath()
    for (let px = x; px <= x + w; px += 6) {
      const py = row + Math.sin(px * frequency + phase) * amplitude
      if (px === x) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.stroke()
  }

  // A couple of soft cathedral figures, the darker arcs oak is known for.
  const figures = Math.floor(1 + rand() * 2)
  for (let f = 0; f < figures; f += 1) {
    const cx = x + rand() * w
    const cy = y + rand() * h
    for (let r = 0; r < 9; r += 1) {
      ctx.strokeStyle = `rgba(80, 45, 20, ${0.05 + rand() * 0.05})`
      ctx.lineWidth = 1 + rand()
      ctx.beginPath()
      ctx.ellipse(cx, cy, 60 + r * 26, 6 + r * 3.2, 0, 0, Math.PI * 2)
      ctx.stroke()
    }
  }
}

export function oakTexture() {
  const [element, ctx] = canvas(2048, 1024)
  const rand = random(7)
  drawGrain(ctx, 0, 0, 2048, 1024, palette.oak, rand, 1.4)
  // a soft, uneven tone across the slab
  for (let i = 0; i < 40; i += 1) {
    const gradient = ctx.createRadialGradient(
      rand() * 2048, rand() * 1024, 0,
      rand() * 2048, rand() * 1024, 200 + rand() * 400,
    )
    gradient.addColorStop(0, `rgba(120, 75, 35, ${rand() * 0.06})`)
    gradient.addColorStop(1, 'rgba(120, 75, 35, 0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 2048, 1024)
  }
  return finish(element)
}

export function floorTexture() {
  const [element, ctx] = canvas(2048, 2048)
  const rand = random(19)
  const plankHeight = 2048 / 8
  for (let row = 0; row < 8; row += 1) {
    let x = -rand() * 900
    while (x < 2048) {
      const length = 700 + rand() * 900
      const tone = shade(palette.floor, (rand() - 0.5) * 0.07)
      drawGrain(ctx, x, row * plankHeight, length, plankHeight, tone, rand, 0.9)
      ctx.fillStyle = 'rgba(10, 6, 3, 0.55)'
      ctx.fillRect(x, row * plankHeight, 3, plankHeight)
      x += length
    }
    ctx.fillStyle = 'rgba(10, 6, 3, 0.6)'
    ctx.fillRect(0, row * plankHeight, 2048, 3)
  }
  return finish(element, { repeat: [3, 3] })
}

// Fine value noise, for a plaster wall's tooth or a felt mat's nap. Used as
// a bump and roughness map, so it carries no colour.
export function noiseTexture({ size = 512, seed = 3, contrast = 0.5, repeat = [1, 1] } = {}) {
  const [element, ctx] = canvas(size, size)
  const rand = random(seed)
  const image = ctx.createImageData(size, size)
  for (let i = 0; i < size * size; i += 1) {
    const value = 128 + (rand() - 0.5) * 255 * contrast
    image.data[i * 4] = value
    image.data[i * 4 + 1] = value
    image.data[i * 4 + 2] = value
    image.data[i * 4 + 3] = 255
  }
  ctx.putImageData(image, 0, 0)
  return finish(element, { srgb: false, repeat })
}

// The chair's back: a woven mesh, white where there is thread. Used as an
// alpha map, so light passes between the threads.
export function meshWeaveTexture() {
  const [element, ctx] = canvas(256, 256)
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, 256, 256)
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 3
  for (let i = 0; i <= 256; i += 16) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i, 256)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, i)
    ctx.lineTo(256, i)
    ctx.stroke()
  }
  return finish(element, { srgb: false, repeat: [9, 12] })
}

// The motherboard seen through the PC's glass: dark board, faint traces.
export function circuitTexture() {
  const [element, ctx] = canvas(512, 1024)
  const rand = random(41)
  ctx.fillStyle = palette.pcb
  ctx.fillRect(0, 0, 512, 1024)
  ctx.lineWidth = 2
  for (let i = 0; i < 140; i += 1) {
    ctx.strokeStyle = `rgba(143, 189, 196, ${0.05 + rand() * 0.08})`
    let x = rand() * 512
    let y = rand() * 1024
    ctx.beginPath()
    ctx.moveTo(x, y)
    for (let s = 0; s < 4; s += 1) {
      if (rand() < 0.5) x += (rand() - 0.5) * 160
      else y += (rand() - 0.5) * 160
      ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
  for (let i = 0; i < 40; i += 1) {
    ctx.fillStyle = `rgba(30, 34, 40, ${0.8})`
    ctx.fillRect(rand() * 480, rand() * 1000, 10 + rand() * 40, 8 + rand() * 30)
  }
  return finish(element)
}

// The page of the open notebook: faint ruled lines and a few lines of
// handwriting-like strokes.
export function notebookPageTexture() {
  const [element, ctx] = canvas(512, 720)
  const rand = random(5)
  ctx.fillStyle = palette.paper
  ctx.fillRect(0, 0, 512, 720)
  ctx.fillStyle = 'rgba(80, 90, 110, 0.18)'
  for (let y = 70; y < 720; y += 34) {
    for (let x = 30; x < 500; x += 22) ctx.fillRect(x, y, 2, 2)
  }
  ctx.strokeStyle = 'rgba(40, 50, 70, 0.6)'
  ctx.lineWidth = 2
  for (let line = 0; line < 9; line += 1) {
    const y = 100 + line * 34
    let x = 40
    const end = 120 + rand() * 330
    ctx.beginPath()
    ctx.moveTo(x, y)
    while (x < end) {
      x += 4
      ctx.lineTo(x, y - 6 + Math.sin(x * 0.35 + line) * 5 * rand())
    }
    ctx.stroke()
  }
  return finish(element)
}

// The keycap legends, one cell per key, drawn white so each key can tint its
// own legend. Returns the texture and where each label landed.
export function legendAtlas(labels) {
  const cell = 128
  const columns = 12
  const rows = Math.ceil(labels.length / columns)
  const [element, ctx] = canvas(columns * cell, rows * cell)
  ctx.fillStyle = '#fff'
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  const rects = labels.map((label, index) => {
    const col = index % columns
    const row = Math.floor(index / columns)
    const size = label.length > 3 ? 30 : label.length > 1 ? 40 : 58
    ctx.font = `500 ${size}px "IBM Plex Mono", ui-monospace, monospace`
    ctx.fillText(label, col * cell + cell / 2, row * cell + cell / 2 + 2)
    // offset.x, offset.y, scale.x, scale.y in UV space. Canvas rows run
    // downwards and UVs upwards, hence the flip.
    return [col / columns, 1 - (row + 1) / rows, 1 / columns, 1 / rows]
  })
  const texture = finish(element, { srgb: false, anisotropy: 4 })
  return { texture, rects }
}

// Brushed aluminium: fine streaks along one axis. Used as a roughness and
// bump map, so it carries no colour.
export function brushedTexture({ repeat = [1, 1] } = {}) {
  const [element, ctx] = canvas(512, 512)
  const rand = random(71)
  ctx.fillStyle = '#808080'
  ctx.fillRect(0, 0, 512, 512)
  for (let i = 0; i < 2600; i += 1) {
    const v = 90 + rand() * 80
    ctx.fillStyle = `rgba(${v}, ${v}, ${v}, ${0.25 + rand() * 0.4})`
    ctx.fillRect(rand() * 512, rand() * 512, 40 + rand() * 220, 1)
  }
  return finish(element, { srgb: false, repeat })
}

// An alpha map of long parallel slots, the top panel's vent: white is metal,
// black is open.
export function slotsAlpha({ slots = 22, margin = 0.06 } = {}) {
  const [element, ctx] = canvas(512, 512)
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, 512, 512)
  ctx.fillStyle = '#000'
  const pitch = (512 * (1 - margin * 2)) / slots
  for (let i = 0; i < slots; i += 1) {
    const y = 512 * margin + i * pitch + pitch * 0.3
    ctx.beginPath()
    ctx.roundRect(512 * margin, y, 512 * (1 - margin * 2), pitch * 0.45, pitch * 0.22)
    ctx.fill()
  }
  return finish(element, { srgb: false, anisotropy: 4 })
}

// An alpha map of round perforations in staggered rows: a mesh panel.
export function perforationAlpha({ size = 512, hole = 5, pitch = 13 } = {}) {
  const [element, ctx] = canvas(size, size)
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, size, size)
  ctx.fillStyle = '#000'
  let row = 0
  for (let y = pitch / 2; y < size; y += pitch * 0.87) {
    for (let x = (row % 2 ? pitch / 2 : 0) + pitch / 2; x < size; x += pitch) {
      ctx.beginPath()
      ctx.arc(x, y, hole, 0, Math.PI * 2)
      ctx.fill()
    }
    row += 1
  }
  return finish(element, { srgb: false, anisotropy: 4 })
}

// A radiator's face: fine vertical fins between flat tubes.
export function radiatorTexture() {
  const [element, ctx] = canvas(256, 1024)
  ctx.fillStyle = '#15161a'
  ctx.fillRect(0, 0, 256, 1024)
  for (let x = 0; x < 256; x += 3) {
    ctx.fillStyle = x % 6 ? '#24262b' : '#1b1c20'
    ctx.fillRect(x, 0, 1.4, 1024)
  }
  for (let y = 0; y < 1024; y += 22) {
    ctx.fillStyle = '#0c0d10'
    ctx.fillRect(0, y, 256, 6)
  }
  return finish(element)
}

// The graphics card's backplate: gunmetal with the angular vent pattern of
// the card's design and a large printed mark.
export function backplateTexture(mark) {
  const [element, ctx] = canvas(1024, 448)
  const gradient = ctx.createLinearGradient(0, 0, 1024, 448)
  gradient.addColorStop(0, '#3b3e44')
  gradient.addColorStop(1, '#2c2e33')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 1024, 448)
  ctx.fillStyle = 'rgba(8, 9, 11, 0.85)'
  for (let i = 0; i < 9; i += 1) {
    const x = 610 + i * 38
    ctx.beginPath()
    ctx.moveTo(x, 40)
    ctx.lineTo(x + 22, 40)
    ctx.lineTo(x - 60, 408)
    ctx.lineTo(x - 82, 408)
    ctx.closePath()
    ctx.fill()
  }
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
  ctx.lineWidth = 3
  ctx.strokeRect(14, 14, 996, 420)
  ctx.fillStyle = 'rgba(230, 232, 236, 0.75)'
  ctx.font = '800 64px Archivo, system-ui, sans-serif'
  ctx.fillText(mark, 70, 250)
  return finish(element)
}

// A line of printed or embossed type on a dark ground: a brand mark, a
// model number. Transparent around the letters.
export function labelTexture(text, { width = 512, height = 96, size = 54, weight = 800, color = '#e6e8ec', font = 'Archivo, system-ui, sans-serif', spacing = 4 } = {}) {
  const [element, ctx] = canvas(width, height)
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = color
  ctx.font = `${weight} ${size}px ${font}`
  ctx.textBaseline = 'middle'
  ctx.letterSpacing = `${spacing}px`
  ctx.fillText(text, 8, height / 2 + 2)
  return finish(element, { anisotropy: 4 })
}

// The print on the wall: mountains at sunset. A sky running from deep
// indigo through violet and rose to a band of orange at the horizon, the
// sun low behind the far range, streaks of lit cloud; five ranges of
// mountains stepping forward out of the haze, the farthest snow-capped and
// palest, the nearest almost black with a line of pines; a still lake
// below holding the sky's reflection. A faint canvas grain over all.
export function landscapeTexture() {
  const W = 1400
  const H = 900
  const [element, ctx] = canvas(W, H)
  const rand = random(2024)
  const horizon = H * 0.62

  // sky
  const sky = ctx.createLinearGradient(0, 0, 0, horizon)
  sky.addColorStop(0, '#1b1440')
  sky.addColorStop(0.28, '#3e2668')
  sky.addColorStop(0.55, '#8e3f7c')
  sky.addColorStop(0.78, '#e0675a')
  sky.addColorStop(0.92, '#f79b4f')
  sky.addColorStop(1, '#ffcf7d')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, W, horizon + 4)
  // a few stars where the sky is darkest
  for (let i = 0; i < 90; i += 1) {
    const y = rand() * H * 0.22
    ctx.fillStyle = `rgba(255, 240, 255, ${0.15 + rand() * 0.5 * (1 - y / (H * 0.22))})`
    ctx.fillRect(rand() * W, y, 1.6, 1.6)
  }
  // the sun, low and right of centre, with its glow
  const sunX = W * 0.62
  const sunY = horizon - H * 0.075
  const glow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, H * 0.55)
  glow.addColorStop(0, 'rgba(255, 230, 170, 0.95)')
  glow.addColorStop(0.12, 'rgba(255, 180, 110, 0.55)')
  glow.addColorStop(0.45, 'rgba(240, 110, 120, 0.18)')
  glow.addColorStop(1, 'rgba(120, 60, 140, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, horizon)
  ctx.fillStyle = '#fff1c8'
  ctx.beginPath()
  ctx.arc(sunX, sunY, H * 0.042, 0, Math.PI * 2)
  ctx.fill()
  // long thin clouds, lit from below in rose and gold
  for (let i = 0; i < 16; i += 1) {
    const y = H * (0.12 + rand() * 0.36)
    const x = rand() * W
    const w = 160 + rand() * 420
    const h = 4 + rand() * 9
    const lit = y > H * 0.3
    const g = ctx.createLinearGradient(0, y - h, 0, y + h)
    g.addColorStop(0, lit ? 'rgba(120, 60, 120, 0.0)' : 'rgba(70, 40, 100, 0.0)')
    g.addColorStop(0.5, lit ? 'rgba(170, 80, 120, 0.55)' : 'rgba(90, 55, 120, 0.5)')
    g.addColorStop(1, lit ? 'rgba(255, 170, 120, 0.75)' : 'rgba(200, 110, 150, 0.45)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.ellipse(x, y, w / 2, h, (rand() - 0.5) * 0.04, 0, Math.PI * 2)
    ctx.fill()
  }

  // a ridgeline by midpoint displacement
  const ridge = (base, roughness, height, seedOffset) => {
    const n = 257
    const pts = new Array(n).fill(0)
    pts[0] = (rand() - 0.5) * height
    pts[n - 1] = (rand() - 0.5) * height
    let step = n - 1
    let scale = height
    while (step > 1) {
      const half = step / 2
      for (let i = half; i < n; i += step) pts[i] = (pts[i - half] + pts[i + half]) / 2 + (rand() - 0.5) * scale
      scale *= roughness
      step = half
    }
    return pts.map((v, i) => [(i / (n - 1)) * W, base - Math.abs(v) - seedOffset * Math.sin(i * 0.02)])
  }
  const ranges = [
    { base: horizon - 30, height: 420, rough: 0.56, fill: 'rgba(190, 120, 160, 0.78)', snow: true },
    { base: horizon - 10, height: 300, rough: 0.55, fill: 'rgba(140, 78, 128, 0.88)' },
    { base: horizon + 10, height: 220, rough: 0.52, fill: 'rgba(92, 50, 100, 0.95)' },
    { base: horizon + 40, height: 160, rough: 0.5, fill: '#4a2a5c' },
    { base: horizon + 70, height: 110, rough: 0.48, fill: '#24152f' },
  ]
  ranges.forEach((range, index) => {
    const line = ridge(range.base, range.rough, range.height, index * 6)
    ctx.fillStyle = range.fill
    ctx.beginPath()
    ctx.moveTo(0, H)
    line.forEach(([x, y]) => ctx.lineTo(x, y))
    ctx.lineTo(W, H)
    ctx.closePath()
    ctx.fill()
    // the light catching the sunward faces
    ctx.strokeStyle = `rgba(255, 170, 120, ${0.18 - index * 0.03})`
    ctx.lineWidth = 2
    ctx.beginPath()
    line.forEach(([x, y], i) => (i ? ctx.lineTo(x, y + 1) : ctx.moveTo(x, y + 1)))
    ctx.stroke()
    if (range.snow) {
      ctx.fillStyle = 'rgba(255, 235, 245, 0.7)'
      line.forEach(([x, y], i) => {
        if (i % 2 || y > range.base - range.height * 0.42) return
        ctx.beginPath()
        ctx.moveTo(x - 9, y + 14)
        ctx.lineTo(x, y)
        ctx.lineTo(x + 7, y + 12)
        ctx.closePath()
        ctx.fill()
      })
    }
    // haze rising between the ranges, warm towards the sun
    const haze = ctx.createLinearGradient(0, range.base - 40, 0, range.base + 30)
    haze.addColorStop(0, 'rgba(250, 150, 140, 0)')
    haze.addColorStop(1, `rgba(250, 150, 140, ${0.16 - index * 0.025})`)
    ctx.fillStyle = haze
    ctx.fillRect(0, range.base - 40, W, 70)
  })
  // a line of pines along the nearest ridge
  for (let x = 0; x < W; x += 9 + rand() * 14) {
    const h = 20 + rand() * 46
    const y = horizon + 70 - 22 + rand() * 30
    ctx.fillStyle = '#140b1c'
    ctx.beginPath()
    ctx.moveTo(x, y - h)
    ctx.lineTo(x + h * 0.22, y)
    ctx.lineTo(x - h * 0.22, y)
    ctx.closePath()
    ctx.fill()
  }

  // the lake: the sky again, upside down, darker, broken by ripples
  const lakeTop = H * 0.84
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, lakeTop, W, H - lakeTop)
  ctx.clip()
  const lake = ctx.createLinearGradient(0, lakeTop, 0, H)
  lake.addColorStop(0, '#d0705f')
  lake.addColorStop(0.35, '#7a3a72')
  lake.addColorStop(1, '#22163e')
  ctx.fillStyle = lake
  ctx.fillRect(0, lakeTop, W, H - lakeTop)
  ctx.fillStyle = 'rgba(255, 215, 150, 0.55)'
  for (let y = lakeTop + 4; y < H; y += 6 + rand() * 5) {
    const w = 30 + (1 - (y - lakeTop) / (H - lakeTop)) * 160 * rand()
    ctx.fillRect(sunX - w / 2 + (rand() - 0.5) * 30, y, w, 1.6)
  }
  ctx.fillStyle = 'rgba(20, 10, 30, 0.35)'
  for (let y = lakeTop; y < H; y += 3) ctx.fillRect(rand() * W, y, 60 + rand() * 200, 1)
  ctx.restore()
  ctx.fillStyle = '#140b1c'
  ctx.fillRect(0, lakeTop - 3, W, 5)

  // canvas grain
  const image = ctx.getImageData(0, 0, W, H)
  for (let i = 0; i < image.data.length; i += 4) {
    const g = (rand() - 0.5) * 14
    image.data[i] += g
    image.data[i + 1] += g
    image.data[i + 2] += g
  }
  ctx.putImageData(image, 0, 0)
  return finish(element)
}
