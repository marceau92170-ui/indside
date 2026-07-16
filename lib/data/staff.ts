// Comptes privilégiés, créés automatiquement au déploiement (voir prisma/seed.ts).
// - ADMIN : accès au dashboard admin + Premium gratuit à vie.
// - AFFILIATES : Premium gratuit à vie + leur code de parrainage + dashboard partenaire.
//
// Pour ajouter un affilié : ajoute une ligne { code, name, email } ci-dessous.
// Le code devient son lien : progressafoot.fr/r/<code>  (minuscules, sans espace).

export const ADMIN_EMAILS: string[] = ["marceau92170@gmail.com"];

// Accès Premium gratuit à vie, SANS affiliation (potes, testeurs, staff non-affilié).
// Ajoute simplement l'email ici.
export const PREMIUM_EMAILS: string[] = [
  // Hemy : 2e orthographe possible de son email (i/l ambigu) — l'affilié "hemy"
  // porte la variante avec "l" ; celle-ci couvre la variante avec "i".
  "ihymnlord@gmail.com",
];

export type AffiliateSeed = { code: string; name: string; email: string };

export const AFFILIATES: AffiliateSeed[] = [
  { code: "aaron", name: "Aaron", email: "nsuandaaron@gmail.com" }, // @aaroninh0o
  { code: "hemy", name: "Hemy", email: "lhymnlord@gmail.com" },
];
