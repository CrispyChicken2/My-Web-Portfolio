# 0008 — The site opens on a Room

**Status:** accepted · 2026-10-20

## Context

The owner pointed at [henryheffernan.com](https://henryheffernan.com/)
([source](https://github.com/henryjeff/portfolio-website), MIT) as the base for
the site: a 3D desk you arrive at, a camera that glides between a handful of
viewpoints, and a monitor whose screen is a real, usable web page. They asked
for the same mechanics and fluidity, but with modern hardware (desk, chair,
computer), and for the portfolio's content to stay exactly as it is.

That reference is built from baked Blender models and recorded sounds. Neither
can come along: the models are the reference's own, the owner asked for
different furniture, and the content-security policy allows no external origin.

## Decision

`/` is now the **Room**: a procedurally modelled evening desk (three.js,
`src/room/`) with the owner's own kind of setup — a standing oak desk; a
34-inch 21:9 ultrawide on a matte black stand, with a light bar; a 75%
mechanical keyboard with a coiled cable; a gaming PC built as it really is (a
Lian Li O11 Dynamic Mini V2 with its two pillarless glass panels and all nine
fan mounts filled, an Arctic Liquid Freezer III A-RGB 360, an ASUS TUF RTX
5070), every light in it lavender; a Razer BlackShark V2 X on its stand; an
ergonomic office chair with a cushioned seat, an S-curved mesh back and a
headrest; a right-hand wall of books and football trophies; a laundry hamper;
slippers under the desk; and the owner's dog, an English Springer Spaniel,
asleep in a cushioned bed with his plushies. The dog's body is a signed
distance field polygonised with marching cubes; fur is drawn as shells. Everything is
built in code at load time — geometry, canvas textures, synthesised sound —
so nothing is downloaded and nothing leaves the origin.

The case's fan mounts are top 3, bottom 3, side 2 (on the right panel, in the
rear chamber) and rear 1 — the owner's "two at the back, one at the side",
read against the real case.

The mechanics follow the reference:

- a firmware-style **loader**, then a start card whose press unlocks sound;
- four **Viewpoints** — loading, idle (a slow orbit), desk (leans with the
  pointer), monitor (square on, fitted to the window) — with a click anywhere
  toggling idle and desk, pointing at the monitor going in, and leaving it
  coming back out. Moves start from wherever the camera is and land on where
  the destination is *now*. A fifth, added later at the owner's request,
  glides down to the dog when the pointer is over his bed;
- an overlay that types itself out — name, role, clock — on the Room's own
  keyboard.

The monitor shows the **Screen** (`screen.html`, `src/screen/`): a desktop in
an iframe, laid over the glass with a CSS 3D transform, and dressed — at the
owner's request — as a dark Windows 11 desktop, its accent the PC's lavender.
It boots, signs in, and opens the **Portfolio** in a browser window on its
own; it also has a start menu, a PowerShell-style Terminal and a Recycle Bin.
The Portfolio presents the content of `src/data/content.js` unchanged. The
desktop imitates the look of Windows; it is not Microsoft's, and draws its
own icons.

Two things were added beyond the reference: every key of the 3D keyboard goes
down when that key is pressed on the Screen, and the 3D mouse follows the
pointer across the monitor.

The scrolling site is kept, untouched, as the **plain version**
(`classic.html`). It is linked from the loader and the overlay, and it is
where a phone, a browser without WebGL, or a failed start is sent.

## Consequences

- **The Screen is drawn over the canvas, not behind it.** The reference cuts a
  hole in its canvas for the page to show through. Nothing in the Room ever
  passes in front of the monitor from any Viewpoint, so the page can sit on
  top instead, which leaves the canvas free to run ambient occlusion and
  bloom. A future object placed between a camera and the monitor would be
  drawn *under* the Screen; keep the monitor's line of sight clear.
- **Framing the site in an iframe is now allowed — from its own origin only.**
  `vercel.json` sends `X-Frame-Options: SAMEORIGIN` and
  `frame-ancestors 'self'` instead of `DENY`, and the build CSP names
  `frame-src 'self'`.
- **The Room's colours are not Tokens.** Like the Backdrop's, they are WebGL
  material values and live in one file, `src/room/palette.js`. The overlay
  and the Screen are ordinary CSS and use Tokens; new Tokens for the Screen
  were added to the Token block.
- **Interface strings have their own Dictionary**, `src/data/interface.js`,
  so the content file is not touched. It has the same parity test as the
  content.
- **Cost.** three.js and the Room are ~320 KB gzipped, loaded behind the
  loader. The Room guesses a starting quality from the graphics chip and
  steps down while the first seconds run slow; the lowest step drops the
  fur, the post-processing and half the shadow resolution. Static meshes are
  merged by material once built, which took a full frame from ~2,700 draw
  calls to ~1,200 at high quality and ~560 at low.
- **The Backdrop, the Deck and the Figure now live only in the plain
  version.** ADRs 0001–0007 still describe that version accurately.
