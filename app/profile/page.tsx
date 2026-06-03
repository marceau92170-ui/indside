'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ProfilePage() {
  const router = useRouter()
  const [nickname, setNickname] = useState('')
  const [editingNickname, setEditingNickname] = useState(false)
  const [nicknameInput, setNicknameInput] = useState('')
  const [gamesPlayed, setGamesPlayed] = useState(0)
  const [isPremium, setIsPremium] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('inside_nickname') || 'Joueur'
    setNickname(stored)
    setNicknameInput(stored)
    const games = parseInt(localStorage.getItem('inside_games_played') || '0', 10)
    setGamesPlayed(games)
    setIsPremium(localStorage.getItem('inside_premium') === 'true')
  }, [])

  const saveNickname = () => {
    const trimmed = nicknameInput.trim()
    if (trimmed) {
      setNickname(trimmed)
      localStorage.setItem('inside_nickname', trimmed)
    }
    setEditingNickname(false)
  }

  const avatarInitial = nickname.charAt(0).toUpperCase() || '?'

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 gap-6 relative overflow-hidden" style={{ background: '#08080f' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.20) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center gap-4">
        <button
          onClick={() => router.push('/')}
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-bold"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          ←
        </button>
        <h1 className="text-2xl font-black" style={{ color: '#f0f0f5' }}>Mon profil</h1>
      </div>

      {/* Avatar + nickname */}
      <div className="relative z-10 flex flex-col items-center gap-4 py-4">
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center text-4xl font-black text-white"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', boxShadow: '0 16px 48px rgba(139,92,246,0.45)' }}
        >
          {avatarInitial}
        </div>

        {editingNickname ? (
          <div className="flex gap-2 w-full max-w-xs">
            <input
              type="text"
              value={nicknameInput}
              onChange={e => setNicknameInput(e.target.value)}
              maxLength={20}
              autoFocus
              className="flex-1 py-3 px-4 rounded-2xl text-white font-bold text-center focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(168,85,247,0.50)' }}
              onKeyDown={e => e.key === 'Enter' && saveNickname()}
            />
            <button
              onClick={saveNickname}
              className="px-4 rounded-2xl font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}
            >
              ✓
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black" style={{ color: '#f0f0f5' }}>{nickname}</span>
            <button
              onClick={() => setEditingNickname(true)}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
              style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(240,240,245,0.50)' }}
            >
              ✏️
            </button>
          </div>
        )}

        {isPremium && (
          <div className="px-4 py-1.5 rounded-full text-sm font-bold" style={{ background: 'linear-gradient(135deg, #f59e0b, #a855f7)', color: '#fff' }}>
            ✨ Inside+
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="relative z-10 grid grid-cols-2 gap-3">
        <div
          className="p-5 rounded-2xl flex flex-col gap-1"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
        >
          <span className="text-4xl font-black" style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {gamesPlayed}
          </span>
          <span className="text-sm font-semibold" style={{ color: 'rgba(240,240,245,0.50)' }}>Parties jouées</span>
        </div>
        <div
          className="p-5 rounded-2xl flex flex-col gap-1"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
        >
          <span className="text-4xl font-black" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            🎮
          </span>
          <span className="text-sm font-semibold" style={{ color: 'rgba(240,240,245,0.50)' }}>Joueur Inside</span>
        </div>
      </div>

      {/* Badges */}
      <div className="relative z-10 flex flex-col gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'rgba(240,240,245,0.50)' }}>🏅 Badges</h2>
        <div
          className="p-5 rounded-2xl flex flex-col gap-2"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
        >
          {gamesPlayed === 0 ? (
            <p className="text-sm text-center" style={{ color: 'rgba(240,240,245,0.35)' }}>Joue ta première partie pour débloquer des badges !</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {gamesPlayed >= 1 && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)' }}>
                  <span>🎮</span>
                  <span className="text-sm font-bold" style={{ color: '#c084fc' }}>Première partie</span>
                </div>
              )}
              {gamesPlayed >= 5 && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.25)' }}>
                  <span>⭐</span>
                  <span className="text-sm font-bold" style={{ color: '#fbbf24' }}>Habitué</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Links */}
      <div className="relative z-10 flex flex-col gap-3">
        <Link
          href="/settings"
          className="flex items-center justify-between p-5 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', textDecoration: 'none' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">⚙️</span>
            <span className="font-semibold" style={{ color: '#f0f0f5' }}>Paramètres</span>
          </div>
          <span style={{ color: 'rgba(240,240,245,0.30)' }}>›</span>
        </Link>

        {!isPremium ? (
          <Link
            href="/pricing"
            className="flex items-center justify-between p-5 rounded-2xl"
            style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.18), rgba(236,72,153,0.12))', border: '1px solid rgba(139,92,246,0.30)', textDecoration: 'none' }}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">✨</span>
              <div>
                <span className="font-bold" style={{ color: '#f0f0f5' }}>Passer à Inside+</span>
                <div className="text-xs" style={{ color: 'rgba(240,240,245,0.50)' }}>Fonctionnalités premium à 3,99€/mois</div>
              </div>
            </div>
            <span style={{ color: 'rgba(168,85,247,0.70)' }}>›</span>
          </Link>
        ) : (
          <Link
            href="/pricing"
            className="flex items-center justify-between p-5 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', textDecoration: 'none' }}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">✨</span>
              <span className="font-semibold" style={{ color: '#f0f0f5' }}>Gérer Inside+</span>
            </div>
            <span style={{ color: 'rgba(240,240,245,0.30)' }}>›</span>
          </Link>
        )}
      </div>
    </div>
  )
}
