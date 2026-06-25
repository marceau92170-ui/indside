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
        <p className="text-sm font-semibold">File vide</p>
        <p className="text-[12.5px] text-zinc-500 mt-1">Aucun brouillon en attente. Les nouveaux emails apparaîtront ici.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {queue.map((item) => {
        const draftText = edits[item.draftId] ?? item.draftContent
        const isEditing = editing[item.draftId]
        const busyAction = busy[item.draftId]

        return (
          <div key={item.draftId} className="bg-ink-900 border border-line rounded-xl overflow-hidden transition-colors hover:border-line-strong">
            {/* Header */}
            <div className="px-[18px] py-3.5 border-b border-line flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                {item.priority === "URGENT" && (
                  <span className="text-[11px] font-medium px-2 py-[3px] rounded-md bg-red-500/10 text-red-400 shrink-0">
                    Urgent
                  </span>
                )}
                {item.category && (
                  <span className="text-[11px] font-medium px-2 py-[3px] rounded-md bg-indigo-500/10 text-indigo-300 shrink-0">
                    {CATEGORY_LABELS[item.category] ?? item.category}
                  </span>
                )}
                <span className="text-[13.5px] truncate font-medium">{item.subject || "(sans objet)"}</span>
              </div>
              <span className="text-[12px] text-zinc-600 shrink-0 truncate">{item.from}</span>
            </div>

            {/* Body */}
            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-line">
              {/* Original email */}
              <div className="p-[18px]">
                <p className="text-[10.5px] font-semibold text-zinc-600 uppercase tracking-[0.07em] mb-[11px]">Email reçu</p>
                <p className="text-[13px] text-zinc-400 whitespace-pre-wrap line-clamp-[14] leading-relaxed">
                  {item.body || "(corps vide)"}
                </p>
              </div>

              {/* Draft response */}
              <div className="p-[18px] flex flex-col">
                <p className="text-[10.5px] font-semibold text-zinc-600 uppercase tracking-[0.07em] mb-[11px]">Réponse proposée par l&apos;IA</p>
                {isEditing ? (
                  <textarea
                    value={draftText}
                    onChange={(e) => setEdits((s) => ({ ...s, [item.draftId]: e.target.value }))}
                    rows={10}
                    className="w-full flex-1 text-[13px] bg-ink-850 border border-line rounded-lg p-3 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 resize-none leading-relaxed transition-all"
                  />
                ) : (
                  <p className="text-[13px] text-zinc-200 whitespace-pre-wrap leading-relaxed flex-1">
                    {draftText}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-line">
                  <button
                    onClick={() => act(item.draftId, "approve", edits[item.draftId])}
                    disabled={!!busyAction}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand hover:bg-brand-hover text-white text-[13px] font-medium rounded-lg transition-all hover:-translate-y-px hover:shadow-glow disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
                  >
                    {busyAction === "approve" ? (
                      <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <svg className="w-[15px] h-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {busyAction === "approve" ? "Envoi…" : "Approuver & envoyer"}
                  </button>
                  <button
                    onClick={() => setEditing((s) => ({ ...s, [item.draftId]: !s[item.draftId] }))}
                    disabled={!!busyAction}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-ink-850 hover:bg-ink-800 text-zinc-300 text-[13px] font-medium rounded-lg border border-line hover:border-line-strong transition-colors disabled:opacity-50"
                  >
                    <svg className="w-[15px] h-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    {isEditing ? "Aperçu" : "Modifier"}
                  </button>
                  <button
                    onClick={() => act(item.draftId, "reject")}
                    disabled={!!busyAction}
                    className="ml-auto px-3.5 py-2 text-zinc-500 hover:text-red-400 text-[13px] font-medium rounded-lg transition-colors disabled:opacity-50"
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
