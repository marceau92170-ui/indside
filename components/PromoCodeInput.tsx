"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function PromoCodeInput({ hasRedemption }: { hasRedemption: boolean }) {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (hasRedemption) {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-400">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
        Code d&apos;accès activé
      </div>
    )
  }

  async function redeem() {
    if (!code.trim()) return
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch("/api/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Code invalide")
      } else {
        setSuccess(`Accès activé — plan ${data.plan} pendant ${data.durationDays} jours`)
        setCode("")
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
      {success && (
        <p className="text-xs text-emerald-400">{success}</p>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="CODE D'INVITATION"
          className="flex-1 px-4 py-2.5 bg-ink-850 border border-line rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 focus:bg-ink-900 text-sm font-mono tracking-widest transition-all"
        />
        <button
          onClick={redeem}
          disabled={loading || !code.trim()}
          className="px-4 py-2.5 bg-brand hover:bg-brand-hover text-white text-[13px] font-medium rounded-lg transition-all hover:shadow-glow disabled:opacity-50"
        >
          {loading ? "…" : "Activer"}
        </button>
      </div>
    </div>
  )
}
