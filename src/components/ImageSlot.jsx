import { useEffect, useState } from 'react'
import { MapIcon } from './icons'

// Display-only picture frame. Renders the static image shipped in
// public/assets (the `src` prop); if that file is missing it falls back to a
// designed cover tile — a designed state, not an error state.
// Purely presentational — visitors cannot click, focus or replace it.
// To change a picture: replace the file in public/assets, keeping the name.
//
// `tone` is a Tone: a step on the cold scale, 1 (deepest) to 3 (shallowest).
// Tones differ by depth and intensity, never by hue, and a Tone is never the
// Signal — so no slot reads as more important than another.

export default function ImageSlot({
  src = null,
  alt = '',
  placeholder = null,
  tone = 2,
  radius = 12,
  className = '',
  style = {},
}) {
  const [ok, setOk] = useState(Boolean(src))

  // Probe the file once; fall back to the cover tile if it is absent.
  useEffect(() => {
    if (!src) return
    const img = new Image()
    img.onload = () => setOk(true)
    img.onerror = () => setOk(false)
    img.src = src
  }, [src])

  const step = tone === 1 || tone === 3 ? tone : 2

  return (
    <div
      className={`relative grid place-items-center overflow-hidden text-center ${className}`}
      style={{
        borderRadius: radius,
        border: `1px solid var(--tone-${step}-edge)`,
        background: ok
          ? 'var(--win-body)'
          : `linear-gradient(160deg, var(--tone-${step}-bg), transparent 72%)`,
        ...style,
      }}
    >
      {ok ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
          style={{ borderRadius: radius }}
        />
      ) : (
        <span
          aria-hidden="true"
          className="leading-none"
          style={{ color: `var(--tone-${step}-fg)` }}
        >
          {placeholder ?? <MapIcon size={30} />}
        </span>
      )}
    </div>
  )
}
