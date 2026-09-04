import { useLang } from '../i18n'
import Reveal from './Reveal'
import { CpuIcon, ChartIcon, CodeIcon, TerminalIcon, GlobeIcon } from './icons'

const ICONS = {
  cpu: CpuIcon,
  chart: ChartIcon,
  code: CodeIcon,
  terminal: TerminalIcon,
  globe: GlobeIcon,
}

// A Group's Tone is a step on the cold scale. The Tones differ by depth and
// intensity, never by hue, so the Groups are distinguishable at a glance
// without any of them reading as more important than the others — and none of
// them is ever the Signal.
const TAG_TONE = {
  green: {
    background: 'var(--tone-1-bg)',
    border: '1px solid var(--tone-1-edge)',
    color: 'var(--tone-1-fg)',
  },
  olive: {
    background: 'var(--tone-2-bg)',
    border: '1px solid var(--tone-2-edge)',
    color: 'var(--tone-2-fg)',
  },
  neutral: {
    background: 'var(--tone-3-bg)',
    border: '1px solid var(--tone-3-edge)',
    color: 'var(--tone-3-fg)',
  },
}

// Varied column spans (out of 6) so the groups form an asymmetric mosaic
// instead of a uniform grid of identical tiles — first row takes the two
// widest groups, second row the three narrower ones.
const SPAN = ['lg:col-span-3', 'lg:col-span-3', 'lg:col-span-2', 'lg:col-span-2', 'lg:col-span-2']

export default function Skills() {
  const { t } = useLang()
  return (
    <section id="skills" className="relative z-[1] mx-auto max-w-content px-6 py-24 sm:px-10">
      <Reveal className="mb-11">
        <div className="on-field">
          <div className="mono-label mb-3">{t.skills.label}</div>
          <h2 className="m-0 max-w-[18ch] font-display text-[clamp(28px,3.4vw,42px)] font-bold tracking-[-1px]">
            {t.skills.heading}
          </h2>
        </div>
      </Reveal>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
        {t.skills.groups.map((group, idx) => {
          const Icon = ICONS[group.icon] || CpuIcon
          return (
          <Reveal key={group.group} delay={idx * 0.06} blur className={SPAN[idx % SPAN.length]}>
            <div className="glass-strong panel-glass h-full rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-ice/30">
              <div
                className="mb-3.5 grid h-9 w-9 place-items-center rounded-lg text-ice"
                style={{ border: '1px solid var(--edge)', background: 'var(--surf-1)' }}
              >
                <Icon size={18} />
              </div>
              <h3 className="m-0 mb-4 font-display text-lg font-semibold">{group.group}</h3>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-[7px] px-2.5 py-1.5 font-mono text-[12.5px]"
                    style={TAG_TONE[group.tone] || TAG_TONE.neutral}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
          )
        })}
      </div>
    </section>
  )
}
