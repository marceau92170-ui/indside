"use client"

import { useState } from "react"

export interface RuleItem {
  id: string
  category: string
  action: string
  enabled: boolean
  whitelisted: boolean
  template: string | null
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

const DEFAULT_TEMPLATES: Record<string, string> = {
  LEAD_ACHAT: `{{salutation}}

Nous vous remercions pour votre demande et l'intérêt que vous portez à votre projet d'achat.

Un conseiller prend connaissance de votre demande et vous recontactera dans les meilleurs délais.

Nous restons à votre entière disposition.

{{signature}}`,
  LEAD_LOCATION: `{{salutation}}

Nous vous remercions pour votre demande de location.

Un conseiller étudie votre recherche et vous recontactera très prochainement.

Nous restons à votre disposition.

{{signature}}`,
  DOSSIER_PIECES: `{{salutation}}

Nous accusons bonne réception des documents transmis pour votre dossier.

Notre équipe procède à leur vérification et reviendra vers vous sous 48 à 72 heures.

Nous vous remercions de votre confiance.

{{signature}}`,
}

export default function RulesEditor({ rules }: { rules: RuleItem[] }) {
  const [state, setState] = useState(rules)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [templates, setTemplates] = useState<Record<string, string>>(
    Object.fromEntries(rules.map((r) => [r.id, r.template ?? ""]))
  )
  const [savingTemplate, setSavingTemplate] = useState<string | null>(null)
  const [savedTemplate, setSavedTemplate] = useState<Record<string, boolean>>({})

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

  async function saveTemplate(id: string) {
    setSavingTemplate(id)
    try {
      await fetch(`/api/rules/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template: templates[id] || null }),
      })
      setSavedTemplate((s) => ({ ...s, [id]: true }))
      setTimeout(() => setSavedTemplate((s) => ({ ...s, [id]: false })), 2000)
    } finally {
      setSavingTemplate(null)
    }
  }

  return (
    <div className="divide-y divide-slate-800">
      {state.map((rule) => {
        const actions = rule.whitelisted
          ? ["AUTO_REPLY", "DRAFT_ONLY", "LABEL_ONLY"]
          : ["DRAFT_ONLY", "LABEL_ONLY"]
        const isAutoReply = rule.action === "AUTO_REPLY"
        const isExpanded = expanded[rule.id]
        const placeholder = DEFAULT_TEMPLATES[rule.category] || `{{salutation}}\n\nVotre message ici.\n\n{{signature}}`

        return (
          <div key={rule.id} className="py-4">
            <div className="flex items-center justify-between gap-4">
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
                  {isAutoReply && rule.enabled && (
                    <p className="text-xs text-emerald-500">Envoi automatique actif</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={rule.action}
                  disabled={!rule.enabled || savingId === rule.id}
                  onChange={(e) => update(rule.id, { action: e.target.value })}
                  className="text-xs bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-3 py-1.5 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {actions.map((a) => (
                    <option key={a} value={a}>
                      {ACTION_LABELS[a]}
                    </option>
                  ))}
                </select>
                {isAutoReply && rule.enabled && (
                  <button
                    onClick={() => setExpanded((s) => ({ ...s, [rule.id]: !s[rule.id] }))}
                    className="text-xs text-indigo-400 hover:text-indigo-300 px-2 py-1.5 rounded-lg hover:bg-indigo-500/10 transition-colors"
                  >
                    {isExpanded ? "Fermer" : "Message →"}
                  </button>
                )}
              </div>
            </div>

            {isAutoReply && rule.enabled && isExpanded && (
              <div className="mt-4 pl-12 space-y-2">
                <p className="text-xs text-slate-500">
                  Ce message part automatiquement, sans validation. Variables disponibles :{" "}
                  <code className="text-indigo-400 bg-slate-800 px-1 rounded">{"{{salutation}}"}</code>{" "}
                  et{" "}
                  <code className="text-indigo-400 bg-slate-800 px-1 rounded">{"{{signature}}"}</code>
                </p>
                <textarea
                  value={templates[rule.id] ?? ""}
                  onChange={(e) => setTemplates((s) => ({ ...s, [rule.id]: e.target.value }))}
                  placeholder={placeholder}
                  rows={8}
                  className="w-full text-sm bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed font-mono"
                />
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => saveTemplate(rule.id)}
                    disabled={savingTemplate === rule.id}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {savingTemplate === rule.id ? "Enregistrement…" : "Enregistrer le message"}
                  </button>
                  {savedTemplate[rule.id] && (
                    <span className="text-xs text-emerald-400">Enregistré</span>
                  )}
                  {!templates[rule.id] && (
                    <span className="text-xs text-slate-600">Vide = message par défaut</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
