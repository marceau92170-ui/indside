// Constantes métier : postes, ligues, divisions, objectifs, matériel.
// Données françaises réelles — utilisées par l'onboarding et la génération.

export const POSITIONS = [
  { key: "GB", label: "Gardien", short: "GB" },
  { key: "DC", label: "Défenseur central", short: "DC" },
  { key: "LAT", label: "Latéral", short: "LAT" },
  { key: "MDF", label: "Milieu défensif", short: "MD" },
  { key: "MOF", label: "Milieu offensif", short: "MO" },
  { key: "AIL", label: "Ailier", short: "AIL" },
  { key: "ATT", label: "Attaquant", short: "ATT" },
] as const;

export type PositionKey = (typeof POSITIONS)[number]["key"];

export function positionLabel(key: string): string {
  return POSITIONS.find((p) => p.key === key)?.label ?? key;
}

// Pays de la francophonie couverts (les programmes sont identiques partout ;
// seule l'inscription s'adapte). La France garde le système FFF détaillé ;
// les autres pays utilisent un niveau générique + ville/région libre.
export const COUNTRIES = [
  { key: "FR", name: "France" },
  { key: "BE", name: "Belgique" },
  { key: "CH", name: "Suisse" },
  { key: "LU", name: "Luxembourg" },
  { key: "MA", name: "Maroc" },
  { key: "DZ", name: "Algérie" },
  { key: "TN", name: "Tunisie" },
  { key: "SN", name: "Sénégal" },
  { key: "CI", name: "Côte d'Ivoire" },
  { key: "CM", name: "Cameroun" },
  { key: "CA", name: "Canada (Québec)" },
  { key: "OTHER", name: "Autre pays francophone" },
] as const;

export function countryName(key: string): string {
  return COUNTRIES.find((c) => c.key === key)?.name ?? key;
}

// Niveaux génériques (hors France) — les systèmes de division diffèrent d'un
// pays à l'autre, on reste simple et universel.
export const GENERIC_LEVELS = [
  { key: "LOISIR", label: "Loisir / débutant" },
  { key: "LOCAL", label: "Local / départemental" },
  { key: "REGIONAL", label: "Régional" },
  { key: "ELITE", label: "National / élite" },
] as const;

// Les 13 ligues régionales métropolitaines de la FFF
export const LEAGUES = [
  { key: "ara", name: "Auvergne-Rhône-Alpes" },
  { key: "bfc", name: "Bourgogne-Franche-Comté" },
  { key: "bre", name: "Bretagne" },
  { key: "cvl", name: "Centre-Val de Loire" },
  { key: "cor", name: "Corse" },
  { key: "ges", name: "Grand Est" },
  { key: "hdf", name: "Hauts-de-France" },
  { key: "idf", name: "Île-de-France" },
  { key: "nor", name: "Normandie" },
  { key: "naq", name: "Nouvelle-Aquitaine" },
  { key: "occ", name: "Occitanie" },
  { key: "pdl", name: "Pays de la Loire" },
  { key: "med", name: "Méditerranée" },
] as const;

export function leagueName(key: string): string {
  return LEAGUES.find((l) => l.key === key)?.name ?? key;
}

export const LEVEL_TYPES = [
  {
    key: "DISTRICT",
    label: "District",
    divisions: ["D1", "D2", "D3", "D4", "D5"],
    hint: "Le championnat de ton district (départemental)",
  },
  {
    key: "REGIONAL",
    label: "Régional (Ligue)",
    divisions: ["R1", "R2", "R3"],
    hint: "Le championnat de ta ligue régionale",
  },
  {
    key: "NATIONAL",
    label: "National",
    divisions: ["U17 National", "U19 National"],
    hint: "Championnats nationaux (jeunes ou seniors)",
  },
] as const;

// Divisions nationales SENIORS (adultes) — remplacent les championnats de jeunes
// quand le joueur a coché « 18 ans et + ». Élargit l'app au foot adulte.
export const SENIOR_NATIONAL_DIVISIONS = [
  "National 1",
  "National 2",
  "National 3",
  "Ligue 2",
  "Ligue 1",
] as const;

// Divisions proposées selon le niveau choisi et l'âge. Seul le National change
// entre jeunes (U17/U19) et adultes (N1-N3, Ligue) ; District et Régional sont
// identiques pour les deux.
export function divisionsFor(levelType: string, adult: boolean): readonly string[] {
  if (levelType === "NATIONAL" && adult) return SENIOR_NATIONAL_DIVISIONS;
  return LEVEL_TYPES.find((l) => l.key === levelType)?.divisions ?? [];
}

export const GOALS = [
  { key: "vitesse", label: "Vitesse & explosivité", emoji: "⚡" },
  { key: "technique", label: "Technique & dribble", emoji: "🎯" },
  { key: "physique", label: "Physique & duels", emoji: "🛡️" },
  { key: "endurance", label: "Endurance", emoji: "🫁" },
  { key: "frappe", label: "Frappe", emoji: "🚀" },
  { key: "polyvalent", label: "Polyvalent", emoji: "🔁" },
] as const;

export function goalLabel(key: string): string {
  return GOALS.find((g) => g.key === key)?.label ?? key;
}

export const EQUIPMENT = [
  { key: "ballon", label: "Un ballon" },
  { key: "plots", label: "Des plots (ou repères)" },
  { key: "mur", label: "Un mur" },
  { key: "city", label: "Accès à un city-stade" },
  { key: "elastiques", label: "Des élastiques" },
] as const;

export const DAYS_FR = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
] as const;

export const TEST_TYPES = [
  {
    key: "jonglage",
    label: "Jonglage max",
    unit: "touches",
    emoji: "⚽",
    protocol:
      "Ballon au sol, tu le lèves au pied et tu enchaînes un maximum de touches sans qu'il touche le sol. 3 essais, garde le meilleur.",
  },
  {
    key: "navette",
    label: "Navette 5×10 m",
    unit: "s",
    emoji: "⏱️",
    protocol:
      "Deux repères espacés de 10 m. Chronomètre 5 allers simples (50 m au total) avec toucher de ligne à chaque passage. 2 essais, garde le meilleur temps (précision au dixième).",
    lowerIsBetter: true,
  },
  {
    key: "planche",
    label: "Planche max",
    unit: "s",
    emoji: "🧱",
    protocol:
      "Position planche sur les avant-bras, corps aligné. Chronomètre le temps total tenu sans casser l'alignement. 1 seul essai.",
  },
  {
    key: "detente",
    label: "Détente verticale",
    unit: "cm",
    emoji: "🦘",
    protocol:
      "Face à un mur, bras tendu : marque la hauteur touchée à l'arrêt, puis saute et marque la hauteur max touchée. La différence en cm = ta détente. 3 essais, garde le meilleur.",
  },
] as const;

export function testLabel(key: string) {
  return TEST_TYPES.find((t) => t.key === key);
}

export const BADGES = [
  { key: "first_session", label: "Première séance", emoji: "✅", desc: "Ta toute première séance validée." },
  { key: "serie_3", label: "Série de 3", emoji: "🔥", desc: "3 séances validées d'affilée, sans en sauter." },
  { key: "serie_7", label: "Série de 7", emoji: "⚡", desc: "7 séances validées d'affilée. Régularité de pro." },
  { key: "sessions_10", label: "10 séances", emoji: "💪", desc: "10 séances au compteur." },
  { key: "sessions_25", label: "25 séances", emoji: "🏆", desc: "25 séances. Le club te dit merci." },
  { key: "first_test", label: "Premier test", emoji: "📊", desc: "Premier test d'évaluation enregistré." },
  { key: "test_progress", label: "Progression mesurée", emoji: "📈", desc: "Un test amélioré par rapport à la fois précédente." },
] as const;

export function badgeInfo(key: string) {
  return BADGES.find((b) => b.key === key);
}
