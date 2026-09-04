# Domain Docs

How the engineering skills should consume this repo's domain documentation when
exploring the codebase.

This repo is **single-context**: one `CONTEXT.md` at the root, with ADRs under
`docs/adr/`.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root: the shared vocabulary for the portfolio —
  Content terms (Locale, Dictionary, Section, Label, Tag, Group, Project,
  Highlight, Entry, Visitor) and Appearance terms (Token, Backdrop, Field,
  Panel, Glass, Liquid glass, Pill, Image slot, Deck, Signal, Tone, Zoom
  moment). It is vocabulary only; for how things are built or deployed, see
  [README.md](../../README.md).
- **`docs/adr/`**: read ADRs that touch the area you're about to work in.

If any of these files don't exist, **proceed silently**. Don't flag their
absence; don't suggest creating them upfront. `docs/adr/` does not exist yet.
The `/domain-modeling` skill (reached via `/grill-with-docs` and
`/improve-codebase-architecture`) creates them lazily when terms or decisions
actually get resolved.

## File structure

```
/
├── CONTEXT.md          ← the glossary
├── README.md           ← how it's built and deployed
├── SPECS.md            ← the approved spec for in-flight work
├── docs/
│   ├── adr/            ← created lazily, when a decision is actually recorded
│   └── agents/         ← this file, plus issue-tracker.md
└── src/
```

There is no `CONTEXT-MAP.md` and no `src/<context>/docs/adr/`; this repo is a
single Vite app, not a monorepo. If it ever splits into packages, re-run
`/setup-matt-pocock-skills` to move to the multi-context layout.

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal,
a hypothesis, a test name), use the term as defined in `CONTEXT.md`. Don't drift
to synonyms the glossary explicitly avoids — each entry lists its own _Avoid_
line (a Panel is not a "card", the Backdrop is not the "background", a Pill is
not real Liquid glass).

If the concept you need isn't in the glossary yet, that's a signal: either
you're inventing language the project doesn't use (reconsider) or there's a real
gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than
silently overriding:

> _Contradicts ADR-0007 (event-sourced orders), but worth reopening because…_
