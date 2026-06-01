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

  // Host nickname prompt
  if (showNicknamePrompt) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-6 relative overflow-hidden" style={{ background: '#08080f' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)', filter: 'blur(50px)' }} />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.20) 0%, transparent 70%)', filter: 'blur(50px)' }} />
        </div>
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl z-10"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', boxShadow: '0 20px 50px rgba(168,85,247,0.40)' }}
        >
          🎭
        </div>
        <div className="text-center z-10">
          <h2 className="text-2xl font-black mb-2" style={{ color: '#f0f0f5' }}>Ton pseudo</h2>
          <p style={{ color: 'rgba(240,240,245,0.50)' }}>Participe toi aussi au quiz !</p>
        </div>
        <input
          type="text"
          value={nickname}
          onChange={e => setNickname(e.target.value)}
          placeholder="Ton prénom…"
          onKeyDown={e => e.key === 'Enter' && handleHostJoin()}
          className="w-full max-w-sm py-4 px-5 rounded-2xl text-white placeholder:text-white/30 text-lg font-semibold focus:outline-none z-10"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)' }}
        />
        <button
          onClick={handleHostJoin}
          disabled={joining || !nickname.trim()}
          className="w-full max-w-sm py-5 rounded-2xl text-white font-bold text-lg active:scale-95 disabled:opacity-50 z-10"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #a855f7, #ec4899)', boxShadow: '0 10px 40px rgba(168,85,247,0.30)' }}
        >
          Commencer 🚀
        </button>
      </div>
    )
  }

  // Done screen
  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-6 relative overflow-hidden" style={{ background: '#08080f' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)', filter: 'blur(50px)' }} />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.22) 0%, transparent 70%)', filter: 'blur(50px)' }} />
        </div>

        <div className="z-10 flex flex-col items-center gap-6 text-center w-full">
          {/* Confetti emoji burst */}
          <div className="flex gap-2 text-3xl animate-fade-up">
            <span>🎊</span><span>🎉</span><span>✨</span><span>🎈</span><span>🎊</span>
          </div>
          <div className="animate-fade-up" style={{ animationDelay: '0.05s' }}>
            <h2 className="text-3xl font-black mb-2" style={{ color: '#f0f0f5' }}>C&apos;est terminé ! 🎉</h2>
            <p style={{ color: 'rgba(240,240,245,0.55)', fontSize: '1.1rem' }}>Tu as répondu à toutes les questions</p>
          </div>

          {/* Share code */}
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
                📋
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

  const question = questions[currentIndex]
  const progress = (currentIndex / questions.length) * 100

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background */}
      {room?.image_url && (
        <>
          <img
            src={room.image_url}
            alt="background"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.60) 0%, transparent 40%, rgba(0,0,0,0.80) 100%)' }} />
        </>
      )}
      {!room?.image_url && (
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #0c1a3d 50%, #2d0a2e 100%)' }} />
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen px-6 py-8 gap-4">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-black drop-shadow-lg" style={{ color: '#f0f0f5', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>{room?.name}</h1>
          <div className="flex items-center gap-2">
            <div className="py-1.5 px-3 rounded-full text-sm font-bold" style={{ background: 'rgba(0,0,0,0.40)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)' }}>
              👥 {participantCount}
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
          <button onClick={copyCode} className="text-sm active:scale-95" style={{ color: 'rgba(240,240,245,0.35)' }}>📋</button>
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
