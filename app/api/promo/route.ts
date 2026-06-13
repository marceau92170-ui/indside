import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PLAN_QUOTAS } from "@/lib/stripe"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.agencyId) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 })
  }

  const { code } = await req.json().catch(() => ({}))
  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "Code requis" }, { status: 400 })
  }

  const agencyId = session.user.agencyId

  const existing = await prisma.promoRedemption.findUnique({ where: { agencyId } })
  if (existing) {
    return NextResponse.json({ error: "Vous avez déjà activé un code promo" }, { status: 400 })
  }

  const promo = await prisma.promoCode.findUnique({ where: { code: code.toUpperCase().trim() } })
  if (!promo) {
    return NextResponse.json({ error: "Code invalide" }, { status: 404 })
  }

  if (promo.expiresAt && promo.expiresAt < new Date()) {
    return NextResponse.json({ error: "Ce code a expiré" }, { status: 400 })
  }

  if (promo.usedCount >= promo.maxUses) {
    return NextResponse.json({ error: "Ce code a atteint son nombre d'utilisations maximum" }, { status: 400 })
  }

  const trialEndsAt = new Date(Date.now() + promo.durationDays * 24 * 60 * 60 * 1000)
  const quotaMax = PLAN_QUOTAS[promo.plan] ?? 2000

  await prisma.$transaction([
    prisma.promoRedemption.create({
      data: { promoCodeId: promo.id, agencyId },
    }),
    prisma.promoCode.update({
      where: { id: promo.id },
      data: { usedCount: { increment: 1 } },
    }),
    prisma.agency.update({
      where: { id: agencyId },
      data: { plan: promo.plan, emailQuotaMax: quotaMax, trialEndsAt },
    }),
  ])

  return NextResponse.json({
    success: true,
    plan: promo.plan,
    durationDays: promo.durationDays,
    trialEndsAt: trialEndsAt.toISOString(),
  })
}
