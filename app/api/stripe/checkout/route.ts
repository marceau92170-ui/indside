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

  // Réduction affilié : si le joueur est venu par un lien de parrainage et qu'un
  // coupon est configuré, on l'applique automatiquement (aucun code à taper).
  // Le coupon doit être en durée « une seule fois » côté Stripe → il ne réduit
  // que le PREMIER paiement, jamais les renouvellements.
  const coupon = process.env.STRIPE_COUPON_AFFILIATE;
  const discounts =
    user.referredByCode && coupon ? [{ coupon }] : undefined;

  const adult = user.profile ? isAdult(user.profile.birthYear) : true;

  // L'essai n'est accordé que s'il est demandé ET que ce compte ne l'a jamais
  // consommé : un compte a droit à UN seul essai gratuit (anti re-farming).
  // Payer directement reste toujours possible, sans limite.
  const applyTrial = parsed.data.trial && !user.hasUsedTrial;

  const message = applyTrial
    ? adult
      ? `Gratuit pendant ${TRIAL_DAYS} jours, puis renouvellement automatique. Résiliable à tout moment en 1 clic depuis l'app — aucun débit si tu résilies avant la fin de l'essai.`
      : `Gratuit pendant ${TRIAL_DAYS} jours. Abonnement à souscrire par un parent ou tuteur légal, résiliable à tout moment en 1 clic depuis l'app — aucun débit si résiliation avant la fin de l'essai.`
    : adult
      ? `Débit immédiat, puis renouvellement automatique. Résiliable à tout moment en 1 clic depuis l'app.`
      : `Débit immédiat. Abonnement à souscrire par un parent ou tuteur légal, résiliable à tout moment en 1 clic depuis l'app.`;

  const session = await s.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    ...(discounts ? { discounts } : {}),
    success_url: `${base}/premium/merci`,
    cancel_url: `${base}/premium`,
    metadata: { userId: user.id },
    payment_method_collection: "always",
    subscription_data: {
      metadata: { userId: user.id },
      // Essai 7 jours uniquement si accordé ; sinon débit immédiat.
      ...(applyTrial ? { trial_period_days: TRIAL_DAYS } : {}),
    },
    // Mineurs : l'abonnement est souscrit par un parent ou tuteur légal.
    custom_text: { submit: { message } },
  });

  return NextResponse.json({ url: session.url });
}
