'use client'

import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import Nox from '@/components/Nox'

export default function PricingPage() {
  const router = useRouter()

  const features = [
    'Accès à tous les modes de jeu',
    'Nouveau contenu chaque semaine',
    'Peut être annulé à tout moment',
  ]

  const handleContinue = async () => {
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: 'monthly' }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '80px 24px 48px',
      background: 'linear-gradient(160deg, #1a0020 0%, #050508 50%, #1a0008 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Close button */}
      <button
        onClick={() => router.push('/')}
        style={{
          position: 'absolute', top: '20px', left: '20px',
          width: '36px', height: '36px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.10)', border: 'none',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: '1.1rem',
        }}
      >
        ×
      </button>

      {/* Hero section */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', zIndex: 1, flex: 1, justifyContent: 'center', width: '100%', maxWidth: '340px' }}>
        {/* FLOWER+ title */}
        <div style={{
          fontSize: '2.5rem',
          fontWeight: 900,
          color: '#fff',
          letterSpacing: '-0.03em',
          textAlign: 'center',
          textShadow: '3px 3px 0px rgba(255,0,110,0.4)',
        }}>
          FLOWER+
        </div>

        {/* Nox mascot with glow */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', width: '260px', height: '260px', borderRadius: '9999px', background: 'radial-gradient(circle, rgba(255,0,110,0.22) 0%, transparent 70%)', filter: 'blur(40px)' }} />
          <Nox emotion="excited" size={140} animate />
        </div>

        {/* Feature checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
          {features.map((feature, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Check size={14} color="#0a0a0a" strokeWidth={3} />
              </div>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{feature}</span>
            </div>
          ))}
        </div>

        {/* Price */}
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', margin: 0 }}>
          4,99€/mois · Sans engagement
        </p>
      </div>

      {/* Bottom CTA */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '340px', zIndex: 1 }}>
        <button
          onClick={handleContinue}
          style={{
            width: '100%', padding: '22px',
            borderRadius: '9999px',
            background: '#fff',
            fontWeight: 900, fontSize: '1.2rem',
            color: '#0a0a0a', border: 'none', cursor: 'pointer',
            boxShadow: '0 12px 40px rgba(255,0,110,0.25)',
            letterSpacing: '-0.01em',
          }}
        >
          Continuer
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'rgba(255,255,255,0.30)', margin: 0 }}>
          Conditions · Politique de confidentialité
        </p>
      </div>
    </div>
  )
}
