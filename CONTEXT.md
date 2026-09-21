# Portfolio

The personal site at **oscar-hunaut.dev** — a single-page, bilingual portfolio
for Oscar Hunaut, a Data & AI engineering student looking for a Data / ML
internship. There is one audience (a recruiter or engineer reading top to
bottom) and one goal (get them to the Contact section).

This file is the shared vocabulary only. For how anything is built or
deployed, see [README.md](./README.md).

## Content

**Locale**:
One of the two languages the whole site exists in, `en` or `fr`. Every visible
string exists in both; a string that exists in only one is a bug.
_Avoid_: translation, language pack

**Dictionary**:
The complete set of strings for one Locale. The two Dictionaries always share
the same shape, so a component reads the active one without knowing which.
_Avoid_: locale file, strings, copy

**Section**:
One of the six vertical bands the page is made of: Hero, About, Skills,
Projects, Experience, Contact. Sections are ordered and numbered; that order is
the argument the site makes.
_Avoid_: page, block, panel (a Panel is a visual concept — see below)

**Label**:
The small monospace tag that opens a Section (`// 03 — SELECTED WORK`). It
carries the Section's number and name.
_Avoid_: eyebrow, kicker, tag (a Tag is something else — see below)

**Tag**:
A short credential chip in the About Section (`Ex-SPI International`), one icon
plus one line. Not a skill and not a link.
_Avoid_: badge, pill (a Pill is a visual concept — see below)

**Group**:
A named cluster of skills in the Skills Section (`Machine Learning & AI`), with
an icon, a Tone, and a flat list of items. Skills are never ranked or scored.
_Avoid_: category, skill set

**Project**:
One finished piece of work shown in the Projects Section. A Project always has
a category and a tech list; it may have a Highlight and a repository link. The
bar for inclusion is that it was actually finished.
_Avoid_: work item, portfolio piece

**Highlight**:
The one sentence of a Project pulled out for emphasis — what Oscar personally
owned, not what the team delivered.
_Avoid_: callout, quote

**Entry**:
One row of the Experience Section — an internship or a degree. Exactly one
Entry is marked active, meaning "most recent / current".
_Avoid_: job, item, position

**Visitor**:
Whoever is reading the site. Never authenticated, never known, and never able
to change anything they see — the site is read-only by design.
_Avoid_: user, client

## Appearance

**Token**:
A named colour or surface value that the whole theme is defined in terms of
(`--acc`, `--fg1`, `--nav-bg`). Retheming the site means changing Tokens, never
component styles.
_Avoid_: variable, theme value, palette entry

**Backdrop**:
The full-screen animated layer sitting behind every Section. It takes no
Visitor input at all: it animates on its own, and it carries no meaning — no
Visitor could read any state off it, and it never indicates which Section is
active. It is decorative, and the site must stay fully readable when it fails
to render or the Visitor prefers reduced motion.
_Avoid_: background (ambiguous with a Panel's own background), hero background

**Field**:
What the Backdrop depicts: a slowly moving, softly lit form whose colour
drifts across the whole viewport. The Field is the only place on the site
where colour is allowed to be lavish, which is what lets the content layer
stay austere — and it is the only place the retired accents may reappear,
because its colours are not Tokens. It runs at full strength and is never
dimmed to make the content readable; text that sits on it carries its own
halo instead. The Field comes from a third-party preset, so it is configured,
not written: its colours are props.
_Avoid_: particles, shader

**Panel**:
A content container within a Section. Each Panel picks one transparency
level — solid, glass, or subtle glass — and that choice belongs to the Section,
not to the component inside it.
_Avoid_: card, box, container

**Glass**:
The frame around a Panel — border and depth only. Glass never decides how
transparent a Panel is; the Panel does.
_Avoid_: blur, frost

**Pill**:
A button or nav item that imitates glass in flat CSS — blur, a border, a
sheen. The navigation bar is a Pill, and so is every button on the site.
Nothing on the site refracts: the Backdrop is a third-party surface that
cannot be sampled, so "make the nav refract what is behind it" is a proposal
to replace the Backdrop, not a styling change. See
[ADR 0003](./docs/adr/0003-shadergradient-backdrop.md).
_Avoid_: chip, glass button, liquid glass

**Image slot**:
A fixed-size picture frame that shows a shipped image, or a designed cover tile
when that image is absent. The fallback is a designed state, not an error
state.
_Avoid_: image placeholder, thumbnail

**Deck**:
How the Projects Section presents its Projects on a desktop: each one rests at
a constant size near the centre of the viewport while the next rises over it
from below, the covered Project climbing as it recedes behind. A Project is
the size the site chose for it rather than a slice of the window, so the same
Project is the same object from one machine to the next; it gives up height
only on a window too short to show it and the Deck's heading at once. The Deck
is desktop-only: a phone is given the plain stack instead, every Project
present at its own height and nothing moving.
The Deck has a scroll of its own, independent of the page's. A Visitor
scrolling with the pointer over the Projects Section moves the Projects while
the page stays where it is; scrolling anywhere else moves the page. Past the
last Project the scroll hands back to the page, so the Deck is never somewhere
a Visitor can be stuck — that is the difference between an independent scroll
and a lock.
Within its own scroll the Deck always travels toward a whole Project. Between
two Projects the movement is a short, deliberate handover, so every turn of the
wheel moves something — a Deck that holds still while the Visitor scrolls is a
bug, not a pause. Its cost is counted in handovers and never in Projects: a
hold at each end, one handover between each pair, so a new Project costs one
handover.
The Deck is therefore not unavoidable. A Visitor who never puts the pointer
over the Section sees the first Project and scrolls past the rest. Nothing is
hidden from them — the Rail says how many Projects there are and reaches any of
them in one press — but the Deck no longer promises that every Project is
reached by scrolling down. That was traded deliberately, twice over: see
[ADR 0006](./docs/adr/0006-deck-scrolls-independently.md).
_Avoid_: carousel, slider, stack

**Rail**:
The column of dots down the side of the Deck, one dot per Project. It reads as
position and not as progress — one dot active and the others alike, saying
"one before, one after" rather than how far through a track the Visitor is —
and every dot is also a control that travels the Deck to its Project. It
carries the count as well, and it is the only place either is reported: with
the Deck no longer unavoidable, the Rail is what tells a Visitor scrolling past
that there is more here than the one Project they can see, so it is always
visible and it sits beside the Panel rather than anywhere they would have to
look for it.
_Avoid_: dots, ticks, indicator, scrollbar, pagination

**Signal**:
The one acid accent, reserved for the few things the site actually wants
pressed or read: the Hero calls to action, the active nav item, and a
Project's Highlight. One hue at one value, used both as text and as a filled
surface. Its scarcity is the whole point — a second Signal, or a decorative
use of the first, spends it. Focus rings, the selection colour and the
typewriter caret are states or decoration, so none of them is ever the Signal.
Neither is the Rail — not because it is decoration, since it is a control, but
because the Signal is scarce: the Rail stands beside a Project's Highlight, and
a viewport holding two acid things holds no Signal at all.
_Avoid_: accent, highlight (a Highlight is something else — see above), CTA
colour

**Tone**:
The step on the cold scale assigned to a Group or an Image slot so related
things read as related. Tones differ by depth and intensity, never by hue, and
a Tone is never the Signal. A Tone is decorative grouping, never status or
severity.
_Avoid_: colour, variant, status

**Zoom moment**:
One of the small number of places where the site deliberately changes scale as
the Visitor scrolls. They are counted and chosen, not a rule applied to every
Section — so "zoom this in too" is a proposal to spend one, and should be
challenged.
_Avoid_: scale animation, parallax, transition
