import { motion } from 'framer-motion'
import { useLang } from '../i18n'
import Reveal from './Reveal'

export default function Experience() {
  const { t } = useLang()
  return (
    <section id="experience" className="relative z-[1] mx-auto max-w-content px-6 py-24 sm:px-10">
      <Reveal className="mb-11">
        <div>
          <div className="mono-label mb-3">{t.experience.label}</div>
          <h2 className="m-0 max-w-[20ch] font-display text-[clamp(28px,3.4vw,42px)] font-bold tracking-[-1px]">
            {t.experience.heading}
          </h2>
        </div>
      </Reveal>

      <motion.div
        className="grid gap-4 sm:grid-cols-2"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
        variants={{ show: { transition: { staggerChildren: 0.18 } } }}
      >
        {t.experience.items.map((item, idx) => (
          <motion.div
            key={idx}
            className="glass panel-glass relative h-full overflow-hidden rounded-r-2xl p-5 pl-6"
            variants={{
              hidden: { opacity: 0, y: 18 },
              show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] } },
            }}
          >
            {/* drawing accent line */}
            <motion.span
              className="absolute left-0 top-0 w-[2px] origin-top"
              style={{ height: '100%', background: item.active ? 'rgba(115,191,196,0.45)' : 'rgba(238,241,246,0.12)' }}
              variants={{ hidden: { scaleY: 0 }, show: { scaleY: 1, transition: { duration: 0.6, ease: 'easeOut' } } }}
            />
            {/* node dot */}
            <motion.span
              className="absolute -left-[6px] top-6 h-3 w-3 rounded-full"
              style={item.active
                ? { background: '#73bfc4', boxShadow: '0 0 12px rgba(115,191,196,0.6)' }
                : { background: '#4e5666' }}
              variants={{
                hidden: { scale: 0, opacity: 0 },
                show: { scale: 1, opacity: 1, transition: { delay: 0.3, type: 'spring', stiffness: 400, damping: 18 } },
              }}
            />
            <div className="mb-1.5 font-mono text-xs" style={{ color: item.active ? '#73bfc4' : '#8e97a8' }}>
              {item.period}
            </div>
            <h3 className="m-0 mb-1 font-display text-[19px] font-semibold">{item.role}</h3>
            <div className="mb-2.5 text-sm text-dim">{item.org}</div>
            <p className="m-0 text-[14.5px] leading-[1.6] text-mute">{item.note}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
