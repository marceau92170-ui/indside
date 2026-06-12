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
        <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">
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
              className={`flex-1 rounded-lg border px-4 py-3 text-left transition-colors ${
                tone === opt.value
                  ? "border-indigo-500 bg-indigo-500/10"
                  : "border-slate-700 hover:border-slate-600 bg-slate-800"
              }`}
            >
              <p className="text-sm font-medium text-white">{opt.label}</p>
              <p className="text-xs text-slate-500">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">
          Signature
        </label>
        <textarea
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          rows={4}
          placeholder={"Cordialement,\nL'équipe de votre agence\n01 23 45 67 89"}
          className="w-full text-sm bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
        <p className="text-xs text-slate-600 mt-1">Ajoutée en bas de chaque réponse générée.</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-400">
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
