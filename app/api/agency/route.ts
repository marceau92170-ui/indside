import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.agencyId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const data: { tone?: string; signature?: string } = {}

  if (body.tone === "tutoiement" || body.tone === "vouvoiement") {
    data.tone = body.tone
  }
  if (typeof body.signature === "string") {
    data.signature = body.signature.slice(0, 1000)
  }

  await prisma.agency.update({
    where: { id: session.user.agencyId },
    data,
  })
  return NextResponse.json({ ok: true })
}
