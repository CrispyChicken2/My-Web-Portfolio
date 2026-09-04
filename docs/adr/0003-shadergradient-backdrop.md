# 0003 — The Backdrop is a ShaderGradient preset again

**Status:** accepted · 2026-09-04
**Supersedes:** the Backdrop half of
[ADR 0001](./0001-hand-written-webgl-field.md)

## Context

[ADR 0001](./0001-hand-written-webgl-field.md) replaced a `@shadergradient/react`
preset with a hand-written WebGL2 surface, for a smaller bundle, a
self-origin-only CSP, and a navigation bar that refracted the live Backdrop
rather than a screenshot of the page.

Ticket 03 was explicit that this was the redesign's risk, and it priced the
outcome in advance:

> **This is the risk ticket.** It is deliberately reviewable on its own: if the
> Field does not look better than the preset it replaces, nothing else has been
> built on top of it and the decision costs one step.

That is what happened. The hand-written Field was built, reviewed on screen,
and rejected — twice. The first attempt read as a near-black page. The content
layer was then inverted to light ([ADR 0002](./0002-light-content-layer.md)) so
the Field could run at full brightness, and it was re-skinned to the exact
three colours Oscar wanted. Reviewed again, it still was not the look he was
after.

The preset is. It was supplied as a complete `shadergradient.co` export, and
the judgement it embodies — the sphere, the lighting, the camera, the grain —
is the thing being chosen. Reproducing that in a fragment shader is not a
colour change; it is rebuilding a lit 3D scene, which is the work the library
already does.

## Decision

Restore `@shadergradient/react` as the Backdrop, with Oscar's preset applied
verbatim. `three`, `@react-three/fiber`, `three-stdlib` and `camera-controls`
return with it.

Everything the hand-written surface uniquely enabled goes with it:

- **The navigation bar stops refracting.** A third-party canvas is not ours to
  sample, so the bar reverts to a Pill — flat CSS glass, which was already its
  fallback and is fully usable. The site has no real refraction anywhere.
  "Liquid glass" is retired from the glossary.
- **The Backdrop stops responding to the Visitor.** The preset animates on its
  own and takes no pointer or scroll input. The pure module's
  `pointerToField`, `scrollVelocity`, `settle` and `approach` had no remaining
  caller and were deleted, along with their tests.
- **The mobile tier is gone.** There is no longer a resolution to lower or a
  point layer to omit; the preset renders the same everywhere.
- **The CSP regains one external origin.** `envPreset="lobby"` fetches its HDR
  environment maps from `https://ruucm.github.io`, so `connect-src` allows
  that host again.

What survives from the redesign: the light content layer, the ice-cyan scale
and the two-value Signal, the Deck, the three Zoom moments, the Token block,
the test harness, and the Dictionary-parity guard. None of those depended on
who drew the Backdrop.

## Consequences

**What we gained**

- The Backdrop Oscar actually wants, which is the whole point of the
  presentation layer. Two rejected attempts is sufficient evidence that
  matching it by hand was not converging.
- No GLSL to maintain. Changing the Backdrop is now editing props.

**What we gave up**

- **Bundle**: 318 kB → 1,399 kB (104 kB → 371 kB gzipped). The preset chunk
  alone is 1,097 kB. It is lazy-loaded and off the critical path, but user
  story 44 — "I want the bundle materially smaller than before" — is not met.
  It is now roughly what it was before the redesign started.
- **A third-party runtime surface**, and one external origin in the CSP.
  User story 43 is not met.
- **The refraction that ADR 0001 was largely written to get.** It was correct,
  and it is gone.
- Two Visitor stories (the Backdrop reacting to cursor and to scroll speed)
  and the mobile tier work are dropped outright.

**What it costs to reverse**

The deleted code is one revert away in git history, but the judgement that
sent us here — that the hand-written version did not look right — would have
to change first.

## Alternatives considered

- **Keep re-skinning the hand-written Field.** Rejected after two rounds. The
  gap is the lit 3D sphere and its environment map, not the palette, and
  closing it means writing the library.
- **Keep the hand-written Field only to feed the nav's refraction.** Rejected:
  two WebGL contexts, the larger of them invisible, to preserve one effect.
- **Take the preset but strip `envPreset` to close the CSP.** Rejected without
  trying it: `lightType="env"` is what gives the preset its lighting, and
  removing it changes the look Oscar chose. Worth revisiting if the external
  origin ever becomes a real objection.
