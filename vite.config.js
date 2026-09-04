/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Everything the site loads comes from its own origin, so the policy permits
// no external origin at all. The Backdrop preset carries envPreset="city",
// but it also sets lightType="3d" — mesh lighting, not environment lighting —
// so the library never fetches the HDR maps that the "env" light type would.
// Verified: no request leaves the origin at runtime. If the Backdrop ever
// switches back to lightType="env", connect-src needs
// https://ruucm.github.io added back or the lighting will silently fail.
// 'unsafe-inline' for styles is required by the React style props used across
// the site; blob: and data: images cover inline SVG icons and object URLs.
const csp = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
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

  // Vitest reuses this config, so tests run through the same transform
  // pipeline as the build — no second build path and no extra runtime dep.
  test: {
    include: ['src/**/*.test.{js,jsx}'],
    environment: 'node',
  },
})
