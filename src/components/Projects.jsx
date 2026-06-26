import { FaGithub } from 'react-icons/fa'
import { projects } from '../data/content'
import Reveal from './Reveal'

export default function Projects() {
  return (
    <section id="projects" className="relative mx-auto max-w-content px-6 py-20 sm:px-10">
      <Reveal className="mb-11">
        <div className="glass-soft inline-block rounded-2xl px-6 py-5">
          <div className="mono-label mb-3">// 03 — SELECTED WORK</div>
          <h2 className="m-0 max-w-[20ch] font-display text-[clamp(28px,3.4vw,42px)] font-bold tracking-[-1px]">
            Projects I&rsquo;m proud of.
          </h2>
        </div>
      </Reveal>

      <div className="grid gap-5 md:grid-cols-2">
        {projects.map((project, idx) => (
          <Reveal key={project.title} delay={idx * 0.08}>
            <article className="group relative h-full rounded-[18px] border border-white/[0.09] p-7 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-cyan/40 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]" style={{ background: 'rgba(12,19,32,0.88)' }}>
              <div className="mb-4 flex items-start justify-between">
                <span className="font-mono text-[40px] font-bold leading-none text-cyan/20">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <a
                  href={project.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-[7px] border border-white/[0.12] px-2.5 py-1.5 font-mono text-[13px] text-dim transition-colors hover:border-cyan/40 hover:text-cyan"
                >
                  <FaGithub size={13} /> GitHub ↗
                </a>
              </div>

              <h3 className="m-0 mb-1.5 font-display text-[23px] font-bold">{project.title}</h3>
              <div className="mb-3.5 font-mono text-xs text-cyan">{project.category}</div>

              <p className="m-0 mb-5 text-[15px] leading-[1.65] text-mute">
                {project.description}
              </p>

              {project.metric && (
                <div className="mb-4 inline-flex items-baseline gap-2 rounded-lg border border-cyan/25 bg-cyan/[0.1] px-3 py-1.5">
                  <span className="font-display text-base font-bold text-cyan">
                    {project.metric.value}
                  </span>
                  <span className="font-mono text-[11px] text-dim">{project.metric.label}</span>
                </div>
              )}

              <div className="flex flex-wrap gap-1.5">
                {project.tech.map((t) => (
                  <span
                    key={t}
                    className="rounded-md bg-white/[0.04] px-2.5 py-1 font-mono text-[11.5px] text-dim"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
