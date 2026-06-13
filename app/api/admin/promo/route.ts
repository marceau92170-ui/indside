import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Plan } from "@prisma/client"
import { randomBytes } from "crypto"

function generateCode(): string {
  return randomBytes(4).toString("hex").toUpperCase()
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret")
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const {
    code = generateCode(),
    maxUses = 1,
    durationDays = 30,
    plan = "PRO",
    notes = "",
    expiresAt = null,
  } = body

  if (!Object.values(Plan).includes(plan as Plan)) {
    return NextResponse.json({ error: "Plan invalide" }, { status: 400 })
  }

  const promo = await prisma.promoCode.create({
    data: {
      code: code.toUpperCase(),
      maxUses,
      durationDays,
      plan: plan as Plan,
      notes,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  })

  return NextResponse.json({ code: promo.code, id: promo.id })
}

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret")
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const codes = await prisma.promoCode.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { redemptions: true } } },
  })

  return NextResponse.json(codes)
}
