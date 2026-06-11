import Anthropic from "@anthropic-ai/sdk"
import { EmailCategory, Priority } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { CLASSIFY_SYSTEM_PROMPT, buildClassifyPrompt } from "@/lib/prompts/classify"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

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

  const response = await anthropic.messages.create({
    model: "claude-3-5-haiku-20241022",
    max_tokens: 1024,
    system: CLASSIFY_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  })

  const tokensIn = response.usage.input_tokens
  const tokensOut = response.usage.output_tokens

  // Log usage
  await prisma.usageLog.create({
    data: {
      agencyId,
      type: "classify",
      tokensIn,
      tokensOut,
      metadata: { from, subject },
    },
  })

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
