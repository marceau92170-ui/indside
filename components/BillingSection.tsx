"use client"

import { useState } from "react"

interface Props {
  plan: string
  quotaUsed: number
  quotaMax: number
  hasStripe: boolean
}

const PLAN_LABELS: Record<string, string> = {
  STARTER: "Starter",
  PRO: "Pro",
  AGENCY_PLUS: "Agence+",
}

export default function BillingSection({ plan, quotaUsed, quotaMax, hasStripe }: Props) {
  const [loading, setLoading] = useState(false)

  const pct = quotaMax > 0 ? Math.min(100, Math.round((quotaUsed / quotaMax) * 100)) : 0
  const isUnlimited = quotaMax >= 999999

  async function handlePortal() {
    setLoading(true)
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-white">
            Plan <span className="text-indigo-400 font-semibold">{PLAN_LABELS[plan] ?? plan}</span>
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {isUnlimited ? "Emails illimités" : `${quotaUsed} / ${quotaMax} emails ce mois-ci`}
          </p>
        </div>
        {hasStripe ? (
          <button
            onClick={handlePortal}
            disabled={loading}
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50"
          >
            {loading ? "…" : "Gérer l'abonnement →"}
          </button>
        ) : (
          <a
            href="/pricing"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Choisir un plan
          </a>
        )}
      </div>

      {!isUnlimited && (
        <div>
          <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-indigo-500"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <p className={`text-xs ${pct >= 90 ? "text-red-400" : "text-slate-600"}`}>
              {pct >= 90 ? "Quota presque atteint — pensez à upgrader" : `${pct}% utilisé`}
            </p>
            <p className="text-xs text-slate-600">{quotaMax} / mois</p>
          </div>
        </div>
      )}
    </div>
  )
}
