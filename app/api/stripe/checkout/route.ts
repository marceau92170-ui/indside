import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userToken = searchParams.get('token') || 'anonymous'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://indside-nine.vercel.app'

  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY
    if (!stripeKey) return NextResponse.redirect(new URL('/pricing?error=no_key', req.url))

    const priceId = process.env.STRIPE_PRICE_MONTHLY
    if (!priceId) return NextResponse.redirect(new URL('/pricing?error=no_price', req.url))

    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(stripeKey)

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      automatic_payment_methods: { enabled: true },
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}&token=${userToken}`,
      cancel_url: `${appUrl}/pricing`,
      metadata: { userToken, plan: 'monthly' },
    })

    if (!session.url) return NextResponse.redirect(new URL('/pricing?error=no_url', req.url))
    return NextResponse.redirect(session.url)
  } catch (error: any) {
    console.error('Stripe GET checkout error:', error)
    const msg = encodeURIComponent(error.message || 'unknown')
    return NextResponse.redirect(new URL(`/pricing?error=${msg}`, req.url))
  }
}

export async function POST(req: Request) {
  try {
    const { plan, email, userToken } = await req.json()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://indside-nine.vercel.app'

    const stripeKey = process.env.STRIPE_SECRET_KEY
    if (!stripeKey) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })

    const priceId = plan === 'yearly'
      ? process.env.STRIPE_PRICE_YEARLY
      : process.env.STRIPE_PRICE_MONTHLY
    if (!priceId) return NextResponse.json({ error: 'Price ID not configured' }, { status: 500 })

    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(stripeKey)

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      automatic_payment_methods: { enabled: true },
      ...(email ? { customer_email: email } : {}),
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}&token=${userToken}`,
      cancel_url: `${appUrl}/pricing`,
      metadata: { userToken, plan },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
