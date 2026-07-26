// Système de paliers ("rangs") du joueur — la carte évolue avec la progression.
//
// Principe :
// - 6 paliers : Débutant → Amateur → Espoir → Semi-pro → Pro → Élite.
// - Une note grimpe de 65 à 85 dans un palier ; à 85 → promotion, la note repart
//   à 65 dans le palier au-dessus (on ne redescend jamais de palier).
// - La note se calcule sur le VRAI travail : séances validées + tests enregistrés.
// - Départ selon le niveau déclaré : un national ne démarre pas comme un débutant.
// - Gratuit = palier 1 (Débutant) uniquement ; toute promotion = Premium.

export type Tier = {
  key: string;
  name: string;
  mono: string; // monogramme de l'emblème
  index: number;
  color: string; // couleur principale du palier
  light: string; // reflet clair (métallique)
  dark: string; // ombre
  elite?: boolean; // palier ouvert (pas de promotion au-dessus)
};

export const TIERS: Tier[] = [
  { key: "debutant", name: "Débutant", mono: "DÉB", index: 0, color: "#6E7885", light: "#AEB6C0", dark: "#454C56" },
  { key: "amateur", name: "Amateur", mono: "AMA", index: 1, color: "#B98A57", light: "#E7BE93", dark: "#6E4B29" },
  { key: "espoir", name: "Espoir", mono: "ESP", index: 2, color: "#5FA6C0", light: "#B6E0EE", dark: "#2E6B82" },
  { key: "semipro", name: "Semi-pro", mono: "S-P", index: 3, color: "#E0BC63", light: "#F6E4A6", dark: "#9A7B2E" },
  { key: "pro", name: "Pro", mono: "PRO", index: 4, color: "#E12A3A", light: "#FF8A94", dark: "#8B1621" },
  { key: "elite", name: "Élite", mono: "ÉLI", index: 5, color: "#9B82E6", light: "#D7CBF7", dark: "#5B44A6", elite: true },
];

// Coût (en XP) de CHAQUE palier avant promotion. Courbe volontairement
// « rapide en bas, dure en haut » : les premiers paliers se passent en ~3 semaines,
// les derniers demandent beaucoup plus. Le dernier (Élite) est ouvert.
export const TIER_COSTS = [90, 110, 150, 210, 300, 500];

export const XP_PER_SESSION = 10; // une séance validée
export const XP_PER_TEST = 15; // un test enregistré / amélioré

const NOTE_MIN = 65;
const NOTE_MAX = 85;

// Palier de départ selon le niveau déclaré (Premium). Le gratuit reste Débutant.
export function startingTierIndex(levelType: string): number {
  switch (levelType) {
    case "NATIONAL":
      return 2; // Espoir
    case "REGIONAL":
      return 1; // Amateur
    case "DISTRICT":
      return 0; // Débutant
    default:
      return 0; // GENERIC / inconnu
  }
}

export type Rank = {
  tier: Tier;
  note: number;
  subDiv: string; // sous-division dans le palier : "III" (bas) → "II" → "I" (haut)
  progressPct: number; // 0-100 vers la promotion
  nextTier: Tier | null;
  isMaxTier: boolean;
  locked: boolean; // gratuit : promotion verrouillée (Premium requis)
  readyToPromote: boolean; // gratuit : a atteint le haut de son palier
  realStartTier: Tier; // palier que Premium débloquerait selon le niveau déclaré
  xpEarned: number;
};

// Sous-division d'après la note dans le palier (65-85). Donne des paliers
// intermédiaires (des petites victoires) sans changer le calcul de fond.
function subDivFromNote(note: number): string {
  const inTier = note - NOTE_MIN; // 0..20
  if (inTier < 7) return "III";
  if (inTier < 14) return "II";
  return "I";
}

export function computeRank(opts: {
  levelType: string;
  sessionsDone: number;
  testsCount: number;
  isPremium: boolean;
}): Rank {
  const { levelType, sessionsDone, testsCount, isPremium } = opts;
  const earned = sessionsDone * XP_PER_SESSION + testsCount * XP_PER_TEST;
  const realStart = TIERS[startingTierIndex(levelType)];

  // GRATUIT : bloqué au palier 1. La note grimpe jusqu'à 84, puis promotion verrouillée.
  if (!isPremium) {
    const cost = TIER_COSTS[0];
    const ready = earned >= cost;
    const note = ready
      ? NOTE_MAX - 1
      : NOTE_MIN + Math.floor((NOTE_MAX - NOTE_MIN) * (earned / cost));
    return {
      tier: TIERS[0],
      note,
      subDiv: subDivFromNote(note),
      progressPct: ready ? 100 : Math.round((100 * earned) / cost),
      nextTier: TIERS[1],
      isMaxTier: false,
      locked: true,
      readyToPromote: ready,
      realStartTier: realStart,
      xpEarned: earned,
    };
  }

  // PREMIUM : baseline selon le niveau + XP gagnée, on parcourt l'échelle.
  let baseline = 0;
  for (let i = 0; i < realStart.index; i++) baseline += TIER_COSTS[i];
  let remaining = baseline + earned;
  let idx = 0;
  while (idx < TIERS.length - 1 && remaining >= TIER_COSTS[idx]) {
    remaining -= TIER_COSTS[idx];
    idx++;
  }
  const cost = TIER_COSTS[idx];
  const isMax = idx === TIERS.length - 1;
  const note = isMax
    ? Math.min(99, NOTE_MIN + Math.floor((NOTE_MAX - NOTE_MIN) * (remaining / cost)))
    : NOTE_MIN + Math.min(NOTE_MAX - NOTE_MIN, Math.floor((NOTE_MAX - NOTE_MIN) * (remaining / cost)));

  return {
    tier: TIERS[idx],
    note,
    subDiv: subDivFromNote(note),
    progressPct: Math.min(100, Math.round((100 * remaining) / cost)),
    nextTier: isMax ? null : TIERS[idx + 1],
    isMaxTier: isMax,
    locked: false,
    readyToPromote: false,
    realStartTier: realStart,
    xpEarned: earned,
  };
}
