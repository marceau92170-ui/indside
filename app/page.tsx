'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Nox from '@/components/Nox'
import { Settings, User } from 'lucide-react'

const SplashScreen = dynamic(() => import('@/components/SplashScreen'), { ssr: false })

export default function HomePage() {
  const router = useRouter()
  const [splashDone, setSplashDone] = useState(false)
  const [showSplash, setShowSplash] = useState(false)

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
          justifyContent: 'space-between',
          padding: '80px 24px 48px',
          background: 'linear-gradient(160deg, #1a0020 0%, #050508 50%, #1a0008 100%)',
          position: 'relative',
          overflow: 'hidden',
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
              fontSize: '1.1rem', cursor: 'pointer', color: '#fff',
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
              fontSize: '1.1rem', cursor: 'pointer', color: '#fff',
            }}
          >
            <User size={18} />
          </button>
        </div>

        {/* Hero section */}
        <motion.div
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center', zIndex: 1, flex: 1, justifyContent: 'center' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: splashDone ? 1 : 0, y: splashDone ? 0 : 16 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
        >
          {/* Big bold app name — Vakarm chunky logo style */}
          <div style={{
            fontSize: '4.5rem',
            fontWeight: 900,
            letterSpacing: '-0.04em',
            lineHeight: 1,
            color: '#fff',
            textAlign: 'center',
            textShadow: '4px 4px 0px rgba(255,0,110,0.5), 8px 8px 0px rgba(255,0,110,0.2)',
            textTransform: 'uppercase',
          }}>
            Flower
          </div>

          {/* Nox mascot with glow */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '8px 0' }}>
            <div style={{ position: 'absolute', width: '260px', height: '260px', borderRadius: '9999px', background: 'radial-gradient(circle, rgba(255,0,110,0.22) 0%, transparent 70%)', filter: 'blur(40px)' }} />
            <Nox emotion="curious" size={160} animate />
          </div>

          {/* Tagline */}
          <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'rgba(255,255,255,0.65)', textAlign: 'center', letterSpacing: '0.02em', margin: 0 }}>
            Ce que tes amis pensent vraiment.
          </p>
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
                width: '100%', padding: '22px',
                borderRadius: '9999px',
                background: '#fff',
                boxShadow: '0 12px 40px rgba(255,0,110,0.30)',
                fontWeight: 900, fontSize: '1.15rem',
                color: '#0a0a0a', letterSpacing: '-0.01em',
                textAlign: 'center',
              }}>
                Créer une partie
              </div>
            </Link>
          </motion.div>

          <motion.div whileTap={{ scale: 0.97 }}>
            <Link href="/join" style={{ textDecoration: 'none' }}>
              <div style={{
                width: '100%', padding: '20px',
                borderRadius: '9999px',
                background: 'rgba(255,255,255,0.08)',
                border: '2px solid rgba(255,255,255,0.20)',
                fontWeight: 800, fontSize: '1.05rem',
                color: 'rgba(255,255,255,0.85)', letterSpacing: '-0.01em',
                textAlign: 'center',
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
