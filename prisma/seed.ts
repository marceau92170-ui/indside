import { PrismaClient } from "@prisma/client";
import { ALL_EXERCISES } from "../lib/data/exercises";

const prisma = new PrismaClient();

async function main() {
  console.log(`Seed de ${ALL_EXERCISES.length} exercices…`);
  for (const ex of ALL_EXERCISES) {
    await prisma.exercise.upsert({
      where: { slug: ex.slug },
      create: {
        slug: ex.slug,
        name: ex.name,
        category: ex.category,
        emoji: ex.emoji,
        description: ex.description,
        steps: ex.steps,
        mistakes: ex.mistakes,
        breathing: ex.breathing ?? null,
        equipment: ex.equipment,
        minAge: ex.minAge,
        positions: ex.positions,
        variantEasy: ex.variantEasy,
        variantHard: ex.variantHard,
        durationMin: ex.durationMin,
        isFree: ex.isFree ?? false,
      },
      update: {
        name: ex.name,
        category: ex.category,
        emoji: ex.emoji,
        description: ex.description,
        steps: ex.steps,
        mistakes: ex.mistakes,
        breathing: ex.breathing ?? null,
        equipment: ex.equipment,
        minAge: ex.minAge,
        positions: ex.positions,
        variantEasy: ex.variantEasy,
        variantHard: ex.variantHard,
        durationMin: ex.durationMin,
        isFree: ex.isFree ?? false,
      },
    });
  }
  console.log("Seed terminé ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
