import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useLang } from '../i18n'
import Reveal from './Reveal'
import ImageSlot from './ImageSlot'
import { BriefcaseIcon, CapIcon, ZapIcon } from './icons'
import { aboutArrival, blurFilter, imageResolve } from '../motion/params'

const TAG_ICONS = { briefcase: BriefcaseIcon, cap: CapIcon, zap: ZapIcon }

// Zoom moment 3 of 3: the site's one photograph resolves as it enters — it
// arrives slightly too large and out of focus, and settles.
function Portrait({ src, alt, placeholder }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] })

  const scale = useTransform(scrollYProgress, (p) => imageResolve(p).scale)
  const opacity = useTransform(scrollYProgress, (p) => imageResolve(p).opacity)
  const filter = useTransform(scrollYProgress, (p) => blurFilter(imageResolve(p).blur))

  return (
    <motion.div
      ref={ref}
      className="absolute inset-0"
      style={reduce ? undefined : { scale, opacity, filter }}
    >
      <ImageSlot
        src={src}
        alt={alt}
        radius={20}
        tone={1}
        className="h-full w-full"
        placeholder={placeholder}
      />
    </motion.div>
  )
}

export default function About() {
  const { t } = useLang()
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const initials = t.profile.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  // Zoom moment 2 of 3: About arrives from behind the departing Hero, so the
  // Visitor's first scroll reads as travelling forward rather than panning.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start center'] })
  const scale = useTransform(scrollYProgress, (p) => aboutArrival(p).scale)
  const opacity = useTransform(scrollYProgress, (p) => aboutArrival(p).opacity)
  const y = useTransform(scrollYProgress, (p) => aboutArrival(p).y)

  return (
    <section id="about" ref={ref} className="relative z-[1] px-6 py-24 sm:px-10">
      <motion.div
        className="mx-auto max-w-content"
        style={reduce ? undefined : { scale, opacity, y }}
      >
        <div className="grid items-center gap-12 lg:grid-cols-[1.4fr_1fr]">
          <Reveal blur>
            <div className="on-field">
              <div className="mono-label mb-4">{t.about.label}</div>
              <h2 className="m-0 mb-5 font-display text-[clamp(28px,3.4vw,42px)] font-bold leading-tight tracking-[-1px]">
                {t.about.heading}
              </h2>
              <div className="space-y-4 text-[17px] leading-[1.75] text-mute">
                {t.about.paragraphs.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                {t.about.tags.map((tag) => {
                  const Icon = TAG_ICONS[tag.icon]
                  return (
                    <span
                      key={tag.label}
                      className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 font-mono text-[13px] backdrop-blur-sm"
                      style={{
                        border: '1px solid var(--edge)',
                        background: 'var(--surf-1)',
                        color: 'var(--fg2)',
                      }}
                    >
                      {Icon && <Icon size={14} className="text-ice" />}
                      {tag.label}
                    </span>
                  )
                })}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.15} blur>
            <div className="flex justify-center">
              <div className="relative h-[340px] w-[280px]">
                <div
                  className="absolute inset-0 rounded-[20px]"
                  style={{
                    background: 'linear-gradient(135deg, var(--tone-1-bg), var(--tone-3-bg))',
                    border: '1px solid var(--tone-3-edge)',
                    transform: 'rotate(-4deg)',
                  }}
                />
                <Portrait
                  src="/assets/profile.webp"
                  alt={t.about.photoAlt}
                  placeholder={
                    <span className="text-gradient font-display text-[84px] font-bold">
                      {initials}
                    </span>
                  }
                />
                <div
                  className="absolute -bottom-4 -right-4 animate-floaty rounded-[14px] p-3.5 font-mono"
                  style={{
                    background: 'var(--win)',
                    border: '1px solid var(--edge-strong)',
                    boxShadow: '0 16px 40px var(--shadow-deep)',
                  }}
                >
                  <div className="text-[11px]" style={{ color: 'var(--fg5)' }}>
                    {t.about.exploring}
                  </div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--ice)' }}>
                    {t.about.exploringWhat}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </motion.div>
    </section>
  )
}
