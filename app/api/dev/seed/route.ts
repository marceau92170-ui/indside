import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { encrypt } from "@/lib/crypto"
import { EmailCategory, Priority, EmailStatus, DraftStatus, Prisma } from "@prisma/client"

const DEMO_EMAIL = "demo@immomail.test"

/**
 * Crée un jeu de données de démonstration pour l'agence connectée :
 * une boîte fictive + des emails classifiés (auto-réponses envoyées,
 * brouillons en attente, spam étiqueté). Permet de visualiser le produit
 * sans avoir branché une vraie boîte Gmail. Idempotent.
 */
export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.agencyId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  const agencyId = session.user.agencyId

  const existing = await prisma.mailbox.findFirst({
    where: { agencyId, email: DEMO_EMAIL },
  })
  if (existing) {
    return NextResponse.json({ ok: true, alreadySeeded: true })
  }

  const mailbox = await prisma.mailbox.create({
    data: {
      agencyId,
      email: DEMO_EMAIL,
      provider: "GMAIL",
      accessTokenEnc: encrypt("demo"),
      refreshTokenEnc: encrypt("demo"),
      status: "ACTIVE",
      lastSyncAt: new Date(),
    },
  })

  const now = Date.now()
  const hoursAgo = (h: number) => new Date(now - h * 3600_000)

  type Seed = {
    from: string
    subject: string
    body: string
    category: EmailCategory
    priority: Priority
    status: EmailStatus
    extracted: Record<string, unknown>
    hours: number
    draft?: { content: string; status: DraftStatus; sent?: boolean }
  }

  const seeds: Seed[] = [
    {
      from: "SeLoger <contact@seloger.com>",
      subject: "Nouveau contact pour votre annonce - Appartement T3 Lyon 3e",
      body: "Bonjour, un internaute est intéressé par votre annonce.\nNom : Julie Martin\nTéléphone : 06 12 34 56 78\nMessage : Bonjour, votre T3 est-il toujours disponible ? Je souhaiterais avoir plus d'informations.",
      category: EmailCategory.LEAD_ACHAT,
      priority: Priority.NORMAL,
      status: EmailStatus.AUTO_SENT,
      extracted: { nom: "Julie Martin", telephone: "06 12 34 56 78", portail: "SeLoger", bien: "Appartement T3 Lyon 3e" },
      hours: 1,
      draft: {
        content:
          "Bonjour Julie Martin,\n\nNous vous remercions pour votre demande concernant l'appartement T3 à Lyon 3e. Un conseiller vous recontactera dans les meilleurs délais.\n\nCordialement,\nL'équipe de l'agence",
        status: DraftStatus.APPROVED,
        sent: true,
      },
    },
    {
      from: "Leboncoin <noreply@leboncoin.fr>",
      subject: "Demande de location - Studio meublé Villeurbanne",
      body: "Vous avez reçu un message concernant votre annonce.\nNom : Thomas Bernard\nBudget : 650€/mois\nMessage : Bonjour, je recherche un studio pour septembre, le vôtre est-il encore dispo ?",
      category: EmailCategory.LEAD_LOCATION,
      priority: Priority.NORMAL,
      status: EmailStatus.DRAFT_READY,
      extracted: { nom: "Thomas Bernard", budget: "650€/mois", portail: "Leboncoin", bien: "Studio meublé Villeurbanne" },
      hours: 2,
      draft: {
        content:
          "Bonjour Thomas Bernard,\n\nNous vous remercions de votre intérêt pour notre studio meublé à Villeurbanne. Nous serions ravis de vous accompagner dans votre recherche.\n\nPourriez-vous nous préciser votre date d'emménagement souhaitée ? Nous reviendrons vers vous très rapidement.\n\nCordialement,\nL'équipe de l'agence",
        status: DraftStatus.PENDING,
      },
    },
    {
      from: "Sophie Petit <sophie.petit@gmail.com>",
      subject: "Visite appartement rue Garibaldi",
      body: "Bonjour, serait-il possible de visiter l'appartement de la rue Garibaldi cette semaine ? Je suis disponible jeudi et vendredi après-midi. Merci d'avance.",
      category: EmailCategory.DEMANDE_VISITE,
      priority: Priority.URGENT,
      status: EmailStatus.DRAFT_READY,
      extracted: { nom: "Sophie Petit", bien: "Appartement rue Garibaldi" },
      hours: 3,
      draft: {
        content:
          "Bonjour Sophie Petit,\n\nMerci pour votre intérêt concernant l'appartement rue Garibaldi. Je vous propose une visite jeudi à 14h ou vendredi à 16h ; n'hésitez pas à me dire ce qui vous conviendrait le mieux.\n\nDans l'attente de votre retour,\nCordialement,\nL'équipe de l'agence",
        status: DraftStatus.PENDING,
      },
    },
    {
      from: "M. Dubois <jdubois@orange.fr>",
      subject: "Problème chauffe-eau appartement",
      body: "Bonjour, je suis locataire au 12 rue des Lilas. Mon chauffe-eau ne fonctionne plus depuis hier soir, je n'ai plus d'eau chaude. Pouvez-vous intervenir rapidement ? Cordialement.",
      category: EmailCategory.LOCATAIRE,
      priority: Priority.URGENT,
      status: EmailStatus.DRAFT_READY,
      extracted: { nom: "M. Dubois", bien: "12 rue des Lilas" },
      hours: 4,
      draft: {
        content:
          "Bonjour M. Dubois,\n\nNous avons bien pris note de la panne de votre chauffe-eau au 12 rue des Lilas et comprenons l'urgence de la situation. Nous contactons dès aujourd'hui notre plombier afin qu'il intervienne dans les meilleurs délais et revenons vers vous très vite pour convenir d'un créneau.\n\nCordialement,\nL'équipe de l'agence",
        status: DraftStatus.PENDING,
      },
    },
    {
      from: "Mme Leroy <claire.leroy@wanadoo.fr>",
      subject: "Mandat de gestion - question sur les loyers",
      body: "Bonjour, je suis propriétaire d'un bien que vous gérez. Je souhaiterais savoir quand sera versé le loyer du mois et avoir un point sur la situation. Merci.",
      category: EmailCategory.PROPRIETAIRE,
      priority: Priority.NORMAL,
      status: EmailStatus.DRAFT_READY,
      extracted: { nom: "Mme Leroy" },
      hours: 6,
      draft: {
        content:
          "Bonjour Mme Leroy,\n\nNous vous remercions de votre message. Le versement de votre loyer est programmé conformément à votre mandat de gestion ; nous vous transmettons un point détaillé de la situation par retour.\n\nNous restons à votre entière disposition.\n\nCordialement,\nL'équipe de l'agence",
        status: DraftStatus.PENDING,
      },
    },
    {
      from: "Karim Benali <karim.benali@gmail.com>",
      subject: "Pièces dossier de location",
      body: "Bonjour, comme convenu je vous envoie en pièces jointes mes 3 derniers bulletins de salaire, mon contrat de travail et ma pièce d'identité pour le dossier du studio. Cordialement.",
      category: EmailCategory.DOSSIER_PIECES,
      priority: Priority.NORMAL,
      status: EmailStatus.AUTO_SENT,
      extracted: { nom: "Karim Benali" },
      hours: 8,
      draft: {
        content:
          "Bonjour Karim Benali,\n\nNous accusons bonne réception des documents transmis pour votre dossier. Notre équipe procède à leur vérification et reviendra vers vous sous 48 à 72 heures.\n\nCordialement,\nL'équipe de l'agence",
        status: DraftStatus.APPROVED,
        sent: true,
      },
    },
    {
      from: "Assurances Pro <commercial@assur-pro.fr>",
      subject: "Votre contrat multirisque professionnel",
      body: "Profitez de notre offre exceptionnelle sur l'assurance multirisque pour les professionnels de l'immobilier. Contactez-nous pour un devis gratuit.",
      category: EmailCategory.FOURNISSEUR,
      priority: Priority.BAS,
      status: EmailStatus.CLASSIFIED,
      extracted: {},
      hours: 20,
    },
    {
      from: "Gagnez un iPhone <promo@win-now.biz>",
      subject: "🎉 Vous avez gagné !!! Cliquez vite",
      body: "Félicitations ! Vous êtes le grand gagnant de notre tirage. Cliquez ici pour réclamer votre cadeau...",
      category: EmailCategory.SPAM,
      priority: Priority.BAS,
      status: EmailStatus.CLASSIFIED,
      extracted: {},
      hours: 26,
    },
  ]

  for (const s of seeds) {
    const email = await prisma.emailMessage.create({
      data: {
        mailboxId: mailbox.id,
        providerId: `demo-${Math.random().toString(36).slice(2, 11)}`,
        threadId: `demo-thread-${Math.random().toString(36).slice(2, 9)}`,
        from: s.from,
        subject: s.subject,
        snippet: s.body.slice(0, 120),
        bodyText: s.body,
        category: s.category,
        priority: s.priority,
        confidence: 0.95,
        extractedData: s.extracted as Prisma.InputJsonValue,
        status: s.status,
        receivedAt: hoursAgo(s.hours),
        processedAt: hoursAgo(s.hours),
      },
    })
    if (s.draft) {
      await prisma.draft.create({
        data: {
          emailMessageId: email.id,
          content: s.draft.content,
          status: s.draft.status,
          sentAt: s.draft.sent ? hoursAgo(s.hours) : null,
        },
      })
    }
  }

  return NextResponse.json({ ok: true, seeded: seeds.length })
}
