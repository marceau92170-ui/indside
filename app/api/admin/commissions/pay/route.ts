import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";
import { affiliateStats } from "@/lib/affiliate-stats";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

// Enregistre un versement à un affilié = solde ce qu'on lui doit actuellement.
// Appelée depuis le dashboard admin (formulaire). Réservée au compte admin.
export async function POST(req: Request) {
  const me = await currentUser();
  if (me?.role !== "admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const code = String(form.get("code") ?? "").trim().toLowerCase();
  const affiliate = await prisma.affiliate.findUnique({ where: { code } });
  if (!affiliate) return NextResponse.json({ error: "affilié inconnu" }, { status: 404 });

  const stats = await affiliateStats(affiliate);
  if (stats.owedCents > 0) {
    await prisma.payout.create({
      data: { affiliateCode: code, amountCents: stats.owedCents, note: "Versement marqué depuis le dashboard" },
    });
  }

  return NextResponse.redirect(new URL("/admin/affiliation", SITE_URL), { status: 303 });
}
