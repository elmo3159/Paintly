'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Palette,
  Paintbrush,
  Droplet,
  Star,
  Zap,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  ArrowRight,
  ArrowDown,
  Users,
  Target,
  Smartphone,
  Clock,
  Award,
  Building2,
  Loader2,
  Camera,
  Sparkles,
  Heart,
  ChevronRight
} from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const supabase = createClient()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          // ログイン済みの場合はダッシュボードへリダイレクト
          router.push('/dashboard')
        } else {
          // 未ログインの場合はランディングページを表示
          setIsChecking(false)
        }
      } catch (error) {
        console.error('Auth check error:', error)
        // エラーが発生してもランディングページを表示
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [router, supabase.auth])

  // 認証チェック中はローディング表示
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-primary/10">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-primary/10 relative overflow-x-hidden">
      <div className="relative z-10">
        {/* ヒーローセクション */}
        <section className="w-full pt-3 md:pt-4 pb-4 md:pb-6">
          <div className="w-full text-center space-y-2 md:space-y-3">
            {/* ロゴとブランディング */}
            <div className="flex justify-center mb-1 px-4">
              <Image
                src="/logo.png"
                alt="Paintly"
                width={142}
                height={80}
                priority={true}
                className="h-16 md:h-20 w-auto object-contain"
                sizes="(max-width: 768px) 142px, 142px"
              />
            </div>

            {/* メインタイトル */}
            <div className="space-y-2 md:space-y-3 px-4">
              <h1 className="text-lg md:text-2xl font-bold text-foreground px-3 py-1.5 md:px-4 md:py-1.5 rounded-lg bg-white/80 backdrop-blur-sm shadow-lg inline-block">
                営業成約率を劇的に向上させる<br />
                塗装シミュレーション
              </h1>
            </div>

            {/* スライダーデモ動画と使用方法 */}
            <div className="w-full mt-2 md:mt-3 px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-6xl mx-auto">
                {/* 左側：スライダー動画 */}
                <div className="space-y-2">
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full aspect-video object-cover rounded-lg shadow-lg"
                  >
                    <source src="/demo/slider-demo.mp4" type="video/mp4" />
                    お使いのブラウザは動画に対応していません。
                  </video>
                  <p className="text-xs md:text-sm text-muted-foreground text-center font-medium">
                    スライダーで簡単にビフォー・アフターを比較
                  </p>
                </div>

                {/* 右側：使用方法 */}
                <div className="space-y-2 md:space-y-3">
                  <h3 className="text-base md:text-lg font-bold text-center text-foreground">簡単4ステップ</h3>
                  <div className="grid grid-cols-2 gap-3 md:gap-4 relative">
                    {/* 左上：写真を撮る */}
                    <div className="relative bg-white/90 backdrop-blur-sm rounded-lg p-3 md:p-4 shadow-md border border-primary/20">
                      <div className="flex flex-col items-center gap-1.5 md:gap-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Camera className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                        </div>
                        <p className="text-xs md:text-sm font-semibold text-center text-foreground">現場で写真を撮る</p>
                      </div>
                      {/* 右向き矢印 */}
                      <ArrowRight className="absolute -right-2 md:-right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 md:w-6 md:h-6 text-primary drop-shadow-lg" />
                    </div>

                    {/* 右上：色を選ぶ */}
                    <div className="relative bg-white/90 backdrop-blur-sm rounded-lg p-3 md:p-4 shadow-md border border-primary/20">
                      <div className="flex flex-col items-center gap-1.5 md:gap-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Palette className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                        </div>
                        <p className="text-xs md:text-sm font-semibold text-center text-foreground">色を選ぶ</p>
                      </div>
                      {/* 左下向き斜め矢印 */}
                      <ArrowDown className="absolute -left-2 md:-left-3.5 -bottom-2 md:-bottom-3.5 w-4 h-4 md:w-6 md:h-6 text-primary drop-shadow-lg rotate-45" />
                    </div>

                    {/* 左下：作成ボタンを押す */}
                    <div className="relative bg-white/90 backdrop-blur-sm rounded-lg p-3 md:p-4 shadow-md border border-primary/20">
                      <div className="flex flex-col items-center gap-1.5 md:gap-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                        </div>
                        <p className="text-xs md:text-sm font-semibold text-center text-foreground">作成ボタンを押す</p>
                      </div>
                      {/* 右向き矢印 */}
                      <ArrowRight className="absolute -right-2 md:-right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 md:w-6 md:h-6 text-primary drop-shadow-lg" />
                    </div>

                    {/* 右下：お客様に見せる */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 md:p-4 shadow-md border border-primary/20">
                      <div className="flex flex-col items-center gap-1.5 md:gap-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Users className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                        </div>
                        <p className="text-xs md:text-sm font-semibold text-center text-foreground">お客様に見せる</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-3xl mx-auto mt-1.5 md:mt-2 px-4">
              建物の写真を撮るだけで、瞬時に塗装後の仕上がりを生成。<br />
              お客様の理想を<span className="font-bold text-primary">その場で可視化</span>し、成約率を大幅にアップします。
            </p>

            {/* CTAボタン */}
            <div className="flex flex-col sm:flex-row gap-2 md:gap-2.5 justify-center items-center mt-2 md:mt-3 px-4">
              <Link href="/auth/signup">
                <Button className="paint-button text-sm md:text-sm px-5 md:px-7 py-2 md:py-2.5 h-auto font-bold shadow-2xl w-full sm:w-auto">
                  <Star className="mr-1.5 h-3.5 w-3.5" />
                  無料で始める
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button variant="outline" className="text-sm md:text-sm px-5 md:px-7 py-2 md:py-2.5 h-auto font-bold border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 w-full sm:w-auto">
                  <Palette className="mr-1.5 h-3.5 w-3.5" />
                  ログインして続ける
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* キャッチフレーズセクション */}
        <section className="w-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-20 md:py-32 relative overflow-hidden">
          {/* 背景装飾 */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 text-center">
            <div className="space-y-6 md:space-y-8">
              <p className="text-orange-400 font-bold text-base md:text-lg tracking-wider uppercase">
                The Moment of Truth
              </p>

              <h2 className="text-3xl md:text-5xl lg:text-7xl font-bold text-white leading-tight">
                「この家に住みたい」
              </h2>

              <p className="text-2xl md:text-4xl lg:text-5xl font-bold text-white/90 leading-tight">
                お客様がそう思った瞬間、<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400">
                  営業は終わっている。
                </span>
              </p>

              <div className="pt-6 md:pt-8">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                  <Heart className="w-5 h-5 text-pink-400 animate-pulse" />
                  <span className="text-white/90 text-sm md:text-base">
                    感動が、購買決定を生む
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 対比セクション */}
        <section className="w-full bg-gradient-to-br from-slate-50 to-gray-100 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">
                なぜ、その場で見せると成約率が上がるのか？
              </h2>
              <p className="text-base md:text-lg text-muted-foreground">
                従来の営業との決定的な違い
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {/* 従来の営業 - Red Theme */}
              <div className="relative">
                <div className="absolute -top-3 -left-3 bg-red-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg z-10">
                  従来の営業
                </div>
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl border-2 border-red-100 h-full">
                  <div className="space-y-6 md:space-y-8">
                    {/* Step 1: 持ち帰り */}
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <Clock className="w-6 h-6 text-red-600" />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-bold text-lg mb-2">カタログを持ち帰り</h3>
                        <p className="text-sm text-muted-foreground">「検討します」の一言で終了</p>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex justify-center">
                      <ChevronRight className="w-8 h-8 text-red-300 rotate-90" />
                    </div>

                    {/* Step 2: 時間経過 */}
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <TrendingDown className="w-6 h-6 text-red-600" />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-bold text-lg mb-2">時間経過で熱量低下</h3>
                        <p className="text-sm text-muted-foreground">興味が薄れ、想像力も減衰</p>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex justify-center">
                      <ChevronRight className="w-8 h-8 text-red-300 rotate-90" />
                    </div>

                    {/* Step 3: 競合比較 */}
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-red-600" />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-bold text-lg mb-2">他社と比較検討</h3>
                        <p className="text-sm text-muted-foreground">価格競争に巻き込まれる</p>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex justify-center">
                      <ChevronRight className="w-8 h-8 text-red-300 rotate-90" />
                    </div>

                    {/* Step 4: 失注 */}
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                        <XCircle className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-bold text-lg mb-2 text-red-600">連絡がこない</h3>
                        <p className="text-sm text-muted-foreground">成約率20〜30%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Paintly営業 - Green Theme */}
              <div className="relative">
                <div className="absolute -top-3 -left-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg z-10">
                  Paintly営業
                </div>
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl border-2 border-green-100 h-full">
                  <div className="space-y-6 md:space-y-8">
                    {/* Step 1: その場で撮影 */}
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Camera className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-bold text-lg mb-2">その場で建物を撮影</h3>
                        <p className="text-sm text-muted-foreground">わずか30秒で準備完了</p>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex justify-center">
                      <ChevronRight className="w-8 h-8 text-green-300 rotate-90" />
                    </div>

                    {/* Step 2: 瞬時に生成 */}
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-bold text-lg mb-2">AI瞬時に生成</h3>
                        <p className="text-sm text-muted-foreground">複数パターンを即座に提案</p>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex justify-center">
                      <ChevronRight className="w-8 h-8 text-green-300 rotate-90" />
                    </div>

                    {/* Step 3: 感動体験 */}
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Heart className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-bold text-lg mb-2">その場で感動体験</h3>
                        <p className="text-sm text-muted-foreground">「この色いいですね！」</p>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex justify-center">
                      <ChevronRight className="w-8 h-8 text-green-300 rotate-90" />
                    </div>

                    {/* Step 4: 即決成約 */}
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-bold text-lg mb-2 text-green-600">熱量MAXで即決</h3>
                        <p className="text-sm text-muted-foreground">成約率60〜80%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 統計データ */}
            <div className="mt-12 md:mt-16 text-center">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full shadow-xl">
                <Sparkles className="w-5 h-5 text-white" />
                <span className="text-white font-bold text-sm md:text-base">
                  営業担当者の87%が「お客様の反応が変わった」と実感
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
