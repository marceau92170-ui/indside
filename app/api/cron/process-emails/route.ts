import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { decrypt } from "@/lib/crypto"
import { GmailProvider } from "@/lib/email/providers/gmail"
import { classifyEmail } from "@/lib/ai/classify"
import { generateDraft } from "@/lib/ai/draft"
import { buildAutoReply } from "@/lib/automation/templates"
import { CONFIDENCE_THRESHOLD, AUTO_REPLY_CATEGORIES } from "@/lib/constants"
import { EmailStatus, DraftStatus, AutoAction, type Mailbox, type Agency } from "@prisma/client"
import type { NewMessage } from "@/lib/email/providers"

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const mailboxes = await prisma.mailbox.findMany({
    where: { status: "ACTIVE" },
    include: { agency: true },
  })

  const results = {
    processed: 0,
    errors: 0,
    mailboxes: mailboxes.length,
  }

  for (const mailbox of mailboxes as (Mailbox & { agency: Agency })[]) {
    try {
      const accessToken = decrypt(mailbox.accessTokenEnc)
      const refreshToken = decrypt(mailbox.refreshTokenEnc)
      const provider = new GmailProvider(accessToken, refreshToken)

      const { messages, newHistoryId } = await provider.listNewMessages(
        mailbox.historyId ?? undefined
      )

      for (const msg of messages) {
        try {
          // Upsert email message
          const emailMessage = await prisma.emailMessage.upsert({
            where: {
              mailboxId_providerId: {
                mailboxId: mailbox.id,
                providerId: msg.providerId,
              },
            },
            update: {},
            create: {
              mailboxId: mailbox.id,
              providerId: msg.providerId,
              threadId: msg.threadId,
              from: msg.from,
              subject: msg.subject,
              snippet: msg.snippet,
              bodyText: msg.bodyText,
              receivedAt: msg.receivedAt,
              status: EmailStatus.NEW,
            },
          })

          // Only process NEW emails
          if (emailMessage.status !== EmailStatus.NEW) continue

          // Quota guard — stop if monthly limit reached
          const freshAgency = await prisma.agency.findUnique({
            where: { id: mailbox.agencyId },
            select: { emailQuotaUsed: true, emailQuotaMax: true },
          })
          if (freshAgency && freshAgency.emailQuotaUsed >= freshAgency.emailQuotaMax) {
            console.warn(`Quota atteint pour agence ${mailbox.agencyId}`)
            break
          }

          await classifyAndProcess({
            emailMessage,
            message: msg,
            mailbox,
            agency: mailbox.agency,
            provider,
          })

          // Increment monthly quota
          await prisma.agency.update({
            where: { id: mailbox.agencyId },
            data: { emailQuotaUsed: { increment: 1 } },
          })

          results.processed++
        } catch (e) {
          console.error(`Error processing message ${msg.providerId}:`, e)
          results.errors++
        }
      }

      // Update historyId
      await prisma.mailbox.update({
        where: { id: mailbox.id },
        data: {
          historyId: newHistoryId,
          lastSyncAt: new Date(),
        },
      })
    } catch (e) {
      console.error(`Error processing mailbox ${mailbox.id}:`, e)
      await prisma.mailbox.update({
        where: { id: mailbox.id },
        data: { status: "ERROR" },
      })
      results.errors++
    }
  }

  return NextResponse.json(results)
}

async function classifyAndProcess({
  emailMessage,
  message,
  mailbox,
  agency,
  provider,
}: {
  emailMessage: { id: string; status: string }
  message: NewMessage
  mailbox: Mailbox
  agency: Agency
  provider: GmailProvider
}) {
  // Classify
  const classification = await classifyEmail({
    from: message.from,
    subject: message.subject,
    body: message.bodyText,
    agencyId: mailbox.agencyId,
  })

  // Update email with classification
  await prisma.emailMessage.update({
    where: { id: emailMessage.id },
    data: {
      category: classification.category,
      priority: classification.priority,
      confidence: classification.confidence,
      extractedData: classification.extractedData as Parameters<typeof prisma.emailMessage.update>[0]["data"]["extractedData"],
      status: EmailStatus.CLASSIFIED,
      processedAt: new Date(),
    },
  })

  // Find automation rule
  const rule = await prisma.automationRule.findUnique({
    where: {
      agencyId_category: {
        agencyId: mailbox.agencyId,
        category: classification.category,
      },
    },
  })

  if (!rule?.enabled) {
    await createDraftOnly({ emailMessage, message, classification, agency, provider })
    return
  }

  if (rule.action === AutoAction.LABEL_ONLY) {
    await provider.markRead(message.providerId)
    return
  }

  // ----- AUTO-RÉPONSE : template sûr uniquement (pas d'IA générative) -----
  // RÈGLE D'OR : ne part en automatique que si la catégorie est en liste
  // blanche ET la confiance est élevée. Le contenu vient d'un template figé,
  // jamais d'un texte libre généré qui pourrait engager l'agence.
  const isWhitelisted = (AUTO_REPLY_CATEGORIES as readonly string[]).includes(
    classification.category
  )

  if (
    rule.action === AutoAction.AUTO_REPLY &&
    isWhitelisted &&
    classification.confidence >= CONFIDENCE_THRESHOLD
  ) {
    const replyBody = buildAutoReply(rule.template, classification.category, {
      nom: classification.extractedData.nom as string | undefined,
      signature: agency.signature,
      agencyName: agency.name,
    })

    // Filet de sécurité : si aucun template sûr, on bascule en brouillon
    if (replyBody) {
      const toEmail = extractEmail(message.from)
      await provider.sendMessage({
        to: toEmail,
        subject: `Re: ${message.subject}`,
        body: replyBody,
        threadId: message.threadId,
      })

      await prisma.emailMessage.update({
        where: { id: emailMessage.id },
        data: { status: EmailStatus.AUTO_SENT },
      })

      await prisma.draft.create({
        data: {
          emailMessageId: emailMessage.id,
          content: replyBody,
          status: DraftStatus.APPROVED,
          sentAt: new Date(),
        },
      })

      await provider.markRead(message.providerId)
      return
    }
  }

  // ----- BROUILLON À VALIDER : IA générative, relu par un humain -----
  await createDraftOnly({ emailMessage, message, classification, agency, provider })
}

async function createDraftOnly({
  emailMessage,
  message,
  classification,
  agency,
  provider,
}: {
  emailMessage: { id: string }
  message: NewMessage
  classification: {
    category: Parameters<typeof generateDraft>[0]["category"]
    extractedData: Record<string, unknown>
    confidence: number
  }
  agency: Agency
  provider: GmailProvider
}) {
  const draftContent = await generateDraft({
    email: {
      from: message.from,
      subject: message.subject,
      bodyText: message.bodyText,
    },
    category: classification.category,
    extractedData: classification.extractedData,
    agency: {
      name: agency.name,
      tone: agency.tone,
      signature: agency.signature,
    },
    agencyId: agency.id,
  })

  const toEmail = extractEmail(message.from)
  const gmailDraftId = await provider.createDraft({
    to: toEmail,
    subject: `Re: ${message.subject}`,
    body: draftContent,
    threadId: message.threadId,
  })

  await prisma.emailMessage.update({
    where: { id: emailMessage.id },
    data: { status: EmailStatus.DRAFT_READY },
  })

  await prisma.draft.create({
    data: {
      emailMessageId: emailMessage.id,
      content: draftContent,
      status: DraftStatus.PENDING,
      providerDraftId: gmailDraftId,
    },
  })

  await provider.markRead(message.providerId)
}

function extractEmail(from: string): string {
  const match = from.match(/<([^>]+)>/)
  return match ? match[1] : from
}
