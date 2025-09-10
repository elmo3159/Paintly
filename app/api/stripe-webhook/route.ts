import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = (await headers()).get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const planId = session.metadata?.planId
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string

        if (!userId || !planId) {
          throw new Error('Missing metadata in checkout session')
        }

        // Get plan details
        const { data: plan } = await supabase
          .from('plans')
          .select('*')
          .eq('id', planId)
          .single()

        if (!plan) {
          throw new Error(`Plan not found: ${planId}`)
        }

        // Create or update subscription
        await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            plan_id: plan.id,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            status: 'active',
            generation_count: 0,
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          })

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const subscriptionId = subscription.id
        const status = subscription.status

        await supabase
          .from('subscriptions')
          .update({ 
            status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscriptionId)

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const subscriptionId = subscription.id

        await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', subscriptionId)

        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string

        // Reset generation count for new billing period
        await supabase
          .from('subscriptions')
          .update({ 
            generation_count: 0,
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscriptionId)

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string

        await supabase
          .from('subscriptions')
          .update({ status: 'past_due' })
          .eq('stripe_subscription_id', subscriptionId)

        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error(`Webhook handler error: ${error.message}`)
    return NextResponse.json(
      { error: `Webhook handler failed: ${error.message}` },
      { status: 500 }
    )
  }
}