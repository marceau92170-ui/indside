import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { commissionCents, isWithinLaunchWindow } from "@/lib/affiliate";

export const dynamic = "force-dynamic";

// Enregistre la commission d'affiliation sur le PREMIER paiement d'un joueur parrainé.
// Idempotent : une seule commission par abonnement (clé stripeSubscriptionId).
async function recordCommission(session: Stripe.Checkout.Session, sub: Stripe.Subscription) {
  const userId =
    (sub.metadata?.userId as string | undefined) ?? (session.metadata?.userId as string | undefined);
  if (!userId) return;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.referredByCode) return; // joueur non parrainé → rien

  const affiliate = await prisma.affiliate.findUnique({ where: { code: user.referredByCode } });
  if (!affiliate) return;
  if (affiliate.isHouse) return; // lien "maison" : on suit la vente mais aucune commission

  const gross = session.amount_total ?? 0;
  if (gross <= 0) return;

  const priceId = sub.items.data[0]?.price?.id;
  const plan = priceId === process.env.STRIPE_PRICE_ANNUAL ? "annual" : "monthly";

  // Offre de lancement : annuel à 80% pendant les 30 premiers jours de l'affilié.
  const promoStart = affiliate.promoStartsAt ?? affiliate.createdAt;
  const withinLaunch = isWithinLaunchWindow(promoStart);

  await prisma.commission.upsert({
    where: { stripeSubscriptionId: sub.id },
    create: {
      affiliateCode: affiliate.code,
      userId,
      plan,
      grossCents: gross,
      commissionCents: commissionCents(gross, plan, withinLaunch),
      stripeSubscriptionId: sub.id,
    },
    update: {}, // déjà enregistrée : on ne double jamais une commission
  });
}

async function upsertSubscription(sub: Stripe.Subscription) {
  const userId =
    (sub.metadata?.userId as string | undefined) ??
    (await userIdFromCustomer(sub.customer as string));
  if (!userId) return;

  const status = sub.status;
  const priceId = sub.items.data[0]?.price?.id ?? null;
  const currentPeriodEnd = sub.current_period_end
    ? new Date(sub.current_period_end * 1000)
    : null;
  const trialEnd = sub.trial_end ? new Date(sub.trial_end * 1000) : null;

  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: sub.id },
    create: { userId, stripeSubscriptionId: sub.id, status, priceId, currentPeriodEnd, trialEnd },
    update: { status, priceId, currentPeriodEnd, trialEnd },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { plan: ["active", "trialing"].includes(status) ? "premium" : "free" },
  });
}

async function userIdFromCustomer(customerId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { stripeCustomerId: customerId } });
  return user?.id ?? null;
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "webhook non configuré" }, { status: 500 });

  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "signature manquante" }, { status: 400 });

  const payload = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(payload, signature, secret);
  } catch {
    return NextResponse.json({ error: "signature invalide" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.subscription) {
        const sub = await stripe().subscriptions.retrieve(session.subscription as string);
        await upsertSubscription(sub);
        await recordCommission(session, sub);
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      await upsertSubscription(event.data.object as Stripe.Subscription);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
