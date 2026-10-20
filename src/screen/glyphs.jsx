import { useId } from 'react'

// The Screen's icons, drawn for a dark Windows 11 desktop: colourful,
// softly shaded app icons, and thin monochrome glyphs for the chrome. Every
// colour comes from a Token except the gradients inside the app icons, which
// are the icons' own artwork.

// The four-pane start logo, in the accent.
export function StartLogo({ size = 20 }) {
  const id = useId()
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--os-bloom-1)" />
          <stop offset="1" stopColor="var(--os-bloom-3)" />
        </linearGradient>
      </defs>
      <path fill={`url(#${id})`} d="M2 2h9.4v9.4H2zM12.6 2H22v9.4h-9.4zM2 12.6h9.4V22H2zM12.6 12.6H22V22h-9.4z" />
    </svg>
  )
}

export function AppIcon({ app, size = 40 }) {
  const id = useId()
  const s = { width: size, height: size, viewBox: '0 0 48 48', 'aria-hidden': true }

  if (app === 'terminal') {
    return (
      <svg {...s}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3a3a40" />
            <stop offset="1" stopColor="#151518" />
          </linearGradient>
        </defs>
        <rect x="4" y="7" width="40" height="34" rx="6" fill={`url(#${id})`} stroke="#5b5b66" strokeWidth="1" />
        <rect x="4" y="7" width="40" height="7" rx="6" fill="#4a4a54" />
        <path d="m13 22 6 5-6 5" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 33h11" stroke="var(--os-accent)" strokeWidth="2.6" strokeLinecap="round" />
      </svg>
    )
  }
  if (app === 'contact') {
    return (
      <svg {...s}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#5ab0ff" />
            <stop offset="1" stopColor="#2c62d9" />
          </linearGradient>
        </defs>
        <rect x="5" y="11" width="38" height="27" rx="4" fill={`url(#${id})`} />
        <path d="m6 13 18 13 18-13" fill="none" stroke="#e8f2ff" strokeWidth="2.4" strokeLinejoin="round" />
      </svg>
    )
  }
  if (app === 'recycle') {
    return (
      <svg {...s}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f4f6fb" stopOpacity="0.9" />
            <stop offset="1" stopColor="#9aa4b8" stopOpacity="0.75" />
          </linearGradient>
        </defs>
        <path d="M11 13h26l-3 29H14z" fill={`url(#${id})`} stroke="#d9dee8" strokeWidth="1" />
        <rect x="9" y="9" width="30" height="5" rx="2" fill="#e6e9f0" />
        <path d="M18 18l1 19M24 18v19M30 18l-1 19" stroke="#8d97ab" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    )
  }
  if (app === 'github' || app === 'linkedin') {
    return (
      <svg {...s}>
        <rect x="5" y="5" width="38" height="38" rx="9" fill={app === 'github' ? '#24292f' : '#0a66c2'} />
        <path d="M20 28l8-8M22 17h9v9" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M27 31v3a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V23a2 2 0 0 1 2-2h3" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
      </svg>
    )
  }
  if (app === 'document') {
    return (
      <svg {...s}>
        <path d="M12 5h17l9 9v29H12z" fill="#e9ecf3" />
        <path d="M29 5v9h9" fill="#c3c9d6" />
        <rect x="16" y="22" width="18" height="2.4" rx="1" fill="var(--os-bloom-3)" />
        <rect x="16" y="28" width="15" height="2.4" rx="1" fill="#9aa4b8" />
        <rect x="16" y="34" width="12" height="2.4" rx="1" fill="#9aa4b8" />
      </svg>
    )
  }
  // portfolio: a browser shortcut to the site — a globe in the accent's
  // gradient with the monogram's tile riding on it
  return (
    <svg {...s}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--os-bloom-1)" />
          <stop offset="0.55" stopColor="var(--os-bloom-2)" />
          <stop offset="1" stopColor="var(--os-bloom-4)" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="19" fill={`url(#${id})`} />
      <path d="M5 24h38M24 5c6 6 6 32 0 38M24 5c-6 6-6 32 0 38" fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="1.6" />
      <rect x="26" y="26" width="17" height="17" rx="4.5" fill="#14102b" stroke="#ffffff" strokeOpacity="0.2" />
      <text x="34.5" y="38" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontWeight="700" fontSize="8.5" fill="#c4b2ff">
        OH
      </text>
    </svg>
  )
}

// Thin chrome glyphs, 16 × 16, stroked in currentColor.
const paths = {
  minimize: <path d="M3.5 8h9" />,
  maximize: <rect x="3.5" y="3.5" width="9" height="9" rx="1.5" />,
  restore: (
    <>
      <rect x="3.5" y="5.5" width="7" height="7" rx="1.2" />
      <path d="M6 5.5V4.6c0-.6.5-1.1 1.1-1.1h4.3c.6 0 1.1.5 1.1 1.1v4.3c0 .6-.5 1.1-1.1 1.1h-.9" />
    </>
  ),
  close: <path d="m4 4 8 8M12 4l-8 8" />,
  search: (
    <>
      <circle cx="7" cy="7" r="4.2" />
      <path d="m10.2 10.2 3.3 3.3" />
    </>
  ),
  chevronUp: <path d="m4 10 4-4 4 4" />,
  chevronDown: <path d="m4 6 4 4 4-4" />,
  wifi: (
    <>
      <path d="M1.8 6.4a9 9 0 0 1 12.4 0" />
      <path d="M3.9 8.7a6 6 0 0 1 8.2 0" />
      <path d="M6 11a3 3 0 0 1 4 0" />
      <circle cx="8" cy="13" r="0.6" fill="currentColor" />
    </>
  ),
  volume: (
    <>
      <path d="M7.5 3.5 4.5 6H2.5v4h2l3 2.5z" />
      <path d="M10.4 6a2.8 2.8 0 0 1 0 4M12.2 4.3a5.3 5.3 0 0 1 0 7.4" />
    </>
  ),
  muted: (
    <>
      <path d="M7.5 3.5 4.5 6H2.5v4h2l3 2.5z" />
      <path d="m10.5 6.2 3.6 3.6M14.1 6.2l-3.6 3.6" />
    </>
  ),
  bell: (
    <>
      <path d="M4 11V7.2a4 4 0 0 1 8 0V11l1 1.2H3z" />
      <path d="M6.6 13.6a1.5 1.5 0 0 0 2.8 0" />
    </>
  ),
  back: <path d="M13 8H3.5M7.5 4 3.5 8l4 4" />,
  forward: <path d="M3 8h9.5M8.5 4l4 4-4 4" />,
  refresh: (
    <>
      <path d="M13 8a5 5 0 1 1-1.5-3.6" />
      <path d="M13 2.6v3h-3" />
    </>
  ),
  lock: (
    <>
      <rect x="3.5" y="7" width="9" height="6.5" rx="1.4" />
      <path d="M5.5 7V5.3a2.5 2.5 0 0 1 5 0V7" />
    </>
  ),
  star: <path d="m8 2.6 1.6 3.4 3.6.4-2.7 2.5.8 3.6L8 10.7l-3.3 1.8.8-3.6L2.8 6.4l3.6-.4z" />,
  plus: <path d="M8 3v10M3 8h10" />,
  more: (
    <>
      <circle cx="3.5" cy="8" r="0.7" fill="currentColor" />
      <circle cx="8" cy="8" r="0.7" fill="currentColor" />
      <circle cx="12.5" cy="8" r="0.7" fill="currentColor" />
    </>
  ),
  power: (
    <>
      <path d="M8 2.5v5" />
      <path d="M4.6 4.6a5 5 0 1 0 6.8 0" />
    </>
  ),
  folder: <path d="M2 4.5h4l1.4 1.5H14v6.5H2z" />,
}

export function Glyph({ kind, size = 16 }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[kind]}
    </svg>
  )
}
