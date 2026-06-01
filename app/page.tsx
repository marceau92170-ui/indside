'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-6 py-12 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-purple-600/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-pink-600/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
      </div>

      {/* Top spacer */}
      <div />

      {/* Hero */}
      <div className="flex flex-col items-center gap-6 z-10 text-center">
        {/* Logo */}
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 via-blue-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/40">
          <span className="text-3xl font-black tracking-tight">I</span>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-6xl font-black tracking-tight">
            <span className="gradient-text">Inside</span>
          </h1>
          <p className="text-white/60 text-lg leading-snug max-w-xs">
            Crée des quiz privés avec tes amis.<br />
            Découvre ce qu&apos;ils pensent vraiment.
          </p>
        </div>

        {/* Emoji strip */}
        <div className="flex gap-3 text-2xl">
          <span>🎭</span>
          <span>🔥</span>
          <span>😈</span>
          <span>💬</span>
          <span>🎉</span>
        </div>
      </div>

      {/* CTA buttons */}
      <div className="flex flex-col gap-4 w-full z-10">
        <Link
          href="/create"
          className="w-full py-5 rounded-2xl bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 text-white font-bold text-lg text-center shadow-2xl shadow-purple-500/30 active:scale-95"
        >
          ✨ Créer une salle
        </Link>
        <Link
          href="/join"
          className="w-full py-5 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-white font-bold text-lg text-center active:scale-95"
        >
          🚪 Rejoindre une salle
        </Link>

        <p className="text-center text-white/30 text-sm mt-2">
          Pas de compte requis · 100% entre amis
        </p>
      </div>
    </div>
  )
}
