// Which tier of the Field this device gets. Read fresh whenever the viewport
// changes, so rotating a phone re-evaluates it without a reload.

export function readTier(win = window) {
  const coarse = win.matchMedia('(pointer: coarse)').matches
  const narrow = win.matchMedia('(max-width: 820px)').matches
  const mobile = coarse || narrow
  const dpr = win.devicePixelRatio || 1

  return {
    mobile,
    // Phones render the Field at a fraction of native resolution; the content
    // layer is DOM text and is unaffected either way.
    pixelScale: mobile ? Math.min(dpr, 2) * 0.4 : Math.min(dpr, 1.25),
    // The point layer is the expensive half and the first thing phones lose.
    points: !mobile,
    // Pointer reactivity does not exist on touch, so no pointer work is done.
    pointer: !mobile && win.matchMedia('(hover: hover)').matches,
  }
}

export function sameTier(a, b) {
  return (
    !!a && !!b &&
    a.pixelScale === b.pixelScale &&
    a.points === b.points &&
    a.pointer === b.pointer
  )
}
