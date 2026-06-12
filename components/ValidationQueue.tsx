"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export interface ValidationItem {
  draftId: string
  from: string
  subject: string
  body: string
  category: string | null
  priority: string | null
  receivedAt: string
  draftContent: string
}

const CATEGORY_LABELS: Record<string, string> = {
  LEAD_ACHAT: "Lead achat",
  LEAD_LOCATION: "Lead location",
  DEMANDE_VISITE: "Demande de visite",
  LOCATAIRE: "Locataire",
  PROPRIETAIRE: "Propriétaire",
  DOSSIER_PIECES: "Dossier / pièces",
  FOURNISSEUR: "Fournisseur",
  ADMIN: "Administratif",
  SPAM: "Spam",
  AUTRE: "Autre",
}

const PRIORITY_STYLES: Record<string, string> = {
  URGENT: "bg-red-100 text-red-700",
  NORMAL: "bg-blue-100 text-blue-700",
  BAS: "bg-gray-100 text-gray-600",
}

export default function ValidationQueue({ items }: { items: ValidationItem[] }) {
  const router = useRouter()
  const [queue, setQueue] = useState(items)
  const [edits, setEdits] = useState<Record<string, string>>({})
  const [editing, setEditing] = useState<Record<string, boolean>>({})
  const [busy, setBusy] = useState<Record<string, string | null>>({})
  const [error, setError] = useState<string | null>(null)

  async function act(draftId: string, action: "approve" | "reject", content?: string) {
    setError(null)
    setBusy((b) => ({ ...b, [draftId]: action }))
    try {
      const res = await fetch(`/api/drafts/${draftId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, content }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Action impossible")
      }
      // Retire l'élément traité de la file
      setQueue((q) => q.filter((it) => it.draftId !== draftId))
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue")
    } finally {
      setBusy((b) => ({ ...b, [draftId]: null }))
    }
  }

  if (queue.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">✅</div>
        <p className="text-lg font-medium text-gray-900">File vide, bravo !</p>
        <p className="text-sm text-gray-500 mt-1">
          Aucun brouillon en attente. Les nouveaux emails apparaîtront ici.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {queue.map((item) => {
        const draftText = edits[item.draftId] ?? item.draftContent
        const isEditing = editing[item.draftId]
        const busyAction = busy[item.draftId]
        return (
          <div
            key={item.draftId}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          >
            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
              {/* Email d'origine */}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {item.category && (
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                      {CATEGORY_LABELS[item.category] ?? item.category}
                    </span>
                  )}
                  {item.priority && item.priority !== "NORMAL" && (
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        PRIORITY_STYLES[item.priority] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item.priority === "URGENT" ? "Urgent" : "Bas"}
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {item.subject || "(sans objet)"}
                </p>
                <p className="text-xs text-gray-500 mb-3 truncate">{item.from}</p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-[12]">
                  {item.body || item.draftContent}
                </p>
              </div>

              {/* Réponse proposée */}
              <div className="p-5 bg-gray-50/50">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Réponse proposée
                </p>
                {isEditing ? (
                  <textarea
                    value={draftText}
                    onChange={(e) =>
                      setEdits((s) => ({ ...s, [item.draftId]: e.target.value }))
                    }
                    rows={10}
                    className="w-full text-sm border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">
                    {draftText}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    onClick={() => act(item.draftId, "approve", edits[item.draftId])}
                    disabled={!!busyAction}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {busyAction === "approve" ? "Envoi…" : "✓ Approuver & envoyer"}
                  </button>
                  <button
                    onClick={() =>
                      setEditing((s) => ({ ...s, [item.draftId]: !s[item.draftId] }))
                    }
                    disabled={!!busyAction}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {isEditing ? "Aperçu" : "Modifier"}
                  </button>
                  <button
                    onClick={() => act(item.draftId, "reject")}
                    disabled={!!busyAction}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    {busyAction === "reject" ? "…" : "Rejeter"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
