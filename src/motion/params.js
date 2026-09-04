// Every mapping from Visitor scroll to a motion parameter lives here: the
// Deck's per-Project travel and the three Zoom moments. Numbers in, numbers
// out — this module imports nothing from React, the DOM or the rendering
// surface, which is what makes it the one seam the redesign is tested at.
//
// The Backdrop takes no Visitor input at all: it is a third-party preset that
// animates on its own, so there is no pointer or scroll-velocity mapping here
// any more.

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
// How the scroll-driven moments travel
// ---------------------------------------------------------------------------

// The Deck travels between whole Projects: slow enough to read as one
// deliberate movement, damped enough to arrive without wobbling.
export const DECK_SPRING = { stiffness: 90, damping: 20, mass: 0.7, restDelta: 0.001 }

// The other two Zoom moments glide toward where the scroll says they should
// be rather than tracking it exactly, so they settle after the Visitor stops
// instead of stopping dead wherever the wheel left them.
export const ZOOM_SPRING = { stiffness: 110, damping: 26, mass: 0.5, restDelta: 0.0005 }

// ---------------------------------------------------------------------------
// The Deck
// ---------------------------------------------------------------------------

// How tall the Projects Section is, in viewport heights: one per Project for
// the scrolling, plus one for the sticky pane itself. No Project count is
// special — this is what lets a Project be added by editing content alone.
export function deckSectionViewports(count) {
  return Math.max(count, 1) + 1
}

// Which Project the Deck rests on. Scroll chooses a whole Project and never a
// position between two, so a Project can no longer be left stranded half-risen
// when the Visitor stops scrolling — the spring driving `deckCardState` below
// carries it the rest of the way in one movement.
export function deckTargetIndex(sectionProgress, count) {
  const n = Math.max(count, 1)
  return clamp(Math.round(clamp01(sectionProgress) * (n - 1)), 0, n - 1)
}

// Where one Project sits, given how far it is from the Project the Deck is
// resting on. `offset` is that distance, and it arrives here mid-flight from a
// spring, so every value in between has to look deliberate:
//
//   offset < 0   still to come — waiting below the fold
//   offset = 0   the current Project, presented alone
//   offset > 0   already passed — receding behind the ones after it
export function deckCardState(offset) {
  const o = Number.isFinite(offset) ? offset : 0

  const waiting = clamp01(-o)
  const covered = easeInOutCubic(clamp01(o))

  return {
    // Fully arrived, and near enough to rest. The tolerance is what lets a
    // settling spring count as "arrived" rather than flickering on the exact
    // integer.
    presented: Math.abs(o) < 0.15,
    // The two travels are kept apart, because they are measured against
    // different things. The entry is measured against the pane a Project
    // crosses, not against the Project: a percent of a Panel only clears
    // the screen while a Panel happens to be as tall as the pane, and it
    // will not stay that way. In viewport heights — the consumer turns
    // them into the pane's own unit and composes the two.
    enterVh: waiting * 100,
    // The lift is a fraction of the card itself — a Project being covered
    // climbs toward the centre, so the handover between two Projects happens
    // where the eye already is. Percent of the Panel. Written as a
    // subtraction from zero so a Project at rest is exactly untransformed
    // rather than at -0.
    y: 0 - covered * 10,
    // The Deck's recede — one of the site's three Zoom moments.
    scale: 1 - covered * 0.14,
    // Visible from one Project below (so the Visitor watches it rise) until
    // one Project behind (so they watch it go), and nothing beyond that.
    opacity: clamp01(o + 2) * (1 - clamp01(o - 1)),
    blur: covered * 7,
  }
}

// ---------------------------------------------------------------------------
// The three Zoom moments
// ---------------------------------------------------------------------------

// 1. Hero → About. The Hero pushes past the Visitor rather than sliding away.
export function heroDolly(progress) {
  const p = clamp01(progress)
  return {
    scale: 1 + p * 0.18,
    opacity: 1 - easeInOutCubic(p) * 0.9,
    blur: p * 9,
    y: -p * 30,
  }
}

// 2. About arrives from behind the Hero, settling at its resting size.
export function aboutArrival(progress) {
  const p = easeOutCubic(clamp01(progress))
  return {
    scale: 1 - (1 - p) * 0.07,
    opacity: p,
    y: (1 - p) * 26,
  }
}

// 3. The About Image slot resolves as it enters — the site's one photograph.
export function imageResolve(progress) {
  const p = clamp01(progress)
  const eased = easeOutCubic(p)
  return {
    scale: 1 + (1 - eased) * 0.14,
    blur: (1 - eased) * 16,
    opacity: clamp01(p * 1.6),
  }
}
