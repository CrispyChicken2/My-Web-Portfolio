import { useEffect, useState } from 'react'
import { MapIcon } from './icons'

// Display-only picture frame. Renders the static image shipped in
// public/assets (the `src` prop); if that file is missing it falls back to a
// designed cover tile (tinted gradient + icon or initials).
// Purely presentational — visitors cannot click, focus or replace it.
// To change a picture: replace the file in public/assets, keeping the name.

export default function ImageSlot({
  src = null,
  alt = '',
  placeholder = null,
  tone = '#73bfc4',
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

  const n = parseInt(tone.slice(1), 16)
  const rgb = `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`

  return (
    <div
      className={`relative grid place-items-center overflow-hidden text-center ${className}`}
      style={{
        borderRadius: radius,
        border: `1px solid rgba(${rgb},0.25)`,
        background: ok
          ? 'var(--win-body)'
          : `linear-gradient(160deg, rgba(${rgb},0.24), rgba(${rgb},0.05) 70%)`,
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
          className="leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
          style={{ color: tone }}
        >
          {placeholder ?? <MapIcon size={30} />}
        </span>
      )}
    </div>
  )
}
