# — My Portfolio project

A **minimal, editorial** personal portfolio: light theme, refined typography,
generous whitespace, and a **fixed sidebar split** layout (left column stays put,
right column scrolls). Calm, premium, no flashy effects.

**Stack:** React 18 · Vite · Tailwind CSS · Framer Motion · react-icons

---

## 🚀 Run it locally

### 0. Prerequisite — install Node.js (one time)

Node.js isn't installed on your machine yet. Download the **LTS** version here:
👉 https://nodejs.org (pick the "LTS" Windows `.msi` installer).

After installing, **close and reopen your terminal**, then check:

```powershell
node --version
npm --version
```

### 1. Install dependencies

```powershell
cd "C:\Users\..."
npm install
```

### 2. Start the dev server

```powershell
npm run dev
```

Open the printed URL (usually **http://localhost:5173**). Hot reload is on.

### 3. Production build

```powershell
npm run build      # outputs the optimized /dist folder
npm run preview    # preview the production build locally
```


---

## 🎨 Customize the look

- **Colors / palette** → `tailwind.config.js` (`colors`: `paper`, `ink`, `accent`, …).
- **Fonts** → `index.html` (Google Fonts) + `tailwind.config.js` (`fontFamily`).
  Currently: Fraunces (display serif) · Inter (body) · JetBrains Mono (labels).
- **Global styles, scrollbar, focus ring** → `src/index.css`.

---

## 📁 Project structure

```
.
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx                 # React entry point
    ├── App.jsx                  # Sidebar + scrolling content layout
    ├── index.css                # Tailwind + global styles
    ├── data/
    │   └── content.js           # ← ALL editable content
    └── components/
        ├── Sidebar.jsx          # Fixed left column + scroll-spy nav
        ├── About.jsx
        ├── Skills.jsx
        ├── Experience.jsx
        ├── Projects.jsx         # Each card has a clear GitHub button
        ├── Contact.jsx          # Contact + footer
        ├── SectionHeading.jsx   # Editorial section divider
        └── Reveal.jsx           # Subtle scroll-in animation
```

---

README made with Claude AI and reviiewed by CrsipyChicken2