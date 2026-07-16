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
  // Nymax : idem, variante avec "i" (l'affilié "nymax" porte celle avec "l").
  "tonyrmig@icloud.com",
];

export type AffiliateSeed = { code: string; name: string; email: string };

export const AFFILIATES: AffiliateSeed[] = [
  { code: "aaron", name: "Aaron", email: "nsuandaaron@gmail.com" }, // @aaroninh0o
  { code: "hemy", name: "Hemy", email: "lhymnlord@gmail.com" },
  { code: "nymax", name: "Nymax", email: "tonyrmlg@icloud.com" }, // @nymax.foot
  { code: "haile", name: "Haïlé", email: "haile.beauroy@gmail.com" },
  { code: "sammy", name: "Sammy", email: "sammy.moutaouakkel@gmail.com" },
  // Affilié de TEST (à retirer après vérif du flux) — dashboard : marceau92170+test@gmail.com
  { code: "test", name: "Test", email: "marceau92170+test@gmail.com" },
];
