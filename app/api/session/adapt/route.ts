import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";
import { isPremium } from "@/lib/plan";
import { buildSmallSpaceBlocks } from "@/lib/program/adapt";

export const dynamic = "force-dynamic";

const AdaptSchema = z.object({ sessionId: z.string().min(1) });

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!user.profile) return NextResponse.json({ error: "no_profile" }, { status: 400 });

  const parsed = AdaptSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const session = await prisma.trainingSession.findFirst({
    where: { id: parsed.data.sessionId, program: { userId: user.id } },
    include: { logs: { where: { userId: user.id } } },
  });
  if (!session) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (session.logs.length > 0) {
    return NextResponse.json({ error: "already_logged" }, { status: 400 });
  }

  const premium = isPremium(user);
  const candidates = await prisma.exercise.findMany({
    where: { smallSpaceFriendly: true, ...(premium ? {} : { isFree: true }) },
  });

  const rawBlocks = (session.blocks as { slug: string }[]) ?? [];
  const targetCount = Math.min(6, Math.max(3, rawBlocks.length));
  const blocks = buildSmallSpaceBlocks(user.profile, candidates, targetCount);

  if (blocks.length < 3) {
    return NextResponse.json({ error: "not_enough_exercises" }, { status: 409 });
  }

  const durationMin = blocks.reduce((sum, b) => {
    const ex = candidates.find((e) => e.slug === b.slug);
    return sum + (ex?.durationMin ?? 5);
  }, 0);

  await prisma.trainingSession.update({
    where: { id: session.id },
    data: {
      blocks,
      durationMin,
      title: session.title.includes("(espace réduit)")
        ? session.title
        : `${session.title} (espace réduit)`,
      advice:
        "Séance adaptée : pas de terrain aujourd'hui, tout se fait dans un petit espace (balcon, hall, cour), avec un mur si tu en as un sous la main.",
    },
  });

  return NextResponse.json({ ok: true });
}
