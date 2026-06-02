'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { generateCode } from '@/lib/game'
import { TEMPLATES, getTemplateBySlug } from '@/lib/templates'
import type { GameTemplate } from '@/lib/types'

function CreatePageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fileRef = useRef<HTMLInputElement>(null)

  const [roomName, setRoomName] = useState('')
  const [nickname, setNickname] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [questions, setQuestions] = useState<string[]>([''])
  const [pointsEnabled, setPointsEnabled] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<GameTemplate | null>(null)

  useEffect(() => {
    const slug = searchParams.get('template')
    if (slug) {
      const tpl = getTemplateBySlug(slug)
      if (tpl) {
        setSelectedTemplate(tpl)
        if (tpl.slug !== 'creation-libre') {
          setRoomName(tpl.name)
          if (tpl.questions && tpl.questions.length > 0) {
            setQuestions(tpl.questions)
          }
        }
      }
    }

    const replay = searchParams.get('replay')
    if (replay === '1') {
      const stored = localStorage.getItem('inside_replay_questions')
      if (stored) {
        try {
          const qs = JSON.parse(stored)
          if (Array.isArray(qs) && qs.length > 0) {
            setQuestions(qs)
            localStorage.removeItem('inside_replay_questions')
          }
        } catch {}
      }
    }
  }, [searchParams])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const addQuestion = () => setQuestions([...questions, ''])
  const removeQuestion = (i: number) => setQuestions(questions.filter((_, idx) => idx !== i))
  const updateQuestion = (i: number, val: string) => {
    const updated = [...questions]
    updated[i] = val
    setQuestions(updated)
  }

  const handleSubmit = async () => {
    const validQuestions = questions.filter(q => q.trim())
    if (!roomName.trim()) return setError('Donne un nom à ta salle 😅')
    if (!nickname.trim()) return setError('Choisis un pseudo pour participer !')
    if (validQuestions.length === 0) return setError('Ajoute au moins une question !')

    setLoading(true)
    setError('')

    try {
      let imageUrl: string | null = null
      if (imageFile) {
        const ext = imageFile.name.split('.').pop()
        const path = `rooms/${Date.now()}.${ext}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('images')
          .upload(path, imageFile)
        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage.from('images').getPublicUrl(uploadData.path)
          imageUrl = urlData.publicUrl
        }
      }

      const code = generateCode()

      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert({
          code,
          name: roomName.trim(),
          image_url: imageUrl,
          status: 'waiting',
          created_by: nickname.trim(),
          template_id: null,
          points_enabled: pointsEnabled,
        })
        .select()
        .single()

      if (roomError || !room) throw new Error(roomError?.message || 'Failed to create room')

      const questionRows = validQuestions.map((text, i) => ({
        room_id: room.id,
        text,
        type: 'yes_no' as const,
        points: 10,
        order_index: i,
      }))
      const { error: qError } = await supabase.from('questions').insert(questionRows)
      if (qError) throw new Error(qError.message)

      const { data: player, error: playerError } = await supabase
        .from('players')
        .insert({ room_id: room.id, nickname: nickname.trim(), is_host: true })
        .select()
        .single()

      if (playerError || !player) throw new Error(playerError?.message || 'Failed to create player')

      localStorage.setItem(`inside_player_${code}`, player.id)
      router.push(`/room/${code}`)
    } catch (err) {
      console.error(err)
      setError('Une erreur est survenue. Vérifie ta connexion.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 gap-5 relative" style={{ background: '#08080f' }}>
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)', filter: 'blur(50px)' }} />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)', filter: 'blur(50px)' }} />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center gap-4">
        <Link
          href="/"
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-bold"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)' }}
        >
          ←
        </Link>
        <h1 className="text-2xl font-black" style={{ color: '#f0f0f5' }}>Créer une salle</h1>
      </div>

      {/* Template banner */}
      {selectedTemplate && selectedTemplate.slug !== 'creation-libre' && (
        <div
          className="relative z-10 p-4 rounded-2xl flex items-center gap-3"
          style={{
            background: `linear-gradient(135deg, ${selectedTemplate.color_from}30, ${selectedTemplate.color_to}25)`,
            border: `1px solid ${selectedTemplate.color_from}40`,
          }}
        >
          <span style={{ fontSize: '2rem' }}>{selectedTemplate.emoji}</span>
          <div>
            <div className="font-bold" style={{ color: '#f0f0f5' }}>{selectedTemplate.name}</div>
            <div className="text-xs font-medium" style={{ color: 'rgba(240,240,245,0.50)' }}>Modèle pré-rempli · modifiable</div>
          </div>
        </div>
      )}

      {/* Room name */}
      <div className="relative z-10 card p-5 flex flex-col gap-3">
        <label className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'rgba(240,240,245,0.55)' }}>
          🏠 Nom de la salle
        </label>
        <input
          type="text"
          value={roomName}
          onChange={e => setRoomName(e.target.value)}
          placeholder="Ex : Soirée de Jean 🎉"
          className="w-full py-4 px-5 rounded-2xl text-white text-lg font-medium focus:outline-none"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
        />
      </div>

      {/* Nickname */}
      <div className="relative z-10 card p-5 flex flex-col gap-3">
        <label className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'rgba(240,240,245,0.55)' }}>
          🎭 Ton pseudo (tu participeras aussi)
        </label>
        <input
          type="text"
          value={nickname}
          onChange={e => setNickname(e.target.value)}
          placeholder="Ton prénom…"
          maxLength={20}
          className="w-full py-4 px-5 rounded-2xl text-white text-lg font-medium focus:outline-none"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
        />
      </div>

      {/* Image upload */}
      <div className="relative z-10 card p-5 flex flex-col gap-3">
        <label className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'rgba(240,240,245,0.55)' }}>
          📸 Image de fond
        </label>
        <button
          onClick={() => fileRef.current?.click()}
          className="relative w-full h-44 rounded-2xl overflow-hidden active:scale-95"
          style={{ border: '2px dashed rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.04)' }}
        >
          {imagePreview ? (
            <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-2" style={{ color: 'rgba(240,240,245,0.35)' }}>
              <span className="text-4xl">🖼️</span>
              <span className="text-sm font-semibold">Appuie pour choisir une photo</span>
            </div>
          )}
          {imagePreview && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-sm font-bold bg-black/60 px-4 py-2 rounded-full text-white">Changer</span>
            </div>
          )}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
      </div>

      {/* Points toggle */}
      <div className="relative z-10 card p-5 flex items-center justify-between gap-4">
        <div>
          <div className="font-bold" style={{ color: '#f0f0f5' }}>🏆 Système de points</div>
          <div className="text-xs mt-1" style={{ color: 'rgba(240,240,245,0.45)' }}>Active le classement et les scores</div>
        </div>
        <button
          onClick={() => setPointsEnabled(!pointsEnabled)}
          style={{
            width: '52px',
            height: '30px',
            borderRadius: '9999px',
            background: pointsEnabled ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' : 'rgba(255,255,255,0.12)',
            border: 'none',
            cursor: 'pointer',
            position: 'relative',
            transition: 'background .2s',
            flexShrink: 0,
          }}
        >
          <span style={{
            position: 'absolute',
            top: '3px',
            left: pointsEnabled ? '25px' : '3px',
            width: '24px',
            height: '24px',
            borderRadius: '9999px',
            background: '#fff',
            transition: 'left .2s',
            display: 'block',
          }} />
        </button>
      </div>

      {/* Questions */}
      <div className="relative z-10 card p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'rgba(240,240,245,0.55)' }}>
            ❓ Questions ({questions.filter(q => q.trim()).length})
          </label>
          <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: 'rgba(168,85,247,0.15)', color: 'rgba(168,85,247,0.90)', border: '1px solid rgba(168,85,247,0.25)' }}>
            Oui / Non
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {questions.map((q, i) => (
            <div key={i} className="flex gap-2 items-center rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0" style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', color: '#fff' }}>
                {i + 1}
              </span>
              <input
                type="text"
                value={q}
                onChange={e => updateQuestion(i, e.target.value)}
                placeholder={`Question ${i + 1}…`}
                className="flex-1 bg-transparent text-white placeholder:text-white/30 focus:outline-none font-medium py-1"
              />
              {questions.length > 1 && (
                <button
                  onClick={() => removeQuestion(i)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-lg active:scale-90 flex-shrink-0"
                  style={{ background: 'rgba(239,68,68,0.20)', color: '#f87171' }}
                >
                  ×
                </button>
              )}
            </div>
          ))}

          <button
            onClick={addQuestion}
            className="w-full py-4 rounded-2xl font-semibold active:scale-95"
            style={{ border: '2px dashed rgba(255,255,255,0.18)', color: 'rgba(240,240,245,0.50)', background: 'rgba(255,255,255,0.02)' }}
          >
            + Ajouter une question
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="relative z-10 py-3 px-4 rounded-2xl text-sm font-semibold" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.30)', color: '#fca5a5' }}>
          {error}
        </div>
      )}

      {/* Submit */}
      <div className="relative z-10 pb-8 mt-2">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary text-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Création en cours…
            </>
          ) : '🚀 Créer ma salle'}
        </button>
      </div>
    </div>
  )
}

export default function CreatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#08080f' }}>
        <div className="w-14 h-14 rounded-2xl animate-spin" style={{ background: 'linear-gradient(135deg, #8b5cf6, #a855f7, #ec4899)' }} />
      </div>
    }>
      <CreatePageInner />
    </Suspense>
  )
}
