import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLang } from '../i18n'

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

  // A Pill: it imitates glass in flat CSS. The Backdrop is a third-party
  // surface now, so nothing on the site can sample it and there is no real
  // refraction to have here.
  const background = scrolled ? 'var(--nav-bg-scrolled)' : 'var(--nav-bg)'

  return (
    <nav
      aria-label={t.nav.primary}
      className="fixed left-1/2 top-3 z-50 flex w-[calc(100%-20px)] max-w-[1120px] -translate-x-1/2 items-center justify-between rounded-full py-2 pl-4 pr-2.5 backdrop-blur-xl backdrop-saturate-150 transition-colors duration-300 sm:pl-5"
      style={{
        background,
        border: '1px solid var(--edge)',
        boxShadow: 'inset 0 1px 0 var(--sheen-1), 0 12px 32px var(--nav-shadow)',
      }}
    >
      <a href="#top" className="flex items-center gap-2.5 text-fg no-underline">
        <span
          className="grid h-[34px] w-[34px] place-items-center rounded-full font-mono text-[15px] font-bold tracking-[-1px] transition-transform duration-200 hover:rotate-[-6deg]"
          style={{ background: 'linear-gradient(135deg,var(--ice),var(--ice-deep))', color: 'var(--bg)' }}
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
                  active === link.id ? 'text-signal' : 'text-dim hover:text-fg'
                }`}
              >
                {active === link.id && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-lg"
                    style={{ border: '1px solid var(--edge)', background: 'var(--surf-2)' }}
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
          className="flex items-center gap-0.5 rounded-full p-0.5 font-mono text-[11.5px]"
          style={{ border: '1px solid var(--edge)' }}
        >
          {['en', 'fr'].map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
              className="rounded-full px-2 py-1 uppercase transition-colors"
              style={
                lang === l
                  ? { background: 'var(--surf-2)', color: 'var(--fg1)' }
                  : { color: 'var(--fg4)' }
              }
            >
              {l}
            </button>
          ))}
        </div>

        <a
          href="#contact"
          className="lg-pill rounded-full px-4 py-2 text-sm font-semibold text-fg transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.96]"
        >
          {t.nav.contact}
        </a>

        <button
          type="button"
          aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
          className="relative grid h-9 w-9 place-items-center rounded-lg md:hidden"
          style={{ border: '1px solid var(--edge)', background: 'var(--surf-1)' }}
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
            className="absolute inset-x-0 top-[calc(100%+10px)] z-40 rounded-2xl px-4 py-4 backdrop-blur-xl md:hidden"
            style={{
              background: 'var(--panel-glass-subtle)',
              border: '1px solid var(--edge)',
              boxShadow: '0 20px 50px var(--shadow)',
            }}
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
                      active === link.id ? 'text-signal' : 'text-dim hover:text-fg'
                    }`}
                    style={active === link.id ? { background: 'var(--surf-2)' } : undefined}
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
