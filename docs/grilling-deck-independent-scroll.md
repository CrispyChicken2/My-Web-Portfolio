# Grilling record: the Deck gets its own scroll

**Date:** 2026-09-21
**Session:** `/mattpocock-skills:grill-with-docs` (grilling + domain-modeling)
**Supersedes:** [ADR 0005](./adr/0005-deck-stays-pinned-to-document-scroll.md)
and the mechanism half of
[the previous grilling](./grilling-projects-rail.md) (Q6 there)
**Outcome:** no code written. Shared understanding below, plus the glossary and
ADR changes it owes.

The request:

> I don't want the page to lock when scrolling down or up for the project tiles
> to go up or down. I want both scrollings of project and page to be
> independent. If the mouse is on the project tiles and someone scrolls then the
> project tiles scroll and if not then the page scrolls down or up.

This is the same idea that opened the previous session and was designed out
there. It is being adopted now, on purpose. Nine questions over two rounds.

---

## Why the answer is different this time

The previous session rejected pointer-gated scrolling on one argument, recorded
as the decision in ADR 0005: a Visitor who scrolls past with the cursor
elsewhere would see Project 01 and never learn the others existed, and every
Project being unavoidable on the way down is why the Deck was chosen over a
horizontal rail in the first place.

**Two things have changed since, and only one of them is a matter of taste.**

1. **The Rail now exists.** A Visitor who scrolls straight past sees `01 / 03`
   and three dots. They do not *see* Projects 02 and 03, but nothing is hidden
   from them and both are one click away. The invariant weakens from "every
   Project is unavoidable" to "every Project is visibly present and one click
   away" — which is a real loss, but a far smaller one than ADR 0005 was
   weighing.

2. **The repaired Deck has been seen and judged.** The previous session's
   push-back was explicitly a bet that the dead scroll, not the pin, was the
   complaint. The dead scroll was removed, the Deck still pins, and the pin is
   still unwanted. That was the information the push-back existed to produce.

So the reversal is not a change of mind about the arguments; it is the same
arguments with one premise newly false and one bet settled.

---

## Findings before round 1

**A nested scroller needs something to scroll.** The Deck's cards are
`absolute inset-0` and overlap, so there is no tall content inside the region —
`overflow-y: auto` alone would yield no scrollbar and no scroll events. The
region needs an invisible spacer for scroll range, with the card layer sticky
inside it.

**A geometry problem the sticky pane made impossible.** With the pin gone the
Projects Section is one viewport tall in normal flow, so it can be *half on
screen* while the pointer is over it — and scrolling the tiles then animates a
Panel cut off by the top of the window.

**Scroll chaining is one-directional (inner → outer, never outer → inner).** A
Visitor flicking the page downward does not have that momentum captured by the
region as it slides under the cursor. Engaging the Deck needs a fresh gesture
with the pointer already over it. Fast skimmers pass; readers who stop and
scroll get the tiles. That is the wanted behaviour, and it is free.

**The motion seam survives untouched.** `deckSectionViewports` answers "how tall
is the Section, in viewport heights, given the budget". A nested scroller needs
"how tall is the spacer, in *container* heights" — and the container is one
viewport tall, so the number is identical. `deckTargetIndex`, `deckFrontIndex`,
`deckProgressForIndex` and `DECK_BUDGET` all keep their exact meaning. Only the
source of the 0→1 progress changes, from document to container. All 29 existing
assertions still apply.

---

## Round 1 — the ruling behaviour

### Q1 · What happens at the ends of the Deck?
(a) `overscroll-behavior: auto` — tiles advance to the last Project, then
scrolling hands off and the page continues. (b) `contain` — the region never
chains; with the pointer over the tiles the page never moves.

- **Recommended:** (a). (b) is the literal reading of the request and would
  land back here a third time: pointer over the tiles, on the last Project,
  scrolling down, *nothing happens* — a harder lock than the sticky pane, which
  at least released after 2.8 viewport heights. (a) still delivers the thing
  actually wanted — the page does not move while the tiles move — and it lets
  the Visitor leave.
- **Answer:** **(a).**

### Q2 · How big is the region that captures the scroll?
- **Recommended:** (b) the whole Projects Section, full width and height. "Is
  the mouse on the tiles" has to be true for almost everyone looking at the
  Projects, or the worst outcome appears: a Visitor scrolls, nothing changes,
  and they conclude the Section is broken.
- **Answer:** **(b).**

### Q3 · The half-on-screen problem
- **Recommended:** (b) snap the Section into place with CSS scroll-snap, using
  `proximity` rather than `mandatory`. ADR 0005 rejected scroll-snap, but it
  rejected *mandatory* snap with one point per Project, which fights the Nav's
  six anchor links. One proximity snap point on one Section is a much smaller
  thing and is the ordinary fix. Keeping a short sticky pane to park the Section
  was rejected: it reintroduces the pin being removed.
- **Answer:** **(b).**

### Q4 · The guarantee being traded away
Stated explicitly so it is a decision and not a side effect: a Visitor scrolling
with the cursor outside the Projects Section passes it having seen **Project 01
only**.

- **Recommended:** accept it, because the Rail reports the other two — plus one
  addition: move the `01 / 03` counter out of the Deck header and onto the Rail,
  beside the Panel. If the Rail is the only thing telling a recruiter that two
  more Projects exist, that information belongs where the eye already is.
- **Answer:** **accepted, with the counter moved.**

### Q5 · Keyboard
- **Recommended:** (b) do not make the region focusable. The Rail's three
  buttons are a better keyboard affordance than arrow-scrolling an opaque
  region, and a `tabindex="0"` container adds a tab stop that lands on nothing
  visible. This is where the Rail being a real control earns its keep.
- **Answer:** **(b).**

---

## Round 2 — the mechanism

### Q6 · What drives the cards?
(a) the container's `scrollTop` through the existing `deckTargetIndex` ·
(b) real stacked elements with CSS scroll-snap · (c) wheel events → index.

- **Recommended:** (a). (b) is genuinely simpler but throws away the whole
  choreography — the recede, the blur, the covered Project climbing as the next
  rises, which is one of the site's three Zoom moments — leaving a plain
  snapping list. (c) is the wheel-interception approach ADR 0005 rejected on its
  own merits, and those reasons are unchanged.
- **Answer:** **(a).**

### Q7 · Does the region show a real scrollbar?
- **Recommended:** (a) hide it. The original request was for "a scroll bar but
  modern one" — the Rail *is* that, already built, already a control, already
  labelled. A second indicator in the same region, in a different visual
  language, is the header-ticks problem again.
- **Answer:** **(a).**

### Q8 · A Rail click while the Section is half on screen
- **Recommended:** (b) bring the Section fully into view first, then travel the
  Deck — one gesture, two phases. Scrolling the container alone can animate
  something the Visitor cannot fully see; doing both at once means two scrolls
  on two elements over different distances, fiddly to land together for no gain.
- **Answer:** **(b).**

### Q9 · Does the scroll region earn a name in `CONTEXT.md`?
- **Recommended:** (a) no new term; the Deck's entry is rewritten to say it has
  its own scroll, independent of the page's. A term earns its place when two
  people would otherwise talk past each other, and "the Deck scrolls on its own"
  has no such ambiguity. **Rail** was worth adding because the alternative was
  four names for one thing; this is not that.
- **Answer:** **(a).**

---

## Confirmed shared understanding

- **The Deck gets its own scroll.** The Projects Section becomes one viewport of
  document height and a real nested scroll container; an invisible spacer gives
  it range and the card layer is sticky inside it.
- **The pointer decides.** Scroll with the cursor over the Section and the tiles
  move while the page stays put; scroll anywhere else and the page moves.
- **It hands off rather than trapping.** `overscroll-behavior: auto` — past the
  last Project, scrolling continues down the page.
- **The region is the whole Section**, not just the Panel.
- **One proximity snap point** parks the Section so the Deck is never driven
  while half off screen.
- **The motion seam is unchanged.** Same budget, same staircase, same round
  trip; only the source of progress moves from document to container.
- **The Rail takes over the counter.** `01 / 03` moves from the Deck header to
  the Rail, making the Rail the single place that reports position.
- **No scrollbar on the region**, no `tabindex` on the region.
- **A Rail click brings the Section into view first**, then travels the Deck.
- **Accepted cost:** a Visitor who never puts the cursor over the Section sees
  Project 01 only. The Rail reports the rest and reaches them in one click.
- **Unchanged:** the Deck stays desktop-only; the plain stack still serves phones
  and reduced motion; the Panel's size, centring and choreography; the Deck's
  recede as one of exactly three Zoom moments; the Backdrop, Field, Nav and
  Tokens.

## What this owes

- **`CONTEXT.md` — Deck**, rewritten a second time: it no longer is "driven by
  the page's own scroll", no longer promises every Project is reached by
  scrolling down, and gains its own scroll and the pointer rule.
- **`CONTEXT.md` — Rail**, amended: it now carries the count as well as the
  position, and it is the only report of either.
- **ADR 0006**, superseding ADR 0005. **0005 is kept intact**: it is the record
  that this was tried the other way, measured, and reversed for stated reasons,
  and that record is worth more than a tidy history.
- **README**: the reduced-motion and Deck sections describe document-driven
  scrolling and will be false again.

## What was deliberately not decided

- Whether the handover budget needs re-tuning once the scroll is nested. The
  numbers carry over exactly, but a nested scroller has no page motion beside it
  to mask the distance, so it may read differently. Left as a by-eye adjustment
  after landing — the tests are directional and will not break.
- The settle-on-idle held back in the previous session. Still unspent.
