'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { pricingPlans, type PricingPlan } from '@/lib/pricing-plans'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Check, Loader2, Sparkles, AlertCircle, Palette, Droplet, Paintbrush, Star, Crown, Zap, TrendingUp, Building2, Factory } from 'lucide-react'
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-primary/10">
        <div className="text-center space-y-4">
          <div className="relative">
            <Palette className="h-12 w-12 text-primary animate-pulse mx-auto" />
            <Droplet className="absolute -top-1 -right-1 h-6 w-6 text-accent animate-bounce" />
          </div>
          <p className="text-muted-foreground font-medium">プランを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-primary/10 relative">
      {/* 背景装飾 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 opacity-5 rotate-12">
          <Palette className="w-full h-full text-primary" />
        </div>
        <div className="absolute bottom-20 right-10 w-28 h-28 opacity-5 -rotate-12">
          <Paintbrush className="w-full h-full text-accent" />
        </div>
        <div className="absolute top-1/3 right-1/4 w-6 h-6 opacity-25 animate-pulse text-accent">
          <Droplet className="w-full h-full" />
        </div>
        <div className="absolute bottom-1/3 left-1/4 w-8 h-8 opacity-20 animate-bounce text-primary">
          <Star className="w-full h-full" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* ヘッダーセクション */}
          <div className="text-center space-y-6">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="p-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full shadow-lg">
                  <Crown className="h-16 w-16 text-primary" />
                </div>
                <Star className="absolute -top-2 -right-2 h-8 w-8 text-accent animate-pulse" />
              </div>
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl font-bold tracking-tight paint-text">
                Paintlyプラン
              </h1>
              <h2 className="text-2xl font-bold text-foreground">
                営業成約率を劇的に向上させる
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                塗装業界に特化したAI画像生成で、<br />
                お客様の理想を瞬時に可視化。<span className="text-primary font-semibold">あなたのビジネス</span>に最適なプランをお選びください。
              </p>
            </div>
          </div>

          {/* アラート表示 */}
          {!stripeConfigured && (
            <Alert className="border-primary/20 bg-primary/5">
              <Palette className="h-4 w-4 text-primary" />
              <AlertDescription className="text-primary/90">
                <strong>開発モード:</strong> Stripe決済機能は設定されていません。実際の決済を行うには管理者にお問い合わせください。
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="border-destructive/20 bg-destructive/5">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-destructive/90">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* プランカードグリッド */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {pricingPlans.map((plan, index) => {
              // プランごとのアイコンを定義
              const planIcons = {
                free: Star,
                light: Paintbrush,
                standard: Building2,
                pro: TrendingUp,
                business: Factory
              }
              const IconComponent = planIcons[plan.id as keyof typeof planIcons] || Palette

              return (
                <Card 
                  key={plan.id}
                  className={`relative paint-card transition-all duration-300 hover:scale-105 ${
                    plan.highlighted ? 'ring-2 ring-primary/50 shadow-2xl scale-105' : ''
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground border-0 shadow-lg paint-button">
                        <Crown className="h-3 w-3 mr-1" />
                        おすすめ
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-6">
                    <div className="flex justify-center mb-4">
                      <div className="relative">
                        <div className={`p-3 rounded-xl shadow-lg ${
                          plan.highlighted 
                            ? 'bg-gradient-to-br from-primary/20 to-accent/20' 
                            : 'bg-gradient-to-br from-secondary/20 to-muted/20'
                        }`}>
                          <IconComponent className={`h-10 w-10 ${
                            plan.highlighted ? 'text-primary' : 'text-muted-foreground'
                          }`} />
                        </div>
                        {plan.highlighted && (
                          <Droplet className="absolute -top-1 -right-1 h-5 w-5 text-accent animate-bounce" />
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-foreground">{plan.name}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">{plan.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div className="text-center space-y-2">
                      <div className="flex items-baseline justify-center">
                        <span className="text-5xl font-bold text-foreground">
                          ¥{plan.price.toLocaleString()}
                        </span>
                        {plan.price > 0 && (
                          <span className="text-lg text-muted-foreground ml-1">/月</span>
                        )}
                      </div>
                      {plan.price === 0 && (
                        <p className="text-accent font-semibold text-sm">
                          <Star className="inline h-3 w-3 mr-1" />
                          3回まで無料！
                        </p>
                      )}
                    </div>

                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-0.5">
                            <div className="p-1 rounded-full bg-primary/10">
                              <Check className="h-3 w-3 text-primary" />
                            </div>
                          </div>
                          <span className="text-sm leading-relaxed text-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="pt-6">
                    {currentPlan === plan.id ? (
                      <Button 
                        className="w-full paint-button h-12 text-base font-bold" 
                        variant="secondary"
                        onClick={handleManageSubscription}
                      >
                        <Crown className="mr-2 h-4 w-4" />
                        現在のプラン
                      </Button>
                    ) : (
                      <Button
                        className={`w-full h-12 text-base font-bold shadow-lg transition-all duration-300 ${
                          plan.highlighted ? 'paint-button' : 'border-2 border-border hover:border-primary'
                        }`}
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
                            {plan.highlighted ? (
                              <Zap className="mr-2 h-4 w-4" />
                            ) : (
                              <Palette className="mr-2 h-4 w-4" />
                            )}
                            {plan.price === 0 ? '選択済み' : 'このプランを選択'}
                          </>
                        )}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              )
            })}
          </div>

          {/* FAQ セクション */}
          <Card className="paint-card shadow-lg">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl">
                  <Paintbrush className="h-8 w-8 text-accent" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold paint-text">よくある質問</CardTitle>
              <CardDescription className="text-base">
                Paintlyの料金プランについてお答えします
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-1 bg-primary/10 rounded-full">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-bold text-foreground">プランはいつでも変更できますか？</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed ml-6">
                    はい、いつでも<span className="font-semibold text-primary">アップグレード・ダウングレード</span>が可能です。
                    変更は即座に反映されます。
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-1 bg-accent/10 rounded-full">
                      <Droplet className="h-4 w-4 text-accent" />
                    </div>
                    <h3 className="font-bold text-foreground">生成回数はどのようにカウントされますか？</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed ml-6">
                    画像を1回生成するごとに<span className="font-semibold text-accent">1回としてカウント</span>されます。
                    月初にリセットされます。
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-1 bg-primary/10 rounded-full">
                      <Star className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-bold text-foreground">無料トライアルはありますか？</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed ml-6">
                    新規登録時に<span className="font-semibold text-primary">3回まで無料</span>で画像生成をお試しいただけます。
                    営業効果をご実感ください。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}