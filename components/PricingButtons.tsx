"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

type PlanKey = "STARTER" | "PRO" | "AGENCY_PLUS"

interface Props {
  planKey: PlanKey
  highlighted: boolean
}

export default function PricingButtons({ planKey, highlighted }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { status } = useSession()
  const router = useRouter()

  async function handleCheckout() {
    // Pas connecté → login avec retour sur /pricing
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/pricing")
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      })
      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else if (res.status === 401) {
        router.push("/login?callbackUrl=/pricing")
      } else if (data.error) {
        setError(data.error)
      }
    } catch {
      setError("Une erreur est survenue. Réessayez.")
    } finally {
      setLoading(false)
    }
  }

  const label = status === "unauthenticated" ? "Se connecter pour souscrire" : "Souscrire"

  return (
    <div>
      <button
        onClick={handleCheckout}
        disabled={loading || status === "loading"}
        className={`w-full text-center rounded-xl px-5 py-3 text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
          highlighted
            ? "bg-indigo-600 text-white hover:bg-indigo-500"
            : "bg-slate-800 text-slate-200 hover:bg-slate-700"
        }`}
      >
        {loading ? "Redirection…" : label}
      </button>
      {error && <p className="text-xs text-red-400 mt-2 text-center">{error}</p>}
    </div>
  )
}
