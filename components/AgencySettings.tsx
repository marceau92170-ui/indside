"use client"

import { useState } from "react"

export default function AgencySettings({
  initialTone,
  initialSignature,
}: {
  initialTone: string
  initialSignature: string
}) {
  const [tone, setTone] = useState(initialTone)
  const [signature, setSignature] = useState(initialSignature)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    setSaving(true)
    setSaved(false)
    try {
      await fetch("/api/agency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tone, signature }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-[13px] font-medium text-zinc-300 mb-2">
          Ton des réponses
        </label>
        <div className="flex gap-2">
          {[
            { value: "vouvoiement", label: "Vouvoiement", desc: "vous / votre" },
            { value: "tutoiement", label: "Tutoiement", desc: "tu / toi" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTone(opt.value)}
              className={`flex-1 rounded-lg border px-4 py-3 text-left transition-all ${
                tone === opt.value
                  ? "border-brand bg-brand/10"
                  : "border-line hover:border-line-strong bg-ink-850"
              }`}
            >
              <p className="text-[13.5px] font-medium text-white">{opt.label}</p>
              <p className="text-xs text-zinc-500">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[13px] font-medium text-zinc-300 mb-2">
          Signature
        </label>
        <textarea
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          rows={4}
          placeholder={"Cordialement,\nL'équipe de votre agence\n01 23 45 67 89"}
          className="w-full text-[13px] bg-ink-850 border border-line rounded-lg p-3 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 focus:bg-ink-900 resize-none transition-all"
        />
        <p className="text-xs text-zinc-600 mt-1.5">Ajoutée en bas de chaque réponse générée.</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="px-4 py-2 bg-brand hover:bg-brand-hover text-white text-[13px] font-medium rounded-lg transition-all hover:shadow-glow disabled:opacity-50"
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-[13px] text-emerald-400 animate-fade-up">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Enregistré
          </span>
        )}
      </div>
    </div>
  )
}
