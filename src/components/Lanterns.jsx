import { useEffect, useRef } from 'react'

// Soft glowing "celestial lanterns" that drift slowly upward — the signature
// ambient background of the design. Ported faithfully (additive radial orbs in
// amber / cyan / indigo). Paints one static frame even if rAF is paused.
const PAL = [
  [246, 185, 92],
  [255, 208, 137],
  [255, 158, 92],
  [34, 211, 238],
  [129, 140, 248],
]

export default function Lanterns() {
  const ref = useRef(null)

  useEffect(() => {
    const c = ref.current
    const ctx = c.getContext('2d')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let w = 0
    let h = 0
    let parts = []
    let raf = 0

    const spawn = (init) => ({
      x: Math.random() * w,
      y: init ? Math.random() * h : h + 60,
      r: 26 + Math.random() * 78,
      sp: 0.12 + Math.random() * 0.34,
      swA: 8 + Math.random() * 34,
      swS: 0.0005 + Math.random() * 0.0011,
      ph: Math.random() * 6.28,
      col: PAL[Math.random() < 0.68 ? Math.floor(Math.random() * 3) : 3 + Math.floor(Math.random() * 2)],
      a: 0.05 + Math.random() * 0.13,
      tw: 0.4 + Math.random() * 1.3,
    })

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = c.clientWidth
      h = c.clientHeight
      c.width = Math.floor(w * dpr)
      c.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const n = Math.min(28, Math.floor(w / 56))
      parts = Array.from({ length: n }, () => spawn(true))
    }

    const frame = (t) => {
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'
      for (const p of parts) {
        p.y -= p.sp
        p.ph += p.swS * 16
        if (p.y < -100) Object.assign(p, spawn(false))
        const x = p.x + Math.sin(p.ph) * p.swA
        const a = p.a * (0.6 + 0.4 * Math.sin(t * 0.001 * p.tw + p.ph))
        const [r, g, b] = p.col
        const grad = ctx.createRadialGradient(x, p.y, 0, x, p.y, p.r)
        grad.addColorStop(0, `rgba(${r},${g},${b},${a.toFixed(3)})`)
        grad.addColorStop(0.35, `rgba(${r},${g},${b},${(a * 0.45).toFixed(3)})`)
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`)
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = `rgba(${r},${g},${b},${(a * 1.3).toFixed(3)})`
        ctx.beginPath()
        ctx.arc(x, p.y, Math.max(1, p.r * 0.06), 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalCompositeOperation = 'source-over'
    }

    const loop = (t) => {
      frame(t)
      raf = requestAnimationFrame(loop)
    }

    resize()
    frame(0)
    window.addEventListener('resize', resize)
    if (!reduce) raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas ref={ref} aria-hidden="true" className="absolute inset-0 h-full w-full" />
  )
}
