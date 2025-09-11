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
  let supabase
  let user
  
  try {
    supabase = await createClient()
  } catch (error) {
    console.error('Failed to create Supabase client:', error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-lg w-full mx-4">
          <CardHeader>
            <CardTitle>設定エラー</CardTitle>
            <CardDescription>
              システムの設定に問題があります。管理者にお問い合わせください。
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  try {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error('Auth error in dashboard:', authError)
      throw new Error('Authentication failed')
    }

    if (!authUser) {
      throw new Error('User not found')
    }
    
    user = authUser

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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">ダッシュボード</h1>
        <p className="text-muted-foreground mt-2">
          Paintlyで塗装シミュレーションを管理しましょう
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              顧客数
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              登録済み顧客
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              生成回数
            </CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGenerations}</div>
            <p className="text-xs text-muted-foreground">
              完了した生成
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              残り生成回数
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{remainingGenerations}</div>
            <p className="text-xs text-muted-foreground">
              {planInfo?.plan ? (planInfo.plan as any).name : '無料プラン'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              プラン
            </CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
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

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>クイックスタート</CardTitle>
            <CardDescription>
              塗装シミュレーションを開始しましょう
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4 rounded-lg border p-4">
              <Palette className="h-8 w-8 text-blue-600" />
              <div className="flex-1">
                <h3 className="font-semibold">新規シミュレーション</h3>
                <p className="text-sm text-muted-foreground">
                  建物の写真をアップロードして色を変更
                </p>
              </div>
              <Button onClick={() => {
                const sidebar = document.querySelector('[data-new-customer-btn]')
                if (sidebar) {
                  (sidebar as HTMLButtonElement).click()
                }
              }}>
                開始
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>最近の生成</CardTitle>
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
                    <Clock className="h-4 w-4 text-muted-foreground" />
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

      <Card>
        <CardHeader>
          <CardTitle>使い方ガイド</CardTitle>
          <CardDescription>
            Paintlyの基本的な使い方
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4 text-sm">
            <li className="flex items-start">
              <span className="mr-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
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
              <span className="mr-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
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
              <span className="mr-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
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
              <span className="mr-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
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
        <Card className="max-w-lg w-full mx-4">
          <CardHeader>
            <CardTitle>エラーが発生しました</CardTitle>
            <CardDescription>
              ダッシュボードの読み込み中にエラーが発生しました。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth/signin">
              <Button className="w-full">ログインページへ</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }
}