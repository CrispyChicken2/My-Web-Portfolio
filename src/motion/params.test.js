import { describe, expect, it } from 'vitest'
import {
  aboutArrival,
  blurFilter,
  deckCardState,
  deckSectionViewports,
  deckTargetIndex,
  heroDolly,
  imageResolve,
} from './params'

// Everything here is numbers in, numbers out. These are the only assertions
// the redesign makes: the rest of it is judged by eye.

const samples = (n = 61) => Array.from({ length: n }, (_, i) => i / (n - 1))
const COUNTS = [3, 4, 7, 12]

describe('blurFilter', () => {
  it('costs nothing when there is nothing to blur', () => {
    expect(blurFilter(0)).toBe('none')
    expect(blurFilter(0.01)).toBe('none')
    expect(blurFilter(NaN)).toBe('none')
  })

  it('is a filter value otherwise', () => {
    expect(blurFilter(4)).toBe('blur(4.00px)')
  })
})

// The Deck rests ON a Project, never between two. Scroll chooses which one;
// a spring carries the cards there. So the tested contract is "which Project
// is current", plus "where a card sits relative to the current one" — not a
// continuous progress value tied to the scroll offset.
describe('the Deck', () => {
  it('grows its scroll length with the Project count', () => {
    expect(deckSectionViewports(3)).toBeLessThan(deckSectionViewports(12))
  })

  it('always names a whole Project, never a position between two', () => {
    for (const count of COUNTS) {
      for (const p of [-1, ...samples(401), 2]) {
        const target = deckTargetIndex(p, count)
        expect(Number.isInteger(target)).toBe(true)
        expect(target).toBeGreaterThanOrEqual(0)
        expect(target).toBeLessThan(count)
      }
    }
  })

  it.each(COUNTS)('reaches every Project, in order, at %i Projects', (count) => {
    const seen = []
    let last = -1
    for (const p of samples(801)) {
      const target = deckTargetIndex(p, count)
      // Never goes backwards as the Visitor scrolls down...
      expect(target).toBeGreaterThanOrEqual(last)
      // ...and never skips one on the way.
      if (target !== last) {
        if (last !== -1) expect(target).toBe(last + 1)
        seen.push(target)
        last = target
      }
    }
    expect(seen).toEqual(Array.from({ length: count }, (_, i) => i))
  })

  it('starts on the first Project and ends on the last', () => {
    for (const count of COUNTS) {
      expect(deckTargetIndex(0, count)).toBe(0)
      expect(deckTargetIndex(1, count)).toBe(count - 1)
    }
  })

  it('clamps outside the Section rather than running past the ends', () => {
    for (const count of COUNTS) {
      expect(deckTargetIndex(-3, count)).toBe(deckTargetIndex(0, count))
      expect(deckTargetIndex(9, count)).toBe(deckTargetIndex(1, count))
      expect(deckTargetIndex(NaN, count)).toBe(0)
    }
  })

  it('presents the current Project, and only it', () => {
    const current = deckCardState(0)
    expect(current.presented).toBe(true)
    expect(current).toMatchObject({ y: 0, scale: 1, opacity: 1, blur: 0 })
    for (const offset of [-2, -1, -0.5, 0.5, 1, 2]) {
      expect(deckCardState(offset).presented).toBe(false)
    }
  })

  it('waits below for Projects still to come, and recedes the ones passed', () => {
    // A Project the Deck has not reached yet waits below the fold.
    expect(deckCardState(-1).enterVh).toBeGreaterThan(0)
    // One the Deck has passed stays where it is and falls behind instead.
    const passed = deckCardState(1)
    expect(passed.scale).toBeLessThan(1)
    expect(passed.blur).toBeGreaterThan(0)
    expect(passed.y).toBeLessThanOrEqual(0)
  })

  it('keeps the entry travel and the covered lift apart', () => {
    // Two travels in two units: the entry clears the viewport whatever a
    // Panel's height, the lift is a fraction of the card itself. Neither may
    // quietly absorb the other.
    const waiting = deckCardState(-1)
    expect(waiting.enterVh).toBeGreaterThan(0)
    expect(waiting.y).toBe(0)

    const passed = deckCardState(1)
    expect(passed.y).toBeLessThan(0)
    expect(passed.enterVh).toBe(0)
  })

  it('hides Projects far from the current one, in both directions', () => {
    expect(deckCardState(-3).opacity).toBe(0)
    expect(deckCardState(4).opacity).toBe(0)
  })

  it('keeps every derived transform finite and in range', () => {
    for (let offset = -14; offset <= 14; offset += 0.05) {
      const { opacity, scale, blur, y, enterVh } = deckCardState(offset)
      expect(Number.isFinite(opacity) && Number.isFinite(scale)).toBe(true)
      expect(Number.isFinite(blur) && Number.isFinite(y)).toBe(true)
      // A single non-finite term invalidates the whole composed transform,
      // taking the scale down with it and leaving a Project full-size on
      // top of the presented one.
      expect(Number.isFinite(enterVh)).toBe(true)
      expect(enterVh).toBeGreaterThanOrEqual(0)
      expect(opacity).toBeGreaterThanOrEqual(0)
      expect(opacity).toBeLessThanOrEqual(1)
      expect(scale).toBeGreaterThan(0)
      expect(blur).toBeGreaterThanOrEqual(0)
    }
  })

  it('moves smoothly through the offsets a spring passes through', () => {
    // The spring animates the offset continuously, so no fractional offset may
    // produce a jump the Visitor would see as a stutter.
    let previous = deckCardState(-2)
    for (let offset = -2; offset <= 2; offset += 0.02) {
      const next = deckCardState(offset)
      expect(Math.abs(next.y - previous.y)).toBeLessThan(6)
      expect(Math.abs(next.enterVh - previous.enterVh)).toBeLessThan(6)
      expect(Math.abs(next.scale - previous.scale)).toBeLessThan(0.05)
      expect(Math.abs(next.opacity - previous.opacity)).toBeLessThan(0.1)
      previous = next
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
