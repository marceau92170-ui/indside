'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Room, Question } from '@/lib/types'
import { Suspense } from 'react'

function RoomContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const code = (params.code as string).toUpperCase()
  const isHost = searchParams.get('host') === 'true'

  const [room, setRoom] = useState<Room | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)
  const [participantCount, setParticipantCount] = useState(0)
  const [answeredCount, setAnsweredCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [showNicknamePrompt, setShowNicknamePrompt] = useState(false)
  const [nickname, setNickname] = useState('')
  const [joining, setJoining] = useState(false)

  const loadRoom = useCallback(async () => {
    const { data: roomData } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', code)
      .single()

    if (!roomData) {
      router.push('/?error=notfound')
      return
    }

    setRoom(roomData)

    const { data: qs } = await supabase
      .from('questions')
      .select('*')
      .eq('room_id', roomData.id)
      .order('order_index')

    setQuestions(qs || [])

    // Check if user already exists
    const storedUserId = localStorage.getItem(`inside_user_${code}`)
    if (storedUserId) {
      setUserId(storedUserId)
      // Check how many questions already answered
      const { data: existingAnswers } = await supabase
        .from('answers')
        .select('id')
        .eq('user_id', storedUserId)
      if (existingAnswers && existingAnswers.length >= (qs || []).length && (qs || []).length > 0) {
        setDone(true)
      } else {
        setCurrentIndex(existingAnswers?.length || 0)
      }
    } else if (isHost) {
      // Host created the room — ask for their nickname too
      setShowNicknamePrompt(true)
    } else {
      // Not joined yet, redirect to join
      router.push(`/join?code=${code}`)
      return
    }

    // Load participant count
    const { count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', roomData.id)
    setParticipantCount(count || 0)

    setLoading(false)
  }, [code, isHost, router])

  useEffect(() => {
    loadRoom()
  }, [loadRoom])

  // Realtime subscription for participant count
  useEffect(() => {
    if (!room) return
    const channel = supabase
      .channel(`room-${room.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'users', filter: `room_id=eq.${room.id}` }, () => {
        setParticipantCount(prev => prev + 1)
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'answers' }, () => {
        setAnsweredCount(prev => prev + 1)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [room])

  const handleAnswer = async (value: boolean) => {
    if (!userId || !questions[currentIndex] || submitting) return
    setSubmitting(true)

    const { error } = await supabase
      .from('answers')
      .insert({ user_id: userId, question_id: questions[currentIndex].id, value })

    if (!error) {
      if (currentIndex + 1 >= questions.length) {
        setDone(true)
      } else {
        setCurrentIndex(prev => prev + 1)
      }
    }
    setSubmitting(false)
  }

  const handleHostJoin = async () => {
    if (!nickname.trim() || !room) return
    setJoining(true)
    const { data: user, error } = await supabase
      .from('users')
      .insert({ room_id: room.id, nickname: nickname.trim() })
      .select()
      .single()
    if (!error && user) {
      localStorage.setItem(`inside_user_${code}`, user.id)
      setUserId(user.id)
      setParticipantCount(prev => prev + 1)
    }
    setShowNicknamePrompt(false)
    setJoining(false)
    setLoading(false)
  }

  const copyCode = async () => {
    await navigator.clipboard.writeText(code)
  }

  const shareRoom = async () => {
    const url = `${window.location.origin}/join?code=${code}`
    if (navigator.share) {
      await navigator.share({ title: `Inside — ${room?.name}`, url })
    } else {
      await navigator.clipboard.writeText(url)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 animate-pulse" />
          <p className="text-white/50">Chargement…</p>
        </div>
      </div>
    )
  }

  // Host nickname prompt
  if (showNicknamePrompt) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-6">
        <div className="text-5xl">🎭</div>
        <div className="text-center">
          <h2 className="text-2xl font-black mb-2">Ton pseudo</h2>
          <p className="text-white/50">Participe toi aussi au quiz !</p>
        </div>
        <input
          type="text"
          value={nickname}
          onChange={e => setNickname(e.target.value)}
          placeholder="Ton prénom…"
          onKeyDown={e => e.key === 'Enter' && handleHostJoin()}
          className="w-full max-w-sm py-4 px-5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 text-lg font-medium focus:outline-none focus:border-purple-500/80"
        />
        <button
          onClick={handleHostJoin}
          disabled={joining || !nickname.trim()}
          className="w-full max-w-sm py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 font-bold text-lg active:scale-95 disabled:opacity-50"
        >
          Commencer 🚀
        </button>
      </div>
    )
  }

  // Done screen
  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-6 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-600/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-pink-600/30 rounded-full blur-3xl" />
        </div>
        <div className="z-10 flex flex-col items-center gap-6 text-center">
          <div className="text-7xl animate-bounce">🎉</div>
          <div>
            <h2 className="text-3xl font-black mb-2">C&apos;est terminé !</h2>
            <p className="text-white/50 text-lg">Tu as répondu à toutes les questions</p>
          </div>

          {/* Share code */}
          <div className="w-full bg-white/10 rounded-2xl p-4 flex flex-col gap-3">
            <p className="text-sm text-white/50 font-medium">Invite tes amis à rejoindre</p>
            <div className="flex gap-2">
              <div className="flex-1 py-3 px-4 rounded-xl bg-white/10 text-center font-black text-2xl tracking-widest">
                {code}
              </div>
              <button onClick={copyCode} className="px-4 rounded-xl bg-white/10 active:scale-95 text-xl">
                📋
              </button>
            </div>
            <button
              onClick={shareRoom}
              className="w-full py-3 rounded-xl bg-white/10 text-white font-semibold active:scale-95"
            >
              🔗 Partager le lien
            </button>
          </div>

          <button
            onClick={() => router.push(`/room/${code}/results`)}
            className="w-full py-5 rounded-2xl bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 text-white font-bold text-lg shadow-2xl shadow-purple-500/30 active:scale-95"
          >
            🔍 Voir les résultats
          </button>
        </div>
      </div>
    )
  }

  const question = questions[currentIndex]
  const progress = (currentIndex / questions.length) * 100

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background image */}
      {room?.image_url && (
        <>
          <img
            src={room.image_url}
            alt="background"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/80" />
        </>
      )}
      {!room?.image_url && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-pink-900" />
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen px-6 py-8 gap-4">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-xl font-black drop-shadow-lg">{room?.name}</h1>
            <p className="text-white/70 text-sm">👥 {participantCount} participant{participantCount > 1 ? 's' : ''}</p>
          </div>
          <div className="py-2 px-3 rounded-xl bg-black/40 backdrop-blur text-sm font-bold">
            {currentIndex + 1} / {questions.length}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question card */}
        <div className="flex-1 flex flex-col items-center justify-center gap-8">
          <div className="w-full bg-black/50 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
            <p className="text-sm text-white/50 font-semibold uppercase tracking-wider mb-4 text-center">Question {currentIndex + 1}</p>
            <p className="text-2xl font-black text-center leading-snug">
              {question?.text}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 w-full">
            <button
              onClick={() => handleAnswer(false)}
              disabled={submitting}
              className="flex-1 py-6 rounded-3xl bg-gradient-to-br from-red-500 to-rose-600 text-white font-black text-xl shadow-2xl shadow-red-500/40 active:scale-95 disabled:opacity-50 flex flex-col items-center gap-1"
            >
              <span className="text-3xl">❌</span>
              <span>Non</span>
            </button>
            <button
              onClick={() => handleAnswer(true)}
              disabled={submitting}
              className="flex-1 py-6 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-600 text-white font-black text-xl shadow-2xl shadow-green-500/40 active:scale-95 disabled:opacity-50 flex flex-col items-center gap-1"
            >
              <span className="text-3xl">✅</span>
              <span>Oui</span>
            </button>
          </div>
        </div>

        {/* Share code at bottom */}
        <div className="flex items-center justify-center gap-3 pb-2">
          <span className="text-white/40 text-sm">Code :</span>
          <button onClick={copyCode} className="font-black tracking-widest text-white/80 active:scale-95">
            {code}
          </button>
          <button onClick={copyCode} className="text-white/40 text-sm active:scale-95">📋</button>
        </div>
      </div>
    </div>
  )
}

export default function RoomPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white/50">Chargement…</div>}>
      <RoomContent />
    </Suspense>
  )
}
