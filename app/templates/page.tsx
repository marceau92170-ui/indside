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
  'Célébration': 'Célébration',
  'Soirée': 'Soirée',
  'Votes': 'Votes',
  'Osé': 'Pimenté',
  'Étudiant': 'Campus',
  'Voyage': 'Aventure',
  'Romance': 'Romance',
}

export default function TemplatesPage() {
  const router = useRouter()
  const [userPlan, setUserPlan] = useState<'free' | 'premium'>('free')
  const [showPremiumGate, setShowPremiumGate] = useState(false)
  const displayTemplates = TEMPLATES.filter(t => t.slug !== 'creation-libre')

  useEffect(() => {
    const cached = localStorage.getItem('inside_premium') === 'true'
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
    <div style={{ minHeight: '100vh', background: '#08080f', position: 'relative', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, padding: '16px 20px 12px', background: 'rgba(8,8,15,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/create" style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f0f0f5', textDecoration: 'none', flexShrink: 0 }}>
            <ChevronLeft size={18} />
          </Link>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#f0f0f5', margin: 0, letterSpacing: '-0.01em' }}>Choisir un modèle</h1>
          </div>
          {!isPremium && (
            <Link href="/pricing" style={{ padding: '5px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: 800, background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: '#fff', textDecoration: 'none', letterSpacing: '.02em' }}>
              Inside+
            </Link>
          )}
        </div>
      </div>

      {/* Template cards */}
      <div style={{ padding: '20px 16px 40px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
              style={{ cursor: 'pointer', position: 'relative' }}
            >
              <div style={{
                borderRadius: '20px',
                overflow: 'hidden',
                border: `1px solid ${locked ? 'rgba(255,255,255,0.07)' : t.color_from + '30'}`,
                opacity: locked ? 0.72 : 1,
              }}>
                {/* Color band top */}
                <div style={{
                  height: '6px',
                  background: `linear-gradient(90deg, ${t.color_from}, ${t.color_to})`,
                }} />

                {/* Card body */}
                <div style={{
                  padding: '18px 20px',
                  background: `linear-gradient(145deg, ${t.color_from}14 0%, rgba(8,8,15,0.95) 60%)`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                }}>
                  {/* Left: colored icon block */}
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    background: `linear-gradient(135deg, ${t.color_from}, ${t.color_to})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.6rem',
                    flexShrink: 0,
                    boxShadow: `0 8px 24px ${t.color_from}40`,
                  }}>
                    {t.emoji}
                  </div>

                  {/* Center: text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{
                        fontSize: '11px', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase',
                        color: t.color_from, opacity: locked ? 0.6 : 1,
                      }}>
                        {CATEGORY_LABELS[t.category] || t.category}
                      </span>
                      {t.question_count > 0 && (
                        <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(240,240,245,0.30)', letterSpacing: '.04em' }}>
                          · {t.question_count} questions
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f0f0f5', letterSpacing: '-0.01em', lineHeight: 1.2, marginBottom: '5px' }}>
                      {t.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(240,240,245,0.45)', lineHeight: 1.45, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.description}
                    </div>
                  </div>

                  {/* Right: lock or arrow */}
                  <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {locked ? (
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '10px',
                        background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Lock size={14} color="#f59e0b" />
                      </div>
                    ) : (
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '10px',
                        background: `${t.color_from}18`, border: `1px solid ${t.color_from}28`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <ChevronRight size={16} color={t.color_from} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Premium badge */}
              {t.is_premium && (
                <div style={{
                  position: 'absolute', top: '14px', right: locked ? '56px' : '56px',
                  background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                  borderRadius: '6px', padding: '2px 7px', fontSize: '9px', fontWeight: 800, color: '#fff', letterSpacing: '.05em',
                }}>
                  PLUS
                </div>
              )}
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
              marginTop: '6px',
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
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#f0f0f5', marginBottom: '2px' }}>Débloquer Inside+</div>
              <div style={{ fontSize: '0.78rem', color: 'rgba(240,240,245,0.45)' }}>Tous les modèles · à partir de 4,99€/mois</div>
            </div>
            <ChevronRight size={18} color="rgba(245,158,11,0.70)" />
          </motion.div>
        )}
      </div>

      {showPremiumGate && (
        <PremiumGate
          reason="Ce template est réservé aux abonnés Inside+."
          onClose={() => setShowPremiumGate(false)}
        />
      )}
    </div>
  )
}
