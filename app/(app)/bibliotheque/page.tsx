import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";
import { isPremium } from "@/lib/plan";
import { CATEGORY_INFO } from "@/lib/data/types";
import { ExerciseLibrary } from "@/components/ExerciseLibrary";
import { ButtonLink } from "@/components/ui";
import { ageFromBirthYear } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function BibliothequePage() {
  const user = await currentUser();
  const premium = isPremium(user);
  const age = user?.profile ? ageFromBirthYear(user.profile.birthYear) : 16;

  const exercises = await prisma.exercise.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  const visible = exercises.map((ex) => ({
    id: ex.id,
    slug: ex.slug,
    name: ex.name,
    category: ex.category,
    emoji: ex.emoji,
    description: ex.description,
    steps: ex.steps,
    mistakes: ex.mistakes,
    breathing: ex.breathing,
    equipment: ex.equipment,
    smallSpaceFriendly: ex.smallSpaceFriendly,
    minAge: ex.minAge,
    positions: ex.positions,
    variantEasy: ex.variantEasy,
    variantHard: ex.variantHard,
    durationMin: ex.durationMin,
    locked: !premium && !ex.isFree,
    tooYoung: ex.minAge > age,
  }));

  return (
    <div>
      <h1 className="mb-1 font-condensed text-3xl font-bold uppercase">Bibliothèque</h1>
      <p className="mb-4 text-sm text-muted">
        {exercises.length} exercices validés, expliqués pas à pas.
        {!premium && " En gratuit, tu as accès à 10 exercices."}
      </p>
      {!premium && (
        <div className="mb-4 rounded-card border border-glow/30 bg-surface p-4">
          <p className="mb-2 text-sm">
            Débloque les {exercises.length} exercices + ton programme personnalisé.
          </p>
          <ButtonLink href="/premium" size="sm">
            Voir Premium
          </ButtonLink>
        </div>
      )}
      <ExerciseLibrary
        exercises={visible}
        categories={Object.entries(CATEGORY_INFO).map(([key, v]) => ({ key, ...v }))}
      />
    </div>
  );
}
