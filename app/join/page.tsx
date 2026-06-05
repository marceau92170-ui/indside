'use client'

import { useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { getTheme, gradient, gradientShadow } from '@/lib/theme'

async function compressToBase64(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = 80
        canvas.height = 80
        const ctx = canvas.getContext('2d')!
        // crop to square from center
        const size = Math.min(img.width, img.height)
        const x = (img.width - size) / 2
        const y = (img.height - size) / 2
        ctx.drawImage(img, x, y, size, size, 0, 0, 80, 80)
        resolve(canvas.toDataURL('image/jpeg', 0.75))
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

function JoinForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const prefillCode = searchParams.get('code') || ''
  const theme = getTheme()
  const grad = gradient(theme)
  const shadow = gradientShadow(theme)

  const [code, setCode] = useState(prefillCode.toUpperCase())
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const compressed = await compressToBase64(file)
    setAvatarBase64(compressed)
    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  const handleJoin = async () => {
    if (!code.trim()) return setError('Entre le code de la salle')
    if (!nickname.trim()) return setError('Choisis un pseudo !')

    setLoading(true)
    setError('')

    try {
      const upperCode = code.toUpperCase().trim()

      // Fetch room by code
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', upperCode)
        .single()

      if (roomError || !room) {
        setError('Salle introuvable. Vérifie le code 🤔')
        setLoading(false)
        return
      }

      if (room.status === 'finished') {
        setError('Cette salle est déjà terminée 😅')
        setLoading(false)
        return
      }

      // Insert player
      const { data: player, error: playerError } = await supabase
        .from('players')
        .insert({
          room_id: room.id,
          nickname: nickname.trim(),
          is_host: false,
          avatar_url: avatarBase64 || null,
        })
        .select()
        .single()

      if (playerError || !player) throw new Error(playerError?.message || 'Failed to create player')

      // Save player id to localStorage
      localStorage.setItem(`flower_player_${upperCode}`, player.id)

      router.push(`/lobby/${upperCode}`)
    } catch (err) {
      console.error(err)
      setError('Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 relative overflow-hidden" style={{ background: '#08080f' }}>
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-20 w-[400px] h-[400px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.20) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute -bottom-40 -left-20 w-[400px] h-[400px] rounded-full" style={{ background: `radial-gradient(circle, ${theme.glowTo} 0%, transparent 70%)`, filter: 'blur(60px)' }} />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center gap-4 mb-2">
        <Link
          href="/"
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-bold"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)' }}
        >
          ←
        </Link>
        <h1 className="text-2xl font-black" style={{ color: '#f0f0f5' }}>Rejoindre</h1>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-5 relative z-10">
        {/* Code input */}
        <div className="card p-5">
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase().slice(0, 6))}
            placeholder="CODE"
            maxLength={6}
            className="w-full py-5 px-5 rounded-2xl text-white placeholder:text-white/25 text-3xl font-black tracking-[0.3em] text-center focus:outline-none uppercase"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.14)',
            }}
          />
        </div>

        {/* Nickname input */}
        <div className="card p-5">
          <input
            type="text"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            placeholder="Ton prénom"
            maxLength={20}
            className="w-full py-4 px-5 rounded-2xl text-white placeholder:text-white/25 text-lg font-semibold focus:outline-none"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.14)',
            }}
          />
        </div>

        {/* Avatar upload */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs font-semibold" style={{ color: 'rgba(240,240,245,0.45)' }}>Photo (optionnel)</p>
          <div className="relative">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: avatarBase64 ? 'transparent' : 'rgba(20,16,36,0.85)',
                backdropFilter: 'blur(12px)',
                border: `1px solid ${theme.from}66`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                overflow: 'hidden',
                padding: 0,
              }}
            >
              {avatarBase64 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarBase64}
                  alt="Aperçu"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                />
              ) : (
                <>
                  <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>📷</span>
                  <span style={{ color: 'rgba(240,240,245,0.55)', fontSize: '0.72rem', fontWeight: 600, marginTop: '4px' }}>Photo</span>
                </>
              )}
            </button>
            {avatarBase64 && (
              <button
                type="button"
                onClick={() => setAvatarBase64(null)}
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: 'rgba(239,68,68,0.85)',
                  border: '1.5px solid rgba(0,0,0,0.5)',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="user"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="py-3 px-4 rounded-2xl text-sm font-semibold" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.30)', color: '#fca5a5' }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleJoin}
          disabled={loading}
          className="w-full py-5 rounded-2xl text-white font-bold text-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{
            background: grad,
            boxShadow: shadow,
          }}
        >
          {loading ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Connexion…
            </>
          ) : 'Entrer'}
        </button>
      </div>
    </div>
  )
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ color: 'rgba(240,240,245,0.50)' }}>Chargement…</div>}>
      <JoinForm />
    </Suspense>
  )
}
