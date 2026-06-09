import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
  const { email, userToken } = await req.json()
  if (!email || !userToken) return NextResponse.json({ success: false })

  // Look up active subscription by email via Stripe customer
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey || stripeKey.startsWith('sk_test_YOUR')) {
    return NextResponse.json({ success: false, error: 'Stripe not configured' })
  }

  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(stripeKey)

    // Find customer by email
    const customers = await stripe.customers.list({ email, limit: 5 })
    if (customers.data.length === 0) return NextResponse.json({ success: false })

    // Check if any customer has an active subscription
    for (const customer of customers.data) {
      const subs = await stripe.subscriptions.list({ customer: customer.id, status: 'active', limit: 1 })
      if (subs.data.length > 0) {
        const sub = subs.data[0]
        // Link this subscription to the new userToken
        await supabaseAdmin.from('subscriptions').upsert({
          user_token: userToken,
          stripe_customer_id: customer.id,
          stripe_subscription_id: sub.id,
          stripe_email: email,
          plan: 'premium',
          status: 'active',
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_token' })
        return NextResponse.json({ success: true })
      }
    }
    return NextResponse.json({ success: false })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ success: false, error: e.message })
  }
}
