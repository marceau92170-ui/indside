import { EmailCategory } from "@prisma/client"

/**
 * Templates d'accusé de réception pour les AUTO-RÉPONSES.
 *
 * RÈGLE D'OR : ces textes partent automatiquement, sans relecture humaine.
 * Ils ne doivent JAMAIS engager l'agence (pas de prix, pas de disponibilité
 * d'un bien, pas de créneau de visite, pas de négociation). Uniquement des
 * accusés de réception rassurants qui annoncent un recontact humain.
 *
 * Placeholders supportés :
 *   {{salutation}} → "Bonjour Jean," ou "Bonjour," si le nom est inconnu
 *   {{signature}}  → signature de l'agence (ou valeur par défaut)
 */
export const AUTO_REPLY_TEMPLATES: Partial<Record<EmailCategory, string>> = {
  LEAD_ACHAT: `{{salutation}}

Nous vous remercions pour votre demande et l'intérêt que vous portez à notre agence concernant votre projet d'achat.

Un conseiller prend connaissance de votre demande et vous recontactera dans les meilleurs délais afin d'échanger sur votre projet.

Nous restons à votre entière disposition.

{{signature}}`,

  LEAD_LOCATION: `{{salutation}}

Nous vous remercions pour votre demande de location.

Un conseiller étudie votre recherche et vous recontactera très prochainement pour vous accompagner dans vos démarches.

Nous restons à votre disposition pour toute question.

{{signature}}`,

  DOSSIER_PIECES: `{{salutation}}

Nous accusons bonne réception des documents que vous nous avez transmis pour votre dossier.

Notre équipe procède à leur vérification et reviendra vers vous sous 48 à 72 heures, notamment si une pièce complémentaire s'avérait nécessaire.

Nous vous remercions de votre confiance.

{{signature}}`,
}

/**
 * Construit le corps d'une auto-réponse à partir d'un template (celui de la
 * règle d'agence si fourni, sinon le template par défaut de la catégorie).
 * Retourne null si aucun template sûr n'est disponible pour cette catégorie
 * (dans ce cas, l'appelant doit retomber sur un brouillon à valider).
 */
export function buildAutoReply(
  ruleTemplate: string | null | undefined,
  category: EmailCategory,
  vars: { nom?: string | null; signature?: string | null; agencyName?: string | null }
): string | null {
  const template = ruleTemplate?.trim() || AUTO_REPLY_TEMPLATES[category]
  if (!template) return null

  const nom = vars.nom?.trim()
  const salutation = nom ? `Bonjour ${nom},` : "Bonjour,"
  const signature =
    vars.signature?.trim() ||
    `Cordialement,\nL'équipe ${vars.agencyName?.trim() || "de l'agence"}`

  return template
    .replaceAll("{{salutation}}", salutation)
    .replaceAll("{{signature}}", signature)
    .replaceAll("{{nom}}", nom || "")
    .trim()
}
