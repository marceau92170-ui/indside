import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

// Supprime un affilié : son lien de parrainage (progressafoot.fr/r/<code>) et le
// suivi qui va avec (clics), ainsi que son compte de connexion (Premium offert,
// profil, séances...). Les vrais joueurs inscrits via son lien ne sont PAS
// touchés — seul le lien cesse de rapporter, leur compte reste intact.
//
// Garde-fou : si l'affilié a des commissions/versements enregistrés (de l'argent
// gagné ou déjà versé), on refuse par défaut — les supprimer effacerait
// l'historique comptable. Ajoute &force=1 seulement si tu es sûr de vouloir
// perdre cet historique.
//
//   GET /api/admin/delete-affiliate?secret=ADMIN_SECRET&code=nymax
export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");
  if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const code = url.searchParams.get("code")?.trim().toLowerCase();
  if (!code) return NextResponse.json({ error: "code manquant" }, { status: 400 });
  const force = url.searchParams.get("force") === "1";

  const affiliate = await prisma.affiliate.findUnique({ where: { code } });
  if (!affiliate) return NextResponse.json({ error: "affilié introuvable" }, { status: 404 });

  const [commissionCount, payoutCount] = await Promise.all([
    prisma.commission.count({ where: { affiliateCode: code } }),
    prisma.payout.count({ where: { affiliateCode: code } }),
  ]);
  if ((commissionCount > 0 || payoutCount > 0) && !force) {
    return NextResponse.json(
      {
        error: "historique comptable non vide",
        commissionCount,
        payoutCount,
        hint: "ajoute &force=1 à l'URL pour supprimer quand même (irréversible)",
      },
      { status: 409 }
    );
  }

  // Compte de connexion lié (Premium offert au titre de l'affiliation) : on
  // annule un éventuel abonnement Stripe actif avant de tout supprimer en cascade.
  let deletedUser = false;
  if (affiliate.userId) {
    const user = await prisma.user.findUnique({
      where: { id: affiliate.userId },
      include: { subscription: true },
    });
    if (user?.subscription && ["active", "trialing", "past_due"].includes(user.subscription.status)) {
      try {
        await stripe().subscriptions.cancel(user.subscription.stripeSubscriptionId);
      } catch (err) {
        console.error("Annulation Stripe échouée :", err);
      }
    }
    if (user) {
      await prisma.user.delete({ where: { id: user.id } });
      deletedUser = true;
    }
  }

  // Supprime le lien lui-même (cascade : clics, commissions et versements liés à ce code).
  await prisma.affiliate.delete({ where: { code } });

  await prisma.adminActionLog.create({
    data: { action: "delete_affiliate", email: affiliate.email, note: `code=${code} force=${force}` },
  });

  return NextResponse.json({ ok: true, code, deletedUser });
}
