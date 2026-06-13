import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret")
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const email = req.nextUrl.searchParams.get("email")
  if (!email) return NextResponse.json({ error: "email requis" }, { status: 400 })

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: { id: true, email: true, agencyId: true },
  })
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 })

  const agency = await prisma.agency.findUnique({
    where: { id: user.agencyId! },
    select: { id: true, plan: true, emailQuotaMax: true, emailQuotaUsed: true, trialEndsAt: true },
  })

  const mailboxes = await prisma.mailbox.findMany({
    where: { agencyId: user.agencyId! },
    select: { id: true, email: true, status: true, historyId: true, lastSyncAt: true },
  })

  const emailCount = await prisma.emailMessage.count({
    where: { mailbox: { agencyId: user.agencyId! } },
  })

  return NextResponse.json({ user, agency, mailboxes, emailCount })
}
