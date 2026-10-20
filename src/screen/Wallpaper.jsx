import { useId } from 'react'

// The desktop's wallpaper: a bloom of translucent petals opening out of the
// dark, in the lavender of the PC's light — the familiar Windows 11 motif,
// redrawn in this desk's colour.

const PETALS = [
  // angle, length, width, colour stop (1 = lightest), opacity
  [-62, 330, 120, 3, 0.55],
  [-34, 360, 132, 2, 0.6],
  [-8, 380, 140, 1, 0.7],
  [18, 370, 136, 2, 0.62],
  [44, 340, 124, 3, 0.55],
  [70, 300, 110, 4, 0.5],
  [-88, 280, 104, 4, 0.45],
]

export default function Wallpaper({ blur = false }) {
  const id = useId()
  const cx = 1500
  const cy = 600
  return (
    <svg
      className="os-wallpaper"
      viewBox="0 0 1720 720"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      style={blur ? { filter: 'blur(28px) brightness(0.62)', transform: 'scale(1.08)' } : undefined}
    >
      <defs>
        <radialGradient id={`${id}-glow`} cx="0.86" cy="0.82" r="0.65">
          <stop offset="0" stopColor="var(--os-bloom-3)" stopOpacity="0.5" />
          <stop offset="0.6" stopColor="var(--os-bloom-4)" stopOpacity="0.18" />
          <stop offset="1" stopColor="var(--os-wall)" stopOpacity="0" />
        </radialGradient>
        {[1, 2, 3, 4].map((step) => (
          <linearGradient key={step} id={`${id}-p${step}`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="var(--os-bloom-4)" stopOpacity="0.2" />
            <stop offset="0.55" stopColor={`var(--os-bloom-${Math.min(4, step + 1)})`} />
            <stop offset="1" stopColor={`var(--os-bloom-${step})`} />
          </linearGradient>
        ))}
        <filter id={`${id}-soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
      </defs>
      <rect width="1720" height="720" fill="var(--os-wall)" />
      <rect width="1720" height="720" fill={`url(#${id}-glow)`} />
      <g filter={`url(#${id}-soft)`}>
        {PETALS.map(([angle, length, width, step, opacity]) => (
          <path
            key={angle}
            d={`M ${cx} ${cy} C ${cx - width} ${cy - length * 0.45}, ${cx - width * 0.55} ${cy - length * 0.95}, ${cx} ${cy - length} C ${cx + width * 0.55} ${cy - length * 0.95}, ${cx + width} ${cy - length * 0.45}, ${cx} ${cy} Z`}
            fill={`url(#${id}-p${step})`}
            opacity={opacity}
            transform={`rotate(${angle} ${cx} ${cy})`}
            style={{ mixBlendMode: 'screen' }}
          />
        ))}
      </g>
    </svg>
  )
}
