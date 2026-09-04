# 0004 — Back to a dark content layer

**Status:** accepted · 2026-09-04
**Supersedes:** [ADR 0002](./0002-light-content-layer.md)

## Context

[ADR 0002](./0002-light-content-layer.md) inverted the content layer to light.
The reasoning there was sound for the Backdrop it was written against: Oscar's
chosen palette at the time (`#D6EAF0`, `#12c8ff`, `#8ef099`) was brighter than
the dark theme's brightest *text*, so light-on-dark content over it was
unreadable at any scrim that left the Backdrop worth having.

The Backdrop has since changed twice. It is now a `waterPlane`
ShaderGradient preset in `#606080`, `#8d7dca` and `#212121` — a dark surface.
The premise ADR 0002 rested on is gone: dark text on *this* Backdrop is the
unreadable combination.

Measured against the preset's brightest colour (`#8d7dca`, relative luminance
0.246), light content reads:

| | bare Backdrop | `.panel-glass` | `.panel-glass-subtle` |
|---|---|---|---|
| `--fg1` headings | 3.05 | 7.34 | 14.15 |
| `--fg3` body | 1.71 | 4.12 | 7.93 |
| Signal `#c9f24d` | 2.75 | 6.62 | 12.76 |

Panels are comfortable. Text sitting directly on the Backdrop is not — which
is the same problem the first dark attempt had, and it has the same answer.

## Decision

Invert the content layer back to light-on-dark, and solve unpanelled text with
the halo rather than a scrim.

- The cold scale returns to `--fg1` brightest, `--fg8` faintest; Panels return
  to deep translucency; sheens return to white highlights on dark.
- **The Signal collapses back to one value.** The two-value split existed only
  because bright lime is illegible as text on a pale Panel. On dark it clears
  12.76:1 as text and works as a filled surface, so `--sig-text` and
  `--sig-text-rgb` are deleted and `#c9f24d` does both jobs again. "Exactly one
  colour means actionable" is literally true again rather than "one hue".
- **No scrim.** Text on the Backdrop carries a near-black halo (`.on-field`),
  local to the glyphs. Dimming the whole Backdrop is what made the first dark
  version read as a black page, and it is not repeated.

### On the periwinkle

`SPECS.md` puts "Restoring the retired periwinkle and orange in any form" out
of scope, and the preset's `#8d7dca` is unmistakably in that family (hue 252
against the retired `#8da0ce`'s 222, and more saturated).

The reading taken here, deliberately and with the conflict in view: that rule
governs **Tokens and the content layer**, whose discipline is what the rule
protects — one cold scale, one Signal, nothing competing. That discipline is
intact. The Backdrop is a third-party preset whose colours are props, and
`CONTEXT.md` already names it the one place colour may be lavish. A future
reader who finds periwinkle in the Backdrop and the ban in the spec should
know it was seen and decided, not missed.

## Consequences

**What we gained**

- Content that is readable over the Backdrop actually chosen.
- One Signal value again — one fewer Token, and one fewer caveat in the
  glossary.

**What we gave up**

- ADR 0002's measurements are now history rather than description. It is kept
  intact for that reason: the fact that light was tried, measured and
  abandoned is worth more than a tidy record.
- Every Token changed value, for the third time in this redesign. The Token
  block absorbed each one as a single edit, which is the strongest evidence so
  far that the ticket-01 prefactor earned its keep.

**What it costs to reverse**

One edit to the Token block, plus a re-check of every contrast pair. The
Backdrop's brightness is what decides this, so it reverses only if the
Backdrop changes again.

## Alternatives considered

- **Keep the light content layer and scrim the Backdrop upward.** Rejected:
  veiling a dark preset toward white to carry dark text destroys exactly the
  moody surface that was chosen.
- **Keep the two-value Signal for stability.** Rejected: the second value is
  dead weight on a dark page, and carrying an unused value invites someone to
  use it decoratively.
- **Put the unpanelled Sections on Panels instead.** Rejected: it would change
  the Sections' composition — a bigger design change than the readability
  problem warrants, and the per-Section transparency contract is deliberate.
