# oscar-hunaut.dev — Portfolio

A personal, **bilingual (EN/FR)** portfolio. The content layer is austere — a
desaturated ice-cyan cold scale carries every surface and every string, and a
single acid-lime **Signal** marks the few things meant to be pressed or read.
All the colour and all the motion sit behind the content, in the **Field**: a
hand-written WebGL2 Backdrop that also renders the navigation bar's refraction.

For the vocabulary used throughout (Field, Deck, Signal, Tone, Panel, Zoom
moment…), see [CONTEXT.md](./CONTEXT.md).

**Stack:** React 18 · Vite · Tailwind CSS · Framer Motion · Vitest.
No rendering library — the Field is ~500 lines of GLSL and WebGL2 in
`src/field/`. Three runtime dependencies in total.

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
job: the Deck sizes its Section from the Project count, so no layout, height
or count needs changing. A Project may optionally carry `imageSlot: true` plus
an `image` path, and a `highlight` phrase that must appear verbatim inside its
`description`.

### Theme (colours)

Every colour on the site resolves from the **Token block** at the top of
**`src/index.css`** — the cold scale (`--fg1…8`, `--ice`), the Signal
(`--sig`), surfaces, Tones, and the Field's own colours (`--field-*`, read by
the Field through `src/field/palette.js`). No component carries a colour of
its own, so retheming is one edit to that block. `tailwind.config.js` only
references the Tokens.

Two rules the palette depends on:

- The **Signal** appears on the Hero calls to action, the active nav item, and
  a Project's Highlight. Nowhere else, and never decoratively.
- A **Tone** is a step on the cold scale. Tones differ by depth and intensity,
  never by hue, and a Tone is never the Signal.

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

## The Field

`src/field/` is the site's **one and only WebGL surface**, loaded as a separate
chunk so first paint is never blocked on it. It renders in three passes:

1. **the expanse** — a domain-warped noise field, into a framebuffer at a
   fraction of screen resolution (it has no detail worth resolving);
2. **the point layer** — sparse points at four depths, parallaxing above it;
3. **the composite** — draws that to the screen, and refracts it where the
   navigation bar sits.

Pass 3 is what liquid glass now is: the bar has no layer of its own, so it
refracts the live Field rather than a snapshot of the page. See
[ADR 0001](./docs/adr/0001-hand-written-webgl-field.md) for why the previous
library-based approach was removed.

The Field takes only continuous Visitor input — normalised cursor position and
scroll speed. It is given no Section identity by design: it must stay unable
to encode state.

**Degradation.** Every motion effect is decorative:

- `prefers-reduced-motion` → the Field is still, the Deck is a plain vertical
  stack, and the Zoom moments are absent. All content is present.
- WebGL unavailable or the context lost → `FlatBackdrop`, a designed flat
  Backdrop in the same scale, and the nav falls back to its flat Pill.
- Phones → the Field runs at reduced resolution with no point layer and no
  pointer work (`src/field/tier.js`). The Deck and all three Zoom moments stay.

---

## Motion

`src/motion/params.js` owns **every** mapping from Visitor input to a motion
parameter: the Field's uniforms, the Deck's per-Project progress, and the three
Zoom moments. It takes numbers and returns numbers, importing nothing from
React, the DOM or WebGL — which is what makes it the one seam the site is
tested at.

The three **Zoom moments** are counted and chosen, not a rule: the Hero → About
dolly, the Deck's recede, and the About Image slot's entry. A fourth is a
design decision, not an implementation detail.

---

## Tests

`npm test` runs Vitest, which reuses `vite.config.js`, so there is no second
build pipeline and no production dependency.

- **`src/motion/params.test.js`** — Deck progress is monotonic and clamped,
  every Project reaches a fully presented state at counts of three and above,
  pointer input maps into its normalised range at and beyond the viewport
  edges, and scroll velocity stays bounded so a fast flick cannot drive the
  Field past its limits.
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
  It permits **no external origin**: everything the site loads — fonts,
  images and the Field alike — comes from its own origin.
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
    ├── motion/params.js          # ← ALL input → motion parameter mapping
    ├── field/                    # the site's one WebGL surface
    │   ├── renderer.js           # context, passes, framebuffer
    │   ├── shaders.js            # expanse · points · composite (+ refraction)
    │   ├── palette.js            # the Field's colours, read from Tokens
    │   ├── tier.js               # desktop / phone tier
    │   └── FieldContext.jsx      # nav rectangle + "is the Field live"
    └── components/
        ├── Nav.jsx               # pill nav, scroll-spy, language toggle
        ├── Hero · About · Skills · Projects · Experience · Contact
        ├── Field.jsx             # mounts the surface (lazy chunk)
        ├── FlatBackdrop.jsx      # the designed fallback Backdrop
        ├── ImageSlot.jsx · Reveal.jsx · icons.jsx
```

Page sections: **Hero → About → Skills → Projects → Experience → Contact.**

---

Handcrafted with the help of Claude, reviewed by CrispyChicken2.
