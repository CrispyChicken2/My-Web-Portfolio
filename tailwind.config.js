/** @type {import('tailwindcss').Config} */
// Color values live in src/index.css (:root design tokens) — edit them there.
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: 'var(--bg)', // page background
        fg: 'var(--fg1)', // primary text
        mute: 'var(--fg3)', // body text
        dim: 'var(--fg4)', // secondary text
        ice: 'rgb(var(--ice-rgb) / <alpha-value>)', // ice-cyan — the cold scale's brightest step
        signal: 'rgb(var(--sig-rgb) / <alpha-value>)', // the Signal — actionable things only
        ink: 'var(--ink)', // text on Signal surfaces
      },
      fontFamily: {
        display: ['"Archivo"', 'system-ui', 'sans-serif'],
        sans: ['"Karla"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        content: '1200px',
      },
      keyframes: {
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        blink: {
          '0%,50%': { opacity: '1' },
          '50.01%,100%': { opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        scrolldrip: {
          from: { transform: 'translateY(-18px)' },
          to: { transform: 'translateY(42px)' },
        },
      },
      animation: {
        floaty: 'floaty 4s ease-in-out infinite',
        blink: 'blink 1s step-end infinite',
        shimmer: 'shimmer 6s linear infinite',
        scrolldrip: 'scrolldrip 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
