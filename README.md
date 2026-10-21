# oscar-hunaut.dev — Portfolio

A personal, **bilingual (EN/FR)** portfolio in two forms:

- **The Room** (`/`): a 3D evening desk — standing desk, 34-inch ultrawide,
  mechanical keyboard, a Lian Li O11 Dynamic Mini V2 gaming PC lit in
  lavender, a BlackShark V2 X, an ergonomic chair with a headrest, shelves of
  books and football trophies, and a springer spaniel asleep in his bed — that
  the camera glides around. Point at the monitor and it fills the window: the
  monitor runs the **Screen**, a Windows 11-style desktop whose browser window
  holds the whole site's content. The mechanics follow
  [henryheffernan.com](https://henryheffernan.com/); everything in the Room
  is modelled, textured and voiced in code. See
  [ADR 0008](./docs/adr/0008-the-site-opens-on-a-room.md).
- **The plain version** (`/classic.html`): the scrolling site described below.
  Phones, browsers without WebGL, and anyone who asks for it get this one.

The plain version's content layer is austere — a
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

Three pages are served: `/` (the Room), `/screen.html` (the Screen on its
own, powered on) and `/classic.html` (the plain version). On the Room,
`?room` skips the phone/WebGL check and `?skip` starts without the click —
which also means no sound, since browsers only allow audio a person started.

---

## Editing the site

### Content (text)

Everything lives in **`src/data/content.js`**: two Dictionaries with the same
shape, `en` and `fr`. ⚠️ Any new string must be added to **both** — `npm test`
fails and names the offending key otherwise, so a half-translated Locale
cannot ship. The language is detected on first visit (browser language), then
remembered; visitors switch with the **EN | FR** toggle in the nav (logic in
`src/i18n.jsx`). The Room's overlay and the Screen's taskbar carry the same
toggle, and a switch in one is followed by the other.

The Room and the Screen read the same content. Their own words — the loader,
the overlay, window controls, the Terminal — live in
**`src/data/interface.js`**, with the same two-Dictionary shape and the same
parity test.

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

The **Room is another exception**: a lit 3D scene needs material and light
colours WebGL can read, so they live in `src/room/palette.js`, one file.

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
- `og-room-v3.jpg` — the link-preview image (1200 × 630) shown when the site
  is shared. It is cached for a year, so a new one needs a new file name (and
  the `og:image` / `twitter:image` tags in `index.html` and `classic.html`
  updated to match).

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

## The Room

`src/room/Experience.js` builds the scene and runs the loop. The models are
in `src/room/world/` — one file per object, all assembled from rounded boxes,
lathes, tubes and bent planes in centimetres (the desk top sits at 75). Their
textures (oak, floor planks, the mesh weave, keycap legends…) are drawn on
canvases in `src/room/textures.js`. Sound is synthesised in
`src/room/audio.js`. Nothing is downloaded.

- **Camera** (`src/room/camera.js`): five Viewpoints — loading, idle, desk,
  monitor, dog. A click anywhere toggles idle and desk; pointing at the monitor
  (or tabbing into it) goes in; leaving it, or Esc, comes back out. Pointing at
  the dog glides down to his bed, framed wider than the monitor, and pointing
  away goes back to where the camera came from. The monitor
  Viewpoint is fitted to the window by `fitDistance` in
  `src/room/framing.js`, the Room's tested seam.
- **Screen** (`src/room/screen.js`): `screen.html` in an iframe at a fixed
  1720 × 720 (21:9), placed over the monitor's glass by a `CSS3DRenderer`, on top of
  the canvas. It is same-origin, so the Room listens to its keys and pointer
  directly: each key press pushes the matching key on the 3D keyboard, and the
  3D mouse follows the cursor.
- **Quality**: three steps. *High*: ambient occlusion, bloom, fur, up to 2×
  pixels. *Medium*: bloom and fur, 1.5×. *Low*: no post-processing, no fur,
  smaller shadow maps, 1×. The Room guesses its starting step from the
  graphics chip (integrated Intel HD/UHD, phone and software renderers, or a
  machine with ≤ 4 cores or ≤ 4 GB start low; Iris Xe and integrated Radeon
  start medium), then steps down while the first seconds average under
  ~40 fps. `?quality=high|medium|low` forces a step.
- **Draw calls**: once built, every static mesh sharing a material is baked
  into one (`world/merge.js`), and each rigidly moving thing (a fan's rotor,
  the dog) into one of its own — a full frame is ~1,200 draw calls at high
  and ~560 at low, from ~2,700. Mark anything that moves on its own
  `userData.keep`, or it will be frozen into the merge.
- **Reduced motion**: camera moves become cuts, the idle orbit and the
  pointer lean stop, the fans hold still and the RGB stops breathing.
- **The PC** (`world/computer.js`) is the most detailed model: the case's
  real layout and fan mounts, the cooler, the graphics card. Its lavender
  comes from `palette.lavender`.

`src/screen/` is the Screen, dressed as a dark Windows 11 desktop: a boot
logo and sign-in, desktop icons, draggable and resizable windows (`windows.js`
is the window manager, tested on its own), a centred taskbar whose language
indicator is the EN/FR switch, and a start menu that lists the Projects under
Recommended. The apps: the **Portfolio**, the site in a browser window
(`apps/Browser.jsx` around `apps/Showcase.jsx`); a PowerShell-style
**Terminal** (`apps/Terminal.jsx`) that answers from the content; and an
empty **Recycle Bin**. Its colours are the `--os-*` Tokens.

---

## The Backdrop

This section and the next describe the plain version.

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
- **`src/data/interface.test.js`** — the same, for the interface strings.
- **`src/room/framing.test.js`** — the camera's easings start and end where
  they should, and the monitor is framed whatever the window's shape.
- **`src/screen/windows.test.js`** — the Screen's window manager: one window
  per app, focus and stacking, and no window dragged out of reach.

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
- `vercel.json` adds security headers (HSTS, `nosniff`, `Permissions-Policy`,
  and `X-Frame-Options: SAMEORIGIN` with `frame-ancestors 'self'` — the Room
  frames the Screen, nobody else may frame anything) and a 1-year immutable
  cache on `/assets/`.
- `vite.config.js` builds the three pages and injects a strict
  **Content-Security-Policy** into each at build time. It permits **no
  external origin**; `frame-src 'self'` lets the Room show the Screen. The Backdrop preset names an `envPreset`
  but uses `lightType="3d"`, so the library never fetches the HDR environment
  maps that `lightType="env"` would — switching to `"env"` means adding
  `https://ruucm.github.io` back to `connect-src`.
- **`.npmrc`** (`legacy-peer-deps=true`) is required — `npm ci` fails without it.

---

## Structure

```
.
├── index.html                    # the Room; SEO + Open Graph meta (oscar-hunaut.dev)
├── screen.html                   # the Screen, shown on the Room's monitor
├── classic.html                  # the plain version
├── vite.config.js                # Vite + Vitest + three pages + build-time CSP
├── vercel.json                   # security headers + asset caching
├── .npmrc                        # legacy-peer-deps=true (required to build)
├── .github/workflows/ci.yml      # CI: install → audit → test → build
├── CONTEXT.md                    # the shared vocabulary
├── docs/adr/                     # architecture decision records
├── public/
│   ├── robots.txt · favicon.svg
│   └── assets/                   # self-hosted .woff2 + profile/renovtacana.webp
└── src/
    ├── room/                     # the Room
    │   ├── main.jsx              # entry: phone/WebGL check, then the overlay
    │   ├── Experience.js         # renderer, scene, loop, input, quality
    │   ├── camera.js · framing.js# Viewpoints and moves · their arithmetic
    │   ├── screen.js · audio.js  # the iframe on the monitor · synthesised sound
    │   ├── palette.js · textures.js
    │   ├── world/                # room, desk, monitor, keyboard, mouse,
    │   │                         # computer, chair, props, lighting
    │   └── ui/                   # loader, start card, overlay (React)
    ├── screen/                   # the Screen: boot, desktop, windows, taskbar,
    │   └── apps/                 # Browser + Showcase (the Portfolio), Terminal,
    │                             # Recycle Bin
    ├── main.jsx                  # plain version: React entry (+ LanguageProvider)
    ├── App.jsx                   # plain version: layout, scroll progress
    ├── i18n.jsx                  # EN/FR language context, shared by all three
    ├── index.css                 # ← the Token block, Panels, Glass, the Deck
    ├── fonts.css                 # self-hosted @font-face
    ├── data/content.js           # ← ALL content (en + fr)
    ├── data/interface.js         # ← the Room's and Screen's own words (en + fr)
    ├── motion/params.js          # ← the Zoom moments: scroll → motion parameters
    └── components/
        ├── Nav.jsx               # pill nav, scroll-spy, language toggle
        ├── Hero · About · Skills · Projects · Experience · Contact
        ├── ShaderBackdrop.jsx    # the ShaderGradient preset (lazy chunk)
        ├── FlatBackdrop.jsx      # the designed fallback Backdrop
        ├── PacMan.jsx            # the Figure behind the Projects
        ├── ImageSlot.jsx · Reveal.jsx · icons.jsx
```

Sections, in the plain version and in the Portfolio window alike:
**Hero (Home) → About → Skills → Projects → Experience → Contact.**

---

Handcrafted with the help of Claude, reviewed by CrispyChicken2.
