'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Check, Loader2, Star, Zap, Crown, Rocket, Building2, Infinity, Home } from 'lucide-react'

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
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchPlans()
  }, [])

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
        {/* ホームリンク */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white font-medium transition-colors"
          >
            <Home className="h-5 w-5" />
            ホームに戻る
          </Link>
        </div>

        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            料金プラン
          </h1>
          <p className="text-lg text-white">
            あなたのビジネスに最適なプランをお選びください
          </p>
          <p className="text-sm text-white/80 mt-2">
            まずは無料登録から始めましょう
          </p>
        </div>

        {/* アラート表示 */}
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
                <Link href="/auth/signup" className="w-full">
                  <Button className="w-full paint-button">
                    無料で始める
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* フッター */}
        <div className="text-center mt-12 space-y-3">
          <p className="text-sm text-white/80">
            無料プランで3回まで試せます。登録後、有料プランはいつでも変更・キャンセル可能です
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
