'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, Palette, Droplet, Paintbrush, Home, Lock, RefreshCw, Star, ArrowLeft } from 'lucide-react'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      setSuccess(true)
      setLoading(false)
    } catch (error) {
      setError('パスワードリセットメールの送信に失敗しました。')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-primary/10 p-4">
      {/* 背景装飾 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-16 left-16 w-28 h-28 opacity-5 -rotate-12">
          <RefreshCw className="w-full h-full text-primary" />
        </div>
        <div className="absolute bottom-16 right-16 w-36 h-36 opacity-5 rotate-12">
          <Paintbrush className="w-full h-full text-accent" />
        </div>
        <div className="absolute top-1/4 right-1/3 w-6 h-6 opacity-25 animate-pulse text-accent">
          <Droplet className="w-full h-full" />
        </div>
        <div className="absolute bottom-1/3 left-1/4 w-8 h-8 opacity-20 animate-bounce text-primary">
          <Star className="w-full h-full" />
        </div>
      </div>

      <Card className="w-full max-w-md paint-card relative z-10">
        <CardHeader className="space-y-4 pb-6">
          {/* ロゴセクション */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="p-4 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full shadow-lg">
                <Lock className="h-12 w-12 text-accent" />
              </div>
              <RefreshCw className="absolute -top-1 -right-1 h-6 w-6 text-primary animate-pulse" />
            </div>
          </div>
          
          <div className="mb-4 flex justify-center">
            <Image 
              src="/logo.png" 
              alt="Paintly" 
              width={142}
              height={80}
              priority={true}
              className="h-32 w-auto object-contain"
              sizes="(max-width: 768px) 142px, 142px"
            />
          </div>
          
          <div className="text-center space-y-3">
            <CardTitle className="text-xl font-bold text-foreground">
              パスワードをリセット
            </CardTitle>
            <CardDescription className="text-muted-foreground leading-relaxed">
              登録済みのメールアドレスに<br />
              パスワードリセット用のリンクを送信します。<br />
              <span className="text-accent font-semibold">安全に</span>新しいパスワードを設定できます。
            </CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleResetPassword}>
          <CardContent className="space-y-6">
            {/* アラート表示 */}
            {error && (
              <Alert variant="destructive" className="border-destructive/20 bg-destructive/5">
                <Lock className="h-4 w-4" />
                <AlertDescription className="text-destructive/90">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            {success ? (
              <Alert className="border-primary/20 bg-primary/5">
                <CheckCircle className="h-4 w-4 text-primary" />
                <AlertDescription className="text-primary/90">
                  🎉 パスワードリセット用のメールを送信しました！<br />
                  メールボックスをご確認ください。
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-semibold text-foreground flex items-center">
                  <Home className="h-4 w-4 mr-2 text-primary" />
                  メールアドレス
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="例: yamada@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="paint-input h-12 text-base border-border/60 focus:border-primary transition-all duration-300"
                />
              </div>
            )}

            {/* セキュリティ説明 */}
            {!success && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-accent/5 to-secondary/10 border border-accent/20">
                <div className="flex items-center space-x-2 mb-2">
                  <Lock className="h-4 w-4 text-accent animate-pulse" />
                  <span className="text-sm font-bold text-accent">セキュリティについて</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  お客様のデータは<span className="font-semibold text-primary">安全に保護</span>されています。
                  リセットリンクは24時間で期限切れになります。
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-6 pt-6">
            {/* リセットボタン */}
            {!success && (
              <Button
                type="submit"
                className="w-full paint-button h-12 text-base font-bold shadow-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    送信中...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-3 h-5 w-5" />
                    リセットメールを送信
                  </>
                )}
              </Button>
            )}

            {/* サインインに戻るリンク */}
            <div className="text-center p-4 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
              <p className="text-sm text-muted-foreground mb-2">
                パスワードを思い出しましたか？
              </p>
              <Link
                href="/auth/signin"
                className="text-primary hover:text-primary/80 font-bold paint-hover inline-flex items-center text-base"
              >
                <Paintbrush className="mr-2 h-4 w-4" />
                サインインに戻る
                <Droplet className="ml-1 h-3 w-3 animate-bounce" />
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}