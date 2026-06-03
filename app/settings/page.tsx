'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SettingsPage() {
  const router = useRouter()
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [musicEnabled, setMusicEnabled] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    const sound = localStorage.getItem('inside_sound_enabled')
    setSoundEnabled(sound === null ? true : sound === 'true')
    const music = localStorage.getItem('inside_music_enabled')
    setMusicEnabled(music === null ? true : music === 'true')
    const notifs = localStorage.getItem('inside_notifications_enabled')
    setNotificationsEnabled(notifs === 'true')
  }, [])

  const toggle = (key: string, value: boolean, setter: (v: boolean) => void) => {
    setter(value)
    localStorage.setItem(key, String(value))
  }

  const deleteData = () => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('inside_'))
    keys.forEach(k => localStorage.removeItem(k))
    setShowDeleteConfirm(false)
    router.push('/')
  }

  const ToggleRow = ({
    emoji,
    label,
    description,
    value,
    onChange,
  }: {
    emoji: string
    label: string
    description?: string
    value: boolean
    onChange: (v: boolean) => void
  }) => (
    <div
      className="flex items-center justify-between p-5 rounded-2xl"
      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{emoji}</span>
        <div>
          <div className="font-semibold" style={{ color: '#f0f0f5' }}>{label}</div>
          {description && <div className="text-xs mt-0.5" style={{ color: 'rgba(240,240,245,0.45)' }}>{description}</div>}
        </div>
      </div>
      <button
        onClick={() => onChange(!value)}
        style={{
          width: '52px',
          height: '30px',
          borderRadius: '9999px',
          background: value ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' : 'rgba(255,255,255,0.12)',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background .2s',
          flexShrink: 0,
        }}
      >
        <span style={{
          position: 'absolute',
          top: '3px',
          left: value ? '25px' : '3px',
          width: '24px',
          height: '24px',
          borderRadius: '9999px',
          background: '#fff',
          transition: 'left .2s',
          display: 'block',
        }} />
      </button>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 gap-6 relative overflow-hidden" style={{ background: '#08080f' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)', filter: 'blur(60px)' }} />
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
        <h1 className="text-2xl font-black" style={{ color: '#f0f0f5' }}>Paramètres</h1>
      </div>

      {/* Audio */}
      <div className="relative z-10 flex flex-col gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'rgba(240,240,245,0.45)' }}>Audio</h2>
        <ToggleRow
          emoji="🔊"
          label="Sons"
          description="Effets sonores du jeu"
          value={soundEnabled}
          onChange={v => toggle('inside_sound_enabled', v, setSoundEnabled)}
        />
        <ToggleRow
          emoji="🎵"
          label="Musique"
          description="Musique d'ambiance"
          value={musicEnabled}
          onChange={v => toggle('inside_music_enabled', v, setMusicEnabled)}
        />
      </div>

      {/* Notifications */}
      <div className="relative z-10 flex flex-col gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'rgba(240,240,245,0.45)' }}>Notifications</h2>
        <ToggleRow
          emoji="🔔"
          label="Notifications"
          description="Alertes de jeu"
          value={notificationsEnabled}
          onChange={v => toggle('inside_notifications_enabled', v, setNotificationsEnabled)}
        />
      </div>

      {/* Language */}
      <div className="relative z-10 flex flex-col gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'rgba(240,240,245,0.45)' }}>Langue</h2>
        <div
          className="flex items-center justify-between p-5 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🇫🇷</span>
            <div className="font-semibold" style={{ color: '#f0f0f5' }}>Français</div>
          </div>
          <span className="text-sm px-3 py-1 rounded-full" style={{ background: 'rgba(139,92,246,0.15)', color: 'rgba(168,85,247,0.90)' }}>Seule option</span>
        </div>
      </div>

      {/* Premium link */}
      <div className="relative z-10">
        <Link
          href="/pricing"
          className="flex items-center justify-between p-5 rounded-2xl"
          style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.10))', border: '1px solid rgba(139,92,246,0.25)', textDecoration: 'none' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">✨</span>
            <span className="font-semibold" style={{ color: '#f0f0f5' }}>Inside+ — Plans & tarifs</span>
          </div>
          <span style={{ color: 'rgba(168,85,247,0.70)' }}>›</span>
        </Link>
      </div>

      {/* Danger zone */}
      <div className="relative z-10 flex flex-col gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'rgba(239,68,68,0.70)' }}>Zone dangereuse</h2>
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-5 rounded-2xl text-left font-semibold"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)', color: '#fca5a5' }}
          >
            🗑️ Supprimer mes données
          </button>
        ) : (
          <div
            className="p-5 rounded-2xl flex flex-col gap-4"
            style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.30)' }}
          >
            <p className="font-bold" style={{ color: '#fca5a5' }}>Es-tu sûr ? Toutes tes données locales seront supprimées.</p>
            <div className="flex gap-3">
              <button
                onClick={deleteData}
                className="flex-1 py-3 rounded-2xl font-bold"
                style={{ background: 'rgba(239,68,68,0.80)', color: '#fff' }}
              >
                Confirmer
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 rounded-2xl font-bold"
                style={{ background: 'rgba(255,255,255,0.08)', color: '#f0f0f5' }}
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
