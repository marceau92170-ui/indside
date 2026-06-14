import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.agencyId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  const mailbox = await prisma.mailbox.findUnique({
    where: { id: params.id },
    select: { agencyId: true },
  })

  if (!mailbox || mailbox.agencyId !== session.user.agencyId) {
    return NextResponse.json({ error: "Boîte introuvable" }, { status: 404 })
  }

  // Cascade: delete drafts → emailMessages → mailbox
  const emails = await prisma.emailMessage.findMany({
    where: { mailboxId: params.id },
    select: { id: true },
  })
  const emailIds = emails.map((e) => e.id)
  await prisma.draft.deleteMany({ where: { emailMessageId: { in: emailIds } } })
  await prisma.emailMessage.deleteMany({ where: { mailboxId: params.id } })
  await prisma.mailbox.delete({ where: { id: params.id } })

  return NextResponse.json({ ok: true })
}
