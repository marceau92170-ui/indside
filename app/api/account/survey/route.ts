import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Micro-sondages posés une seule fois à l'écran fin de séance (voir
// SessionSurvey.tsx). Répondu ou explicitement passé ("skipped") : dans les
// deux cas le champ n'est plus null, donc la question ne revient jamais.
const BodySchema = z.object({
  kind: z.enum(["acquisition", "premium_objection"]),
  value: z.string().min(1).max(60),
});

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const { kind, value } = parsed.data;

  // Ne jamais écraser une réponse déjà enregistrée (client qui rejoue la requête, etc.).
  if (kind === "acquisition") {
    if (!user.acquisitionChannel) {
      await prisma.user.update({ where: { id: user.id }, data: { acquisitionChannel: value } });
    }
  } else {
    if (!user.premiumObjection) {
      await prisma.user.update({ where: { id: user.id }, data: { premiumObjection: value } });
    }
  }

  return NextResponse.json({ ok: true });
}
