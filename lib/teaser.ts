// Aperçu VERROUILLÉ du programme complet pour les joueurs gratuits.
// But : montrer que le programme est calé sur LEUR poste et LEUR objectif,
// pour créer l'envie — sans appel IA (coût zéro), juste des titres personnalisés.

import { DAYS_FR, positionLabel } from "@/lib/constants";

type TeaserProfile = {
  position: string;
  goal: string;
  matchDay: number | null;
};

export type LockedTeaser = {
  day: string; // "Mardi"
  title: string;
  focus: string; // sous-titre court
  duration: number; // minutes
};

// Axe de travail principal par poste (ce qui parle au joueur).
const POSITION_FOCUS: Record<string, { title: string; focus: string }> = {
  GB: { title: "Réflexes & jeu au pied", focus: "explosivité, plongeons, relances" },
  DC: { title: "Duels & relances propres", focus: "puissance, jeu de tête, première passe" },
  LAT: { title: "Vitesse de couloir & centres", focus: "répétition d'efforts, débordement" },
  MDF: { title: "Volume & récupération de balle", focus: "endurance, gainage, orientation" },
  MOF: { title: "Vista & dernier geste", focus: "conduite, frappe, changements de rythme" },
  AIL: { title: "Débordement & finition", focus: "vitesse pure, dribble, centres" },
  ATT: { title: "Finition & appels", focus: "explosivité, frappe, jeu dos au but" },
};

const GOAL_LINE: Record<string, string> = {
  vitesse: "Bloc vitesse renforcé (ton objectif).",
  technique: "Bloc technique renforcé (ton objectif).",
  physique: "Bloc physique renforcé (ton objectif).",
  endurance: "Bloc endurance renforcé (ton objectif).",
  frappe: "Bloc frappe renforcé (ton objectif).",
  polyvalent: "Programme équilibré sur tous les axes.",
};

// 2-3 séances verrouillées, calées sur le poste et le calendrier du joueur.
export function lockedTeasers(profile: TeaserProfile): LockedTeaser[] {
  const pos = POSITION_FOCUS[profile.position] ?? {
    title: "Séance individuelle",
    focus: "vitesse, technique, physique",
  };
  const posName = positionLabel(profile.position);

  const teasers: LockedTeaser[] = [
    {
      day: "Mardi",
      title: `${pos.title} — spécial ${posName}`,
      focus: pos.focus,
      duration: 32,
    },
    {
      day: "Jeudi",
      title: "Explosivité & vitesse",
      focus: GOAL_LINE[profile.goal] ?? "sprints courts, appuis, pliométrie",
      duration: 28,
    },
  ];

  // Si le joueur a un match, on montre qu'on cale une séance d'avant-match.
  if (profile.matchDay !== null && profile.matchDay !== undefined) {
    const veille = (profile.matchDay + 6) % 7;
    teasers.push({
      day: DAYS_FR[veille],
      title: "Activation d'avant-match",
      focus: `légère, calée avant ton match de ${DAYS_FR[profile.matchDay].toLowerCase()}`,
      duration: 18,
    });
  } else {
    teasers.push({
      day: "Samedi",
      title: "Prévention & mobilité",
      focus: "adducteurs, chevilles, chaîne postérieure",
      duration: 22,
    });
  }

  return teasers;
}
