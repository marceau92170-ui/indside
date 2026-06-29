// Modèles utilisés (cf. SPEC §3) et calcul de coût estimé.

export const MODEL_CLASSIFY = "claude-haiku-4-5-20251001"
export const MODEL_DRAFT = "claude-sonnet-4-6"

// Tarifs USD par million de tokens (input / output).
const PRICING: Record<string, { in: number; out: number }> = {
  "claude-haiku-4-5-20251001": { in: 1, out: 5 },
  "claude-sonnet-4-6": { in: 3, out: 15 },
}

const USD_TO_EUR = 0.92

/** Coût estimé en euros d'un appel, à partir des tokens consommés. */
export function estimateCostEur(model: string, tokensIn: number, tokensOut: number): number {
  const p = PRICING[model] ?? { in: 1, out: 5 }
  const usd = (tokensIn / 1_000_000) * p.in + (tokensOut / 1_000_000) * p.out
  return Math.round(usd * USD_TO_EUR * 100000) / 100000 // arrondi à 5 décimales
}

// Catégories métier "utiles" qui incrémentent le quota du client (cf. SPEC §1).
// SPAM et AUTRE n'incrémentent jamais le quota.
export const QUOTA_COUNTING_CATEGORIES = [
  "LEAD_ACHAT",
  "LEAD_LOCATION",
  "DEMANDE_VISITE",
  "LOCATAIRE",
  "PROPRIETAIRE",
  "DOSSIER_PIECES",
  "FOURNISSEUR",
  "ADMIN",
] as const

export function isQuotaCounting(category: string): boolean {
  return (QUOTA_COUNTING_CATEGORIES as readonly string[]).includes(category)
}
