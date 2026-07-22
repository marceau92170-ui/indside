import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";
import { categoryFromBirthYear } from "@/lib/categories";
import { positionLabel } from "@/lib/constants";

export const dynamic = "force-dynamic";

const Schema = z.object({
  rating: z.number().int().min(1).max(5),
  text: z.string().trim().min(15).max(400),
});

// Un utilisateur connecté (avec profil) soumet son avis. Il part en "pending" :
// rien n'est publié sans validation manuelle (voir /admin/avis). Un avis par
// utilisateur — le re-soumettre le remet en modération.
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!user.profile) return NextResponse.json({ error: "profil requis" }, { status: 400 });

  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const { rating, text } = parsed.data;
  const displayName = user.profile.firstName;
  const meta = `${positionLabel(user.profile.position)} · ${categoryFromBirthYear(user.profile.birthYear)}`;

  await prisma.review.upsert({
    where: { userId: user.id },
    create: { userId: user.id, rating, text, displayName, meta, status: "pending" },
    update: { rating, text, displayName, meta, status: "pending" },
  });

  return NextResponse.json({ ok: true });
}
