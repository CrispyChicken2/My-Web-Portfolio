// Every mapping from Visitor input to a motion parameter lives here: the
// Field's uniforms, the Deck's per-Project progress, and the three Zoom
// moments. Numbers in, numbers out — this module imports nothing from React,
// the DOM or the rendering surface, which is what makes it the one seam the
// redesign is tested at.

export const clamp = (value, lo, hi) =>
  Number.isFinite(value) ? Math.min(hi, Math.max(lo, value)) : lo

export const clamp01 = (value) => clamp(value, 0, 1)

const easeOutCubic = (t) => 1 - (1 - t) ** 3
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

// ---------------------------------------------------------------------------
// Visitor input → Field uniforms
// ---------------------------------------------------------------------------

// Cursor position as the Field wants it: the origin at the centre of the
// viewport, ±1 at the edges, y pointing up. A pointer dragged outside the
// window (or a viewport of zero size) can never push the Field past ±1.
export function pointerToField(clientX, clientY, width, height) {
  if (!(width > 0) || !(height > 0)) return { x: 0, y: 0 }
  if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) return { x: 0, y: 0 }
  return {
    x: clamp((clientX / width) * 2 - 1, -1, 1),
    y: clamp(1 - (clientY / height) * 2, -1, 1),
  }
}

// The scroll speed at which the Field's response is essentially saturated.
export const VELOCITY_REFERENCE = 9000 // px/s

// Signed, normalised scroll speed. tanh rather than a hard clamp so the
// response softens as it approaches its limit instead of hitting a wall —
// and so no flick, however violent, can drive the Field past ±1.
export function scrollVelocity(deltaPx, deltaMs, reference = VELOCITY_REFERENCE) {
  if (!Number.isFinite(deltaPx) || !Number.isFinite(deltaMs) || deltaMs <= 0) return 0
  const pxPerSecond = deltaPx / (deltaMs / 1000)
  return Math.tanh(pxPerSecond / reference)
}

// Frame-rate independent decay — what makes the Field settle once the Visitor
// stops scrolling rather than stopping dead.
export function settle(value, deltaMs, halfLifeMs = 140) {
  if (!Number.isFinite(value) || !Number.isFinite(deltaMs) || deltaMs <= 0) return value || 0
  const next = value * 0.5 ** (deltaMs / halfLifeMs)
  return Math.abs(next) < 1e-4 ? 0 : next
}

// Frame-rate independent easing toward a target — what makes the Field follow
// the cursor rather than snap to it.
export function approach(current, target, deltaMs, halfLifeMs = 140) {
  if (!Number.isFinite(deltaMs) || deltaMs <= 0) return current
  return current + (target - current) * (1 - 0.5 ** (deltaMs / halfLifeMs))
}

// A blur amount as a filter value. 'none' rather than blur(0px), so whatever
// is in focus does not pay for a filter pass it does not use. Takes a number
// and returns a string; it touches no DOM.
export function blurFilter(px) {
  return !(px > 0.05) ? 'none' : `blur(${px.toFixed(2)}px)`
}

// ---------------------------------------------------------------------------
// The Deck
// ---------------------------------------------------------------------------

// Of each Project's viewport of scroll, this much is the handover to the next
// Project; the rest is the dwell where the Project is fully presented.
const HANDOVER = 0.62
const DWELL = 1 - HANDOVER

// How tall the Projects Section is, in viewport heights: one per Project for
// the scrolling, plus one for the sticky pane itself. No Project count is
// special — this is what lets a Project be added by editing content alone.
export function deckSectionViewports(count) {
  return Math.max(count, 1) + 1
}

// Where the Deck stands, measured in Projects. Starts slightly negative so the
// first Project gets its own dwell before anything begins covering it.
function deckPosition(sectionProgress, count) {
  return clamp01(sectionProgress) * Math.max(count, 1) - DWELL
}

// The frontmost Project — what the Deck counter reports.
export function deckFrontIndex(sectionProgress, count) {
  const n = Math.max(count, 1)
  return clamp(Math.round(deckPosition(sectionProgress, count)) || 0, 0, n - 1)
}

// One Project's state at a given scroll offset.
//   enter   0 → 1  rising from below into place
//   recede  0 → 1  being covered by the next Project
// The last Project never recedes: nothing is coming to cover it.
export function projectState(sectionProgress, index, count) {
  const u = deckPosition(sectionProgress, count) - index
  const enter = clamp01((u + 1) / HANDOVER)
  const recede = index >= count - 1 ? 0 : clamp01(u / HANDOVER)

  const rising = easeOutCubic(enter)
  const covered = easeInOutCubic(recede)

  return {
    enter,
    recede,
    // Fully arrived and not yet covered — the state every Project must reach.
    presented: enter >= 1 && recede <= 0,
    // Percent of the sticky pane: up from below, then a small lift as it goes.
    y: (1 - rising) * 100 - covered * 5,
    // The Deck's recede — one of the site's three Zoom moments.
    scale: 1 - covered * 0.14,
    opacity: clamp01(enter * 1.6) * (1 - covered * 0.55),
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
