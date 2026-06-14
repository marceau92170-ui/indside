import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { google } from "googleapis"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const MAILBOX_LIMITS: Record<string, number> = {
  STARTER: 1,
  PRO: 3,
  AGENCY_PLUS: 999,
}

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.agencyId) {
    return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL || "http://localhost:3000"))
  }

  const agency = await prisma.agency.findUnique({
    where: { id: session.user.agencyId },
    select: { plan: true, emailQuotaMax: true },
  })

  // Block if no active plan
  if (!agency || agency.emailQuotaMax === 0) {
    return NextResponse.redirect(
      new URL("/settings?error=no_plan", process.env.NEXTAUTH_URL || "http://localhost:3000")
    )
  }

  // Check mailbox limit for plan
  const limit = MAILBOX_LIMITS[agency.plan] ?? 1
  const count = await prisma.mailbox.count({
    where: { agencyId: session.user.agencyId, status: { not: "DISCONNECTED" } },
  })

  if (count >= limit) {
    return NextResponse.redirect(
      new URL(`/settings?error=mailbox_limit_${agency.plan.toLowerCase()}`, process.env.NEXTAUTH_URL || "http://localhost:3000")
    )
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/gmail/callback`
  )

  const scopes = [
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/gmail.compose",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/userinfo.email",
  ]

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
    state: session.user.agencyId,
  })

  return NextResponse.redirect(url)
}

