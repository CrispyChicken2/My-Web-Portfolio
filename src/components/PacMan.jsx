// A character-art Pac-Man that stands behind the Projects, chomping in place
// while pellets travel into its mouth and three ghosts flee ahead of it. It
// overhangs the top-right corner of
// the Panel in front of it, so its lower-left is covered on purpose. Pure
// decoration: hidden from assistive technology, no pointer input, no string.
//
// Nothing here is drawn by hand. The figure is a lit sphere sampled onto a
// character grid: every cell inside the circle gets a glyph for how bright it
// is and a tone for which step of the shading it falls on, so the body is
// filled edge to edge and the only thing that changes between frames is the
// mouth, the pellets and the hems of the ghosts.

const CELL_W = 6 // px — one glyph of the 10px mono face
const CELL_H = 10
const RADIUS = 150
const ROWS = (RADIUS * 2) / CELL_H
const BODY_COLS = (RADIUS * 2) / CELL_W
const LANE = 32 // columns of pellet lane to the left of the body
const GHOST_LANE = 36 // and, further left again, the columns the ghosts flee in
const COLS = GHOST_LANE + LANE + BODY_COLS
const CENTRE_X = (GHOST_LANE + LANE) * CELL_W + RADIUS
const CENTRE_Y = RADIUS

// Darkest to brightest. No sparse glyphs: the shadow side stays full.
const RAMP = '=+*xXO%#@'

// The mouth's half-angle in degrees, closed to wide, and the order the frames
// visit them in. The first frame is an open one, which is the frame a Visitor
// who prefers reduced motion is left looking at.
const MOUTH = [3, 11, 22, 34, 44]
const SEQUENCE = [3, 4, 3, 2, 1, 0, 1, 2]
const LIP = 5

// Pellets advance a whole spacing over one loop, which is what makes the loop
// seamless: the last frame hands over to the first with every pellet exactly
// where its neighbour was.
const SPACING = 16
const STEP = SPACING / SEQUENCE.length
const PELLET = ['.##.', "'##'"]
const PELLET_ROW = Math.floor(ROWS / 2) - 1
const SWALLOWED_AT = GHOST_LANE + LANE + Math.round((RADIUS * 0.64) / CELL_W)

// A ghost, looking left — the way it is running. '0' is an eye; every other
// mark is body, and which glyph it becomes depends on how far it is from the
// lit corner. The hem alternates between two cuts, which is all the running a
// ghost that never leaves its spot can do.
const GHOST = ['  @@@@@  ', ' @@@@@@@ ', '@00@@00@@', '@@@@@@@@@', '@@@@@@@@@']
const HEM = ['@@ @@@ @@', '@ @@ @@ @']
const GHOST_SHADE = '@#%x'
const GHOST_COUNT = 3
const GHOST_PITCH = GHOST[0].length + 3
const GHOST_ROW = PELLET_ROW - 2

// Spelled out rather than assembled, so the stylesheet build can see every
// class the figure uses and keeps all of them.
const TONE_CLASS = {
  0: 'pac-t0',
  1: 'pac-t1',
  2: 'pac-t2',
  3: 'pac-t3',
  4: 'pac-t4',
  p: 'pac-tp',
  g0: 'pac-g0',
  g1: 'pac-g1',
  g2: 'pac-g2',
}

const unit = (x, y, z) => {
  const length = Math.hypot(x, y, z)
  return [x / length, y / length, z / length]
}
const LIGHT = unit(-0.45, -0.6, 0.66)
const HALF = unit(LIGHT[0], LIGHT[1], LIGHT[2] + 1) // between the light and the eye
const clamp01 = (value) => Math.min(1, Math.max(0, value))
// Stable per-cell grain, so the texture does not shimmer from frame to frame.
const grain = (col, row) => {
  const n = Math.sin(col * 12.9898 + row * 78.233) * 43758.5453
  return n - Math.floor(n)
}

// The body, sampled once: for each cell its glyph, its tone, and its angle
// from the direction the figure faces (left), which is all a frame needs to
// decide whether the mouth has opened over it.
const BODY = Array.from({ length: ROWS }, (_, row) =>
  Array.from({ length: COLS }, (_, col) => {
    const x = ((col + 0.5) * CELL_W - CENTRE_X) / RADIUS
    const y = ((row + 0.5) * CELL_H - CENTRE_Y) / RADIUS
    const d2 = x * x + y * y
    if (d2 > 1) return null
    // The eye is a hole.
    if ((x + 0.22) ** 2 + (y + 0.5) ** 2 < 0.012) return null

    const z = Math.sqrt(1 - d2)
    const lambert = Math.max(0, x * LIGHT[0] + y * LIGHT[1] + z * LIGHT[2])
    const specular = Math.max(0, x * HALF[0] + y * HALF[1] + z * HALF[2]) ** 24
    const lum = clamp01(0.16 + 0.78 * lambert + 0.5 * specular)

    const step = Math.floor(lum * RAMP.length + (grain(col, row) - 0.5) * 1.4)
    const glyph = RAMP[Math.min(RAMP.length - 1, Math.max(0, step))]
    const tone = lum > 0.9 ? 0 : lum > 0.66 ? 1 : lum > 0.45 ? 2 : lum > 0.28 ? 3 : 4
    const angle = (Math.abs(Math.atan2(y, 0 - x)) * 180) / Math.PI
    return { glyph, tone, angle }
  }),
)

function frame(mouth, tick) {
  const cells = BODY.map((line) =>
    line.map((cell) => {
      if (!cell || cell.angle < mouth) return null
      // A darker lip along the edge of the mouth, so it reads as an opening
      // in a solid rather than a slice missing from a disc.
      if (cell.angle < mouth + LIP) return { glyph: '#', tone: 4 }
      return cell
    }),
  )

  // Pellets only ever land on empty cells, so the body occludes them and a
  // closing mouth swallows one without any bookkeeping.
  for (
    let col = GHOST_LANE + tick * STEP - SPACING;
    col + PELLET[0].length <= SWALLOWED_AT;
    col += SPACING
  ) {
    PELLET.forEach((line, dy) => {
      ;[...line].forEach((glyph, dx) => {
        const at = col + dx
        if (at >= GHOST_LANE && !cells[PELLET_ROW + dy][at]) {
          cells[PELLET_ROW + dy][at] = { glyph, tone: 'p' }
        }
      })
    })
  }

  // The ghosts. Neighbours are half a stride apart, so the three hems never
  // flick in unison.
  for (let ghost = 0; ghost < GHOST_COUNT; ghost += 1) {
    const hem = HEM[(Math.floor(tick / 2) + ghost) % HEM.length]
    ;[...GHOST, hem].forEach((line, dy) => {
      ;[...line].forEach((mark, dx) => {
        if (mark === ' ') return
        cells[GHOST_ROW + dy][ghost * GHOST_PITCH + dx] =
          mark === '0'
            ? { glyph: '0', tone: 'p' }
            : {
                glyph: GHOST_SHADE[Math.min(GHOST_SHADE.length - 1, Math.floor((dx + dy) / 4))],
                tone: `g${ghost}`,
              }
      })
    })
  }
  return cells
}

// One row as runs of a single tone, so a frame is a few hundred spans rather
// than a few thousand.
function runs(line, key) {
  const out = []
  let text = ''
  let tone = null
  const flush = () => {
    if (!text) return
    out.push(
      tone === null ? text : <span key={`${key}-${out.length}`} className={TONE_CLASS[tone]}>{text}</span>,
    )
    text = ''
  }
  line.forEach((cell) => {
    const next = cell ? cell.tone : null
    if (next !== tone) {
      flush()
      tone = next
    }
    text += cell ? cell.glyph : ' '
  })
  flush()
  out.push('\n')
  return out
}

const STRIP = SEQUENCE.flatMap((mouth, tick) =>
  frame(MOUTH[mouth], tick).flatMap((line, row) => runs(line, `${tick}-${row}`)),
)
const FPS = 10

export default function PacMan() {
  return (
    <div
      className="pac"
      aria-hidden="true"
      style={{ height: ROWS * CELL_H, '--pac-near-w': `${(LANE + BODY_COLS) * CELL_W}px` }}
    >
      <pre
        style={{
          animationDuration: `${Math.round((SEQUENCE.length / FPS) * 1000)}ms`,
          animationTimingFunction: `steps(${SEQUENCE.length})`,
        }}
      >
        {STRIP}
      </pre>
    </div>
  )
}
