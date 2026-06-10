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
            background: 'linear-gradient(135deg, rgba(255,0,110,0.25), rgba(139,0,255,0.25))',
            border: '1px solid rgba(255,0,110,0.35)',
            color: '#ff6eb0', fontWeight: 800, fontSize: '0.85rem', marginBottom: '16px',
            letterSpacing: '.08em',
          }}>✦ FLOWER+</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '8px', color: '#f0f0f5' }}>
            Débloquer Flower+
          </div>
          <div style={{
            fontSize: '0.88rem', color: 'rgba(240,240,245,0.5)',
            lineHeight: 1.5, maxWidth: '280px', margin: '0 auto'
          }}>
            {reason}
          </div>
        </div>

        {/* Features */}
        <div style={{
          borderRadius: '20px', overflow: 'hidden',
          border: '1.5px solid rgba(255,0,110,0.30)',
          background: 'rgba(255,0,110,0.06)',
          boxShadow: '0 0 30px rgba(255,0,110,0.10)',
        }}>
          <div style={{ height: '3px', background: 'linear-gradient(90deg, #ff006e, #8b00ff)' }} />
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.06 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 18px',
                borderBottom: i < features.length - 1 ? '1px solid rgba(255,0,110,0.10)' : 'none',
              }}
            >
              <span style={{ color: '#ff6eb0', display: 'flex' }}>{f.icon}</span>
              <span style={{ fontSize: '0.88rem', color: 'rgba(240,240,245,0.85)', fontWeight: 600 }}>{f.text}</span>
            </motion.div>
          ))}
        </div>

        {/* Price */}
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '2.4rem', fontWeight: 900, color: '#f0f0f5', letterSpacing: '-0.03em' }}>4,99€</span>
          <span style={{ fontSize: '1rem', color: 'rgba(240,240,245,0.45)', marginLeft: '4px' }}>/mois</span>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/pricing')}
            style={{
              width: '100%', padding: '20px', borderRadius: '9999px', border: 'none',
              background: 'linear-gradient(135deg, #ff006e 0%, #8b00ff 100%)',
              color: '#fff', fontWeight: 900, fontSize: '1rem', cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(255,0,110,0.45)',
              letterSpacing: '0.01em',
            }}
          >
            ✦ S&apos;abonner pour 4,99€/mois
          </motion.button>
          <button
            onClick={onClose}
            style={{
              width: '100%', padding: '16px', borderRadius: '9999px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.10)',
              color: 'rgba(240,240,245,0.45)', fontWeight: 600,
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
