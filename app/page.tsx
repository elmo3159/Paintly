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

              <h1 className="text-3xl md:text-4xl font-bold text-foreground px-6 py-3 rounded-lg bg-white/80 backdrop-blur-sm shadow-lg inline-block">
                営業成約率を劇的に向上させる<br />
                AI塗装シミュレーション
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-4xl mx-auto">
                建物の写真を撮るだけで、瞬時に塗装後の仕上がりを生成。<br />
                お客様の理想を<span className="font-bold text-primary">その場で可視化</span>し、成約率を大幅にアップします。
              </p>
            </div>

            {/* CTAボタン */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/auth/signup">
                <Button className="paint-button text-xl px-12 py-6 h-auto font-bold shadow-2xl">
                  <Star className="mr-3 h-6 w-6" />
                  無料で始める
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button variant="outline" className="text-xl px-12 py-6 h-auto font-bold border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300">
                  <Palette className="mr-3 h-6 w-6" />
                  ログインして続ける
                </Button>
              </Link>
            </div>

            {/* 社会的証明 */}
            <div className="pt-12 space-y-4">
              <p className="text-lg text-muted-foreground">
                すでに多くの塗装会社様にご利用いただいています
              </p>
              <div className="flex justify-center items-center space-x-8 text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span className="font-semibold">200+ 営業担当者</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5" />
                  <span className="font-semibold">50+ 塗装会社</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-semibold">成約率 +40%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 特徴セクション */}
        <section className="container mx-auto px-4 py-24">
          <div className="max-w-6xl mx-auto space-y-16">
            <div className="text-center space-y-6">
              <Badge className="bg-gradient-to-r from-accent to-primary text-white border-0 px-4 py-2 text-base font-bold">
                <Zap className="h-4 w-4 mr-2" />
                主な機能
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold paint-text">
                なぜPaintlyなのか？
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                塗装業界に特化したAI技術で、営業プロセスを革新します。
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card className="paint-card group hover:scale-105 transition-all duration-300">
                <CardHeader className="text-center pb-6">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Smartphone className="h-12 w-12 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold">瞬時に生成</CardTitle>
                  <CardDescription className="text-base">
                    スマホで写真を撮るだけで、AI が数秒で塗装後の仕上がりを生成
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">その場で即座に提案</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">複数の色パターンに対応</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">高品質なリアルタイム処理</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="paint-card group hover:scale-105 transition-all duration-300">
                <CardHeader className="text-center pb-6">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Target className="h-12 w-12 text-accent" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold">成約率向上</CardTitle>
                  <CardDescription className="text-base">
                    お客様の理想を可視化して、成約率を大幅にアップ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                      <span className="text-sm">ビフォーアフター比較</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                      <span className="text-sm">顧客満足度の向上</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                      <span className="text-sm">競合他社との差別化</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="paint-card group hover:scale-105 transition-all duration-300">
                <CardHeader className="text-center pb-6">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Clock className="h-12 w-12 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold">効率化</CardTitle>
                  <CardDescription className="text-base">
                    営業プロセスを劇的に短縮し、効率的な提案活動を実現
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">訪問時間の短縮</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">提案書作成の自動化</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">顧客データの管理</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* 料金セクション */}
        <section className="container mx-auto px-4 py-24 bg-gradient-to-r from-secondary/20 to-muted/20">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <div className="space-y-6">
              <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0 px-4 py-2 text-base font-bold">
                <Award className="h-4 w-4 mr-2" />
                今すぐ始める
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold paint-text">
                まずは無料でお試し
              </h2>
              <p className="text-xl text-muted-foreground">
                アカウント登録後、<span className="font-bold text-primary">3回まで無料</span>で画像生成をお試しいただけます。
              </p>
            </div>

            <Card className="paint-card max-w-md mx-auto shadow-2xl">
              <CardHeader className="text-center pb-6">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full shadow-lg">
                    <Star className="h-12 w-12 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-3xl font-bold">無料トライアル</CardTitle>
                <CardDescription className="text-base">
                  まずはPaintlyの効果を実感してください
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <span className="text-5xl font-bold text-foreground">3回</span>
                  <p className="text-primary font-semibold">完全無料</p>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm">高品質AI画像生成</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm">顧客管理機能</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm">画像ダウンロード</span>
                  </li>
                </ul>
                <Link href="/auth/signup">
                  <Button className="w-full paint-button h-12 text-base font-bold shadow-lg">
                    <Star className="mr-3 h-5 w-5" />
                    今すぐ無料で始める
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* フッター */}
        <footer className="bg-muted/30 border-t border-border py-12">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <Image 
                  src="/logo.png" 
                  alt="Paintly" 
                  width={142}
                  height={80}
                  className="h-16 w-auto object-contain"
                  sizes="(max-width: 768px) 142px, 142px"
                />
              </div>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                塗装業界の営業を革新するAI画像生成ツール。お客様の理想を瞬時に可視化し、成約率を向上させます。
              </p>
              <div className="flex justify-center space-x-8">
                <Link href="/auth/signin" className="text-primary hover:text-primary/80 paint-hover">
                  ログイン
                </Link>
                <Link href="/billing" className="text-muted-foreground hover:text-foreground paint-hover">
                  料金プラン
                </Link>
              </div>
              <p className="text-sm text-muted-foreground">
                © 2024 Paintly. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}