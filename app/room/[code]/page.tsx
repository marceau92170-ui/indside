'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { getDoubleQuestionIndex } from '@/lib/game'
import { playDing, playCountdownBeep, playWhoosh, playReveal, startAmbientMusic, stopAmbientMusic, setMusicVolume } from '@/lib/sound'
import type { Room, Question, Player } from '@/lib/types'

const AVATAR_COLORS = [
  'linear-gradient(135deg, #8b5cf6, #ec4899)',
  'linear-gradient(135deg, #3b82f6, #8b5cf6)',
  'linear-gradient(135deg, #10b981, #3b82f6)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #ec4899, #f97316)',
  'linear-gradient(135deg, #06b6d4, #8b5cf6)',
]

const REACTION_EMOJIS = ['😂', '🔥', '😳', '💀', '🤯', '👀']
const QUESTION_DURATION = 30

interface FloatingReaction {
  id: number
  emoji: string
  x: number
}

function RoomContent() {
  const params = useParams()
  const router = useRouter()
  const code = (params.code as string).toUpperCase()

  const [room, setRoom] = useState<Room | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [isHost, setIsHost] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)

  // Answering phase
  const [hasAnsweredCurrent, setHasAnsweredCurrent] = useState(false)
  const [answeredPlayerIds, setAnsweredPlayerIds] = useState<Set<string>>(new Set())

  // Reveal counts
  const [revealCounts, setRevealCounts] = useState<{ yes: number; no: number }>({ yes: 0, no: 0 })

  // Timer
  const [timeLeft, setTimeLeft] = useState(QUESTION_DURATION)

  // Reactions
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([])
  const reactionCounterRef = useRef(0)

  // Countdown overlay
  const [countdown, setCountdown] = useState<number | null>(null)

  // Floating pts bonus
  const [showPtsBonus, setShowPtsBonus] = useState<string | null>(null)

  // Track my answer for current question
  const [myAnswer, setMyAnswer] = useState<boolean | null>(null)
  const myAnswerRef = useRef<boolean | null>(null)

  // Music toggle
  const [musicOn, setMusicOn] = useState(true)

  // Refs
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const reactionsChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const questionsRef = useRef<Question[]>([])
  const roomRef = useRef<Room | null>(null)
  const playerIdRef = useRef<string | null>(null)
  const isHostRef = useRef(false)
  const answeredPlayerIdsRef = useRef<Set<string>>(new Set())
  const playersRef = useRef<Player[]>([])
  const hasAutoRevealedRef = useRef(false)

  // Keep refs in sync
  useEffect(() => { questionsRef.current = questions }, [questions])
  useEffect(() => { roomRef.current = room }, [room])
  useEffect(() => { playerIdRef.current = playerId }, [playerId])
  useEffect(() => { isHostRef.current = isHost }, [isHost])
  useEffect(() => { answeredPlayerIdsRef.current = answeredPlayerIds }, [answeredPlayerIds])
  useEffect(() => { playersRef.current = players }, [players])
  useEffect(() => { myAnswerRef.current = myAnswer }, [myAnswer])

  const loadRoom = useCallback(async () => {
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
    roomRef.current = roomData

    const storedPlayerId = localStorage.getItem(`inside_player_${code}`)
    if (!storedPlayerId) {
      router.push(`/join?code=${code}`)
      return
    }
    setPlayerId(storedPlayerId)
    playerIdRef.current = storedPlayerId

    const { data: playerData } = await supabase
      .from('players')
      .select('*')
      .eq('id', storedPlayerId)
      .single()
    if (playerData) {
      setIsHost(playerData.is_host)
      isHostRef.current = playerData.is_host
    }

    const { data: qs } = await supabase
      .from('questions')
      .select('*')
      .eq('room_id', roomData.id)
      .order('order_index', { ascending: true })
    const questionsData: Question[] = qs ?? []
    setQuestions(questionsData)
    questionsRef.current = questionsData

    const { data: playersData } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', roomData.id)
      .order('created_at', { ascending: true })
    setPlayers(playersData ?? [])
    playersRef.current = playersData ?? []

    if (roomData.status === 'finished') {
      router.push(`/room/${code}/results`)
      return
    }

    // Load existing answers for current question
    if (roomData.status === 'playing' && questionsData.length > 0) {
      const currentQ = questionsData[roomData.current_question_index ?? 0]
      if (currentQ) {
        const { data: existingAnswers } = await supabase
          .from('answers')
          .select('player_id, value')
          .eq('question_id', currentQ.id)

        if (existingAnswers) {
          const ids = new Set(existingAnswers.map((a: { player_id: string }) => a.player_id))
          setAnsweredPlayerIds(ids)
          answeredPlayerIdsRef.current = ids

          if (ids.has(storedPlayerId)) {
            setHasAnsweredCurrent(true)
          }

          if (roomData.question_phase === 'revealing') {
            const yes = existingAnswers.filter((a: { value: boolean }) => a.value).length
            const no = existingAnswers.filter((a: { value: boolean }) => !a.value).length
            setRevealCounts({ yes, no })
          }
        }
      }
    }

    setLoading(false)
  }, [code, router])

  useEffect(() => {
    loadRoom()
  }, [loadRoom])

  // Start ambient music when game is playing
  useEffect(() => {
    if (room?.status === 'playing') {
      startAmbientMusic()
    }
  }, [room?.status])

  // Stop music on unmount
  useEffect(() => {
    return () => {
      stopAmbientMusic()
    }
  }, [])

  // Timer
  useEffect(() => {
    if (!room || room.status !== 'playing' || room.question_phase !== 'answering') {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }
    if (!room.question_started_at) return

    const startedAt = new Date(room.question_started_at).getTime()

    const tick = () => {
      const elapsed = (Date.now() - startedAt) / 1000
      const left = Math.max(0, Math.ceil(QUESTION_DURATION - elapsed))
      setTimeLeft(left)

      if (left === 0 && isHostRef.current && roomRef.current?.question_phase === 'answering') {
        if (timerRef.current) clearInterval(timerRef.current)
        triggerReveal()
      }
    }
    tick()
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(tick, 500)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.question_started_at, room?.question_phase, room?.status])

  // Auto-reveal when all answered
  useEffect(() => {
    if (!room || room.question_phase !== 'answering' || !isHost) return
    if (players.length === 0) return
    if (answeredPlayerIds.size >= players.length && !hasAutoRevealedRef.current) {
      hasAutoRevealedRef.current = true
      setTimeout(() => triggerReveal(), 800)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answeredPlayerIds.size, players.length, room?.question_phase, isHost])

  const triggerReveal = async () => {
    const r = roomRef.current
    if (!r || r.question_phase !== 'answering') return
    await supabase.from('rooms').update({ question_phase: 'revealing' }).eq('id', r.id)
  }

  // Realtime
  useEffect(() => {
    if (!room) return

    if (channelRef.current) supabase.removeChannel(channelRef.current)

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
        const prev = roomRef.current

        // Question changed → reset local state + play whoosh
        if (prev && updated.current_question_index !== prev.current_question_index) {
          setHasAnsweredCurrent(false)
          setAnsweredPlayerIds(new Set())
          answeredPlayerIdsRef.current = new Set()
          setRevealCounts({ yes: 0, no: 0 })
          hasAutoRevealedRef.current = false
          setMyAnswer(null)
          myAnswerRef.current = null
          setShowPtsBonus(null)
          playWhoosh()
        }

        // Countdown when game starts (waiting → playing, index=0)
        if (prev && prev.status === 'waiting' && updated.status === 'playing' && updated.current_question_index === 0 && updated.question_phase === 'answering') {
          setCountdown(3)
        }

        // Play reveal sound when phase switches to revealing
        if (prev && prev.question_phase === 'answering' && updated.question_phase === 'revealing') {
          playReveal()
        }

        // Calculate pts bonus when phase switches to revealing
        if (prev && prev.question_phase === 'answering' && updated.question_phase === 'revealing') {
          const myAns = myAnswerRef.current
          if (myAns !== null) {
            // We'll show pts after a short delay; the exact majority is in revealCounts
            // Use setTimeout to let revealCounts update
            setTimeout(() => {
              setRevealCounts(rc => {
                const totalVotes = rc.yes + rc.no
                const majorityIsYes = rc.yes >= rc.no
                const inMajority = myAns === majorityIsYes
                const qs = questionsRef.current
                const currentRoom = roomRef.current
                const idx = currentRoom?.current_question_index ?? 0
                const doubleIdx = getDoubleQuestionIndex(qs)
                const isDouble = idx === doubleIdx
                const bonus = inMajority ? (isDouble ? 25 : 5) : 0
                const total = 1 + bonus
                if (totalVotes > 0) {
                  setShowPtsBonus(`+${total} pts`)
                  setTimeout(() => setShowPtsBonus(null), 2500)
                }
                return rc
              })
            }, 600)
          }
        }

        setRoom(updated)
        roomRef.current = updated

        if (updated.status === 'finished') {
          router.push(`/room/${code}/results`)
        }
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'answers',
      }, (payload) => {
        const answer = payload.new as { player_id: string; question_id: string; value: boolean }
        const currentQs = questionsRef.current
        const currentRoom = roomRef.current
        if (!currentRoom) return
        const currentQ = currentQs[currentRoom.current_question_index ?? 0]
        if (!currentQ || answer.question_id !== currentQ.id) return

        setAnsweredPlayerIds(prev => {
          const next = new Set(prev)
          next.add(answer.player_id)
          answeredPlayerIdsRef.current = next
          return next
        })

        setRevealCounts(prev => ({
          yes: prev.yes + (answer.value ? 1 : 0),
          no: prev.no + (!answer.value ? 1 : 0),
        }))
      })
      .subscribe()

    channelRef.current = channel

    return () => { supabase.removeChannel(channel) }
  }, [room?.id, code, router])

  // Reactions channel
  useEffect(() => {
    if (!room) return
    if (reactionsChannelRef.current) supabase.removeChannel(reactionsChannelRef.current)

    const rChannel = supabase.channel(`reactions-${room.id}`)
      .on('broadcast', { event: 'reaction' }, (payload) => {
        const emoji = payload.payload?.emoji as string
        if (!emoji) return
        const id = ++reactionCounterRef.current
        const x = 10 + Math.random() * 80
        setFloatingReactions(prev => [...prev, { id, emoji, x }])
        setTimeout(() => {
          setFloatingReactions(prev => prev.filter(r => r.id !== id))
        }, 2500)
      })
      .subscribe()

    reactionsChannelRef.current = rChannel
    return () => { supabase.removeChannel(rChannel) }
  }, [room?.id])

  // Countdown effect — play beep on each tick
  useEffect(() => {
    if (countdown === null) return
    if (countdown <= 0) {
      setCountdown(null)
      return
    }
    playCountdownBeep(countdown === 1)
    const timer = setTimeout(() => setCountdown(c => (c !== null ? c - 1 : null)), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  const sendReaction = async (emoji: string) => {
    if (!reactionsChannelRef.current) return
    await reactionsChannelRef.current.send({
      type: 'broadcast',
      event: 'reaction',
      payload: { emoji },
    })
  }

  const launchGame = async () => {
    if (!room) return
    await supabase.from('rooms').update({
      status: 'playing',
      current_question_index: 0,
      question_phase: 'answering',
      question_started_at: new Date().toISOString(),
    }).eq('id', room.id)
  }

  const handleAnswer = async (value: boolean) => {
    const r = roomRef.current
    const pid = playerIdRef.current
    if (!pid || !r || submitting || hasAnsweredCurrent) return
    const qs = questionsRef.current
    const currentQ = qs[r.current_question_index ?? 0]
    if (!currentQ) return

    setSubmitting(true)
    setHasAnsweredCurrent(true)
    setMyAnswer(value)
    myAnswerRef.current = value

    const { error } = await supabase.from('answers').insert({
      player_id: pid,
      question_id: currentQ.id,
      value,
    })

    if (error) {
      setHasAnsweredCurrent(false)
      setMyAnswer(null)
      myAnswerRef.current = null
    } else {
      playDing()
    }
    setSubmitting(false)
  }

  const handleNext = async () => {
    if (!room) return
    const nextIndex = (room.current_question_index ?? 0) + 1
    if (nextIndex >= questions.length) {
      await supabase.from('rooms').update({ status: 'finished' }).eq('id', room.id)
    } else {
      await supabase.from('rooms').update({
        current_question_index: nextIndex,
        question_phase: 'answering',
        question_started_at: new Date().toISOString(),
      }).eq('id', room.id)
    }
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
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #a855f7, #ec4899)', boxShadow: '0 0 30px rgba(168,85,247,0.4)' }}
          />
          <p style={{ color: 'rgba(240,240,245,0.50)' }}>Chargement…</p>
        </div>
      </div>
    )
  }

  // ── WAITING ROOM ──
  if (room?.status === 'waiting') {
    const joinUrl = typeof window !== 'undefined' ? `${window.location.origin}/join?code=${code}` : `https://inside.app/join?code=${code}`
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(joinUrl)}`

    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        {room.image_url ? (
          <>
            <img src={room.image_url} alt="background" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.85) 100%)' }} />
          </>
        ) : (
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #0c1a3d 50%, #2d0a2e 100%)' }} />
        )}

        <div className="relative z-10 flex flex-col min-h-screen px-6 py-10 gap-6">
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

          {/* QR Code */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="p-3 rounded-2xl"
              style={{ background: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrUrl} alt="QR Code" width={150} height={150} style={{ display: 'block', borderRadius: '8px' }} />
            </div>
            <p className="text-xs font-semibold" style={{ color: 'rgba(240,240,245,0.50)' }}>Scanner pour rejoindre</p>
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
              <motion.div whileTap={{ scale: 0.97 }}>
                <button
                  onClick={launchGame}
                  disabled={players.length < 1}
                  className="w-full py-5 rounded-2xl text-white font-black text-xl disabled:opacity-50 flex items-center justify-center gap-3"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #a855f7, #ec4899)', boxShadow: '0 12px 40px rgba(168,85,247,0.45)' }}
                >
                  🚀 Lancer la partie
                </button>
              </motion.div>
            ) : (
              <div
                className="w-full py-5 rounded-2xl text-center font-semibold"
                style={{ background: 'rgba(0,0,0,0.40)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(240,240,245,0.55)' }}
              >
                <span className="animate-pulse">En attente du créateur pour lancer…</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="flex-1 py-3 px-4 rounded-2xl text-center font-black tracking-widest" style={{ background: 'rgba(0,0,0,0.40)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(240,240,245,0.75)' }}>
                {code}
              </div>
              <button onClick={copyCode} className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl active:scale-95" style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.14)' }}>
                {copied ? '✅' : '📋'}
              </button>
              <button onClick={shareRoom} className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl active:scale-95" style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.14)' }}>
                🔗
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── PLAYING ──
  if (room?.status === 'playing') {
    const currentIndex = room.current_question_index ?? 0
    const question = questions[currentIndex]
    const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0
    const totalReveal = revealCounts.yes + revealCounts.no
    const yesPercent = totalReveal > 0 ? Math.round((revealCounts.yes / totalReveal) * 100) : 50
    const noPercent = totalReveal > 0 ? Math.round((revealCounts.no / totalReveal) * 100) : 50
    const timerPercent = (timeLeft / QUESTION_DURATION) * 100
    const timerColor = timeLeft > 15
      ? 'linear-gradient(90deg, #8b5cf6, #a855f7)'
      : timeLeft > 7
        ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
        : 'linear-gradient(90deg, #ef4444, #e11d48)'

    const doubleIndex = getDoubleQuestionIndex(questions)
    const isDoubleQuestion = currentIndex === doubleIndex

    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        {/* Music toggle button */}
        <button
          onClick={() => {
            const next = !musicOn
            setMusicOn(next)
            setMusicVolume(next ? 0.06 : 0)
          }}
          style={{
            position: 'fixed', top: '16px', right: '16px', zIndex: 50,
            background: 'rgba(0,0,0,0.50)', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '12px', padding: '8px 12px', color: 'white', cursor: 'pointer',
          }}
        >
          {musicOn ? '🔊' : '🔇'}
        </button>

        {/* Countdown overlay */}
        {countdown !== null && (
          <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center" style={{ background: 'rgba(8,8,15,0.92)', backdropFilter: 'blur(8px)' }}>
            <style>{`
              @keyframes countPulse {
                0% { transform: scale(0.6); opacity: 0; }
                30% { transform: scale(1.15); opacity: 1; }
                80% { transform: scale(1); opacity: 1; }
                100% { transform: scale(0.9); opacity: 0; }
              }
            `}</style>
            <div
              key={countdown}
              style={{
                fontSize: '10rem',
                fontWeight: 900,
                lineHeight: 1,
                background: 'linear-gradient(135deg, #8b5cf6, #a855f7, #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 40px rgba(168,85,247,0.6))',
                animation: 'countPulse 0.9s ease-out forwards',
              }}
            >
              {countdown}
            </div>
            <p style={{ color: 'rgba(240,240,245,0.60)', fontWeight: 700, fontSize: '1.2rem', marginTop: '24px', letterSpacing: '.05em' }}>Prépare-toi !</p>
          </div>
        )}

        {/* Floating reactions */}
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {floatingReactions.map(r => (
            <div
              key={r.id}
              style={{
                position: 'absolute',
                bottom: '80px',
                left: `${r.x}%`,
                fontSize: '2rem',
                animation: 'floatUp 2.5s ease-out forwards',
              }}
            >
              {r.emoji}
            </div>
          ))}
          {/* Floating pts bonus */}
          {showPtsBonus && (
            <div
              style={{
                position: 'absolute',
                bottom: '50%',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '2rem',
                fontWeight: 900,
                color: '#fbbf24',
                textShadow: '0 0 20px rgba(251,191,36,0.7)',
                animation: 'floatUp 2.5s ease-out forwards',
                whiteSpace: 'nowrap',
              }}
            >
              {showPtsBonus}
            </div>
          )}
        </div>

        <style>{`
          @keyframes floatUp {
            0% { transform: translateY(0) scale(1); opacity: 1; }
            80% { opacity: 1; }
            100% { transform: translateY(-300px) scale(0.6); opacity: 0; }
          }
        `}</style>

        {room.image_url ? (
          <>
            <img src={room.image_url} alt="background" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.60) 0%, transparent 40%, rgba(0,0,0,0.80) 100%)' }} />
          </>
        ) : (
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #0c1a3d 50%, #2d0a2e 100%)' }} />
        )}

        <div className="relative z-10 flex flex-col min-h-screen px-6 py-8 gap-4">
          {/* Top bar */}
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-xl font-black drop-shadow-lg" style={{ color: '#f0f0f5', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>{room.name}</h1>
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
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #a855f7, #ec4899)' }} />
          </div>

          {/* ── ANSWERING PHASE ── */}
          {room.question_phase === 'answering' && (
            <>
              {/* Double bonus banner */}
              {isDoubleQuestion && (
                <div
                  className="w-full py-3 px-5 rounded-2xl flex items-center justify-center gap-2 text-sm font-black"
                  style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(251,191,36,0.15))', border: '1px solid rgba(245,158,11,0.40)', color: '#fbbf24' }}
                >
                  🎰 Question Double Bonus — ×5 points !
                </div>
              )}

              {/* Timer bar */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.12)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${timerPercent}%`, background: timerColor }}
                  />
                </div>
                <div
                  className="text-sm font-black w-8 text-right"
                  style={{ color: timeLeft <= 7 ? '#ef4444' : 'rgba(240,240,245,0.75)' }}
                >
                  {timeLeft}
                </div>
              </div>

              {/* Question card with AnimatePresence for slide transition */}
              <div className="flex-1 flex flex-col items-center justify-center gap-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`question-${currentIndex}`}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%' }}
                  >
                    <div
                      className="w-full p-8 rounded-3xl"
                      style={{ background: 'rgba(0,0,0,0.50)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.18)' }}
                    >
                      <p className="text-xs font-bold uppercase tracking-widest mb-5 text-center" style={{ color: 'rgba(240,240,245,0.50)' }}>
                        Question {currentIndex + 1}
                      </p>
                      <p className="text-2xl font-black text-center leading-snug" style={{ color: '#f0f0f5' }}>
                        {question?.text}
                      </p>
                    </div>

                    {/* Who answered grid */}
                    {players.length > 0 && (
                      <div
                        className="w-full p-4 rounded-2xl"
                        style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.10)' }}
                      >
                        <p className="text-xs font-bold uppercase tracking-widest mb-3 text-center" style={{ color: 'rgba(240,240,245,0.40)' }}>
                          {answeredPlayerIds.size}/{players.length} ont répondu
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {players.map((p, i) => {
                            const answered = answeredPlayerIds.has(p.id)
                            return (
                              <div key={p.id} className="flex flex-col items-center gap-1">
                                <div
                                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white relative"
                                  style={{
                                    background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                                    opacity: answered ? 1 : 0.5,
                                  }}
                                >
                                  {p.nickname.charAt(0).toUpperCase()}
                                  <span
                                    className="absolute -bottom-1 -right-1"
                                    style={{ fontSize: '0.7rem' }}
                                  >
                                    {answered ? '✅' : '⏳'}
                                  </span>
                                </div>
                                <span
                                  className="text-xs font-medium"
                                  style={{
                                    color: 'rgba(240,240,245,0.55)',
                                    maxWidth: '44px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    display: 'block',
                                    textAlign: 'center',
                                  }}
                                >
                                  {p.nickname}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Answer buttons */}
                    <div className="flex gap-4 w-full">
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        transition={{ duration: 0.1 }}
                        onClick={() => handleAnswer(false)}
                        disabled={submitting || hasAnsweredCurrent}
                        className="flex-1 py-7 rounded-3xl text-white font-black text-xl flex flex-col items-center gap-2"
                        style={{
                          background: hasAnsweredCurrent ? 'rgba(239,68,68,0.35)' : 'linear-gradient(135deg, #ef4444, #e11d48)',
                          boxShadow: hasAnsweredCurrent ? 'none' : '0 16px 40px rgba(239,68,68,0.40)',
                          opacity: hasAnsweredCurrent ? 0.6 : 1,
                          border: 'none',
                          cursor: hasAnsweredCurrent ? 'default' : 'pointer',
                        }}
                      >
                        <span className="text-3xl">❌</span>
                        <span>Non</span>
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        transition={{ duration: 0.1 }}
                        onClick={() => handleAnswer(true)}
                        disabled={submitting || hasAnsweredCurrent}
                        className="flex-1 py-7 rounded-3xl text-white font-black text-xl flex flex-col items-center gap-2"
                        style={{
                          background: hasAnsweredCurrent ? 'rgba(16,185,129,0.35)' : 'linear-gradient(135deg, #10b981, #22c55e)',
                          boxShadow: hasAnsweredCurrent ? 'none' : '0 16px 40px rgba(16,185,129,0.40)',
                          opacity: hasAnsweredCurrent ? 0.6 : 1,
                          border: 'none',
                          cursor: hasAnsweredCurrent ? 'default' : 'pointer',
                        }}
                      >
                        <span className="text-3xl">✅</span>
                        <span>Oui</span>
                      </motion.button>
                    </div>

                    {hasAnsweredCurrent && (
                      <p className="text-center text-sm font-semibold animate-pulse" style={{ color: 'rgba(240,240,245,0.55)' }}>
                        En attente des autres joueurs…
                      </p>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </>
          )}

          {/* ── REVEALING PHASE ── */}
          {room.question_phase === 'revealing' && (
            <div className="flex-1 flex flex-col items-center justify-center gap-6">
              {/* Question reminder */}
              <div
                className="w-full p-6 rounded-3xl"
                style={{ background: 'rgba(0,0,0,0.50)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.18)' }}
              >
                <p className="text-xs font-bold uppercase tracking-widest mb-3 text-center" style={{ color: 'rgba(240,240,245,0.50)' }}>
                  Résultat — Question {currentIndex + 1}
                </p>
                <p className="text-xl font-black text-center leading-snug" style={{ color: '#f0f0f5' }}>
                  {question?.text}
                </p>
              </div>

              {/* Animated bars */}
              <div
                className="w-full p-6 rounded-3xl flex flex-col gap-5"
                style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                {/* Yes bar */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-lg" style={{ color: '#34d399' }}>✅ Oui</span>
                    <span className="font-black text-2xl" style={{ color: '#34d399' }}>{yesPercent}%</span>
                  </div>
                  <div className="w-full h-5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.10)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${yesPercent}%`, background: 'linear-gradient(90deg, #10b981, #34d399)' }}
                    />
                  </div>
                  <p className="text-sm" style={{ color: 'rgba(240,240,245,0.45)' }}>
                    {revealCounts.yes} joueur{revealCounts.yes !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* No bar */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-lg" style={{ color: '#f87171' }}>❌ Non</span>
                    <span className="font-black text-2xl" style={{ color: '#f87171' }}>{noPercent}%</span>
                  </div>
                  <div className="w-full h-5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.10)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${noPercent}%`, background: 'linear-gradient(90deg, #ef4444, #f87171)' }}
                    />
                  </div>
                  <p className="text-sm" style={{ color: 'rgba(240,240,245,0.45)' }}>
                    {revealCounts.no} joueur{revealCounts.no !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Emoji reactions */}
              <div
                className="w-full p-4 rounded-2xl"
                style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.10)' }}
              >
                <p className="text-xs font-bold uppercase tracking-widest mb-3 text-center" style={{ color: 'rgba(240,240,245,0.40)' }}>Réagis !</p>
                <div className="flex justify-center gap-3 flex-wrap">
                  {REACTION_EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => sendReaction(emoji)}
                      className="text-2xl active:scale-75 transition-transform"
                      style={{ lineHeight: 1, padding: '8px', borderRadius: '12px', background: 'rgba(255,255,255,0.07)' }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Host controls */}
              {isHost && (
                <button
                  onClick={handleNext}
                  className="w-full py-5 rounded-2xl text-white font-black text-xl active:scale-95 flex items-center justify-center gap-3"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #a855f7, #ec4899)', boxShadow: '0 12px 40px rgba(168,85,247,0.45)' }}
                >
                  {currentIndex + 1 >= questions.length ? '🏁 Terminer' : '➡️ Suivant'}
                </button>
              )}

              {!isHost && (
                <p className="text-center text-sm font-semibold animate-pulse" style={{ color: 'rgba(240,240,245,0.45)' }}>
                  En attente de l&apos;hôte…
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── FINISHED ──
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-6 relative overflow-hidden" style={{ background: '#08080f' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)', filter: 'blur(50px)' }} />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.22) 0%, transparent 70%)', filter: 'blur(50px)' }} />
      </div>
      <div className="z-10 flex flex-col items-center gap-6 text-center w-full">
        <div className="flex gap-2 text-3xl">🎊🎉✨🎈🎊</div>
        <div>
          <h2 className="text-3xl font-black mb-2" style={{ color: '#f0f0f5' }}>C&apos;est terminé ! 🎉</h2>
          <p style={{ color: 'rgba(240,240,245,0.55)', fontSize: '1.1rem' }}>La partie est terminée</p>
        </div>
        <button
          onClick={() => router.push(`/room/${code}/results`)}
          className="w-full py-5 rounded-2xl text-white font-black text-xl active:scale-95"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #a855f7, #ec4899)', boxShadow: '0 12px 40px rgba(168,85,247,0.45)' }}
        >
          Voir les résultats 🔍
        </button>
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
