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

export default function TestDashboardPage() {
  // Mock data for testing
  const totalCustomers = 5
  const totalGenerations = 12
  const remainingGenerations = 3
  const planInfo = { plan: { name: '無料プラン' } }

  return (
    <div className="space-y-8 workshop-bg p-4">
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
        <h1 className="text-4xl font-bold tracking-tight paint-text mb-2">ダッシュボード（テスト用）</h1>
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
              <Button className="paint-button">
                開始
              </Button>
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
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-accent" />
                <span className="text-sm">
                  2025/09/28
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-accent" />
                <span className="text-sm">
                  2025/09/27
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}