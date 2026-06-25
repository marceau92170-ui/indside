"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function DisconnectMailboxButton({ mailboxId }: { mailboxId: string }) {
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const router = useRouter()

  async function disconnect() {
    setLoading(true)
    try {
      await fetch(`/api/mailbox/${mailboxId}`, { method: "DELETE" })
      router.refresh()
    } finally {
      setLoading(false)
      setConfirm(false)
    }
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-2.5">
        <span className="text-xs text-zinc-400">Confirmer ?</span>
        <button
          onClick={disconnect}
          disabled={loading}
          className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors disabled:opacity-50"
        >
          {loading ? "..." : "Oui, déconnecter"}
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Annuler
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="text-xs text-zinc-600 hover:text-red-400 transition-colors"
    >
      Déconnecter
    </button>
  )
}
