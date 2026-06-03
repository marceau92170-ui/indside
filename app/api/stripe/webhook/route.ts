import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  // In production: verify Stripe webhook signature
  // const sig = req.headers.get('stripe-signature')!
  // const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)

  const body = await req.text()

  // Handle subscription events
  // event.type === 'checkout.session.completed' → mark user as premium
  // event.type === 'customer.subscription.deleted' → remove premium

  return NextResponse.json({ received: true })
}
