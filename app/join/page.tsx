'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { supabase } from '@/lib/supabase'

function JoinForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const prefillCode = searchParams.get('code') || ''

  const [code, setCode] = useState(prefillCode.toUpperCase())
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
        })
        .select()
        .single()

      if (playerError || !player) throw new Error(playerError?.message || 'Failed to create player')

      // Save player id to localStorage
      localStorage.setItem(`inside_player_${upperCode}`, player.id)

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
        <div className="absolute -bottom-40 -left-20 w-[400px] h-[400px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)', filter: 'blur(60px)' }} />
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
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            boxShadow: '0 10px 40px rgba(59,130,246,0.30)',
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
