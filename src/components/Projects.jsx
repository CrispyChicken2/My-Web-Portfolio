import { useCallback, useEffect, useRef, useState } from 'react'
import {
  animate,
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
  deckFrontIndex,
  deckProgressForIndex,
  deckSectionViewports,
  deckTargetIndex,
} from '../motion/params'

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
// and one after" rather than how far through a track the Visitor is. Filling
// in behind them would imply a ranking the site does not claim.
//
// Every dot is a real button naming the Project it leads to, not its number,
// so the labels stay correct when a fourth Project is added and so the Rail is
// not a control only some Visitors have. Its colours come from the same
// Tokens as the Experience timeline's dots: the Rail stands beside a Project's
// Highlight, and a viewport holding two acid things holds no Signal at all.
function Rail({ items, front, count, strings, onSelect }) {
  return (
    <nav className="deck-rail" aria-label={strings.label}>
      {/* The count, moved here from the Deck header. The Deck is no longer
          unavoidable — a Visitor who never puts the pointer over the Section
          scrolls straight past it — so this is the main thing telling them
          there is more than the one Project they can see, and it has to be
          where they are already looking. */}
      <div className="deck-rail-count font-mono" aria-hidden="true">
        <span style={{ color: 'var(--fg1)' }}>{String(front + 1).padStart(2, '0')}</span>
        <span className="opacity-40">/</span>
        <span>{String(count).padStart(2, '0')}</span>
      </div>
      <ul className="m-0 flex list-none flex-col items-center gap-1 p-0">
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
    </nav>
  )
}

// One Project inside the Deck. Its position comes from how far it is from the
// Project the Deck is travelling toward — a spring-driven value — rather than
// from the scroll offset directly, which is what keeps the movement a settling
// one rather than something dragged along by the wheel.
//
// Whether it can be reached is a different question, and it is decided by the
// Deck rather than here. It has to be the Project the Deck *names* — the one
// the counter and the Rail agree on — and never "is this card at rest", which
// is false for everyone whenever the Visitor stops mid-handover: the Deck
// travels continuously now, so that is a position it can simply come to rest
// in, and it would leave a fully visible Project with an unclickable link.
function DeckCard({ project, index, current, alt, reachable }) {
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

// The Deck. Its Section is as tall as its scroll budget asks for — a hold at
// each end and one handover between each pair of Projects — so adding a
// Project costs one handover and is a content edit and nothing else.
function Deck({ label, heading, items, altFor, rail }) {
  const ref = useRef(null)
  const scroller = useRef(null)
  const travel = useRef(null)
  const parking = useRef(null)
  const count = items.length
  // The Deck reads its own scroll, not the page's. That is the whole point:
  // with the pointer over the Section the wheel moves the Projects and the
  // page stays where it is, and with the pointer anywhere else the page
  // scrolls straight past. Nothing here intercepts a wheel event — the region
  // is a real scroll container and the browser decides which one the gesture
  // belongs to, which is why trackpad momentum behaves.
  const { scrollYProgress } = useScroll({ container: scroller })
  const [front, setFront] = useState(0)

  // Scroll travels continuously between Projects, holding near each one; the
  // spring carries the cards along it. The two steps are what make the Deck
  // arrive instead of tracking the wheel — and the travel is what stops most
  // of the Deck's scroll from changing nothing at all.
  const target = useTransform(scrollYProgress, (p) => deckTargetIndex(p, count))
  const current = useSpring(target, DECK_SPRING)

  // The counter and the Rail follow the target, not the spring, so they flip
  // once and decisively rather than hesitating mid-flight.
  useMotionValueEvent(target, 'change', (next) => {
    const index = deckFrontIndex(next, count)
    setFront((shown) => (shown === index ? shown : index))
  })

  // Pressing a dot moves the Deck's own scroller, not the spring. The Deck's
  // position is derived from that scroller, so driving the spring alone would
  // leave the two disagreeing and the Visitor's next turn of the wheel would
  // yank them back. Passing through the Projects in between comes for free:
  // the scroller is scrolled through them.
  //
  // It happens in two phases, because the Section is ordinary page content now
  // and can be sitting half above the top of the window when a dot is pressed.
  // Park the Section first, then travel the Deck — otherwise the Visitor
  // watches a Panel they can only half see change into another one.
  //
  // Every scroll here passes `behavior: 'instant'`, deliberately: the
  // stylesheet sets `scroll-behavior: smooth` on the document, and a
  // two-argument scrollTo inherits it, so each frame of the easing would start
  // a *new* browser smooth scroll toward a moving target — the mushy,
  // per-browser drift these animations exist to avoid.
  const goTo = useCallback(
    (index) => {
      const box = scroller.current
      const section = ref.current
      if (!box || !section) return

      const span = box.scrollHeight - box.clientHeight
      if (span <= 0) return

      const to = deckProgressForIndex(index, count) * span
      const parkTo = section.getBoundingClientRect().top + window.scrollY
      const parked = Math.abs(window.scrollY - parkTo) < 2
      // Only refuse to move if the Deck is genuinely resting on that Project
      // *and* the Section is already in place. Comparing against the counter
      // instead would refuse precisely when the Deck has come to rest
      // mid-handover — the one time a dot is most needed.
      if (parked && Math.abs(target.get() - index) < 0.01) return

      travel.current?.stop()
      parking.current?.stop()

      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      const travelDeck = () => {
        if (reduce) {
          box.scrollTo({ top: to, behavior: 'instant' })
          return
        }
        // Long jumps take longer, but not proportionally — crossing the whole
        // Deck should still feel like one movement rather than a tour.
        const screens = Math.min(Math.abs(to - box.scrollTop) / box.clientHeight, 3)
        travel.current = animate(box.scrollTop, to, {
          duration: 0.35 + screens * 0.32,
          ease: [0.32, 0.72, 0, 1],
          onUpdate: (value) => box.scrollTo({ top: value, behavior: 'instant' }),
        })
      }

      if (parked) {
        travelDeck()
        return
      }
      if (reduce) {
        window.scrollTo({ top: parkTo, behavior: 'instant' })
        travelDeck()
        return
      }
      parking.current = animate(window.scrollY, parkTo, {
        duration: 0.4,
        ease: [0.32, 0.72, 0, 1],
        onUpdate: (value) => window.scrollTo({ top: value, behavior: 'instant' }),
      })
      parking.current.then(travelDeck)
    },
    [count, target],
  )

  // A Visitor who starts scrolling mid-travel means it: let them take over
  // rather than fighting the animation for the rest of its duration. The
  // listener is on the window because either scroller may be the one moving.
  useEffect(() => {
    const cancel = () => {
      travel.current?.stop()
      parking.current?.stop()
    }
    window.addEventListener('wheel', cancel, { passive: true })
    window.addEventListener('touchstart', cancel, { passive: true })
    return () => {
      window.removeEventListener('wheel', cancel)
      window.removeEventListener('touchstart', cancel)
      cancel()
    }
  }, [])

  return (
    <section id="projects" ref={ref} className="deck relative z-[1]">
      {/* The scroll container. The track inside it is what gives it range;
          the pane is sticky within the track, exactly as it used to be sticky
          within the document — the pattern is unchanged, it has just moved
          inside a box of its own. */}
      <div ref={scroller} className="deck-scroller">
        <div className="deck-track" style={{ '--deck-stages': deckSectionViewports(count) }}>
          <div className="deck-pane flex flex-col overflow-hidden">
            {/* The top padding clears the floating Nav, which ends 68px down,
                and nothing more: every pixel of header band is paid for twice
                over by the Panel below it, which can only centre on the
                viewport once the header leaves it room on both sides of the
                middle. The counter that used to sit at the far end of this row
                has moved onto the Rail — with the Deck no longer unavoidable,
                the count is the main thing telling a Visitor there is more
                here, and it belongs beside the Panel rather than in the
                opposite corner. */}
            <div className="on-field mx-auto w-full max-w-content px-6 pb-6 pt-24 sm:px-10">
              <div className="mono-label mb-3">{label}</div>
              <h2 className="m-0 max-w-[20ch] font-display text-[clamp(26px,3.2vw,40px)] font-bold tracking-[-1px]">
                {heading}
              </h2>
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
                    reachable={index === front}
                  />
                ))}
                {/* Inside the Panel box rather than the pane, so its two
                    positions — in the Panel's own padding, and out in the
                    gutter beside it — are one offset apart rather than two
                    viewport calculations. */}
                <Rail
                  items={items}
                  front={front}
                  count={count}
                  strings={rail}
                  onSelect={goTo}
                />
              </div>
            </div>
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
  const wide = useMediaQuery(DECK_MIN_WIDTH)
  const altFor = (project) => t.projects.screenshotAlt.replace('{title}', project.title)

  const props = {
    label: t.projects.label,
    heading: t.projects.heading,
    items: t.projects.items,
    altFor,
    rail: t.projects.rail,
  }

  // The Deck must not sit inside a transformed or filtered wrapper — that
  // would defeat the sticky pane the whole thing rests on.
  //
  // It is also desktop-only now, and the plain stack carries both of the
  // cases that are not it: a Visitor who prefers reduced motion, and a phone.
  return reduce || !wide ? <PlainStack {...props} /> : <Deck {...props} />
}
