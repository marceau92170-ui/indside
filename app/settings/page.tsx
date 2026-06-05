'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { playClick, stopAmbientMusic } from '@/lib/sound'
import { getTheme, gradient, setTheme, THEMES } from '@/lib/theme'
import type { ThemeId } from '@/lib/theme'
import { Volume2, Music, Palette, Trash2 } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [musicEnabled, setMusicEnabled] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>('tropical')
  const theme = getTheme()
  const grad = gradient(theme)

  useEffect(() => {
    setSoundEnabled(localStorage.getItem('inside_sound_enabled') !== 'false')
    setMusicEnabled(localStorage.getItem('inside_music_enabled') !== 'false')
    const notifs = localStorage.getItem('inside_notifications_enabled')
    setNotificationsEnabled(notifs === 'true')
    setSelectedTheme((localStorage.getItem('inside_theme') as ThemeId) || 'tropical')
  }, [])

  const toggleSound = () => {
    const next = !soundEnabled
    localStorage.setItem('inside_sound_enabled', next ? 'true' : 'false')
    setSoundEnabled(next)
    if (next) playClick()
  }

  const toggleMusic = () => {
    const next = !musicEnabled
    localStorage.setItem('inside_music_enabled', next ? 'true' : 'false')
    setMusicEnabled(next)
    if (!next) stopAmbientMusic()
  }

  const toggle = (key: string, value: boolean, setter: (v: boolean) => void) => {
    setter(value)
    localStorage.setItem(key, String(value))
  }

  const deleteData = () => {
    const keysToDelete = [
      'inside_splash_seen',
      'inside_user_token',
      'inside_games_played',
      'inside_premium',
      'inside_sound_enabled',
      'inside_music_enabled',
      'inside_replay_questions',
    ]
    // Also delete any player-specific keys
    const allKeys = Object.keys(localStorage).filter(k => k.startsWith('inside_player_'))
    ;[...keysToDelete, ...allKeys].forEach(k => localStorage.removeItem(k))
    setShowDeleteConfirm(false)
    router.push('/')
  }

  const ToggleRow = ({
    icon,
    label,
    description,
    value,
    onChange,
  }: {
    icon: ReactNode
    label: string
    description?: string
    value: boolean
    onChange: () => void
  }) => (
    <div
      className="flex items-center justify-between p-5 rounded-2xl"
      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
    >
      <div className="flex items-center gap-3">
        <span style={{ color: 'rgba(240,240,245,0.75)', display: 'flex' }}>{icon}</span>
        <div>
          <div className="font-semibold" style={{ color: '#f0f0f5' }}>{label}</div>
          {description && <div className="text-xs mt-0.5" style={{ color: 'rgba(240,240,245,0.45)' }}>{description}</div>}
        </div>
      </div>
      <button
        onClick={onChange}
        style={{
          width: '52px',
          height: '30px',
          borderRadius: '9999px',
          background: value ? grad : 'rgba(255,255,255,0.12)',
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
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full" style={{ background: `radial-gradient(circle, ${theme.glowFrom} 0%, transparent 70%)`, filter: 'blur(60px)' }} />
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

      {/* Theme */}
      <div className="relative z-10 flex flex-col gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'rgba(240,240,245,0.45)' }}><Palette size={18} /> Thème</h2>
        <div className="flex gap-3">
          {THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => {
                setTheme(t.id)
                setSelectedTheme(t.id)
                window.location.reload()
              }}
              className="flex-1 py-3 px-4 rounded-2xl font-bold text-sm active:scale-95"
              style={{
                background: selectedTheme === t.id ? gradient(t) : 'rgba(255,255,255,0.08)',
                border: selectedTheme === t.id ? 'none' : '1px solid rgba(255,255,255,0.12)',
                color: selectedTheme === t.id ? '#fff' : 'rgba(240,240,245,0.70)',
                transition: 'all 0.2s',
              }}
            >
              {t.emoji} {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Audio */}
      <div className="relative z-10 flex flex-col gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'rgba(240,240,245,0.45)' }}>Audio</h2>
        <ToggleRow
          icon={<Volume2 size={18} />}
          label="Sons"
          description="Effets sonores du jeu"
          value={soundEnabled}
          onChange={toggleSound}
        />
        <ToggleRow
          icon={<Music size={18} />}
          label="Musique"
          description="Musique d'ambiance"
          value={musicEnabled}
          onChange={toggleMusic}
        />
      </div>

      {/* Notifications */}
      <div className="relative z-10 flex flex-col gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'rgba(240,240,245,0.45)' }}>Notifications</h2>
        <ToggleRow
          icon={<span style={{ fontSize: '1.1rem' }}>🔔</span>}
          label="Notifications"
          description="Alertes de jeu"
          value={notificationsEnabled}
          onChange={() => toggle('inside_notifications_enabled', !notificationsEnabled, setNotificationsEnabled)}
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
          <span className="text-sm px-3 py-1 rounded-full" style={{ background: `${theme.from}25`, color: theme.from }}>Seule option</span>
        </div>
      </div>

      {/* Premium link */}
      <div className="relative z-10">
        <Link
          href="/pricing"
          className="flex items-center justify-between p-5 rounded-2xl"
          style={{ background: `linear-gradient(135deg, ${theme.glowFrom}, ${theme.glowTo})`, border: `1px solid ${theme.from}40`, textDecoration: 'none' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">✨</span>
            <span className="font-semibold" style={{ color: '#f0f0f5' }}>Inside+ — Plans & tarifs</span>
          </div>
          <span style={{ color: theme.from }}>›</span>
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
            <span className="flex items-center gap-2"><Trash2 size={18} /> Supprimer mes données</span>
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
