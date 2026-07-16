// Comptes privilégiés, créés automatiquement au déploiement (voir prisma/seed.ts).
// - ADMIN : accès au dashboard admin + Premium gratuit à vie.
// - AFFILIATES : Premium gratuit à vie + leur code de parrainage + dashboard partenaire.
//
// Pour ajouter un affilié : ajoute une ligne { code, name, email } ci-dessous.
// Le code devient son lien : progressafoot.fr/r/<code>  (minuscules, sans espace).

export const ADMIN_EMAILS: string[] = ["marceau92170@gmail.com"];

export type AffiliateSeed = { code: string; name: string; email: string };

export const AFFILIATES: AffiliateSeed[] = [
  // Rempli dès que le créateur envoie la liste (Prénom — email — code).
  // Exemple : { code: "kevin", name: "Kevin", email: "kevin@gmail.com" },
];
