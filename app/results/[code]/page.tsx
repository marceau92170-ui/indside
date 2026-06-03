'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { toPng } from 'html-to-image'
import { supabase } from '@/lib/supabase'
import { playFanfare } from '@/lib/sound'
import {
  getGroupLevel,
  getGroupSummary,
  getControversialQuestion,
  getConsensusQuestion,
  GROUP_LEVEL_INFO,
  BADGES,
  calculateScores,
} from '@/lib/game'
import type { Room, Question, QuestionResult, Player, Answer, PlayerScore } from '@/lib/types'

export default function ResultsPage() {
  const params = useParams()
  const router = useRouter()
  const code = (params.code as string).toUpperCase()

  const [room, setRoom] = useState<Room | null>(null)
  const [results, setResults] = useState<QuestionResult[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [participantCount, setParticipantCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [leaderboard, setLeaderboard] = useState<PlayerScore[]>([])
  const roomIdRef = useRef<string | null>(null)
  const [podiumStep, setPodiumStep] = useState(0)
  const [showTipJar, setShowTipJar] = useState(false)
  const shareCardRef = useRef<HTMLDivElement>(null)

  const loadResults = useCallback(async () => {
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', code)
      .single()

    if (roomError || !roomData) {
      router.push('/')
      return
    }
    setRoom(roomData)
    roomIdRef.current = roomData.id

    const { data: playersData } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', roomData.id)
    const players: Player[] = playersData ?? []
    setParticipantCount(players.length)

    const { data: qs } = await supabase
      .from('questions')
      .select('*')
      .eq('room_id', roomData.id)
      .order('order_index', { ascending: true })
    const questions: Question[] = qs ?? []
    setQuestions(questions)

    const questionIds = questions.map(q => q.id)
    const { data: answersData } = questionIds.length > 0
      ? await supabase.from('answers').select('*').in('question_id', questionIds)
      : { data: [] }
    const answers: Answer[] = answersData ?? []

    const questionResults: QuestionResult[] = questions.map(q => {
      const qAnswers = answers.filter(a => a.question_id === q.id)
      const yesCount = qAnswers.filter(a => a.value === true).length
      const noCount = qAnswers.filter(a => a.value === false).length
      const total = qAnswers.length
      const yesPercent = total > 0 ? Math.round((yesCount / total) * 100) : 0
      return { question: q, yesCount, noCount, total, yesPercent }
    })
    setResults(questionResults)

    const scores = calculateScores(players, questions, answers, roomData.points_enabled)
    setLeaderboard(scores)

    setLoading(false)

    let step = 0
    const podiumInterval = setInterval(() => {
      step += 1
      setPodiumStep(step)
      if (step >= 3) clearInterval(podiumInterval)
    }, 1200)

    setTimeout(() => setShowTipJar(true), 4000)
  }, [code, router])

  useEffect(() => {
    loadResults()
  }, [loadResults])

  useEffect(() => {
    if (podiumStep === 3) {
      playFanfare()
    }
  }, [podiumStep])

  useEffect(() => {
    if (!roomIdRef.current) return
    const roomId = roomIdRef.current
    const channel = supabase.channel(`results-${roomId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'answers' }, () => {
        loadResults()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [room?.id, loadResults])

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

  const downloadResultsImage = async () => {
    if (!shareCardRef.current) return
    try {
      const dataUrl = await toPng(shareCardRef.current, {
        backgroundColor: '#1a0a2e',
        pixelRatio: 2,
      })
      const link = document.createElement('a')
      link.download = `inside-${code}-resultats.png`
      link.href = dataUrl
      link.click()
    } catch (e) {
      console.error(e)
    }
  }

  const shareResultsImage = async () => {
    if (!shareCardRef.current) return
    try {
      const dataUrl = await toPng(shareCardRef.current, { backgroundColor: '#1a0a2e', pixelRatio: 2 })
      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], 'inside-resultats.png', { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `Inside — ${room?.name}` })
      } else {
        downloadResultsImage()
      }
    } catch (e) {
      console.error(e)
      downloadResultsImage()
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
          <p style={{ color: 'rgba(240,240,245,0.50)' }}>Calcul des résultats…</p>
        </div>
      </div>
    )
  }

  const groupLevel = getGroupLevel(results)
  const levelInfo = GROUP_LEVEL_INFO[groupLevel]
  const summary = getGroupSummary(results)
  const controversial = getControversialQuestion(results)
  const consensus = getConsensusQuestion(results)
  const totalAnswers = results.reduce((acc, r) => acc + r.total, 0)

  const rankColors = [
    { bg: 'linear-gradient(135deg, #f59e0b, #fbbf24)', text: '#78350f' },
    { bg: 'linear-gradient(135deg, #9ca3af, #d1d5db)', text: '#374151' },
    { bg: 'linear-gradient(135deg, #b45309, #d97706)', text: '#fff' },
  ]

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 gap-6 relative overflow-hidden" style={{ background: '#08080f' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.20) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute top-1/2 -left-40 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute -bottom-32 -right-16 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.18) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center gap-4">
        <Link
          href={`/`}
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-bold"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)' }}
        >
          ←
        </Link>
        <div>
          <h1 className="text-2xl font-black" style={{ color: '#f0f0f5' }}>{room?.name}</h1>
          <p className="text-sm font-semibold" style={{ color: 'rgba(240,240,245,0.45)' }}>Résultats</p>
        </div>
      </div>

      {/* Group level card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 p-8 rounded-3xl flex flex-col items-center gap-3 text-center"
        style={{
          background: `linear-gradient(135deg, ${levelInfo.colorFrom}30, ${levelInfo.colorTo}25)`,
          border: `1px solid ${levelInfo.colorFrom}40`,
          backdropFilter: 'blur(12px)',
        }}
      >
        <span style={{ fontSize: '4rem' }}>{levelInfo.emoji}</span>
        <div>
          <h2 className="text-3xl font-black" style={{ color: '#f0f0f5' }}>{levelInfo.label}</h2>
          <p className="text-base mt-1" style={{ color: 'rgba(240,240,245,0.70)' }}>{levelInfo.description}</p>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="relative z-10 grid grid-cols-2 gap-3">
        <div className="card p-5 flex flex-col gap-1">
          <span className="text-4xl font-black" style={{ background: 'linear-gradient(135deg, #a855f7, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {participantCount}
          </span>
          <span className="text-sm font-semibold" style={{ color: 'rgba(240,240,245,0.50)' }}>Participant{participantCount > 1 ? 's' : ''}</span>
        </div>
        <div className="card p-5 flex flex-col gap-1">
          <span className="text-4xl font-black" style={{ background: 'linear-gradient(135deg, #a855f7, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {totalAnswers}
          </span>
          <span className="text-sm font-semibold" style={{ color: 'rgba(240,240,245,0.50)' }}>Réponses</span>
        </div>
      </div>

      {/* Summary card */}
      <div
        className="relative z-10 p-6 rounded-3xl"
        style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(236,72,153,0.20))', border: '1px solid rgba(168,85,247,0.30)' }}
      >
        <p className="text-lg font-black text-center leading-snug" style={{ color: '#f0f0f5' }}>{summary}</p>
      </div>

      {/* Highlight cards */}
      {(controversial || consensus) && (
        <div className="relative z-10 grid grid-cols-2 gap-3">
          {controversial && controversial.total > 0 && (
            <div className="card p-4 flex flex-col gap-2">
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#fbbf24' }}>🔥 La plus controversée</p>
              <p className="text-sm font-bold leading-snug flex-1" style={{ color: '#f0f0f5' }}>{controversial.question.text}</p>
              <div className="flex gap-1 text-xs flex-wrap">
                <span className="py-1 px-2 rounded-full font-bold" style={{ background: 'rgba(16,185,129,0.20)', color: '#6ee7b7' }}>{controversial.yesPercent}% Oui</span>
                <span className="py-1 px-2 rounded-full font-bold" style={{ background: 'rgba(239,68,68,0.20)', color: '#fca5a5' }}>{100 - controversial.yesPercent}% Non</span>
              </div>
            </div>
          )}
          {consensus && consensus.total > 0 && (
            <div className="card p-4 flex flex-col gap-2">
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#60a5fa' }}>🤝 Le plus de consensus</p>
              <p className="text-sm font-bold leading-snug flex-1" style={{ color: '#f0f0f5' }}>{consensus.question.text}</p>
              <div className="flex gap-1 text-xs flex-wrap">
                <span className="py-1 px-2 rounded-full font-bold" style={{ background: 'rgba(16,185,129,0.20)', color: '#6ee7b7' }}>{consensus.yesPercent}% Oui</span>
                <span className="py-1 px-2 rounded-full font-bold" style={{ background: 'rgba(239,68,68,0.20)', color: '#fca5a5' }}>{100 - consensus.yesPercent}% Non</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Badges */}
      <div className="relative z-10 flex flex-col gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'rgba(240,240,245,0.50)' }}>🏅 Badges</h2>
        <div className="grid grid-cols-2 gap-3">
          {BADGES.map((badge, i) => (
            <div key={i} className="card p-4 flex flex-col items-center gap-2 text-center">
              <span className="text-3xl">{badge.emoji}</span>
              <span className="text-sm font-bold" style={{ color: '#f0f0f5' }}>{badge.label}</span>
              <span className="text-xs font-medium" style={{ color: 'rgba(240,240,245,0.45)' }}>{badge.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Podium + Leaderboard */}
      {room?.points_enabled && leaderboard.length > 0 && (
        <div className="relative z-10 flex flex-col gap-4">
          <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'rgba(240,240,245,0.50)' }}>🏆 Classement</h2>

          {podiumStep === 0 && (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="animate-spin w-8 h-8 rounded-xl" style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }} />
              <p style={{ color: 'rgba(240,240,245,0.45)', fontSize: '.9rem' }}>Calcul en cours…</p>
            </div>
          )}

          {podiumStep >= 1 && leaderboard.length >= 3 && (
            <div
              style={{
                transition: 'opacity 0.6s ease, transform 0.6s ease',
                opacity: podiumStep >= 1 ? 1 : 0,
                transform: podiumStep >= 1 ? 'translateY(0)' : 'translateY(40px)',
                padding: '14px 16px',
                borderRadius: '20px',
                background: 'rgba(156,163,175,0.12)',
                border: '1px solid rgba(156,163,175,0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <span style={{ fontSize: '1.6rem' }}>🥉</span>
              <div style={{ flex: 1, fontWeight: 700, color: '#f0f0f5' }}>{leaderboard[2]?.player.nickname}</div>
              <div style={{ fontWeight: 900, fontSize: '.85rem', color: '#9ca3af' }}>{leaderboard[2]?.points} pts</div>
            </div>
          )}

          {podiumStep >= 2 && leaderboard.length >= 2 && (
            <div
              style={{
                transition: 'opacity 0.6s ease, transform 0.6s ease',
                opacity: podiumStep >= 2 ? 1 : 0,
                transform: podiumStep >= 2 ? 'translateY(0)' : 'translateY(40px)',
                padding: '16px 18px',
                borderRadius: '22px',
                background: 'linear-gradient(135deg, rgba(156,163,175,0.18), rgba(209,213,219,0.12))',
                border: '1px solid rgba(209,213,219,0.30)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <span style={{ fontSize: '1.8rem' }}>🥈</span>
              <div style={{ flex: 1, fontWeight: 700, color: '#f0f0f5' }}>{leaderboard[1]?.player.nickname}</div>
              <div style={{ fontWeight: 900, fontSize: '.9rem', color: '#d1d5db' }}>{leaderboard[1]?.points} pts</div>
            </div>
          )}

          {podiumStep >= 3 && leaderboard.length >= 1 && (
            <div
              style={{
                transition: 'opacity 0.6s ease, transform 0.6s ease',
                opacity: podiumStep >= 3 ? 1 : 0,
                transform: podiumStep >= 3 ? 'translateY(0)' : 'translateY(40px)',
                padding: '22px 20px',
                borderRadius: '24px',
                background: 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(251,191,36,0.15))',
                border: '1px solid rgba(245,158,11,0.45)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                boxShadow: '0 8px 32px rgba(245,158,11,0.20)',
              }}
            >
              <span style={{ fontSize: '2.2rem' }}>👑</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 900, fontSize: '1.15rem', color: '#f0f0f5' }}>{leaderboard[0]?.player.nickname}</div>
                <div style={{ fontSize: '.8rem', color: 'rgba(240,240,245,0.50)', marginTop: '2px' }}>🎉 Gagnant !</div>
              </div>
              <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#fbbf24' }}>{leaderboard[0]?.points} pts</div>
            </div>
          )}

          {podiumStep >= 3 && (
            <div className="flex flex-col gap-2">
              {leaderboard.map((entry, idx) => {
                const rankStyle = entry.rank <= 3 ? rankColors[entry.rank - 1] : null
                return (
                  <motion.div
                    key={entry.player.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.08, ease: 'easeOut' }}
                    className="card p-4 flex items-center gap-3"
                  >
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '12px',
                        background: rankStyle ? rankStyle.bg : 'rgba(255,255,255,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '.9rem',
                        color: rankStyle ? rankStyle.text : 'rgba(240,240,245,0.40)',
                        flexShrink: 0,
                      }}
                    >
                      {entry.rank === 1 ? '👑' : entry.rank}
                    </div>
                    <div className="flex-1 font-bold" style={{ color: '#f0f0f5' }}>{entry.player.nickname}</div>
                    <div
                      className="text-sm font-black px-3 py-1 rounded-full"
                      style={{ background: 'rgba(168,85,247,0.18)', color: '#c084fc' }}
                    >
                      {entry.points} pts
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Tip Jar Modal */}
      {showTipJar && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
          onClick={() => setShowTipJar(false)}
        >
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }} />
          <div
            style={{ position: 'relative', zIndex: 1, background: 'linear-gradient(180deg,rgba(18,12,40,0.98),rgba(10,8,24,0.99))', borderRadius: '28px 28px 0 0', padding: '28px 24px 48px', display: 'flex', flexDirection: 'column', gap: '18px', border: '1px solid rgba(255,255,255,0.10)', borderBottom: 'none' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ width: '44px', height: '4px', borderRadius: '99px', background: 'rgba(255,255,255,0.20)', margin: '0 auto -6px' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🎉</div>
              <div style={{ fontWeight: 900, fontSize: '1.2rem', color: '#f0f0f5' }}>Vous avez kiffé ?</div>
              <p style={{ fontSize: '.88rem', color: 'rgba(240,240,245,0.50)', marginTop: '6px', lineHeight: 1.5 }}>Passez à Inside+ pour des fonctionnalités premium</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => router.push('/pricing')}
                style={{ flex: 1, padding: '16px 8px', borderRadius: '16px', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Découvrir Inside+
              </button>
            </div>
            <button
              onClick={() => setShowTipJar(false)}
              style={{ background: 'none', border: 'none', color: 'rgba(240,240,245,0.35)', fontSize: '.9rem', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}
            >
              Non merci
            </button>
          </div>
        </div>
      )}

      {/* Per-question results */}
      <div className="relative z-10 flex flex-col gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'rgba(240,240,245,0.50)' }}>Toutes les questions</h2>
        {results.map((r, i) => (
          <motion.div
            key={r.question.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08, ease: 'easeOut' }}
            className="card p-5"
          >
            <div className="flex items-start justify-between gap-2 mb-4">
              <p className="font-semibold leading-snug flex-1" style={{ color: '#f0f0f5' }}>{r.question.text}</p>
              <span className="text-sm font-black flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(240,240,245,0.40)' }}>{i + 1}</span>
            </div>
            {r.total > 0 ? (
              <>
                <div className="w-full h-2.5 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(239,68,68,0.30)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #10b981, #34d399)' }}
                    initial={{ width: '0%' }}
                    animate={{ width: `${r.yesPercent}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-bold" style={{ color: '#34d399' }}>✅ {r.yesPercent}% Oui ({r.yesCount})</span>
                  <span className="font-bold" style={{ color: '#f87171' }}>❌ {100 - r.yesPercent}% Non ({r.noCount})</span>
                </div>
              </>
            ) : (
              <p className="text-sm" style={{ color: 'rgba(240,240,245,0.30)' }}>Aucune réponse pour l&apos;instant</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Share section */}
      <div className="relative z-10 card p-5 flex flex-col gap-3">
        <p className="text-sm font-semibold text-center" style={{ color: 'rgba(240,240,245,0.50)' }}>Invite plus d&apos;amis !</p>
        <div className="flex gap-2">
          <div className="flex-1 py-3 px-4 rounded-2xl text-center font-black text-xl tracking-widest" style={{ background: 'rgba(255,255,255,0.08)', color: '#f0f0f5' }}>
            {code}
          </div>
          <button onClick={copyCode} className="px-4 rounded-2xl text-xl active:scale-95" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
            {copied ? '✅' : '📋'}
          </button>
        </div>
        <button onClick={shareRoom} className="w-full py-3 rounded-2xl text-white font-bold active:scale-95" style={{ background: 'linear-gradient(135deg, #8b5cf6, #a855f7, #ec4899)', boxShadow: '0 8px 30px rgba(168,85,247,0.30)' }}>
          🔗 Partager le lien
        </button>
      </div>

      {/* Share card */}
      <div
        ref={shareCardRef}
        className="relative z-10 p-1 rounded-3xl"
        style={{ background: 'linear-gradient(135deg, #8b5cf6, #a855f7, #ec4899)' }}
      >
        <div
          className="rounded-[22px] p-6 flex flex-col gap-4"
          style={{ background: 'rgba(14,12,30,0.95)', backdropFilter: 'blur(20px)' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎮</span>
            <div>
              <p className="font-black text-lg leading-tight" style={{ color: '#f0f0f5' }}>Inside — {room?.name}</p>
              <p className="text-sm font-semibold" style={{ color: 'rgba(240,240,245,0.55)' }}>
                {levelInfo.emoji} {levelInfo.label}
              </p>
            </div>
          </div>
          <div className="flex gap-4 text-sm font-semibold" style={{ color: 'rgba(240,240,245,0.60)' }}>
            <span>👥 {participantCount} joueur{participantCount > 1 ? 's' : ''}</span>
            <span>❓ {results.length} questions</span>
          </div>
          {leaderboard.length > 0 && (
            <div className="flex flex-col gap-1.5">
              {leaderboard.slice(0, 3).map((entry, i) => {
                const medals = ['🥇', '🥈', '🥉']
                return (
                  <div key={entry.player.id} className="flex items-center gap-2">
                    <span>{medals[i]}</span>
                    <span className="font-bold" style={{ color: '#f0f0f5' }}>{entry.player.nickname}</span>
                    {room?.points_enabled && (
                      <span className="text-xs font-semibold ml-auto" style={{ color: 'rgba(168,85,247,0.90)' }}>{entry.points} pts</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Image export buttons */}
      <div className="relative z-10 flex flex-col gap-2">
        <button
          onClick={downloadResultsImage}
          className="w-full py-3 rounded-2xl font-bold active:scale-95"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#f0f0f5' }}
        >
          📸 Sauvegarder en image
        </button>
        <button
          onClick={shareResultsImage}
          className="w-full py-3 rounded-2xl font-bold active:scale-95"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#f0f0f5' }}
        >
          🔗 Partager
        </button>
      </div>

      {/* Replay button */}
      <div className="relative z-10">
        <button
          onClick={() => {
            localStorage.setItem('inside_replay_questions', JSON.stringify(questions.map(q => q.text)))
            router.push('/create?replay=1')
          }}
          className="w-full py-4 rounded-2xl text-white font-bold active:scale-95"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', color: '#f0f0f5' }}
        >
          🔁 Rejouer avec les mêmes questions
        </button>
      </div>

      <div className="relative z-10 pb-4 text-center">
        <Link href="/create" className="text-sm underline" style={{ color: 'rgba(240,240,245,0.35)' }}>
          Créer une nouvelle salle
        </Link>
      </div>
    </div>
  )
}
