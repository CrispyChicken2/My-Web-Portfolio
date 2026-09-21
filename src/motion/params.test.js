import { describe, expect, it } from 'vitest'
import {
  aboutArrival,
  blurFilter,
  deckCardState,
  deckFrontIndex,
  deckProgressForIndex,
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

// The Deck travels toward a whole Project rather than resting on one at every
// moment: scroll maps continuously, flat near each Project and steep between
// them. So the tested contract is the shape of that mapping — it arrives, it
// never doubles back, and it is never dead for long — plus "where a card sits
// relative to the current one", and the round trip the Rail depends on.
describe('the Deck', () => {
  it('grows its scroll length with the Project count', () => {
    expect(deckSectionViewports(3)).toBeLessThan(deckSectionViewports(12))
  })

  it('charges one handover per added Project, not one viewport', () => {
    // The whole point of counting in handovers: the cost of a Project is the
    // same whichever Project it is, so adding one stays a content edit.
    const step = deckSectionViewports(3) - deckSectionViewports(2)
    for (const count of [2, 3, 4, 7, 11]) {
      expect(deckSectionViewports(count + 1) - deckSectionViewports(count)).toBeCloseTo(step, 10)
    }
    // And a handover costs less than the viewport it used to cost.
    expect(step).toBeLessThan(1)
  })

  it('stays within the Projects, and arrives at both ends', () => {
    for (const count of COUNTS) {
      for (const p of [-1, ...samples(401), 2]) {
        const target = deckTargetIndex(p, count)
        expect(Number.isFinite(target)).toBe(true)
        expect(target).toBeGreaterThanOrEqual(0)
        expect(target).toBeLessThanOrEqual(count - 1)
      }
      expect(deckTargetIndex(0, count)).toBe(0)
      expect(deckTargetIndex(1, count)).toBe(count - 1)
    }
  })

  it.each(COUNTS)('reaches every Project, in order, at %i Projects', (count) => {
    let last = -Infinity
    const reached = new Set()
    for (const p of samples(2001)) {
      const target = deckTargetIndex(p, count)
      // Never doubles back as the Visitor scrolls down...
      expect(target).toBeGreaterThanOrEqual(last)
      last = target
      // ...and rests on each whole Project on the way, rather than sweeping
      // past it. The tolerance is one sample's worth of travel.
      for (let i = 0; i < count; i += 1) {
        if (Math.abs(target - i) < 0.01) reached.add(i)
      }
    }
    expect([...reached].sort((a, b) => a - b)).toEqual(
      Array.from({ length: count }, (_, i) => i),
    )
  })

  it('travels continuously, never jumping between Projects', () => {
    // This is what the rounding used to break: the Deck sat still and then
    // changed Project between two adjacent scroll positions.
    for (const count of COUNTS) {
      const points = samples(4001).map((p) => deckTargetIndex(p, count))
      for (let i = 1; i < points.length; i += 1) {
        expect(Math.abs(points[i] - points[i - 1])).toBeLessThan(0.05)
      }
    }
  })

  it('is not dead for most of the Section, and never dead for long', () => {
    // The complaint this whole change answers: two thirds of the Deck's
    // scroll used to produce no motion at all, in stretches half the
    // Section long. Directional, not magnitude-pinning — the holds are
    // tuned by eye and may move.
    for (const count of COUNTS) {
      const points = samples(4001).map((p) => deckTargetIndex(p, count))
      let moving = 0
      let run = 0
      let longestStill = 0
      for (let i = 1; i < points.length; i += 1) {
        if (Math.abs(points[i] - points[i - 1]) > 1e-6) {
          moving += 1
          run = 0
        } else {
          run += 1
          longestStill = Math.max(longestStill, run)
        }
      }
      const span = points.length - 1
      expect(moving / span).toBeGreaterThan(0.4)
      expect(longestStill / span).toBeLessThan(0.25)
    }
  })

  it('clamps outside the Section rather than running past the ends', () => {
    for (const count of COUNTS) {
      expect(deckTargetIndex(-3, count)).toBe(deckTargetIndex(0, count))
      expect(deckTargetIndex(9, count)).toBe(deckTargetIndex(1, count))
      expect(deckTargetIndex(NaN, count)).toBe(0)
    }
  })

  // What the header counter and the Rail display. It flips at the midpoint of
  // a handover — once, and decisively — rather than following the travel.
  it('names one whole Project for the counter and the Rail', () => {
    for (const count of COUNTS) {
      for (const p of samples(801)) {
        const front = deckFrontIndex(deckTargetIndex(p, count), count)
        expect(Number.isInteger(front)).toBe(true)
        expect(front).toBeGreaterThanOrEqual(0)
        expect(front).toBeLessThan(count)
      }
      expect(deckFrontIndex(0.49, count)).toBe(0)
      expect(deckFrontIndex(0.51, count)).toBe(1)
      expect(deckFrontIndex(-5, count)).toBe(0)
      expect(deckFrontIndex(99, count)).toBe(count - 1)
      expect(deckFrontIndex(NaN, count)).toBe(0)
    }
  })

  // The Rail's two needs are inverses, and clicking a dot only lands where the
  // dot claims if they agree. This is the strongest contract in the module.
  it('round-trips a Project through the scroll position that rests on it', () => {
    for (const count of COUNTS) {
      for (let i = 0; i < count; i += 1) {
        const progress = deckProgressForIndex(i, count)
        expect(progress).toBeGreaterThanOrEqual(0)
        expect(progress).toBeLessThanOrEqual(1)
        expect(deckTargetIndex(progress, count)).toBeCloseTo(i, 6)
        expect(deckFrontIndex(deckTargetIndex(progress, count), count)).toBe(i)
      }
      // Ordered, so a later Project is always further down the Section.
      for (let i = 1; i < count; i += 1) {
        expect(deckProgressForIndex(i, count)).toBeGreaterThan(
          deckProgressForIndex(i - 1, count),
        )
      }
      // And it refuses to name a Project that is not there.
      expect(deckProgressForIndex(-4, count)).toBe(deckProgressForIndex(0, count))
      expect(deckProgressForIndex(count + 4, count)).toBe(
        deckProgressForIndex(count - 1, count),
      )
      expect(deckProgressForIndex(NaN, count)).toBe(deckProgressForIndex(0, count))
    }
  })

  it('survives a Deck of one Project', () => {
    expect(deckSectionViewports(1)).toBeGreaterThan(1)
    expect(deckTargetIndex(0, 1)).toBe(0)
    expect(deckTargetIndex(1, 1)).toBe(0)
    expect(deckFrontIndex(deckTargetIndex(0.5, 1), 1)).toBe(0)
    expect(deckProgressForIndex(0, 1)).toBeGreaterThanOrEqual(0)
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
