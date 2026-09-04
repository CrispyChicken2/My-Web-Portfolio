import { describe, expect, it } from 'vitest'
import {
  aboutArrival,
  approach,
  deckFrontIndex,
  deckSectionViewports,
  heroDolly,
  imageResolve,
  pointerToField,
  projectState,
  scrollVelocity,
  settle,
} from './params'

// Everything here is numbers in, numbers out. These are the only assertions
// the redesign makes: the rest of it is judged by eye.

const samples = (n = 61) => Array.from({ length: n }, (_, i) => i / (n - 1))
const COUNTS = [3, 4, 7, 12]

describe('pointerToField', () => {
  it('puts the viewport centre at the origin', () => {
    expect(pointerToField(600, 400, 1200, 800)).toEqual({ x: 0, y: 0 })
  })

  it('maps the viewport edges to the unit range, with y pointing up', () => {
    expect(pointerToField(0, 0, 1200, 800)).toEqual({ x: -1, y: 1 })
    expect(pointerToField(1200, 800, 1200, 800)).toEqual({ x: 1, y: -1 })
  })

  it('stays inside the unit range beyond the viewport edges', () => {
    const beyond = [
      [-4000, -4000],
      [9000, 9000],
      [-1, 850],
      [1201, -20],
    ]
    for (const [cx, cy] of beyond) {
      const { x, y } = pointerToField(cx, cy, 1200, 800)
      expect(Math.abs(x)).toBeLessThanOrEqual(1)
      expect(Math.abs(y)).toBeLessThanOrEqual(1)
    }
  })

  it('falls back to the origin for a degenerate viewport or input', () => {
    expect(pointerToField(10, 10, 0, 0)).toEqual({ x: 0, y: 0 })
    expect(pointerToField(NaN, 10, 1200, 800)).toEqual({ x: 0, y: 0 })
  })
})

describe('scrollVelocity', () => {
  it('is zero when the page is not moving', () => {
    expect(scrollVelocity(0, 16)).toBe(0)
  })

  it('is signed by scroll direction', () => {
    expect(scrollVelocity(300, 16)).toBeGreaterThan(0)
    expect(scrollVelocity(-300, 16)).toBeLessThan(0)
  })

  it('grows with speed, up to its limit', () => {
    expect(scrollVelocity(40, 16)).toBeLessThan(scrollVelocity(120, 16))
  })

  it('stays bounded however fast the flick', () => {
    const deltas = [1e3, 1e5, 1e9, -1e3, -1e9]
    const frames = [1, 8, 16, 1000]
    for (const delta of deltas) {
      for (const dt of frames) {
        expect(Math.abs(scrollVelocity(delta, dt))).toBeLessThanOrEqual(1)
      }
    }
  })

  it('refuses to divide by a zero or missing frame time', () => {
    expect(scrollVelocity(900, 0)).toBe(0)
    expect(scrollVelocity(900, -5)).toBe(0)
    expect(scrollVelocity(900, NaN)).toBe(0)
  })
})

describe('settle and approach', () => {
  it('decays a velocity toward zero once scrolling stops', () => {
    let v = 1
    for (let i = 0; i < 40; i += 1) v = settle(v, 16)
    expect(v).toBeLessThan(0.05)
    expect(v).toBeGreaterThanOrEqual(0)
  })

  it('follows a target without reaching it in one frame', () => {
    const next = approach(0, 1, 16)
    expect(next).toBeGreaterThan(0)
    expect(next).toBeLessThan(1)
  })

  it('converges on the target over time', () => {
    let v = 0
    for (let i = 0; i < 120; i += 1) v = approach(v, 1, 16)
    expect(v).toBeCloseTo(1, 2)
  })
})

describe('the Deck', () => {
  it('grows its scroll length with the Project count', () => {
    expect(deckSectionViewports(3)).toBeLessThan(deckSectionViewports(12))
  })

  it.each(COUNTS)('moves every Project forward monotonically at %i Projects', (count) => {
    for (let i = 0; i < count; i += 1) {
      let lastEnter = -Infinity
      let lastRecede = -Infinity
      for (const p of samples()) {
        const { enter, recede } = projectState(p, i, count)
        expect(enter).toBeGreaterThanOrEqual(lastEnter)
        expect(recede).toBeGreaterThanOrEqual(lastRecede)
        lastEnter = enter
        lastRecede = recede
      }
    }
  })

  it.each(COUNTS)('gives every Project a fully presented stretch at %i Projects', (count) => {
    for (let i = 0; i < count; i += 1) {
      const presented = samples(401).filter((p) => projectState(p, i, count).presented)
      expect(presented.length, `Project ${i + 1} of ${count} is never fully presented`)
        .toBeGreaterThan(0)
    }
  })

  it.each(COUNTS)('presents the Projects in order at %i Projects', (count) => {
    const firstPresented = (i) =>
      samples(401).findIndex((p) => projectState(p, i, count).presented)
    for (let i = 1; i < count; i += 1) {
      expect(firstPresented(i)).toBeGreaterThan(firstPresented(i - 1))
    }
  })

  it('never recedes the last Project — nothing is covering it', () => {
    for (const p of samples()) {
      expect(projectState(p, 2, 3).recede).toBe(0)
    }
  })

  it('clamps outside the Section rather than running past the ends', () => {
    for (const count of COUNTS) {
      for (let i = 0; i < count; i += 1) {
        expect(projectState(-3, i, count)).toEqual(projectState(0, i, count))
        expect(projectState(9, i, count)).toEqual(projectState(1, i, count))
      }
    }
  })

  it('keeps every derived transform finite and in range', () => {
    for (const count of COUNTS) {
      for (let i = 0; i < count; i += 1) {
        for (const p of samples()) {
          const { opacity, scale, blur } = projectState(p, i, count)
          expect(Number.isFinite(opacity) && Number.isFinite(scale) && Number.isFinite(blur)).toBe(true)
          expect(opacity).toBeGreaterThanOrEqual(0)
          expect(opacity).toBeLessThanOrEqual(1)
          expect(scale).toBeGreaterThan(0)
          expect(blur).toBeGreaterThanOrEqual(0)
        }
      }
    }
  })

  it('reports a front Project inside the set at every offset', () => {
    for (const count of COUNTS) {
      for (const p of [-1, ...samples(), 2]) {
        const front = deckFrontIndex(p, count)
        expect(Number.isInteger(front)).toBe(true)
        expect(front).toBeGreaterThanOrEqual(0)
        expect(front).toBeLessThan(count)
      }
    }
  })

  it('walks the front Project from the first to the last', () => {
    expect(deckFrontIndex(0, 5)).toBe(0)
    expect(deckFrontIndex(1, 5)).toBe(4)
    let last = 0
    for (const p of samples(201)) {
      const front = deckFrontIndex(p, 5)
      expect(front).toBeGreaterThanOrEqual(last)
      last = front
    }
  })
})

describe('the Zoom moments', () => {
  it('dollies the Hero forward and out of the way', () => {
    expect(heroDolly(0)).toMatchObject({ scale: 1, opacity: 1, blur: 0 })
    const out = heroDolly(1)
    expect(out.scale).toBeGreaterThan(1)
    expect(out.opacity).toBeLessThan(1)
    expect(out.blur).toBeGreaterThan(0)
  })

  it('brings About up from behind to its resting size', () => {
    expect(aboutArrival(0).scale).toBeLessThan(1)
    expect(aboutArrival(1)).toMatchObject({ scale: 1, opacity: 1 })
  })

  it('resolves the Image slot as it enters', () => {
    const start = imageResolve(0)
    const end = imageResolve(1)
    expect(start.blur).toBeGreaterThan(0)
    expect(start.scale).toBeGreaterThan(1)
    expect(end).toMatchObject({ scale: 1, blur: 0, opacity: 1 })
  })

  it('clamps all three moments outside their range', () => {
    for (const moment of [heroDolly, aboutArrival, imageResolve]) {
      expect(moment(-4)).toEqual(moment(0))
      expect(moment(4)).toEqual(moment(1))
      expect(moment(NaN)).toEqual(moment(0))
    }
  })
})
