'use client'

import { useRouter } from 'next/navigation'

export default function CancelPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col px-6 py-12 gap-6 items-center justify-center relative overflow-hidden" style={{ background: '#08080f' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.12) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-sm text-center">
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center text-4xl"
          style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.30)' }}
        >
          ❌
        </div>

        <div>
          <h1 className="text-2xl font-black mb-2" style={{ color: '#f0f0f5' }}>Paiement annulé</h1>
          <p className="text-base" style={{ color: 'rgba(240,240,245,0.55)' }}>
            Ton abonnement n&apos;a pas été activé. Tu peux réessayer à tout moment.
          </p>
        </div>

        <div className="w-full flex flex-col gap-3">
          <button
            onClick={() => router.push('/checkout')}
            className="w-full py-4 rounded-2xl text-white font-black text-lg"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #a855f7, #ec4899)', boxShadow: '0 12px 40px rgba(168,85,247,0.40)' }}
          >
            Réessayer
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full py-4 rounded-2xl font-bold"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(240,240,245,0.70)' }}
          >
            Continuer gratuitement
          </button>
        </div>
      </div>
    </div>
  )
}
