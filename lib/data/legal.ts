// Informations légales de l'éditeur — affichées dans les Mentions légales, les CGV
// et le pied de page. En France, l'identification de l'éditeur est une OBLIGATION
// (LCEN art. 6-III) dès qu'un site est édité à titre professionnel ou vend un service.
//
// ⚠️ À COMPLÉTER dès réception du SIREN (immatriculation micro-entreprise) :
//    - editorName  : nom de l'éditeur (ton nom si micro-entreprise, ou raison sociale)
//    - siren       : les 9 chiffres du SIREN (débloque ~40 points chez les vérificateurs)
//    - address     : adresse déclarée de l'entreprise
// Tant que le SIREN n'est pas rempli, la page affiche « immatriculation en cours ».

export const LEGAL = {
  siteName: "Progressa",
  siteUrl: "https://www.progressafoot.fr",

  // ----- Identité de l'éditeur -----
  editorName: "", // ex: "Marceau Nom" — laissé vide tant que non immatriculé
  editorStatus: "Micro-entreprise (en cours d'immatriculation)",
  siren: "", // 9 chiffres — à remplir dès réception
  vatNote: "TVA non applicable, art. 293 B du CGI", // régime micro par défaut
  address: "", // adresse déclarée — à remplir dès immatriculation
  contactEmail: "contact@progressafoot.fr",

  // ----- Hébergeur (informations publiques) -----
  hostName: "Vercel Inc.",
  hostAddress: "340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis",
  hostUrl: "https://vercel.com",

  // ----- Paiement -----
  paymentProvider: "Stripe Payments Europe, Ltd.",

  // Tarifs (repris dans les CGV)
  priceMonthly: "8,99 € / mois",
  priceAnnual: "59 € / an",
} as const;

// L'éditeur est-il complètement identifié (SIREN publié) ?
export const isEditorRegistered = Boolean(LEGAL.siren && LEGAL.editorName);
