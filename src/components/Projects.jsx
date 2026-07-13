import { useRef, useState } from 'react'
import { useLang } from '../i18n'
import Reveal from './Reveal'
import ImageSlot from './ImageSlot'

// Renders the description, bolding the optional highlight phrase in green.
function Description({ text, highlight }) {
  if (!highlight || !text.includes(highlight)) {
    return <p className="m-0 mb-5 text-[15px] leading-[1.65] text-mute">{text}</p>
  }
  const [before, after] = text.split(highlight)
  return (
    <p className="m-0 mb-5 text-[15px] leading-[1.65] text-mute">
      {before}
      <strong className="font-semibold text-accent">{highlight}</strong>
      {after}
    </p>
  )
}

function ProjectCard({ project, idx }) {
  const { t } = useLang()
  const ref = useRef(null)
  const [glow, setGlow] = useState({ x: 50, y: 50, on: false })

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect()
    setGlow({ x: e.clientX - rect.left, y: e.clientY - rect.top, on: true })
  }

  return (
    <article
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={() => setGlow((g) => ({ ...g, on: false }))}
      className="glass-strong panel-glass-subtle group relative h-full overflow-hidden rounded-[18px] p-[30px] transition-all duration-300 hover:-translate-y-1.5 hover:border-accent/40 hover:shadow-[0_24px_60px_rgba(4,2,10,0.6)]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: glow.on ? 1 : 0,
          background: `radial-gradient(240px circle at ${glow.x}px ${glow.y}px, rgba(115,191,196,0.12), transparent 65%)`,
        }}
      />

      <div className="relative">
        <div className="mb-[18px] flex items-start justify-between">
          <span className="font-mono text-[40px] font-bold leading-none" style={{ color: 'rgba(115,191,196,0.3)' }}>
            {String(idx + 1).padStart(2, '0')}
          </span>
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-[7px] border border-white/[0.12] px-2.5 py-[5px] font-mono text-[13px] text-dim transition-colors hover:border-accent/40 hover:text-accent active:scale-[0.96]"
          >
            GitHub ↗
          </a>
        </div>

        <h3 className="m-0 mb-1.5 font-display text-[23px] font-bold">{project.title}</h3>
        <div className="mb-3.5 font-mono text-xs text-accent">{project.category}</div>

        {project.imageSlot && (
          <ImageSlot
            id={project.title}
            src={project.image}
            ariaLabel={t.projects.addScreenshot.replace('{title}', project.title)}
            radius={12}
            className="mb-4 h-[180px] w-full"
          />
        )}

        <Description text={project.description} highlight={project.highlight} />

        <div className="flex flex-wrap gap-1.5">
          {project.tech.map((t) => (
            <span key={t} className="rounded-md bg-white/[0.04] px-2.5 py-1 font-mono text-[11.5px] text-dim">
              {t}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}

export default function Projects() {
  const { t } = useLang()
  return (
    <section id="projects" className="relative z-[1] mx-auto max-w-content px-6 py-24 sm:px-10">
      <Reveal className="mb-11">
        <div>
          <div className="mono-label mb-3">{t.projects.label}</div>
          <h2 className="m-0 max-w-[20ch] font-display text-[clamp(28px,3.4vw,42px)] font-bold tracking-[-1px]">
            {t.projects.heading}
          </h2>
        </div>
      </Reveal>

      <div className="grid gap-5 md:grid-cols-2">
        {t.projects.items.map((project, idx) => (
          <Reveal key={project.title} delay={idx * 0.08} blur>
            <ProjectCard project={project} idx={idx} />
          </Reveal>
        ))}
      </div>
    </section>
  )
}
