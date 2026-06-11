export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "ImmoMail"
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export const PLANS = {
  STARTER: { name: "Starter", price: 99, emailQuota: 500, mailboxes: 1 },
  PRO: { name: "Pro", price: 249, emailQuota: 2000, mailboxes: 3 },
  AGENCY_PLUS: { name: "Agence+", price: 499, emailQuota: Infinity, mailboxes: Infinity },
} as const

export const AUTO_REPLY_CATEGORIES = ["LEAD_ACHAT", "LEAD_LOCATION", "DEMANDE_VISITE"] as const
export const CONFIDENCE_THRESHOLD = 0.85
export const ESTIMATED_TIME_PER_EMAIL_MINUTES = 3
