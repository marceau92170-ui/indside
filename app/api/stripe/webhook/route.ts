import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { commissionCents, isWithinLaunchWindow } from "@/lib/affiliate";
import { grantPaidReferralReward } from "@/lib/referral";

export const dynamic = "force-dynamic";

// Enregistre la VENTE (et la commission) d'un joueur parrainé.
// Déclenché sur un PAIEMENT RÉEL (montant > 0) — pas au checkout, car avec l'essai
// gratuit de 7 jours le montant au checkout est 0 € (rien n'est débité tout de suite) ;
// le vrai paiement arrive à la fin de l'essai via `invoice.payment_succeeded`.
// Idempotent : une seule vente par abonnement (clé stripeSubscriptionId).
// Les liens "maison" (créateur au fixe, ex. Sam) : on enregistre la vente pour le suivi,
// mais avec une commission de 0 € (aucun argent dû).
async function recordSale(sub: Stripe.Subscription, grossCents: number) {
  if (grossCents <= 0) return;

  const userId =
    (sub.metadata?.userId as string | undefined) ??
    (await userIdFromCustomer(sub.customer as string));
  if (!userId) return;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.referredByCode) return; // joueur non parrainé → aucune vente affiliée

  const affiliate = await prisma.affiliate.findUnique({ where: { code: user.referredByCode } });
  if (!affiliate) return;

  const priceId = sub.items.data[0]?.price?.id;
  const plan = priceId === process.env.STRIPE_PRICE_ANNUAL ? "annual" : "monthly";

  // Offre de lancement : annuel à 80% pendant les 30 premiers jours de l'affilié.
  const promoStart = affiliate.promoStartsAt ?? affiliate.createdAt;
  const withinLaunch = isWithinLaunchWindow(promoStart);

  // Lien "maison" → 0 commission (le créateur est payé au fixe).
  const commission = affiliate.isHouse ? 0 : commissionCents(grossCents, plan, withinLaunch);

  await prisma.commission.upsert({
    where: { stripeSubscriptionId: sub.id },
    create: {
      affiliateCode: affiliate.code,
      userId,
      plan,
      grossCents,
      commissionCents: commission,
      stripeSubscriptionId: sub.id,
    },
    update: {}, // déjà enregistrée : on ne double jamais une vente
  });
}

async function upsertSubscription(sub: Stripe.Subscription) {
  const userId =
    (sub.metadata?.userId as string | undefined) ??
    (await userIdFromCustomer(sub.customer as string));
  if (!userId) return;

  const status = sub.status;
  const priceId = sub.items.data[0]?.price?.id ?? null;
  // `current_period_end` est au niveau racine dans les anciennes versions d'API et au
  // niveau de l'item dans les récentes : on lit les deux pour être robuste.
  const s = sub as unknown as {
    current_period_end?: number | null;
    items?: { data?: { current_period_end?: number | null }[] };
  };
  const periodEndRaw = s.current_period_end ?? s.items?.data?.[0]?.current_period_end ?? null;
  const currentPeriodEnd = periodEndRaw ? new Date(periodEndRaw * 1000) : null;
  const trialEnd = sub.trial_end ? new Date(sub.trial_end * 1000) : null;

  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: sub.id },
    create: { userId, stripeSubscriptionId: sub.id, status, priceId, currentPeriodEnd, trialEnd },
    update: { status, priceId, currentPeriodEnd, trialEnd },
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      plan: ["active", "trialing"].includes(status) ? "premium" : "free",
      // Dès qu'un essai gratuit démarre, on grave que ce compte l'a consommé :
      // il n'y aura pas droit une seconde fois (anti re-farming, 1×/compte).
      ...(trialEnd ? { hasUsedTrial: true } : {}),
    },
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
        // Sans essai (montant > 0), on enregistre la vente ici ; avec essai, le montant
        // est 0 → la vente sera enregistrée au 1er vrai paiement (invoice.payment_succeeded).
        await recordSale(sub, session.amount_total ?? 0);
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      await upsertSubscription(event.data.object as Stripe.Subscription);
      break;
    }
    case "invoice.payment_succeeded": {
      // 1er vrai paiement (fin d'essai) ou renouvellement. On récupère l'objet frais
      // via le SDK (forme d'API stable) pour lire proprement l'abonnement et le montant.
      const rawId = (event.data.object as { id?: string }).id;
      if (rawId) {
        const invoice = (await stripe().invoices.retrieve(rawId)) as unknown as {
          amount_paid?: number | null;
          subscription?: string | null;
        };
        const subId = invoice.subscription;
        if (subId && (invoice.amount_paid ?? 0) > 0) {
          const sub = await stripe().subscriptions.retrieve(subId);
          await upsertSubscription(sub);
          await recordSale(sub, invoice.amount_paid ?? 0);
          // Parrainage entre joueurs : le parrain gagne 2 semaines quand son
          // filleul effectue son 1er vrai paiement (idempotent côté fonction).
          const payerId =
            (sub.metadata?.userId as string | undefined) ??
            (await userIdFromCustomer(sub.customer as string));
          if (payerId) await grantPaidReferralReward(payerId);
        }
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
