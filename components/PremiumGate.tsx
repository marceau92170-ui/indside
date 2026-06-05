'use client'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Crown, Users, LayoutGrid, BarChart2, Award, Sparkles, Check } from 'lucide-react'

interface PremiumGateProps {
  reason: string
  onClose: () => void
}

export default function PremiumGate({ reason, onClose }: PremiumGateProps) {
  const router = useRouter()

  const features = [
    { icon: <Check size={18} />, text: 'Questions illimitées' },
    { icon: <Users size={18} />, text: 'Joueurs illimités' },
    { icon: <LayoutGrid size={18} />, text: 'Tous les templates premium' },
    { icon: <BarChart2 size={18} />, text: 'Statistiques avancées' },
    { icon: <Award size={18} />, text: 'Badges avancés' },
    { icon: <Sparkles size={18} />, text: 'Futures fonctionnalités' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(5,5,15,0.96)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '24px' }}
      >
        {/* Badge */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '6px 16px', borderRadius: '999px',
            background: 'linear-gradient(135deg, #f59e0b, #f97316)',
            color: '#fff', fontWeight: 800, fontSize: '0.85rem', marginBottom: '16px'
          }}>✦ INSIDE+</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '8px', color: '#f0f0f5' }}>
            Débloquer Flower+
          </div>
          <div style={{
            fontSize: '0.9rem', color: 'rgba(240,240,245,0.5)',
            lineHeight: 1.5, maxWidth: '280px', margin: '0 auto'
          }}>
            {reason}
          </div>
        </div>

        {/* Features */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: '20px', padding: '20px',
          display: 'flex', flexDirection: 'column', gap: '12px'
        }}>
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.06 }}
              style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
            >
              <span style={{ color: 'rgba(240,240,245,0.75)', display: 'flex' }}>{f.icon}</span>
              <span style={{ fontSize: '0.9rem', color: 'rgba(240,240,245,0.8)', fontWeight: 500 }}>{f.text}</span>
            </motion.div>
          ))}
        </div>

        {/* Price */}
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '2rem', fontWeight: 900, color: '#f0f0f5' }}>4,99€</span>
          <span style={{ fontSize: '1rem', color: 'rgba(240,240,245,0.45)', marginLeft: '4px' }}>/mois</span>
          <div style={{ fontSize: '0.8rem', color: 'rgba(240,240,245,0.35)', marginTop: '4px' }}>
            ou 39,99€/an · économise 33%
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/pricing')}
            style={{
              width: '100%', padding: '18px', borderRadius: '16px', border: 'none',
              background: 'linear-gradient(135deg, #f59e0b, #f97316)',
              color: '#fff', fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
              boxShadow: '0 12px 40px rgba(245,158,11,0.35)',
            }}
          >
            ✦ Passer à Flower+
          </motion.button>
          <button
            onClick={onClose}
            style={{
              width: '100%', padding: '16px', borderRadius: '16px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.10)',
              color: 'rgba(240,240,245,0.5)', fontWeight: 600,
              fontSize: '0.9rem', cursor: 'pointer',
            }}
          >
            Peut-être plus tard
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
