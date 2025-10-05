'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { pricingPlans, type PricingPlan } from '@/lib/pricing-plans'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Loader2, Sparkles, AlertCircle, Palette, Droplet, Paintbrush, Star, Crown, Zap, TrendingUp, Building2, Factory, ArrowLeft } from 'lucide-react'
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
      <div className="fixed inset-0 bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <Crown className="h-16 w-16 text-gray-900 animate-pulse mx-auto" />
            <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-gray-600 animate-bounce" />
          </div>
          <p className="text-gray-900 font-medium text-lg">プランを読み込み中...</p>
        </div>
      </div>
    )
  }

  // プランごとのアイコンを定義
  const planIcons = {
    free: Star,
    light: Paintbrush,
    standard: Building2,
    pro: TrendingUp,
    business: Factory
  }

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col">
      {/* 戻るボタン付きヘッダー */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto max-w-7xl px-4 py-3">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            ダッシュボードに戻る
          </Button>
        </div>
      </div>

      {/* スクロール可能なメインコンテンツ */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8 pb-20 max-w-7xl">
          <div className="space-y-10">
            {/* ヘッダーセクション */}
            <div className="text-center space-y-6">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="p-4 bg-white rounded-2xl shadow-lg border border-gray-200">
                    <Crown className="h-16 w-16 text-gray-900" />
                  </div>
                  <Star className="absolute -top-2 -right-2 h-8 w-8 text-gray-600 animate-pulse" />
                </div>
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
                  Paintlyプラン
                </h1>
                <h2 className="text-xl md:text-2xl font-bold text-gray-700">
                  営業成約率を劇的に向上させる
                </h2>
                <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
                  塗装業界に特化したAI画像生成で、<br className="hidden md:block" />
                  お客様の理想を瞬時に可視化。<span className="text-gray-900 font-semibold">あなたのビジネス</span>に最適なプランをお選びください。
                </p>
              </div>
            </div>

            {/* アラート表示 */}
            {!stripeConfigured && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 shadow-sm max-w-3xl mx-auto">
                <div className="flex items-start space-x-3">
                  <Palette className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-yellow-800">
                    <strong className="font-bold">開発モード:</strong> Stripe決済機能は設定されていません。実際の決済を行うには管理者にお問い合わせください。
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm max-w-3xl mx-auto">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-800 font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* プランカードグリッド */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 pt-4">
              {pricingPlans.map((plan) => {
                const IconComponent = planIcons[plan.id as keyof typeof planIcons] || Palette

                return (
                  <div
                    key={plan.id}
                    className={`relative bg-white border border-gray-200 rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                      plan.highlighted ? 'ring-2 ring-gray-900 scale-105' : ''
                    }`}
                  >
                    {plan.highlighted && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                        <Badge className="bg-gray-900 text-white border-0 shadow-lg font-bold px-4 py-1">
                          <Crown className="h-3 w-3 mr-1" />
                          おすすめ
                        </Badge>
                      </div>
                    )}

                    <div className="p-6 text-center">
                      <div className="flex justify-center mb-4">
                        <div className="relative">
                          <div className={`p-3 rounded-xl shadow-lg ${
                            plan.highlighted
                              ? 'bg-gray-900'
                              : 'bg-gray-100'
                          }`}>
                            <IconComponent className={`h-10 w-10 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`} />
                          </div>
                          {plan.highlighted && (
                            <Droplet className="absolute -top-1 -right-1 h-5 w-5 text-gray-600 animate-bounce" />
                          )}
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-6">{plan.description}</p>

                      <div className="mb-6">
                        <div className="flex items-baseline justify-center">
                          <span className="text-4xl md:text-5xl font-bold text-gray-900">
                            ¥{plan.price.toLocaleString()}
                          </span>
                          {plan.price > 0 && (
                            <span className="text-gray-600 text-base ml-1">/月</span>
                          )}
                        </div>
                        {plan.price === 0 && (
                          <p className="text-gray-900 font-semibold text-sm mt-2">
                            <Star className="inline h-3 w-3 mr-1" />
                            3回まで無料！
                          </p>
                        )}
                      </div>

                      <ul className="space-y-3 mb-6 text-left">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start space-x-2">
                            <div className="flex-shrink-0 mt-0.5">
                              <div className="p-1 rounded-full bg-gray-100">
                                <Check className="h-3 w-3 text-gray-900" />
                              </div>
                            </div>
                            <span className="text-sm text-gray-700 leading-relaxed">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {currentPlan === plan.id ? (
                        <Button
                          className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold shadow-lg hover:shadow-xl transition-all"
                          onClick={handleManageSubscription}
                        >
                          <Crown className="mr-2 h-4 w-4" />
                          現在のプラン
                        </Button>
                      ) : (
                        <Button
                          className={`w-full font-bold shadow-lg hover:shadow-xl transition-all ${
                            plan.highlighted
                              ? 'bg-gray-900 hover:bg-gray-800 text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300'
                          }`}
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
                    </div>
                  </div>
                )
              })}
            </div>

            {/* FAQ セクション */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 md:p-8 text-center border-b border-gray-200">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-gray-100 rounded-xl">
                    <Paintbrush className="h-8 w-8 text-gray-900" />
                  </div>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">よくある質問</h2>
                <p className="text-gray-600">
                  Paintlyの料金プランについてお答えします
                </p>
              </div>
              <div className="p-6 md:p-8">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-gray-100 rounded-full">
                        <TrendingUp className="h-4 w-4 text-gray-900" />
                      </div>
                      <h3 className="font-bold text-gray-900">プランはいつでも変更できますか？</h3>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed ml-7">
                      はい、いつでも<span className="font-semibold text-gray-900">アップグレード・ダウングレード</span>が可能です。
                      変更は即座に反映されます。
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-gray-100 rounded-full">
                        <Droplet className="h-4 w-4 text-gray-900" />
                      </div>
                      <h3 className="font-bold text-gray-900">生成回数はどのようにカウントされますか？</h3>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed ml-7">
                      画像を1回生成するごとに<span className="font-semibold text-gray-900">1回としてカウント</span>されます。
                      月初にリセットされます。
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-gray-100 rounded-full">
                        <Star className="h-4 w-4 text-gray-900" />
                      </div>
                      <h3 className="font-bold text-gray-900">無料トライアルはありますか？</h3>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed ml-7">
                      新規登録時に<span className="font-semibold text-gray-900">3回まで無料</span>で画像生成をお試しいただけます。
                      営業効果をご実感ください。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
