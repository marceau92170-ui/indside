'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { playClick, stopAmbientMusic } from '@/lib/sound'
import { getTheme, gradient, setTheme, THEMES } from '@/lib/theme'
import type { ThemeId } from '@/lib/theme'
import { ChevronLeft, Volume2, Music2, Bell, Trash2, Crown, ChevronRight, Check } from 'lucide-react'

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
    setSoundEnabled(localStorage.getItem('flower_sound_enabled') !== 'false')
    setMusicEnabled(localStorage.getItem('flower_music_enabled') !== 'false')
    setNotificationsEnabled(localStorage.getItem('flower_notifications_enabled') === 'true')
    setSelectedTheme((localStorage.getItem('flower_theme') as ThemeId) || 'tropical')
  }, [])

  const toggleSound = () => {
    const next = !soundEnabled
    localStorage.setItem('flower_sound_enabled', String(next))
    setSoundEnabled(next)
    if (next) playClick()
  }

  const toggleMusic = () => {
    const next = !musicEnabled
    localStorage.setItem('flower_music_enabled', String(next))
    setMusicEnabled(next)
    if (!next) stopAmbientMusic()
  }

  const toggleNotifications = () => {
    const next = !notificationsEnabled
    localStorage.setItem('flower_notifications_enabled', String(next))
    setNotificationsEnabled(next)
  }

  const deleteData = () => {
    const keys = [
      'flower_splash_seen', 'flower_user_token', 'flower_games_played',
      'flower_premium', 'flower_sound_enabled', 'flower_music_enabled',
      'flower_replay_questions',
    ]
    const playerKeys = Object.keys(localStorage).filter(k => k.startsWith('flower_player_'))
    ;[...keys, ...playerKeys].forEach(k => localStorage.removeItem(k))
    router.push('/')
  }

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      style={{
        width: '48px', height: '28px', borderRadius: '9999px', border: 'none', cursor: 'pointer',
        background: value ? grad : 'rgba(0,0,0,0.15)',
        position: 'relative', transition: 'background .2s', flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: '3px', left: value ? '23px' : '3px',
        width: '22px', height: '22px', borderRadius: '9999px', background: '#fff',
        transition: 'left .2s', display: 'block',
        boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
      }} />
    </button>
  )

  const sections = [
    {
      label: 'Thème',
      content: (
        <div style={{ display: 'flex', gap: '10px', padding: '16px 20px 20px' }}>
          {THEMES.map((t, i) => (
            <motion.button
              key={t.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setTheme(t.id); setSelectedTheme(t.id); window.location.reload() }}
              style={{
                flex: 1, padding: '14px 10px', borderRadius: '16px', border: 'none', cursor: 'pointer',
                background: selectedTheme === t.id ? gradient(t) : 'rgba(0,0,0,0.06)',
                color: selectedTheme === t.id ? '#fff' : '#333',
                fontWeight: 800, fontSize: '13px', position: 'relative',
                boxShadow: selectedTheme === t.id ? `0 4px 16px ${t.from}55` : 'none',
                transition: 'all .2s',
              }}
            >
              <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>{t.emoji}</div>
              <div>{t.name}</div>
              {selectedTheme === t.id && (
                <div style={{ position: 'absolute', top: '8px', right: '8px', width: '18px', height: '18px', borderRadius: '9999px', background: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={10} color="#fff" strokeWidth={3} />
                </div>
              )}
            </motion.button>
          ))}
        </div>
      ),
    },
  ]

  const audioRows = [
    { icon: <Volume2 size={18} color={theme.from} />, label: 'Effets sonores', sub: 'Clics et retours haptiques', value: soundEnabled, toggle: toggleSound },
    { icon: <Music2 size={18} color={theme.from} />, label: 'Musique d\'ambiance', sub: 'Fond sonore en jeu', value: musicEnabled, toggle: toggleMusic },
    { icon: <Bell size={18} color={theme.from} />, label: 'Notifications', sub: 'Alertes de partie', value: notificationsEnabled, toggle: toggleNotifications },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #1a0020 0%, #050508 40%, #200010 100%)', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient glow */}
      <div style={{ position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '500px', height: '500px', borderRadius: '9999px', background: 'radial-gradient(circle, rgba(255,0,110,0.13) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, padding: '16px 20px 12px', background: 'rgba(5,5,8,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/" style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f0f0f5', textDecoration: 'none', flexShrink: 0 }}>
            <ChevronLeft size={18} />
          </Link>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#f0f0f5', margin: 0, letterSpacing: '-0.02em' }}>Paramètres</h1>
        </div>
      </div>

      <div style={{ padding: '20px 16px 48px', display: 'flex', flexDirection: 'column', gap: '0' }}>

        {/* Thème */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }} style={{ position: 'relative', marginTop: '28px' }}>
          <div style={{ position: 'absolute', top: '-22px', left: '18px', zIndex: 2, fontSize: '2.4rem', lineHeight: 1, filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.4))' }}>🎨</div>
          <div style={{ borderRadius: '24px', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0,0,0,0.35)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '5px', background: `linear-gradient(180deg, ${theme.from}, ${theme.to})`, borderRadius: '24px 0 0 24px' }} />
            <div style={{ paddingLeft: '12px' }}>
              <div style={{ padding: '18px 20px 4px 12px' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: theme.from }}>APPARENCE</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0a0a0a', marginTop: '2px' }}>Thème de couleur</div>
              </div>
              {sections[0].content}
            </div>
          </div>
        </motion.div>

        {/* Audio & Notifs */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} style={{ position: 'relative', marginTop: '28px' }}>
          <div style={{ position: 'absolute', top: '-22px', left: '18px', zIndex: 2, fontSize: '2.4rem', lineHeight: 1, filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.4))' }}>🔊</div>
          <div style={{ borderRadius: '24px', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0,0,0,0.35)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '5px', background: 'linear-gradient(180deg, #3b82f6, #6366f1)', borderRadius: '24px 0 0 24px' }} />
            <div style={{ paddingLeft: '12px' }}>
              <div style={{ padding: '18px 20px 4px 12px' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: '#3b82f6' }}>AUDIO</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0a0a0a', marginTop: '2px' }}>Sons & Notifications</div>
              </div>
              <div style={{ padding: '8px 20px 16px 12px', display: 'flex', flexDirection: 'column', gap: '0' }}>
                {audioRows.map((row, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '14px 0',
                      borderBottom: i < audioRows.length - 1 ? '1px solid rgba(0,0,0,0.07)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${theme.from}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {row.icon}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#111' }}>{row.label}</div>
                        <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '1px' }}>{row.sub}</div>
                      </div>
                    </div>
                    <Toggle value={row.value} onChange={row.toggle} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Flower+ */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} style={{ position: 'relative', marginTop: '28px' }}>
          <div style={{ position: 'absolute', top: '-22px', left: '18px', zIndex: 2, fontSize: '2.4rem', lineHeight: 1, filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.4))' }}>✦</div>
          <Link href="/pricing" style={{ textDecoration: 'none', display: 'block' }}>
            <div style={{ borderRadius: '24px', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0,0,0,0.35)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '5px', background: 'linear-gradient(180deg, #f59e0b, #f97316)', borderRadius: '24px 0 0 24px' }} />
              <div style={{ paddingLeft: '12px', padding: '20px 20px 20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: '#f59e0b' }}>ABONNEMENT</span>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0a0a0a', marginTop: '2px' }}>Flower+</div>
                  <div style={{ fontSize: '0.78rem', color: '#777', marginTop: '3px' }}>Tous les modes · à partir de 4,99€/mois</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #f59e0b, #f97316)', borderRadius: '10px', padding: '8px 14px' }}>
                  <Crown size={13} color="#fff" />
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>Voir</span>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Danger zone */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} style={{ position: 'relative', marginTop: '28px' }}>
          <div style={{ position: 'absolute', top: '-22px', left: '18px', zIndex: 2, fontSize: '2.4rem', lineHeight: 1, filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.4))' }}>⚠️</div>
          <div style={{ borderRadius: '24px', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0,0,0,0.35)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '5px', background: 'linear-gradient(180deg, #ef4444, #b91c1c)', borderRadius: '24px 0 0 24px' }} />
            <div style={{ paddingLeft: '12px' }}>
              <div style={{ padding: '18px 20px 4px 12px' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: '#ef4444' }}>DONNÉES</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0a0a0a', marginTop: '2px' }}>Zone dangereuse</div>
              </div>

              {!showDeleteConfirm ? (
                <div style={{ padding: '12px 20px 20px 12px' }}>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    style={{
                      width: '100%', padding: '14px', borderRadius: '14px', border: '1.5px solid rgba(239,68,68,0.30)',
                      background: 'rgba(239,68,68,0.07)', color: '#dc2626', fontWeight: 700, fontSize: '0.9rem',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    }}
                  >
                    <Trash2 size={15} />
                    Supprimer mes données locales
                  </button>
                </div>
              ) : (
                <div style={{ padding: '12px 20px 20px 12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <p style={{ fontSize: '0.85rem', color: '#555', lineHeight: 1.5, margin: 0 }}>
                    Toutes tes données locales seront supprimées. Cette action est irréversible.
                  </p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={deleteData}
                      style={{ flex: 1, padding: '13px', borderRadius: '14px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: '0.88rem' }}
                    >
                      Confirmer
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      style={{ flex: 1, padding: '13px', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.12)', background: 'rgba(0,0,0,0.05)', color: '#555', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem' }}
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Version */}
        <p style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(240,240,245,0.25)', marginTop: '32px', fontWeight: 600, letterSpacing: '.05em' }}>
          FLOWER · v1.0
        </p>
      </div>
    </div>
  )
}
