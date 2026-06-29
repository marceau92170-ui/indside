import Anthropic from "@anthropic-ai/sdk"
import { EmailCategory, Priority } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { CLASSIFY_SYSTEM_PROMPT, buildClassifyPrompt } from "@/lib/prompts/classify"
import { MODEL_CLASSIFY, estimateCostEur, isQuotaCounting } from "@/lib/ai/models"

const getAnthropic = () => new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface ClassifyResult {
  category: EmailCategory
  priority: Priority
  confidence: number
  extractedData: Record<string, unknown>
}

export async function classifyEmail(params: {
  from: string
  subject: string
  body: string
  agencyId: string
}): Promise<ClassifyResult> {
  const { from, subject, body, agencyId } = params

  const userPrompt = buildClassifyPrompt(from, subject, body)

  const response = await getAnthropic().messages.create(
    {
      model: MODEL_CLASSIFY,
      max_tokens: 1024,
      // Prompt caching : le prompt système (immo FR) est réutilisé à chaque
      // email → mis en cache pour économiser jusqu'à 90 % sur cette portion.
      // (cache_control non typé dans le SDK 0.27 → cast + header beta)
      system: [
        {
          type: "text",
          text: CLASSIFY_SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ] as unknown as string,
      messages: [{ role: "user", content: userPrompt }],
    },
    { headers: { "anthropic-beta": "prompt-caching-2024-07-31" } }
  )

  const tokensIn = response.usage.input_tokens
  const tokensOut = response.usage.output_tokens

  const content = response.content[0]
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Anthropic")
  }

  let parsed: ClassifyResult
  try {
    // Extract JSON from response (in case there's extra text)
    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error("No JSON found in response")
    parsed = JSON.parse(jsonMatch[0])
  } catch {
    throw new Error(`Failed to parse classification response: ${content.text}`)
  }

  // Validate category
  const validCategories = Object.values(EmailCategory)
  if (!validCategories.includes(parsed.category)) {
    parsed.category = EmailCategory.AUTRE
  }

  // Log usage (coût + si la catégorie incrémente le quota client)
  await prisma.usageLog.create({
    data: {
      agencyId,
      type: "classify",
      model: MODEL_CLASSIFY,
      tokensIn,
      tokensOut,
      costEur: estimateCostEur(MODEL_CLASSIFY, tokensIn, tokensOut),
      countedInQuota: isQuotaCounting(parsed.category),
      metadata: { from, subject },
    },
  })

  // Validate priority
  const validPriorities = Object.values(Priority)
  if (!validPriorities.includes(parsed.priority)) {
    parsed.priority = Priority.NORMAL
  }

  // Clamp confidence
  parsed.confidence = Math.max(0, Math.min(1, parsed.confidence ?? 0.5))

  return {
    category: parsed.category,
    priority: parsed.priority,
    confidence: parsed.confidence,
    extractedData: parsed.extractedData ?? {},
  }
}
