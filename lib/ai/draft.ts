import Anthropic from "@anthropic-ai/sdk"
import { EmailCategory } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { buildDraftSystemPrompt, buildDraftPrompt } from "@/lib/prompts/draft"
import type { NewMessage } from "@/lib/email/providers"
import { MODEL_DRAFT, estimateCostEur } from "@/lib/ai/models"

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

  const response = await getAnthropic().messages.create(
    {
      model: MODEL_DRAFT,
      max_tokens: 1024,
      // Prompt caching sur le prompt système (ton + signature de l'agence).
      // (cache_control non typé dans le SDK 0.27 → cast + header beta)
      system: [
        {
          type: "text",
          text: systemPrompt,
          cache_control: { type: "ephemeral" },
        },
      ] as unknown as string,
      messages: [{ role: "user", content: userPrompt }],
    },
    { headers: { "anthropic-beta": "prompt-caching-2024-07-31" } }
  )

  const tokensIn = response.usage.input_tokens
  const tokensOut = response.usage.output_tokens

  // Log usage (le brouillon fait partie d'un email déjà compté → countedInQuota=false)
  await prisma.usageLog.create({
    data: {
      agencyId,
      type: "draft",
      model: MODEL_DRAFT,
      tokensIn,
      tokensOut,
      costEur: estimateCostEur(MODEL_DRAFT, tokensIn, tokensOut),
      countedInQuota: false,
      metadata: { category },
    },
  })

  const content = response.content[0]
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Anthropic")
  }

  return content.text
}
