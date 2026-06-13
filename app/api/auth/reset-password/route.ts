import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  const { token, password } = await req.json().catch(() => ({}))
  if (!token || !password) {
    return NextResponse.json({ error: "Données manquantes" }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Le mot de passe doit faire au moins 8 caractères" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { resetToken: token } })

  if (!user || !user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
    return NextResponse.json({ error: "Lien invalide ou expiré" }, { status: 400 })
  }

  const hashed = await bcrypt.hash(password, 12)

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed, resetToken: null, resetTokenExpiresAt: null },
  })

  return NextResponse.json({ ok: true })
}
