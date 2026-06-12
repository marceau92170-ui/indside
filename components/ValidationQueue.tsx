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
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm font-medium text-white">File vide</p>
        <p className="text-xs text-slate-500 mt-1">Aucun brouillon en attente. Les nouveaux emails apparaîtront ici.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {queue.map((item) => {
        const draftText = edits[item.draftId] ?? item.draftContent
        const isEditing = editing[item.draftId]
        const busyAction = busy[item.draftId]

        return (
          <div key={item.draftId} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                {item.category && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 shrink-0">
                    {CATEGORY_LABELS[item.category] ?? item.category}
                  </span>
                )}
                {item.priority === "URGENT" && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-red-500/10 text-red-400 shrink-0">
                    Urgent
                  </span>
                )}
                <span className="text-sm text-white truncate font-medium">{item.subject || "(sans objet)"}</span>
              </div>
              <span className="text-xs text-slate-600 shrink-0 truncate">{item.from}</span>
            </div>

            {/* Body */}
            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800">
              {/* Original email */}
              <div className="p-5">
                <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-3">Email reçu</p>
                <p className="text-sm text-slate-400 whitespace-pre-wrap line-clamp-[14] leading-relaxed">
                  {item.body || "(corps vide)"}
                </p>
              </div>

              {/* Draft response */}
              <div className="p-5 flex flex-col">
                <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-3">Réponse proposée</p>
                {isEditing ? (
                  <textarea
                    value={draftText}
                    onChange={(e) => setEdits((s) => ({ ...s, [item.draftId]: e.target.value }))}
                    rows={10}
                    className="w-full flex-1 text-sm bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
                  />
                ) : (
                  <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed flex-1">
                    {draftText}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => act(item.draftId, "approve", edits[item.draftId])}
                    disabled={!!busyAction}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {busyAction === "approve" ? "Envoi…" : "Approuver & envoyer"}
                  </button>
                  <button
                    onClick={() => setEditing((s) => ({ ...s, [item.draftId]: !s[item.draftId] }))}
                    disabled={!!busyAction}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg border border-slate-700 transition-colors disabled:opacity-50"
                  >
                    {isEditing ? "Aperçu" : "Modifier"}
                  </button>
                  <button
                    onClick={() => act(item.draftId, "reject")}
                    disabled={!!busyAction}
                    className="px-4 py-2 bg-slate-800 hover:bg-red-500/10 text-slate-500 hover:text-red-400 text-sm font-medium rounded-lg border border-slate-700 hover:border-red-500/20 transition-colors disabled:opacity-50"
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
