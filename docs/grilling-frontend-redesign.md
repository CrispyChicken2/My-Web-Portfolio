# Grilling record: dynamic frontend redesign

**Date:** 2026-09-04
**Session:** `/mattpocock-skills:grill-with-docs` (grilling + domain-modeling)
**Outcome:** [SPECS.md](../SPECS.md), published as issue #1 with ten sub-issues (#2–#11)

The opening request:

> OK, have a look at the project. I'd like to remake the frontend and decoration
> of the website to have something more original, dynamic and active: sliding
> projects, zoom ins and outs, and other ideas. Maybe propose also something more
> complex for the background but keep it dynamic.

Fifteen questions over three rounds. Each round asked only the questions whose
prerequisites were already settled; each answer reshaped the tree and unblocked
the next round.

---

## Findings before round 1

Read first, so the questions were about real decisions rather than guesses.

**What existed:** React 18 · Vite · Tailwind · Framer Motion · a `ShaderGradient`
(three.js) Backdrop · real WebGL liquid glass on the nav only · six Sections ·
one `Reveal` component doing a single calm fade everywhere · **three** Projects ·
strict build-time CSP · CI.

**Two conflicts the request created with the project's own `CONTEXT.md`:**

1. *"Sections are ordered and numbered; that order is the argument the site
   makes"* + *"one audience reading top to bottom"*. Sliding Projects breaks
   top-to-bottom reading — a skimming recruiter may never reach Projects 2 and 3.
2. *"Backdrop: it never carries meaning."* A Backdrop reacting to scroll position
   or Section starts carrying meaning. Either the definition changes or the idea
   does.

Both were put to the user rather than resolved silently. See Q7 and Q8.

---

## Round 1 — the ruling constraints

### Q1 · Scope: skin or surgery?
Visual and motion layer only, or is the structure itself in play?

- **Recommended:** skin + motion only. The Section order *is* the argument;
  rebuilding it at the same time as the presentation makes regressions
  unattributable.
- **Answer:** **skin + motion only** — *"just don't touch the content and impress
  me."*

### Q2 · The dial: original vs. hireable?
(a) Confident — one signature idea, everything else calm.
(b) Expressive — several coordinated effects, still legible in 20 seconds.
(c) Showpiece — the motion *is* the portfolio.

- **Recommended:** (b). For a Data/ML internship, (c) reads as "wants to be a
  creative dev" and buries the ML content. (a) is where the site already was.
- **Answer:** **(b) Expressive.**

### Q3 · Is the accessibility floor absolute?
(a) Every effect decorative — reduced motion or dead WebGL still yields a
complete page. (b) Some effects structural, so reduced motion gets a lesser page
built twice.

- **Recommended:** (a), non-negotiable. Content reachable only through motion is
  an accessibility bug and a locked-down-laptop bug.
- **Answer:** **(a) absolute.**

### Q4 · How many Projects will there be?
Three behaves completely differently from eight. A carousel holding three items
looks like a carousel that ran out of content.

- **Recommended:** answer needed before the mechanic could be chosen.
- **Answer:** **three for now, more soon.** This killed the carousel outright —
  the mechanic must look deliberate at 3 and at 12.

### Q5 · Budget: bundle, mobile, CSP?
- **Recommended:** Framer Motion as the only animation library, add nothing but a
  custom shader, give mobile a calmer tier.
- **Answer:** **as recommended.**

---

## Round 2 — the design

### Q6 · The organizing idea
(a) Depth/camera · (b) Field/signal · (c) Material/liquid.

- **Recommended:** (b) with a dose of (a). It is the only option that says
  something about the subject — a Data/AI engineer whose site is built on a field
  of moving data — rather than generic motion design. (c) doubles down on glass
  and dates the site.
- **Answer:** **(b) + (a).**

### Q7 · The Projects mechanic
(a) Sticky horizontal rail · (b) Stacked deck · (c) Full-bleed scenes.

- **Recommended:** (b). Stays vertical, so the top-to-bottom argument survives
  intact — this resolves conflict 1 above. Scales 3→12. Degrades to a plain stack
  with no second code path. (a) is the most templated dynamic-portfolio move
  there is.
- **Answer:** **(b) the Deck.**

### Q8 · Does the Backdrop get to react?
(a) Inert · (b) continuous input only (cursor, scroll velocity) · (c)
Section-aware.

- **Recommended:** (b). Keeps *"never carries meaning"* literally true while the
  Backdrop still feels alive. (c) creates a second silent navigation system that
  must be kept in sync with six Sections forever.
- **Answer:** **(b).** Resolves conflict 2 without amending the invariant.

### Q9 · Zoom: a rule or a moment?
- **Recommended:** (b) rationed. Applied everywhere, scale-on-entry becomes a tic
  and is the single most common cause of "this site feels cheap."
- **Answer:** **(b) rationed** — later fixed at exactly three Zoom moments.

### Q10 · Palette and type: locked or in play?
- **Recommended:** (b) palette locked, display typeface in play — a characterful
  face does more for originality in the first 400ms than any animation.
- **Answer:** **the inverse.** (c) *"just don't touch the fonts"* → **palette in
  play, typography locked.** Recommendation not taken.

---

## Round 3 — the technique

### Q11 · Palette direction
Flagged: three accents at equal weight is why the site read generic, and
teal + orange is the cinema colour-grade cliché.

- **Recommended:** (c) near-monochrome content with a chromatic Backdrop.
- **Answer:** **(b), with a specific override — acid lime, no magenta.** Cold base
  pushed toward ice/cyan, periwinkle and orange retired, acid lime as the sole
  Signal. Recommendation not taken.
- **Consequence flagged:** ice-cyan and acid lime are neighbouring hues, so the
  Signal must separate by **chroma and value**, not hue. The cold scale is
  desaturated toward grey-blue specifically to buy that separation.

### Q12 · Renderer: keep three.js or drop it?
- **Recommended:** (a) raw WebGL2. A fullscreen quad plus a points pass is ~150
  lines and drops the entire three.js stack, and the HDR env maps going away
  removes the CSP's only external origin. *"A portfolio that ships a hand-written
  shader instead of a 200kb gradient library is itself the impressive thing."*
- **Answer:** **(a).**

### Q13 · The shader itself
- **Recommended:** (a) domain-warped fBm as the base + (b) a sparse parallax point
  overlay — Q6's answer made literal: fBm is the *field*, the points are the
  *depth*.
- **Answer:** **(a) + (b).**

### Q14 · What happens to the nav's Liquid glass?
Finding that forced this: the vendored glass `html2canvas`-snapshots the entire
page and refracts that **static bitmap**, with a whole settle controller fighting
stale frames. It physically cannot refract a moving Backdrop.

- **Recommended:** (b) fold refraction into our own shader. Strictly better on
  correctness, bundle, complexity and effect quality — and it makes *"the site's
  single deliberate WebGL indulgence"* true in a stronger way: exactly one WebGL
  context.
- **Answer:** **(b).**

### Q15 · The mobile cut line
- **Recommended:** (b) half-res Field, no point layer, no pointer reactivity
  (there is no cursor on touch); Deck and Zoom moments retained.
- **Answer:** **(b).**

---

## Confirmed shared understanding

- **Governing idea** — the page is a shallow space above a living Field. Content
  austere on top; colour and motion behind it.
- **Palette** — desaturated ice-cyan scale, acid lime as the sole Signal
  (CTAs, active nav item, Project Highlight). Typography untouched.
- **Backdrop** — one hand-written WebGL2 surface: domain-warped Field + sparse
  parallax points. Reacts to cursor and scroll velocity only.
- **Projects** — the Deck, chosen to survive growth past three.
- **Three Zoom moments, no others** — Hero→About dolly · the Deck's recede ·
  the About Image slot's entry.
- **Nav** — vendored liquid glass, its mounting module and `html2canvas` deleted;
  refraction becomes a region of the Field.
- **Deletions** — `@shadergradient/react`, `three`, `@react-three/fiber`,
  `three-stdlib`, `camera-controls`, `html2canvas`, and the CSP's external origin.
- **Floor** — reduced motion or dead WebGL yields a flat, complete page.
- **Process** — the Field is built and reviewed **in isolation first**, so
  rejecting it costs one step rather than the redesign.

## Glossary changes made during the session

Captured in [CONTEXT.md](../CONTEXT.md) as each term resolved:

- **Backdrop** — amended to permit continuous reactivity while still carrying no
  meaning.
- **Liquid glass** — redefined as a region of the Field rather than a layer of
  its own.
- **Tone** — redefined as a step on the cold scale (never a hue, never the
  Signal), because the two-accent palette left too few hues for the old meaning.
- **Field**, **Deck**, **Signal**, **Zoom moment** — added.

## What happened next

The spec was written, then broken into ten tracer-bullet tickets. Every blocking
edge was then audited by reversing it and naming what breaks — **four of nine
edges were deleted as preferences, not dependencies**, including one (the Deck
blocked by the Field's reactivity) that was purely an artifact of where the
shared motion module had been placed. The Deck turned out to depend on nothing.

Published to GitHub as issue #1 with ten sub-issues, #2–#11.
