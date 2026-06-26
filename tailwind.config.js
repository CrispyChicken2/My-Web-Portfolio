/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#070b12', // page background
        panel: '#0c1320', // card / window surface
        fg: '#e7ecf3', // primary text
        mute: '#aab4c4', // body text
        dim: '#8b97a8', // secondary text
        faint: '#7a8aa0', // labels / tertiary
        cyan: '#22d3ee', // primary accent
        indigo: '#818cf8', // secondary accent
        amber: '#f6b95c', // warm accent
        gold: '#f3edda', // stat numbers
        accent: '#22d3ee',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        content: '1200px',
      },
      keyframes: {
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scrollcue: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '70%': { opacity: '1' },
          '100%': { transform: 'translateY(14px)', opacity: '0' },
        },
        blink: {
          '0%,50%': { opacity: '1' },
          '50.01%,100%': { opacity: '0' },
        },
      },
      animation: {
        floaty: 'floaty 4s ease-in-out infinite',
        scrollcue: 'scrollcue 1.6s ease-in-out infinite',
        blink: 'blink 1s step-end infinite',
      },
    },
  },
  plugins: [],
}
