# Grilling record: the Deck's scroll, and the Rail

**Date:** 2026-09-21
**Session:** `/mattpocock-skills:grill-with-docs` (grilling + domain-modeling)
**Supersedes:** the Deck half of
[the frontend redesign grilling](./grilling-frontend-redesign.md) (Q7 there)
**Outcome:** no code written. Shared understanding below, plus three
`CONTEXT.md` amendments.

The opening request:

> My problem is that I don't like the way the project tiles work, with the page
> stopping to then make the project tiles overlay and move. I would like to have
> that scrolling of the projects only when the mouse of the guy is around the
> project tiles region. Plus add some kind of scroll bar but modern one (like 3
> vertical points that shows there is a project tile before and a project tile
> after).

Nineteen questions over four rounds. The request as stated was **not** what got
designed: the hover-gating idea was withdrawn in round 2 once the actual cause
of the complaint was measured.

---

## Findings before round 1

**The dead-scroll defect.** `deckTargetIndex` rounds scroll progress to a whole
Project index. With three Projects in a Section four viewport heights tall, the
index flips at progress 0.25 and 0.75 — so of three viewport heights of
scrolling:

| scrolling | what moves |
|---|---|
| first 0.75vh | Project 1 sits still |
| next 1.5vh | Project 2 sits still |
| last 0.75vh | Project 3 sits still, Section will not release |

**Two-thirds of the Deck's travel produced no motion at all.** The rounding had
been added deliberately, to stop a Project stranding half-risen when the Visitor
stopped mid-scroll; it bought that by making most of the scroll dead. This was
the whole complaint, and it had a two-line cause.

**The scrollbar was lying.** Projects was 4 of the page's ~11 viewport heights,
so the top progress bar spent over a third of its travel inside one Section.

**Two conflicts with `CONTEXT.md`:**

1. **Deck** — *"Every Project is reached by scrolling down, so the Deck adds no
   second way to navigate and hides nothing from a Visitor who only skims."*
   Cursor-gated advancement breaks that clause outright.
2. **Deck** — *"A phone keeps the stacked layout, where a Project is as tall as
   its content."* It does not. `Projects.jsx` only swaps to `PlainStack` under
   reduced motion; on a phone the Deck runs exactly as on desktop, and every
   card is `absolute inset-0`. The glossary was simply wrong.

---

## Round 1 — diagnosis and the ruling constraints

### Q1 · Which part is actually wrong?

(a) the capture · (b) the length · (c) the dead scroll · (d) the choreography.

- **Recommended:** (c) with (b) — the hover idea looked like a workaround for a bug.
- **Answer:** **all of them**, plus the clarification that became round 2's
  problem: *"I just want the page to not go up or down if I'm scrolling the
  projects. Make them somewhat independent."*

### Q2 · Must a Visitor who never hovers still see all three Projects?

- **Recommended:** (a) yes, absolute.
- **Answer:** **(a).** One audience, one goal; the recruiter scrolling with the
  cursor at the window edge is exactly who the site is for.

### Q3 · What happens where there is no cursor?

- **Recommended:** (a) the accessibility floor from the last session holds —
  hover is enhancement only.
- **Answer:** **(a).**

### Q4 · The dot rail: indicator, or control?

- **Recommended:** (a) replace the header counter and ticks, purely passive.
- **Answer:** **keep the counter**, and the dots are **both** indicator and a
  second way to navigate. Recommendation not taken — and this is what later made
  the Deck's "no second way to navigate" clause negotiable.

### Q5 · Three dots, or one per Project?

- **Recommended:** one per Project — a fixed three-dot window cannot tell
  "2 of 3" from "2 of 12", and the Deck was chosen to survive growth to twelve.
- **Answer:** **one per Project.**

---

## Round 2 — the contradiction

Q1 and Q2 could not both hold. *"The page stops"* and *"the page must not move
while I scroll the projects"* describe the same state — one Project on screen,
advanced by the wheel, page held still — which is what `position: sticky`
already does. There is no third arrangement.

### Q6 · Which invariant gives?

(a) **"Unavoidable" wins — sticky, repaired**: keep the pin, delete the rounding
and shorten the Section, so every wheel turn moves something.
(b) **"Independent" wins — a true nested scroll region**: Projects becomes one
viewport of document height, the tile stack becomes a real scroll container, the
scrollbar never moves. Native nested scrolling, not a hijack. Cost: a Visitor
whose cursor is elsewhere sees Project 1 and nothing else.

- **Recommended:** (a), flagged as a single push-back — *"you have never seen the
  repaired Deck, only the one where two-thirds of the scroll does nothing. The
  pin isn't what feels bad; the unresponsiveness is."*
- **Answer:** **(a).** The hover-gating idea — the literal opening request — was
  dropped here, and the Deck's guarantee survived intact.

### Q7 · Does the counter keep its ticks?

- **Answer:** **(a)** keep the `01 / 03` numerals, delete the header tick rail —
  it would say the same thing a third time.

### Q8 · Where does the Rail sit?

The Panel is capped at 1200px with 2.5rem padding, so between roughly 1200 and
1300px of window there is no gutter to put a rail in.

- **Answer:** **outside the Panel in the gutter, moving inside it below ~1300px.**

### Q9 · What does clicking a dot do?

- **Answer:** **(a) travels through the intermediate Projects.** `CONTEXT.md`
  defines the Deck's movement as a single, complete travel; a cut would teach
  the Visitor two different Decks.

---

## Round 3 — the repair

A finding reframed the budget: `deckSectionViewports` counted *viewports per
Project*, which is the wrong unit. Three Projects have **two handovers**, plus a
hold at each end:

```
height = head-hold + (n − 1) × handover + tail-hold + 1vh (the pane)
```

Adding a Project costs one handover, not one viewport — still a content-only edit.

### Q10 · How do "every turn moves" and "always rests on a Project" both hold?

(a) staircase easing · (b) staircase + settle-on-idle · (c) CSS scroll-snap ·
(d) drop the invariant.

- **Recommended:** (a). `deckTargetIndex` returns a continuous float shaped flat
  near each Project and steep between them — something always moves, the Deck is
  always approaching a whole Project, and it stays a pure function at the one
  seam `params.test.js` already covers. (c) fights the Nav's six anchor links.
- **Answer:** **(a).** (b) stays available if a mid-handover rest reads badly;
  not paid for in advance.

### Q11 · The budget

- **Answer:** **head 0.3 · handover 0.6 · tail 0.3 → 2.8vh** for three Projects,
  against today's 4vh. Roughly halves the Section's cost to the page while making
  every wheel turn do something. The tail is not slack: at zero, the turn that
  lands you on the last Project is the turn that starts moving the page.

### Q12 · Clicking a dot — what actually moves?

The Deck's position derives from document scroll, so a click that only drives the
spring desynchronises the two and the next wheel turn yanks the Visitor back.

- **Answer:** **(a) animate the document scroll ourselves.** One controlled
  travel, identical across browsers, and reduced motion handled on our terms
  rather than the browser's.

### Q13 · Does the Rail get the Signal?

`CONTEXT.md` said *"the scroll indicator … is decoration, so it is never the
Signal"* — written when the indicator was passive. Q4 made it a control, and the
Signal is defined as being for the few things the site wants pressed.

- **Answer:** **(a) the cold scale, and reword the glossary.** The exclusion now
  rests on scarcity, not on decoration: the Rail sits beside a Project's
  Highlight, and two acid-lime things in one viewport means neither is the Signal.

### Q14 · The phone

- **Answer:** **(a) phone gets `PlainStack`** — every Project present, no Deck,
  no Rail. This makes the glossary clause true rather than aspirational, gives
  touch a path needing no gesture, and confines the whole repair to desktop.

---

## Round 4 — the Rail's anatomy

### Q15 · What is it called?

- **Answer:** **Rail.** Plain, unambiguous, and it says *scrollbar* — the
  metaphor reached for unprompted in the opening request. The header's tick rail
  is deleted under Q7, so the name is free.

### Q16 · What do the dots say?

(a) position — one active, the others identical · (b) progress — passed dots
filled · (c) three states.

- **Answer:** **(a) position.** It is what was asked for (*"a tile before and a
  tile after"*), and the honest reading: the Deck is a set to move around in, not
  a track to complete. (b) implies a ranking `CONTEXT.md` does not claim.

### Q17 · Does the active dot move, or flip?

- **Answer:** **(a) flip at the midpoint**, matching the counter, which already
  flips decisively rather than hesitating mid-flight. A sliding marker would
  re-create in miniature the wheel-tracking motion this session removed.

### Q18 · Always visible, or on hover?

- **Answer:** **(a) always.** Q2 turned on a skimmer knowing more Projects
  exist; a Rail that appears only when looked for tells that Visitor nothing.

### Q19 · Keyboard and screen reader

- **Answer:** **(a)** three `<button>`s in a labelled `<nav>`, each naming its
  Project (*"Project 2 of 3: Real-Time Bidding"*), `aria-current` on the active
  one. Naming the Project rather than the number keeps the labels correct when a
  fourth is added — one new string per Dictionary, which the `dictionary-parity`
  hook enforces.

---

## Confirmed shared understanding

- **The complaint was a bug, not the mechanic.** The Deck stays. The rounding in
  `deckTargetIndex` goes.
- **The Deck stays scroll-driven and unavoidable.** Hover-gating, nested scroll
  containers and wheel interception are all rejected — every Project is still
  reached by scrolling down.
- **Travel becomes continuous** via a staircase easing: flat near each Project,
  steep between. Something moves on every wheel turn.
- **The budget is counted in handovers**: head 0.3 · handover 0.6 · tail 0.3 ·
  plus the pane. Three Projects cost 2.8vh instead of 4vh.
- **The Rail** — one dot per Project, right of the Panel (inside it below
  ~1300px), position-reading, active dot flipping at the midpoint, always
  visible, cold scale, three real buttons naming their Projects.
- **Clicking a dot animates the document scroll**, so the scrollbar and the tiles
  never disagree.
- **The header keeps `01 / 03` and loses its ticks.**
- **The phone gets `PlainStack`.** The Deck is desktop-only, which is what the
  glossary claimed all along.
- **Still standing from the last session:** the accessibility floor is absolute;
  the Deck's recede remains one of exactly three Zoom moments.

## Glossary changes this session owes

- **Deck** — scroll cost restated in handovers; the resting invariant softened to
  match the staircase; the "no second way to navigate" clause amended for the
  Rail; the phone clause made true.
- **Signal** — the scroll-indicator exclusion rewritten to rest on scarcity
  rather than on the indicator being decoration, now that the Rail is a control.
- **Rail** — added.

## What has not been decided

Nothing blocking. Left deliberately unpaid-for: the settle-on-idle from Q10(b),
to be added only if a mid-handover rest reads badly in the repaired Deck.
