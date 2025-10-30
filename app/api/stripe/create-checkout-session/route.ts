import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // リクエストボディからpriceIdとplanNameを取得
    const { priceId, planName } = await request.json()

    if (!priceId) {
      return NextResponse.json(
        { error: 'priceIdが必要です' },
        { status: 400 }
      )
    }

    // planNameからプラン情報を取得（コンバージョントラッキング用）
    const planPrices: Record<string, number> = {
      'ライトプラン': 2980,
      'スタンダードプラン': 5980,
      'プロプラン': 9980,
      'ビジネスプラン': 19800,
    }
    const planPrice = planPrices[planName || ''] || 0

    // ユーザー情報を取得
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email, stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (userError) {
      console.error('User data fetch error:', userError)
      return NextResponse.json(
        { error: 'ユーザー情報の取得に失敗しました' },
        { status: 500 }
      )
    }

    // Stripe Customerがない場合は作成
    let customerId = userData.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userData.email,
        metadata: {
          supabase_user_id: user.id,
        },
      })

      customerId = customer.id

      // Supabaseにstripe_customer_idを保存
      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    // Checkout Sessionを作成
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://www.paintly.pro'

    // コンバージョントラッキング用のsuccess_url（プラン名と金額を含む）
    const successUrl = new URL('/billing/success', origin)
    successUrl.searchParams.set('session_id', '{CHECKOUT_SESSION_ID}')
    if (planName) {
      successUrl.searchParams.set('plan', planName)
    }
    if (planPrice > 0) {
      successUrl.searchParams.set('amount', planPrice.toString())
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl.toString(),
      cancel_url: `${origin}/pricing?canceled=true`,
      metadata: {
        supabase_user_id: user.id,
        plan_name: planName || '',
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    })

    return NextResponse.json({ url: session.url }, { status: 200 })

  } catch (error) {
    console.error('Checkout session creation error:', error)
    return NextResponse.json(
      { error: 'セッションの作成に失敗しました' },
      { status: 500 }
    )
  }
}
