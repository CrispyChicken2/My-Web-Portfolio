import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Everything is self-hosted (fonts included) except the ShaderGradient env
// lighting (envPreset="city"), which fetches its HDR maps from the library's
// GitHub Pages host — that single origin is allowed in connect-src.
// 'unsafe-inline' for styles is required by the React style props used across
// the site; blob: images are the user-dropped photos in ImageSlot.
const csp = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self' https://ruucm.github.io",
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
})
