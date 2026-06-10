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
import { LayoutGrid, Sparkles, Home, UserCircle, Trophy, ImageIcon, Rocket, Minus, MessageSquare, ToggleLeft } from 'lucide-react'
import Nox from '@/components/Nox'

function ChoiceScreen() {
  const theme = getTheme()
  const templateCount = TEMPLATES.filter(t => t.slug !== 'creation-libre').length
  return (
    <motion.div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(160deg, #1a0020 0%, #050508 40%, #200010 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      {/* Ambient glow */}
      <div style={{ position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '500px', height: '500px', borderRadius: '9999px', background: 'radial-gradient(circle, rgba(255,0,110,0.15) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, padding: '16px 20px 12px', background: 'rgba(5,5,8,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            href="/"
            style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f0f0f5', textDecoration: 'none', flexShrink: 0 }}
          >
            <Home size={16} />
          </Link>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#f0f0f5', margin: 0, letterSpacing: '-0.02em' }}>
            Nouvelle partie
          </h1>
        </div>
      </div>

      {/* Nox hero zone */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '40px 20px 16px', zIndex: 1 }}>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '220px', height: '220px', borderRadius: '9999px', background: 'radial-gradient(circle, rgba(255,0,110,0.22) 0%, transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' }} />
          <Nox emotion="excited" size={130} animate />
        </div>
        <p style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f0f0f5', textAlign: 'center', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.1 }}>
          Comment jouer ?
        </p>
        <p style={{ fontSize: '0.82rem', color: 'rgba(240,240,245,0.45)', textAlign: 'center', margin: 0 }}>
          Choisis ton mode de jeu pour commencer
        </p>
      </div>

      {/* Two cards */}
      <div style={{ padding: '8px 16px 40px', display: 'flex', flexDirection: 'column', gap: '0px', zIndex: 1 }}>

        {/* Template option */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05, ease: 'easeOut' }}
          whileTap={{ scale: 0.985 }}
          style={{ position: 'relative', marginTop: '28px' }}
        >
          <div style={{ position: 'absolute', top: '-24px', left: '20px', zIndex: 2, fontSize: '3rem', lineHeight: 1, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }}>
            🎭
          </div>
          <Link href="/templates" style={{ textDecoration: 'none', display: 'block' }}>
            <div style={{
              borderRadius: '24px',
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(20px)',
              padding: '20px 20px 20px 20px',
              paddingTop: '28px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '5px', background: 'linear-gradient(180deg, #FF006E, #FB5607)', borderRadius: '24px 0 0 24px' }} />
              <div style={{ paddingLeft: '12px' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: '#FF006E', display: 'block', marginBottom: '4px' }}>
                  PRÊT À JOUER
                </span>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0a0a0a', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '8px' }}>
                  Utiliser un modèle
                </div>
                <div style={{ fontSize: '0.82rem', color: '#555', lineHeight: 1.5 }}>
                  Questions déjà rédigées. Lance la partie en 10 secondes.
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                  <span style={{ fontSize: '11px', color: '#999', fontWeight: 600 }}>
                    {templateCount} modes disponibles
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'linear-gradient(135deg, #FF006E, #FB5607)', borderRadius: '8px', padding: '5px 12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#fff' }}>Choisir</span>
                    <LayoutGrid size={11} color="#fff" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Free creation option */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.10, ease: 'easeOut' }}
          whileTap={{ scale: 0.985 }}
          style={{ position: 'relative', marginTop: '28px' }}
        >
          <div style={{ position: 'absolute', top: '-24px', left: '20px', zIndex: 2, fontSize: '3rem', lineHeight: 1, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }}>
            ✏️
          </div>
          <Link href="/create?free=1" style={{ textDecoration: 'none', display: 'block' }}>
            <div style={{
              borderRadius: '24px',
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(20px)',
              padding: '20px 20px 20px 20px',
              paddingTop: '28px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '5px', background: 'linear-gradient(180deg, #6366f1, #a855f7)', borderRadius: '24px 0 0 24px' }} />
              <div style={{ paddingLeft: '12px' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: '#6366f1', display: 'block', marginBottom: '4px' }}>
                  PERSONNALISÉ
                </span>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0a0a0a', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '8px' }}>
                  Création libre
                </div>
                <div style={{ fontSize: '0.82rem', color: '#555', lineHeight: 1.5 }}>
                  Écris tes propres questions. Un jeu 100% sur mesure.
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                  <span style={{ fontSize: '11px', color: '#999', fontWeight: 600 }}>
                    Illimité
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', borderRadius: '8px', padding: '5px 12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#fff' }}>Créer</span>
                    <Sparkles size={11} color="#fff" />
                  </div>
                </div>
              </div>
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

async function compressAvatar(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = 80
        canvas.height = 80
        const ctx = canvas.getContext('2d')!
        const size = Math.min(img.width, img.height)
        const x = (img.width - size) / 2
        const y = (img.height - size) / 2
        ctx.drawImage(img, x, y, size, size, 0, 0, 80, 80)
        resolve(canvas.toDataURL('image/jpeg', 0.75))
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

function CreateForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fileRef = useRef<HTMLInputElement>(null)
  const avatarRef = useRef<HTMLInputElement>(null)
  const theme = getTheme()
  const grad = gradient(theme)
  const shadow = gradientShadow(theme)

  const [step, setStep] = useState(1)
  const [roomName, setRoomName] = useState('')
  const [nickname, setNickname] = useState('')
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null)
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
            setQuestions(tpl.questions.map(q => ({ text: q.text, type: q.type })))
          }
        }
      }
    }

    const replay = searchParams.get('replay')
    if (replay === '1') {
      const stored = localStorage.getItem('flower_replay_questions')
      if (stored) {
        try {
          const qs = JSON.parse(stored)
          if (Array.isArray(qs) && qs.length > 0) {
            // support both legacy string[] and new object[]
            const normalized = qs.map((q: string | { text: string; type: 'yes_no' | 'text_answer' }) =>
              typeof q === 'string' ? { text: q, type: 'yes_no' as const } : q
            )
            setQuestions(normalized)
            localStorage.removeItem('flower_replay_questions')
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
        .insert({ room_id: room.id, nickname: nickname.trim(), is_host: true, avatar_url: avatarBase64 || null })
        .select()
        .single()

      if (playerError || !player) throw new Error(playerError?.message || 'Failed to create player')

      localStorage.setItem(`flower_player_${code}`, player.id)
      if (imagePreview) {
        localStorage.setItem(`flower_bg_${code}`, imagePreview)
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
    <div className="min-h-screen flex flex-col px-6 py-8 gap-5 relative" style={{ background: '#050508' }}>
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
              <label className="text-sm font-bold uppercase tracking-wider flex items-center gap-1" style={{ color: 'rgba(240,240,245,0.55)' }}><Home size={14} /> Nom de la salle</label>
              <input
                type="text"
                value={roomName}
                onChange={e => setRoomName(e.target.value)}
                placeholder="Nom de la salle"
                style={inputStyle}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold uppercase tracking-wider flex items-center gap-1" style={{ color: 'rgba(240,240,245,0.55)' }}><UserCircle size={14} /> Ton pseudo</label>
              <input
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                placeholder="Ton prénom"
                maxLength={20}
                style={inputStyle}
              />
            </div>

            {/* Avatar */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold uppercase tracking-wider" style={{ color: 'rgba(240,240,245,0.55)' }}>Ta photo (optionnel)</label>
              <div className="flex items-center gap-4">
                <div
                  onClick={() => avatarRef.current?.click()}
                  style={{
                    width: '72px', height: '72px', borderRadius: '9999px', cursor: 'pointer', flexShrink: 0,
                    background: avatarBase64 ? 'transparent' : 'rgba(255,255,255,0.08)',
                    border: avatarBase64 ? 'none' : '2px dashed rgba(255,255,255,0.20)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                  }}
                >
                  {avatarBase64 ? (
                    <img src={avatarBase64} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '9999px' }} />
                  ) : (
                    <span style={{ fontSize: '1.6rem' }}>📷</span>
                  )}
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => avatarRef.current?.click()}
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '8px 16px', color: '#f0f0f5', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    {avatarBase64 ? 'Changer' : 'Ajouter une photo'}
                  </button>
                  {avatarBase64 && (
                    <button
                      type="button"
                      onClick={() => setAvatarBase64(null)}
                      style={{ background: 'none', border: 'none', color: 'rgba(240,240,245,0.4)', fontSize: '12px', cursor: 'pointer', marginLeft: '8px' }}
                    >
                      Supprimer
                    </button>
                  )}
                </div>
                <input
                  ref={avatarRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file) setAvatarBase64(await compressAvatar(file))
                  }}
                />
              </div>
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

            {/* Counter + hint */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '9999px', background: grad }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(240,240,245,0.55)' }}>
                  {questions.filter(q => q.text.trim()).length} / 15
                </span>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(240,240,245,0.30)', letterSpacing: '.03em' }}>
                Appuie pour modifier
              </span>
            </div>

            {/* Thin gradient separator */}
            <div style={{ height: '1px', background: `linear-gradient(90deg, ${theme.from}60, transparent)` }} />

            <div className="flex flex-col" style={{ gap: '2px' }}>
              {questions.map((q, i) => {
                const isEditing = editingIndex === i
                const filled = q.text.trim().length > 0
                return (
                  <div key={i}>
                    <div
                      onClick={() => setEditingIndex(isEditing ? null : i)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '13px 14px',
                        borderRadius: '14px',
                        cursor: 'pointer',
                        background: isEditing ? 'rgba(255,255,255,0.06)' : 'transparent',
                        borderLeft: isEditing ? `3px solid ${theme.from}` : '3px solid transparent',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {/* Number */}
                      <span style={{
                        fontSize: '11px', fontWeight: 900, letterSpacing: '.03em',
                        color: filled ? theme.from : 'rgba(240,240,245,0.20)',
                        minWidth: '18px', textAlign: 'right', flexShrink: 0,
                      }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>

                      {/* Text */}
                      <span style={{
                        flex: 1, fontSize: '0.88rem', fontWeight: filled ? 600 : 400,
                        color: filled ? '#f0f0f5' : 'rgba(240,240,245,0.25)',
                        lineHeight: 1.4,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {q.text.trim() || `Question ${i + 1}…`}
                      </span>

                      {/* Type pill */}
                      <button
                        onClick={e => { e.stopPropagation(); toggleQuestionType(i) }}
                        style={{
                          flexShrink: 0, padding: '3px 8px', borderRadius: '6px',
                          fontSize: '10px', fontWeight: 800, letterSpacing: '.04em',
                          background: q.type === 'yes_no' ? 'rgba(16,185,129,0.12)' : `${theme.from}20`,
                          border: q.type === 'yes_no' ? '1px solid rgba(16,185,129,0.25)' : `1px solid ${theme.from}35`,
                          color: q.type === 'yes_no' ? '#34d399' : theme.from,
                          cursor: 'pointer',
                        }}
                      >
                        {q.type === 'yes_no' ? 'OUI/NON' : 'TEXTE'}
                      </button>

                      {/* Remove */}
                      {questions.length > 1 && (
                        <button
                          onClick={e => { e.stopPropagation(); removeQuestion(i) }}
                          style={{
                            flexShrink: 0, width: '26px', height: '26px', borderRadius: '8px',
                            background: 'rgba(239,68,68,0.10)', border: 'none',
                            color: 'rgba(248,113,113,0.60)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <Minus size={13} />
                        </button>
                      )}
                    </div>

                    {/* Inline edit */}
                    <AnimatePresence>
                      {isEditing && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.18 }}
                          style={{ overflow: 'hidden', paddingLeft: '42px', paddingRight: '4px' }}
                        >
                          <input
                            type="text"
                            value={q.text}
                            onChange={e => updateQuestion(i, e.target.value)}
                            placeholder={`Écris ta question…`}
                            autoFocus
                            style={{
                              ...inputStyle,
                              fontSize: '0.95rem',
                              padding: '12px 16px',
                              borderRadius: '12px',
                              marginBottom: '6px',
                              borderColor: `${theme.from}50`,
                            }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>

            {/* Thin gradient separator */}
            <div style={{ height: '1px', background: `linear-gradient(90deg, transparent, ${theme.from}40, transparent)` }} />

            <button
              onClick={addQuestion}
              style={{
                width: '100%', padding: '13px',
                borderRadius: '12px',
                border: `1px dashed ${theme.from}40`,
                color: theme.from,
                background: `${theme.from}08`,
                fontWeight: 700, fontSize: '13px',
                cursor: 'pointer', letterSpacing: '.03em',
              }}
            >
              + Nouvelle question
            </button>

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
                <div className="font-bold flex items-center gap-2" style={{ color: '#f0f0f5' }}><Trophy size={18} /> Système de points</div>
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
              <label className="text-sm font-bold uppercase tracking-wider flex items-center gap-1" style={{ color: 'rgba(240,240,245,0.55)' }}><ImageIcon size={14} /> Image de fond (optionnel)</label>
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
                    <ImageIcon size={32} color="rgba(240,240,245,0.35)" />
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
                ) : <><Rocket size={18} /> Créer</>}
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#050508' }}>
        <div className="w-14 h-14 rounded-2xl animate-spin" style={{ background: 'linear-gradient(135deg, #FF006E, #FB5607, #FFBE0B)' }} />
      </div>
    }>
      <CreatePageInner />
    </Suspense>
  )
}
