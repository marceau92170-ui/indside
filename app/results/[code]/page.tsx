'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { playFanfare, playClick } from '@/lib/sound'
import { getTheme, gradient, gradientShadow } from '@/lib/theme'
import { ChevronLeft, RotateCcw, Share2, Check, Copy, Home } from 'lucide-react'
import type { Room, Question, Player, Answer } from '@/lib/types'
import Nox from '@/components/Nox'

interface QuestionResult {
  question: Question
  yesCount: number
  noCount: number
  total: number
  yesPercent: number
  textAnswers: Array<{ nickname: string; text_value: string }>
}

const MOODS = ['😬', '🫦', '😈', '🤤', '🥵', '😳', '🫣', '💀', '😏', '🔥']

export default function ResultsPage() {
  const params = useParams()
  const router = useRouter()
  const code = (params.code as string).toUpperCase()
  const theme = getTheme()
  const grad = gradient(theme)
  const shadow = gradientShadow(theme)

  const [room, setRoom] = useState<Room | null>(null)
  const [results, setResults] = useState<QuestionResult[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const roomIdRef = useRef<string | null>(null)

  const loadResults = useCallback(async () => {
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', code)
      .single()

    if (roomError || !roomData) { router.push('/'); return }
    setRoom(roomData)
    roomIdRef.current = roomData.id

    const { data: playersData } = await supabase
      .from('players').select('*').eq('room_id', roomData.id)
    const playerList: Player[] = playersData ?? []
    setPlayers(playerList)

    const { data: qs } = await supabase
      .from('questions').select('*').eq('room_id', roomData.id).order('order_index', { ascending: true })
    const questionList: Question[] = qs ?? []
    setQuestions(questionList)

    const questionIds = questionList.map(q => q.id)
    const { data: answersData } = questionIds.length > 0
      ? await supabase.from('answers').select('*').in('question_id', questionIds)
      : { data: [] }
    const answers: Answer[] = answersData ?? []

    const qResults: QuestionResult[] = questionList.map(q => {
      const qAnswers = answers.filter(a => a.question_id === q.id)
      if (q.type === 'text_answer') {
        const textAnswers = qAnswers
          .filter(a => a.text_value)
          .map(a => {
            const pl = playerList.find(p => p.id === a.player_id)
            return { nickname: pl?.nickname ?? '?', text_value: a.text_value ?? '' }
          })
        return { question: q, yesCount: 0, noCount: 0, total: qAnswers.length, yesPercent: 0, textAnswers }
      }
      const yesCount = qAnswers.filter(a => a.value === true).length
      const noCount = qAnswers.filter(a => a.value === false).length
      const total = yesCount + noCount
      const yesPercent = total > 0 ? Math.round((yesCount / total) * 100) : 0
      return { question: q, yesCount, noCount, total, yesPercent, textAnswers: [] }
    })
    setResults(qResults)
    setLoading(false)
    playFanfare()
  }, [code, router])

  useEffect(() => { loadResults() }, [loadResults])

  const copyCode = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareRoom = async () => {
    const url = `${window.location.origin}/join?code=${code}`
    if (navigator.share) {
      await navigator.share({ title: `Flower — ${room?.name}`, url })
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050508' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: grad, boxShadow: shadow, animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'rgba(240,240,245,0.50)' }}>Chargement…</p>
        </div>
      </div>
    )
  }

  const totalAnswers = results.reduce((acc, r) => acc + r.total, 0)

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #1a0020 0%, #050508 40%, #200010 100%)', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient glow */}
      <div style={{ position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '500px', height: '500px', borderRadius: '9999px', background: 'radial-gradient(circle, rgba(255,0,110,0.15) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, padding: '16px 20px 12px', background: 'rgba(5,5,8,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/" style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f0f0f5', textDecoration: 'none', flexShrink: 0 }}>
            <Home size={16} />
          </Link>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#f0f0f5', margin: 0, letterSpacing: '-0.02em' }}>{room?.name}</h1>
            <p style={{ fontSize: '0.72rem', color: 'rgba(240,240,245,0.40)', margin: 0, marginTop: '1px' }}>{players.length} joueurs · {questions.length} questions</p>
          </div>
          <div style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(240,240,245,0.60)', letterSpacing: '.06em' }}>{code}</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 16px 60px', display: 'flex', flexDirection: 'column', gap: '0' }}>

        {/* Nox hero */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '24px 0 8px', zIndex: 1 }}>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '200px', height: '200px', borderRadius: '9999px', background: 'radial-gradient(circle, rgba(255,0,110,0.20) 0%, transparent 70%)', filter: 'blur(25px)', pointerEvents: 'none' }} />
            <Nox emotion="proud" size={110} animate />
          </div>
          <p style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f0f0f5', textAlign: 'center', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.1 }}>C&apos;est terminé 🔥</p>
          <p style={{ fontSize: '0.82rem', color: 'rgba(240,240,245,0.45)', textAlign: 'center', margin: 0 }}>{totalAnswers} réponses données ce soir</p>
        </div>

        {/* Player avatars row */}
        {players.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} style={{ position: 'relative', marginTop: '28px' }}>
            <div style={{ position: 'absolute', top: '-22px', left: '18px', zIndex: 2, fontSize: '2.2rem', lineHeight: 1 }}>👥</div>
            <div style={{ borderRadius: '24px', background: 'rgba(255,255,255,0.92)', boxShadow: '0 8px 32px rgba(0,0,0,0.30)', position: 'relative', overflow: 'hidden', padding: '20px 20px 20px 24px' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '5px', background: grad, borderRadius: '24px 0 0 24px' }} />
              <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: theme.from }}>PARTICIPANTS</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                {players.map((p, i) => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.06)', borderRadius: '9999px', padding: '5px 10px 5px 5px' }}>
                    {p.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.avatar_url} style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} alt="" />
                    ) : (
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: `linear-gradient(135deg, ${theme.from}, ${theme.to})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 900, color: '#fff' }}>
                        {p.nickname[0].toUpperCase()}
                      </div>
                    )}
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#222' }}>{p.nickname}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Per-question results */}
        {results.map((r, i) => (
          <motion.div
            key={r.question.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + i * 0.06, ease: 'easeOut' }}
            style={{ position: 'relative', marginTop: '28px' }}
          >
            <div style={{ position: 'absolute', top: '-22px', left: '18px', zIndex: 2, fontSize: '2rem', lineHeight: 1, filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.4))' }}>
              {MOODS[i % MOODS.length]}
            </div>
            <div style={{ borderRadius: '24px', background: 'rgba(255,255,255,0.92)', boxShadow: '0 8px 32px rgba(0,0,0,0.30)', position: 'relative', overflow: 'hidden', padding: '20px 20px 20px 24px' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '5px', background: `linear-gradient(180deg, ${theme.from}, ${theme.to})`, borderRadius: '24px 0 0 24px' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: theme.from }}>Q{i + 1}</span>
              </div>
              <p style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0a0a0a', lineHeight: 1.4, marginBottom: '14px' }}>{r.question.text}</p>

              {r.question.type === 'text_answer' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {r.textAnswers.length === 0 ? (
                    <p style={{ fontSize: '0.82rem', color: '#999' }}>Aucune réponse</p>
                  ) : (
                    r.textAnswers.map((ta, j) => (
                      <div key={j} style={{ background: 'rgba(0,0,0,0.05)', borderRadius: '12px', padding: '10px 14px' }}>
                        <p style={{ fontSize: '10px', fontWeight: 800, color: theme.from, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '3px' }}>{ta.nickname}</p>
                        <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#222' }}>{ta.text_value}</p>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                r.total > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {/* Yes bar */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#10b981' }}>Oui — {r.yesCount} joueur{r.yesCount !== 1 ? 's' : ''}</span>
                        <span style={{ fontSize: '14px', fontWeight: 900, color: '#10b981' }}>{r.yesPercent}%</span>
                      </div>
                      <div style={{ height: '8px', borderRadius: '9999px', background: 'rgba(16,185,129,0.15)', overflow: 'hidden' }}>
                        <motion.div
                          style={{ height: '100%', borderRadius: '9999px', background: 'linear-gradient(90deg, #10b981, #34d399)' }}
                          initial={{ width: '0%' }}
                          animate={{ width: `${r.yesPercent}%` }}
                          transition={{ duration: 0.8, delay: 0.1 + i * 0.06, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                    {/* No bar */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#ef4444' }}>Non — {r.noCount} joueur{r.noCount !== 1 ? 's' : ''}</span>
                        <span style={{ fontSize: '14px', fontWeight: 900, color: '#ef4444' }}>{100 - r.yesPercent}%</span>
                      </div>
                      <div style={{ height: '8px', borderRadius: '9999px', background: 'rgba(239,68,68,0.15)', overflow: 'hidden' }}>
                        <motion.div
                          style={{ height: '100%', borderRadius: '9999px', background: 'linear-gradient(90deg, #ef4444, #f87171)' }}
                          initial={{ width: '0%' }}
                          animate={{ width: `${100 - r.yesPercent}%` }}
                          transition={{ duration: 0.8, delay: 0.15 + i * 0.06, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: '0.82rem', color: '#999' }}>Aucune réponse</p>
                )
              )}
            </div>
          </motion.div>
        ))}

        {/* Share & actions */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + results.length * 0.05 }} style={{ position: 'relative', marginTop: '32px' }}>
          <div style={{ position: 'absolute', top: '-22px', left: '18px', zIndex: 2, fontSize: '2.2rem', lineHeight: 1 }}>📢</div>
          <div style={{ borderRadius: '24px', background: 'rgba(255,255,255,0.92)', boxShadow: '0 8px 32px rgba(0,0,0,0.30)', position: 'relative', overflow: 'hidden', padding: '20px 20px 20px 24px' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '5px', background: 'linear-gradient(180deg, #6366f1, #a855f7)', borderRadius: '24px 0 0 24px' }} />
            <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: '#6366f1' }}>PARTAGER</span>
            <p style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0a0a0a', margin: '4px 0 14px', letterSpacing: '-0.01em' }}>Invite plus d&apos;amis</p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <div style={{ flex: 1, padding: '12px 16px', borderRadius: '14px', textAlign: 'center', fontWeight: 900, fontSize: '1.15rem', letterSpacing: '.12em', background: 'rgba(0,0,0,0.06)', color: '#111' }}>
                {code}
              </div>
              <button onClick={copyCode} style={{ padding: '12px 16px', borderRadius: '14px', background: 'rgba(0,0,0,0.06)', border: 'none', cursor: 'pointer', color: '#333', display: 'flex', alignItems: 'center' }}>
                {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
              </button>
            </div>
            <button onClick={() => { playClick(); shareRoom() }} style={{ width: '100%', padding: '14px', borderRadius: '14px', background: grad, border: 'none', color: '#fff', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: shadow }}>
              <Share2 size={16} /> Partager le lien
            </button>
          </div>
        </motion.div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
          <button
            onClick={() => {
              playClick()
              localStorage.setItem('flower_replay_questions', JSON.stringify(questions.map(q => q.text)))
              router.push('/create?replay=1')
            }}
            style={{ width: '100%', padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#f0f0f5', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.9rem' }}
          >
            <RotateCcw size={16} /> Rejouer avec les mêmes questions
          </button>
          <Link href="/create" style={{ width: '100%', padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#f0f0f5', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.9rem', textDecoration: 'none' }}>
            <Home size={16} /> Nouvelle partie
          </Link>
        </div>
      </div>
    </div>
  )
}
