import { useEffect, useRef, useState } from 'react'
import { social } from '../data/content'
import { useLang } from '../i18n'
import Reveal from './Reveal'
import { MailIcon, CopyIcon, CheckIcon } from './icons'

export default function Contact() {
  const { t } = useLang()
  const [copied, setCopied] = useState(false)
  const resetTimer = useRef(0)

  useEffect(() => () => clearTimeout(resetTimer.current), [])

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(social.email)
      setCopied(true)
      clearTimeout(resetTimer.current)
      resetTimer.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable — the mailto button remains */
    }
  }

  return (
    <section id="contact" className="relative z-[1] mx-auto max-w-content px-6 pb-20 pt-24 sm:px-10">
      <Reveal>
        <div className="relative overflow-hidden px-8 py-16 text-center sm:px-12">
          <div
            className="pointer-events-none absolute left-1/2 top-[-40%] h-[500px] w-[500px] -translate-x-1/2"
            style={{ background: 'radial-gradient(circle, rgba(255,129,10,0.13), transparent 70%)' }}
          />
          <div className="relative">
            <div className="mono-label mb-4">{t.contact.label}</div>
            <h2 className="m-0 mb-5 font-display text-[clamp(30px,4vw,50px)] font-bold leading-[1.05] tracking-[-1.5px] [text-shadow:0_4px_50px_rgba(8,9,5,0.85)]">
              {t.contact.headingLines[0]}
              <br />
              {t.contact.headingLines[1]}
            </h2>
            <p className="mx-auto mb-8 max-w-[48ch] text-[17px] leading-relaxed text-mute [text-shadow:0_2px_24px_rgba(8,9,5,0.9)]">
              {t.contact.blurb}
            </p>
            <div className="flex flex-wrap justify-center gap-3.5">
              <a
                href={`mailto:${social.email}`}
                className="lg-cta inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_26px_rgba(255,129,10,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(255,129,10,0.48)] active:scale-[0.97]"
                style={{ backgroundColor: 'rgba(255,138,46,0.66)' }}
              >
                <MailIcon size={16} /> {social.email}
              </a>
              <button
                type="button"
                onClick={copyEmail}
                aria-live="polite"
                className="lg-pill inline-flex items-center gap-2 rounded-full px-5 py-3.5 text-[15px] font-semibold text-fg transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 active:scale-[0.97]"
              >
                {copied ? <CheckIcon size={15} className="text-accent" /> : <CopyIcon size={15} />}
                {copied ? t.contact.copied : t.contact.copyEmail}
              </button>
              <a
                href={social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="lg-pill inline-flex items-center gap-2.5 rounded-full px-6 py-3.5 text-[15px] font-semibold text-fg transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 active:scale-[0.97]"
              >
                GitHub
              </a>
              <a
                href={social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="lg-pill inline-flex items-center gap-2.5 rounded-full px-6 py-3.5 text-[15px] font-semibold text-fg transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 active:scale-[0.97]"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
        <footer className="mt-12 text-center font-mono text-[12px]" style={{ color: 'var(--fg8)' }}>
          © {new Date().getFullYear()} {t.profile.name}
        </footer>
      </Reveal>
    </section>
  )
}
