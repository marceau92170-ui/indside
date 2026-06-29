/**
 * Pré-filtre déterministe — s'exécute AVANT tout appel à l'IA.
 *
 * Objectif (cf. SPEC §2) : écarter spam / newsletters / notifications
 * automatiques sans dépenser ni quota client ni token API.
 *
 * RÈGLE DE SÉCURITÉ CRITIQUE : les portails immobiliers (SeLoger, Leboncoin…)
 * envoient leurs leads depuis des adresses `noreply@`. Ils doivent donc TOUJOURS
 * passer à l'IA — la liste blanche est vérifiée en premier.
 */

export type PrefilterCategory = "NEWSLETTER" | "NOTIF" | "SPAM"

export interface PrefilterInput {
  from: string
  subject: string
  hasListUnsubscribe?: boolean
  precedenceBulk?: boolean
  autoSubmitted?: boolean
}

export interface PrefilterResult {
  category: PrefilterCategory
  reason: string
}

// Domaines des portails / sources de leads : toujours traités par l'IA,
// même s'ils utilisent noreply@. NE JAMAIS pré-filtrer ces expéditeurs.
const LEAD_SOURCE_DOMAINS = [
  "seloger.com",
  "leboncoin.fr",
  "bienici.com",
  "logic-immo.com",
  "logicimmo.com",
  "pap.fr",
  "directagence.com",
  "avendrealouer.com",
  "avendrealouer.fr",
  "figaroimmo.com",
  "ouestfrance-immo.com",
  "paruvendu.fr",
  "superimmo.com",
  "green-acres.fr",
]

// Expéditeurs de notifications automatiques (ne contiennent pas de demande client).
const NOTIF_SENDER_PATTERNS = [
  /(^|[._-])no-?reply@/i,
  /(^|[._-])donot-?reply@/i,
  /(^|[._-])ne-?pas-?repondre@/i,
  /mailer-daemon@/i,
  /postmaster@/i,
  /bounce[s]?@/i,
  /notifications?@/i,
  /(^|[._-])mailer@/i,
  /(^|[._-])noti(fication)?@/i,
]

// Indices de newsletters / outils d'emailing de masse.
const NEWSLETTER_SENDER_PATTERNS = [
  /newsletter@/i,
  /news@/i,
  /info@.*\.(mailchimp|mailchimpapp)\./i,
  /@.*\.(mailchimp|sendgrid|sendinblue|brevo|mailjet|mailerlite|hubspot|sib)\./i,
  /@(e|email|mail|news|marketing|promo)\./i,
]

const SPAM_SUBJECT_PATTERNS = [
  /gagn[ée]z?\b/i,
  /félicitations?\b.*gagn/i,
  /vous avez gagné/i,
  /loterie|tirage au sort/i,
  /viagra|cialis/i,
  /crypto.*(gains?|profit)/i,
  /\b(100%|gratuit)\b.*\b(garanti|offert)\b/i,
]

function emailDomain(from: string): string {
  const m = from.match(/<([^>]+)>/)
  const addr = (m ? m[1] : from).toLowerCase().trim()
  const at = addr.lastIndexOf("@")
  return at >= 0 ? addr.slice(at + 1) : addr
}

/**
 * Retourne une catégorie de rejet si l'email doit être écarté avant l'IA,
 * ou null si l'email doit être classé par l'IA (et potentiellement compté).
 */
export function prefilter(input: PrefilterInput): PrefilterResult | null {
  const from = input.from.toLowerCase()
  const domain = emailDomain(input.from)

  // 1) Liste blanche absolue — les portails passent toujours à l'IA.
  if (LEAD_SOURCE_DOMAINS.some((d) => domain === d || domain.endsWith("." + d) || from.includes(d))) {
    return null
  }

  // 2) En-têtes techniques (gratuit, fiable) — newsletters / envois de masse.
  if (input.hasListUnsubscribe) {
    return { category: "NEWSLETTER", reason: "header List-Unsubscribe" }
  }
  if (input.precedenceBulk) {
    return { category: "NEWSLETTER", reason: "header Precedence: bulk/list" }
  }
  if (input.autoSubmitted) {
    return { category: "NOTIF", reason: "header Auto-Submitted" }
  }

  // 3) Expéditeurs de notification automatique.
  if (NOTIF_SENDER_PATTERNS.some((r) => r.test(from))) {
    return { category: "NOTIF", reason: "expéditeur no-reply / notification" }
  }

  // 4) Newsletters identifiées par l'expéditeur.
  if (NEWSLETTER_SENDER_PATTERNS.some((r) => r.test(from))) {
    return { category: "NEWSLETTER", reason: "expéditeur newsletter / emailing" }
  }

  // 5) Spam évident au sujet.
  if (SPAM_SUBJECT_PATTERNS.some((r) => r.test(input.subject))) {
    return { category: "SPAM", reason: "sujet caractéristique de spam" }
  }

  return null
}
