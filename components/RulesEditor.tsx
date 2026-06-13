"use client"

import { useState } from "react"

export interface RuleItem {
  id: string
  category: string
  action: string
  enabled: boolean
  whitelisted: boolean
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

const ACTION_LABELS: Record<string, string> = {
  AUTO_REPLY: "Réponse automatique",
  DRAFT_ONLY: "Brouillon à valider",
  LABEL_ONLY: "Étiquette seulement",
}

export default function RulesEditor({ rules }: { rules: RuleItem[] }) {
  const [state, setState] = useState(rules)
  const [savingId, setSavingId] = useState<string | null>(null)

  async function update(id: string, patch: { action?: string; enabled?: boolean }) {
    setSavingId(id)
    setState((s) => s.map((r) => (r.id === id ? { ...r, ...patch } : r)))
    try {
      await fetch(`/api/rules/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      })
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="divide-y divide-slate-800">
      {state.map((rule) => {
        const actions = rule.whitelisted
          ? ["AUTO_REPLY", "DRAFT_ONLY", "LABEL_ONLY"]
          : ["DRAFT_ONLY", "LABEL_ONLY"]
        return (
          <div key={rule.id} className="flex items-center justify-between gap-4 py-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => update(rule.id, { enabled: !rule.enabled })}
                className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${
                  rule.enabled ? "bg-indigo-600" : "bg-slate-700"
                }`}
                aria-label="Activer/désactiver"
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                    rule.enabled ? "translate-x-4" : ""
                  }`}
                />
              </button>
              <div className="min-w-0">
                <p className="text-sm text-white">{CATEGORY_LABELS[rule.category] ?? rule.category}</p>
                {rule.action === "AUTO_REPLY" && rule.enabled && (
                  <p className="text-xs text-emerald-500">Réponse envoyée automatiquement</p>
                )}
              </div>
            </div>
            <select
              value={rule.action}
              disabled={!rule.enabled || savingId === rule.id}
              onChange={(e) => update(rule.id, { action: e.target.value })}
              className="text-xs bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-3 py-1.5 disabled:opacity-40 shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {actions.map((a) => (
                <option key={a} value={a}>
                  {ACTION_LABELS[a]}
                </option>
              ))}
            </select>
          </div>
        )
      })}
    </div>
  )
}
