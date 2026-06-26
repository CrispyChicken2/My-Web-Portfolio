import { useEffect, useState } from 'react'
import { profile } from '../data/content'

const LINKS = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
]

// unix-style handle derived from the name, e.g. ~/oscar-hunaut
const handle =
  '~/' + (profile.name || 'me').toLowerCase().replace(/\s+/g, '-')

const initials = (profile.name || 'OH')
  .split(' ')
  .map((w) => w[0])
  .join('')
  .slice(0, 2)
  .toUpperCase()

export default function Nav() {
  const [active, setActive] = useState('about')

  useEffect(() => {
    const ids = [...LINKS.map((l) => l.id), 'contact']
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean)
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

  return (
    <nav
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-white/[0.07] px-6 py-3.5 backdrop-blur-md sm:px-10"
      style={{ background: 'rgba(12,16,24,0.55)' }}
    >
      <a href="#top" className="flex items-center gap-2.5 text-fg no-underline">
        <span
          className="grid h-[34px] w-[34px] place-items-center rounded-[9px] font-mono text-[15px] font-bold tracking-[-1px] text-void"
          style={{ background: 'linear-gradient(135deg,#22d3ee,#818cf8)' }}
        >
          {initials}
        </span>
        <span className="hidden font-mono text-sm text-dim sm:inline">{handle}</span>
      </a>

      <div className="flex items-center gap-4 sm:gap-6">
        <ul className="hidden items-center gap-6 md:flex">
          {LINKS.map((link) => (
            <li key={link.id}>
              <a
                href={`#${link.id}`}
                className={`text-sm font-medium transition-colors ${
                  active === link.id ? 'text-fg' : 'text-dim hover:text-fg'
                }`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <a
          href="#contact"
          className="rounded-[9px] bg-cyan px-4 py-2 text-sm font-semibold text-void shadow-[0_6px_20px_rgba(34,211,238,0.22)] transition-transform duration-200 hover:-translate-y-0.5"
        >
          Contact
        </a>
      </div>
    </nav>
  )
}
