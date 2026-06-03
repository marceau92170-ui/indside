'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const SplashScreen = dynamic(() => import('@/components/SplashScreen'), { ssr: false })

export default function HomePage() {
  const router = useRouter()
  const [splashDone, setSplashDone] = useState(false)
  const [showSplash, setShowSplash] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem('inside_splash_seen')
    if (!seen) {
      setShowSplash(true)
      localStorage.setItem('inside_splash_seen', '1')
    } else {
      setSplashDone(true)
    }
  }, [])

  const handleSplashComplete = () => {
    setShowSplash(false)
    setSplashDone(true)
  }

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      <motion.div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
          background: '#08080f',
          position: 'relative',
          overflow: 'hidden',
          gap: '0',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: splashDone ? 1 : 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {/* Top nav icons */}
        <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '8px', zIndex: 2 }}>
          <button
            onClick={() => router.push('/settings')}
            style={{
              width: '40px', height: '40px', borderRadius: '14px',
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', cursor: 'pointer',
            }}
          >
            ⚙️
          </button>
          <button
            onClick={() => router.push('/profile')}
            style={{
              width: '40px', height: '40px', borderRadius: '14px',
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', cursor: 'pointer',
            }}
          >
            👤
          </button>
        </div>

        {/* Background glow */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '400px', height: '400px', borderRadius: '9999px', background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)', filter: 'blur(60px)' }} />
          <div style={{ position: 'absolute', bottom: '-80px', left: '50%', transform: 'translateX(-50%)', width: '360px', height: '360px', borderRadius: '9999px', background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        </div>

        {/* Hero section */}
        <motion.div
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', textAlign: 'center', zIndex: 1, marginBottom: '56px' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: splashDone ? 1 : 0, y: splashDone ? 0 : 16 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
        >
          <motion.div
            style={{
              width: '72px', height: '72px', borderRadius: '22px',
              background: 'linear-gradient(135deg, #8b5cf6, #a855f7, #ec4899)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.8rem', fontWeight: 900, color: 'white',
              boxShadow: '0 20px 50px rgba(168,85,247,0.45)',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            I
          </motion.div>
          <div>
            <h1 style={{
              fontSize: '3.5rem', fontWeight: 900, lineHeight: 1, margin: 0,
              background: 'linear-gradient(135deg, #a855f7, #c084fc, #ec4899)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              Inside
            </h1>
            <p style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(240,240,245,0.55)', marginTop: '10px', lineHeight: 1.5, maxWidth: '260px' }}>
              Crée des expériences uniques avec tes amis.
            </p>
          </div>
        </motion.div>

        {/* Buttons */}
        <motion.div
          style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', maxWidth: '340px', zIndex: 1 }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: splashDone ? 1 : 0, y: splashDone ? 0 : 16 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
        >
          <motion.div whileTap={{ scale: 0.97 }}>
            <Link href="/create" style={{ textDecoration: 'none' }}>
              <div style={{
                width: '100%', padding: '20px', borderRadius: '20px', textAlign: 'center',
                background: 'linear-gradient(135deg, #8b5cf6, #a855f7, #ec4899)',
                boxShadow: '0 12px 40px rgba(139,92,246,0.35)',
                fontWeight: 800, fontSize: '1.1rem', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              }}>
                <span>✨</span> Créer une expérience
              </div>
            </Link>
          </motion.div>

          <motion.div whileTap={{ scale: 0.97 }}>
            <Link href="/join" style={{ textDecoration: 'none' }}>
              <div style={{
                width: '100%', padding: '20px', borderRadius: '20px', textAlign: 'center',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                fontWeight: 700, fontSize: '1.05rem', color: 'rgba(240,240,245,0.85)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              }}>
                <span>🚪</span> Rejoindre une salle
              </div>
            </Link>
          </motion.div>
        </motion.div>

        <motion.p
          style={{ fontSize: '11px', color: 'rgba(240,240,245,0.22)', marginTop: '32px', zIndex: 1 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: splashDone ? 1 : 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          Sans compte · 100% privé · Gratuit
        </motion.p>
      </motion.div>
    </>
  )
}
