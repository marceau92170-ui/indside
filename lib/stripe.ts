import Stripe from "stripe"

// Initialisation lazy : pas d'erreur au build si la clé n'est pas encore configurée
let _stripe: Stripe | null = null
export function getStripeClient(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error("STRIPE_SECRET_KEY non configurée")
    _stripe = new Stripe(key, { apiVersion: "2023-10-16" })
  }
  return _stripe
}

// Alias rétrocompatible pour les imports existants
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripeClient() as unknown as Record<string | symbol, unknown>)[prop]
  },
})

// Price IDs à remplacer par tes vrais IDs Stripe (mode Test)
export const STRIPE_PRICES = {
  STARTER: process.env.STRIPE_PRICE_STARTER || "price_starter_placeholder",
  PRO: process.env.STRIPE_PRICE_PRO || "price_pro_placeholder",
  AGENCY_PLUS: process.env.STRIPE_PRICE_AGENCY_PLUS || "price_agency_plus_placeholder",
} as const

export const PLAN_QUOTAS: Record<string, number> = {
  STARTER: 500,
  PRO: 2000,
  AGENCY_PLUS: 999999,
}
