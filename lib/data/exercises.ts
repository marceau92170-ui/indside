import { TECHNIQUE_EXERCISES } from "./exercises-technique";
import { RENFORCEMENT_EXERCISES, EXPLOSIVITE_EXERCISES } from "./exercises-physique";
import { CARDIO_EXERCISES, PREVENTION_EXERCISES, GARDIEN_EXERCISES } from "./exercises-divers";
import type { ExerciseSeed } from "./types";

export type { ExerciseSeed } from "./types";
export { CATEGORY_INFO } from "./types";

// Bibliothèque complète : 60 exercices validés.
// L'IA compose les séances UNIQUEMENT à partir de cette liste — elle n'invente jamais un exercice.
export const ALL_EXERCISES: ExerciseSeed[] = [
  ...TECHNIQUE_EXERCISES,
  ...RENFORCEMENT_EXERCISES,
  ...EXPLOSIVITE_EXERCISES,
  ...CARDIO_EXERCISES,
  ...PREVENTION_EXERCISES,
  ...GARDIEN_EXERCISES,
];
