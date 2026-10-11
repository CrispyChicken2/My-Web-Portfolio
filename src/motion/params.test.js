import { describe, expect, it } from 'vitest'
import { aboutArrival, blurFilter, heroDolly, imageResolve } from './params'

// Everything here is numbers in, numbers out. These are the only assertions
// the site makes about motion: the rest of it is judged by eye. The Deck has
// none — its travel is the browser's own scrolling.

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

  it('clamps every mapping outside its range', () => {
    for (const moment of [heroDolly, aboutArrival, imageResolve]) {
      expect(moment(-4)).toEqual(moment(0))
      expect(moment(4)).toEqual(moment(1))
      expect(moment(NaN)).toEqual(moment(0))
    }
  })
})
