// The Room's camera arithmetic. Numbers in, numbers out — like
// src/motion/params.js, this module imports nothing from three.js, React or
// the DOM, which is what lets it be tested on its own.

export const clamp = (value, lo, hi) =>
  Number.isFinite(value) ? Math.min(hi, Math.max(lo, value)) : lo

export const clamp01 = (value) => clamp(value, 0, 1)

export const lerp = (a, b, t) => a + (b - a) * t

// ---------------------------------------------------------------------------
// Easing
// ---------------------------------------------------------------------------

export const easeOutExpo = (t) => (t >= 1 ? 1 : 1 - 2 ** (-10 * clamp01(t)))

export const easeInOutQuint = (t) => {
  const p = clamp01(t)
  return p < 0.5 ? 16 * p ** 5 : 1 - (-2 * p + 2) ** 5 / 2
}

// The CSS cubic-bezier() timing function, so a curve tuned in a browser's
// devtools can be pasted in as four numbers. Solves x(s) = t for the curve
// parameter s with Newton's method, falling back to bisection where the
// slope is too flat for Newton to be trusted.
export function cubicBezier(x1, y1, x2, y2) {
  const cx = 3 * x1
  const bx = 3 * (x2 - x1) - cx
  const ax = 1 - cx - bx
  const cy = 3 * y1
  const by = 3 * (y2 - y1) - cy
  const ay = 1 - cy - by

  const sampleX = (s) => ((ax * s + bx) * s + cx) * s
  const sampleY = (s) => ((ay * s + by) * s + cy) * s
  const slopeX = (s) => (3 * ax * s + 2 * bx) * s + cx

  const solve = (t) => {
    let s = t
    for (let i = 0; i < 8; i += 1) {
      const error = sampleX(s) - t
      if (Math.abs(error) < 1e-6) return s
      const slope = slopeX(s)
      if (Math.abs(slope) < 1e-6) break
      s -= error / slope
    }
    let lo = 0
    let hi = 1
    s = t
    for (let i = 0; i < 40; i += 1) {
      const x = sampleX(s)
      if (Math.abs(x - t) < 1e-6) return s
      if (x < t) lo = s
      else hi = s
      s = (lo + hi) / 2
    }
    return s
  }

  return (t) => {
    const p = clamp01(t)
    if (p === 0 || p === 1) return p
    return sampleY(solve(p))
  }
}

// ---------------------------------------------------------------------------
// Framing the monitor
// ---------------------------------------------------------------------------

// How far in front of a flat rectangle a camera has to stand for the whole
// rectangle to fit the viewport, with `margin` (a fraction of the rectangle)
// left over around it. `fov` is the camera's vertical field of view in
// degrees and `aspect` the viewport's width over its height. Whichever of the
// two dimensions is the tighter fit decides.
export function fitDistance({ width, height, fov, aspect, margin = 0 }) {
  const tanHalf = Math.tan(((fov * Math.PI) / 180) / 2)
  const grow = 1 + Math.max(0, margin)
  const byHeight = (height * grow) / 2 / tanHalf
  const byWidth = (width * grow) / 2 / (tanHalf * Math.max(aspect, 1e-6))
  return Math.max(byHeight, byWidth)
}

// The slow sway of the idle camera: an angle that drifts either side of where
// it starts, and a height that breathes a little. `time` is in seconds.
export function idleSway(time, { swing, period, lift, liftPeriod }) {
  return {
    angle: swing * Math.sin((time / period) * Math.PI * 2),
    height: lift * Math.sin((time / liftPeriod) * Math.PI * 2 + 1.3),
  }
}
