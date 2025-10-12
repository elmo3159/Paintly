'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ChevronDown, Star, Palette, Loader2, Heart, TrendingDown, CheckCircle, XCircle, Clock, Users, Camera, Sparkles, ChevronRight } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const supabase = createClient()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          router.push('/dashboard')
        } else {
          setIsChecking(false)
        }
      } catch (error) {
        console.error('Auth check error:', error)
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [router, supabase.auth])

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
    <div className="w-full">
      {/* 第1画面: ヒーローセクション（背景動画） */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* 背景動画 */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/demo/slider-demo.mp4" type="video/mp4" />
        </video>

        {/* ダークオーバーレイ */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* コンテンツ */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center">
          {/* ロゴ */}
          <Image
            src="/logo.png"
            alt="Paintly"
            width={284}
            height={160}
            priority={true}
            className="h-20 md:h-24 w-auto object-contain mb-6"
          />

          {/* バッジ */}
          <div className="mb-6">
            <span className="inline-flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
              <Star className="h-4 w-4" />
              一瞬で140色の高精度なシミュレーション
            </span>
          </div>

          {/* メインタイトル */}
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            営業成約率を劇的に向上させる<br />
            塗装シミュレーション
          </h1>

          {/* 説明文 */}
          <p className="text-base md:text-lg text-white/90 max-w-2xl mb-8 leading-relaxed">
            建物の写真を撮るだけで、瞬時に塗装後の仕上がりを生成。<br />
            お客様の理想を<span className="text-orange-500 font-bold">その場で可視化</span>し、成約率を大幅にアップします。
          </p>

          {/* CTAボタン */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link href="/auth/signup">
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-10 py-7 text-lg font-bold shadow-[0_8px_30px_rgb(249,115,22,0.4)] hover:shadow-[0_12px_40px_rgb(249,115,22,0.5)] border-2 border-orange-400 transition-all duration-300 transform hover:scale-105">
                <Star className="mr-2 h-5 w-5" />
                無料で始める
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="outline" className="border-3 border-white bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-black px-10 py-7 text-lg font-bold shadow-[0_8px_30px_rgba(255,255,255,0.2)] hover:shadow-[0_12px_40px_rgba(255,255,255,0.3)] transition-all duration-300 transform hover:scale-105">
                <Palette className="mr-2 h-5 w-5" />
                ログインして続ける
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 第2画面: キャッチフレーズ＋フロー比較セクション（1画面完結） */}
      <section className="h-screen w-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden flex items-center">
        {/* 背景装飾 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 w-full h-full flex flex-col justify-center py-8">
          {/* 上部: キャッチフレーズ */}
          <div className="text-center mb-8 md:mb-12">
            <p className="text-orange-400 font-bold text-sm md:text-base tracking-wider uppercase mb-4">
              The Moment of Truth
            </p>

            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
              「この家に住みたい」
            </h2>

            <p className="text-xl md:text-3xl lg:text-4xl font-bold text-white/90 leading-tight">
              お客様がそう思った瞬間、<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400">
                営業は終わっている。
              </span>
            </p>
          </div>

          {/* 中央: コンパクトなフロー比較 */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto w-full">
            {/* 従来のフロー */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-red-500/30">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-red-500 text-white px-6 py-2 rounded-full text-sm md:text-base font-bold">
                  従来
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 md:gap-3 text-white/90 flex-wrap text-sm md:text-base">
                <span>持ち帰り</span>
                <ChevronRight className="w-4 h-4 text-red-400" />
                <span>時間経過</span>
                <ChevronRight className="w-4 h-4 text-red-400" />
                <span>熱量低下</span>
                <ChevronRight className="w-4 h-4 text-red-400" />
                <div className="flex items-center gap-2 bg-red-500/20 px-3 py-1 rounded-full">
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span className="font-bold text-red-400">失注</span>
                </div>
              </div>
            </div>

            {/* Paintlyのフロー */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-green-500/30">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-full text-sm md:text-base font-bold">
                  Paintly
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 md:gap-3 text-white/90 flex-wrap text-sm md:text-base">
                <span>その場で感動</span>
                <ChevronRight className="w-4 h-4 text-green-400" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-400 font-bold">熱量MAX</span>
                <ChevronRight className="w-4 h-4 text-green-400" />
                <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-full">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="font-bold text-green-400">即決</span>
                </div>
              </div>
            </div>
          </div>

          {/* 下部: 統計バッジ */}
          <div className="text-center mt-8 md:mt-12">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <Heart className="w-5 h-5 text-pink-400 animate-pulse" />
              <span className="text-white/90 text-sm md:text-base">
                感動が、購買決定を生む
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 第3画面: 対比セクション */}
      <section className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-gray-100 py-20 md:py-32 flex items-center">
        <div className="max-w-7xl mx-auto px-4 md:px-8 w-full">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              なぜ、その場で見せると成約率が上がるのか？
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              従来の営業との決定的な違い
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            {/* 従来の営業 */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 bg-red-500 text-white px-6 py-2 rounded-full text-base font-bold shadow-lg z-10">
                従来の営業
              </div>
              <div className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl border-2 border-red-100 h-full">
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                      <Clock className="w-7 h-7 text-red-600" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-bold text-xl mb-2">カタログを持ち帰り</h3>
                      <p className="text-base text-muted-foreground">「検討します」の一言で終了</p>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <ChevronRight className="w-10 h-10 text-red-300 rotate-90" />
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                      <TrendingDown className="w-7 h-7 text-red-600" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-bold text-xl mb-2">時間経過で熱量低下</h3>
                      <p className="text-base text-muted-foreground">興味が薄れ、想像力も減衰</p>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <ChevronRight className="w-10 h-10 text-red-300 rotate-90" />
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                      <Users className="w-7 h-7 text-red-600" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-bold text-xl mb-2">他社と比較検討</h3>
                      <p className="text-base text-muted-foreground">価格競争に巻き込まれる</p>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <ChevronRight className="w-10 h-10 text-red-300 rotate-90" />
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-red-500 rounded-full flex items-center justify-center">
                      <XCircle className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-bold text-xl mb-2 text-red-600">連絡がこない</h3>
                      <p className="text-base text-muted-foreground font-bold">成約率20〜30%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Paintly営業 */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-full text-base font-bold shadow-lg z-10">
                Paintly営業
              </div>
              <div className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl border-2 border-green-100 h-full">
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                      <Camera className="w-7 h-7 text-green-600" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-bold text-xl mb-2">その場で建物を撮影</h3>
                      <p className="text-base text-muted-foreground">わずか30秒で準備完了</p>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <ChevronRight className="w-10 h-10 text-green-300 rotate-90" />
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                      <Sparkles className="w-7 h-7 text-green-600" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-bold text-xl mb-2">AI瞬時に生成</h3>
                      <p className="text-base text-muted-foreground">複数パターンを即座に提案</p>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <ChevronRight className="w-10 h-10 text-green-300 rotate-90" />
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                      <Heart className="w-7 h-7 text-green-600" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-bold text-xl mb-2">その場で感動体験</h3>
                      <p className="text-base text-muted-foreground">「この色いいですね！」</p>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <ChevronRight className="w-10 h-10 text-green-300 rotate-90" />
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-bold text-xl mb-2 text-green-600">熱量MAXで即決</h3>
                      <p className="text-base text-muted-foreground font-bold">成約率60〜80%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 統計データ */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full shadow-2xl">
              <Sparkles className="w-6 h-6 text-white" />
              <span className="text-white font-bold text-base md:text-lg">
                営業担当者の87%が「お客様の反応が変わった」と実感
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
