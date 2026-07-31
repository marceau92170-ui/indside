import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Enregistre qu'un joueur connecté a visité telle page de l'app — sert à
// construire, en 100% first-party, une vue "quelles fonctionnalités sont
// utilisées ou ignorées au quotidien" (voir /admin/usage). Volontairement
// simple : juste le chemin, pas le détail des actions dessus.
const BodySchema = z.object({
  path: z.string().min(1).max(200),
});

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  await prisma.pageView.create({ data: { userId: user.id, path: parsed.data.path } });

  return NextResponse.json({ ok: true });
}
