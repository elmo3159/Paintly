import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Image, TrendingUp, Sparkles } from 'lucide-react'
import Link from 'next/link'

export async function StatsCards() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // 並列フェッチで統計データを取得
  const [customersData, generationsData, subscriptionData] = await Promise.all([
    supabase
      .from('customer_pages')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id),
    supabase
      .from('generations')
      .select('id', { count: 'exact', head: true })
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

  const totalCustomers = customersData.count || 0
  const totalGenerations = generationsData.count || 0
  const planInfo = subscriptionData.data
  const remainingGenerations = planInfo?.plan
    ? (planInfo.plan as any).generation_limit - planInfo.generation_count
    : 0

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
  )
}