# oscar-hunaut.dev — Portfolio

A personal, **bilingual (EN/FR)** portfolio with a dark "Hot Light" theme
(teal · orange · periwinkle). Animated **ShaderGradient** background, a real
**liquid-glass** navigation bar, and clean, readable content with a
per-section transparency level.

**Stack:** React 18 · Vite · Tailwind CSS · Framer Motion ·
`@shadergradient/react` (react-three-fiber) · `liquid-glass-js` (vendored, MIT)

---

## Development

```powershell
npm install        # .npmrc handles peer-dependency resolution
npm run dev        # http://localhost:5173
npm run build      # production build → /dist
npm run preview    # serve the production build locally
```

Requires **Node ≥ 20**.

---

## Editing the site

### Content (text)
Everything lives in **`src/data/content.js`**: two dictionaries with the same
shape, `en` and `fr`. ⚠️ Any new string must be added to **both**.
The language is detected on first visit (browser language), then remembered;
visitors switch with the **EN | FR** toggle in the nav (logic in `src/i18n.jsx`).

### Theme (colors)
Colors are **CSS design tokens** in the `:root` block of **`src/index.css`**
(`--acc`, `--cta`, `--fg1…8`, surfaces…). `tailwind.config.js` only references
them, so changing the whole theme means editing a single block.

### Images
Placed in **`public/assets/`**:
- `profile.webp` — profile photo (About section)
- `renovtacana.webp` — RenovTaCana project screenshot

The `ImageSlot` component renders them and is display-only — visitors cannot
click, focus or replace a picture. To change one, replace the file in
`public/assets/` keeping the same name; keep filenames lowercase with no spaces
(the host is case-sensitive). If the file is missing, the slot falls back to a
designed cover tile rather than showing an error.

### Container transparency
Set **per section** with a `.panel-*` class (in `src/index.css`):
- `.panel-solid` — opaque (About)
- `.panel-glass` — translucent, background shows through (Skills, Experience)
- `.panel-glass-subtle` — barely translucent (Projects, Contact)

`.glass` / `.glass-strong` only provide the frame (border + depth); the level
comes from the `.panel-*` class on each container.

### Liquid glass
The **nav bar** uses the real WebGL effect from `dashersw/liquid-glass-js`
(vendored in `src/vendor/liquid-glass/`, patched to ESM). It is the **only**
glass-type WebGL context — buttons fake the glass look in pure CSS
(`.lg-pill`, `.lg-cta`), which avoids any performance or rendering issues.

---

## Deployment

Static site (Vite → `dist/`), no backend, no runtime secrets.

- **CI** (`.github/workflows/ci.yml`): on every push / PR to `main` →
  `npm ci` → audit runtime deps → build → upload the `dist` artifact.
- **Hosting — Vercel:** import the GitHub repo at
  [vercel.com/new](https://vercel.com/new); Vite is auto-detected (build
  `npm run build`, output `dist`). Every push to `main` deploys to production,
  every PR gets a preview URL. Add the `oscar-hunaut.dev` domain under
  Settings → Domains.
- `vercel.json` adds security headers (HSTS, `X-Frame-Options`, `nosniff`,
  `Permissions-Policy`) and a 1-year immutable cache on `/assets/`.
- `vite.config.js` injects a strict **Content-Security-Policy** at build time;
  the only allowed external origin is `https://ruucm.github.io` (the HDR
  environment maps used by the ShaderGradient background).
- **`.npmrc`** (`legacy-peer-deps=true`) is required — `npm ci` fails without it.

---

## Structure

```
.
├── index.html                    # SEO + Open Graph meta (oscar-hunaut.dev)
├── vite.config.js                # Vite + build-time CSP injection
├── vercel.json                   # security headers + asset caching
├── .npmrc                        # legacy-peer-deps=true (required to build)
├── .github/workflows/ci.yml      # CI: install → audit → build → artifact
├── public/
│   ├── robots.txt · favicon.svg
│   └── assets/                   # self-hosted .woff2 + profile/renovtacana.webp
└── src/
    ├── main.jsx                  # React entry (+ LanguageProvider)
    ├── App.jsx                   # layout, scroll progress bar, reduced-motion
    ├── i18n.jsx                  # EN/FR language context
    ├── index.css                 # design tokens + .panel-* / .lg-* classes
    ├── fonts.css                 # self-hosted @font-face
    ├── data/content.js           # ← ALL content (en + fr)
    ├── components/
    │   ├── Nav.jsx               # pill nav, scroll-spy, language toggle, liquid glass
    │   ├── Hero · About · Skills · Projects · Experience · Contact
    │   ├── ShaderBackdrop.jsx    # ShaderGradient background (lazy chunk) + FlatBackdrop fallback
    │   ├── GlassBox.jsx          # mounts the WebGL liquid glass (used by the nav)
    │   ├── ImageSlot.jsx         # image slot (profile + projects)
    │   ├── Reveal.jsx · icons.jsx
    └── vendor/liquid-glass/      # dashersw/liquid-glass-js (MIT, patched to ESM)
```

Page sections: **Hero → About → Skills → Projects → Experience → Contact.**

---

Handcrafted with the help of Claude, reviewed by CrispyChicken2.
