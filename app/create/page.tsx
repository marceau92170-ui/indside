'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export default function CreatePage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [roomName, setRoomName] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [questions, setQuestions] = useState<string[]>([''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const url = URL.createObjectURL(file)
    setImagePreview(url)
  }

  const addQuestion = () => {
    setQuestions([...questions, ''])
  }

  const removeQuestion = (i: number) => {
    setQuestions(questions.filter((_, idx) => idx !== i))
  }

  const updateQuestion = (i: number, val: string) => {
    const updated = [...questions]
    updated[i] = val
    setQuestions(updated)
  }

  const handleSubmit = async () => {
    const validQuestions = questions.filter(q => q.trim())
    if (!roomName.trim()) return setError('Donne un nom à ta salle 😅')
    if (validQuestions.length === 0) return setError('Ajoute au moins une question !')

    setLoading(true)
    setError('')

    try {
      let imageUrl: string | null = null

      if (imageFile) {
        const ext = imageFile.name.split('.').pop()
        const path = `rooms/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(path, imageFile, { upsert: true })

        if (!uploadError) {
          const { data } = supabase.storage.from('images').getPublicUrl(path)
          imageUrl = data.publicUrl
        }
      }

      const code = generateCode()

      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert({ code, name: roomName.trim(), image_url: imageUrl })
        .select()
        .single()

      if (roomError) throw roomError

      const questionsToInsert = validQuestions.map((text, i) => ({
        room_id: room.id,
        text,
        order_index: i,
      }))

      const { error: qError } = await supabase
        .from('questions')
        .insert(questionsToInsert)

      if (qError) throw qError

      router.push(`/room/${code}?host=true`)
    } catch (err) {
      console.error(err)
      setError('Une erreur est survenue. Vérifie ta connexion Supabase.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/" className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg">
          ←
        </Link>
        <h1 className="text-2xl font-black">Créer une salle</h1>
      </div>

      {/* Room name */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-white/60 uppercase tracking-wider">Nom de la salle</label>
        <input
          type="text"
          value={roomName}
          onChange={e => setRoomName(e.target.value)}
          placeholder="Ex : Soirée de Jean 🎉"
          className="w-full py-4 px-5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 text-lg font-medium focus:outline-none focus:border-purple-500/80 focus:bg-white/15"
        />
      </div>

      {/* Image upload */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-white/60 uppercase tracking-wider">Image de fond</label>
        <button
          onClick={() => fileRef.current?.click()}
          className="relative w-full h-40 rounded-2xl border-2 border-dashed border-white/20 overflow-hidden active:scale-95"
        >
          {imagePreview ? (
            <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-white/40">
              <span className="text-4xl">🖼️</span>
              <span className="text-sm font-medium">Appuie pour choisir une photo</span>
            </div>
          )}
          {imagePreview && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <span className="text-sm font-semibold bg-black/50 px-3 py-1 rounded-full">Changer</span>
            </div>
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
      </div>

      {/* Questions */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Questions ({questions.filter(q => q.trim()).length})
          </label>
          <span className="text-xs text-white/40">Réponse : Oui / Non</span>
        </div>

        {questions.map((q, i) => (
          <div key={i} className="flex gap-2 items-start">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-4 text-white/30 font-bold text-sm">{i + 1}.</span>
              <input
                type="text"
                value={q}
                onChange={e => updateQuestion(i, e.target.value)}
                placeholder={`Question ${i + 1}…`}
                className="w-full py-4 pl-9 pr-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/80 focus:bg-white/15"
              />
            </div>
            {questions.length > 1 && (
              <button
                onClick={() => removeQuestion(i)}
                className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center text-xl active:scale-90 flex-shrink-0 mt-0.5"
              >
                ×
              </button>
            )}
          </div>
        ))}

        <button
          onClick={addQuestion}
          className="w-full py-4 rounded-2xl border-2 border-dashed border-white/20 text-white/50 font-semibold active:scale-95 hover:border-white/40 hover:text-white/70"
        >
          + Ajouter une question
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="py-3 px-4 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Submit */}
      <div className="pb-8 mt-auto">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-5 rounded-2xl bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 text-white font-bold text-lg shadow-2xl shadow-purple-500/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Création en cours…
            </span>
          ) : '🚀 Créer la salle'}
        </button>
      </div>
    </div>
  )
}
