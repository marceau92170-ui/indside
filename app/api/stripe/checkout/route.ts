import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

const BodySchema = z.object({ plan: z.enum(["monthly", "annual"]) });

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

  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const session = await s.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${base}/premium/merci`,
    cancel_url: `${base}/premium`,
    metadata: { userId: user.id },
    subscription_data: { metadata: { userId: user.id } },
    // Mineurs : l'abonnement est souscrit par un parent ou tuteur légal
    custom_text: {
      submit: {
        message:
          "Abonnement à souscrire par un parent ou tuteur légal. Résiliable à tout moment en 1 clic depuis l'app.",
      },
    },
  });

  return NextResponse.json({ url: session.url });
}
