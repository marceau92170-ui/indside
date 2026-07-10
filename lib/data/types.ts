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
  minAge: number; // 13 = tous, 15 = interdit aux 13-14 ans
  positions: string[]; // vide = tous postes
  variantEasy: string;
  variantHard: string;
  durationMin: number;
  isFree?: boolean;
};
