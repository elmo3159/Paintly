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
        <section className="container mx-auto px-4 pt-20 pb-32">
          <div className="max-w-6xl mx-auto text-center space-y-12">
            {/* ロゴとブランディング */}
            <div className="flex justify-center mb-8">
              <Image 
                src="/logo.png" 
                alt="Paintly" 
                width={142}
                height={80}
                priority={true}
                className="h-40 w-auto object-contain"
                sizes="(max-width: 768px) 142px, 142px"
              />
            </div>
            
            {/* メインタイトル */}
            <div className="space-y-6">
              <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0 px-6 py-2 text-lg font-bold shadow-lg">
                <Star className="h-4 w-4 mr-2" />
                塗装業界革命
              </Badge>

              <h1 className="text-2xl md:text-4xl font-bold text-foreground px-4 py-2 md:px-6 md:py-3 rounded-lg bg-white/80 backdrop-blur-sm shadow-lg inline-block">
                営業成約率を劇的に向上させる<br />
                AI塗装シミュレーション
              </h1>

              {/* スライダーデモ動画 */}
              <div className="max-w-3xl mx-auto mt-8">
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-3 md:p-6">
                  <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg ring-2 ring-primary/20">
                    <video
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                    >
                      <source src="/demo/slider-demo.mp4" type="video/mp4" />
                      お使いのブラウザは動画に対応していません。
                    </video>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground text-center mt-3 font-medium">
                    ✨ スライダーで簡単にビフォー・アフターを比較
                  </p>
                </div>
              </div>

              <p className="text-base md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto mt-6">
                建物の写真を撮るだけで、瞬時に塗装後の仕上がりを生成。<br />
                お客様の理想を<span className="font-bold text-primary">その場で可視化</span>し、成約率を大幅にアップします。
              </p>
            </div>

            {/* CTAボタン */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              <Link href="/auth/signup">
                <Button className="paint-button text-lg md:text-xl px-10 md:px-12 py-5 md:py-6 h-auto font-bold shadow-2xl w-full sm:w-auto">
                  <Star className="mr-2 md:mr-3 h-5 md:h-6 w-5 md:w-6" />
                  無料で始める
                  <ArrowRight className="ml-2 md:ml-3 h-5 md:h-6 w-5 md:w-6" />
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button variant="outline" className="text-lg md:text-xl px-10 md:px-12 py-5 md:py-6 h-auto font-bold border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 w-full sm:w-auto">
                  <Palette className="mr-2 md:mr-3 h-5 md:h-6 w-5 md:w-6" />
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
