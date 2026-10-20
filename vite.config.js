/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))

// Everything the site loads comes from its own origin, so the policy permits
// no external origin at all. The Backdrop preset carries envPreset="city",
// but it also sets lightType="3d" — mesh lighting, not environment lighting —
// so the library never fetches the HDR maps that the "env" light type would.
// Verified: no request leaves the origin at runtime. If the Backdrop ever
// switches back to lightType="env", connect-src needs
// https://ruucm.github.io added back or the lighting will silently fail.
// 'unsafe-inline' for styles is required by the React style props used across
// the site; blob: and data: images cover inline SVG icons and object URLs.
// The Room shows the Screen (screen.html) in an iframe on its monitor, so
// frames are allowed from the site's own origin and nowhere else.
const csp = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      // Inject the CSP only into production builds — the dev server relies on
      // inline scripts (HMR / react-refresh preamble) that a strict CSP blocks.
      name: 'inject-csp',
      apply: 'build',
      transformIndexHtml(html) {
        return html.replace(
          '<meta charset="UTF-8" />',
          `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${csp}" />`,
        )
      },
    },
  ],

  // Three pages: the Room (the 3D desk, at /), the Screen it shows on its
  // monitor, and the plain version of the site.
  build: {
    rolldownOptions: {
      input: {
        room: resolve(root, 'index.html'),
        screen: resolve(root, 'screen.html'),
        classic: resolve(root, 'classic.html'),
      },
    },
  },

  // Vitest reuses this config, so tests run through the same transform
  // pipeline as the build — no second build path and no extra runtime dep.
  test: {
    include: ['src/**/*.test.{js,jsx}'],
    environment: 'node',
  },
})
