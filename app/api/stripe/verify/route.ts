import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
  const { sessionId, userToken } = await req.json()

  // Demo mode
  if (sessionId?.startsWith('demo_')) {
    await supabase.from('subscriptions').upsert({
      user_token: userToken,
      plan: 'premium',
      status: 'active',
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_token' })
    return NextResponse.json({ success: true, plan: 'premium' })
  }

  // Real Stripe verification
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) return NextResponse.json({ success: false })

  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(stripeKey)
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status === 'paid') {
      await supabase.from('subscriptions').upsert({
        user_token: userToken,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
        plan: 'premium',
        status: 'active',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_token' })
      return NextResponse.json({ success: true, plan: 'premium' })
    }
  } catch (e) {}

  return NextResponse.json({ success: false })
}
