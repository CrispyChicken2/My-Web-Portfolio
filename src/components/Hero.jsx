import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useLang } from '../i18n'
import { blurFilter, heroDolly } from '../motion/params'

// Types out a string character by character, then leaves a blinking cursor.
function Typewriter({ text, className = '', startDelay = 450, speed = 45 }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    setCount(0)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(text.length)
      return
    }
    let i = 0
    let interval
    const start = setTimeout(() => {
      interval = setInterval(() => {
        i += 1
        setCount(i)
        if (i >= text.length) clearInterval(interval)
      }, speed)
    }, startDelay)
    return () => {
      clearTimeout(start)
      clearInterval(interval)
    }
  }, [text, startDelay, speed])

  const done = count >= text.length
  return (
    <span className={className}>
      {text.slice(0, count)}
      <span
        className={done ? 'animate-blink' : ''}
        style={{ WebkitTextFillColor: 'var(--cursor)', color: 'var(--cursor)' }}
      >
        |
      </span>
    </span>
  )
}

export default function Hero() {
  const { t } = useLang()
  const [i, setI] = useState(0)
  const reduceMotion = useReducedMotion()
  const roles = t.hero.roles
  const ref = useRef(null)

  // Zoom moment 1 of 3: the first scroll out of the Hero. The Hero pushes past
  // the Visitor rather than sliding away, so the move reads as forward through
  // depth. The numbers are the motion module's, not this component's.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const scale = useTransform(scrollYProgress, (p) => heroDolly(p).scale)
  const opacity = useTransform(scrollYProgress, (p) => heroDolly(p).opacity)
  const y = useTransform(scrollYProgress, (p) => heroDolly(p).y)
  const filter = useTransform(scrollYProgress, (p) => blurFilter(heroDolly(p).blur))

  useEffect(() => {
    if (reduceMotion) return
    const id = setInterval(() => setI((v) => (v + 1) % roles.length), 2600)
    return () => clearInterval(id)
  }, [reduceMotion, roles.length])

  const dolly = reduceMotion ? {} : { scale, opacity, y, filter }

  return (
    <header
      id="top"
      ref={ref}
      className="relative z-[1] flex min-h-[86vh] items-center px-6 pb-24 pt-36 sm:px-10"
    >
      <motion.div
        className="mx-auto w-full max-w-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
      >
        <motion.div className="on-field" style={dolly}>
          {/* availability badge */}
          <div
            className="mb-7 inline-flex items-center gap-2.5 rounded-full px-3.5 py-1.5 font-mono text-[13px] backdrop-blur-sm"
            style={{
              background: 'var(--panel-glass)',
              border: '1px solid var(--tone-1-edge)',
              color: 'var(--ice)',
            }}
          >
            <span
              className="h-[7px] w-[7px] rounded-full"
              style={{ background: 'var(--ice)', boxShadow: '0 0 10px var(--dot-active-glow)' }}
            />
            {t.profile.available}
          </div>

          {/* title */}
          <h1 className="m-0 max-w-[14ch] font-display text-[clamp(44px,7vw,92px)] font-bold leading-[0.98] tracking-[-2.5px]">
            {t.profile.name}
            <Typewriter text={t.hero.line} className="text-gradient block" />
          </h1>

          {/* description with rotating focus word */}
          <p className="mt-5 max-w-[56ch] text-[clamp(17px,1.7vw,21px)] leading-relaxed text-mute">
            {t.hero.sentencePrefix}{' '}
            <span className="relative inline-grid">
              <AnimatePresence mode="wait">
                <motion.span
                  key={roles[i % roles.length]}
                  className="font-semibold text-ice [grid-area:1/1]"
                  initial={{ opacity: 0, y: 8, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -8, filter: 'blur(8px)' }}
                  transition={{ duration: reduceMotion ? 0 : 0.4, ease: 'easeOut' }}
                >
                  {roles[i % roles.length]}
                </motion.span>
              </AnimatePresence>
            </span>{' '}
            {t.hero.sentenceSuffix}
          </p>

          {/* CTAs — the Signal, and the only place a filled button appears */}
          <div className="mt-9 flex flex-wrap gap-3.5">
            <a
              href="#projects"
              className="lg-cta inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97]"
            >
              {t.hero.viewProjects}
            </a>
            <a
              href="#contact"
              className="lg-pill inline-flex items-center rounded-full px-7 py-3.5 text-[15px] font-semibold text-fg transition-all duration-200 active:scale-[0.97]"
            >
              {t.hero.getInTouch}
            </a>
          </div>
        </motion.div>
      </motion.div>

      {/* discreet scroll affordance */}
      <a
        href="#about"
        aria-label={t.hero.scrollLabel}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 md:block"
      >
        <span className="block h-10 w-px overflow-hidden" style={{ background: 'var(--edge)' }}>
          <span
            className="block h-4 w-px motion-safe:animate-scrolldrip"
            style={{ background: 'var(--ice)' }}
          />
        </span>
      </a>
    </header>
  )
}
