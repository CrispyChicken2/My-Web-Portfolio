# 0005 — The Deck stays pinned to the document scroll

**Status:** superseded · 2026-09-21
**Superseded by:** [ADR 0006](./0006-deck-scrolls-independently.md) — the Rail
it did not have, and the repair whose reception it was betting on, both landed;
the bet below resolved against this decision. Kept intact rather than rewritten.

## Context

The Deck holds the page still while the Visitor scrolls the Projects Section.
That is a pattern people react badly to, and the Owner did: *"I don't like the
way the project tiles work, with the page stopping to then make the project
tiles overlay and move."* The proposal that came with the complaint was to
gate the Deck on pointer position — the Projects would advance only while the
cursor was over them, and the page would otherwise scroll past normally.

Before designing against that, the complaint was measured. The Deck rounded
the Section's scroll progress to a whole Project index. With three Projects in
a Section four viewport heights tall, the index flipped at progress 0.25 and
0.75:

| scrolling | what moved |
|---|---|
| first 0.75vh | Project 01 sat still |
| next 1.5vh | Project 02 sat still |
| last 0.75vh | Project 03 sat still, the Section would not release |

**Two thirds of the Deck's travel produced no motion at all**, in stretches up
to half the Section long. The rounding had been added deliberately, to stop a
Project stranding half-risen when the Visitor stopped mid-scroll; it bought
that by making most of the scroll dead.

So the complaint had two candidate causes — the pin, and the unresponsiveness
— and only one of them was the thing being pointed at.

There is also an arithmetic constraint worth writing down, because it is what
makes this a real fork rather than a preference. One Project on screen at a
time, advanced by the wheel, with the page not moving, **is** the page being
held still. Either the page spends scroll distance on the Projects (a tall
section, tiles moving past — an ordinary stack), or it holds still while the
tiles change. There is no third arrangement.

## Decision

**The Deck stays driven by the document's own scroll, and stays pinned.** The
dead scroll is removed instead: the scroll-to-Project mapping eases
continuously, flat near each Project and steep between them, and the Section's
length is re-counted in handovers rather than in Projects.

The guarantee this protects is the one in `CONTEXT.md`: *every Project is
reached by scrolling down, and the Deck hides nothing from a Visitor who only
skims.* The site has one audience — a recruiter or engineer reading top to
bottom — and one goal, and the Projects Section is the evidence for both.

The Rail is added as a **second** way to move, never the only one. That is a
real amendment to the Deck's entry, made knowingly: a clickable Rail is a
second navigation affordance, and it is acceptable precisely because the first
one still reaches everything on its own.

## Consequences

**What we gained**

- Every turn of the wheel inside the Section moves something; the Deck now
  travels for roughly half the Section's scroll and is never still for a
  quarter of it, against effectively none and half before.
- The Section costs 2.8 viewport heights for three Projects instead of 4, so
  the scroll progress bar stops treating one Section as a third of the page.
- Adding a Project costs one handover rather than one viewport.
- No new scroll mechanism, no wheel interception, no nested scroll container,
  and nothing that behaves differently on a trackpad than on a mouse.

**What we gave up**

- The page still holds still over the Projects. A Visitor who objects to the
  pin as such is not served by this, and the arithmetic above says they cannot
  be without giving up the guarantee.
- The literal promise that the Deck "always rests ON a Project and never
  between two" is softened: stop dead in the middle of a handover and the Deck
  rests between two. The flats are wide enough that a natural stop lands on a
  Project nearly always, and the glossary now says "always travels toward a
  whole Project" instead.

**What it costs to reverse**

The pinning decision is the expensive one: reversing it means a different
Section height, a different scroll source, a different keyboard and touch
story, and the loss of the reach guarantee. The travel shape and the budget
are cheap by comparison — four numbers in one module, and the tests are
directional so tuning them breaks nothing.

## Alternatives considered

- **A true nested scroll region, gated on pointer position** — the Owner's
  original proposal. The Projects Section becomes one viewport of document
  height and the tile stack becomes a real scroll container, so the scrollbar
  genuinely does not move while the Projects advance. This is native browser
  behaviour, not a hijack: trackpad momentum and touch drag work for free, and
  `overscroll-behavior` decides whether it chains onward at the ends.
  **Rejected** because advancing requires the pointer or focus inside the
  region, so a Visitor scrolling with the cursor at the window edge, over the
  Nav, or outside the window sees Project 01 and never learns the others
  exist. Every Project being unavoidable on the way down is why the Deck was
  chosen over a horizontal rail in the first place — see the
  [first grilling record](../grilling-frontend-redesign.md), Q7.

- **Keep the rounding and merely shorten the Section.** Rejected: it reduces
  the dead scroll without removing it, and the jump between Projects — the
  part that actually reads as broken — survives untouched.

- **CSS scroll-snap on the document, one snap point per Project.** Rejected:
  mandatory snap on a long document fights find-in-page, keyboard paging and
  anchor links, and the Nav links into six Sections.

- **A settle-on-idle detector** — track scroll continuously, and snap the
  target to the nearest whole Project once scrolling stops. This would keep
  the old resting invariant literally true. **Deferred rather than rejected**:
  it costs machinery and can pull the Panels somewhere the scrollbar does not
  agree with, and the staircase's flats may well make it unnecessary. If a
  mid-handover rest reads badly, widen the flats first; reach for this second.

- **Drop one-Project-at-a-time entirely** and present the Projects as an
  ordinary stack. Rejected: it discards the Deck, which was chosen in the
  first grilling specifically to survive the Project count growing from three
  to twelve.

## Source

Decided in [the second grilling record](../grilling-projects-rail.md) —
nineteen questions over four rounds, in which the pointer-gating proposal was
withdrawn once the dead scroll was measured.
