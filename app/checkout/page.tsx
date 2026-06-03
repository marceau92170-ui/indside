'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CheckoutPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCheckout = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'inside_plus_monthly' }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError('Une erreur est survenue.')
      }
    } catch {
      setError('Une erreur est survenue. Vérifie ta connexion.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 gap-6 relative overflow-hidden" style={{ background: '#08080f' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.22) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center gap-4">
        <button
          onClick={() => router.push('/pricing')}
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-bold"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          ←
        </button>
        <h1 className="text-2xl font-black" style={{ color: '#f0f0f5' }}>Paiement</h1>
      </div>

      {/* Order summary */}
      <div
        className="relative z-10 p-6 rounded-3xl flex flex-col gap-4"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
      >
        <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'rgba(240,240,245,0.50)' }}>Récapitulatif</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}
            >
              ✨
            </div>
            <div>
              <div className="font-bold" style={{ color: '#f0f0f5' }}>Inside+</div>
              <div className="text-sm" style={{ color: 'rgba(240,240,245,0.50)' }}>Abonnement mensuel</div>
            </div>
          </div>
          <div className="text-xl font-black" style={{ color: '#f0f0f5' }}>3,99€</div>
        </div>
        <div className="border-t" style={{ borderColor: 'rgba(255,255,255,0.10)' }} />
        <div className="flex justify-between">
          <span className="font-semibold" style={{ color: 'rgba(240,240,245,0.60)' }}>Total</span>
          <span className="font-black text-lg" style={{ color: '#f0f0f5' }}>3,99€/mois</span>
        </div>
      </div>

      {/* Secure badge */}
      <div
        className="relative z-10 flex items-center justify-center gap-3 py-3 px-5 rounded-2xl"
        style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.20)' }}
      >
        <span>🔒</span>
        <span className="text-sm font-semibold" style={{ color: 'rgba(52,211,153,0.90)' }}>Paiement sécurisé par Stripe</span>
      </div>

      {/* Features reminder */}
      <div
        className="relative z-10 p-5 rounded-2xl flex flex-col gap-2"
        style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.20)' }}
      >
        <p className="text-sm font-bold" style={{ color: 'rgba(240,240,245,0.60)' }}>Tu vas débloquer :</p>
        {['Questions illimitées', 'Templates premium', 'Joueurs illimités', 'Résultats détaillés'].map((f, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-sm" style={{ color: '#a78bfa' }}>✓</span>
            <span className="text-sm" style={{ color: 'rgba(240,240,245,0.70)' }}>{f}</span>
          </div>
        ))}
      </div>

      {error && (
        <div
          className="relative z-10 py-3 px-4 rounded-2xl text-sm font-semibold"
          style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.30)', color: '#fca5a5' }}
        >
          {error}
        </div>
      )}

      {/* CTA */}
      <div className="relative z-10 mt-auto flex flex-col gap-3">
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full py-5 rounded-2xl text-white font-black text-xl disabled:opacity-50 flex items-center justify-center gap-3"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #a855f7, #ec4899)', boxShadow: '0 12px 40px rgba(168,85,247,0.45)' }}
        >
          {loading ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Redirection…
            </>
          ) : (
            <>🔒 Payer avec Stripe</>
          )}
        </button>
        <p className="text-center text-xs" style={{ color: 'rgba(240,240,245,0.25)' }}>
          Annulez à tout moment · Sans engagement
        </p>
      </div>
    </div>
  )
}
