import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PLAN_QUOTAS } from "@/lib/stripe"
import { Plan } from "@prisma/client"

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret")
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const email = req.nextUrl.searchParams.get("email")
  const plan = (req.nextUrl.searchParams.get("plan") ?? "PRO") as Plan
  const days = parseInt(req.nextUrl.searchParams.get("days") ?? "1")
  const resetSync = req.nextUrl.searchParams.get("reset") === "true"

  if (!email) return NextResponse.json({ error: "email requis" }, { status: 400 })
  if (!Object.values(Plan).includes(plan)) return NextResponse.json({ error: "plan invalide" }, { status: 400 })

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: { agencyId: true },
  })
  if (!user?.agencyId) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 })

  const trialEndsAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
  const quotaMax = PLAN_QUOTAS[plan]

  await prisma.agency.update({
    where: { id: user.agencyId },
    data: { plan, emailQuotaMax: quotaMax, trialEndsAt },
  })

  if (resetSync) {
    await prisma.mailbox.updateMany({
      where: { agencyId: user.agencyId },
      data: { historyId: null, lastSyncAt: null },
    })
  }

  return NextResponse.json({
    ok: true,
    email,
    plan,
    quotaMax,
    trialEndsAt: trialEndsAt.toISOString(),
    syncReset: resetSync,
  })
}
