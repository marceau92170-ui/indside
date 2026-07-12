import type { Exercise, PlayerProfile } from "@prisma/client";
import { ageFromBirthYear } from "@/lib/categories";

// Alternative "espace réduit" : quand le joueur ne peut pas aller à son
// entraînement club/city (pas de terrain dispo), on recompose la séance
// uniquement avec des exercices de la bibliothèque faisables en petit
// espace (balcon, hall, petite cour) — jamais d'exercice inventé.

function block(ex: Exercise, sets: number, reps: string, rest: string, instruction: string) {
  return { slug: ex.slug, sets, reps, rest, instruction };
}

function repsFor(ex: Exercise): { sets: number; reps: string } {
  if (ex.category === "renforcement") return { sets: 2, reps: "10-12 répétitions" };
  if (ex.category === "explosivite") return { sets: 2, reps: "5-6 répétitions" };
  if (ex.category === "prevention") return { sets: 2, reps: "30 s" };
  if (ex.category === "gardien") return { sets: 2, reps: "45 s" };
  return { sets: 2, reps: `${ex.durationMin} min` }; // technique
}

export function buildSmallSpaceBlocks(
  profile: PlayerProfile,
  candidates: Exercise[],
  targetCount: number
) {
  const age = ageFromBirthYear(profile.birthYear);
  const isGK = profile.position === "GB";

  const allowed = candidates.filter(
    (e) =>
      e.smallSpaceFriendly &&
      e.minAge <= age &&
      (e.positions.length === 0 || e.positions.includes(profile.position))
  );

  const order = isGK
    ? ["gardien", "renforcement", "prevention", "technique", "explosivite"]
    : ["technique", "renforcement", "prevention", "explosivite", "gardien"];

  const byCategory = new Map<string, Exercise[]>();
  for (const ex of allowed) {
    const list = byCategory.get(ex.category) ?? [];
    list.push(ex);
    byCategory.set(ex.category, list);
  }

  const chosen: Exercise[] = [];
  const usedSlugs = new Set<string>();
  for (let round = 0; chosen.length < targetCount && round < 3; round++) {
    for (const cat of order) {
      if (chosen.length >= targetCount) break;
      const pool = (byCategory.get(cat) ?? []).filter((e) => !usedSlugs.has(e.slug));
      const pick = pool[round];
      if (pick) {
        chosen.push(pick);
        usedSlugs.add(pick.slug);
      }
    }
  }

  return chosen.map((ex) => {
    const { sets, reps } = repsFor(ex);
    return block(ex, sets, reps, "30 s", ex.variantEasy);
  });
}
