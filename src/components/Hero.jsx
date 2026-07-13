import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useLang } from '../i18n'

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
      <span className={done ? 'animate-blink' : ''} style={{ WebkitTextFillColor: '#ff9138', color: '#ff9138' }}>|</span>
    </span>
  )
}

export default function Hero() {
  const { t } = useLang()
  const [i, setI] = useState(0)
  const reduceMotion = useReducedMotion()
  const roles = t.hero.roles

  useEffect(() => {
    if (reduceMotion) return
    const id = setInterval(() => setI((v) => (v + 1) % roles.length), 2600)
    return () => clearInterval(id)
  }, [reduceMotion, roles.length])

  return (
    <header id="top" className="relative z-[1] flex min-h-[86vh] items-center px-6 pb-24 pt-36 sm:px-10">
      <motion.div
        className="mx-auto w-full max-w-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
      >
        {/* availability badge */}
        <div
          className="mb-7 inline-flex items-center gap-2.5 rounded-full px-3.5 py-1.5 font-mono text-[13px] text-accent backdrop-blur-sm"
          style={{ background: 'rgba(16,22,35,0.5)', border: '1px solid rgba(115,191,196,0.35)' }}
        >
          <span className="h-[7px] w-[7px] rounded-full bg-accent shadow-[0_0_10px_#73bfc4]" />
          {t.profile.available}
        </div>

        {/* title */}
        <h1 className="m-0 max-w-[14ch] font-display text-[clamp(44px,7vw,92px)] font-bold leading-[0.98] tracking-[-2.5px] [text-shadow:0_4px_50px_rgba(8,9,5,0.85)]">
          {t.profile.name}
          <Typewriter text={t.hero.line} className="text-gradient block" />
        </h1>

        {/* description with rotating focus word */}
        <p className="mt-5 max-w-[56ch] text-[clamp(17px,1.7vw,21px)] leading-relaxed text-mute [text-shadow:0_2px_24px_rgba(8,9,5,0.9)]">
          {t.hero.sentencePrefix}{' '}
          <span className="relative inline-grid">
            <AnimatePresence mode="wait">
              <motion.span
                key={roles[i % roles.length]}
                className="font-semibold text-accent [grid-area:1/1]"
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

        {/* CTAs */}
        <div className="mt-9 flex flex-wrap gap-3.5">
          <a
            href="#projects"
            className="lg-cta inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_26px_rgba(255,129,10,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(255,129,10,0.48)] active:scale-[0.97]"
            style={{ backgroundColor: 'rgba(255,138,46,0.66)' }}
          >
            {t.hero.viewProjects}
          </a>
          <a
            href="#contact"
            className="lg-pill inline-flex items-center rounded-full px-7 py-3.5 text-[15px] font-semibold text-fg transition-all duration-200 hover:bg-white/10 active:scale-[0.97]"
          >
            {t.hero.getInTouch}
          </a>
        </div>
      </motion.div>

      {/* discreet scroll affordance */}
      <a
        href="#about"
        aria-label={t.hero.scrollLabel}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 md:block"
      >
        <span className="block h-10 w-px overflow-hidden bg-white/10">
          <span className="block h-4 w-px bg-accent/80 motion-safe:animate-scrolldrip" />
        </span>
      </a>
    </header>
  )
}
