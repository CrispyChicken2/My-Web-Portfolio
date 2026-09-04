import { lazy, Suspense } from 'react'
import { MotionConfig, motion, useScroll, useSpring } from 'framer-motion'
import { useLang } from './i18n'
import FlatBackdrop from './components/FlatBackdrop'
import Nav from './components/Nav'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Projects from './components/Projects'
import Experience from './components/Experience'
import Contact from './components/Contact'

// The Backdrop ships as a separate chunk so first paint is never blocked on it.
const ShaderBackdrop = lazy(() => import('./components/ShaderBackdrop'))

export default function App() {
  const { t } = useLang()
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })

  return (
    // reducedMotion="user" makes every framer-motion animation respect the
    // visitor's prefers-reduced-motion setting.
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen bg-void text-fg">
        {/* Skip link */}
        <a
          href="#about"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-ice focus:px-4 focus:py-2 focus:text-void"
        >
          {t.nav.skipLink}
        </a>

        {/* Scroll progress */}
        <motion.div
          aria-hidden="true"
          className="fixed inset-x-0 top-0 z-[55] h-[2.5px] origin-left"
          style={{ scaleX, background: 'var(--progress)' }}
        />

        <Suspense fallback={<FlatBackdrop />}>
          <ShaderBackdrop />
        </Suspense>
        <Nav />

        <main className="relative z-10">
          <Hero />
          <About />
          <Skills />
          <Projects />
          <Experience />
          <Contact />
        </main>
      </div>
    </MotionConfig>
  )
}
