import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

// Suppression de compte (RGPD) : annule l'abonnement Stripe, supprime le compte Clerk,
// puis supprime tout en cascade en base.
export async function POST() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  if (user.subscription && ["active", "trialing", "past_due"].includes(user.subscription.status)) {
    try {
      await stripe().subscriptions.cancel(user.subscription.stripeSubscriptionId);
    } catch (err) {
      console.error("Annulation Stripe échouée :", err);
    }
  }

  // Supprime le compte côté Clerk (sinon il pourrait se reconnecter sur un compte vide).
  if (user.clerkId) {
    try {
      await (await clerkClient()).users.deleteUser(user.clerkId);
    } catch (err) {
      console.error("Suppression Clerk échouée :", err);
    }
  }

  await prisma.user.delete({ where: { id: user.id } });

  return NextResponse.json({ ok: true });
}
