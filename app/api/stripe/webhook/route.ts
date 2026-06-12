import { NextRequest, NextResponse } from "next/server"
import { stripe, PLAN_QUOTAS } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

// Stripe envoie le body brut — Next.js ne doit PAS parser ce JSON
export const runtime = "nodejs"

function planFromPriceId(priceId: string): "STARTER" | "PRO" | "AGENCY_PLUS" | null {
  const starterPrice = process.env.STRIPE_PRICE_STARTER
  const proPrice = process.env.STRIPE_PRICE_PRO
  const agencyPlusPrice = process.env.STRIPE_PRICE_AGENCY_PLUS
  if (starterPrice && priceId === starterPrice) return "STARTER"
  if (proPrice && priceId === proPrice) return "PRO"
  if (agencyPlusPrice && priceId === agencyPlusPrice) return "AGENCY_PLUS"
  return null
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const agencyId = subscription.metadata?.agencyId
  if (!agencyId) return

  const priceId = subscription.items.data[0]?.price.id
  const plan = planFromPriceId(priceId)
  if (!plan) return

  const quotaMax = PLAN_QUOTAS[plan]

  await prisma.agency.update({
    where: { id: agencyId },
    data: {
      plan,
      stripeSubId: subscription.id,
      emailQuotaMax: quotaMax,
      // Remet le compteur à 0 sur chaque renouvellement
      emailQuotaUsed: 0,
    },
  })
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const agencyId = subscription.metadata?.agencyId
  if (!agencyId) return

  await prisma.agency.update({
    where: { id: agencyId },
    data: {
      plan: "STARTER",
      stripeSubId: null,
      emailQuotaMax: 500,
    },
  })
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionChange(event.data.object as Stripe.Subscription)
        break
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        const subId = typeof invoice.subscription === "string"
          ? invoice.subscription
          : invoice.subscription?.id
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId)
          await handleSubscriptionChange(sub)
        }
        break
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err)
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
