import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const BodySchema = z.object({ theme: z.enum(["dark", "light"]) });

// Apparence de l'app connectée (réglages). La landing page n'appelle jamais
// cette route et reste toujours sombre.
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  await prisma.user.update({ where: { id: user.id }, data: { theme: parsed.data.theme } });
  return NextResponse.json({ ok: true });
}
