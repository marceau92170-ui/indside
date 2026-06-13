"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function DemoSeedButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function seed() {
    setLoading(true)
    try {
      await fetch("/api/dev/seed", { method: "POST" })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={seed}
      disabled={loading}
      className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50"
    >
      {loading ? "Chargement…" : "Charger des données de démonstration"}
    </button>
  )
}
