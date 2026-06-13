"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type PlanKey = "STARTER" | "PRO" | "AGENCY_PLUS"

interface Props {
  planKey: PlanKey
  highlighted: boolean
}

export default function PricingButtons({ planKey, highlighted }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleCheckout() {
    setLoading(true)
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else if (data.error) {
        // Si Stripe pas encore configuré, redirige vers l'inscription
        router.push("/register")
      }
    } catch {
      router.push("/register")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className={`w-full text-center rounded-xl px-5 py-3 text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
        highlighted
          ? "bg-indigo-600 text-white hover:bg-indigo-500"
          : "bg-slate-800 text-slate-200 hover:bg-slate-700"
      }`}
    >
      {loading ? "Redirection..." : "Commencer l'essai"}
    </button>
  )
}
