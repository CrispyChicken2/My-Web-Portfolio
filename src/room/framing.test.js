import { describe, expect, it } from 'vitest'
import { cubicBezier, easeInOutQuint, easeOutExpo, fitDistance, idleSway } from './framing'

describe('cubicBezier', () => {
  const ease = cubicBezier(0.13, 0.99, 0, 1)

  it('starts at 0 and ends at 1', () => {
    expect(ease(0)).toBe(0)
    expect(ease(1)).toBe(1)
  })

  it('clamps outside its range', () => {
    expect(ease(-2)).toBe(0)
    expect(ease(3)).toBe(1)
  })

  it('never moves backwards', () => {
    let previous = 0
    for (let t = 0; t <= 1; t += 0.01) {
      const value = ease(t)
      expect(value).toBeGreaterThanOrEqual(previous - 1e-9)
      previous = value
    }
  })

  it('matches the identity curve when the handles sit on the diagonal', () => {
    const linear = cubicBezier(0.25, 0.25, 0.75, 0.75)
    expect(linear(0.3)).toBeCloseTo(0.3, 4)
    expect(linear(0.8)).toBeCloseTo(0.8, 4)
  })
})

describe('the named easings', () => {
  it('start at 0 and end at 1', () => {
    expect(easeOutExpo(0)).toBeCloseTo(0, 6)
    expect(easeOutExpo(1)).toBe(1)
    expect(easeInOutQuint(0)).toBe(0)
    expect(easeInOutQuint(1)).toBe(1)
    expect(easeInOutQuint(0.5)).toBeCloseTo(0.5, 6)
  })
})

describe('fitDistance', () => {
  const screen = { width: 16, height: 9, fov: 30 }

  it('lets both dimensions fit exactly when the viewport has the screen’s shape', () => {
    const tanHalf = Math.tan((15 * Math.PI) / 180)
    expect(fitDistance({ ...screen, aspect: 16 / 9 })).toBeCloseTo(4.5 / tanHalf, 6)
  })

  it('is decided by the width on a portrait viewport', () => {
    const wide = fitDistance({ ...screen, aspect: 16 / 9 })
    const tall = fitDistance({ ...screen, aspect: 9 / 16 })
    expect(tall).toBeGreaterThan(wide * 3)
  })

  it('stands further back to leave a margin', () => {
    const tight = fitDistance({ ...screen, aspect: 16 / 9 })
    expect(fitDistance({ ...screen, aspect: 16 / 9, margin: 0.1 })).toBeCloseTo(tight * 1.1, 6)
  })
})

describe('idleSway', () => {
  it('stays within its swing', () => {
    for (let time = 0; time < 200; time += 3.7) {
      const { angle, height } = idleSway(time, { swing: 0.3, period: 70, lift: 8, liftPeriod: 45 })
      expect(Math.abs(angle)).toBeLessThanOrEqual(0.3)
      expect(Math.abs(height)).toBeLessThanOrEqual(8)
    }
  })
})
