import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Enregistre un clic sur un bouton/action jugé important — complète PageView
// pour voir non seulement où les gens vont, mais ce qu'ils y font (voir
// /admin/usage). Instrumenté bouton par bouton, pas exhaustif d'un coup.
const BodySchema = z.object({
  label: z.string().min(1).max(80),
  path: z.string().min(1).max(200),
});

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  await prisma.appClickEvent.create({
    data: { userId: user.id, label: parsed.data.label, path: parsed.data.path },
  });

  return NextResponse.json({ ok: true });
}
