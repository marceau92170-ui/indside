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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ton des réponses
        </label>
        <div className="flex gap-3">
          {[
            { value: "vouvoiement", label: "Vouvoiement", desc: "vous / votre" },
            { value: "tutoiement", label: "Tutoiement", desc: "tu / toi" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTone(opt.value)}
              className={`flex-1 rounded-lg border px-4 py-3 text-left transition-colors ${
                tone === opt.value
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <p className="text-sm font-medium text-gray-900">{opt.label}</p>
              <p className="text-xs text-gray-500">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Signature
        </label>
        <textarea
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          rows={4}
          placeholder={"Cordialement,\nL'équipe de votre agence\n01 23 45 67 89"}
          className="w-full text-sm border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-400 mt-1">
          Ajoutée en bas des réponses générées et des accusés de réception.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
        {saved && <span className="text-sm text-green-600">✓ Enregistré</span>}
      </div>
    </div>
  )
}
