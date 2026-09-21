# 0006 — The Deck scrolls independently of the page

**Status:** accepted · 2026-09-21
**Supersedes:** [ADR 0005](./0005-deck-stays-pinned-to-document-scroll.md)

## Context

[ADR 0005](./0005-deck-stays-pinned-to-document-scroll.md) decided the opposite
of this, three days' work ago, and the reasoning there was sound for what was
known at the time. It rejected a pointer-gated nested scroll region on one
argument: a Visitor scrolling past with the cursor elsewhere would see Project
01 and never learn the others existed, and every Project being unavoidable on
the way down is why the Deck was chosen over a horizontal rail in the first
place.

Two things have changed, and only one of them is a matter of taste.

**The Rail now exists.** It was built in the same batch as the repair ADR 0005
describes. A Visitor who scrolls straight past the Projects Section now sees a
count and one dot per Project, and every Project is one press away. The
invariant at stake weakens from *"every Project is unavoidable"* to *"every
Project is visibly present and one press away"*. That is a real loss, but a far
smaller one than ADR 0005 was weighing, because at the time there was nothing
at all to tell a skimmer what they were missing.

**The bet in ADR 0005 has settled.** That ADR's decision rested on an explicit
wager: that the complaint was the dead scroll rather than the pin. The dead
scroll was measured, removed, and the Deck now travels continuously for roughly
half its scroll and is never still for a quarter of it. The pin remains, and
the pin is still unwanted:

> I don't want the page to lock when scrolling down or up for the project tiles
> to go up or down. I want both scrollings of project and page to be
> independent.

So this is not a change of mind about the arguments. It is the same arguments
with one premise newly false and one wager resolved against the earlier call.

## Decision

**The Projects Section becomes one viewport of page height and a real nested
scroll container.** An invisible track inside it supplies the scroll range and
the pane is sticky within that track — the same sticky-pane pattern as before,
moved from the document into a box of its own.

Scrolling with the pointer over the Section moves the Projects while the page
stays put. Scrolling anywhere else moves the page, straight past.

Three choices make this work rather than merely satisfy the request literally:

- **`overscroll-behavior` stays `auto`.** Once the Deck reaches its last
  Project the scroll chains onward and the page continues. `contain` is the
  literal reading of "independent" and would trap a Visitor who reached the end
  with the pointer still over the tiles — a *harder* lock than the sticky pane
  this replaces, and the third iteration of the same complaint.
- **The region is the whole Section**, not just the Panel. "Is the pointer on
  the tiles" has to be true for nearly everyone looking at the Projects, or the
  failure mode is a Visitor who scrolls, sees nothing change, and concludes the
  Section is broken.
- **One `proximity` snap point** parks the Section, because it is ordinary page
  content now and can sit half above the top of the window while the pointer is
  over it. `mandatory` snapping is not used: on a document this long it fights
  find-in-page, keyboard paging and the Nav's six anchor links, which is the
  ground ADR 0005 rejected scroll-snap on and which still holds for the
  mandatory form.

Browsers chain inner → outer and never outer → inner, so a page flick is not
captured by the region as it slides under the cursor. Engaging the Deck takes a
fresh gesture with the pointer already there. Skimmers pass; readers who stop
and scroll get the tiles. That falls out of the platform rather than being
arranged.

## Consequences

**What we gained**

- The page does not move while the Projects move, and the Projects do not move
  while the page does. That is what was asked for, three sessions running.
- The Projects Section costs one viewport of document height instead of 2.8, so
  the scroll progress bar is honest about how much of the page it is.
- No wheel interception, no non-passive listeners, no fighting trackpad
  momentum. The browser decides which scroller a gesture belongs to.
- The motion seam is untouched: `DECK_BUDGET`, `deckTargetIndex`,
  `deckFrontIndex` and `deckProgressForIndex` keep their exact meanings, and all
  29 existing assertions still apply. Only the source of the 0→1 progress moves
  from the document to the container.

**What we gave up**

- **The reach guarantee.** A Visitor who never puts the pointer over the
  Section sees Project 01 only. The Rail reports the rest and reaches them in
  one press, and the counter was moved onto the Rail so that report sits beside
  the Panel rather than in the opposite corner — but a recruiter who skims with
  the cursor at the window edge will not read Projects 02 and 03.
- **A second navigation model to keep correct.** The Rail's click now parks the
  Section before travelling the Deck, because either scroller may need moving.
- **A snap point on the document**, which nothing else on the site needs.

**What it costs to reverse**

Cheaper than it looks. The Section's height, one CSS block and the progress
source are the whole of it; the motion module, the Rail, the Panel and the
choreography are all indifferent to which scroller drives them. That is the one
thing the previous three iterations bought: the seam absorbed a change of
scroll model without noticing.

## Alternatives considered

- **`overscroll-behavior: contain`** — the literal request. Rejected above: it
  traps.
- **Keeping the pin and shortening it further.** Rejected: the pin itself is
  what is objected to, and ADR 0005 already spent the cheap half of that idea.
- **CSS scroll-snap carousel of real stacked elements**, letting the browser do
  all of it. Rejected: it discards the choreography — the recede, the blur, the
  covered Project climbing as the next rises — which is one of the site's three
  Zoom moments, leaving a plain snapping list.
- **Wheel interception driving an index.** Rejected on the same grounds as in
  ADR 0005, which are unchanged: it breaks momentum, needs a non-passive
  listener, and behaves differently per input device.
- **Making the region keyboard-scrollable** with `tabindex="0"`. Rejected: it
  adds a tab stop that lands on nothing visible, and the Rail's buttons are
  already a better keyboard path. This is where the Rail being a real control
  rather than an indicator earns its keep.

## Source

Decided in [the third grilling record](../grilling-deck-independent-scroll.md).
ADR 0005 is deliberately left intact rather than rewritten: that the opposite
was tried, measured and reversed for stated reasons is worth more than a tidy
history, and the next person to propose either shape should be able to read both.
