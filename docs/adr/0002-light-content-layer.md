# 0002 — The content layer is light, so the Field never has to be dimmed

**Status:** accepted · 2026-09-04

## Context

The redesign approved in `SPECS.md` assumed a dark page: a near-black ground,
a cold scale running from bright text down to faint, and an acid-lime Signal
glowing on top of it. The Field — the WebGL Backdrop from
[ADR 0001](./0001-hand-written-webgl-field.md) — sat behind that content.

Built as specified, it did not work. The problem is arithmetic, not taste.
Light text over a lavish Field needs the Field dimmed to stay legible, and the
numbers are unforgiving: with body text at `#a5b7bf`, the Field's brightest
patch had to be scrimmed roughly 80% toward black before the text cleared
4.5:1. At that point the Backdrop is a very dark rectangle with a hint of
colour in it, which is precisely what `CONTEXT.md` says the Field must not be:

> The Field is the only place on the site where colour is allowed to be
> lavish, which is what lets the content layer stay austere.

The dark theme could have a lavish Field or legible content over it, not both.
Reviewed on screen, it read as a near-black page and was rejected.

Separately, Oscar chose a new Backdrop palette — `#D6EAF0` pale ice,
`#12c8ff` cyan, `#8ef099` mint. Two of those are brighter than the dark
theme's brightest *text*; `#D6EAF0` has a relative luminance of 0.794 against
`--fg1`'s 0.79. Light text on them lands at 1.07:1. They are light-theme
colours.

## Decision

Invert the content layer. Dark text on pale surfaces, over a Field that runs
at full brightness with no scrim at all — only a whisper of white toward the
foot of the page and a light vignette.

- The cold scale inverts: `--fg1` is now the darkest step, not the brightest.
- Panels become white-ish translucency; Glass sheens become white highlights.
- The Signal becomes one hue at two values. `--sig` (`#c9f24d`) fills a
  surface and carries `--ink` on top of it; `--sig-text` (`#5f7a00`) is the
  same lime darkened for when the Signal is *text*. The bright value is
  1.21:1 as text on a pale Panel, and two of the Signal's three sanctioned
  uses — the active nav item and a Project's Highlight — are text.
- `.on-field`, the halo carried by text sitting directly on the Field, becomes
  white rather than near-black.
- The site is light only. It does not answer `prefers-color-scheme`.

Measured: body text clears 5.1:1 over the Field's most saturated patch and
8.3:1 on a Panel; the Signal fill carries its ink text at 14.35:1.

## Consequences

**What we gained**

- The Field is finally what the glossary says it is. It needs no scrim, so the
  Backdrop can be as lavish as the palette allows.
- The chosen colours work as chosen, at full strength, rather than being
  muted into a dark wash.
- Contrast has more headroom than the dark theme ever had.

**What we gave up**

- Every Token changed value. The dark theme is gone, not toggleable — see the
  alternatives below.
- The Signal needs two values where it needed one. This is a real concession:
  "exactly one colour means actionable" is now "exactly one *hue*". The
  glossary was updated to say so rather than quietly stretching the old
  wording.
- `SPECS.md` describes a dark page throughout and is now historically accurate
  rather than currently accurate. It was deliberately left alone: rewriting it
  would hide that this changed after approval.

**What it costs to reverse**

One edit to the Token block, which is the point of having one — but also a
re-check of every contrast pair, and the Field's colours would have to go back
to something a dark page can carry.

## Alternatives considered

- **Keep the dark page, use the new colours anyway.** Rejected on the
  arithmetic above: the scrim needed to make them safe is the scrim that makes
  them invisible.
- **Keep the dark page, pick different Backdrop colours.** Viable, and what
  the original spec assumed. Rejected because the Field had already been built
  that way, reviewed, and judged worse than the preset it replaced. Ticket 03
  priced exactly this outcome at one step.
- **Support both themes via `prefers-color-scheme`.** Rejected: it doubles the
  palette and doubles the contrast checking, permanently, against a working
  agreement that retheming stays a single edit. For a portfolio read once,
  briefly, by a recruiter, the cost is not repaid.
- **Keep one Signal value and drop the Signal's text uses.** Rejected: it
  would strip a Project's Highlight of the emphasis the whole card is built
  around.
