import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  const stripeKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!stripeKey || !webhookSecret || stripeKey.startsWith('sk_test_YOUR')) {
    // Demo mode
    return NextResponse.json({ received: true })
  }

  let event: any
  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(stripeKey)
    event = stripe.webhooks.constructEvent(body, sig!, webhookSecret)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  const session = event.data.object

  switch (event.type) {
    case 'checkout.session.completed': {
      const userToken = session.metadata?.userToken
      if (!userToken) break

      await supabaseAdmin.from('subscriptions').upsert({
        user_token: userToken,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        plan: 'premium',
        status: 'active',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_token' })
      break
    }

    case 'customer.subscription.updated': {
      await supabaseAdmin.from('subscriptions')
        .update({
          status: session.status,
          current_period_end: new Date(session.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', session.id)
      break
    }

    case 'customer.subscription.deleted': {
      await supabaseAdmin.from('subscriptions')
        .update({ status: 'canceled', plan: 'free', updated_at: new Date().toISOString() })
        .eq('stripe_subscription_id', session.id)
      break
    }
  }

  return NextResponse.json({ received: true })
}
