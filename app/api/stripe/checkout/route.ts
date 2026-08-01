import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { isAdult } from "@/lib/categories";
import { SITE_URL } from "@/lib/site";

// Durée de l'essai gratuit (carte demandée, débit uniquement à la fin si non résilié).
// NB : pas d'`export` — un fichier de route Next.js n'autorise que GET/POST/dynamic/etc.
const TRIAL_DAYS = 7;

export const dynamic = "force-dynamic";

// `trial` : true → l'utilisateur demande l'essai 7 jours ; false → il paie
// directement (débit immédiat). Par défaut true (rétro-compatible).
const BodySchema = z.object({
  plan: z.enum(["monthly", "annual"]),
  trial: z.boolean().optional().default(true),
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

  // L'essai n'est accordé que s'il est demandé ET que ce compte ne l'a jamais
  // consommé : un compte a droit à UN seul essai gratuit (anti re-farming).
  // Payer directement reste toujours possible, sans limite.
  const applyTrial = parsed.data.trial && !user.hasUsedTrial;

  const message = applyTrial
    ? adult
      ? `0 € aujourd'hui, aucune carte requise — gratuit pendant ${TRIAL_DAYS} jours. Si tu veux continuer après l'essai, ajoute un moyen de paiement depuis l'app. Résiliable à tout moment.`
      : `0 € aujourd'hui, aucune carte requise — gratuit pendant ${TRIAL_DAYS} jours. Abonnement à souscrire par un parent ou tuteur légal pour continuer après l'essai. Résiliable à tout moment.`
    : adult
      ? `Débit immédiat, puis renouvellement automatique. Résiliable à tout moment en 1 clic depuis l'app.`
      : `Débit immédiat. Abonnement à souscrire par un parent ou tuteur légal, résiliable à tout moment en 1 clic depuis l'app.`;

  const makeSession = (withDiscount: boolean) =>
    s.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      ...(withDiscount && discounts ? { discounts } : {}),
      success_url: `${base}/premium/merci?plan=${parsed.data.plan}&trial=${applyTrial}`,
      cancel_url: `${base}/premium`,
      metadata: { userId: user.id },
      // Essai gratuit : pas de carte demandée à l'inscription (moins de friction,
      // aucun risque de débit surprise). Paiement direct : carte obligatoire,
      // comme avant. Si l'essai se termine sans carte enregistrée, Stripe ne
      // peut pas prélever : l'abonnement passe en échec de paiement et
      // isPremium() (lib/plan.ts) fait automatiquement retomber le compte en
      // gratuit — aucun abus possible au-delà de la période d'essai.
      payment_method_collection: applyTrial ? "if_required" : "always",
      subscription_data: {
        metadata: { userId: user.id },
        // Essai 7 jours uniquement si accordé ; sinon débit immédiat.
        ...(applyTrial ? { trial_period_days: TRIAL_DAYS } : {}),
      },
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
