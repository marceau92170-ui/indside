import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { plan, email, userToken } = await req.json()

    const stripeKey = process.env.STRIPE_SECRET_KEY

    if (!stripeKey || stripeKey.startsWith('sk_test_YOUR')) {
      // Demo mode: simulate successful checkout
      return NextResponse.json({
        url: `/success?session_id=demo_${Date.now()}&token=${userToken}`
      })
    }

    // Real Stripe integration
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(stripeKey)

    const priceId = plan === 'yearly'
      ? process.env.STRIPE_PRICE_YEARLY
      : process.env.STRIPE_PRICE_MONTHLY

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID not configured' }, { status: 500 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}&token=${userToken}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
      metadata: { userToken, plan },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
