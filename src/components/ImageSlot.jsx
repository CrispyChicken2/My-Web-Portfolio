import { useEffect, useRef, useState } from 'react'
import { useLang } from '../i18n'
import { MapIcon } from './icons'

// Project picture slot with three sources, in priority order:
//   1. an image you dropped/clicked in (downscaled + saved to localStorage,
//      so it survives reloads on this machine),
//   2. a static file shipped with the site (the `src` prop, e.g.
//      /assets/renovtacana.webp in public/assets — what visitors see),
//   3. a designed cover tile (tinted gradient + icon) when neither exists.
// The upload affordance is silent — no placeholder instructions in the UI.

const storageKey = (id) => `img-slot:${id}`

// Downscale to ≤1280px wide and re-encode so the data URL fits localStorage.
function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, 1280 / img.naturalWidth)
      const c = document.createElement('canvas')
      c.width = Math.round(img.naturalWidth * scale)
      c.height = Math.round(img.naturalHeight * scale)
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url)
      resolve(c.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('unreadable image'))
    }
    img.src = url
  })
}

export default function ImageSlot({
  id = 'default',
  src = null,
  placeholder = null,
  ariaLabel = 'Add a picture',
  tone = '#73bfc4',
  radius = 12,
  className = '',
  style = {},
}) {
  const { t } = useLang()
  const [stored, setStored] = useState(() => {
    try {
      return localStorage.getItem(storageKey(id))
    } catch {
      return null
    }
  })
  const [staticOk, setStaticOk] = useState(Boolean(src))
  const [over, setOver] = useState(false)
  const inputRef = useRef(null)

  // Probe the static file once; fall back to the cover tile if it's absent.
  useEffect(() => {
    if (!src) return
    const img = new Image()
    img.onload = () => setStaticOk(true)
    img.onerror = () => setStaticOk(false)
    img.src = src
  }, [src])

  const accept = async (file) => {
    if (!file || !file.type.startsWith('image/')) return
    if (file.size > 12 * 1024 * 1024) return // decoding huge files can freeze the tab
    try {
      const dataUrl = await fileToDataURL(file)
      setStored(dataUrl)
      try {
        localStorage.setItem(storageKey(id), dataUrl)
      } catch {
        /* quota exceeded — image still shows this session */
      }
    } catch {
      /* unreadable file — ignore */
    }
  }

  const shown = stored || (staticOk ? src : null)
  const rgbOf = (hex) => {
    const n = parseInt(hex.slice(1), 16)
    return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`
  }
  const rgb = rgbOf(tone)

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={shown ? t.projects.replacePicture : ariaLabel}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          inputRef.current?.click()
        }
      }}
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        accept(e.dataTransfer.files?.[0])
      }}
      className={`relative grid cursor-pointer place-items-center overflow-hidden text-center transition-all duration-200 hover:brightness-110 ${className}`}
      style={{
        borderRadius: radius,
        border: `1px solid rgba(${rgb},${over ? 0.7 : 0.25})`,
        background: shown ? 'var(--win-body)' : `linear-gradient(160deg, rgba(${rgb},0.24), rgba(${rgb},0.05) 70%)`,
        ...style,
      }}
    >
      {shown ? (
        <img src={shown} alt={ariaLabel} className="h-full w-full object-cover" style={{ borderRadius: radius }} />
      ) : (
        <span className="leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]" style={{ color: tone }}>
          {placeholder ?? <MapIcon size={30} />}
        </span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => accept(e.target.files?.[0])}
      />
    </div>
  )
}
