'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileQuestion, Home, Palette, Paintbrush, Droplet, Star, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-secondary/30 to-primary/10 relative">
      {/* 背景装飾 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 opacity-5 rotate-12">
          <Paintbrush className="w-full h-full text-primary" />
        </div>
        <div className="absolute bottom-20 right-20 w-28 h-28 opacity-5 -rotate-12">
          <Palette className="w-full h-full text-accent" />
        </div>
        <div className="absolute top-1/3 right-1/4 w-6 h-6 opacity-20 animate-pulse text-accent">
          <Droplet className="w-full h-full" />
        </div>
        <div className="absolute bottom-1/3 left-1/4 w-8 h-8 opacity-15 animate-bounce text-primary">
          <Star className="w-full h-full" />
        </div>
      </div>

      <Card className="max-w-lg w-full paint-card shadow-2xl relative z-10">
        <CardHeader className="text-center pb-6">
          {/* ロゴセクション */}
          <div className="flex justify-center mb-4">
            <Image 
              src="/logo.png" 
              alt="Paintly" 
              width={142}
              height={80}
              className="h-32 w-auto object-contain"
              sizes="(max-width: 768px) 142px, 142px"
            />
          </div>
          <div className="space-y-3">
            <CardTitle className="text-2xl font-bold text-foreground">
              404 - ページが見つかりません
            </CardTitle>
            <CardTitle className="text-xl font-bold text-foreground">
              ページが見つかりません
            </CardTitle>
            <CardDescription className="text-base leading-relaxed">
              お探しのページは存在しないか、<br />
              移動した可能性があります。<br />
              <span className="text-primary font-semibold">ホームページ</span>からお探しください。
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* 案内セクション */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-accent/5 to-primary/5 border border-accent/20">
            <div className="flex items-center space-x-2 mb-3">
              <Palette className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-bold text-primary">おすすめの操作</span>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center space-x-2">
                <Star className="h-3 w-3 text-accent flex-shrink-0" />
                <span>ホームページに戻って、新しい画像生成を始める</span>
              </li>
              <li className="flex items-center space-x-2">
                <Star className="h-3 w-3 text-accent flex-shrink-0" />
                <span>ダッシュボードから、過去の作業を確認する</span>
              </li>
              <li className="flex items-center space-x-2">
                <Star className="h-3 w-3 text-accent flex-shrink-0" />
                <span>前のページに戻って、続きから作業する</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <Link href="/">
              <Button className="w-full paint-button h-12 text-base font-bold shadow-lg">
                <Home className="mr-3 h-5 w-5" />
                ホームページに戻る
              </Button>
            </Link>
            
            <div className="grid grid-cols-2 gap-3">
              <Link href="/dashboard">
                <Button 
                  variant="outline" 
                  className="w-full h-11 text-sm font-medium border-2 border-border hover:border-primary hover:text-primary transition-all duration-300"
                >
                  <Palette className="mr-2 h-4 w-4" />
                  ダッシュボード
                </Button>
              </Link>
              <Button 
                onClick={() => window.history.back()} 
                variant="outline" 
                className="h-11 text-sm font-medium border-2 border-border hover:border-accent hover:text-accent transition-all duration-300"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                前のページに戻る
              </Button>
            </div>
          </div>
          
          <div className="text-center p-4 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
            <p className="text-sm text-muted-foreground mb-2">
              もしかすると、お探しの機能は<br />
              <span className="font-semibold text-primary">新しい場所</span>に移動したかもしれません。
            </p>
            <p className="text-xs text-muted-foreground">
              Paintlyは日々改善され、より使いやすくなっています。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}