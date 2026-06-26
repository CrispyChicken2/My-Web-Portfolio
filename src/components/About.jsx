import { about, aboutTags, profile } from '../data/content'
import Reveal from './Reveal'

const initials = (profile.name || 'OH')
  .split(' ')
  .map((w) => w[0])
  .join('')
  .slice(0, 2)
  .toUpperCase()

export default function About() {
  return (
    <section id="about" className="relative mx-auto max-w-content px-6 py-24 sm:px-10">
      <div className="grid items-center gap-12 lg:grid-cols-[1.4fr_1fr]">
        <Reveal>
          <div className="glass rounded-3xl p-9">
            <div className="mono-label mb-4">// 01 — ABOUT</div>
            <h2 className="m-0 mb-5 font-display text-[clamp(28px,3.4vw,42px)] font-bold leading-tight tracking-[-1px]">
              From raw data to shipped models.
            </h2>
            <div className="space-y-4 text-[17px] leading-[1.75] text-mute">
              {about.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              {aboutTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-[13px] text-[#cdd6e3]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="flex justify-center">
            <div className="relative h-[340px] w-[280px]">
              <div
                className="absolute inset-0 rounded-3xl"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(34,211,238,0.3), rgba(129,140,248,0.24))',
                  transform: 'rotate(-4deg)',
                }}
              />
              <div className="glass-strong absolute inset-0 grid place-items-center rounded-3xl">
                <span className="font-display text-[88px] font-bold text-gradient">
                  {initials}
                </span>
              </div>
              <div className="absolute -bottom-4 -right-4 animate-floaty rounded-[14px] border border-white/[0.14] p-3.5 font-mono shadow-[0_16px_40px_rgba(0,0,0,0.5)]" style={{ background: '#101826' }}>
                <div className="text-[11px] text-[#7a8698]">currently exploring</div>
                <div className="text-sm font-semibold text-cyan">▸ quantitative finance</div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
