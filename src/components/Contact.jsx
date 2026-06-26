import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa'
import { social, profile } from '../data/content'
import Reveal from './Reveal'

export default function Contact() {
  return (
    <section id="contact" className="relative mx-auto max-w-content px-6 py-16 sm:px-10">
      <Reveal>
        <div className="glass relative overflow-hidden rounded-[24px] px-8 py-16 text-center sm:px-12">
          <div
            className="pointer-events-none absolute left-1/2 top-[-40%] h-[500px] w-[500px] -translate-x-1/2"
            style={{
              background: 'radial-gradient(circle, rgba(34,211,238,0.16), transparent 70%)',
            }}
          />
          <div className="relative">
            <div className="mono-label mb-4">// 05 — LET&rsquo;S TALK</div>
            <h2 className="m-0 mb-5 font-display text-[clamp(30px,4vw,50px)] font-bold leading-[1.05] tracking-[-1.5px]">
              Let&rsquo;s build something
              <br />
              that learns.
            </h2>
            <p className="mx-auto mb-8 max-w-[48ch] text-[17px] leading-relaxed text-mute">
              I&rsquo;m looking for Data / ML / Quant internships and graduate roles. My inbox
              is always open — say hello.
            </p>
            <div className="flex flex-wrap justify-center gap-3.5">
              <a
                href={`mailto:${social.email}`}
                className="inline-flex items-center gap-2.5 rounded-xl bg-cyan px-7 py-3.5 text-[15px] font-semibold text-void shadow-[0_8px_26px_rgba(34,211,238,0.28)] transition-transform duration-200 hover:-translate-y-0.5"
              >
                <FaEnvelope size={16} /> {social.email}
              </a>
              <a
                href={social.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 rounded-xl border border-white/[0.16] bg-white/5 px-6 py-3.5 text-[15px] font-semibold text-fg transition-colors duration-200 hover:bg-white/10"
              >
                <FaGithub size={16} /> GitHub
              </a>
              <a
                href={social.linkedin}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 rounded-xl border border-white/[0.16] bg-white/5 px-6 py-3.5 text-[15px] font-semibold text-fg transition-colors duration-200 hover:bg-white/10"
              >
                <FaLinkedin size={16} /> LinkedIn
              </a>
            </div>
          </div>
        </div>
        <div className="mt-10 text-center font-mono text-[13px] text-[#4b5667]">
          © {new Date().getFullYear()} {profile.name} · built with React, Tailwind &amp; Framer
          Motion
        </div>
      </Reveal>
    </section>
  )
}
