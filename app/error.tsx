'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, RefreshCw, Home, Palette, Paintbrush, Droplet, Star } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-secondary/30 to-primary/10 relative">
      {/* 背景装飾 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-24 h-24 opacity-5 rotate-12">
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
              エラーが発生しました
            </CardTitle>
            <CardTitle className="text-xl font-bold text-foreground">
              申し訳ございません
            </CardTitle>
            <CardDescription className="text-base leading-relaxed">
              予期せぬエラーが発生しました。<br />
              <span className="text-primary font-semibold">すぐに復旧</span>させていただきます。
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {process.env.NODE_ENV === 'development' && (
            <div className="p-4 bg-muted/50 rounded-xl border border-destructive/20">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm font-bold text-destructive">開発モード情報</span>
              </div>
              <p className="text-sm font-mono text-muted-foreground">
                {error.message}
              </p>
              {error.digest && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* 解決方法セクション */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-accent/5 to-primary/5 border border-accent/20">
            <div className="flex items-center space-x-2 mb-3">
              <Palette className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-bold text-primary">解決方法</span>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center space-x-2">
                <Star className="h-3 w-3 text-accent flex-shrink-0" />
                <span>「再試行」ボタンをクリックしてください</span>
              </li>
              <li className="flex items-center space-x-2">
                <Star className="h-3 w-3 text-accent flex-shrink-0" />
                <span>ページを再読み込みして、やり直してみてください</span>
              </li>
              <li className="flex items-center space-x-2">
                <Star className="h-3 w-3 text-accent flex-shrink-0" />
                <span>問題が続く場合は、ホームページにお戻りください</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={() => reset()} 
              className="w-full paint-button h-12 text-base font-bold shadow-lg"
            >
              <RefreshCw className="mr-3 h-5 w-5" />
              再試行する
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                className="h-11 text-sm font-medium border-2 border-border hover:border-accent hover:text-accent transition-all duration-300"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                ページを再読み込み
              </Button>
              <Button 
                onClick={() => window.location.href = '/'} 
                variant="outline" 
                className="h-11 text-sm font-medium border-2 border-border hover:border-primary hover:text-primary transition-all duration-300"
              >
                <Home className="mr-2 h-4 w-4" />
                ホームへ戻る
              </Button>
            </div>
          </div>
          
          <div className="text-center p-4 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
            <p className="text-sm text-muted-foreground mb-2">
              問題が続く場合は、<span className="font-semibold text-primary">サポート</span>までお問い合わせください。
            </p>
            <p className="text-xs text-muted-foreground">
              Paintlyチームが迅速にサポートいたします。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}