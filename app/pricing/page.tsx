'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PricingPage() {
  const router = useRouter()
  const [isPremium, setIsPremium] = useState(false)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')

  useEffect(() => {
    setIsPremium(localStorage.getItem('inside_premium') === 'true')
  }, [])

  const freeFeatures = [
    'Création libre',
    'Templates basiques (anniversaire, soirée)',
    "Jusqu'à 20 questions",
    "Jusqu'à 20 joueurs",
  ]

  const premiumFeatures = [
    'Questions illimitées',
    'Joueurs illimités',
    'Templates premium (Qui est le plus, Questions gênantes, Étudiants, Voyage, Couples)',
    'Badges avancés',
    'Résultats détaillés',
  ]

  const monthlyPrice = 3.99
  const annualPrice = 29.99
  const annualSavings = Math.round((1 - annualPrice / (monthlyPrice * 12)) * 100)

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 gap-6 relative overflow-hidden" style={{ background: '#08080f' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.22) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.18) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-bold"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          ←
        </button>
        <div>
          <h1 className="text-2xl font-black" style={{ color: '#f0f0f5' }}>Plans & tarifs</h1>
          {isPremium && <p className="text-sm" style={{ color: 'rgba(168,85,247,0.90)' }}>✨ Abonnement actif</p>}
        </div>
      </div>

      {/* Billing toggle */}
      <div className="relative z-10 flex items-center justify-center">
        <div
          className="flex p-1 rounded-2xl gap-1"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
        >
          <button
            onClick={() => setBillingCycle('monthly')}
            className="px-5 py-2 rounded-xl text-sm font-bold transition-all"
            style={{
              background: billingCycle === 'monthly' ? 'rgba(139,92,246,0.30)' : 'transparent',
              color: billingCycle === 'monthly' ? '#c084fc' : 'rgba(240,240,245,0.50)',
              border: billingCycle === 'monthly' ? '1px solid rgba(139,92,246,0.40)' : '1px solid transparent',
            }}
          >
            Mensuel
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className="px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
            style={{
              background: billingCycle === 'annual' ? 'rgba(139,92,246,0.30)' : 'transparent',
              color: billingCycle === 'annual' ? '#c084fc' : 'rgba(240,240,245,0.50)',
              border: billingCycle === 'annual' ? '1px solid rgba(139,92,246,0.40)' : '1px solid transparent',
            }}
          >
            Annuel
            <span className="text-xs px-2 py-0.5 rounded-full font-black" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: '#fff' }}>-{annualSavings}%</span>
          </button>
        </div>
      </div>

      {/* FREE plan */}
      <div
        className="relative z-10 p-6 rounded-3xl flex flex-col gap-4"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black" style={{ color: '#f0f0f5' }}>Gratuit</h2>
            <p className="text-sm" style={{ color: 'rgba(240,240,245,0.50)' }}>Pour commencer</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black" style={{ color: '#f0f0f5' }}>0€</div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {freeFeatures.map((f, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-sm mt-0.5" style={{ color: '#34d399' }}>✓</span>
              <span className="text-sm" style={{ color: 'rgba(240,240,245,0.70)' }}>{f}</span>
            </div>
          ))}
        </div>
        {!isPremium && (
          <div className="py-3 rounded-2xl text-center text-sm font-semibold" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(240,240,245,0.45)' }}>
            Plan actuel
          </div>
        )}
      </div>

      {/* INSIDE+ plan */}
      <div
        className="relative z-10 p-1 rounded-3xl"
        style={{ background: 'linear-gradient(135deg, #8b5cf6, #a855f7, #ec4899)' }}
      >
        <div
          className="p-6 rounded-[22px] flex flex-col gap-4"
          style={{ background: 'rgba(14,12,30,0.96)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black" style={{ color: '#f0f0f5' }}>Inside+</h2>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'linear-gradient(135deg, #f59e0b, #a855f7)', color: '#fff' }}>Premium</span>
              </div>
              <p className="text-sm" style={{ color: 'rgba(240,240,245,0.50)' }}>Pour les pros</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black" style={{ color: '#f0f0f5' }}>
                {billingCycle === 'monthly' ? `${monthlyPrice}€` : `${(annualPrice / 12).toFixed(2)}€`}
              </div>
              <div className="text-xs" style={{ color: 'rgba(240,240,245,0.50)' }}>
                {billingCycle === 'monthly' ? '/mois' : `/mois · ${annualPrice}€/an`}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {premiumFeatures.map((f, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-sm mt-0.5" style={{ color: '#a78bfa' }}>✓</span>
                <span className="text-sm" style={{ color: 'rgba(240,240,245,0.80)' }}>{f}</span>
              </div>
            ))}
          </div>

          {isPremium ? (
            <div className="flex flex-col gap-3">
              <div className="py-3 rounded-2xl text-center font-bold" style={{ background: 'rgba(139,92,246,0.20)', color: '#c084fc', border: '1px solid rgba(139,92,246,0.30)' }}>
                ✨ Abonnement actif
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('inside_premium')
                  setIsPremium(false)
                }}
                className="py-2 text-center text-sm underline"
                style={{ background: 'none', border: 'none', color: 'rgba(240,240,245,0.30)', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Résilier l&apos;abonnement
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push('/checkout')}
              className="w-full py-4 rounded-2xl text-white font-black text-lg"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #a855f7, #ec4899)', boxShadow: '0 12px 40px rgba(168,85,247,0.45)' }}
            >
              Passer à Inside+ ✨
            </button>
          )}
        </div>
      </div>

      <div className="relative z-10 text-center text-xs pb-4" style={{ color: 'rgba(240,240,245,0.25)' }}>
        Paiement sécurisé · Annulez à tout moment
      </div>
    </div>
  )
}
