import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useLang } from '../../i18n'
import { interfaceStrings } from '../../data/interface'
import { social } from '../../data/content'
import ImageSlot from '../../components/ImageSlot'
import './showcase.css'
import {
  BriefcaseIcon,
  CapIcon,
  ChartIcon,
  CheckIcon,
  CodeIcon,
  CopyIcon,
  CpuIcon,
  GlobeIcon,
  MailIcon,
  TerminalIcon,
  ZapIcon,
} from '../../components/icons'

// The Portfolio: the site's content, page by page, inside a window. A quiet
// sidebar with the name and the Sections, and one Section at a time to the
// right of it. Every word comes from src/data/content.js.

const TAG_ICONS = { briefcase: BriefcaseIcon, cap: CapIcon, zap: ZapIcon }
const GROUP_ICONS = { cpu: CpuIcon, chart: ChartIcon, code: CodeIcon, terminal: TerminalIcon, globe: GlobeIcon }
const TONE = { green: 1, olive: 2, neutral: 3 }

export default function Showcase({ page: requested, focused }) {
  const { t, lang } = useLang()
  const ui = interfaceStrings[lang].screen.showcase
  const reduce = useReducedMotion()
  const [page, setPage] = useState(requested ?? 'home')
  const scroller = useRef(null)

  // Asked to show a page (the Contact icon, the Terminal) — go there.
  useEffect(() => {
    if (requested) setPage(requested)
  }, [requested])

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 })
  }, [page])

  const [name, role] = t.meta.title.split(' — ')
  const pages = [{ id: 'home', label: ui.home }, ...t.navLinks]

  return (
    <div className="sc">
      <aside className="sc-side">
        <button type="button" className="sc-name" onClick={() => setPage('home')}>
          {name}
        </button>
        <p className="sc-role">{role}</p>
        <nav aria-label={ui.sections}>
          <ul className="sc-nav">
            {pages.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  aria-current={page === item.id ? 'page' : undefined}
                  className="sc-nav-item"
                  onClick={() => setPage(item.id)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="sc-side-foot">
          <a href={social.github} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href={social.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
        </div>
      </aside>

      <div className="sc-main" ref={scroller} data-focused={focused ? '' : undefined}>
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            className="sc-page"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            {page === 'home' && <Home t={t} go={setPage} />}
            {page === 'about' && <About t={t} />}
            {page === 'skills' && <Skills t={t} />}
            {page === 'projects' && <Projects t={t} ui={ui} />}
            {page === 'experience' && <Experience t={t} />}
            {page === 'contact' && <Contact t={t} ui={ui} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function Heading({ label, children }) {
  return (
    <header className="sc-heading">
      <div className="mono-label mb-3">{label}</div>
      <h2>{children}</h2>
    </header>
  )
}

// --- Home --------------------------------------------------------------------

function useTyped(text, speed = 42) {
  const reduce = useReducedMotion()
  const [count, setCount] = useState(reduce ? text.length : 0)
  useEffect(() => {
    if (reduce) {
      setCount(text.length)
      return undefined
    }
    setCount(0)
    let i = 0
    const id = setInterval(() => {
      i += 1
      setCount(i)
      if (i >= text.length) clearInterval(id)
    }, speed)
    return () => clearInterval(id)
  }, [text, speed, reduce])
  return text.slice(0, count)
}

function Home({ t, go }) {
  const reduce = useReducedMotion()
  const line = useTyped(t.hero.line)
  const roles = t.hero.roles
  const [i, setI] = useState(0)

  useEffect(() => {
    if (reduce) return undefined
    const id = setInterval(() => setI((v) => (v + 1) % roles.length), 2600)
    return () => clearInterval(id)
  }, [reduce, roles.length])

  return (
    <div className="sc-home">
      <div className="sc-badge">
        <span aria-hidden="true" />
        {t.profile.available}
      </div>
      <h1 className="sc-hero">
        {t.profile.name}
        <span className="text-gradient sc-hero-line">
          {line}
          <span className="sc-caret" aria-hidden="true">
            |
          </span>
        </span>
      </h1>
      <p className="sc-lede">
        {t.hero.sentencePrefix}{' '}
        <span className="sc-role-word">
          <AnimatePresence mode="wait">
            <motion.span
              key={roles[i]}
              initial={{ opacity: 0, y: 8, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(6px)' }}
              transition={{ duration: reduce ? 0 : 0.35 }}
            >
              {roles[i]}
            </motion.span>
          </AnimatePresence>
        </span>{' '}
        {t.hero.sentenceSuffix}
      </p>
      <div className="sc-actions">
        <button type="button" className="lg-cta sc-button" onClick={() => go('projects')}>
          {t.hero.viewProjects}
        </button>
        <button type="button" className="lg-pill sc-button" onClick={() => go('contact')}>
          {t.hero.getInTouch}
        </button>
      </div>
    </div>
  )
}

// --- About -------------------------------------------------------------------

function About({ t }) {
  const initials = t.profile.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="sc-about">
      <div>
        <Heading label={t.about.label}>{t.about.heading}</Heading>
        <div className="sc-prose">
          {t.about.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <div className="sc-tags">
          {t.about.tags.map((tag) => {
            const Icon = TAG_ICONS[tag.icon]
            return (
              <span key={tag.label} className="sc-tag">
                {Icon && <Icon size={14} className="text-ice" />}
                {tag.label}
              </span>
            )
          })}
        </div>
      </div>
      <figure className="sc-portrait">
        <ImageSlot
          src="/assets/profile.webp"
          alt={t.about.photoAlt}
          radius={18}
          tone={1}
          className="h-full w-full"
          placeholder={<span className="text-gradient font-display text-[72px] font-bold">{initials}</span>}
        />
        <figcaption className="sc-exploring">
          <span>{t.about.exploring}</span>
          <strong>{t.about.exploringWhat}</strong>
        </figcaption>
      </figure>
    </div>
  )
}

// --- Skills ------------------------------------------------------------------

function Skills({ t }) {
  return (
    <div>
      <Heading label={t.skills.label}>{t.skills.heading}</Heading>
      <div className="sc-groups">
        {t.skills.groups.map((group) => {
          const Icon = GROUP_ICONS[group.icon] ?? CpuIcon
          const tone = TONE[group.tone] ?? 3
          return (
            <section key={group.group} className="sc-group">
              <div className="sc-group-head">
                <span className="sc-group-icon">
                  <Icon size={18} />
                </span>
                <h3>{group.group}</h3>
              </div>
              <ul>
                {group.items.map((item) => (
                  <li key={item} className="sc-chip" data-tone={tone}>
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>
    </div>
  )
}

// --- Projects ----------------------------------------------------------------

function Description({ text, highlight }) {
  if (!highlight || !text.includes(highlight)) return <p className="sc-description">{text}</p>
  const [before, after] = text.split(highlight)
  return (
    <p className="sc-description">
      {before}
      <strong className="text-signal">{highlight}</strong>
      {after}
    </p>
  )
}

function Projects({ t, ui }) {
  return (
    <div>
      <Heading label={t.projects.label}>{t.projects.heading}</Heading>
      <ol className="sc-projects">
        {t.projects.items.map((project, index) => (
          <li key={project.title} className="sc-project" data-image={project.imageSlot ? '' : undefined}>
            <div className="sc-project-text">
              <div className="sc-project-top">
                <span className="sc-project-index font-mono">{String(index + 1).padStart(2, '0')}</span>
                <a
                  className="sc-repo font-mono"
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${ui.openRepository}: ${project.title}`}
                >
                  GitHub ↗
                </a>
              </div>
              <h3>{project.title}</h3>
              <div className="sc-category font-mono">{project.category}</div>
              <Description text={project.description} highlight={project.highlight} />
              <ul className="sc-tech">
                {project.tech.map((item) => (
                  <li key={item} className="font-mono">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {project.imageSlot && (
              <ImageSlot
                src={project.image}
                alt={t.projects.screenshotAlt.replace('{title}', project.title)}
                radius={14}
                tone={2}
                className="sc-project-image"
              />
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}

// --- Experience --------------------------------------------------------------

function Experience({ t }) {
  return (
    <div>
      <Heading label={t.experience.label}>{t.experience.heading}</Heading>
      <ol className="sc-timeline">
        {t.experience.items.map((item) => (
          <li key={item.role} data-active={item.active ? '' : undefined}>
            <span className="sc-dot" aria-hidden="true" />
            <div className="sc-period font-mono">{item.period}</div>
            <h3>{item.role}</h3>
            <div className="sc-org">{item.org}</div>
            <p>{item.note}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}

// --- Contact -----------------------------------------------------------------

function Contact({ t, ui }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef(0)
  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(social.email)
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable — the mailto link remains */
    }
  }

  return (
    <div className="sc-contact">
      <div className="mono-label mb-4">{t.contact.label}</div>
      <h2>
        {t.contact.headingLines[0]}
        <br />
        {t.contact.headingLines[1]}
      </h2>
      <p className="sc-lede">{t.contact.blurb}</p>
      <div className="sc-actions">
        <a className="lg-pill sc-button" href={`mailto:${social.email}`} aria-label={`${ui.emailMe}: ${social.email}`}>
          <MailIcon size={16} /> {social.email}
        </a>
        <button type="button" className="lg-pill sc-button" onClick={copy} aria-live="polite">
          {copied ? <CheckIcon size={15} className="text-ice" /> : <CopyIcon size={15} />}
          {copied ? t.contact.copied : t.contact.copyEmail}
        </button>
        <a className="lg-pill sc-button" href={social.github} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <a className="lg-pill sc-button" href={social.linkedin} target="_blank" rel="noopener noreferrer">
          LinkedIn
        </a>
      </div>
      <footer className="sc-footer font-mono">
        © {new Date().getFullYear()} {t.profile.name}
      </footer>
    </div>
  )
}
