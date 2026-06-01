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
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 animate-pulse" />
          <p className="text-white/50">Calcul des résultats…</p>
        </div>
      </div>
    )
  }

  const controversial = getControversialQuestion(results)
  const summary = getSummary(results)
  const totalAnswers = results.reduce((acc, r) => acc + r.total, 0)

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 gap-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-pink-600/20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center gap-4">
        <Link href={`/room/${code}`} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg">
          ←
        </Link>
        <div>
          <h1 className="text-2xl font-black">{room?.name}</h1>
          <p className="text-white/50 text-sm">Résultats en direct</p>
        </div>
      </div>

      {/* Stats header */}
      <div className="relative z-10 grid grid-cols-2 gap-3">
        <div className="bg-white/10 rounded-2xl p-4 flex flex-col gap-1">
          <span className="text-3xl font-black gradient-text">{participantCount}</span>
          <span className="text-white/50 text-sm">Participant{participantCount > 1 ? 's' : ''}</span>
        </div>
        <div className="bg-white/10 rounded-2xl p-4 flex flex-col gap-1">
          <span className="text-3xl font-black gradient-text">{totalAnswers}</span>
          <span className="text-white/50 text-sm">Réponses</span>
        </div>
      </div>

      {/* Summary card */}
      <div className="relative z-10 bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-500/30 rounded-3xl p-6">
        <p className="text-lg font-black text-center leading-snug">{summary}</p>
      </div>

      {/* Controversial question */}
      {controversial && controversial.total > 0 && (
        <div className="relative z-10 bg-white/10 rounded-3xl p-5 border border-white/20">
          <p className="text-xs text-yellow-400 font-bold uppercase tracking-wider mb-2">🔥 Question la plus controversée</p>
          <p className="font-bold text-base mb-3 leading-snug">{controversial.question.text}</p>
          <div className="flex gap-2 text-sm">
            <span className="py-1 px-3 rounded-full bg-green-500/20 text-green-300 font-bold">
              {controversial.yesPercent}% Oui
            </span>
            <span className="py-1 px-3 rounded-full bg-red-500/20 text-red-300 font-bold">
              {100 - controversial.yesPercent}% Non
            </span>
          </div>
        </div>
      )}

      {/* Per-question results */}
      <div className="relative z-10 flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Toutes les questions</h2>
        {results.map((r, i) => (
          <div key={r.question.id} className="bg-white/10 rounded-2xl p-5 border border-white/10">
            <div className="flex items-start justify-between gap-2 mb-4">
              <p className="font-semibold leading-snug flex-1">{r.question.text}</p>
              <span className="text-white/30 text-sm font-bold flex-shrink-0">{i + 1}</span>
            </div>

            {r.total > 0 ? (
              <>
                {/* Bar */}
                <div className="w-full h-3 rounded-full overflow-hidden bg-white/10 mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: `${r.yesPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-400 font-bold">✅ {r.yesPercent}% Oui ({r.yesCount})</span>
                  <span className="text-red-400 font-bold">❌ {100 - r.yesPercent}% Non ({r.noCount})</span>
                </div>
              </>
            ) : (
              <p className="text-white/30 text-sm">Aucune réponse pour l&apos;instant</p>
            )}
          </div>
        ))}
      </div>

      {/* Share */}
      <div className="relative z-10 bg-white/10 rounded-2xl p-4 flex flex-col gap-3">
        <p className="text-sm text-white/50 font-medium text-center">Invite plus d&apos;amis !</p>
        <div className="flex gap-2">
          <div className="flex-1 py-3 px-4 rounded-xl bg-white/10 text-center font-black text-xl tracking-widest">
            {code}
          </div>
          <button onClick={copyCode} className="px-4 rounded-xl bg-white/10 active:scale-95 text-xl">
            📋
          </button>
        </div>
        <button
          onClick={shareRoom}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold active:scale-95"
        >
          🔗 Partager le lien
        </button>
      </div>

      <div className="relative z-10 pb-4 text-center">
        <Link href="/" className="text-white/30 text-sm underline">
          Créer une nouvelle salle
        </Link>
      </div>
    </div>
  )
}
