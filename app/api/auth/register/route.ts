import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { seedDefaultRules } from "@/lib/automation/defaults"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { agencyName, name, email, password } = body

    if (!agencyName || !name || !email || !password) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caractères" },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Un compte existe déjà avec cet email" },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const agency = await prisma.agency.create({
      data: {
        name: agencyName,
        users: {
          create: {
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
          },
        },
      },
      include: { users: true },
    })

    // Préréglage « prudent » : crée les règles d'automatisation par défaut
    await seedDefaultRules(agency.id)

    return NextResponse.json({
      success: true,
      userId: agency.users[0].id,
    })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
