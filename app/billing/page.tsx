'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { pricingPlans, type PricingPlan } from '@/lib/pricing-plans'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Check, Loader2, Sparkles, AlertCircle } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'

// Only initialize Stripe if publishable key is provided
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

export default function BillingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [currentPlan, setCurrentPlan] = useState<string>('free')
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [stripeConfigured, setStripeConfigured] = useState(true)

  useEffect(() => {
    // Check if Stripe is configured
    setStripeConfigured(!!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
    fetchCurrentPlan()
  }, [])

  const fetchCurrentPlan = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth/signin')
      return
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plans (id)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (subscription?.plans) {
      setCurrentPlan((subscription.plans as any).id)
    }
    
    setLoading(false)
  }

  const handleSubscribe = async (plan: PricingPlan) => {
    if (plan.id === 'free') {
      setError('無料プランへの変更はサポートまでお問い合わせください')
      return
    }

    setSubscribing(plan.id)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('ログインが必要です')
      }

      // Create checkout session via API
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          planId: plan.id,
        }),
      })

      const { sessionId, error: sessionError } = await response.json()

      if (sessionError) {
        throw new Error(sessionError)
      }

      // Redirect to Stripe Checkout
      const stripe = await stripePromise
      if (!stripe) {
        throw new Error('Stripe公開キーが設定されていません。管理者にお問い合わせください。')
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId,
      })

      if (stripeError) {
        throw stripeError
      }
    } catch (err: any) {
      setError(err.message || 'エラーが発生しました')
    } finally {
      setSubscribing(null)
    }
  }

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
      })

      const { url, error: portalError } = await response.json()

      if (portalError) {
        throw new Error(portalError)
      }

      window.location.href = url
    } catch (err: any) {
      setError(err.message || 'エラーが発生しました')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">料金プラン</h1>
          <p className="text-lg text-muted-foreground mt-4">
            あなたのビジネスに最適なプランをお選びください
          </p>
        </div>

        {!stripeConfigured && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>開発モード:</strong> Stripe決済機能は設定されていません。実際の決済を行うには管理者にお問い合わせください。
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {pricingPlans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative ${
                plan.highlighted ? 'border-primary shadow-lg scale-105' : ''
              }`}
            >
              {plan.highlighted && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  おすすめ
                </Badge>
              )}
              
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="text-center">
                  <span className="text-4xl font-bold">
                    ¥{plan.price.toLocaleString()}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-sm text-muted-foreground">/月</span>
                  )}
                </div>

                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                {currentPlan === plan.id ? (
                  <Button 
                    className="w-full" 
                    variant="secondary"
                    onClick={handleManageSubscription}
                  >
                    現在のプラン
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? 'default' : 'outline'}
                    onClick={() => handleSubscribe(plan)}
                    disabled={subscribing === plan.id || plan.id === 'free' || !stripeConfigured}
                  >
                    {subscribing === plan.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        処理中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        {plan.price === 0 ? '選択済み' : 'このプランを選択'}
                      </>
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>よくある質問</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">プランはいつでも変更できますか？</h3>
              <p className="text-sm text-muted-foreground">
                はい、いつでもアップグレードまたはダウングレードが可能です。
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">生成回数はどのようにカウントされますか？</h3>
              <p className="text-sm text-muted-foreground">
                画像を1回生成するごとに1回としてカウントされます。月初にリセットされます。
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">無料トライアルはありますか？</h3>
              <p className="text-sm text-muted-foreground">
                新規登録時に3回まで無料で画像生成をお試しいただけます。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}