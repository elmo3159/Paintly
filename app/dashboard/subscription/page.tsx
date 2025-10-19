'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Loader2, CreditCard, Calendar, Check, AlertCircle, ArrowRight } from 'lucide-react'

interface SubscriptionData {
  id: string
  status: string
  plan: {
    name: string
    price: number
    generation_limit: number
    storage_months: number
  }
  generation_count: number
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
}

export default function SubscriptionPage() {
  const router = useRouter()
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchSubscription()
  }, [])

  const fetchSubscription = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        router.push('/auth/signin')
        return
      }

      const { data, error: fetchError } = await supabase
        .from('subscriptions')
        .select(`
          id,
          status,
          generation_count,
          current_period_start,
          current_period_end,
          cancel_at_period_end,
          plan:plans (
            name,
            price,
            generation_limit,
            storage_months
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (fetchError) {
        console.error('Subscription fetch error:', fetchError)
        // アクティブなサブスクリプションがない場合
        setSubscription(null)
      } else {
        setSubscription(data as any)
      }

    } catch (err) {
      console.error('Error:', err)
      setError('サブスクリプション情報の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePlan = () => {
    router.push('/pricing')
  }

  const handleCancelSubscription = async () => {
    if (!confirm('本当にサブスクリプションをキャンセルしますか？\n現在の期間終了時にキャンセルされます。')) {
      return
    }

    setCancelLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'キャンセルに失敗しました')
      }

      alert('サブスクリプションをキャンセルしました。現在の期間終了時まで利用可能です。')
      fetchSubscription()

    } catch (err) {
      console.error('Cancel error:', err)
      setError(err instanceof Error ? err.message : 'キャンセル処理に失敗しました')
    } finally {
      setCancelLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  // サブスクリプションがない場合
  if (!subscription) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Card className="paint-card">
          <CardHeader>
            <CardTitle>サブスクリプション管理</CardTitle>
            <CardDescription>現在アクティブなプランがありません</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                プランをご契約いただくと、より多くの画像生成が可能になります。
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push('/pricing')} className="paint-button">
              <ArrowRight className="mr-2 h-4 w-4" />
              プランを選択
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // 生成回数の進捗率
  const generationProgress = subscription.plan.generation_limit === -1
    ? 0
    : (subscription.generation_count / subscription.plan.generation_limit) * 100

  const remainingGenerations = subscription.plan.generation_limit === -1
    ? '無制限'
    : subscription.plan.generation_limit - subscription.generation_count

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">サブスクリプション管理</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 現在のプラン */}
      <Card className="paint-card mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5 text-primary" />
            現在のプラン
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-2xl font-bold">{subscription.plan.name}</h3>
              <span className="text-2xl font-bold text-primary">
                ¥{subscription.plan.price.toLocaleString()}/月
              </span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Check className="h-4 w-4 mr-1 text-primary" />
              {subscription.plan.generation_limit === -1
                ? '生成回数無制限'
                : `月${subscription.plan.generation_limit}回の生成`}
              <span className="mx-2">•</span>
              <Check className="h-4 w-4 mr-1 text-primary" />
              {subscription.plan.storage_months === -1
                ? '永久保存'
                : `${subscription.plan.storage_months}ヶ月保存`}
            </div>
          </div>

          {/* 生成回数の進捗 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">今月の生成回数</span>
              <span className="text-sm font-medium">
                {subscription.generation_count} / {subscription.plan.generation_limit === -1 ? '∞' : subscription.plan.generation_limit}
              </span>
            </div>
            {subscription.plan.generation_limit !== -1 && (
              <>
                <Progress value={generationProgress} className="h-2 mb-1" />
                <p className="text-xs text-muted-foreground">
                  残り {remainingGenerations} 回の生成が可能です
                </p>
              </>
            )}
          </div>

          {/* 期間情報 */}
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span>
              {new Date(subscription.current_period_start).toLocaleDateString('ja-JP')} ～{' '}
              {new Date(subscription.current_period_end).toLocaleDateString('ja-JP')}
            </span>
          </div>

          {/* キャンセル予定の表示 */}
          {subscription.cancel_at_period_end && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                このサブスクリプションは {new Date(subscription.current_period_end).toLocaleDateString('ja-JP')} に終了予定です
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleChangePlan}
            className="paint-hover"
          >
            プランを変更
          </Button>
          {!subscription.cancel_at_period_end && (
            <Button
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={cancelLoading}
            >
              {cancelLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  処理中...
                </>
              ) : (
                'キャンセル'
              )}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* サブスクリプションステータス */}
      <Card className="paint-card">
        <CardHeader>
          <CardTitle className="text-lg">ステータス</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              subscription.status === 'active' ? 'bg-green-500' :
              subscription.status === 'past_due' ? 'bg-yellow-500' :
              'bg-red-500'
            }`} />
            <span className="font-medium">
              {subscription.status === 'active' ? 'アクティブ' :
               subscription.status === 'past_due' ? '支払い遅延' :
               subscription.status === 'canceled' ? 'キャンセル済み' :
               subscription.status}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
