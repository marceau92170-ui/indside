import { google } from "googleapis"
import type { EmailProvider, NewMessage, CreateDraftParams, SendMessageParams } from "./index"

function decodeBase64Url(data: string): string {
  const base64 = data.replace(/-/g, "+").replace(/_/g, "/")
  return Buffer.from(base64, "base64").toString("utf-8")
}

function buildRawEmail(params: {
  to: string
  subject: string
  body: string
  threadId?: string
  inReplyTo?: string
}): string {
  const lines = [
    `To: ${params.to}`,
    `Subject: ${params.subject}`,
    `Content-Type: text/plain; charset=utf-8`,
    `MIME-Version: 1.0`,
  ]
  if (params.inReplyTo) {
    lines.push(`In-Reply-To: ${params.inReplyTo}`)
    lines.push(`References: ${params.inReplyTo}`)
  }
  lines.push("", params.body)
  const raw = lines.join("\r\n")
  return Buffer.from(raw).toString("base64url")
}

export class GmailProvider implements EmailProvider {
  private gmail
  private auth

  constructor(accessToken: string, refreshToken: string) {
    this.auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    )
    this.auth.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    })
    this.gmail = google.gmail({ version: "v1", auth: this.auth })
  }

  async listNewMessages(historyId?: string): Promise<{ messages: NewMessage[]; newHistoryId: string }> {
    if (historyId) {
      try {
        const res = await this.gmail.users.history.list({
          userId: "me",
          startHistoryId: historyId,
          historyTypes: ["messageAdded"],
          labelId: "INBOX",
        })
        const history = res.data.history ?? []
        const messageIds = new Set<string>()
        for (const h of history) {
          for (const m of h.messagesAdded ?? []) {
            if (m.message?.id) messageIds.add(m.message.id)
          }
        }
        const messages: NewMessage[] = []
        for (const id of Array.from(messageIds)) {
          try {
            const msg = await this.getMessage(id)
            messages.push(msg)
          } catch {}
        }
        return {
          messages,
          newHistoryId: res.data.historyId ?? historyId,
        }
      } catch (e: unknown) {
        // If historyId is too old, fall back to listing unread
        const err = e as { code?: number }
        if (err?.code !== 404 && err?.code !== 410) throw e
      }
    }

    const res = await this.gmail.users.messages.list({
      userId: "me",
      q: "is:unread in:inbox",
      maxResults: 50,
    })
    const items = res.data.messages ?? []
    const messages: NewMessage[] = []
    for (const item of items) {
      if (!item.id) continue
      try {
        const msg = await this.getMessage(item.id)
        messages.push(msg)
      } catch {}
    }

    // Get current historyId
    const profile = await this.gmail.users.getProfile({ userId: "me" })
    return {
      messages,
      newHistoryId: profile.data.historyId ?? "",
    }
  }

  async getMessage(messageId: string): Promise<NewMessage> {
    const res = await this.gmail.users.messages.get({
      userId: "me",
      id: messageId,
      format: "full",
    })
    const msg = res.data
    const headers = msg.payload?.headers ?? []
    const getHeader = (name: string) =>
      headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? ""

    const from = getHeader("From")
    const subject = getHeader("Subject")
    const dateStr = getHeader("Date")
    const receivedAt = dateStr ? new Date(dateStr) : new Date()

    let bodyText = ""
    const payload = msg.payload

    function extractText(part: typeof payload): string {
      if (!part) return ""
      if (part.mimeType === "text/plain" && part.body?.data) {
        return decodeBase64Url(part.body.data)
      }
      if (part.parts) {
        for (const p of part.parts) {
          const text = extractText(p)
          if (text) return text
        }
      }
      return ""
    }

    bodyText = extractText(payload)
    if (!bodyText && msg.snippet) bodyText = msg.snippet

    return {
      providerId: msg.id ?? messageId,
      threadId: msg.threadId ?? "",
      from,
      subject,
      snippet: msg.snippet ?? "",
      bodyText,
      receivedAt,
    }
  }

  async createDraft(params: CreateDraftParams): Promise<string> {
    const raw = buildRawEmail(params)
    const res = await this.gmail.users.drafts.create({
      userId: "me",
      requestBody: {
        message: {
          raw,
          ...(params.threadId ? { threadId: params.threadId } : {}),
        },
      },
    })
    return res.data.id ?? ""
  }

  async sendDraft(draftId: string): Promise<void> {
    await this.gmail.users.drafts.send({
      userId: "me",
      requestBody: { id: draftId },
    })
  }

  async sendMessage(params: SendMessageParams): Promise<void> {
    const raw = buildRawEmail(params)
    await this.gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw,
        ...(params.threadId ? { threadId: params.threadId } : {}),
      },
    })
  }

  async markRead(messageId: string): Promise<void> {
    await this.gmail.users.messages.modify({
      userId: "me",
      id: messageId,
      requestBody: {
        removeLabelIds: ["UNREAD"],
      },
    })
  }
}
