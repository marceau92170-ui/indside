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
  // Samy (water44) : testeur — partenariat à caler par téléphone. Accès gratuit
  // en attendant ; on lui créera un lien d'affilié si le partenariat se confirme.
  "samy.water44@gmail.com",
];

// house = lien "maison" du créateur (ex: bio TikTok). On suit clics/inscriptions/ventes
// pour mesurer l'efficacité du canal, mais SANS commission ni bonus (l'argent revient
// au créateur, ce ne serait pas une dépense).
//
// startDate = date de la 1ère vidéo de l'affilié (format "AAAA-MM-JJ"). Elle démarre son
// mois de lancement : pendant 30 jours, l'ANNUEL est payé à 80% (comme le mensuel) ;
// après, l'annuel passe à 40%. Si absent → on prend la date d'ajout de l'affilié.
export type AffiliateSeed = {
  code: string;
  name: string;
  email: string;
  house?: boolean;
  startDate?: string;
};

export const AFFILIATES: AffiliateSeed[] = [
  // Lien "maison" du créateur (bio TikTok @... 10K) — suivi sans commission.
  { code: "officiel", name: "TikTok officiel", email: "marceau92170@gmail.com", house: true },
  { code: "aaron", name: "Aaron", email: "nsuandaaron@gmail.com" }, // @aaroninh0o
  { code: "hemy", name: "Hemy", email: "lhymnlord@gmail.com" },
  { code: "nymax", name: "Nymax", email: "tonyrmlg@icloud.com" }, // @nymax.foot
  { code: "haile", name: "Haïlé", email: "haile.beauroy@gmail.com" },
  { code: "sammy", name: "Sammy", email: "sammy.moutaouakkel@gmail.com" },
  { code: "theo", name: "Théo", email: "theofootoff@gmail.com" },
  { code: "remi", name: "Rémi", email: "remi.tesor@outlook.fr" },
  { code: "asko", name: "Asko", email: "aouahrani@icloud.com" },
  { code: "gamby", name: "SportxGamby", email: "mazine.namane1@gmail.com" },
  { code: "enzo", name: "Enzo", email: "enzobonichot807@gmail.com" },
  // Samy (water44) : créateur payé au FIXE (150 €/mois) → 0 commission, 0 bonus.
  // "house" = on suit clics/inscrits/ventes/CA de son lien, sans rien lui devoir par vente.
  // Il garde son Premium gratuit (déjà dans PREMIUM_EMAILS) pour filmer l'app.
  { code: "sam", name: "Samy (water44)", email: "samy.water44@gmail.com", house: true },
  // Affilié de TEST (à retirer après vérif du flux) — dashboard : marceau92170+test@gmail.com
  { code: "test", name: "Test", email: "marceau92170+test@gmail.com" },
];
