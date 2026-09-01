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
The full-screen animated gradient sitting behind every Section. It is
decorative: it never carries meaning, and the site must stay fully readable
when it fails to render or the Visitor prefers reduced motion.
_Avoid_: background (ambiguous with a Panel's own background), hero background

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
the site's single deliberate WebGL indulgence, so "add liquid glass to X" is a
proposal to add a second one and should be challenged.
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

**Tone**:
The accent colour assigned to a Group or an Image slot so related things read
as related. A Tone is decorative grouping, never status or severity.
_Avoid_: colour, variant, status
