'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Check } from 'lucide-react'
import Nox from '@/components/Nox'
import { getUserToken } from '@/lib/subscription'

export default function PricingPage() {
  const router = useRouter()
  const [recovering, setRecovering] = useState(false)
  const [email, setEmail] = useState('')
  const [recoverStatus, setRecoverStatus] = useState<'idle' | 'loading' | 'ok' | 'notfound'>('idle')

  const features = [
    'Accès à tous les modes de jeu',
    'Nouveau contenu chaque semaine',
    'Peut être annulé à tout moment',
  ]

  const handleContinue = async () => {
    const userToken = getUserToken()
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: 'monthly', userToken }),
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

        <button
          onClick={() => setRecovering(r => !r)}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.40)', fontSize: '0.82rem', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}
        >
          J&apos;ai déjà un abonnement actif
        </button>

        {recovering && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
            <p style={{ color: 'rgba(255,255,255,0.70)', fontSize: '0.82rem', margin: 0, textAlign: 'center' }}>
              Entre l&apos;email utilisé lors du paiement pour récupérer ton accès.
            </p>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ton@email.com"
              style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: '#f0f0f5', fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit' }}
            />
            {recoverStatus === 'ok' && <p style={{ color: '#34d399', fontSize: '0.82rem', textAlign: 'center', margin: 0 }}>✓ Accès récupéré ! Retour à l&apos;accueil…</p>}
            {recoverStatus === 'notfound' && <p style={{ color: '#f87171', fontSize: '0.82rem', textAlign: 'center', margin: 0 }}>Aucun abonnement trouvé pour cet email.</p>}
            <button
              disabled={recoverStatus === 'loading' || !email.trim()}
              onClick={async () => {
                setRecoverStatus('loading')
                const userToken = getUserToken()
                const res = await fetch('/api/stripe/recover', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: email.trim(), userToken }),
                })
                const data = await res.json()
                if (data.success) {
                  localStorage.setItem('flower_premium', 'true')
                  setRecoverStatus('ok')
                  setTimeout(() => router.push('/'), 1500)
                } else {
                  setRecoverStatus('notfound')
                }
              }}
              style={{ padding: '12px', borderRadius: '12px', background: recoverStatus === 'loading' ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              {recoverStatus === 'loading' ? 'Vérification…' : 'Récupérer mon accès'}
            </button>
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'rgba(255,255,255,0.30)', margin: 0 }}>
          Conditions · Politique de confidentialité
        </p>
      </div>
    </div>
  )
}
