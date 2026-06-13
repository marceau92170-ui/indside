import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { stripe, STRIPE_PRICES } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  // Récupère l'agencyId depuis la session OU directement depuis la DB
  let agencyId = session.user.agencyId
  if (!agencyId) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { agencyId: true },
    })
    agencyId = user?.agencyId ?? ""
  }
  if (!agencyId) {
    return NextResponse.json({ error: "Aucune agence liée à ce compte" }, { status: 400 })
  }

  const { plan } = await req.json()
  const priceId = STRIPE_PRICES[plan as keyof typeof STRIPE_PRICES]
  if (!priceId || priceId.endsWith("_placeholder")) {
    return NextResponse.json(
      { error: "Stripe non configuré — ajoute tes STRIPE_PRICE_* dans les variables d'environnement" },
      { status: 400 }
    )
  }

  const agency = await prisma.agency.findUnique({
    where: { id: agencyId },
  })
  if (!agency) return NextResponse.json({ error: "Agence introuvable" }, { status: 404 })

  const user = await prisma.user.findFirst({
    where: { agencyId: agency.id },
    select: { email: true, name: true },
  })

  // Récupère ou crée le customer Stripe
  let customerId = agency.stripeCustomerId
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user?.email ?? undefined,
      name: agency.name,
      metadata: { agencyId: agency.id },
    })
    customerId = customer.id
    await prisma.agency.update({
      where: { id: agency.id },
      data: { stripeCustomerId: customerId },
    })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://indside-production.up.railway.app"

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      metadata: { agencyId: agency.id, plan },
    },
    success_url: `${appUrl}/dashboard?payment=success`,
    cancel_url: `${appUrl}/pricing?payment=cancelled`,
    allow_promotion_codes: true,
    billing_address_collection: "required",
    locale: "fr",
  })

  return NextResponse.json({ url: checkoutSession.url })
}
