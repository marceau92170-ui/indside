export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "ImmoMail"
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

// Quotas d'emails "utiles" par mois (spam/newsletters non comptés — cf. SPEC §4).
// Agence+ : fair use plafonné à 12 000 (PAS d'illimité réel — protège la marge).
export const PLANS = {
  STARTER: { name: "Starter", price: 99, emailQuota: 1000, mailboxes: 1 },
  PRO: { name: "Pro", price: 249, emailQuota: 3000, mailboxes: 3 },
  AGENCY_PLUS: { name: "Agence+", price: 499, emailQuota: 12000, mailboxes: Infinity },
} as const

// Liste blanche des catégories autorisées à partir en AUTO-RÉPONSE.
// RÈGLE D'OR : uniquement des accusés de réception sans engagement.
// DEMANDE_VISITE en est volontairement EXCLU (proposer un créneau engage
// la disponibilité de l'agence → toujours en brouillon à valider).
export const AUTO_REPLY_CATEGORIES = ["LEAD_ACHAT", "LEAD_LOCATION", "DOSSIER_PIECES"] as const
export const CONFIDENCE_THRESHOLD = 0.85
export const ESTIMATED_TIME_PER_EMAIL_MINUTES = 3
