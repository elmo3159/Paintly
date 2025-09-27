'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Palette, Droplet, Paintbrush, Home, Lock } from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      if (data?.user) {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) {
      setError('サインインに失敗しました。')
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
        setLoading(false)
      }
    } catch (error) {
      setError('Googleサインインに失敗しました。')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-primary/10 p-4">
      {/* 背景装飾 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 opacity-5 rotate-12">
          <Paintbrush className="w-full h-full text-primary" />
        </div>
        <div className="absolute bottom-20 right-10 w-24 h-24 opacity-5 -rotate-12">
          <Palette className="w-full h-full text-accent" />
        </div>
        <div className="absolute top-1/2 left-1/4 w-6 h-6 opacity-20 animate-bounce text-accent">
          <Droplet className="w-full h-full" />
        </div>
        <div className="absolute bottom-1/3 right-1/3 w-8 h-8 opacity-15 animate-pulse text-primary">
          <Droplet className="w-full h-full" />
        </div>
      </div>

      <Card className="w-full max-w-md paint-card relative z-10">
        <CardHeader className="space-y-4 pb-6">
          {/* ロゴセクション */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="p-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full shadow-lg">
                <Palette className="h-12 w-12 text-primary" />
              </div>
              <Droplet className="absolute -top-1 -right-1 h-6 w-6 text-accent animate-bounce" />
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <div className="mb-4 flex justify-center">
              <img 
                src="/logo.png" 
                alt="Paintly" 
                className="h-32 w-auto object-contain "
              />
            </div>
            <CardTitle className="text-xl font-bold text-foreground">
              営業の成約率を向上させる
            </CardTitle>
            <CardDescription className="text-muted-foreground leading-relaxed">
              塗装シミュレーションでお客様の理想を<br />
              瞬時に可視化。アカウントにサインインして始めましょう。
            </CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleSignIn}>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" className="border-destructive/20 bg-destructive/5">
                <Lock className="h-4 w-4" />
                <AlertDescription className="text-destructive/90">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            {/* フォームフィールド */}
            <div className="space-y-5">
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
              
              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-semibold text-foreground flex items-center">
                  <Lock className="h-4 w-4 mr-2 text-primary" />
                  パスワード
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="パスワードを入力"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="paint-input h-12 text-base border-border/60 focus:border-primary transition-all duration-300"
                />
              </div>
            </div>

            <div className="text-right">
              <Link
                href="/auth/reset-password"
                className="text-sm text-primary hover:text-primary/80 font-medium paint-hover inline-flex items-center"
              >
                <Droplet className="h-3 w-3 mr-1" />
                パスワードをお忘れですか？
              </Link>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-6 pt-6">
            {/* メインサインインボタン */}
            <Button
              type="submit"
              className="w-full paint-button h-12 text-base font-bold shadow-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  サインイン中...
                </>
              ) : (
                <>
                  <Palette className="mr-3 h-5 w-5" />
                  Paintlyにサインイン
                </>
              )}
            </Button>

            {/* 区切り線 */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase font-semibold">
                <span className="bg-background px-4 text-muted-foreground/80">または</span>
              </div>
            </div>

            {/* Googleサインインボタン */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 text-base font-medium border-border/60 hover:bg-secondary/50 paint-hover transition-all duration-300"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <FcGoogle className="mr-3 h-5 w-5" />
              Googleで始める
            </Button>

            {/* 新規登録リンク */}
            <div className="text-center p-4 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
              <p className="text-sm text-muted-foreground mb-2">
                まだアカウントをお持ちではありませんか？
              </p>
              <Link
                href="/auth/signup"
                className="text-primary hover:text-primary/80 font-bold paint-hover inline-flex items-center text-base"
              >
                <Paintbrush className="mr-2 h-4 w-4" />
                今すぐ無料で始める
                <Droplet className="ml-1 h-3 w-3 animate-bounce" />
              </Link>
              <p className="text-xs text-muted-foreground/70 mt-2">
                3回まで無料で画像生成を試用できます
              </p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}