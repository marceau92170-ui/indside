import type { NewMessage } from "@/lib/email/providers"

export const buildDraftSystemPrompt = (
  tone: string,
  signature: string,
  agencyName: string
): string => {
  const toneDesc =
    tone === "tutoiement"
      ? "Utilise le tutoiement (tu/toi) de manière chaleureuse mais professionnelle."
      : "Utilise le vouvoiement (vous/votre) de manière professionnelle et courtoise."

  return `Tu es un assistant spécialisé dans la rédaction de réponses d'emails pour l'agence immobilière "${agencyName}".

${toneDesc}

Règles de rédaction:
- Sois professionnel, concis et chaleureux
- Réponds directement à la demande sans fioritures inutiles
- Utilise le prénom du contact si disponible
- Propose toujours une action concrète (visite, rappel, envoi de documents)
- Évite les formules trop génériques
- Longueur optimale: 100-200 mots
- Termine par la signature de l'agence

Signature à utiliser:
${signature || `Cordialement,\nL'équipe ${agencyName}`}

IMPORTANT: Retourne UNIQUEMENT le corps de l'email, sans sujet, sans "Objet:", juste le texte de la réponse prêt à envoyer.`
}

export const buildDraftPrompt = (
  email: NewMessage,
  category: string,
  extractedData: Record<string, unknown>
): string => {
  const templatesByCategory: Record<string, string> = {
    LEAD_ACHAT: `Contexte: Un prospect souhaite acheter un bien immobilier.
Réponds chaleureusement, confirme que tu as bien reçu sa demande, et propose un rendez-vous téléphonique ou en agence pour mieux cerner son projet.`,

    LEAD_LOCATION: `Contexte: Un prospect souhaite louer un bien immobilier.
Réponds chaleureusement, confirme que tu as bien reçu sa demande, liste brièvement vos biens disponibles correspondant à sa recherche si possible, et propose une visite.`,

    DEMANDE_VISITE: `Contexte: Le prospect demande à visiter un bien spécifique.
Propose 2-3 créneaux de visite pour la semaine. Si un bien est mentionné, confirme sa disponibilité.`,

    LOCATAIRE: `Contexte: Email d'un locataire actuel.
Accuse réception, informe du délai de traitement et rassure sur la prise en charge de sa demande.`,

    PROPRIETAIRE: `Contexte: Email d'un propriétaire bailleur.
Réponds professionnellement à sa demande de gestion ou d'information. Propose si pertinent un rendez-vous pour discuter d'un mandat de gestion.`,

    DOSSIER_PIECES: `Contexte: Envoi de pièces pour un dossier.
Accuse réception des documents, indique le délai d'étude du dossier (généralement 48-72h) et les éventuelles pièces manquantes.`,

    FOURNISSEUR: `Contexte: Email d'un fournisseur ou prestataire.
Réponds poliment mais brièvement, sans engagement. Si pertinent, demande plus d'informations.`,

    ADMIN: `Contexte: Email administratif.
Réponds de façon professionnelle et factuelle à la demande administrative.`,

    AUTRE: `Contexte: Email divers.
Réponds poliment et professionnellement à cet email.`,
  }

  const template = templatesByCategory[category] || templatesByCategory["AUTRE"]
  const nom = extractedData?.nom as string | undefined
  const bien = extractedData?.bien as string | undefined
  const ville = extractedData?.ville as string | undefined

  return `Rédige une réponse professionnelle à cet email.

${template}

EMAIL ORIGINAL:
De: ${email.from}
${nom ? `Nom du contact: ${nom}` : ""}
${bien ? `Bien concerné: ${bien}` : ""}
${ville ? `Ville: ${ville}` : ""}
Sujet: ${email.subject}
Message: ${email.bodyText.substring(0, 1500)}

Rédige la réponse maintenant.`
}
