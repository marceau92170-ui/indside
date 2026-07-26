import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Le joueur a vu sa promotion (confettis affichés) → on mémorise le palier atteint
// pour ne pas rejouer l'animation à chaque visite. On ne fait que MONTER (jamais
// redescendre le palier vu).
const BodySchema = z.object({ tierIndex: z.number().int().min(0).max(5) });

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  await prisma.user.updateMany({
    where: { id: user.id, rankSeen: { lt: parsed.data.tierIndex } },
    data: { rankSeen: parsed.data.tierIndex },
  });
  return NextResponse.json({ ok: true });
}
