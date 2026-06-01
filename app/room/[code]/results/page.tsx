'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Room, Question } from '@/lib/types'

interface QuestionResult {
  question: Question
  yesCount: number
  noCount: number
  total: number
  yesPercent: number
}

function getSummary(results: QuestionResult[]): string {
  if (results.length === 0) return 'Pas encore de résultats 🤔'
  const avgYes = results.reduce((acc, r) => acc + r.yesPercent, 0) / results.length

  if (avgYes > 80) return 'Ce groupe est une bande de OUI-OUI absolus 😂'
  if (avgYes > 60) return 'Plutôt positifs dans l\'ensemble… suspects 🧐'
  if (avgYes >= 40 && avgYes <= 60) return 'Ce groupe est clairement un peu chaotique 😈'
  if (avgYes > 20) return 'Sacré groupe de rebelles ! On aime 🔥'
  return 'Un groupe de NON-NON… ou juste honnêtes 😅'
}

function getControversialQuestion(results: QuestionResult[]): QuestionResult | null {
  if (!results.length) return null
  return results.reduce((most, r) => {
    const distMost = Math.abs(most.yesPercent - 50)
    const distR = Math.abs(r.yesPercent - 50)
    return distR < distMost ? r : most
  })
}

const BADGES = [
  { emoji: '🔥', label: 'Le plus aventurier' },
  { emoji: '👑', label: 'Le plus imprévisible' },
  { emoji: '😇', label: 'Le plus sage' },
  { emoji: '🎭', label: 'Le plus mystérieux' },
]

export default function ResultsPage() {
  const params = useParams()
  const router = useRouter()
  const code = (params.code as string).toUpperCase()

  const [room, setRoom] = useState<Room | null>(null)
  const [results, setResults] = useState<QuestionResult[]>([])
  const [participantCount, setParticipantCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const loadResults = useCallback(async () => {
    const { data: roomData } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', code)
      .single()

    if (!roomData) {
      router.push('/')
      return
    }
    setRoom(roomData)

    const { data: qs } = await supabase
      .from('questions')
      .select('*')
      .eq('room_id', roomData.id)
      .order('order_index')

    const { count: pCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', roomData.id)
    setParticipantCount(pCount || 0)

    const questionResults: QuestionResult[] = []
    for (const q of (qs || [])) {
      const { data: answers } = await supabase
        .from('answers')
        .select('value')
        .eq('question_id', q.id)

      const total = answers?.length || 0
      const yesCount = answers?.filter(a => a.value === true).length || 0
      const noCount = total - yesCount
      const yesPercent = total > 0 ? Math.round((yesCount / total) * 100) : 0

      questionResults.push({ question: q, yesCount, noCount, total, yesPercent })
    }

    setResults(questionResults)
    setLoading(false)
  }, [code, router])

  useEffect(() => {
    loadResults()
  }, [loadResults])

  // Realtime refresh
  useEffect(() => {
    if (!room) return
    const channel = supabase
      .channel(`results-${room.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'answers' }, () => {
        loadResults()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [room, loadResults])

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
          <p style={{ color: 'rgba(240,240,245,0.50)' }}>Calcul des résultats…</p>
        </div>
      </div>
    )
  }

  const controversial = getControversialQuestion(results)
  const summary = getSummary(results)
  const totalAnswers = results.reduce((acc, r) => acc + r.total, 0)

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 gap-6 relative overflow-hidden" style={{ background: '#08080f' }}>
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.20) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute top-1/2 -left-40 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute -bottom-32 -right-16 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.18) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center gap-4">
        <Link
          href={`/room/${code}`}
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

      {/* Stats row */}
      <div className="relative z-10 grid grid-cols-2 gap-3">
        <div className="card p-5 flex flex-col gap-1">
          <span
            className="text-4xl font-black"
            style={{ background: 'linear-gradient(135deg, #a855f7, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
          >
            {participantCount}
          </span>
          <span className="text-sm font-semibold" style={{ color: 'rgba(240,240,245,0.50)' }}>Participant{participantCount > 1 ? 's' : ''}</span>
        </div>
        <div className="card p-5 flex flex-col gap-1">
          <span
            className="text-4xl font-black"
            style={{ background: 'linear-gradient(135deg, #a855f7, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
          >
            {totalAnswers}
          </span>
          <span className="text-sm font-semibold" style={{ color: 'rgba(240,240,245,0.50)' }}>Réponses</span>
        </div>
      </div>

      {/* Summary card */}
      <div
        className="relative z-10 p-6 rounded-3xl"
        style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(236,72,153,0.20))',
          border: '1px solid rgba(168,85,247,0.30)',
        }}
      >
        <p className="text-lg font-black text-center leading-snug" style={{ color: '#f0f0f5' }}>{summary}</p>
      </div>

      {/* Badges section */}
      <div className="relative z-10 flex flex-col gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'rgba(240,240,245,0.50)' }}>🏆 Badges</h2>
        <div className="grid grid-cols-2 gap-3">
          {BADGES.map((badge, i) => (
            <div key={i} className="card p-4 flex flex-col items-center gap-2 text-center">
              <span className="text-3xl">{badge.emoji}</span>
              <span className="text-sm font-bold" style={{ color: '#f0f0f5' }}>{badge.label}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(168,85,247,0.15)', color: 'rgba(168,85,247,0.85)' }}>
                Salle #{code}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Controversial question */}
      {controversial && controversial.total > 0 && (
        <div className="relative z-10 card p-5">
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#fbbf24' }}>🔥 Question la plus chaude</p>
          <p className="font-bold text-base mb-4 leading-snug" style={{ color: '#f0f0f5' }}>{controversial.question.text}</p>
          <div className="flex gap-2 text-sm">
            <span className="py-1.5 px-4 rounded-full font-bold" style={{ background: 'rgba(16,185,129,0.20)', color: '#6ee7b7' }}>
              {controversial.yesPercent}% Oui
            </span>
            <span className="py-1.5 px-4 rounded-full font-bold" style={{ background: 'rgba(239,68,68,0.20)', color: '#fca5a5' }}>
              {100 - controversial.yesPercent}% Non
            </span>
          </div>
        </div>
      )}

      {/* Per-question results */}
      <div className="relative z-10 flex flex-col gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'rgba(240,240,245,0.50)' }}>Toutes les questions</h2>
        {results.map((r, i) => (
          <div key={r.question.id} className="card p-5">
            <div className="flex items-start justify-between gap-2 mb-4">
              <p className="font-semibold leading-snug flex-1" style={{ color: '#f0f0f5' }}>{r.question.text}</p>
              <span className="text-sm font-black flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(240,240,245,0.40)' }}>{i + 1}</span>
            </div>

            {r.total > 0 ? (
              <>
                <div className="w-full h-2.5 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(239,68,68,0.30)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${r.yesPercent}%`, background: 'linear-gradient(90deg, #10b981, #34d399)' }}
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
          </div>
        ))}
      </div>

      {/* Share section */}
      <div className="relative z-10 card p-5 flex flex-col gap-3">
        <p className="text-sm font-semibold text-center" style={{ color: 'rgba(240,240,245,0.50)' }}>Invite plus d&apos;amis !</p>
        <div className="flex gap-2">
          <div
            className="flex-1 py-3 px-4 rounded-2xl text-center font-black text-xl tracking-widest"
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
          className="w-full py-3 rounded-2xl text-white font-bold active:scale-95"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #a855f7, #ec4899)', boxShadow: '0 8px 30px rgba(168,85,247,0.30)' }}
        >
          🔗 Partager le lien
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
