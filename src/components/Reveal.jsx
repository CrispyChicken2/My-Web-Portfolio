import { motion } from 'framer-motion'

// Calm one-shot reveal: a gentle fade + lift (and optional blur-to-clear) as
// the block enters the viewport.
export default function Reveal({ children, delay = 0, blur = false, className = '' }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18, filter: blur ? 'blur(8px)' : 'blur(0px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  )
}
