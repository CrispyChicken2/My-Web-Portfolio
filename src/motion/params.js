// Every mapping from Visitor scroll to a motion parameter lives here: the two
// Zoom moments. Numbers in, numbers out — this module imports nothing from
// React, the DOM or the rendering surface, which is what makes it the one seam
// the site is tested at.
//
// Two things on the site move without passing through here, and both on
// purpose. The Backdrop takes no Visitor input at all: it is a third-party
// preset that animates on its own. And the Deck is a native scroll container —
// its travel is the browser's, so there is no mapping to own. See
// docs/adr/0007-deck-slides-horizontally.md.

export const clamp = (value, lo, hi) =>
  Number.isFinite(value) ? Math.min(hi, Math.max(lo, value)) : lo

export const clamp01 = (value) => clamp(value, 0, 1)

const easeOutCubic = (t) => 1 - (1 - t) ** 3
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

// A blur amount as a filter value. 'none' rather than blur(0px), so whatever
// is in focus does not pay for a filter pass it does not use. Takes a number
// and returns a string; it touches no DOM.
export function blurFilter(px) {
  return !(px > 0.05) ? 'none' : `blur(${px.toFixed(2)}px)`
}

// ---------------------------------------------------------------------------
// How the Zoom moments travel
// ---------------------------------------------------------------------------

// They glide toward where the scroll says they should be rather than tracking
// it exactly, so they settle after the Visitor stops instead of stopping dead
// wherever the wheel left them.
export const ZOOM_SPRING = { stiffness: 110, damping: 26, mass: 0.5, restDelta: 0.0005 }

// ---------------------------------------------------------------------------
// The two Zoom moments
// ---------------------------------------------------------------------------

// 1. Hero → About, in two halves. Leaving: the Hero pushes past the Visitor
// rather than sliding away.
export function heroDolly(progress) {
  const p = clamp01(progress)
  return {
    scale: 1 + p * 0.18,
    opacity: 1 - easeInOutCubic(p) * 0.9,
    blur: p * 9,
    y: -p * 30,
  }
}

// Arriving: About comes up from behind the Hero, settling at its resting size.
export function aboutArrival(progress) {
  const p = easeOutCubic(clamp01(progress))
  return {
    scale: 1 - (1 - p) * 0.07,
    opacity: p,
    y: (1 - p) * 26,
  }
}

// 2. The About Image slot resolves as it enters — the site's one photograph.
export function imageResolve(progress) {
  const p = clamp01(progress)
  const eased = easeOutCubic(p)
  return {
    scale: 1 + (1 - eased) * 0.14,
    blur: (1 - eased) * 16,
    opacity: clamp01(p * 1.6),
  }
}
