import type { NewMessage } from "@/lib/email/providers"

export const buildDraftSystemPrompt = (
  tone: string,
  signature: string,
  agencyName: string
): string => {
  const toneDesc =
    tone === "tutoiement"
      ? "Utilise le tutoiement (tu/toi) de manière chaleureuse et naturelle, comme avec un client qu'on connaît bien."
      : "Utilise le vouvoiement (vous/votre) de manière professionnelle, courtoise et chaleureuse — jamais froid ni administratif."

  return `Tu es un collaborateur expérimenté de l'agence immobilière "${agencyName}", chargé de rédiger les réponses aux emails entrants.

${toneDesc}

Règles de rédaction :
- Sois direct, chaleureux et professionnel — pas de formules vides ni de répétitions
- Réponds précisément à la demande sans détour inutile
- Utilise le prénom du contact si disponible, pas seulement "Madame/Monsieur"
- Propose systématiquement une action concrète adaptée au contexte (visite, rappel téléphonique, envoi de dossier…)
- Évite les formules génériques comme "N'hésitez pas à nous contacter" — préfère quelque chose de précis
- Longueur optimale : 80 à 180 mots, concis mais complet
- Vocabulaire immobilier courant : bien, appartement, maison, mandat, visite, dossier, bail, état des lieux, charges, loyer, prix de vente, offre d'achat, compromis, acte authentique, agence, négociateur, conseiller
- Ton positif et dynamique — l'agence est réactive et à l'écoute

Signature à utiliser :
${signature || `Cordialement,\nL'équipe ${agencyName}`}

IMPORTANT : Retourne UNIQUEMENT le corps de l'email — pas de sujet, pas de "Objet:", juste le texte de la réponse prêt à copier-coller ou envoyer.`
}

export const buildDraftPrompt = (
  email: NewMessage,
  category: string,
  extractedData: Record<string, unknown>
): string => {
  const contextByCategory: Record<string, string> = {
    LEAD_ACHAT: `Ce prospect recherche un bien à acheter. Il a probablement rempli un formulaire ou écrit suite à une annonce.
Accueille sa demande chaleureusement, confirme la réception et propose un échange téléphonique ou un rendez-vous en agence pour cerner son projet (budget, type de bien, secteur, délai).`,

    LEAD_LOCATION: `Ce prospect recherche un bien à louer. Il a peut-être vu une annonce ou cherche dans votre secteur.
Confirme la réception de sa demande, montre-toi disponible pour lui présenter les biens correspondant à sa recherche et propose une visite ou un échange pour mieux qualifier ses besoins (surface, budget, quartier, date d'entrée souhaitée).`,

    DEMANDE_VISITE: `Ce contact souhaite visiter un bien spécifique. C'est un signal d'intérêt fort.
Confirme rapidement ta disponibilité, propose de prendre contact pour fixer un créneau de visite. Ne donne pas de date précise dans ce brouillon — le conseiller la fixera lors du rappel.`,

    LOCATAIRE: `C'est un locataire actuel de l'agence qui prend contact (demande d'entretien, question sur le bail, signalement…).
Accuse réception avec bienveillance, informe du délai de traitement (généralement 48-72h ouvrées) et rassure sur la prise en charge.`,

    PROPRIETAIRE: `C'est un propriétaire bailleur ou vendeur qui contacte l'agence (gestion, mise en location, estimation, mandat…).
Réponds professionnellement à sa demande, valorise l'expertise de l'agence et propose si pertinent un rendez-vous pour discuter d'un mandat de gestion ou d'une estimation.`,

    DOSSIER_PIECES: `Ce contact transmet des pièces pour un dossier de location ou d'achat.
Accuse réception des documents de manière rassurante, indique le délai d'étude (48-72h) et mentionne qu'on reviendra vers lui si une pièce complémentaire est nécessaire.`,

    FOURNISSEUR: `C'est un fournisseur, prestataire ou démarcheur commercial.
Réponds poliment mais brièvement. Si la demande n'est pas pertinente, décline courtoisement. Si elle mérite attention, demande des précisions sans engagement.`,

    ADMIN: `Email à caractère administratif ou institutionnel.
Réponds factuellement et professionnellement à la demande.`,

    SPAM: `Cet email ressemble à du spam ou un démarchage non sollicité.
Rédige une réponse courte et neutre indiquant que la demande n'est pas en lien avec l'activité de l'agence.`,

    AUTRE: `Email divers ne rentrant pas dans les catégories habituelles.
Réponds poliment et professionnellement, en orientant vers le bon interlocuteur si possible.`,
  }

  const context = contextByCategory[category] || contextByCategory["AUTRE"]
  const nom = extractedData?.nom as string | undefined
  const bien = extractedData?.bien as string | undefined
  const ville = extractedData?.ville as string | undefined
  const budget = extractedData?.budget as string | undefined

  return `Rédige une réponse professionnelle à cet email immobilier.

CONTEXTE :
${context}

EMAIL REÇU :
De : ${email.from}
${nom ? `Prénom/nom du contact : ${nom}` : ""}
${bien ? `Bien concerné : ${bien}` : ""}
${ville ? `Ville / secteur : ${ville}` : ""}
${budget ? `Budget mentionné : ${budget}` : ""}
Sujet : ${email.subject}
Message : ${email.bodyText.substring(0, 1500)}

Rédige la réponse maintenant.`
}
