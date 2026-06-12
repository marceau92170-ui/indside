import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { decrypt } from "@/lib/crypto"
import { GmailProvider } from "@/lib/email/providers/gmail"
import { EmailStatus, DraftStatus } from "@prisma/client"

function extractEmail(from: string): string {
  const match = from.match(/<([^>]+)>/)
  return match ? match[1] : from.trim()
}

/**
 * Actions sur un brouillon depuis la file de validation.
 * Body JSON : { action: "approve" | "reject" | "edit", content?: string }
 *  - approve : envoie la réponse via Gmail (utilise editedContent si présent)
 *  - reject  : rejette le brouillon, email marqué ignoré
 *  - edit    : enregistre une version modifiée (sans envoyer)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.agencyId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const action = body.action as string

  // Charge le brouillon + email + mailbox, et vérifie l'appartenance à l'agence
  const draft = await prisma.draft.findUnique({
    where: { id: params.id },
    include: { emailMessage: { include: { mailbox: true } } },
  })

  if (!draft || draft.emailMessage.mailbox.agencyId !== session.user.agencyId) {
    return NextResponse.json({ error: "Brouillon introuvable" }, { status: 404 })
  }

  const email = draft.emailMessage
  const mailbox = email.mailbox

  if (action === "edit") {
    const content = (body.content as string) ?? ""
    await prisma.draft.update({
      where: { id: draft.id },
      data: { editedContent: content, status: DraftStatus.EDITED },
    })
    return NextResponse.json({ ok: true })
  }

  if (action === "reject") {
    await prisma.draft.update({
      where: { id: draft.id },
      data: { status: DraftStatus.REJECTED },
    })
    await prisma.emailMessage.update({
      where: { id: email.id },
      data: { status: EmailStatus.IGNORED },
    })
    return NextResponse.json({ ok: true })
  }

  if (action === "approve") {
    // Idempotence : ne jamais renvoyer un brouillon déjà envoyé
    if (draft.sentAt) {
      return NextResponse.json({ ok: true, alreadySent: true })
    }

    const finalContent =
      (body.content as string)?.trim() ||
      draft.editedContent?.trim() ||
      draft.content

    try {
      const provider = new GmailProvider(
        decrypt(mailbox.accessTokenEnc),
        decrypt(mailbox.refreshTokenEnc)
      )
      await provider.sendMessage({
        to: extractEmail(email.from),
        subject: email.subject.startsWith("Re:")
          ? email.subject
          : `Re: ${email.subject}`,
        body: finalContent,
        threadId: email.threadId ?? undefined,
      })
    } catch (e) {
      console.error("Erreur envoi Gmail:", e)
      return NextResponse.json(
        { error: "L'envoi via Gmail a échoué. Vérifiez la connexion de la boîte." },
        { status: 502 }
      )
    }

    await prisma.draft.update({
      where: { id: draft.id },
      data: {
        content: finalContent,
        status: body.content ? DraftStatus.EDITED : DraftStatus.APPROVED,
        sentAt: new Date(),
      },
    })
    await prisma.emailMessage.update({
      where: { id: email.id },
      data: { status: EmailStatus.VALIDATED },
    })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: "Action inconnue" }, { status: 400 })
}
