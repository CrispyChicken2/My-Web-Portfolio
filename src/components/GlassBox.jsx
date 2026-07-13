import { useEffect, useRef, useState } from 'react'

// Set once the vendor chunk has loaded; lets refreshLiquidGlass() reach the
// vendor's static snapshot cache without importing the chunk eagerly.
let ContainerRef = null

// Invalidate the page snapshot and rebuild every glass layer. Called when the
// page's rendered content changes wholesale (e.g. language switch) — the old
// snapshot would keep refracting the previous text.
export function refreshLiquidGlass() {
  if (ContainerRef) ContainerRef.pageSnapshot = null
  window.dispatchEvent(new Event('lg:refresh'))
}

// The vendor only re-renders each container on 'scroll' events. With ~12 live
// WebGL contexts the browser drops some of those renders under contention, so
// a container can stay frozen on a stale frame → it refracts content from a
// previous scroll position ("ghost" boxes). This controller (installed once)
// forces every live container to render a correct FINAL frame after scrolling
// stops and after any resize, which is exactly when stale frames are visible.
let settleInstalled = false
function renderAllGlass() {
  const list = ContainerRef?.instances
  if (!list) return
  for (const c of list) c.render && c.render()
}
function installSettleController() {
  if (settleInstalled) return
  settleInstalled = true

  let settleTimer = 0
  const onScroll = () => {
    clearTimeout(settleTimer)
    settleTimer = setTimeout(renderAllGlass, 140)
  }

  let resizeTimer = 0
  const onResize = () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      const list = ContainerRef?.instances
      if (!list) return
      for (const c of list) {
        c.updateSizeFromDOM && c.updateSizeFromDOM()
        c.render && c.render()
      }
    }, 160)
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize)
  window.addEventListener('lg:settle', renderAllGlass)
}

// Mounts a real dashersw/liquid-glass-js Container (WebGL refraction of a
// page snapshot) as a background layer inside the PARENT element:
//
//   <div className="glass relative overflow-hidden rounded-[20px]">
//     <LiquidLayer radius={20} />
//     ...content...
//   </div>
//
// The parent's CSS `.glass` look is the fallback (mobile / WebGL failure) and
// is neutralized via `.lgjs-active` once the WebGL layer is live. The layer
// sits at z-index -1 inside an isolated stacking context, so all content
// paints above it.
//
// Each instance owns a WebGL context — use on the handful of major content
// boxes only (browsers cap active contexts around 16).

// mode 'replace': the parent's CSS glass background is removed once the WebGL
//   layer is live (for .glass content boxes).
// mode 'tint': the parent keeps its own (translucent) background painted over
//   the glass — used for colored buttons so the palette stays intact.
// type 'pill' lets the upstream Container auto-round to height/2.
export default function LiquidLayer({ radius = 20, tint = 0.14, delay = 2200, mode = 'replace', type = 'rounded' }) {
  const markerRef = useRef(null)
  const [epoch, setEpoch] = useState(0)

  // Rebuild this layer when a global refresh is requested.
  useEffect(() => {
    const onRefresh = () => setEpoch((e) => e + 1)
    window.addEventListener('lg:refresh', onRefresh)
    return () => window.removeEventListener('lg:refresh', onRefresh)
  }, [])

  useEffect(() => {
    // Desktop-only enhancement; CSS glass covers the rest.
    if (!window.matchMedia('(min-width: 768px)').matches) return
    const host = markerRef.current?.parentElement
    if (!host) return

    let cancelled = false
    let container = null
    let containerCls = null
    let ro = null

    // Rebuilds (epoch > 0) don't need the long first-paint delay.
    const timer = setTimeout(async () => {
      const { Container } = await import('../vendor/liquid-glass/index.js')
      if (cancelled || !host.isConnected) return

      ContainerRef = Container
      containerCls = Container
      installSettleController()
      container = new Container({ borderRadius: radius, type, tintOpacity: tint })
      const el = container.element
      el.setAttribute('aria-hidden', 'true')
      Object.assign(el.style, {
        position: 'absolute',
        inset: '0',
        padding: '0',
        zIndex: '-1',
        borderRadius: type === 'pill' ? '9999px' : `${radius}px`,
        pointerEvents: 'none',
        // fade the WebGL layer in so surfaces don't visibly "pop" when it lands
        opacity: '0',
        transition: 'opacity 400ms ease',
      })
      host.prepend(el)
      container.updateSizeFromDOM()

      // Only switch the host over once the page snapshot actually exists —
      // if html2canvas failed, the element keeps its CSS fallback look.
      const activeClass = mode === 'tint' ? 'lgjs-host' : 'lgjs-active'
      const activate = () => {
        if (cancelled) return
        if (Container.pageSnapshot) {
          host.classList.add(activeClass)
          // Render a fresh frame at the layer's real position right before it
          // fades in, then a couple of global settles once reveal animations
          // and the fade have landed — otherwise the first painted frame can
          // be stale and never corrects until the user scrolls.
          container.render && container.render()
          requestAnimationFrame(() => {
            el.style.opacity = '1'
          })
          setTimeout(() => window.dispatchEvent(new Event('lg:settle')), 260)
          setTimeout(() => window.dispatchEvent(new Event('lg:settle')), 900)
        } else if (!Container.isCapturing && !Container.pageSnapshot) el.remove()
        else setTimeout(activate, 400)
      }
      setTimeout(activate, 400)

      // Keep the WebGL layer sized with the responsive box.
      ro = new ResizeObserver(() => container.updateSizeFromDOM())
      ro.observe(host)
    }, epoch > 0 ? 600 : delay)

    return () => {
      cancelled = true
      clearTimeout(timer)
      ro?.disconnect()
      if (container?.element) {
        // Drop the instance from the vendor registry too, or its render loop
        // and scroll handler keep the detached canvas alive (memory leak).
        const idx = containerCls?.instances.indexOf(container) ?? -1
        if (idx > -1) containerCls.instances.splice(idx, 1)
        container.element.remove()
        host.classList.remove('lgjs-active', 'lgjs-host')
      }
    }
  }, [radius, tint, delay, mode, type, epoch])

  return <span ref={markerRef} hidden />
}
