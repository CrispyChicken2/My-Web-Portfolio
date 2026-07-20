import { useLang } from '../i18n'
import Reveal from './Reveal'
import ImageSlot from './ImageSlot'
import { BriefcaseIcon, CapIcon, ZapIcon } from './icons'

const TAG_ICONS = { briefcase: BriefcaseIcon, cap: CapIcon, zap: ZapIcon }

export default function About() {
  const { t } = useLang()
  const initials = t.profile.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <section id="about" className="relative z-[1] mx-auto max-w-content px-6 py-24 sm:px-10">
      <div className="grid items-center gap-12 lg:grid-cols-[1.4fr_1fr]">
        <Reveal blur>
          <div className="glass panel-solid relative overflow-hidden rounded-[20px] p-9">
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
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-[13px]"
                    style={{ color: 'var(--fg2)' }}
                  >
                    {Icon && <Icon size={14} className="text-accent" />}
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
                  background: 'linear-gradient(135deg, rgba(115,191,196,0.28), rgba(255,129,10,0.2))',
                  transform: 'rotate(-4deg)',
                }}
              />
              <ImageSlot
                src="/assets/profile.webp"
                alt={t.about.photoAlt}
                radius={20}
                className="absolute inset-0 h-full w-full"
                placeholder={<span className="font-display text-[84px] font-bold text-gradient">{initials}</span>}
              />
              <div
                className="absolute -bottom-4 -right-4 animate-floaty rounded-[14px] border border-white/[0.14] p-3.5 font-mono shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
                style={{ background: 'var(--win)' }}
              >
                <div className="text-[11px]" style={{ color: 'var(--fg5)' }}>{t.about.exploring}</div>
                <div className="text-sm font-semibold text-accent">{t.about.exploringWhat}</div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
