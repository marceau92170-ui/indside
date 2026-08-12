import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { isAdult } from "@/lib/categories";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

// Essai gratuit supprimé (trop d'abus : carte ajoutée puis annulée/échec juste
// après le prélèvement, sans jamais générer de revenu réel). Débit immédiat
// pour tout le monde désormais.
const BodySchema = z.object({
  plan: z.enum(["monthly", "annual"]),
});

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const priceId =
    parsed.data.plan === "monthly"
      ? process.env.STRIPE_PRICE_MONTHLY
      : process.env.STRIPE_PRICE_ANNUAL;
  if (!priceId) return NextResponse.json({ error: "prix non configuré" }, { status: 500 });

  try {
  const s = stripe();

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await s.customers.create({
      email: user.parentEmail ?? user.email,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
  }

  const base = SITE_URL;

  // Réduction PAR AFFILIÉ : seul un affilié qui a un coupon configuré (ex: Sammy)
  // fait bénéficier ses filleuls d'une remise. Les autres = plein tarif. Le coupon
  // doit être en durée « une seule fois » côté Stripe (réduit seulement le 1er paiement).
  let discounts: { coupon: string }[] | undefined;
  if (user.referredByCode) {
    const aff = await prisma.affiliate.findUnique({
      where: { code: user.referredByCode },
      select: { couponId: true },
    });
    const c = aff?.couponId?.trim();
    if (c) discounts = [{ coupon: c }];
  }

  const adult = user.profile ? isAdult(user.profile.birthYear) : true;

  const message = adult
    ? `Débit immédiat, puis renouvellement automatique. Résiliable à tout moment en 1 clic depuis l'app.`
    : `Débit immédiat. Abonnement à souscrire par un parent ou tuteur légal, résiliable à tout moment en 1 clic depuis l'app.`;

  const makeSession = (withDiscount: boolean) =>
    s.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      ...(withDiscount && discounts ? { discounts } : {}),
      success_url: `${base}/premium/merci?plan=${parsed.data.plan}`,
      cancel_url: `${base}/premium`,
      metadata: { userId: user.id },
      payment_method_collection: "always",
      subscription_data: { metadata: { userId: user.id } },
      // Mineurs : l'abonnement est souscrit par un parent ou tuteur légal.
      custom_text: { submit: { message } },
    });

  // Un coupon mal configuré ne doit JAMAIS empêcher un paiement : si Stripe
  // rejette la remise, on refait la session sans remise plutôt que de bloquer.
  let session;
  try {
    session = await makeSession(true);
  } catch (e) {
    const m = e instanceof Error ? e.message : "";
    if (discounts && /coupon/i.test(m)) {
      console.error("[stripe/checkout] coupon invalide, paiement sans remise:", m);
      session = await makeSession(false);
    } else {
      throw e;
    }
  }

  return NextResponse.json({ url: session.url });
  } catch (e) {
    // On remonte la vraie raison (config Stripe, prix/coupon invalide, clé…)
    // pour pouvoir diagnostiquer au lieu d'un message générique.
    const msg = e instanceof Error ? e.message : "erreur inconnue";
    console.error("[stripe/checkout] échec:", msg);
    return NextResponse.json({ error: "stripe", message: msg }, { status: 500 });
  }
}
