'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Star, Palette, Loader2, CheckCircle, XCircle, ChevronRight } from 'lucide-react'

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
    <div className="w-full overflow-hidden">
      {/* 第1画面: すべてのコンテンツを統合（背景動画） */}
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
        <div className="absolute inset-0 bg-black/60"></div>

        {/* コンテンツ */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center py-2">
          <div className="max-w-7xl mx-auto w-full space-y-6">
            {/* ロゴ */}
            <Image
              src="/logo.png"
              alt="Paintly"
              width={284}
              height={160}
              priority={true}
              className="h-24 md:h-28 w-auto object-contain mx-auto mb-5 -mt-16"
            />

            {/* バッジ */}
            <div className="mb-5">
              <span className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 via-pink-500 to-orange-500 bg-[length:200%_100%] animate-gradient-flow text-white px-3 py-1.5 rounded-full text-xs md:text-sm font-bold shadow-lg">
                <Star className="h-3 w-3 md:h-4 md:w-4" />
                一瞬で140色の高精度なシミュレーション
              </span>
            </div>

            {/* メインタイトル */}
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold mb-5 leading-tight">
              <span
                className="text-white"
                style={{
                  WebkitTextStroke: '2px #f97316',
                  textShadow: '0 0 30px rgba(249,115,22,0.8), 0 0 60px rgba(249,115,22,0.5), 4px 4px 12px rgba(0,0,0,0.9)',
                  filter: 'drop-shadow(0 0 10px rgba(249,115,22,0.6))'
                }}
              >
                営業成約率を劇的に向上させる
              </span>
              <br />
              <span
                className="text-white"
                style={{
                  WebkitTextStroke: '1.5px rgba(249,115,22,0.5)',
                  textShadow: '0 0 20px rgba(236,72,153,0.6), 4px 4px 12px rgba(0,0,0,0.9)',
                  filter: 'drop-shadow(0 0 8px rgba(236,72,153,0.4))'
                }}
              >
                塗装シミュレーション
              </span>
            </h1>

            {/* キャッチフレーズ */}
            <div className="mb-6">
              <p className="text-lg md:text-3xl font-bold text-white leading-tight">
                「この家に住みたい」<br />
                <span className="text-sm md:text-xl text-white/90">お客様がそう思った瞬間、</span><br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400">
                  営業は終わっている。
                </span>
              </p>
            </div>

            {/* フロー比較（コンパクト版） */}
            <div className="grid grid-cols-2 gap-3 md:gap-4 max-w-4xl mx-auto mb-5">
              {/* 従来 */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-2 md:p-3 border border-red-500/30">
                <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold mb-2 inline-block">
                  従来
                </div>
                <div className="flex items-center justify-center gap-1 text-white/90 flex-wrap text-xs">
                  <span>持ち帰り</span>
                  <ChevronRight className="w-3 h-3 text-red-400" />
                  <span>時間経過</span>
                  <ChevronRight className="w-3 h-3 text-red-400" />
                  <span>熱量低下</span>
                  <ChevronRight className="w-3 h-3 text-red-400" />
                  <span className="flex items-center gap-1 bg-red-500/20 px-2 py-0.5 rounded-full">
                    <XCircle className="w-3 h-3 text-red-400" />
                    <span className="font-bold text-red-400">失注</span>
                  </span>
                </div>
              </div>

              {/* Paintly */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-2 md:p-3 border border-green-500/30">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold mb-2 inline-block">
                  Paintly
                </div>
                <div className="flex items-center justify-center gap-1 text-white/90 flex-wrap text-xs">
                  <span>その場で感動</span>
                  <ChevronRight className="w-3 h-3 text-green-400" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-400 font-bold">熱量MAX</span>
                  <ChevronRight className="w-3 h-3 text-green-400" />
                  <span className="flex items-center gap-1 bg-green-500/20 px-2 py-0.5 rounded-full">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span className="font-bold text-green-400">即決</span>
                  </span>
                </div>
              </div>
            </div>

            {/* 説明文 */}
            <div className="max-w-3xl mx-auto mb-6">
              <p className="text-xs md:text-sm text-white/90 leading-relaxed">
                現地調査などの際に建物の写真を撮影→色を選ぶだけで瞬時に塗装後の仕上がり画像が作成されます。<br />
                <span className="text-sm md:text-base text-orange-400 font-semibold">その場でお客様に見せ、競合他社との差別化を図り</span>成約率を大幅にアップします。
              </p>
            </div>

            {/* CTAボタン */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-4 md:px-8 md:py-5 text-sm md:text-base font-bold shadow-[0_8px_30px_rgb(249,115,22,0.4)] hover:shadow-[0_12px_40px_rgb(249,115,22,0.5)] border-2 border-orange-400 transition-all duration-300 transform hover:scale-105">
                  <Star className="mr-2 h-4 w-4" />
                  無料で始める
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button variant="outline" className="border-2 border-white bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-black px-6 py-4 md:px-8 md:py-5 text-sm md:text-base font-bold shadow-[0_8px_30px_rgba(255,255,255,0.2)] hover:shadow-[0_12px_40px_rgba(255,255,255,0.3)] transition-all duration-300 transform hover:scale-105">
                  <Palette className="mr-2 h-4 w-4" />
                  ログインして続ける
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
