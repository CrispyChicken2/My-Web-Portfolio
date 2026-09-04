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
The full-screen animated layer sitting behind every Section. It responds to
continuous Visitor input — where the cursor is, how fast the page is
scrolling — but it still carries no meaning: no Visitor could read any state
off it, and it never indicates which Section is active. It is decorative, and
the site must stay fully readable when it fails to render or the Visitor
prefers reduced motion.
_Avoid_: background (ambiguous with a Panel's own background), hero background

**Field**:
What the Backdrop depicts: a slow, drifting expanse with sparse points
suspended at different depths above it. The Field is the only place on the
site where colour is allowed to be lavish, which is what lets the content
layer stay austere.
_Avoid_: gradient, particles, shader

**Panel**:
A content container within a Section. Each Panel picks one transparency
level — solid, glass, or subtle glass — and that choice belongs to the Section,
not to the component inside it.
_Avoid_: card, box, container

**Glass**:
The frame around a Panel — border and depth only. Glass never decides how
transparent a Panel is; the Panel does.
_Avoid_: blur, frost

**Liquid glass**:
The real refractive effect, used on the navigation bar and nowhere else. It is
not a layer of its own: it is the Field seen through a distorting region where
the nav sits, which is why it refracts what is genuinely behind it at that
instant. The site has exactly one WebGL surface, so "add liquid glass to X" is
a proposal to widen that surface and should be challenged.
_Avoid_: glass effect, shader glass

**Pill**:
A button or nav item that imitates Liquid glass in flat CSS. A Pill only ever
looks like glass — treating one as real Liquid glass is a category error.
_Avoid_: chip, glass button

**Image slot**:
A fixed-size picture frame that shows a shipped image, or a designed cover tile
when that image is absent. The fallback is a designed state, not an error
state.
_Avoid_: image placeholder, thumbnail

**Deck**:
How the Projects Section presents its Projects: each one rests at the top of
the viewport while the next rises over it, the covered Project receding behind.
Every Project is reached by scrolling down, so the Deck adds no second way to
navigate and hides nothing from a Visitor who only skims.
_Avoid_: carousel, slider, stack

**Signal**:
The one warm accent, reserved for the few things the site actually wants
pressed or read. Its scarcity is the whole point: a second Signal, or a
decorative use of the first, spends it.
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
