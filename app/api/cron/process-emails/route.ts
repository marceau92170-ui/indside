import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { decrypt, encrypt } from "@/lib/crypto"
import { GmailProvider } from "@/lib/email/providers/gmail"
import { classifyEmail } from "@/lib/ai/classify"
import { generateDraft } from "@/lib/ai/draft"
import { buildAutoReply } from "@/lib/automation/templates"
import { CONFIDENCE_THRESHOLD, AUTO_REPLY_CATEGORIES } from "@/lib/constants"
import { EmailStatus, DraftStatus, AutoAction, EmailCategory, Priority, type Mailbox, type Agency } from "@prisma/client"
import type { NewMessage } from "@/lib/email/providers"
import { notifyNewDrafts } from "@/lib/email/notify"
import { prefilter } from "@/lib/email/prefilter"
import { isQuotaCounting } from "@/lib/ai/models"

// Garde-fou anti-emballement (cf. SPEC §6.4) : au-delà de ce nombre d'emails
// traités sur une boîte en 24 h, on suspend l'auto-traitement et on alerte.
const RUNAWAY_LIMIT_24H = 1000

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

  const draftsByAgency: Record<string, number> = {}

  for (const mailbox of mailboxes as (Mailbox & { agency: Agency })[]) {
    try {
      // Expire trial if past trialEndsAt
      if (mailbox.agency.trialEndsAt && mailbox.agency.trialEndsAt < new Date()) {
        await prisma.agency.update({
          where: { id: mailbox.agencyId },
          data: { emailQuotaMax: 0 },
        })
        continue
      }

      const accessToken = decrypt(mailbox.accessTokenEnc)
      const refreshToken = decrypt(mailbox.refreshTokenEnc)

      const provider = new GmailProvider(accessToken, refreshToken, async (newToken) => {
        console.log(`Token refreshed for mailbox ${mailbox.id} — saving to DB`)
        await prisma.mailbox.update({
          where: { id: mailbox.id },
          data: { accessTokenEnc: encrypt(newToken) },
        })
      })

      // Garde-fou anti-emballement : si la boîte a déjà traité un volume
      // anormal en 24 h (boucle, import massif…), on suspend pour protéger
      // l'expérience client et les coûts API.
      const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const recentCount = await prisma.emailMessage.count({
        where: {
          mailboxId: mailbox.id,
          processedAt: { gte: since24h },
          status: { not: EmailStatus.NEW },
        },
      })
      if (recentCount >= RUNAWAY_LIMIT_24H) {
        console.error(
          `ALERTE anti-emballement : boîte ${mailbox.id} (${mailbox.email}) a traité ${recentCount} emails en 24h — auto-traitement suspendu.`
        )
        await prisma.mailbox.update({
          where: { id: mailbox.id },
          data: { status: "ERROR", lastSyncAt: new Date() },
        })
        continue
      }

      const { messages, newHistoryId } = await provider.listNewMessages(
        mailbox.historyId ?? undefined
      )

      for (const msg of messages) {
        try {
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

          if (emailMessage.status !== EmailStatus.NEW) continue

          // ===== PRÉ-FILTRE DÉTERMINISTE (avant toute IA) =====
          // Spam / newsletters / notifications : étiquetés, jamais facturés,
          // aucun appel API. (cf. SPEC §2)
          const pre = prefilter({
            from: msg.from,
            subject: msg.subject,
            hasListUnsubscribe: msg.hasListUnsubscribe,
            precedenceBulk: msg.precedenceBulk,
            autoSubmitted: msg.autoSubmitted,
          })
          if (pre) {
            await prisma.emailMessage.update({
              where: { id: emailMessage.id },
              data: {
                category: EmailCategory.SPAM,
                priority: Priority.BAS,
                confidence: 1,
                status: EmailStatus.CLASSIFIED,
                processedAt: new Date(),
              },
            })
            await provider.markRead(msg.providerId).catch(() => {})
            continue // pas d'IA, pas de quota
          }

          const freshAgency = await prisma.agency.findUnique({
            where: { id: mailbox.agencyId },
            select: { emailQuotaUsed: true, emailQuotaMax: true },
          })
          if (freshAgency && freshAgency.emailQuotaUsed >= freshAgency.emailQuotaMax) {
            console.warn(`Quota atteint pour agence ${mailbox.agencyId}`)
            break
          }

          const { category, drafted } = await classifyAndProcess({
            emailMessage,
            message: msg,
            mailbox,
            agency: mailbox.agency,
            provider,
          })

          if (drafted) {
            draftsByAgency[mailbox.agencyId] = (draftsByAgency[mailbox.agencyId] ?? 0) + 1
          }

          // Incrémente le quota UNIQUEMENT pour un email "utile"
          // (catégorie métier pertinente). SPAM / AUTRE ne comptent pas. (SPEC §1)
          if (isQuotaCounting(category)) {
            await prisma.agency.update({
              where: { id: mailbox.agencyId },
              data: { emailQuotaUsed: { increment: 1 } },
            })
          }

          results.processed++
        } catch (e) {
          console.error(`Error processing message ${msg.providerId}:`, e)
          results.errors++
        }
      }

      await prisma.mailbox.update({
        where: { id: mailbox.id },
        data: {
          historyId: newHistoryId,
          lastSyncAt: new Date(),
        },
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error(`Error processing mailbox ${mailbox.id}: ${msg}`)
      const isAuthError = msg.includes("invalid_grant") || msg.includes("401") || msg.includes("Token has been expired")
      await prisma.mailbox.update({
        where: { id: mailbox.id },
        data: {
          status: isAuthError ? "ERROR" : mailbox.status,
          lastSyncAt: new Date(),
        },
      })
      results.errors++
    }
  }

  // Send one notification email per agency that got new drafts
  for (const [agencyId, count] of Object.entries(draftsByAgency)) {
    const users = await prisma.user.findMany({
      where: { agencyId },
      select: { email: true },
    })
    for (const user of users) {
      await notifyNewDrafts(user.email, count)
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
}): Promise<{ category: string; drafted: boolean }> {
  const classification = await classifyEmail({
    from: message.from,
    subject: message.subject,
    body: message.bodyText,
    agencyId: mailbox.agencyId,
  })

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
    return { category: classification.category, drafted: true }
  }

  if (rule.action === AutoAction.LABEL_ONLY) {
    await provider.markRead(message.providerId)
    return { category: classification.category, drafted: false }
  }

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
      return { category: classification.category, drafted: false }
    }
  }

  await createDraftOnly({ emailMessage, message, classification, agency, provider })
  return { category: classification.category, drafted: true }
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
