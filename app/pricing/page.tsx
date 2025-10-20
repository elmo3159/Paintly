'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Check, Loader2, Star, Zap, Crown, Rocket, Building2, Infinity } from 'lucide-react'

interface Plan {
  id: string
  name: string
  slug: string
  price: number
  generation_limit: number
  storage_months: number
  description: string | null
  features: string[] | null
  stripe_price_id: string | null
  sort_order: number
}

export default function PricingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // URLパラメータをチェック
    if (searchParams.get('success') === 'true') {
      setSuccess(true)
    } else if (searchParams.get('canceled') === 'true') {
      setError('決済がキャンセルされました。')
    }

    fetchPlans()
  }, [searchParams])

  const fetchPlans = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (fetchError) throw fetchError

      setPlans(data || [])
    } catch (err) {
      console.error('Plans fetch error:', err)
      setError('プラン情報の取得に失敗しました。')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectPlan = async (plan: Plan) => {
    // 無料プランの場合はダッシュボードに遷移
    if (plan.slug === 'free' || plan.price === 0) {
      router.push('/dashboard')
      return
    }

    // Stripe Price IDがない場合はエラー
    if (!plan.stripe_price_id) {
      setError('このプランは現在利用できません。')
      return
    }

    setCheckoutLoading(plan.id)
    setError(null)

    try {
      // ユーザー認証チェック
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/signin?redirect=/pricing')
        return
      }

      // Checkout Session作成
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.stripe_price_id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'セッションの作成に失敗しました')
      }

      // Stripeの決済ページにリダイレクト
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('決済URLの取得に失敗しました')
      }

    } catch (err) {
      console.error('Checkout error:', err)
      setError(err instanceof Error ? err.message : '決済処理に失敗しました')
      setCheckoutLoading(null)
    }
  }

  const getPlanIcon = (slug: string) => {
    switch (slug) {
      case 'free':
        return <Star className="h-8 w-8 text-primary" />
      case 'light':
        return <Zap className="h-8 w-8 text-accent" />
      case 'standard':
        return <Crown className="h-8 w-8 text-primary" />
      case 'pro':
        return <Rocket className="h-8 w-8 text-accent" />
      case 'business':
        return <Building2 className="h-8 w-8 text-primary" />
      case 'lifetime':
        return <Infinity className="h-8 w-8 text-accent" />
      default:
        return <Star className="h-8 w-8 text-primary" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-primary/10">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-primary/10 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            料金プラン
          </h1>
          <p className="text-lg text-white">
            あなたのビジネスに最適なプランをお選びください
          </p>
        </div>

        {/* アラート表示 */}
        {success && (
          <Alert className="mb-8 border-primary/20 bg-primary/5">
            <Check className="h-4 w-4 text-primary" />
            <AlertDescription className="text-primary">
              決済が完了しました！ダッシュボードでご確認ください。
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* プランカード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card key={plan.id} className={`paint-card relative ${plan.slug === 'standard' ? 'border-primary/50 shadow-xl' : ''}`}>
              {plan.slug === 'standard' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold">
                  人気
                </div>
              )}

              <CardHeader>
                <div className="flex justify-center mb-4">
                  {getPlanIcon(plan.slug)}
                </div>
                <CardTitle className="text-2xl text-center">{plan.name}</CardTitle>
                <CardDescription className="text-center">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="text-center mb-6">
                  <span className="text-4xl font-bold text-primary">
                    {plan.price === 0 ? '無料' : `¥${plan.price.toLocaleString()}`}
                  </span>
                  {plan.price > 0 && <span className="text-muted-foreground">/月</span>}
                </div>

                <div className="space-y-3">
                  {plan.features && plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full paint-button"
                  onClick={() => handleSelectPlan(plan)}
                  disabled={checkoutLoading === plan.id}
                >
                  {checkoutLoading === plan.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      処理中...
                    </>
                  ) : (
                    <>
                      {plan.slug === 'free' ? 'ダッシュボードへ' : 'プランを選択'}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* フッター */}
        <div className="text-center mt-12 space-y-3">
          <p className="text-sm text-muted-foreground">
            プランはいつでも変更・キャンセル可能です
          </p>
          <p className="text-sm">
            <Link
              href="/faq"
              className="text-primary hover:text-primary/80 underline decoration-dotted underline-offset-4 transition-colors font-medium"
            >
              よくある質問を見る
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
