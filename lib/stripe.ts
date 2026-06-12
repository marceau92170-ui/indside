import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
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
