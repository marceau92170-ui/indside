'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Suspense } from 'react'

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
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('id')
        .eq('code', code.toUpperCase().trim())
        .single()

      if (roomError || !room) {
        setError('Salle introuvable. Vérifie le code 🤔')
        setLoading(false)
        return
      }

      const { data: user, error: userError } = await supabase
        .from('users')
        .insert({ room_id: room.id, nickname: nickname.trim() })
        .select()
        .single()

      if (userError) throw userError

      localStorage.setItem(`inside_user_${code.toUpperCase().trim()}`, user.id)
      router.push(`/room/${code.toUpperCase().trim()}`)
    } catch (err) {
      console.error(err)
      setError('Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/" className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg">
          ←
        </Link>
        <h1 className="text-2xl font-black">Rejoindre une salle</h1>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-6">
        {/* Illustration */}
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-blue-500/30 text-5xl">
            🚪
          </div>
          <p className="text-white/50 text-center text-base max-w-xs">
            Entre le code partagé par ton ami pour rejoindre sa salle
          </p>
        </div>

        {/* Code input */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-white/60 uppercase tracking-wider">Code de la salle</label>
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase().slice(0, 6))}
            placeholder="EX: AB1234"
            maxLength={6}
            className="w-full py-5 px-5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 text-2xl font-black tracking-[0.3em] text-center focus:outline-none focus:border-purple-500/80 focus:bg-white/15 uppercase"
          />
        </div>

        {/* Nickname input */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-white/60 uppercase tracking-wider">Ton pseudo</label>
          <input
            type="text"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            placeholder="Ex : Sarah 🌸"
            maxLength={20}
            className="w-full py-4 px-5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 text-lg font-medium focus:outline-none focus:border-purple-500/80 focus:bg-white/15"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="py-3 px-4 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleJoin}
          disabled={loading}
          className="w-full py-5 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-lg shadow-2xl shadow-blue-500/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Connexion…
            </span>
          ) : '🚀 Rejoindre'}
        </button>
      </div>
    </div>
  )
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white/50">Chargement…</div>}>
      <JoinForm />
    </Suspense>
  )
}
