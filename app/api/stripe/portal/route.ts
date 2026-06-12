import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.agencyId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  const agency = await prisma.agency.findUnique({
    where: { id: session.user.agencyId },
  })

  if (!agency?.stripeCustomerId) {
    return NextResponse.json(
      { error: "Aucun abonnement Stripe actif" },
      { status: 400 }
    )
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://immomail.vercel.app"

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: agency.stripeCustomerId,
    return_url: `${appUrl}/settings`,
  })

  return NextResponse.json({ url: portalSession.url })
}
