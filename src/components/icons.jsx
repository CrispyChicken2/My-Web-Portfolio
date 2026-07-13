// Single stroke-based icon set (1.5px, round caps — Lucide-style) so every
// glyph renders identically across platforms and inherits currentColor.

function Svg({ size = 20, className = '', children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export const CpuIcon = (p) => (
  <Svg {...p}>
    <rect x="6" y="6" width="12" height="12" rx="2" />
    <rect x="10" y="10" width="4" height="4" />
    <path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" />
  </Svg>
)

export const ChartIcon = (p) => (
  <Svg {...p}>
    <path d="M3 3v18h18" />
    <path d="M8 17v-5M13 17V7M18 17v-8" />
  </Svg>
)

export const CodeIcon = (p) => (
  <Svg {...p}>
    <path d="m8 7-5 5 5 5M16 7l5 5-5 5" />
  </Svg>
)

export const TerminalIcon = (p) => (
  <Svg {...p}>
    <path d="m4 17 6-5-6-5" />
    <path d="M12 19h8" />
  </Svg>
)

export const GlobeIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3c2.5 2.4 4 5.6 4 9s-1.5 6.6-4 9c-2.5-2.4-4-5.6-4-9s1.5-6.6 4-9z" />
  </Svg>
)

export const MapIcon = (p) => (
  <Svg {...p}>
    <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" />
    <path d="M9 4v14M15 6v14" />
  </Svg>
)

export const MailIcon = (p) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </Svg>
)

export const BriefcaseIcon = (p) => (
  <Svg {...p}>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
  </Svg>
)

export const CapIcon = (p) => (
  <Svg {...p}>
    <path d="m2 9 10-5 10 5-10 5z" />
    <path d="M6 11.5V16c0 1.4 2.7 3 6 3s6-1.6 6-3v-4.5" />
  </Svg>
)

export const ZapIcon = (p) => (
  <Svg {...p}>
    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
  </Svg>
)

export const CopyIcon = (p) => (
  <Svg {...p}>
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
  </Svg>
)

export const CheckIcon = (p) => (
  <Svg {...p}>
    <path d="m4 12 5 5L20 7" />
  </Svg>
)
