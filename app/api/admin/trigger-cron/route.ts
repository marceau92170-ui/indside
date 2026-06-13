import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { decrypt } from "@/lib/crypto"
import { GmailProvider } from "@/lib/email/providers/gmail"
import { classifyEmail } from "@/lib/ai/classify"
import { generateDraft } from "@/lib/ai/draft"
import { buildAutoReply } from "@/lib/automation/templates"
import { CONFIDENCE_THRESHOLD, AUTO_REPLY_CATEGORIES } from "@/lib/constants"
import { EmailStatus, DraftStatus, AutoAction } from "@prisma/client"

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret")
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  // Delegate to the cron endpoint internally
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return NextResponse.json({ error: "CRON_SECRET manquant" }, { status: 500 })

  const baseUrl = process.env.NEXTAUTH_URL || "https://indside-production.up.railway.app"
  const res = await fetch(`${baseUrl}/api/cron/process-emails`, {
    method: "POST",
    headers: { Authorization: `Bearer ${cronSecret}` },
  })
  const data = await res.json()
  return NextResponse.json({ triggered: true, result: data })
}
