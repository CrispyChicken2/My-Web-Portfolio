# 0001 — One hand-written WebGL surface, no rendering library

**Status:** accepted · 2026-09-04

## Context

The site had two independent WebGL surfaces and a third-party rendering stack
behind them.

The Backdrop was a `@shadergradient/react` preset, which pulled in `three`,
`@react-three/fiber`, `three-stdlib` and `camera-controls`, and fetched its
HDR environment maps from `https://ruucm.github.io` at runtime.

Liquid glass on the navigation bar was `dashersw/liquid-glass-js`, vendored
into `src/vendor/liquid-glass/`. It refracts a **page snapshot** captured with
`html2canvas`, not the live page. That approximation cost us a snapshot
dependency, a desktop-only gate, a re-render controller that forced a corrected
frame after scrolling stopped, and a hook in the language switcher to
invalidate the snapshot so the bar stopped refracting the previous language.

Two facts made this worth revisiting rather than living with:

- A snapshot-based refraction is wrong by construction, and it gets more wrong
  the more the thing behind it moves. The redesign makes the Backdrop move
  continuously, so it would have got worse.
- The rendering stack was, by a wide margin, the largest thing the site
  shipped: 1,097 kB of the 1,617 kB JS bundle was the Backdrop chunk alone.

## Decision

Write the Field as a single WebGL2 surface owned by this project
(`src/field/`), and make the navigation bar's refraction a distorting region
inside that surface's own composite pass rather than a layer of its own.

Concretely:

- `@shadergradient/react`, `three`, `@react-three/fiber`, `three-stdlib`,
  `camera-controls` and `html2canvas` are removed.
- `src/vendor/liquid-glass/`, the module that mounted it, and the stale-frame
  settle controller are deleted.
- The site has exactly one WebGL context. "Add liquid glass to X" is now a
  proposal to widen that surface, and should be challenged.
- The Content-Security-Policy loses its `connect-src` exception for
  `https://ruucm.github.io`. No external origin is permitted at all.

## Consequences

**What we gained**

- The bar refracts what is genuinely behind it at that instant. The snapshot,
  its capture dependency, its desktop-only gate, its settle controller and the
  language-switch invalidation all disappear — not fixed, deleted.
- The bundle went from 1,617 kB (423 kB gzipped) to 317 kB (104 kB gzipped),
  a ~80% reduction, most of it off the critical path.
- A CSP with no external origin, so the site has no third-party runtime
  surface.
- The Field's colours read from the Token block like everything else, so the
  Backdrop is themeable rather than a preset someone exported once.

**What we gave up**

- Rendering ergonomics. There is no scene graph, no material system and no
  camera helper; there is a fragment shader, a point shader, a composite
  shader and about 200 lines of context management. Changing the Field means
  writing GLSL.
- The preset itself. `shadergradient.co` produces a good-looking gradient with
  no work, and we now own the look and the risk that ours is worse. This is
  why the Field was built and reviewed on its own, before any Section depended
  on it.
- Anyone opening the repo expecting react-three-fiber — the obvious choice for
  WebGL in React — will not find it. That surprise is the reason this ADR
  exists.

**What it costs to reverse**

In practice, a lot. Re-adopting a rendering library means restoring the
dependency set, the bundle, and — if liquid glass came back with it — the
snapshot machinery. The refraction would go back to being an approximation.

## Alternatives considered

- **Keep ShaderGradient, rewrite only liquid glass.** Rejected: the bar has to
  sample the Backdrop to refract it correctly, and a preset's internals are
  not ours to sample. It would have left two WebGL contexts and the whole
  dependency set for the sake of the smaller half of the problem.
- **Keep the vendored liquid glass and re-capture more often.** Rejected: the
  Field moves every frame, so "more often" means every frame, which means
  running `html2canvas` every frame. Not viable.
- **Drop liquid glass entirely and use a flat Pill.** Rejected: the bar is the
  one place the effect earns its keep, and the Pill fallback already exists
  for when WebGL does not.
- **A CSS `backdrop-filter` bar over the Field.** Rejected: it blurs, but it
  does not refract — no displacement, no dispersion, no rim. It is what the
  Pill fallback already does.
