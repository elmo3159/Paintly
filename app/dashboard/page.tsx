export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Palette, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { StatsCards } from '@/components/dashboard-stats-cards'
import { RecentGenerations } from '@/components/dashboard-recent-generations'
import {
  StatsCardsSkeleton,
  RecentGenerationsSkeleton,
  QuickStartSkeleton
} from '@/components/dashboard-skeleton'

export default async function DashboardPage() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error('Authentication failed')
    }

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

        <div className="relative z-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight paint-text mb-2">ダッシュボード</h1>
          <p className="text-muted-foreground/80 mt-2 text-lg">
            Paintlyで塗装シミュレーションを管理しましょう
          </p>
        </div>

        {/* 統計カード - Suspenseで非同期レンダリング */}
        <div className="relative z-10">
          <Suspense fallback={<StatsCardsSkeleton />}>
            <StatsCards />
          </Suspense>
        </div>

        <div className="grid gap-6 md:grid-cols-2 relative z-10">
          {/* クイックスタート */}
          <Card className="paint-card">
            <CardHeader>
              <CardTitle className="paint-text text-lg sm:text-xl md:text-2xl min-w-0">クイックスタート</CardTitle>
              <CardDescription>
                塗装シミュレーションを開始しましょう
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 rounded-lg border p-4">
                <Palette className="h-8 w-8 text-primary animate-pulse" />
                <div className="flex-1">
                  <h3 className="font-semibold text-sm sm:text-base">新規シミュレーション</h3>
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

          {/* 最近の生成 - Suspenseで非同期レンダリング */}
          <Suspense fallback={<RecentGenerationsSkeleton />}>
            <RecentGenerations />
          </Suspense>
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