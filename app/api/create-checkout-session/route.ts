import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { priceId, planId } = await request.json()

    if (!priceId || !planId) {
      return NextResponse.json(
        { error: '必須パラメータが不足しています' },
        { status: 400 }
      )
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        planId: planId,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          planId: planId,
        },
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error)
    return NextResponse.json(
      { error: error.message || 'セッションの作成に失敗しました' },
      { status: 500 }
    )
  }
}