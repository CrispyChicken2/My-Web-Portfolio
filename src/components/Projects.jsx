import { useRef, useState } from 'react'
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import { useLang } from '../i18n'
import ImageSlot from './ImageSlot'
import {
  DECK_SPRING,
  blurFilter,
  deckCardState,
  deckSectionViewports,
  deckTargetIndex,
} from '../motion/params'

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

// One Project inside the Deck. Its position comes from how far it is from the
// Project the Deck currently rests on — a spring-driven value — rather than
// from the scroll offset directly. That is what stops a Project being left
// stranded half-risen when the Visitor stops mid-scroll: the Deck is always
// travelling to a whole Project, and always arrives.
function DeckCard({ project, index, current, alt }) {
  const [reachable, setReachable] = useState(index === 0)

  const offset = useTransform(current, (c) => c - index)
  // The seam hands back two travels in two units, and this is where they are
  // composed: the entry in viewport heights — spent in --deck-vh, the same
  // unit the pane is sized in, so a waiting Project clears the pane exactly
  // whatever height a Panel is — and the covered lift as a percent of the
  // Panel itself.
  const y = useTransform(offset, (o) => {
    const { enterVh, y: lift } = deckCardState(o)
    // 0 rather than a zero-length calc at rest, so a presented Panel carries
    // no transform at all and is not composited onto a layer of its own.
    if (enterVh === 0 && lift === 0) return 0
    return `calc(${enterVh} * var(--deck-vh) + ${lift}%)`
  })
  const scale = useTransform(offset, (o) => deckCardState(o).scale)
  const opacity = useTransform(offset, (o) => deckCardState(o).opacity)
  const filter = useTransform(offset, (o) => blurFilter(deckCardState(o).blur))
  // A Project the Visitor cannot see should cost the browser nothing to keep
  // around — an invisible Panel is still composited otherwise.
  const visibility = useTransform(offset, (o) =>
    deckCardState(o).opacity < 0.01 ? 'hidden' : 'visible',
  )

  // A Project still below the fold, or already covered by the next one, must
  // not hold keyboard focus — the Visitor would be looking at something else.
  useMotionValueEvent(offset, 'change', (o) => {
    const next = deckCardState(o).presented
    setReachable((currentlyReachable) => (currentlyReachable === next ? currentlyReachable : next))
  })

  return (
    <motion.div
      className="absolute inset-0"
      style={{
        y,
        scale,
        opacity,
        filter,
        visibility,
        zIndex: index,
        pointerEvents: reachable ? 'auto' : 'none',
      }}
    >
      <ProjectPanel project={project} index={index} alt={alt} reachable={reachable} />
    </motion.div>
  )
}

// The Deck. Its Section is as tall as it needs to be for one viewport of
// scroll per Project, so adding a Project is a content edit and nothing else.
function Deck({ label, heading, items, altFor }) {
  const ref = useRef(null)
  const count = items.length
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [front, setFront] = useState(0)

  // Scroll picks a whole Project; the spring carries the cards to it. The two
  // steps are what make the Deck settle instead of tracking the wheel.
  const target = useTransform(scrollYProgress, (p) => deckTargetIndex(p, count))
  const current = useSpring(target, DECK_SPRING)

  // The counter follows the target, not the spring, so it flips once and
  // decisively rather than hesitating mid-flight.
  useMotionValueEvent(target, 'change', (next) => {
    setFront((shown) => (shown === next ? shown : next))
  })

  return (
    <section
      id="projects"
      ref={ref}
      className="deck relative z-[1]"
      style={{ '--deck-stages': deckSectionViewports(count) }}
    >
      <div className="deck-pane sticky top-0 flex flex-col overflow-hidden">
        {/* The top padding clears the floating Nav, which ends 68px down, and
            nothing more: every pixel of header band is paid for twice over by
            the Panel below it, which can only centre on the viewport once the
            header leaves it room on both sides of the middle. */}
        <div className="on-field mx-auto flex w-full max-w-content items-end justify-between gap-6 px-6 pb-6 pt-24 sm:px-10">
          <div>
            <div className="mono-label mb-3">{label}</div>
            <h2 className="m-0 max-w-[20ch] font-display text-[clamp(26px,3.2vw,40px)] font-bold tracking-[-1px]">
              {heading}
            </h2>
          </div>

          {/* How many Projects there are, and where the Visitor is in the set. */}
          <div className="flex shrink-0 flex-col items-end gap-2">
            <div className="font-mono text-[13px] text-dim">
              <span style={{ color: 'var(--fg1)' }}>{String(front + 1).padStart(2, '0')}</span>
              <span className="px-1 opacity-50">/</span>
              {String(count).padStart(2, '0')}
            </div>
            {/* Ticks wrap and cap their width so a Deck of twelve Projects
                sits in the header as comfortably as a Deck of three; on a
                phone the counter alone carries it. */}
            <div
              className="hidden max-w-[240px] flex-wrap justify-end gap-1 sm:flex"
              aria-hidden="true"
            >
              {items.map((item, i) => (
                <span
                  key={item.title}
                  className="h-[3px] w-5 rounded-full transition-colors duration-300"
                  style={{ background: i <= front ? 'var(--ice)' : 'var(--edge)' }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-content flex-1 px-6 pb-10 sm:px-10">
          <div className="deck-panels">
            {items.map((project, index) => (
              <DeckCard
                key={project.title}
                project={project}
                index={index}
                current={current}
                alt={altFor(project)}
              />
            ))}
          </div>
        </div>
      </div>
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

      <div className="flex flex-col gap-6">
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
  const altFor = (project) => t.projects.screenshotAlt.replace('{title}', project.title)

  const props = {
    label: t.projects.label,
    heading: t.projects.heading,
    items: t.projects.items,
    altFor,
  }

  // The Deck must not sit inside a transformed or filtered wrapper — that
  // would defeat the sticky pane the whole thing rests on.
  return reduce ? <PlainStack {...props} /> : <Deck {...props} />
}
