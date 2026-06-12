import { EmailCategory, AutoAction } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { AUTO_REPLY_TEMPLATES } from "@/lib/automation/templates"

/**
 * Préréglage « prudent » recommandé à l'onboarding.
 *
 * Principe : human-in-the-loop par défaut. Seuls les accusés de réception
 * sans aucun risque partent automatiquement (leads + réception de pièces).
 * Tout ce qui engage l'agence (visite, locataire, propriétaire, admin...)
 * reste en BROUILLON à valider. Le spam est simplement étiqueté.
 *
 * L'agence peut ensuite modifier chaque règle depuis ses paramètres.
 */
export const DEFAULT_RULES: { category: EmailCategory; action: AutoAction }[] = [
  { category: EmailCategory.LEAD_ACHAT, action: AutoAction.AUTO_REPLY },
  { category: EmailCategory.LEAD_LOCATION, action: AutoAction.AUTO_REPLY },
  { category: EmailCategory.DOSSIER_PIECES, action: AutoAction.AUTO_REPLY },
  // Engage la disponibilité de l'agence → toujours en brouillon
  { category: EmailCategory.DEMANDE_VISITE, action: AutoAction.DRAFT_ONLY },
  { category: EmailCategory.LOCATAIRE, action: AutoAction.DRAFT_ONLY },
  { category: EmailCategory.PROPRIETAIRE, action: AutoAction.DRAFT_ONLY },
  { category: EmailCategory.FOURNISSEUR, action: AutoAction.DRAFT_ONLY },
  { category: EmailCategory.ADMIN, action: AutoAction.DRAFT_ONLY },
  { category: EmailCategory.AUTRE, action: AutoAction.DRAFT_ONLY },
  // Spam : on étiquette, on ne génère rien
  { category: EmailCategory.SPAM, action: AutoAction.LABEL_ONLY },
]

/**
 * Crée les règles d'automatisation par défaut pour une nouvelle agence.
 * Idempotent : ignore les catégories déjà présentes (contrainte unique
 * agencyId + category), donc peut être rappelée sans risque de doublon.
 */
export async function seedDefaultRules(agencyId: string): Promise<void> {
  await prisma.automationRule.createMany({
    data: DEFAULT_RULES.map((rule) => ({
      agencyId,
      category: rule.category,
      action: rule.action,
      template: AUTO_REPLY_TEMPLATES[rule.category] ?? null,
      enabled: true,
    })),
    skipDuplicates: true,
  })
}
