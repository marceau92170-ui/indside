'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { playDing, playCountdownBeep, playWhoosh, playReveal, playClick, startAmbientMusic, stopAmbientMusic, setMusicVolume } from '@/lib/sound'
import type { Room, Question, Player } from '@/lib/types'
import NoxComment from '@/components/NoxComment'
import Nox from '@/components/Nox'
import { getRevealComment } from '@/lib/nox'
import { getTheme, gradient, gradientShadow } from '@/lib/theme'
import { Volume2, VolumeX, Users, ChevronRight } from 'lucide-react'

const AVATAR_COLORS = [
  'linear-gradient(135deg, #8b5cf6, #ec4899)',
  'linear-gradient(135deg, #3b82f6, #8b5cf6)',
  'linear-gradient(135deg, #10b981, #3b82f6)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #ec4899, #f97316)',
  'linear-gradient(135deg, #06b6d4, #8b5cf6)',
]

const REACTION_EMOJIS = ['😭', '🔥', '💀', '🫠', '🤌', '👏']
const QUESTION_MOODS = ['😬', '🫦', '😈', '🤤', '🥵', '😳', '🫣', '💀', '😏', '🔥']
const QUESTION_DURATION = 30

interface FloatingReaction {
  id: number
  emoji: string
  x: number
}

export default function GamePage() {
  const params = useParams()
  const router = useRouter()
  const code = (params.code as string).toUpperCase()
  const theme = getTheme()
  const grad = gradient(theme)
  const shadow = gradientShadow(theme)

  const [room, setRoom] = useState<Room | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [isHost, setIsHost] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [hasAnsweredCurrent, setHasAnsweredCurrent] = useState(false)
  const [answeredPlayerIds, setAnsweredPlayerIds] = useState<Set<string>>(new Set())
  const [revealCounts, setRevealCounts] = useState<{ yes: number; no: number }>({ yes: 0, no: 0 })
  const [timeLeft, setTimeLeft] = useState(QUESTION_DURATION)
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([])
  const reactionCounterRef = useRef(0)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [myAnswer, setMyAnswer] = useState<boolean | null>(null)
  const myAnswerRef = useRef<boolean | null>(null)
  const [musicOn, setMusicOn] = useState(true)
  const [bgFallback, setBgFallback] = useState<string | null>(null)
  const [textAnswer, setTextAnswer] = useState('')
  const [textAnswerSubmitted, setTextAnswerSubmitted] = useState(false)
  const [revealTextAnswers, setRevealTextAnswers] = useState<Array<{ nickname: string; text_value: string }>>([])
  const textAnswerRef = useRef('')

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

    const storedPlayerId = localStorage.getItem(`flower_player_${code}`)
    if (!storedPlayerId) {
      router.push(`/join?code=${code}`)
      return
    }
    setPlayerId(storedPlayerId)
    playerIdRef.current = storedPlayerId

    if (roomData.status === 'waiting') {
      router.push(`/lobby/${code}`)
      return
    }
    if (roomData.status === 'finished') {
      router.push(`/results/${code}`)
      return
    }

    setRoom(roomData)
    roomRef.current = roomData

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

    if (questionsData.length > 0) {
      const currentQ = questionsData[roomData.current_question_index ?? 0]
      if (currentQ) {
        const { data: existingAnswers } = await supabase
          .from('answers')
          .select('player_id, value, text_value')
          .eq('question_id', currentQ.id)

        if (existingAnswers) {
          const ids = new Set(existingAnswers.map((a: { player_id: string }) => a.player_id))
          setAnsweredPlayerIds(ids)
          answeredPlayerIdsRef.current = ids

          if (ids.has(storedPlayerId)) {
            setHasAnsweredCurrent(true)
            if (currentQ.type === 'text_answer') setTextAnswerSubmitted(true)
          }

          if (roomData.question_phase === 'revealing') {
            if (currentQ.type === 'yes_no') {
              const yes = existingAnswers.filter((a: { value: boolean | null }) => a.value === true).length
              const no = existingAnswers.filter((a: { value: boolean | null }) => a.value === false).length
              setRevealCounts({ yes, no })
            } else if (currentQ.type === 'text_answer') {
              // Fetch player nicknames for text answers
              const textAnswersWithNames = await Promise.all(
                existingAnswers
                  .filter((a: { text_value: string | null }) => a.text_value)
                  .map(async (a: { player_id: string; text_value: string | null }) => {
                    const pl = (playersData ?? []).find((p: Player) => p.id === a.player_id)
                    return { nickname: pl?.nickname ?? '?', text_value: a.text_value ?? '' }
                  })
              )
              setRevealTextAnswers(textAnswersWithNames)
            }
          }
        }
      }
    }

    // Fallback background from localStorage
    const localBg = localStorage.getItem(`flower_bg_${code}`)
    if (localBg) setBgFallback(localBg)

    setLoading(false)
  }, [code, router])

  useEffect(() => {
    loadRoom()
  }, [loadRoom])

  useEffect(() => {
    if (room?.status === 'playing') {
      startAmbientMusic()
    }
  }, [room?.status])

  useEffect(() => {
    return () => { stopAmbientMusic() }
  }, [])

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

  // Fetch text answers when entering reveal phase for text_answer questions
  const fetchTextAnswers = useCallback(async (questionId: string) => {
    const { data: answers } = await supabase
      .from('answers')
      .select('player_id, text_value')
      .eq('question_id', questionId)
      .not('text_value', 'is', null)

    if (!answers) return
    const pls = playersRef.current
    const result = answers.map((a: { player_id: string; text_value: string | null }) => {
      const pl = pls.find(p => p.id === a.player_id)
      return { nickname: pl?.nickname ?? '?', text_value: a.text_value ?? '' }
    })
    setRevealTextAnswers(result)
  }, [])

  useEffect(() => {
    if (!room) return

    if (channelRef.current) supabase.removeChannel(channelRef.current)

    const channel = supabase.channel(`game-${room.id}`)
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

        if (prev && updated.current_question_index !== prev.current_question_index) {
          setHasAnsweredCurrent(false)
          setAnsweredPlayerIds(new Set())
          answeredPlayerIdsRef.current = new Set()
          setRevealCounts({ yes: 0, no: 0 })
          hasAutoRevealedRef.current = false
          setMyAnswer(null)
          myAnswerRef.current = null
          setTextAnswer('')
          textAnswerRef.current = ''
          setTextAnswerSubmitted(false)
          setRevealTextAnswers([])
          playWhoosh()
        }

        if (prev && prev.status === 'waiting' && updated.status === 'playing' && updated.current_question_index === 0 && updated.question_phase === 'answering') {
          setCountdown(3)
        }

        if (prev && prev.question_phase === 'answering' && updated.question_phase === 'revealing') {
          playReveal()
        }

        if (prev && prev.question_phase === 'answering' && updated.question_phase === 'revealing') {
          const qs = questionsRef.current
          const idx = updated.current_question_index ?? 0
          const q = qs[idx]

          if (q?.type === 'text_answer') {
            fetchTextAnswers(q.id)
          }
        }

        setRoom(updated)
        roomRef.current = updated

        if (updated.status === 'finished') {
          router.push(`/results/${code}`)
        }
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'answers',
      }, (payload) => {
        const answer = payload.new as { player_id: string; question_id: string; value: boolean | null; text_value: string | null }
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

        // Only count yes/no for yes_no questions
        if (currentQ.type === 'yes_no') {
          setRevealCounts(prev => ({
            yes: prev.yes + (answer.value === true ? 1 : 0),
            no: prev.no + (answer.value === false ? 1 : 0),
          }))
        }
      })
      .subscribe()

    channelRef.current = channel
    return () => { supabase.removeChannel(channel) }
  }, [room?.id, code, router, fetchTextAnswers])

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
      text_value: null,
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

  const handleTextAnswer = async () => {
    const r = roomRef.current
    const pid = playerIdRef.current
    const txt = textAnswer.trim()
    if (!pid || !r || submitting || textAnswerSubmitted || !txt) return
    const qs = questionsRef.current
    const currentQ = qs[r.current_question_index ?? 0]
    if (!currentQ) return

    setSubmitting(true)
    setHasAnsweredCurrent(true)
    setTextAnswerSubmitted(true)

    const { error } = await supabase.from('answers').insert({
      player_id: pid,
      question_id: currentQ.id,
      value: null,
      text_value: txt,
    })

    if (error) {
      setHasAnsweredCurrent(false)
      setTextAnswerSubmitted(false)
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#050508' }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl animate-spin"
            style={{ background: grad, boxShadow: shadow }}
          />
          <p style={{ color: 'rgba(240,240,245,0.50)' }}>Chargement…</p>
        </div>
      </div>
    )
  }

  if (!room) return null

  const currentIndex = room.current_question_index ?? 0
  const question = questions[currentIndex]
  const isTextAnswerQuestion = question?.type === 'text_answer'
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0
  const totalReveal = revealCounts.yes + revealCounts.no
  const yesPercent = totalReveal > 0 ? Math.round((revealCounts.yes / totalReveal) * 100) : 50
  const noPercent = totalReveal > 0 ? Math.round((revealCounts.no / totalReveal) * 100) : 50
  const timerPercent = (timeLeft / QUESTION_DURATION) * 100
  const timerColor = timeLeft > 15
    ? `linear-gradient(90deg, ${theme.from}, ${theme.mid})`
    : timeLeft > 7
      ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
      : 'linear-gradient(90deg, #ef4444, #e11d48)'

  const effectiveBg = room.image_url || bgFallback

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Music toggle button */}
      <button
        onClick={() => {
          const next = !musicOn
          setMusicOn(next)
          setMusicVolume(next ? 0.06 : 0)
          playClick()
        }}
        style={{
          position: 'fixed', top: '16px', right: '16px', zIndex: 50,
          background: 'rgba(0,0,0,0.50)', border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '12px', padding: '8px 12px', color: 'white', cursor: 'pointer',
        }}
      >
        {musicOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
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
          <Nox emotion="excited" size={80} animate />
          <div
            key={countdown}
            style={{
              fontSize: '10rem',
              fontWeight: 900,
              lineHeight: 1,
              background: grad,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: `drop-shadow(0 0 40px ${theme.from}99)`,
              animation: 'countPulse 0.9s ease-out forwards',
            }}
          >
            {countdown}
          </div>
          <p style={{ color: 'rgba(240,240,245,0.60)', fontWeight: 700, fontSize: '1.2rem', marginTop: '24px', letterSpacing: '.05em' }}>Voyons ce que vous cachez.</p>
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
      </div>

      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(-300px) scale(0.6); opacity: 0; }
        }
      `}</style>

      {effectiveBg ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={effectiveBg} alt="background" className="absolute inset-0 w-full h-full object-cover" />
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
            <div className="py-1.5 px-3 rounded-full text-sm font-bold flex items-center gap-1" style={{ background: 'rgba(0,0,0,0.40)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <Users size={13} /> {players.length}
            </div>
            <div className="py-1.5 px-3 rounded-full text-sm font-black" style={{ background: 'rgba(0,0,0,0.40)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)' }}>
              {currentIndex + 1}/{questions.length}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)' }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${theme.from}, ${theme.to})` }} />
        </div>

        {/* ANSWERING PHASE */}
        {room.question_phase === 'answering' && (
          <>
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
                  {/* Mood emoji above card */}
                  <div style={{ textAlign: 'center', marginBottom: '-20px', position: 'relative', zIndex: 2 }}>
                    <span style={{ fontSize: '4rem', filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.5))' }}>
                      {QUESTION_MOODS[currentIndex % QUESTION_MOODS.length]}
                    </span>
                  </div>

                  {/* Light question card */}
                  <div style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.93)',
                    borderRadius: '28px',
                    padding: '36px 24px 28px',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
                    position: 'relative',
                    zIndex: 1,
                  }}>
                    {/* Question counter badge */}
                    <div style={{
                      position: 'absolute', top: '-14px', right: '24px',
                      width: '48px', height: '48px', borderRadius: '9999px',
                      background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.8rem', fontWeight: 900, color: '#0a0a0a',
                    }}>
                      {currentIndex + 1}/{questions.length}
                    </div>

                    <p style={{
                      fontSize: '1.4rem', fontWeight: 900, color: '#0a0a0a',
                      textAlign: 'center', lineHeight: 1.3, letterSpacing: '-0.02em',
                      margin: 0,
                    }}>
                      {question?.text}
                    </p>
                  </div>

                  {players.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
                      {players.map((p) => {
                        const answered = answeredPlayerIds.has(p.id)
                        return (
                          <div key={p.id} style={{
                            padding: '5px 12px', borderRadius: '9999px',
                            background: answered ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${answered ? 'rgba(255,255,255,0.30)' : 'rgba(255,255,255,0.08)'}`,
                            fontSize: '12px', fontWeight: 700,
                            color: answered ? '#f0f0f5' : 'rgba(240,240,245,0.35)',
                            display: 'flex', alignItems: 'center', gap: '5px',
                          }}>
                            {p.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={p.avatar_url} style={{ width: 18, height: 18, borderRadius: '50%', objectFit: 'cover' }} alt="" />
                            ) : null}
                            {p.nickname}
                            {answered && <span style={{ color: '#34d399', fontSize: '10px' }}>●</span>}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Text answer input */}
                  {isTextAnswerQuestion ? (
                    <div className="w-full flex flex-col gap-3">
                      <input
                        type="text"
                        value={textAnswer}
                        onChange={e => {
                          setTextAnswer(e.target.value)
                          textAnswerRef.current = e.target.value
                        }}
                        onKeyDown={e => { if (e.key === 'Enter') handleTextAnswer() }}
                        placeholder="Ta réponse…"
                        disabled={textAnswerSubmitted || submitting}
                        style={{
                          background: 'rgba(255,255,255,0.10)',
                          border: textAnswerSubmitted ? `2px solid ${theme.from}99` : '2px solid rgba(255,255,255,0.20)',
                          borderRadius: '20px',
                          padding: '20px 24px',
                          color: '#f0f0f5',
                          fontSize: '1.2rem',
                          fontWeight: 700,
                          width: '100%',
                          outline: 'none',
                          backdropFilter: 'blur(12px)',
                          opacity: textAnswerSubmitted ? 0.7 : 1,
                        }}
                      />
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handleTextAnswer}
                        disabled={textAnswerSubmitted || submitting || !textAnswer.trim()}
                        style={{
                          width: '100%',
                          padding: '20px',
                          borderRadius: '20px',
                          fontWeight: 900,
                          fontSize: '1.2rem',
                          color: '#fff',
                          background: textAnswerSubmitted ? `${theme.from}4d` : grad,
                          border: textAnswerSubmitted ? `2px solid ${theme.from}80` : 'none',
                          boxShadow: textAnswerSubmitted ? 'none' : shadow,
                          cursor: textAnswerSubmitted ? 'default' : 'pointer',
                          opacity: (!textAnswer.trim() && !textAnswerSubmitted) ? 0.5 : 1,
                        }}
                      >
                        {textAnswerSubmitted ? 'Réponse envoyée ✓' : 'Envoyer'}
                      </motion.button>
                    </div>
                  ) : (
                    /* Yes/No buttons */
                    <div className="flex gap-3 w-full">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.08 }}
                        onClick={() => { if (!hasAnsweredCurrent && !submitting) { playClick(); handleAnswer(false) } }}
                        disabled={submitting || hasAnsweredCurrent}
                        className="flex-1 flex flex-col items-center justify-center gap-1"
                        style={{
                          padding: '36px 20px',
                          borderRadius: '24px',
                          background: hasAnsweredCurrent && myAnswer === false
                            ? 'rgba(239,68,68,0.18)' : 'rgba(255,255,255,0.05)',
                          border: hasAnsweredCurrent && myAnswer === false
                            ? '1.5px solid rgba(239,68,68,0.55)' : '1.5px solid rgba(255,255,255,0.10)',
                          backdropFilter: 'blur(16px)',
                          WebkitBackdropFilter: 'blur(16px)',
                          cursor: hasAnsweredCurrent ? 'default' : 'pointer',
                          transition: 'all 0.18s ease',
                        }}
                      >
                        <span style={{ fontSize: '2rem', lineHeight: 1 }}>✕</span>
                        <span style={{ fontSize: '2rem', fontWeight: 900, color: hasAnsweredCurrent && myAnswer === false ? '#f87171' : 'rgba(240,240,245,0.85)', letterSpacing: '-0.02em' }}>Non</span>
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.08 }}
                        onClick={() => { if (!hasAnsweredCurrent && !submitting) { playClick(); handleAnswer(true) } }}
                        disabled={submitting || hasAnsweredCurrent}
                        className="flex-1 flex flex-col items-center justify-center gap-1"
                        style={{
                          padding: '36px 20px',
                          borderRadius: '24px',
                          background: hasAnsweredCurrent && myAnswer === true
                            ? 'rgba(16,185,129,0.18)' : 'rgba(255,255,255,0.05)',
                          border: hasAnsweredCurrent && myAnswer === true
                            ? '1.5px solid rgba(16,185,129,0.55)' : '1.5px solid rgba(255,255,255,0.10)',
                          backdropFilter: 'blur(16px)',
                          WebkitBackdropFilter: 'blur(16px)',
                          cursor: hasAnsweredCurrent ? 'default' : 'pointer',
                          transition: 'all 0.18s ease',
                        }}
                      >
                        <span style={{ fontSize: '2rem', lineHeight: 1 }}>○</span>
                        <span style={{ fontSize: '2rem', fontWeight: 900, color: hasAnsweredCurrent && myAnswer === true ? '#34d399' : 'rgba(240,240,245,0.85)', letterSpacing: '-0.02em' }}>Oui</span>
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </>
        )}

        {/* REVEALING PHASE */}
        {room.question_phase === 'revealing' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <div
              className="w-full p-6 rounded-3xl"
              style={{ background: 'rgba(0,0,0,0.50)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.18)' }}
            >
              <p className="font-black text-center leading-snug" style={{ color: '#f0f0f5', fontSize: '1.5rem' }}>
                {question?.text}
              </p>
            </div>

            {isTextAnswerQuestion ? (
              /* Text answer reveal */
              <div
                className="w-full p-6 rounded-3xl flex flex-col gap-4"
                style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                <p className="text-xs font-bold uppercase tracking-widest text-center" style={{ color: 'rgba(240,240,245,0.40)' }}>Réponses</p>
                {revealTextAnswers.length === 0 ? (
                  <p className="text-center" style={{ color: 'rgba(240,240,245,0.45)', fontSize: '0.9rem' }}>Aucune réponse…</p>
                ) : (
                  revealTextAnswers.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '14px 18px',
                        borderRadius: '16px',
                        background: 'rgba(255,255,255,0.07)',
                        border: '1px solid rgba(255,255,255,0.10)',
                      }}
                    >
                      <p style={{ color: 'rgba(240,240,245,0.55)', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '.05em' }}>{item.nickname}</p>
                      <p style={{ color: '#f0f0f5', fontWeight: 700, fontSize: '1.05rem' }}>{item.text_value}</p>
                    </div>
                  ))
                )}
              </div>
            ) : (
              /* Yes/No reveal */
              <>
                <NoxComment
                  comment={getRevealComment(yesPercent)}
                  emotion={yesPercent >= 80 || yesPercent <= 20 ? 'proud' : yesPercent >= 60 || yesPercent <= 40 ? 'intrigued' : 'surprised'}
                  size={72}
                />

                <div
                  className="w-full p-6 rounded-3xl flex flex-col gap-5"
                  style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)' }}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-lg" style={{ color: '#34d399' }}>Oui</span>
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

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-lg" style={{ color: '#f87171' }}>Non</span>
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
              </>
            )}

            <div className="flex justify-center gap-1 flex-wrap px-2">
              {REACTION_EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => { playClick(); sendReaction(emoji) }}
                  style={{
                    width: '48px', height: '48px', borderRadius: '9999px',
                    background: 'transparent', border: 'none',
                    fontSize: '1.7rem', lineHeight: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent',
                    transition: 'transform 0.08s',
                  }}
                  onPointerDown={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(0.72)' }}
                  onPointerUp={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
                  onPointerLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {isHost && (
              <button
                onClick={handleNext}
                style={{
                  width: '100%', padding: '20px',
                  borderRadius: '9999px',
                  background: '#fff',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  fontWeight: 900, fontSize: '1.1rem',
                  color: '#0a0a0a', letterSpacing: '-0.01em',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                {currentIndex + 1 >= questions.length ? 'Terminer' : 'Question suivante'}
                <ChevronRight size={20} color="#0a0a0a" />
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
