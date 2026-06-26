import { experiences, education } from '../data/content'
import Reveal from './Reveal'

const items = [
  ...experiences.map((e) => ({
    period: e.period,
    role: e.role,
    org: e.company,
    note: e.description,
    active: true,
  })),
  ...education.map((e) => ({
    period: e.period,
    role: e.role,
    org: e.org,
    note: e.note,
    active: false,
  })),
]

export default function Experience() {
  return (
    <section id="experience" className="relative mx-auto max-w-content px-6 py-20 sm:px-10">
      <Reveal className="mb-11">
        <div className="glass-soft inline-block rounded-2xl px-6 py-5">
          <div className="mono-label mb-3">// 04 — EXPERIENCE &amp; EDUCATION</div>
          <h2 className="m-0 max-w-[20ch] font-display text-[clamp(28px,3.4vw,42px)] font-bold tracking-[-1px]">
            The path so far.
          </h2>
        </div>
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, idx) => (
          <Reveal key={idx} delay={idx * 0.1}>
            <div
              className={`relative h-full rounded-r-2xl p-5 backdrop-blur-md ${
                item.active ? 'border-l-2 border-cyan/45' : 'border-l-2 border-white/[0.12]'
              }`}
              style={{ background: 'rgba(12,19,32,0.82)' }}
            >
              <span
                className={`absolute -left-[7px] top-6 h-3 w-3 rounded-full ${
                  item.active ? 'bg-cyan shadow-[0_0_12px_rgba(34,211,238,0.6)]' : 'bg-[#4b5667]'
                }`}
              />
              <div
                className={`mb-1.5 font-mono text-xs ${item.active ? 'text-cyan' : 'text-[#7a8698]'}`}
              >
                {item.period}
              </div>
              <h3 className="m-0 mb-1 font-display text-[19px] font-semibold">{item.role}</h3>
              <div className="mb-2.5 text-sm text-dim">{item.org}</div>
              <p className="m-0 text-[14.5px] leading-[1.6] text-mute">{item.note}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
