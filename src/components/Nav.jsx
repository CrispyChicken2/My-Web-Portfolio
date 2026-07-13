import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLang } from '../i18n'
import LiquidLayer from './GlassBox'

export default function Nav() {
  const { lang, setLang, t } = useLang()
  const [active, setActive] = useState('about')
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Links shown in the bar / drawer (Contact has its own button).
  const links = t.navLinks.filter((l) => l.id !== 'contact')
  const handle = '~/' + t.profile.name.toLowerCase().replace(/\s+/g, '-')
  const initials = t.profile.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  useEffect(() => {
    const ids = ['about', 'skills', 'projects', 'experience']
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean)
    // A section is "active" when it crosses the middle of the viewport —
    // a visibility-ratio threshold would never fire for sections taller
    // than ~2× the viewport.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  // Shrink the bar once the page is scrolled.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll while the drawer is open; close it with Escape.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <nav
      aria-label={t.nav.primary}
      className="fixed left-1/2 top-3 z-50 flex w-[calc(100%-20px)] max-w-[1120px] -translate-x-1/2 items-center justify-between rounded-full border border-white/[0.1] py-2 pl-4 pr-2.5 backdrop-blur-xl backdrop-saturate-150 transition-colors duration-300 sm:pl-5"
      style={{
        background: scrolled ? 'rgba(10,14,22,0.72)' : 'var(--nav-bg)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 12px 32px rgba(4,2,10,0.4)',
      }}
    >
      <LiquidLayer type="pill" mode="tint" delay={2800} tint={0.1} />
      <a href="#top" className="flex items-center gap-2.5 text-fg no-underline">
        <span
          className="grid h-[34px] w-[34px] place-items-center rounded-full font-mono text-[15px] font-bold tracking-[-1px] transition-transform duration-200 hover:rotate-[-6deg]"
          style={{ background: 'linear-gradient(135deg,var(--acc),var(--acc-deep))', color: 'var(--ink)' }}
        >
          {initials}
        </span>
        <span className="hidden font-mono text-sm text-dim sm:inline">{handle}</span>
      </a>

      <div className="flex items-center gap-3 sm:gap-5">
        <ul className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <li key={link.id} className="relative">
              <a
                href={`#${link.id}`}
                aria-current={active === link.id ? 'true' : undefined}
                className={`relative inline-block rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  active === link.id ? 'text-accent' : 'text-dim hover:text-fg'
                }`}
              >
                {active === link.id && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-lg border border-white/[0.08] bg-white/[0.06]"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* language toggle */}
        <div
          role="group"
          aria-label="Language"
          className="flex items-center gap-0.5 rounded-full border border-white/[0.1] p-0.5 font-mono text-[11.5px]"
        >
          {['en', 'fr'].map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
              className={`rounded-full px-2 py-1 uppercase transition-colors ${
                lang === l ? 'bg-white/[0.1] text-fg' : 'text-dim hover:text-fg'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        <a
          href="#contact"
          className="lg-cta rounded-full px-4 py-2 text-sm font-semibold text-white shadow-[0_6px_20px_rgba(255,129,10,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(255,129,10,0.42)] active:scale-[0.96]"
          style={{ backgroundColor: 'rgba(255,138,46,0.66)' }}
        >
          {t.nav.contact}
        </a>

        <button
          type="button"
          aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
          className="relative grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 md:hidden"
        >
          <span className="relative block h-[14px] w-[18px]">
            <motion.span className="absolute left-0 block h-[2px] w-full rounded-full bg-fg" animate={open ? { top: 6, rotate: 45 } : { top: 0, rotate: 0 }} transition={{ duration: 0.25 }} />
            <motion.span className="absolute left-0 top-[6px] block h-[2px] w-full rounded-full bg-fg" animate={open ? { opacity: 0 } : { opacity: 1 }} transition={{ duration: 0.2 }} />
            <motion.span className="absolute left-0 block h-[2px] w-full rounded-full bg-fg" animate={open ? { top: 6, rotate: -45 } : { top: 12, rotate: 0 }} transition={{ duration: 0.25 }} />
          </span>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="absolute inset-x-0 top-[calc(100%+10px)] z-40 rounded-2xl border border-white/[0.08] px-4 py-4 backdrop-blur-xl md:hidden"
            style={{ background: 'rgba(6,8,13,0.94)', boxShadow: '0 20px 50px rgba(2,3,6,0.5)' }}
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <motion.ul
              className="flex flex-col gap-1"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.06 } } }}
            >
              {links.map((link) => (
                <motion.li key={link.id} variants={{ hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0 } }}>
                  <a
                    href={`#${link.id}`}
                    onClick={() => setOpen(false)}
                    aria-current={active === link.id ? 'true' : undefined}
                    className={`block rounded-lg px-3 py-3 text-[15px] font-medium transition-colors ${
                      active === link.id ? 'bg-white/[0.06] text-accent' : 'text-dim hover:bg-white/[0.04] hover:text-fg'
                    }`}
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
