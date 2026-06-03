'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { TEMPLATES } from '@/lib/templates'

export default function TemplatesPage() {
  const router = useRouter()
  const [isPremium, setIsPremium] = useState(false)
  const displayTemplates = TEMPLATES.filter(t => t.slug !== 'creation-libre')

  useEffect(() => {
    setIsPremium(localStorage.getItem('inside_premium') === 'true')
  }, [])

  const handleTemplateClick = (t: typeof displayTemplates[0]) => {
    if (t.is_premium && !isPremium) {
      router.push('/pricing')
    } else {
      router.push(`/create?template=${t.slug}`)
    }
  }

  return (
    <motion.div
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '48px 20px 48px', gap: '24px', background: '#08080f', position: 'relative', overflow: 'hidden' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      {/* blobs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-60px', width: '300px', height: '300px', borderRadius: '9999px', background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)', filter: 'blur(50px)' }} />
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', zIndex: 1 }}>
        <Link href="/create" style={{ width: '40px', height: '40px', borderRadius: '14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f0f0f5', textDecoration: 'none', fontSize: '1.1rem' }}>←</Link>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f0f0f5', margin: 0 }}>Modèles</h1>
          <p style={{ fontSize: '12px', color: 'rgba(240,240,245,0.40)', marginTop: '2px' }}>Choisis ton expérience</p>
        </div>
        {!isPremium && (
          <Link
            href="/pricing"
            style={{
              padding: '6px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: 800,
              background: 'linear-gradient(135deg, #f59e0b, #a855f7)', color: '#fff', textDecoration: 'none',
            }}
          >
            Inside+
          </Link>
        )}
      </div>

      {/* Templates grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 1 }}>
        {displayTemplates.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.06, ease: 'easeOut' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleTemplateClick(t)}
            style={{ cursor: 'pointer' }}
          >
            <div style={{
              padding: '20px 22px', borderRadius: '22px',
              background: t.is_premium && !isPremium
                ? `linear-gradient(135deg, ${t.color_from}10, ${t.color_to}08)`
                : `linear-gradient(135deg, ${t.color_from}18, ${t.color_to}12)`,
              border: `1px solid ${t.is_premium && !isPremium ? t.color_from + '18' : t.color_from + '28'}`,
              display: 'flex', alignItems: 'center', gap: '16px',
              position: 'relative', overflow: 'hidden',
              opacity: t.is_premium && !isPremium ? 0.75 : 1,
            }}>
              {t.is_premium && (
                <div
                  onClick={e => { e.stopPropagation(); router.push('/pricing') }}
                  style={{
                    position: 'absolute', top: '10px', right: '12px',
                    background: 'linear-gradient(135deg, #f59e0b, #a855f7)',
                    borderRadius: '7px', padding: '2px 8px', fontSize: '10px', fontWeight: 800, color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  Inside+
                </div>
              )}
              <span style={{ fontSize: '2.2rem', lineHeight: 1, flexShrink: 0 }}>{t.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#f0f0f5', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {t.name}
                  {t.is_premium && !isPremium && <span style={{ fontSize: '.85rem' }}>🔒</span>}
                </div>
                <div style={{ fontSize: '.82rem', color: 'rgba(240,240,245,0.50)', marginTop: '3px', lineHeight: 1.4 }}>{t.description}</div>
                {t.question_count > 0 && (
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(240,240,245,0.35)', marginTop: '6px' }}>{t.question_count} questions</div>
                )}
              </div>
              <span style={{ color: t.is_premium && !isPremium ? 'rgba(240,240,245,0.20)' : 'rgba(240,240,245,0.30)', fontSize: '1.1rem', flexShrink: 0 }}>›</span>
            </div>
          </motion.div>
        ))}
      </div>

      {!isPremium && (
        <div
          style={{ zIndex: 1, padding: '20px', borderRadius: '22px', background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.10))', border: '1px solid rgba(139,92,246,0.25)', textAlign: 'center', cursor: 'pointer' }}
          onClick={() => router.push('/pricing')}
        >
          <p style={{ fontWeight: 700, color: '#f0f0f5', marginBottom: '4px' }}>Débloquer tous les templates</p>
          <p style={{ fontSize: '.85rem', color: 'rgba(240,240,245,0.50)' }}>Inside+ à partir de 3,99€/mois →</p>
        </div>
      )}
    </motion.div>
  )
}
