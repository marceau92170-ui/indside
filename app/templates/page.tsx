'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ChevronLeft, Lock, ChevronRight } from 'lucide-react'
import { TEMPLATES } from '@/lib/templates'
import { getUserPlan } from '@/lib/subscription'
import PremiumGate from '@/components/PremiumGate'

const CATEGORY_LABELS: Record<string, string> = {
  'Soirée': 'Soirée',
  'Hot': '🌡️ Hot',
  'Gênant': 'Gênant',
  'Adulte': '🔞 Adulte',
  'Custom': 'Libre',
}

export default function TemplatesPage() {
  const router = useRouter()
  const [userPlan, setUserPlan] = useState<'free' | 'premium'>('free')
  const [showPremiumGate, setShowPremiumGate] = useState(false)
  const displayTemplates = TEMPLATES.filter(t => t.slug !== 'creation-libre')

  useEffect(() => {
    const cached = localStorage.getItem('flower_premium') === 'true'
    if (cached) setUserPlan('premium')
    getUserPlan().then(plan => setUserPlan(plan))
  }, [])

  const isPremium = userPlan === 'premium'

  const handleTemplateClick = (t: typeof displayTemplates[0]) => {
    if (t.is_premium && !isPremium) {
      setShowPremiumGate(true)
    } else {
      router.push(`/create?template=${t.slug}`)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #1a0020 0%, #050508 40%, #200010 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Big ambient glow */}
      <div style={{ position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '500px', height: '500px', borderRadius: '9999px', background: 'radial-gradient(circle, rgba(255,0,110,0.15) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, padding: '16px 20px 12px', background: 'rgba(5,5,8,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/create" style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f0f0f5', textDecoration: 'none', flexShrink: 0 }}>
            <ChevronLeft size={18} />
          </Link>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f0f0f5', margin: 0, letterSpacing: '-0.03em' }}>
              Mode de jeu
            </h1>
          </div>
          {!isPremium && (
            <Link href="/pricing" style={{ padding: '5px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: 800, background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: '#fff', textDecoration: 'none', letterSpacing: '.02em' }}>
              Flower+
            </Link>
          )}
        </div>
      </div>

      {/* Template cards */}
      <div style={{ padding: '20px 16px 40px', paddingTop: '8px', display: 'flex', flexDirection: 'column' }}>
        {displayTemplates.map((t, i) => {
          const locked = t.is_premium && !isPremium
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05, ease: 'easeOut' }}
              whileTap={{ scale: locked ? 1 : 0.985 }}
              onClick={() => handleTemplateClick(t)}
              style={{ position: 'relative', marginTop: '28px', cursor: 'pointer' }}
            >
              {/* Big emoji overlapping card top-left */}
              <div style={{
                position: 'absolute', top: '-24px', left: '20px', zIndex: 2,
                fontSize: '3rem', lineHeight: 1,
                filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))',
              }}>
                {t.emoji}
              </div>

              {/* Light card */}
              <div style={{
                borderRadius: '24px',
                background: locked ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(20px)',
                padding: '20px 20px 20px 20px',
                paddingTop: '28px',
                border: 'none',
                boxShadow: `0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08)`,
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Color accent strip on left */}
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0, width: '5px',
                  background: `linear-gradient(180deg, ${t.color_from}, ${t.color_to})`,
                  borderRadius: '24px 0 0 24px',
                }} />

                <div style={{ paddingLeft: '12px' }}>
                  {/* Category badge */}
                  <span style={{
                    fontSize: '10px', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase',
                    color: t.color_from, display: 'block', marginBottom: '4px',
                  }}>
                    {CATEGORY_LABELS[t.category] || t.category}
                  </span>
                  {/* Title */}
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0a0a0a', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '8px' }}>
                    {t.name}
                  </div>
                  {/* Description */}
                  <div style={{ fontSize: '0.82rem', color: '#555', lineHeight: 1.5 }}>
                    {t.description}
                  </div>
                  {/* Bottom row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                    <span style={{ fontSize: '11px', color: '#999', fontWeight: 600 }}>
                      {t.question_count > 0 ? `${t.question_count} questions` : 'Libre'}
                    </span>
                    {locked ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'linear-gradient(135deg, #f59e0b, #f97316)', borderRadius: '8px', padding: '4px 10px' }}>
                        <Lock size={11} color="#fff" />
                        <span style={{ fontSize: '10px', fontWeight: 800, color: '#fff', letterSpacing: '.05em' }}>FLOWER+</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: `linear-gradient(135deg, ${t.color_from}, ${t.color_to})`, borderRadius: '8px', padding: '5px 12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#fff' }}>Jouer</span>
                        <ChevronRight size={13} color="#fff" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}

        {/* Upsell banner */}
        {!isPremium && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: displayTemplates.length * 0.05 + 0.1 }}
            onClick={() => router.push('/pricing')}
            style={{
              marginTop: '36px',
              padding: '20px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(249,115,22,0.08))',
              border: '1px solid rgba(245,158,11,0.20)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.4rem' }}>
              ✦
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#f0f0f5', marginBottom: '2px' }}>Débloquer Flower+</div>
              <div style={{ fontSize: '0.78rem', color: 'rgba(240,240,245,0.45)' }}>Tous les modèles · à partir de 4,99€/mois</div>
            </div>
            <ChevronRight size={18} color="rgba(245,158,11,0.70)" />
          </motion.div>
        )}
      </div>

      {showPremiumGate && (
        <PremiumGate
          reason="Ce template est réservé aux abonnés Flower+."
          onClose={() => setShowPremiumGate(false)}
        />
      )}
    </div>
  )
}
