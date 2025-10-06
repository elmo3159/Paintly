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
  Users,
  Target,
  Smartphone,
  Clock,
  Award,
  Building2,
  Loader2
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
      {/* 背景装飾 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-40 h-40 opacity-5 rotate-12 animate-pulse">
          <Palette className="w-full h-full text-primary" />
        </div>
        <div className="absolute bottom-10 right-10 w-48 h-48 opacity-5 -rotate-12 animate-pulse">
          <Paintbrush className="w-full h-full text-accent" />
        </div>
        <div className="absolute top-1/4 right-1/3 w-8 h-8 opacity-25 animate-bounce text-accent">
          <Droplet className="w-full h-full" />
        </div>
        <div className="absolute bottom-1/4 left-1/3 w-12 h-12 opacity-20 animate-pulse text-primary">
          <Star className="w-full h-full" />
        </div>
      </div>

      <div className="relative z-10">
        {/* ヒーローセクション */}
        <section className="container mx-auto px-4 pt-6 pb-8">
          <div className="max-w-6xl mx-auto text-center space-y-4">
            {/* ロゴとブランディング */}
            <div className="flex justify-center mb-2">
              <Image
                src="/logo.png"
                alt="Paintly"
                width={142}
                height={80}
                priority={true}
                className="h-24 md:h-32 w-auto object-contain"
                sizes="(max-width: 768px) 142px, 142px"
              />
            </div>

            {/* メインタイトル */}
            <div className="space-y-4">
              <h1 className="text-xl md:text-4xl font-bold text-foreground px-3 py-2 md:px-6 md:py-3 rounded-lg bg-white/80 backdrop-blur-sm shadow-lg inline-block">
                営業成約率を劇的に向上させる<br />
                塗装シミュレーション
              </h1>

              {/* スライダーデモ動画 */}
              <div className="w-full mt-4">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full aspect-video object-cover"
                >
                  <source src="/demo/slider-demo.mp4" type="video/mp4" />
                  お使いのブラウザは動画に対応していません。
                </video>
                <p className="text-xs md:text-sm text-muted-foreground text-center mt-2 font-medium">
                  ✨ スライダーで簡単にビフォー・アフターを比較
                </p>
              </div>

              <p className="text-sm md:text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto mt-3">
                建物の写真を撮るだけで、瞬時に塗装後の仕上がりを生成。<br />
                お客様の理想を<span className="font-bold text-primary">その場で可視化</span>し、成約率を大幅にアップします。
              </p>
            </div>

            {/* CTAボタン */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-4">
              <Link href="/auth/signup">
                <Button className="paint-button text-base md:text-lg px-8 md:px-10 py-3 md:py-4 h-auto font-bold shadow-2xl w-full sm:w-auto">
                  <Star className="mr-2 h-4 md:h-5 w-4 md:w-5" />
                  無料で始める
                  <ArrowRight className="ml-2 h-4 md:h-5 w-4 md:w-5" />
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button variant="outline" className="text-base md:text-lg px-8 md:px-10 py-3 md:py-4 h-auto font-bold border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 w-full sm:w-auto">
                  <Palette className="mr-2 h-4 md:h-5 w-4 md:w-5" />
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
