export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Users,
  Image,
  TrendingUp,
  Clock,
  Palette,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error('Authentication failed')
    }

    // Get user's statistics - with error handling
    const [customersData, generationsData, subscriptionData] = await Promise.all([
      supabase
        .from('customer_pages')
        .select('id')
        .eq('user_id', user.id),
      supabase
        .from('generations')
        .select('id, created_at')
        .eq('user_id', user.id)
        .eq('status', 'completed'),
      supabase
        .from('subscriptions')
        .select(`
          generation_count,
          plan:plans (
            name,
            generation_limit
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle()
    ])

    // Check for errors in queries
    if (customersData.error) {
      console.error('Error fetching customers:', customersData.error)
    }
    if (generationsData.error) {
      console.error('Error fetching generations:', generationsData.error)
    }
    if (subscriptionData.error) {
      console.error('Error fetching subscription:', subscriptionData.error)
    }

    const totalCustomers = customersData.data?.length || 0
    const totalGenerations = generationsData.data?.length || 0
    const planInfo = subscriptionData.data
    const remainingGenerations = planInfo?.plan
      ? (planInfo.plan as any).generation_limit - planInfo.generation_count
      : 0

    // Get recent generations
    const recentGenerations = generationsData.data?.slice(0, 5) || []

    return (
      <div className="space-y-8 workshop-bg">
        {/* Paint Drips at Top */}
        <div className="paint-drips"></div>

        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-24 h-24 opacity-5 rotate-12">
            <Palette className="w-full h-full text-primary" />
          </div>
          <div className="absolute bottom-32 left-16 w-16 h-16 opacity-5 -rotate-12">
            <Sparkles className="w-full h-full text-accent" />
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold tracking-tight paint-text mb-2">ダッシュボード</h1>
          <p className="text-muted-foreground/80 mt-2 text-lg">
            Paintlyで塗装シミュレーションを管理しましょう
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 relative z-10">
          <Card className="paint-card hover:scale-105 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary">
                顧客数
              </CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCustomers}</div>
              <p className="text-xs text-muted-foreground">
                登録済み顧客
              </p>
            </CardContent>
          </Card>

          <Card className="paint-card hover:scale-105 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary">
                生成回数
              </CardTitle>
              <Image className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalGenerations}</div>
              <p className="text-xs text-muted-foreground">
                完了した生成
              </p>
            </CardContent>
          </Card>

          <Card className="paint-card hover:scale-105 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary">
                残り生成回数
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{remainingGenerations}</div>
              <p className="text-xs text-muted-foreground">
                {planInfo?.plan ? (planInfo.plan as any).name : '無料プラン'}
              </p>
            </CardContent>
          </Card>

          <Card className="paint-card hover:scale-105 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary">
                プラン
              </CardTitle>
              <Sparkles className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {planInfo?.plan ? (planInfo.plan as any).name : '無料'}
              </div>
              {remainingGenerations === 0 && (
                <Link href="/billing">
                  <p className="text-xs text-blue-600 hover:underline">
                    アップグレード
                  </p>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 relative z-10">
          <Card className="paint-card">
            <CardHeader>
              <CardTitle className="paint-text text-lg sm:text-xl md:text-2xl whitespace-nowrap min-w-0">クイックスタート</CardTitle>
              <CardDescription>
                塗装シミュレーションを開始しましょう
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 rounded-lg border p-4">
                <Palette className="h-8 w-8 text-primary animate-pulse" />
                <div className="flex-1">
                  <h3 className="font-semibold text-sm sm:text-base whitespace-nowrap">新規シミュレーション</h3>
                  <p className="text-sm text-muted-foreground">
                    建物の写真をアップロードして色を変更
                  </p>
                </div>
                <Link href="/customer/new">
                  <Button className="paint-button">
                    開始
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="paint-card">
            <CardHeader>
              <CardTitle className="paint-text text-lg sm:text-xl md:text-2xl whitespace-nowrap min-w-0">最近の生成</CardTitle>
              <CardDescription>
                最近生成したシミュレーション
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentGenerations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  まだ生成履歴がありません
                </p>
              ) : (
                <div className="space-y-2">
                  {recentGenerations.map((generation: any) => (
                    <div key={generation.id} className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-accent" />
                      <span className="text-sm">
                        {new Date(generation.created_at).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="paint-card relative z-10">
          <CardHeader>
            <CardTitle className="paint-text">使い方ガイド</CardTitle>
            <CardDescription>
              Paintlyの基本的な使い方
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4 text-sm">
              <li className="flex items-start">
                <span className="mr-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                  1
                </span>
                <div>
                  <p className="font-medium">顧客ページを作成</p>
                  <p className="text-muted-foreground">
                    サイドバーの「新規顧客ページ」ボタンをクリック
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="mr-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                  2
                </span>
                <div>
                  <p className="font-medium">建物の写真をアップロード</p>
                  <p className="text-muted-foreground">
                    正面からの写真、必要に応じて横からの写真も追加
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="mr-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                  3
                </span>
                <div>
                  <p className="font-medium">色を選択</p>
                  <p className="text-muted-foreground">
                    壁、屋根、ドアの色を日塗工番号から選択
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="mr-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                  4
                </span>
                <div>
                  <p className="font-medium">シミュレーション生成</p>
                  <p className="text-muted-foreground">
                    AIが塗装後の仕上がりを瞬時に生成
                  </p>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    console.error('Error in dashboard:', error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-lg w-full mx-4 paint-card">
          <CardHeader>
            <CardTitle>エラーが発生しました</CardTitle>
            <CardDescription>
              ダッシュボードの読み込み中にエラーが発生しました。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth/signin">
              <Button className="w-full paint-button">ログインページへ</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }
}