import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { decrypt } from "@/lib/crypto"
import { GmailProvider } from "@/lib/email/providers/gmail"
import { classifyEmail } from "@/lib/ai/classify"
import { generateDraft } from "@/lib/ai/draft"
import { CONFIDENCE_THRESHOLD } from "@/lib/constants"
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

          await classifyAndProcess({
            emailMessage,
            message: msg,
            mailbox,
            agency: mailbox.agency,
            provider,
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

  // Generate draft content
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
    agencyId: mailbox.agencyId,
  })

  if (
    rule.action === AutoAction.AUTO_REPLY &&
    classification.confidence >= CONFIDENCE_THRESHOLD
  ) {
    const toEmail = extractEmail(message.from)
    await provider.sendMessage({
      to: toEmail,
      subject: `Re: ${message.subject}`,
      body: draftContent,
      threadId: message.threadId,
    })

    await prisma.emailMessage.update({
      where: { id: emailMessage.id },
      data: { status: EmailStatus.AUTO_SENT },
    })

    await prisma.draft.create({
      data: {
        emailMessageId: emailMessage.id,
        content: draftContent,
        status: DraftStatus.APPROVED,
        sentAt: new Date(),
      },
    })
  } else {
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
  }

  await provider.markRead(message.providerId)
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
