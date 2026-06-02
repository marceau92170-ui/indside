'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-6 py-12 relative overflow-hidden" style={{ background: '#08080f' }}>
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.22) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.20) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      {/* Top badge */}
      <div className="z-10 animate-fade-up">
        <div className="px-5 py-2.5 rounded-full text-sm font-semibold" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', color: 'rgba(240,240,245,0.80)' }}>
          ✨ Entre amis · En temps réel
        </div>
      </div>

      {/* Hero */}
      <div className="flex flex-col items-center gap-7 z-10 text-center animate-fade-up" style={{ animationDelay: '0.05s' }}>
        {/* Logo mark */}
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #a855f7, #ec4899)',
            boxShadow: '0 20px 60px rgba(168,85,247,0.45)',
          }}
        >
          <span className="text-3xl font-black tracking-tight text-white">I</span>
        </div>

        <div className="flex flex-col gap-4">
          <h1
            className="font-black tracking-tight"
            style={{
              fontSize: '4.5rem',
              lineHeight: 1,
              background: 'linear-gradient(135deg, #a855f7, #3b82f6, #ec4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Inside
          </h1>
          <p className="font-semibold text-xl max-w-xs leading-snug" style={{ color: 'rgba(240,240,245,0.75)' }}>
            Découvre ce que ton groupe cache vraiment
          </p>
          <p className="text-sm max-w-xs mx-auto leading-relaxed" style={{ color: 'rgba(240,240,245,0.45)' }}>
            Crée un quiz privé, invite tes amis et découvre les résultats en temps réel.
          </p>
        </div>

        {/* Emoji strip */}
        <div className="flex gap-5 text-2xl">
          <span>🎭</span>
          <span>🔥</span>
          <span>💬</span>
          <span>🎉</span>
        </div>
      </div>

      {/* CTA buttons */}
      <div className="flex flex-col gap-4 w-full z-10 animate-fade-up" style={{ animationDelay: '0.12s' }}>
        <Link
          href="/create"
          className="btn-primary text-lg font-bold active:scale-95 flex items-center justify-center gap-2"
        >
          ✨ Créer une salle
        </Link>
        <Link
          href="/join"
          className="btn-secondary text-lg active:scale-95 flex items-center justify-center gap-2"
          style={{ padding: '1.25rem' }}
        >
          🚪 Rejoindre une salle
        </Link>

        <p className="text-center text-sm mt-1" style={{ color: 'rgba(240,240,245,0.30)' }}>
          Sans compte · 100% privé · Gratuit
        </p>
      </div>
    </div>
  )
}
