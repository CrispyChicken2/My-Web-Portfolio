import { useEffect, useState } from 'react'
import { profile, heroLine, focusWords, stats } from '../data/content'

export default function Hero() {
  const [i, setI] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % focusWords.length), 2200)
    return () => clearInterval(id)
  }, [])

  return (
    <header
      id="top"
      className="relative flex min-h-screen items-center px-6 pb-20 pt-32 sm:px-10"
    >
      <div className="mx-auto w-full max-w-content">
        {/* availability badge */}
        <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-cyan/30 px-3.5 py-1.5 font-mono text-[13px] text-cyan backdrop-blur-sm" style={{ background: 'rgba(12,19,32,0.5)' }}>
          <span className="h-[7px] w-[7px] rounded-full bg-cyan shadow-[0_0_10px_#22d3ee]" />
          {profile.available}
        </div>

        {/* title */}
        <h1 className="m-0 max-w-[14ch] font-display text-[clamp(44px,7vw,92px)] font-bold leading-[0.98] tracking-[-2.5px]">
          {profile.name}
          <span className="text-gradient block">{heroLine}</span>
        </h1>

        {/* description with rotating focus word */}
        <p className="mt-6 max-w-[56ch] text-[clamp(17px,1.7vw,21px)] leading-relaxed text-mute">
          Final-year engineering student in Data &amp; AI, currently deep in{' '}
          <span className="font-semibold text-cyan">{focusWords[i]}</span> — I turn messy
          data into models that ship, across pipelines, prediction and quantitative finance.
        </p>

        {/* CTAs */}
        <div className="mt-9 flex flex-wrap gap-3.5">
          <a
            href="#projects"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan px-6 py-3.5 text-[15px] font-semibold text-void shadow-[0_8px_26px_rgba(34,211,238,0.26)] transition-transform duration-200 hover:-translate-y-0.5"
          >
            View Projects →
          </a>
          <a
            href="#contact"
            className="inline-flex items-center rounded-xl border border-white/[0.14] bg-white/5 px-6 py-3.5 text-[15px] font-semibold text-fg backdrop-blur-sm transition-colors duration-200 hover:bg-white/10"
          >
            Get in touch
          </a>
        </div>

        {/* stats */}
        <div className="mt-14 flex flex-wrap gap-11">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="font-display text-[30px] font-bold text-gold">{s.value}</div>
              <div className="mt-0.5 font-mono text-[12px] tracking-[0.5px] text-faint">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* scroll cue */}
      <div className="absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2">
        <span className="font-mono text-[11px] tracking-[1px] text-faint">
          SCROLL TO DIVE IN
        </span>
        <span className="flex h-9 w-[22px] justify-center rounded-[14px] border-2 border-white/20 pt-[7px]">
          <span className="h-2 w-1 rounded-full bg-cyan animate-scrollcue" />
        </span>
      </div>
    </header>
  )
}
