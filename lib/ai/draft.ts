import Anthropic from "@anthropic-ai/sdk"
import { EmailCategory } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { buildDraftSystemPrompt, buildDraftPrompt } from "@/lib/prompts/draft"
import type { NewMessage } from "@/lib/email/providers"

const getAnthropic = () => new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function generateDraft(params: {
  email: Pick<NewMessage, "from" | "subject" | "bodyText">
  category: EmailCategory
  extractedData: Record<string, unknown>
  agency: { name: string; tone: string; signature: string }
  agencyId: string
}): Promise<string> {
  const { email, category, extractedData, agency, agencyId } = params

  const systemPrompt = buildDraftSystemPrompt(agency.tone, agency.signature, agency.name)
  const userPrompt = buildDraftPrompt(
    { ...email, providerId: "", threadId: "", snippet: "", receivedAt: new Date() },
    category,
    extractedData
  )

  const response = await getAnthropic().messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  })

  const tokensIn = response.usage.input_tokens
  const tokensOut = response.usage.output_tokens

  // Log usage
  await prisma.usageLog.create({
    data: {
      agencyId,
      type: "draft",
      tokensIn,
      tokensOut,
      metadata: { category },
    },
  })

  const content = response.content[0]
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Anthropic")
  }

  return content.text
}
