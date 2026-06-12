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
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">
            Plan actuel :{" "}
            <span className="text-blue-600 font-semibold">{PLAN_LABELS[plan] ?? plan}</span>
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {isUnlimited ? "Emails illimités" : `${quotaUsed} / ${quotaMax} emails ce mois-ci`}
          </p>
        </div>
        {hasStripe ? (
          <button
            onClick={handlePortal}
            disabled={loading}
            className="text-sm text-blue-600 hover:underline disabled:opacity-50"
          >
            {loading ? "..." : "Gérer l'abonnement"}
          </button>
        ) : (
          <a
            href="/pricing"
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
          >
            Choisir un plan
          </a>
        )}
      </div>

      {!isUnlimited && (
        <div>
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-yellow-500" : "bg-blue-500"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
          {pct >= 90 && (
            <p className="text-xs text-red-600 mt-1">
              Quota presque atteint — passez au plan supérieur pour ne pas bloquer le traitement.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
