import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function POST() {
  const user = await currentUser();
  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: "no_customer" }, { status: 400 });
  }

  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const session = await stripe().billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${base}/reglages`,
  });

  return NextResponse.json({ url: session.url });
}
