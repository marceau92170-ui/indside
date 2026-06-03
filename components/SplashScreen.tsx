'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Props {
  onComplete: () => void
}

export default function SplashScreen({ onComplete }: Props) {
  const [phase, setPhase] = useState<0 | 1 | 2>(0)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 650)
    const t2 = setTimeout(() => setPhase(2), 1500)
    const t3 = setTimeout(onComplete, 1800)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onComplete])

  return (
    <motion.div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '28px',
        background: 'radial-gradient(ellipse at 50% 40%, rgba(88,28,220,0.25) 0%, transparent 65%), radial-gradient(ellipse at 30% 70%, rgba(30,27,90,0.35) 0%, transparent 60%), #08080f',
      }}
      animate={{ opacity: phase === 2 ? 0 : 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <motion.div
        style={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          borderRadius: '9999px',
          background: 'radial-gradient(circle, rgba(139,92,246,0.30) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #8b5cf6, #a855f7, #ec4899)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          fontWeight: 900,
          color: 'white',
          boxShadow: '0 24px 60px rgba(139,92,246,0.45), 0 0 0 1px rgba(255,255,255,0.08)',
          position: 'relative',
          zIndex: 1,
        }}
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        I
      </motion.div>

      <motion.div
        style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative', zIndex: 1 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 10 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <h1
          style={{
            fontSize: '2.8rem',
            fontWeight: 900,
            lineHeight: 1,
            background: 'linear-gradient(135deg, #a855f7, #c084fc, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Inside
        </h1>
        <motion.p
          style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(240,240,245,0.55)', maxWidth: '240px' }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 8 }}
          transition={{ duration: 0.45, delay: 0.15, ease: 'easeOut' }}
        >
          Découvre ce que ton groupe cache vraiment.
        </motion.p>
      </motion.div>
    </motion.div>
  )
}
