export interface NewMessage {
  providerId: string
  threadId: string
  from: string
  subject: string
  snippet: string
  bodyText: string
  receivedAt: Date
}

export interface CreateDraftParams {
  to: string
  subject: string
  body: string
  threadId?: string
  inReplyTo?: string
}

export interface SendMessageParams {
  to: string
  subject: string
  body: string
  threadId?: string
  inReplyTo?: string
}

export interface EmailProvider {
  listNewMessages(historyId?: string): Promise<{ messages: NewMessage[]; newHistoryId: string }>
  getMessage(messageId: string): Promise<NewMessage>
  createDraft(params: CreateDraftParams): Promise<string>
  sendDraft(draftId: string): Promise<void>
  sendMessage(params: SendMessageParams): Promise<void>
  markRead(messageId: string): Promise<void>
}
