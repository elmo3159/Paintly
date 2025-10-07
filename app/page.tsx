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
  CheckCircle,
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
  Sparkles
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
      </div>
    </div>
  )
}
