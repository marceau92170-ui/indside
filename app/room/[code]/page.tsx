'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import type { Room, Question, Player } from '@/lib/types'

// Avatar color palette
const AVATAR_COLORS = [
  'linear-gradient(135deg, #8b5cf6, #ec4899)',
  'linear-gradient(135deg, #3b82f6, #8b5cf6)',
  'linear-gradient(135deg, #10b981, #3b82f6)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #ec4899, #f97316)',
  'linear-gradient(135deg, #06b6d4, #8b5cf6)',
]

function RoomContent() {
  const params = useParams()
  const router = useRouter()
  const code = (params.code as string).toUpperCase()

  const [room, setRoom] = useState<Room | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [isHost, setIsHost] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [copied, setCopied] = useState(false)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const loadRoom = useCallback(async () => {
    // Fetch room by code
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', code)
      .single()

    if (roomError || !roomData) {
      router.push('/?error=notfound')
      return
    }
    setRoom(roomData)

    // Get player from localStorage
    const storedPlayerId = localStorage.getItem(`inside_player_${code}`)
    if (!storedPlayerId) {
      router.push(`/join?code=${code}`)
      return
    }
    setPlayerId(storedPlayerId)

    // Fetch player info
    const { data: playerData } = await supabase
      .from('players')
      .select('*')
      .eq('id', storedPlayerId)
      .single()
    if (playerData) {
      setIsHost(playerData.is_host)
    }

    // Fetch questions
    const { data: qs } = await supabase
      .from('questions')
      .select('*')
      .eq('room_id', roomData.id)
      .order('order_index', { ascending: true })
    const questionsData: Question[] = qs ?? []
    setQuestions(questionsData)

    // Fetch players list
    const { data: playersData } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', roomData.id)
      .order('created_at', { ascending: true })
    setPlayers(playersData ?? [])

    // Check if player already answered all questions
    if (questionsData.length > 0) {
      const { count: answerCount } = await supabase
        .from('answers')
        .select('*', { count: 'exact', head: true })
        .eq('player_id', storedPlayerId)
      if ((answerCount ?? 0) >= questionsData.length) {
        setDone(true)
        setCurrentIndex(questionsData.length)
      } else {
        setCurrentIndex(answerCount ?? 0)
      }
    }

    // If already finished, redirect
    if (roomData.status === 'finished') {
      router.push(`/room/${code}/results`)
      return
    }

    setLoading(false)
  }, [code, router])

  useEffect(() => {
    loadRoom()
  }, [loadRoom])

  // Realtime subscriptions
  useEffect(() => {
    if (!room) return

    // Clean up previous channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
    }

    const channel = supabase.channel(`room-${room.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'players',
        filter: `room_id=eq.${room.id}`,
      }, (payload) => {
        setPlayers(prev => {
          if (prev.find(p => p.id === (payload.new as Player).id)) return prev
          return [...prev, payload.new as Player]
        })
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'rooms',
        filter: `id=eq.${room.id}`,
      }, (payload) => {
        const updated = payload.new as Room
        setRoom(updated)
        if (updated.status === 'finished') {
          router.push(`/room/${code}/results`)
        }
      })
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [room?.id, code, router])

  const launchGame = async () => {
    if (!room) return
    await supabase.from('rooms').update({ status: 'playing' }).eq('id', room.id)
  }

  const checkAllDone = async (roomId: string) => {
    const { count: playerCount } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', roomId)

    const { data: questionIds } = await supabase
      .from('questions')
      .select('id')
      .eq('room_id', roomId)

    const totalQuestions = questionIds?.length ?? 0
    const expectedAnswers = (playerCount ?? 0) * totalQuestions

    if (expectedAnswers === 0) return

    const { count: actualAnswers } = await supabase
      .from('answers')
      .select('*', { count: 'exact', head: true })
      .in('question_id', questionIds?.map(q => q.id) ?? [])

    if (actualAnswers === expectedAnswers) {
      await supabase.from('rooms').update({ status: 'finished' }).eq('id', roomId)
    }
  }

  const handleAnswer = async (value: boolean) => {
    if (!playerId || !questions[currentIndex] || submitting || !room) return
    setSubmitting(true)

    const { error } = await supabase.from('answers').insert({
      player_id: playerId,
      question_id: questions[currentIndex].id,
      value,
    })

    if (!error) {
      const nextIndex = currentIndex + 1
      if (nextIndex >= questions.length) {
        setDone(true)
        setCurrentIndex(nextIndex)
        await checkAllDone(room.id)
      } else {
        setCurrentIndex(nextIndex)
      }
    }
    setSubmitting(false)
  }

  const copyCode = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareRoom = async () => {
    const url = `${window.location.origin}/join?code=${code}`
    if (navigator.share) {
      await navigator.share({ title: `Inside — ${room?.name}`, url })
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#08080f' }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl animate-spin"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #a855f7, #ec4899)',
              boxShadow: '0 0 30px rgba(168,85,247,0.4)',
            }}
          />
          <p style={{ color: 'rgba(240,240,245,0.50)' }}>Chargement…</p>
        </div>
      </div>
    )
  }

  // ── WAITING ROOM ──
  if (room?.status === 'waiting') {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        {/* Background */}
        {room.image_url ? (
          <>
            <img src={room.image_url} alt="background" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.85) 100%)' }} />
          </>
        ) : (
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #0c1a3d 50%, #2d0a2e 100%)' }} />
        )}

        <div className="relative z-10 flex flex-col min-h-screen px-6 py-10 gap-6">
          {/* Room name + code */}
          <div className="flex flex-col items-center gap-3 text-center pt-4">
            <h1 className="text-3xl font-black drop-shadow-lg" style={{ color: '#f0f0f5', textShadow: '0 2px 16px rgba(0,0,0,0.7)' }}>
              {room.name}
            </h1>
            <button
              onClick={copyCode}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full active:scale-95"
              style={{ background: 'rgba(0,0,0,0.50)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.20)' }}
            >
              <span className="font-black tracking-[0.25em] text-lg" style={{ color: '#f0f0f5' }}>{code}</span>
              <span className="text-base">{copied ? '✅' : '📋'}</span>
            </button>
          </div>

          {/* Players list */}
          <div
            className="flex-1 flex flex-col gap-4 rounded-3xl p-6"
            style={{ background: 'rgba(0,0,0,0.40)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            <p className="text-sm font-bold uppercase tracking-widest text-center" style={{ color: 'rgba(240,240,245,0.55)' }}>
              {players.length} joueur{players.length > 1 ? 's' : ''} connecté{players.length > 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-3 gap-4">
              {players.map((p, i) => (
                <div key={p.id} className="flex flex-col items-center gap-2">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white"
                    style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length], boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}
                  >
                    {p.nickname.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-center truncate w-full text-center" style={{ color: 'rgba(240,240,245,0.80)' }}>
                    {p.nickname}{p.is_host ? ' 👑' : ''}
                  </span>
                </div>
              ))}
            </div>

            {players.length === 0 && (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-center" style={{ color: 'rgba(240,240,245,0.35)' }}>En attente de joueurs…</p>
              </div>
            )}
          </div>

          {/* Bottom actions */}
          <div className="flex flex-col gap-3">
            {isHost ? (
              <button
                onClick={launchGame}
                disabled={players.length < 1}
                className="w-full py-5 rounded-2xl text-white font-black text-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #a855f7, #ec4899)',
                  boxShadow: '0 12px 40px rgba(168,85,247,0.45)',
                }}
              >
                🚀 Lancer la partie
              </button>
            ) : (
              <div
                className="w-full py-5 rounded-2xl text-center font-semibold"
                style={{ background: 'rgba(0,0,0,0.40)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(240,240,245,0.55)' }}
              >
                <span className="animate-pulse">En attente du créateur pour lancer…</span>
              </div>
            )}

            {/* Share row */}
            <div className="flex items-center gap-2">
              <div
                className="flex-1 py-3 px-4 rounded-2xl text-center font-black tracking-widest"
                style={{ background: 'rgba(0,0,0,0.40)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(240,240,245,0.75)' }}
              >
                {code}
              </div>
              <button
                onClick={copyCode}
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl active:scale-95"
                style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.14)' }}
              >
                {copied ? '✅' : '📋'}
              </button>
              <button
                onClick={shareRoom}
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl active:scale-95"
                style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.14)' }}
              >
                🔗
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── DONE SCREEN ──
  if (done || room?.status === 'finished') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-6 relative overflow-hidden" style={{ background: '#08080f' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)', filter: 'blur(50px)' }} />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.22) 0%, transparent 70%)', filter: 'blur(50px)' }} />
        </div>

        <div className="z-10 flex flex-col items-center gap-6 text-center w-full">
          <div className="flex gap-2 text-3xl animate-fade-up">
            <span>🎊</span><span>🎉</span><span>✨</span><span>🎈</span><span>🎊</span>
          </div>
          <div className="animate-fade-up" style={{ animationDelay: '0.05s' }}>
            <h2 className="text-3xl font-black mb-2" style={{ color: '#f0f0f5' }}>C&apos;est terminé ! 🎉</h2>
            <p style={{ color: 'rgba(240,240,245,0.55)', fontSize: '1.1rem' }}>Tu as répondu à toutes les questions</p>
          </div>

          <div className="w-full card p-5 flex flex-col gap-3 animate-fade-up" style={{ animationDelay: '0.10s' }}>
            <p className="text-sm font-semibold" style={{ color: 'rgba(240,240,245,0.50)' }}>Invite tes amis à rejoindre</p>
            <div className="flex gap-2">
              <div
                className="flex-1 py-3 px-4 rounded-2xl text-center font-black text-2xl tracking-widest"
                style={{ background: 'rgba(255,255,255,0.08)', color: '#f0f0f5' }}
              >
                {code}
              </div>
              <button
                onClick={copyCode}
                className="px-4 rounded-2xl text-xl active:scale-95"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                {copied ? '✅' : '📋'}
              </button>
            </div>
            <button
              onClick={shareRoom}
              className="w-full py-3 rounded-2xl font-semibold active:scale-95"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#f0f0f5' }}
            >
              🔗 Partager le lien
            </button>
          </div>

          <button
            onClick={() => router.push(`/room/${code}/results`)}
            className="btn-primary text-lg w-full active:scale-95 animate-fade-up flex items-center justify-center gap-2"
            style={{ animationDelay: '0.15s' }}
          >
            Voir les résultats 🔍
          </button>
        </div>
      </div>
    )
  }

  // ── QUIZ ──
  const question = questions[currentIndex]
  const progress = questions.length > 0 ? (currentIndex / questions.length) * 100 : 0

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background */}
      {room?.image_url ? (
        <>
          <img
            src={room.image_url}
            alt="background"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.60) 0%, transparent 40%, rgba(0,0,0,0.80) 100%)' }} />
        </>
      ) : (
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #0c1a3d 50%, #2d0a2e 100%)' }} />
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen px-6 py-8 gap-4">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-black drop-shadow-lg" style={{ color: '#f0f0f5', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>{room?.name}</h1>
          <div className="flex items-center gap-2">
            <div className="py-1.5 px-3 rounded-full text-sm font-bold" style={{ background: 'rgba(0,0,0,0.40)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)' }}>
              👥 {players.length}
            </div>
            <div className="py-1.5 px-3 rounded-full text-sm font-black" style={{ background: 'rgba(0,0,0,0.40)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)' }}>
              {currentIndex + 1}/{questions.length}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #a855f7, #ec4899)' }}
          />
        </div>

        {/* Question card */}
        <div className="flex-1 flex flex-col items-center justify-center gap-8">
          <div
            className="w-full p-8 rounded-3xl"
            style={{
              background: 'rgba(0,0,0,0.50)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.18)',
            }}
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-5 text-center" style={{ color: 'rgba(240,240,245,0.50)' }}>
              Question {currentIndex + 1}
            </p>
            <p className="text-2xl font-black text-center leading-snug" style={{ color: '#f0f0f5' }}>
              {question?.text}
            </p>
          </div>

          {/* Answer buttons */}
          <div className="flex gap-4 w-full">
            <button
              onClick={() => handleAnswer(false)}
              disabled={submitting}
              className="flex-1 py-7 rounded-3xl text-white font-black text-xl active:scale-95 disabled:opacity-50 flex flex-col items-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #ef4444, #e11d48)',
                boxShadow: '0 16px 40px rgba(239,68,68,0.40)',
              }}
            >
              <span className="text-3xl">❌</span>
              <span>Non</span>
            </button>
            <button
              onClick={() => handleAnswer(true)}
              disabled={submitting}
              className="flex-1 py-7 rounded-3xl text-white font-black text-xl active:scale-95 disabled:opacity-50 flex flex-col items-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #10b981, #22c55e)',
                boxShadow: '0 16px 40px rgba(16,185,129,0.40)',
              }}
            >
              <span className="text-3xl">✅</span>
              <span>Oui</span>
            </button>
          </div>
        </div>

        {/* Share code at bottom */}
        <div className="flex items-center justify-center gap-2 pb-2">
          <span className="text-sm" style={{ color: 'rgba(240,240,245,0.35)' }}>Code :</span>
          <button onClick={copyCode} className="font-black tracking-widest active:scale-95" style={{ color: 'rgba(240,240,245,0.75)' }}>
            {code}
          </button>
          <button onClick={copyCode} className="text-sm active:scale-95" style={{ color: 'rgba(240,240,245,0.35)' }}>
            {copied ? '✅' : '📋'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function RoomPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ color: 'rgba(240,240,245,0.50)' }}>Chargement…</div>}>
      <RoomContent />
    </Suspense>
  )
}
