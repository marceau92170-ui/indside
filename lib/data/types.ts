export type ExerciseCategory =
  | "technique"
  | "renforcement"
  | "explosivite"
  | "cardio"
  | "prevention"
  | "gardien";

export const CATEGORY_INFO: Record<ExerciseCategory, { label: string; emoji: string }> = {
  technique: { label: "Technique & conduite", emoji: "⚽" },
  renforcement: { label: "Renforcement", emoji: "💪" },
  explosivite: { label: "Explosivité & vitesse", emoji: "⚡" },
  cardio: { label: "Cardio & endurance", emoji: "🫁" },
  prevention: { label: "Prévention blessures", emoji: "🛡️" },
  gardien: { label: "Spécifique gardien", emoji: "🧤" },
};

// Code couleur par famille d'exercices — teintes vives mais raffinées, choisies
// pour se distinguer nettement sur fond sombre sans jamais empiéter sur le rouge
// de la marque (réservé aux CTA / actions). Une famille = une couleur, partout.
export const CATEGORY_COLORS: Record<ExerciseCategory, string> = {
  technique: "#4F92F2", // bleu — précision, conduite
  renforcement: "#EF7A4D", // orange chaud — force
  explosivite: "#ECC53A", // jaune doré — énergie, vitesse
  cardio: "#2FBDB4", // turquoise — souffle, endurance
  prevention: "#52BE6A", // vert — santé, prévention
  gardien: "#9B82E6", // violet — spécifique, à part
};

export function categoryColor(cat: string): string {
  return (CATEGORY_COLORS as Record<string, string>)[cat] ?? "#E12A3A";
}

export type ExerciseSeed = {
  slug: string;
  name: string;
  category: ExerciseCategory;
  emoji: string;
  description: string;
  steps: string[];
  mistakes: string;
  breathing?: string;
  equipment: string[]; // ballon | plots | mur | elastiques | aucun
  smallSpaceFriendly: boolean; // faisable dans un espace réduit (balcon, hall, petite cour) sans terrain ni grande distance de course
  minAge: number; // 13 = tous, 15 = interdit aux 13-14 ans
  positions: string[]; // vide = tous postes
  variantEasy: string;
  variantHard: string;
  durationMin: number;
  isFree?: boolean;
};
