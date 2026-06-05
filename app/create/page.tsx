'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { generateCode } from '@/lib/game'
import { TEMPLATES, getTemplateBySlug } from '@/lib/templates'
import type { GameTemplate } from '@/lib/types'
import { canAddQuestion, canCreateRoom } from '@/lib/subscription'
import PremiumGate from '@/components/PremiumGate'
import { playClick, playSuccess } from '@/lib/sound'
import { getTheme, gradient, gradientShadow } from '@/lib/theme'

function ChoiceScreen() {
  const theme = getTheme()
  const grad = gradient(theme)
  const shadow = gradientShadow(theme)
  return (
    <motion.div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '48px 24px',
        gap: '24px',
        background: '#08080f',
        position: 'relative',
        overflow: 'hidden',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      {/* blobs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-60px', width: '300px', height: '300px', borderRadius: '9999px', background: `radial-gradient(circle, ${theme.glowFrom} 0%, transparent 70%)`, filter: 'blur(50px)' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '-40px', width: '280px', height: '280px', borderRadius: '9999px', background: `radial-gradient(circle, ${theme.glowTo} 0%, transparent 70%)`, filter: 'blur(50px)' }} />
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', zIndex: 1 }}>
        <Link
          href="/"
          style={{
            width: '40px', height: '40px', borderRadius: '14px',
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#f0f0f5', textDecoration: 'none', fontSize: '1.1rem',
            flexShrink: 0,
          }}
        >←</Link>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f0f0f5', margin: 0 }}>Créer une expérience</h1>
          <p style={{ fontSize: '12px', color: 'rgba(240,240,245,0.40)', marginTop: '2px' }}>Choisis comment tu veux jouer</p>
        </div>
      </div>

      {/* Two cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, justifyContent: 'center', zIndex: 1 }}>

        {/* Template option */}
        <motion.div whileTap={{ scale: 0.98 }}>
          <Link href="/templates" style={{ textDecoration: 'none', display: 'block' }}>
            <div style={{
              padding: '28px 24px', borderRadius: '24px',
              background: `linear-gradient(135deg, ${theme.glowFrom}, ${theme.glowTo})`,
              border: `1px solid ${theme.from}50`,
              display: 'flex', flexDirection: 'column', gap: '10px',
            }}>
              <span style={{ fontSize: '2.5rem' }}>📚</span>
              <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#f0f0f5' }}>Utiliser un modèle</div>
              <p style={{ fontSize: '.92rem', color: 'rgba(240,240,245,0.55)', lineHeight: 1.5, margin: 0 }}>
                Choisis parmi nos jeux prêts à jouer. Questions déjà rédigées.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: theme.mid }}>
                  {TEMPLATES.filter(t => t.slug !== 'creation-libre').length} modèles disponibles →
                </span>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Free creation option */}
        <motion.div whileTap={{ scale: 0.98 }}>
          <Link href="/create?free=1" style={{ textDecoration: 'none', display: 'block' }}>
            <div style={{
              padding: '28px 24px', borderRadius: '24px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.12)',
              display: 'flex', flexDirection: 'column', gap: '10px',
            }}>
              <span style={{ fontSize: '2.5rem' }}>🎨</span>
              <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#f0f0f5' }}>Création libre</div>
              <p style={{ fontSize: '.92rem', color: 'rgba(240,240,245,0.55)', lineHeight: 1.5, margin: 0 }}>
                Crée ton propre quiz de A à Z avec tes propres questions.
              </p>
            </div>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  )
}

function StepDots({ step, grad }: { step: number; grad: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
      {[1, 2, 3].map(s => (
        <div
          key={s}
          style={{
            width: s === step ? '24px' : '8px',
            height: '8px',
            borderRadius: '9999px',
            background: s === step
              ? grad
              : s < step
                ? 'rgba(255,255,255,0.35)'
                : 'rgba(255,255,255,0.18)',
            transition: 'all 0.25s ease',
          }}
        />
      ))}
    </div>
  )
}

function CreateForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fileRef = useRef<HTMLInputElement>(null)
  const theme = getTheme()
  const grad = gradient(theme)
  const shadow = gradientShadow(theme)

  const [step, setStep] = useState(1)
  const [roomName, setRoomName] = useState('')
  const [nickname, setNickname] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Array<{ text: string; type: 'yes_no' | 'text_answer' }>>([{ text: '', type: 'yes_no' }])
  const [pointsEnabled, setPointsEnabled] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<GameTemplate | null>(null)
  const [showPremiumGate, setShowPremiumGate] = useState(false)
  const [premiumGateReason, setPremiumGateReason] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  useEffect(() => {
    const slug = searchParams.get('template')
    if (slug) {
      const tpl = getTemplateBySlug(slug)
      if (tpl) {
        setSelectedTemplate(tpl)
        if (tpl.slug !== 'creation-libre') {
          setRoomName(tpl.name)
          if (tpl.questions && tpl.questions.length > 0) {
            setQuestions(tpl.questions.map(t => ({ text: t, type: 'yes_no' as const })))
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
            // support both legacy string[] and new object[]
            const normalized = qs.map((q: string | { text: string; type: 'yes_no' | 'text_answer' }) =>
              typeof q === 'string' ? { text: q, type: 'yes_no' as const } : q
            )
            setQuestions(normalized)
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

  const addQuestion = async () => {
    const check = await canAddQuestion(questions.length)
    if (!check.allowed) {
      setPremiumGateReason('La version gratuite est limitée à 15 questions par salle.')
      setShowPremiumGate(true)
      return
    }
    playClick()
    setQuestions([...questions, { text: '', type: 'yes_no' }])
    setEditingIndex(questions.length)
  }
  const removeQuestion = (i: number) => {
    setQuestions(questions.filter((_, idx) => idx !== i))
    if (editingIndex === i) setEditingIndex(null)
  }
  const updateQuestion = (i: number, val: string) => {
    const updated = [...questions]
    updated[i] = { ...updated[i], text: val }
    setQuestions(updated)
  }
  const toggleQuestionType = (i: number) => {
    const updated = [...questions]
    updated[i] = { ...updated[i], type: updated[i].type === 'yes_no' ? 'text_answer' : 'yes_no' }
    setQuestions(updated)
  }

  const handleSubmit = async () => {
    const validQuestions = questions.filter(q => q.text.trim())
    if (!roomName.trim()) return setError('Donne un nom à ta salle 😅')
    if (!nickname.trim()) return setError('Choisis un pseudo pour participer !')
    if (validQuestions.length === 0) return setError('Ajoute au moins une question !')

    setLoading(true)
    setError('')

    try {
      const roomCheck = await canCreateRoom()
      if (!roomCheck.allowed) {
        setLoading(false)
        setPremiumGateReason(roomCheck.reason || 'Limite de salles actives atteinte.')
        setShowPremiumGate(true)
        return
      }
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

      const questionRows = validQuestions.map((q, i) => ({
        room_id: room.id,
        text: q.text.trim(),
        type: q.type,
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
      if (imagePreview) {
        localStorage.setItem(`inside_bg_${code}`, imagePreview)
      }
      playSuccess()
      router.push(`/lobby/${code}`)
    } catch (err) {
      console.error(err)
      setError('Une erreur est survenue. Vérifie ta connexion.')
    } finally {
      setLoading(false)
    }
  }

  const goToStep2 = () => {
    if (!roomName.trim()) { setError('Donne un nom à ta salle 😅'); return }
    if (!nickname.trim()) { setError('Choisis un pseudo pour participer !'); return }
    setError('')
    playClick()
    setStep(2)
  }

  const goToStep3 = () => {
    const valid = questions.filter(q => q.text.trim())
    if (valid.length === 0) { setError('Ajoute au moins une question !'); return }
    setError('')
    playClick()
    setStep(3)
  }

  const bgBlobs = (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full" style={{ background: `radial-gradient(circle, ${theme.glowFrom} 0%, transparent 70%)`, filter: 'blur(50px)' }} />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full" style={{ background: `radial-gradient(circle, ${theme.glowTo} 0%, transparent 70%)`, filter: 'blur(50px)' }} />
    </div>
  )

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '16px',
    padding: '16px 20px',
    color: '#f0f0f5',
    fontSize: '1.1rem',
    fontWeight: 600,
    width: '100%',
    outline: 'none',
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 gap-5 relative" style={{ background: '#08080f' }}>
      {bgBlobs}

      {/* Step dots */}
      <div className="relative z-10 pt-2">
        <StepDots step={step} grad={grad} />
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1 — Identity */}
        {step === 1 && (
          <motion.div
            key={1}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="relative z-10 flex flex-col gap-5 flex-1"
          >
            <div>
              <h1 className="text-3xl font-black" style={{ color: '#f0f0f5' }}>Créer</h1>
              <p className="text-sm mt-1" style={{ color: 'rgba(240,240,245,0.45)' }}>Commence par l&apos;essentiel</p>
            </div>

            {selectedTemplate && selectedTemplate.slug !== 'creation-libre' && (
              <div
                className="p-4 rounded-2xl flex items-center gap-3"
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

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold uppercase tracking-wider" style={{ color: 'rgba(240,240,245,0.55)' }}>🏠 Nom de la salle</label>
              <input
                type="text"
                value={roomName}
                onChange={e => setRoomName(e.target.value)}
                placeholder="Nom de la salle"
                style={inputStyle}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold uppercase tracking-wider" style={{ color: 'rgba(240,240,245,0.55)' }}>🎭 Ton pseudo</label>
              <input
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                placeholder="Ton prénom"
                maxLength={20}
                style={inputStyle}
              />
            </div>

            {error && (
              <div className="py-3 px-4 rounded-2xl text-sm font-semibold" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.30)', color: '#fca5a5' }}>
                {error}
              </div>
            )}

            <div className="flex gap-3 mt-auto pb-4">
              <Link
                href="/"
                className="flex-1 py-4 rounded-2xl font-bold text-center"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#f0f0f5', textDecoration: 'none' }}
              >
                ←
              </Link>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={goToStep2}
                className="flex-[3] py-4 rounded-2xl font-black text-white text-lg"
                style={{ background: grad, boxShadow: '0 8px 30px rgba(168,85,247,0.35)' }}
              >
                Continuer →
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* STEP 2 — Questions */}
        {step === 2 && (
          <motion.div
            key={2}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="relative z-10 flex flex-col gap-5 flex-1"
          >
            <div>
              <p className="text-sm font-semibold" style={{ color: theme.from }}>{roomName}</p>
              <h2 className="text-2xl font-black" style={{ color: '#f0f0f5' }}>Questions</h2>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-semibold" style={{ color: 'rgba(240,240,245,0.60)' }}>
                {questions.filter(q => q.text.trim()).length} question{questions.filter(q => q.text.trim()).length !== 1 ? 's' : ''}
              </span>
              <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: `${theme.from}25`, color: theme.from, border: `1px solid ${theme.from}40` }}>
                max 15 · Oui / Non
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {questions.map((q, i) => (
                <div key={i}>
                  <div
                    className="flex gap-2 items-center rounded-2xl p-3 cursor-pointer"
                    style={{ background: editingIndex === i ? `${theme.from}18` : 'rgba(255,255,255,0.05)', border: editingIndex === i ? `1px solid ${theme.from}55` : '1px solid rgba(255,255,255,0.08)' }}
                    onClick={() => setEditingIndex(editingIndex === i ? null : i)}
                  >
                    <span className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0" style={{ background: grad, color: '#fff' }}>
                      {i + 1}
                    </span>
                    <span className="flex-1 font-medium" style={{ color: q.text.trim() ? '#f0f0f5' : 'rgba(240,240,245,0.30)' }}>
                      {q.text.trim() || `Question ${i + 1}…`}
                    </span>
                    <button
                      onClick={e => { e.stopPropagation(); toggleQuestionType(i) }}
                      className="flex-shrink-0 px-2 py-1 rounded-full text-xs font-bold active:scale-90"
                      style={{
                        background: q.type === 'yes_no' ? 'rgba(16,185,129,0.15)' : `${theme.from}25`,
                        border: q.type === 'yes_no' ? '1px solid rgba(16,185,129,0.30)' : `1px solid ${theme.from}40`,
                        color: q.type === 'yes_no' ? '#34d399' : theme.from,
                      }}
                    >
                      {q.type === 'yes_no' ? 'Oui/Non' : 'Texte'}
                    </button>
                    {questions.length > 1 && (
                      <button
                        onClick={e => { e.stopPropagation(); removeQuestion(i) }}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-lg active:scale-90 flex-shrink-0"
                        style={{ background: 'rgba(239,68,68,0.20)', color: '#f87171' }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                  {editingIndex === i && (
                    <div className="mt-2 px-1">
                      <input
                        type="text"
                        value={q.text}
                        onChange={e => updateQuestion(i, e.target.value)}
                        placeholder={`Question ${i + 1}…`}
                        autoFocus
                        style={{ ...inputStyle, fontSize: '1rem' }}
                      />
                    </div>
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

            {error && (
              <div className="py-3 px-4 rounded-2xl text-sm font-semibold" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.30)', color: '#fca5a5' }}>
                {error}
              </div>
            )}

            <div className="flex gap-3 pb-4">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => { setError(''); setStep(1) }}
                className="flex-1 py-4 rounded-2xl font-bold"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#f0f0f5' }}
              >
                ←
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={goToStep3}
                className="flex-[3] py-4 rounded-2xl font-black text-white text-lg"
                style={{ background: grad, boxShadow: '0 8px 30px rgba(168,85,247,0.35)' }}
              >
                Continuer →
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* STEP 3 — Settings */}
        {step === 3 && (
          <motion.div
            key={3}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="relative z-10 flex flex-col gap-5 flex-1"
          >
            <div>
              <p className="text-sm font-semibold" style={{ color: theme.from }}>{roomName}</p>
              <h2 className="text-2xl font-black" style={{ color: '#f0f0f5' }}>Paramètres</h2>
            </div>

            {/* Points toggle */}
            <div className="p-5 rounded-2xl flex items-center justify-between gap-4" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
              <div>
                <div className="font-bold" style={{ color: '#f0f0f5' }}>🏆 Système de points</div>
                <div className="text-xs mt-1" style={{ color: 'rgba(240,240,245,0.45)' }}>Active le classement et les scores</div>
              </div>
              <button
                onClick={() => setPointsEnabled(!pointsEnabled)}
                style={{
                  width: '52px', height: '30px', borderRadius: '9999px',
                  background: pointsEnabled ? grad : 'rgba(255,255,255,0.12)',
                  border: 'none', cursor: 'pointer', position: 'relative', transition: 'background .2s', flexShrink: 0,
                }}
              >
                <span style={{
                  position: 'absolute', top: '3px',
                  left: pointsEnabled ? '25px' : '3px',
                  width: '24px', height: '24px', borderRadius: '9999px',
                  background: '#fff', transition: 'left .2s', display: 'block',
                }} />
              </button>
            </div>

            {/* Image upload */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-bold uppercase tracking-wider" style={{ color: 'rgba(240,240,245,0.55)' }}>📸 Image de fond (optionnel)</label>
              <button
                onClick={() => fileRef.current?.click()}
                className="relative w-full h-36 rounded-2xl overflow-hidden active:scale-95"
                style={{ border: '2px dashed rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.04)' }}
              >
                {imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-2" style={{ color: 'rgba(240,240,245,0.35)' }}>
                    <span className="text-3xl">🖼️</span>
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

            {error && (
              <div className="py-3 px-4 rounded-2xl text-sm font-semibold" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.30)', color: '#fca5a5' }}>
                {error}
              </div>
            )}

            <div className="flex gap-3 pb-8">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => { setError(''); setStep(2) }}
                className="flex-1 py-4 rounded-2xl font-bold"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#f0f0f5' }}
              >
                ←
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                disabled={loading}
                className="flex-[3] py-4 rounded-2xl font-black text-white text-lg disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: grad, boxShadow: '0 8px 30px rgba(168,85,247,0.35)' }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Création…
                  </>
                ) : '🚀 Créer'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showPremiumGate && (
        <PremiumGate
          reason={premiumGateReason}
          onClose={() => setShowPremiumGate(false)}
        />
      )}
    </div>
  )
}

function CreatePageInner() {
  const searchParams = useSearchParams()
  const hasParams = searchParams.get('template') || searchParams.get('free') || searchParams.get('replay')

  if (!hasParams) {
    return <ChoiceScreen />
  }

  return <CreateForm />
}

export default function CreatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#08080f' }}>
        <div className="w-14 h-14 rounded-2xl animate-spin" style={{ background: 'linear-gradient(135deg, #FF006E, #FB5607, #FFBE0B)' }} />
      </div>
    }>
      <CreatePageInner />
    </Suspense>
  )
}
