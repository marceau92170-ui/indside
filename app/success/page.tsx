'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function SuccessPage() {
  const router = useRouter()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    localStorage.setItem('inside_premium', 'true')
    setVisible(true)
  }, [])

  const unlockedFeatures = [
    { emoji: '♾️', label: 'Questions illimitées' },
    { emoji: '👥', label: 'Joueurs illimités' },
    { emoji: '🎭', label: 'Templates premium débloqués' },
    { emoji: '🏅', label: 'Badges avancés' },
    { emoji: '📊', label: 'Résultats détaillés' },
  ]

  return (
    <div className="min-h-screen flex flex-col px-6 py-12 gap-6 items-center relative overflow-hidden" style={{ background: '#08080f' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.30) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.22) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <motion.div
        className="relative z-10 flex flex-col items-center gap-8 w-full max-w-sm"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 30 }}
        transition={{ duration: 0.5 }}
      >
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: visible ? 1 : 0 }}
          transition={{ duration: 0.5, delay: 0.1, type: 'spring', stiffness: 200 }}
          className="w-28 h-28 rounded-3xl flex items-center justify-center text-5xl"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #a855f7, #ec4899)', boxShadow: '0 24px 64px rgba(168,85,247,0.55)' }}
        >
          ✨
        </motion.div>

        <div className="text-center">
          <h1 className="text-3xl font-black mb-2" style={{ color: '#f0f0f5' }}>Paiement réussi !</h1>
          <p className="text-lg font-bold" style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Inside+ est activé 🎉
          </p>
        </div>

        {/* Unlocked features */}
        <div
          className="w-full p-5 rounded-2xl flex flex-col gap-3"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(139,92,246,0.25)' }}
        >
          <p className="text-sm font-bold uppercase tracking-wider" style={{ color: 'rgba(240,240,245,0.50)' }}>Débloqué :</p>
          {unlockedFeatures.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
              className="flex items-center gap-3"
            >
              <span className="text-xl">{f.emoji}</span>
              <span className="font-semibold" style={{ color: '#f0f0f5' }}>{f.label}</span>
              <span className="ml-auto text-sm" style={{ color: '#34d399' }}>✓</span>
            </motion.div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={() => router.push('/templates')}
            className="w-full py-4 rounded-2xl text-white font-black text-lg"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #a855f7, #ec4899)', boxShadow: '0 12px 40px rgba(168,85,247,0.40)' }}
          >
            Découvrir les templates premium
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full py-4 rounded-2xl font-bold"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#f0f0f5' }}
          >
            Retour à l&apos;accueil
          </button>
        </div>
      </motion.div>
    </div>
  )
}
