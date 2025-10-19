import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Supabase Admin Client（RLSをバイパス）
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      console.error('No signature provided')
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    console.log('Webhook event received:', event.type)

    // イベントタイプによる処理分岐
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true }, { status: 200 })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Checkout Session完了時の処理
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Processing checkout.session.completed:', session.id)

  const userId = session.metadata?.supabase_user_id
  const customerId = session.customer as string
  const subscriptionId = session.subscription as string

  if (!userId) {
    console.error('No user_id in session metadata')
    return
  }

  // Subscriptionの詳細を取得
  if (subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    await upsertSubscription(userId, customerId, subscription)
  }
}

// Subscription作成/更新時の処理
async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  console.log('Processing subscription change:', subscription.id)

  const customerId = subscription.customer as string

  // Customer metadataからuser_idを取得
  const customer = await stripe.customers.retrieve(customerId)
  if (customer.deleted) return

  const userId = customer.metadata?.supabase_user_id

  if (!userId) {
    console.error('No user_id in customer metadata')
    return
  }

  await upsertSubscription(userId, customerId, subscription)
}

// Subscriptionキャンセル時の処理
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Processing subscription.deleted:', subscription.id)

  // Subscriptionのステータスを更新
  await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'canceled',
      cancel_at_period_end: true,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)
}

// 請求成功時の処理
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Processing invoice.payment_succeeded:', invoice.id)

  const subscriptionId = invoice.subscription as string

  if (subscriptionId) {
    // 生成回数をリセット（月次更新）
    await supabaseAdmin
      .from('subscriptions')
      .update({
        generation_count: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId)
  }
}

// 請求失敗時の処理
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Processing invoice.payment_failed:', invoice.id)

  const subscriptionId = invoice.subscription as string

  if (subscriptionId) {
    // ステータスをpast_dueに更新
    await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'past_due',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId)
  }
}

// Subscriptionの作成/更新
async function upsertSubscription(
  userId: string,
  customerId: string,
  subscription: Stripe.Subscription
) {
  // Stripe Price IDからplan_idを取得
  const priceId = subscription.items.data[0].price.id

  const { data: plan, error: planError } = await supabaseAdmin
    .from('plans')
    .select('id')
    .eq('stripe_price_id', priceId)
    .single()

  if (planError || !plan) {
    console.error('Plan not found for price_id:', priceId, planError)
    return
  }

  const subscriptionData = {
    user_id: userId,
    plan_id: plan.id,
    status: subscription.status,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: customerId,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  }

  // 既存のSubscriptionを確認
  const { data: existing } = await supabaseAdmin
    .from('subscriptions')
    .select('id')
    .eq('stripe_subscription_id', subscription.id)
    .single()

  if (existing) {
    // 更新
    await supabaseAdmin
      .from('subscriptions')
      .update(subscriptionData)
      .eq('id', existing.id)
  } else {
    // 新規作成
    await supabaseAdmin
      .from('subscriptions')
      .insert({
        ...subscriptionData,
        generation_count: 0,
        created_at: new Date().toISOString(),
      })
  }

  console.log('Subscription upserted successfully for user:', userId)
}
