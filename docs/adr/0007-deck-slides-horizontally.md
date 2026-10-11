# 0007 — The Deck slides horizontally

**Status:** accepted · 2026-10-11
**Supersedes:** [ADR 0006](./0006-deck-scrolls-independently.md)

## Context

[ADR 0006](./0006-deck-scrolls-independently.md) gave the Deck a vertical
scroll of its own, nested inside the page's, so that the Projects and the page
could move independently. It worked, and it kept the choreography — the covered
Project receding behind the one rising over it. It also carried a cost that ADR
named at the time: a Visitor who never put the pointer over the Section saw
Project 01 and scrolled past the rest.

Two things have changed since.

**The Section is about to hold five or six Projects, not three.** In the nested
Deck every Project after the first sits behind one more handover of scrolling,
so the cost of reaching a Project grows with its position. At six, the last one
is five handovers deep inside a region the Visitor has to notice is scrollable.

**The independence 0006 was after is only approximated by nesting.** Two
vertical scrolls share one gesture, and the pointer's position decides which of
them receives it. That is independent in the sense that neither locks the
other; it is not independent in the sense that a Visitor never has to think
about which one they are driving.

Two other shapes were tried on the way here and are recorded so they are not
proposed again without this context: a honeycomb of hexagonal buttons that
picked a Project (prototyped in three layouts, and rejected on sight by the
owner), and the same picker dressed as a game's skill tree (rejected before
building: a tree claims prerequisites the Projects do not have).

## Decision

**The Deck becomes a horizontal track.** The Projects sit side by side in a
real scroll container with one snap point per Project. One Project is in view,
centred and aligned with the Section's heading; its neighbours show in the
margins on either side, blurred and fading out before the edge of the track.

- **The page scrolls vertically and the Deck horizontally.** The two no longer
  share an axis, so no gesture is ever ambiguous and nothing has to decide
  which scroller a wheel belongs to.
- **The Section is ordinary page content.** Nothing is pinned, nothing is
  nested vertically, and the document's one scroll-snap point is removed.
- **The travel is the browser's.** No spring, no scroll budget and no mapping
  from scroll progress to a Project: a swipe, a trackpad, the Rail and a press
  on a neighbouring Project all end in the same native scroll.
- **The Rail moves under the Panel** and gains a step either side of its dots.
  A mouse wheel only scrolls vertically, so for a Visitor without a trackpad
  the Rail is the way along the Deck, not a shortcut for it.
- **A neighbour is blurred itself, not covered by a blur.** An overlay has
  edges of its own; a blurred Panel thins out past its own edges, and the
  track's mask takes it to nothing before the track ends.

The Deck stays desktop-only. A phone and a Visitor who prefers reduced motion
are still given the plain stack.

## Consequences

**What we gained**

- A neighbouring Project is visible before the Visitor touches anything, which
  the Rail alone was standing in for.
- Adding a Project costs nothing in page length and nothing in scroll depth.
- The motion seam loses everything the Deck needed — the spring, the budget,
  the staircase mapping, the card transform and its inverse — and 19 of its
  25 tests with it. `src/motion/params.js` now holds the Zoom moments only.
- The Projects Section is honest about its length on the scroll progress bar.

**What we gave up**

- **The recede.** The covered Project shrinking and blurring behind the next
  was one of the site's three Zoom moments. There are now two. The slot is
  free, and spending it again is a design decision.
- **Wheel-only Visitors must use a control.** The earlier Decks answered to the
  wheel; this one answers to the Rail, a swipe or a press. That is the price of
  taking the Deck off the page's axis.
- **The Deck's behaviour is no longer under test.** It used to be numbers in,
  numbers out; it is now the browser's scrolling, which the repo deliberately
  does not test.
- It is still one Project at a time. Later Projects will be read less than
  earlier ones, so their order is an editorial choice.

**What it costs to reverse**

The nested Deck is one revert away, with its motion code and tests. What would
have to change first is the count: at three Projects the nested Deck's depth
was tolerable, and that is no longer the number being designed for.

## Alternatives considered

- **Keep the nested vertical Deck** and accept the depth. Rejected: the cost
  rises with every Project added, and the ambiguity of two vertical scrolls
  was the third iteration of the same complaint.
- **A honeycomb picker beside or above the Panel.** Rejected after a
  three-variant prototype: it showed every Project at once, which is its real
  strength, but the owner did not want the Section to read that way.
- **A skill tree.** Rejected before building: connecting lines and locked
  states would be decoration claiming an order and a dependency that do not
  exist.
- **A blur overlay growing toward the edge.** Built first and replaced: its
  rectangle was visible against the Backdrop's grain, top, bottom and outer
  edge. Blurring the Panel and masking the track has no edge to show.
- **Wheel interception to turn vertical wheel into horizontal travel.**
  Rejected on the grounds ADR 0005 and 0006 both gave: it breaks momentum,
  needs a non-passive listener, and takes the page's gesture away again.
