import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ALL_EXERCISES } from "@/lib/data/exercises";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Seed de la bibliothèque en production : GET /api/admin/seed?secret=ADMIN_SECRET
export async function GET(req: Request) {
  const secret = new URL(req.url).searchParams.get("secret");
  if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let count = 0;
  for (const ex of ALL_EXERCISES) {
    const data = {
      name: ex.name,
      category: ex.category,
      emoji: ex.emoji,
      description: ex.description,
      steps: ex.steps,
      mistakes: ex.mistakes,
      breathing: ex.breathing ?? null,
      equipment: ex.equipment,
      smallSpaceFriendly: ex.smallSpaceFriendly,
      minAge: ex.minAge,
      positions: ex.positions,
      variantEasy: ex.variantEasy,
      variantHard: ex.variantHard,
      durationMin: ex.durationMin,
      isFree: ex.isFree ?? false,
    };
    await prisma.exercise.upsert({
      where: { slug: ex.slug },
      create: { slug: ex.slug, ...data },
      update: data,
    });
    count++;
  }

  return NextResponse.json({ seeded: count });
}
