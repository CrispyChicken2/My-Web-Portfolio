import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useLang } from '../i18n'
import ImageSlot from './ImageSlot'
import PacMan from './PacMan'

// The Deck is a desktop presentation. Below this width the Projects Section is
// the plain stack instead: every Project present at its own height, no gesture
// to learn, and no desktop-sized Panel to clip a description or an Image slot.
// The same width the Panel's own layout switches at, so the two never disagree.
const DECK_MIN_WIDTH = '(min-width: 1024px)'

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  )

  useEffect(() => {
    const list = window.matchMedia(query)
    const sync = () => setMatches(list.matches)
    sync()
    list.addEventListener('change', sync)
    return () => list.removeEventListener('change', sync)
  }, [query])

  return matches
}

// Renders the description, pulling the Highlight out with the Signal — the
// only place on the site the Signal appears that is not a call to action.
function Description({ text, highlight, className = '' }) {
  if (!highlight || !text.includes(highlight)) {
    return <p className={`m-0 text-[15px] leading-[1.7] text-mute ${className}`}>{text}</p>
  }
  const [before, after] = text.split(highlight)
  return (
    <p className={`m-0 text-[15px] leading-[1.7] text-mute ${className}`}>
      {before}
      <strong className="font-semibold text-signal">{highlight}</strong>
      {after}
    </p>
  )
}

// The anatomy of a Project, unchanged: index, category, Image slot,
// description with Highlight, tech list, repository link.
function ProjectPanel({ project, index, alt, reachable = true }) {
  const withImage = Boolean(project.imageSlot)

  return (
    <article
      className="glass-strong panel-glass-subtle flex h-full flex-col justify-center overflow-hidden rounded-[22px] p-7 sm:p-10"
      style={{ boxShadow: '0 24px 60px var(--shadow-deep)' }}
    >
      <div className={`grid gap-7 ${withImage ? 'lg:grid-cols-[1fr_0.85fr] lg:items-center' : ''}`}>
        <div className="min-w-0">
          <div className="mb-4 flex items-start justify-between gap-4">
            <span
              className="font-mono text-[40px] font-bold leading-none sm:text-[52px]"
              style={{ color: 'var(--card-index)' }}
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={reachable ? undefined : -1}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-[7px] px-2.5 py-[5px] font-mono text-[13px] text-dim transition-colors hover:text-ice"
              style={{ border: '1px solid var(--edge-strong)' }}
            >
              GitHub ↗
            </a>
          </div>

          <h3 className="m-0 mb-1.5 font-display text-[clamp(23px,2.6vw,32px)] font-bold">
            {project.title}
          </h3>
          <div className="mb-4 font-mono text-xs" style={{ color: 'var(--ice)' }}>
            {project.category}
          </div>

          <Description text={project.description} highlight={project.highlight} className="mb-5" />

          <div className="flex flex-wrap gap-1.5">
            {project.tech.map((item) => (
              <span
                key={item}
                className="rounded-md px-2.5 py-1 font-mono text-[11.5px] text-dim"
                style={{ background: 'var(--surf-1)' }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {withImage && (
          <ImageSlot
            src={project.image}
            alt={alt}
            radius={14}
            tone={2}
            className="h-[200px] w-full lg:h-[300px]"
          />
        )}
      </div>
    </article>
  )
}

// The Rail. One dot per Project, reading as position and never as progress —
// one dot active and the others alike, so it says "there is one before this
// and one after" rather than how far through a track the Visitor is.
//
// It sits under the Panel, with a step either side of the dots. A mouse wheel
// only scrolls a page vertically, so for a Visitor without a trackpad these
// controls are the way along the Deck, not a shortcut for it. Every dot is a
// real button naming the Project it leads to. Its colours come from the same
// Tokens as the Experience timeline's dots: the Rail stands beside a Project's
// Highlight, and a viewport holding two acid things holds no Signal at all.
function Rail({ items, front, count, strings, onSelect }) {
  return (
    <nav className="deck-rail" aria-label={strings.label}>
      <button
        type="button"
        className="deck-rail-step"
        aria-label={strings.previous}
        disabled={front === 0}
        onClick={() => onSelect(front - 1)}
      >
        ←
      </button>
      <ul className="m-0 flex list-none items-center gap-1 p-0">
        {items.map((project, index) => {
          const active = index === front
          return (
            <li key={project.title} className="flex">
              <button
                type="button"
                className="deck-rail-dot"
                data-active={active ? '' : undefined}
                aria-current={active ? 'true' : undefined}
                aria-label={strings.item
                  .replace('{n}', String(index + 1))
                  .replace('{total}', String(items.length))
                  .replace('{title}', project.title)}
                onClick={() => onSelect(index)}
              />
            </li>
          )
        })}
      </ul>
      <button
        type="button"
        className="deck-rail-step"
        aria-label={strings.next}
        disabled={front === count - 1}
        onClick={() => onSelect(front + 1)}
      >
        →
      </button>
      <div className="deck-rail-count font-mono" aria-hidden="true">
        <span style={{ color: 'var(--fg1)' }}>{String(front + 1).padStart(2, '0')}</span>
        <span className="opacity-40">/</span>
        <span>{String(count).padStart(2, '0')}</span>
      </div>
    </nav>
  )
}

// The Deck. The Projects sit side by side on a track that scrolls
// horizontally, one in view and its neighbours showing at the edges, so a
// Visitor can see there is more before they touch anything. The page scrolls
// vertically and the Deck sideways, so neither can take the other's gesture.
//
// The travel is the browser's own: the track is a real scroll container with
// a snap point per Project. Nothing here intercepts a wheel or animates a
// position — a swipe, a trackpad, the Rail and a click on the Project peeking
// in all end in the same scroll.
function Deck({ label, heading, items, altFor, rail }) {
  const track = useRef(null)
  const count = items.length
  const [front, setFront] = useState(0)

  // Which Project the track is resting on, read back from where it has been
  // scrolled to: the one whose centre is nearest the centre of the track.
  const sync = () => {
    const box = track.current
    if (!box) return
    let nearest = 0
    let best = Infinity
    Array.from(box.children).forEach((slide, index) => {
      const distance = Math.abs(
        slide.offsetLeft + slide.offsetWidth / 2 - (box.scrollLeft + box.clientWidth / 2),
      )
      if (distance < best) {
        best = distance
        nearest = index
      }
    })
    setFront((shown) => (shown === nearest ? shown : nearest))
  }

  const goTo = (index) => {
    const box = track.current
    const slide = box?.children[Math.min(count - 1, Math.max(0, index))]
    if (!slide) return
    box.scrollTo({
      left: slide.offsetLeft - (box.clientWidth - slide.offsetWidth) / 2,
      behavior: 'smooth',
    })
  }

  return (
    <section id="projects" className="deck relative z-[1] mx-auto max-w-content px-6 py-24 sm:px-10">
      <div className="on-field mb-8">
        <div className="mono-label mb-3">{label}</div>
        <h2 className="m-0 max-w-[20ch] font-display text-[clamp(28px,3.4vw,42px)] font-bold tracking-[-1px]">
          {heading}
        </h2>
      </div>

      {/* The figure is outside the track on purpose: a scroll container
          clips whatever leaves it, and the figure stands above the Panels. */}
      <div className="deck-panels">
        <PacMan />
        <div ref={track} className="deck-track" onScroll={sync}>
          {items.map((project, index) => (
            <div
              key={project.title}
              className="deck-slide"
              data-front={index === front ? '' : undefined}
              onClick={index === front ? undefined : () => goTo(index)}
            >
              <ProjectPanel
                project={project}
                index={index}
                alt={altFor(project)}
                reachable={index === front}
              />
            </div>
          ))}
        </div>
      </div>

      <Rail items={items} front={front} count={count} strings={rail} onSelect={goTo} />
    </section>
  )
}

// Under reduced motion the Deck is a plain vertical stack: every Project
// present, nothing moving, nothing hidden behind anything else.
function PlainStack({ label, heading, items, altFor }) {
  return (
    <section id="projects" className="relative z-[1] mx-auto max-w-content px-6 py-24 sm:px-10">
      <div className="on-field mb-11">
        <div className="mono-label mb-3">{label}</div>
        <h2 className="m-0 max-w-[20ch] font-display text-[clamp(28px,3.4vw,42px)] font-bold tracking-[-1px]">
          {heading}
        </h2>
      </div>

      <div className="relative flex flex-col gap-6">
        <PacMan />
        {items.map((project, index) => (
          <ProjectPanel key={project.title} project={project} index={index} alt={altFor(project)} />
        ))}
      </div>
    </section>
  )
}

export default function Projects() {
  const { t } = useLang()
  const reduce = useReducedMotion()
  const wide = useMediaQuery(DECK_MIN_WIDTH)
  const altFor = (project) => t.projects.screenshotAlt.replace('{title}', project.title)

  const props = {
    label: t.projects.label,
    heading: t.projects.heading,
    items: t.projects.items,
    altFor,
    rail: t.projects.rail,
  }

  // The Deck is desktop-only, and the plain stack carries both of the cases
  // that are not it: a Visitor who prefers reduced motion, and a phone.
  return reduce || !wide ? <PlainStack {...props} /> : <Deck {...props} />
}
