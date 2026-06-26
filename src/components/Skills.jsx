import { skills } from '../data/content'
import Reveal from './Reveal'

const ICONS = {
  Languages: '💻',
  'Data & BI': '📊',
  'Machine Learning & AI': '🧠',
  'Web & GIS': '🗺️',
  'DevOps & Tools': '🛠️',
}

export default function Skills() {
  return (
    <section id="skills" className="relative mx-auto max-w-content px-6 py-16 sm:px-10">
      <Reveal className="mb-11">
        <div className="glass-soft inline-block rounded-2xl px-6 py-5">
          <div className="mono-label mb-3">
            // 02 — SKILLS &nbsp;·&nbsp;{' '}
            <span className="text-dim">the stack I think in →</span>
          </div>
          <h2 className="m-0 max-w-[18ch] font-display text-[clamp(28px,3.4vw,42px)] font-bold tracking-[-1px]">
            The stack I think in.
          </h2>
        </div>
      </Reveal>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((group, idx) => (
          <Reveal key={group.group} delay={idx * 0.06}>
            <div className="glass-strong h-full rounded-2xl p-6">
              <div className="mb-3.5 text-[22px]">{ICONS[group.group] || '⚙️'}</div>
              <h3 className="m-0 mb-4 font-display text-lg font-semibold">{group.group}</h3>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-md border border-cyan/[0.28] bg-cyan/[0.12] px-2.5 py-1.5 font-mono text-[12.5px] text-[#d4f6fa]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
