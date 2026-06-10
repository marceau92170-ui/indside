'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Check, Zap, Shield, Sparkles } from 'lucide-react'
import Nox from '@/components/Nox'
import { getUserToken } from '@/lib/subscription'

export default function PricingPage() {
  const router = useRouter()
  const [recovering, setRecovering] = useState(false)
  const [email, setEmail] = useState('')
  const [recoverStatus, setRecoverStatus] = useState<'idle' | 'loading' | 'ok' | 'notfound'>('idle')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkoutUrl, setCheckoutUrl] = useState('/api/stripe/checkout?token=new')

  useEffect(() => {
    const token = localStorage.getItem('flower_user_token') || 'new'
    setCheckoutUrl(`/api/stripe/checkout?token=${token}`)
  }, [])

  const features = [
    { icon: Zap, text: 'Accès à tous les modes de jeu' },
    { icon: Sparkles, text: 'Nouveau contenu chaque semaine' },
    { icon: Shield, text: 'Sans engagement · Annulable à tout moment' },
  ]

  const handleContinue = async () => {
    if (loading) return
    setLoading(true)
    setError(null)
    try {
      const userToken = getUserToken()
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'monthly', userToken }),
      })
      if (!res.ok) {
        const text = await res.text()
        setError(`Erreur serveur ${res.status}: ${text.slice(0, 100)}`)
        setLoading(false)
        return
      }
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Pas d\'URL reçue du serveur')
        setLoading(false)
      }
    } catch (e: any) {
      setError(`Erreur: ${e?.message || 'inconnue'}`)
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '60px 24px 40px',
      background: 'linear-gradient(160deg, #1a0020 0%, #050508 50%, #1a0008 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Glow blobs */}
      <div style={{ position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)', width: '400px', height: '400px', borderRadius: '9999px', background: 'radial-gradient(circle, rgba(255,0,110,0.15) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '0', left: '50%', transform: 'translateX(-50%)', width: '300px', height: '300px', borderRadius: '9999px', background: 'radial-gradient(circle, rgba(139,0,255,0.12) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

      {/* Close button */}
      <button
        onClick={() => router.push('/')}
        style={{
          position: 'absolute', top: '20px', left: '20px',
          width: '36px', height: '36px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.10)', border: 'none',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: '1.1rem', zIndex: 10,
        }}
      >×</button>

      {/* Hero */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', zIndex: 1, flex: 1, justifyContent: 'center', width: '100%', maxWidth: '340px' }}>

        {/* Badge */}
        <div style={{
          padding: '6px 16px', borderRadius: '9999px',
          background: 'linear-gradient(90deg, rgba(255,0,110,0.25), rgba(139,0,255,0.25))',
          border: '1px solid rgba(255,0,110,0.35)',
          fontSize: '0.72rem', fontWeight: 800, letterSpacing: '.1em',
          color: '#ff6eb0', textTransform: 'uppercase',
        }}>
          Abonnement Premium
        </div>

        {/* Title */}
        <div style={{
          fontSize: '3.2rem', fontWeight: 900, color: '#fff',
          letterSpacing: '-0.04em', textAlign: 'center', lineHeight: 1,
          textShadow: '0 0 40px rgba(255,0,110,0.5)',
        }}>
          FLOWER<span style={{ color: '#ff006e' }}>+</span>
        </div>

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span style={{ fontSize: '2.8rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>4,99€</span>
          <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>/mois</span>
        </div>

        {/* Nox */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '4px 0' }}>
          <div style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '9999px', background: 'radial-gradient(circle, rgba(255,0,110,0.25) 0%, transparent 70%)', filter: 'blur(30px)' }} />
          <Nox emotion="excited" size={120} animate />
        </div>

        {/* Features card */}
        <div style={{
          width: '100%', borderRadius: '24px', overflow: 'hidden',
          border: '1.5px solid rgba(255,0,110,0.35)',
          background: 'rgba(255,0,110,0.06)',
          boxShadow: '0 0 40px rgba(255,0,110,0.12), inset 0 0 40px rgba(139,0,255,0.05)',
        }}>
          {/* Top gradient bar */}
          <div style={{ height: '3px', background: 'linear-gradient(90deg, #ff006e, #8b00ff, #ff006e)', backgroundSize: '200% 100%' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', padding: '4px 0' }}>
            {features.map(({ icon: Icon, text }, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px 18px',
                borderBottom: i < features.length - 1 ? '1px solid rgba(255,0,110,0.12)' : 'none',
              }}>
                <div style={{
                  width: '30px', height: '30px', borderRadius: '9px', flexShrink: 0,
                  background: 'linear-gradient(135deg, rgba(255,0,110,0.25), rgba(139,0,255,0.25))',
                  border: '1px solid rgba(255,0,110,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={14} color="#ff6eb0" />
                </div>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'rgba(255,255,255,0.88)' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '340px', zIndex: 1 }}>

        {error && (
          <p style={{ textAlign: 'center', color: '#f87171', fontSize: '0.82rem', margin: 0, padding: '10px', borderRadius: '12px', background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)' }}>
            {error}
          </p>
        )}

        <a
          href={checkoutUrl}
          onClick={(e) => {
            e.preventDefault()
            handleContinue()
          }}
          style={{
            display: 'block', width: '100%', padding: '22px',
            borderRadius: '9999px', textAlign: 'center', textDecoration: 'none',
            background: loading
              ? 'rgba(255,255,255,0.10)'
              : 'linear-gradient(135deg, #ff006e 0%, #8b00ff 100%)',
            fontWeight: 900, fontSize: '1.15rem',
            color: loading ? 'rgba(255,255,255,0.5)' : '#fff',
            boxShadow: loading ? 'none' : '0 8px 32px rgba(255,0,110,0.50), 0 2px 8px rgba(0,0,0,0.4)',
            letterSpacing: '0.01em',
            transition: 'all 0.2s',
            cursor: loading ? 'default' : 'pointer',
          }}
        >
          {loading ? 'Chargement…' : '✦ S\'abonner pour 4,99€/mois'}
        </a>

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

        <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', margin: 0 }}>
          Conditions · Politique de confidentialité
        </p>
      </div>
    </div>
  )
}
