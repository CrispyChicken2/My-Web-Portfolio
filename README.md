# oscar-hunaut.dev — Portfolio

A personal, **bilingual (EN/FR)** portfolio. The content layer is austere — a
cold ice-cyan scale carries every surface and every string as pale text on
deep surfaces, and a single acid-lime **Signal** marks the few things meant to
be pressed or read. The colour and the motion sit behind the content: in the
**Backdrop**, an animated ShaderGradient running at full strength behind every
Section, and in the **Figure**, a character-art Pac-Man behind the Projects.

For the vocabulary used throughout (Field, Deck, Rail, Figure, Signal, Tone,
Panel, Zoom moment…), see [CONTEXT.md](./CONTEXT.md).

**Stack:** React 18 · Vite · Tailwind CSS · Framer Motion · Vitest ·
`@shadergradient/react` (react-three-fiber).

---

## Development

```powershell
npm install        # .npmrc handles peer-dependency resolution
npm run dev        # http://localhost:5173
npm test           # run the tests once
npm run test:watch # watch mode
npm run build      # production build → /dist
npm run preview    # serve the production build locally
```

Requires **Node ≥ 20**.

---

## Editing the site

### Content (text)

Everything lives in **`src/data/content.js`**: two Dictionaries with the same
shape, `en` and `fr`. ⚠️ Any new string must be added to **both** — `npm test`
fails and names the offending key otherwise, so a half-translated Locale
cannot ship. The language is detected on first visit (browser language), then
remembered; visitors switch with the **EN | FR** toggle in the nav (logic in
`src/i18n.jsx`).

### Adding a Project

Add an object to `projects.items` in **both** Dictionaries. That is the whole
job: the Deck's track grows by one Project and the Rail grows a dot, so no
layout, height or count needs changing. A Project may optionally carry
`imageSlot: true` plus an `image` path, and a `highlight` phrase that must
appear verbatim inside its `description`.

### Theme (colours)

Every colour on the site resolves from the **Token block** at the top of
**`src/index.css`** — the cold scale (`--fg1…8`, `--ice`), the Signal
(`--sig`), surfaces and Tones. No component carries a colour of its own, so
retheming is one edit to that block. `tailwind.config.js` only references the
Tokens.

The **Backdrop is the exception**: it is a third-party preset and takes its
three colours as props, in `src/components/ShaderBackdrop.jsx`. Change them
there, and keep `--flat-1` / `--flat-2` in step so the flat fallback still
matches what it stands in for.

Two rules the palette depends on:

- The **Signal** appears on the Hero calls to action, the active nav item, and
  a Project's Highlight. Nowhere else, and never decoratively — not on focus
  rings, the selection colour, the scroll indicator or a caret. One hue, one
  value, used as text and as a filled surface alike.
- A **Tone** is a step on the cold scale. Tones differ by depth and intensity,
  never by hue, and a Tone is never the Signal.

The **Figure is the one exception on the content layer**: it has a warm ramp of
its own (`--pac-*`, `--ghost-*`), kept in the Token block and fenced off
there. Nothing else may use those Tokens.

The site is **dark only** and does not answer `prefers-color-scheme`. The
content layer was inverted to light and back again as the Backdrop changed —
[ADR 0002](./docs/adr/0002-light-content-layer.md) and
[ADR 0004](./docs/adr/0004-dark-content-layer.md) record both moves and what
each measured.

### Images

Placed in **`public/assets/`**:

- `profile.webp` — profile photo (About section)
- `renovtacana.webp` — RenovTaCana project screenshot

The `ImageSlot` component renders them and is display-only — visitors cannot
click, focus or replace a picture. To change one, replace the file keeping the
same name; keep filenames lowercase with no spaces (the host is
case-sensitive). If the file is missing, the slot falls back to a designed
cover tile in its Tone rather than showing an error.

### Panel transparency

Set **per Section** with a `.panel-*` class (in `src/index.css`):

- `.panel-solid` — opaque
- `.panel-glass` — translucent, the Field shows through (Skills)
- `.panel-glass-subtle` — barely translucent (the Deck)

`.glass` / `.glass-strong` only provide the frame (border, depth, sheen); the
transparency level comes from the `.panel-*` class, and that choice belongs to
the Section.

---

## The Backdrop

`src/components/ShaderBackdrop.jsx` holds the Backdrop: a `<ShaderGradient>`
preset exported from [shadergradient.co](https://shadergradient.co), applied
verbatim. Editing the Backdrop means editing those props. It loads as a
separate chunk so first paint is never blocked on it.

It takes no Visitor input — it animates on its own, and it is given no Section
identity by design: it must stay unable to encode state.

The Backdrop needs **no scrim**: it is drawn at full strength, and text that
sits directly on it carries a dark halo (`.on-field`) rather than the Backdrop
being dimmed to accommodate it. Dimming it is what made an earlier attempt
read as a black page.

Nothing on the site refracts. A third-party canvas is not ours to sample, so
the navigation bar is a **Pill** — flat CSS glass. See
[ADR 0003](./docs/adr/0003-shadergradient-backdrop.md) for what that traded
away, and [ADR 0001](./docs/adr/0001-hand-written-webgl-field.md) for the
hand-written surface it replaced.

**Degradation.** Every motion effect is decorative:

- `prefers-reduced-motion` → the Backdrop is still, the Deck is a plain
  vertical stack, and the Zoom moments are absent. All content is present.
- Below `lg` → the same plain vertical stack. The Deck is desktop-only, so a
  phone needs no gesture and carries no Rail.
- WebGL unavailable → `FlatBackdrop`, a designed flat Backdrop in the same
  colours.
---

## Motion

`src/motion/params.js` owns every mapping from Visitor scroll to a motion
parameter — which is now the two Zoom moments and nothing else. It takes
numbers and returns numbers, importing nothing from React, the DOM or WebGL,
which is what makes it the one seam the site is tested at.

The two **Zoom moments** are counted and chosen, not a rule: the Hero → About
dolly (the Hero leaving and About arriving are its two halves) and the About
Image slot's entry. A third is a design decision, not an implementation detail.
Both are **spring-driven** rather than tied rigidly to the scroll offset, so
they glide and settle instead of stopping wherever the wheel left them.

Two things move without passing through that module, both on purpose:

- **The Deck** is a native horizontal scroll container with a snap point per
  Project. Its travel is the browser's — a swipe, a trackpad, the Rail and a
  press on a neighbouring Project all end in the same scroll — so there is no
  mapping to own. The page scrolls vertically and the Deck horizontally, so
  neither takes the other's gesture. A neighbouring Project is blurred itself
  and faded out by a mask on the track, so no blur ever meets a hard edge. See
  [ADR 0007](./docs/adr/0007-deck-slides-horizontally.md), which supersedes
  [0006](./docs/adr/0006-deck-scrolls-independently.md).
- **The Figure** (`src/components/PacMan.jsx`) is generated, not drawn: a lit
  sphere sampled onto a character grid, with every frame stacked in one
  `<pre>` that a stepped CSS animation moves one frame at a time. Its size and
  speed are `RADIUS` and `FPS` in that file. Under reduced motion it holds
  still on one frame; below `lg` it is not shown.

---

## Tests

`npm test` runs Vitest, which reuses `vite.config.js`, so there is no second
build pipeline and no production dependency.

- **`src/motion/params.test.js`** — the Zoom moments start and end where they
  should, and every mapping clamps outside its range.
- **`src/data/content.test.js`** — the two Dictionaries have the same key
  structure.

Deliberately not tested: anything browser-driven, and any visual regression
snapshot. This is a presentation layer; the assertions would break on every
design tweak and catch nothing a human reviewer would not see first.

---

## Deployment

Static site (Vite → `dist/`), no backend, no runtime secrets.

- **CI** (`.github/workflows/ci.yml`): on every push / PR to `main` →
  `npm ci` → audit runtime deps → **test** → build → upload the `dist`
  artifact. A failing test fails CI.
- **Hosting — Vercel:** import the GitHub repo at
  [vercel.com/new](https://vercel.com/new); Vite is auto-detected (build
  `npm run build`, output `dist`). Every push to `main` deploys to production,
  every PR gets a preview URL. Add the `oscar-hunaut.dev` domain under
  Settings → Domains.
- `vercel.json` adds security headers (HSTS, `X-Frame-Options`, `nosniff`,
  `Permissions-Policy`) and a 1-year immutable cache on `/assets/`.
- `vite.config.js` injects a strict **Content-Security-Policy** at build time.
  It permits **no external origin**. The Backdrop preset names an `envPreset`
  but uses `lightType="3d"`, so the library never fetches the HDR environment
  maps that `lightType="env"` would — switching to `"env"` means adding
  `https://ruucm.github.io` back to `connect-src`.
- **`.npmrc`** (`legacy-peer-deps=true`) is required — `npm ci` fails without it.

---

## Structure

```
.
├── index.html                    # SEO + Open Graph meta (oscar-hunaut.dev)
├── vite.config.js                # Vite + Vitest + build-time CSP injection
├── vercel.json                   # security headers + asset caching
├── .npmrc                        # legacy-peer-deps=true (required to build)
├── .github/workflows/ci.yml      # CI: install → audit → test → build
├── CONTEXT.md                    # the shared vocabulary
├── docs/adr/                     # architecture decision records
├── public/
│   ├── robots.txt · favicon.svg
│   └── assets/                   # self-hosted .woff2 + profile/renovtacana.webp
└── src/
    ├── main.jsx                  # React entry (+ LanguageProvider)
    ├── App.jsx                   # layout, scroll progress, reduced-motion
    ├── i18n.jsx                  # EN/FR language context
    ├── index.css                 # ← the Token block, Panels, Glass, the Deck
    ├── fonts.css                 # self-hosted @font-face
    ├── data/content.js           # ← ALL content (en + fr)
    ├── motion/params.js          # ← the Zoom moments: scroll → motion parameters
    └── components/
        ├── Nav.jsx               # pill nav, scroll-spy, language toggle
        ├── Hero · About · Skills · Projects · Experience · Contact
        ├── ShaderBackdrop.jsx    # the ShaderGradient preset (lazy chunk)
        ├── FlatBackdrop.jsx      # the designed fallback Backdrop
        ├── PacMan.jsx            # the Figure behind the Projects
        ├── ImageSlot.jsx · Reveal.jsx · icons.jsx
```

Page sections: **Hero → About → Skills → Projects → Experience → Contact.**

---

Handcrafted with the help of Claude, reviewed by CrispyChicken2.
