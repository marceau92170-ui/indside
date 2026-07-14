import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Donne (ou retire) un accès Premium gratuit, sans passer par Stripe.
// Usage : toi-même pour tester, ou tes affiliés (clubs, influenceurs) le temps
// qu'ils tournent leurs vidéos / recommandent l'app.
//
//   Donner   : GET /api/admin/grant-premium?secret=ADMIN_SECRET&email=xxx@mail.com
//   Retirer  : GET /api/admin/grant-premium?secret=ADMIN_SECRET&email=xxx@mail.com&revoke=1
export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");
  if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const email = url.searchParams.get("email")?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "email manquant" }, { status: 400 });
  }

  const revoke = url.searchParams.get("revoke") === "1";
  const plan = revoke ? "free" : "premium";

  // On crée le compte s'il n'existe pas encore : l'affilié pourra se connecter
  // ensuite avec ce même email et retrouvera son accès déjà actif.
  const user = await prisma.user.upsert({
    where: { email },
    create: { email, plan },
    update: { plan },
  });

  return NextResponse.json({ ok: true, email: user.email, plan: user.plan });
}
