'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Nox from '@/components/Nox'
import { getTheme, gradient, gradientShadow } from '@/lib/theme'
import { Settings, User } from 'lucide-react'

const SplashScreen = dynamic(() => import('@/components/SplashScreen'), { ssr: false })

export default function HomePage() {
  const router = useRouter()
  const [splashDone, setSplashDone] = useState(false)
  const [showSplash, setShowSplash] = useState(false)

  const theme = getTheme()
  const grad = gradient(theme)
  const shadow = gradientShadow(theme)

  useEffect(() => {
    const seen = localStorage.getItem('flower_splash_seen')
    if (!seen) {
      setShowSplash(true)
      localStorage.setItem('flower_splash_seen', '1')
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
            <Settings size={18} />
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
            <User size={18} />
          </button>
        </div>

        {/* Background glow */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '400px', height: '400px', borderRadius: '9999px', background: `radial-gradient(circle, ${theme.glowFrom} 0%, transparent 70%)`, filter: 'blur(60px)' }} />
          <div style={{ position: 'absolute', bottom: '-80px', left: '50%', transform: 'translateX(-50%)', width: '360px', height: '360px', borderRadius: '9999px', background: `radial-gradient(circle, ${theme.glowTo} 0%, transparent 70%)`, filter: 'blur(60px)' }} />
        </div>

        {/* Hero section */}
        <motion.div
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center', zIndex: 1, marginBottom: '56px' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: splashDone ? 1 : 0, y: splashDone ? 0 : 16 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: splashDone ? 1 : 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', width: '180px', height: '180px', borderRadius: '9999px', background: 'radial-gradient(circle, rgba(255,0,110,0.18) 0%, transparent 70%)', filter: 'blur(30px)' }} />
              <Nox emotion="curious" size={120} animate />
            </div>
          </motion.div>
          <div>
            <h1 style={{
              fontSize: '4rem', fontWeight: 900, lineHeight: 1, margin: 0,
              background: grad,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              marginTop: '8px',
            }}>
              Flower
            </h1>
            <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'rgba(240,240,245,0.45)', marginTop: '10px', lineHeight: 1.5, fontStyle: 'italic' }}>
              Entre amis.
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
                background: grad,
                boxShadow: shadow,
                fontWeight: 800, fontSize: '1.1rem', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                Créer
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
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                Rejoindre
              </div>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  )
}
