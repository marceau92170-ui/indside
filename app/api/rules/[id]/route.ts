import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AutoAction } from "@prisma/client"
import { AUTO_REPLY_CATEGORIES } from "@/lib/constants"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.agencyId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const rule = await prisma.automationRule.findUnique({ where: { id: params.id } })
  if (!rule || rule.agencyId !== session.user.agencyId) {
    return NextResponse.json({ error: "Règle introuvable" }, { status: 404 })
  }

  const body = await request.json().catch(() => ({}))
  const data: { action?: AutoAction; enabled?: boolean; template?: string | null } = {}

  if (typeof body.action === "string" && body.action in AutoAction) {
    const isWhitelisted = (AUTO_REPLY_CATEGORIES as readonly string[]).includes(rule.category)
    if (body.action === AutoAction.AUTO_REPLY && !isWhitelisted) {
      return NextResponse.json(
        { error: "L'auto-réponse n'est pas autorisée pour cette catégorie." },
        { status: 400 }
      )
    }
    data.action = body.action as AutoAction
  }
  if (typeof body.enabled === "boolean") {
    data.enabled = body.enabled
  }
  if ("template" in body) {
    data.template = typeof body.template === "string" && body.template.trim() ? body.template.trim() : null
  }

  const updated = await prisma.automationRule.update({
    where: { id: rule.id },
    data,
  })
  return NextResponse.json({ ok: true, rule: { id: updated.id, action: updated.action, enabled: updated.enabled, template: updated.template } })
}
