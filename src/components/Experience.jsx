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
        className="relative mx-auto max-w-[720px]"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
        variants={{ show: { transition: { staggerChildren: 0.18 } } }}
      >
        {/* one continuous line runs the length of the whole timeline */}
        <div className="absolute bottom-2 left-[5px] top-2 w-px bg-white/10" aria-hidden="true" />

        <div className="flex flex-col gap-10">
          {t.experience.items.map((item, idx) => (
            <motion.div
              key={idx}
              className="relative pl-8"
              variants={{
                hidden: { opacity: 0, y: 18 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] } },
              }}
            >
              {/* node dot, sitting on the shared line */}
              <motion.span
                className="absolute left-0 top-[6px] h-[11px] w-[11px] rounded-full"
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
        </div>
      </motion.div>
    </section>
  )
}
