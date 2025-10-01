'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, Palette, Droplet, Paintbrush, Home, Lock, User, Star } from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (password !== confirmPassword) {
      setError('パスワードが一致しません。')
      return
    }

    if (password.length < 6) {
      setError('パスワードは6文字以上で設定してください。')
      return
    }

    setLoading(true)

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            name: name,
          }
        }
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      if (authData?.user) {
        // Create user record in the users table
        const { error: dbError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: authData.user.email,
            full_name: name,
          })

        if (dbError) {
          console.error('Error creating user record:', dbError)
        }

        // Create free plan subscription
        const { data: plans } = await supabase
          .from('plans')
          .select('id')
          .eq('name', 'free')
          .single()

        if (plans) {
          const { error: subError } = await supabase
            .from('subscriptions')
            .insert({
              user_id: authData.user.id,
              plan_id: plans.id,
              status: 'active',
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              generation_count: 0,
            })

          if (subError) {
            console.error('Error creating subscription:', subError)
          }
        }

        setSuccess(true)
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      }
    } catch (error) {
      setError('サインアップに失敗しました。')
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
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
      setError('Googleサインアップに失敗しました。')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-primary/10 p-4">
      {/* 背景装飾 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-16 right-16 w-28 h-28 opacity-5 rotate-45">
          <Palette className="w-full h-full text-accent" />
        </div>
        <div className="absolute bottom-16 left-16 w-36 h-36 opacity-5 -rotate-12">
          <Paintbrush className="w-full h-full text-primary" />
        </div>
        <div className="absolute top-1/3 right-1/4 w-5 h-5 opacity-25 animate-pulse text-primary">
          <Droplet className="w-full h-full" />
        </div>
        <div className="absolute bottom-1/4 left-1/3 w-7 h-7 opacity-20 animate-bounce text-accent">
          <Star className="w-full h-full" />
        </div>
      </div>

      <Card className="w-full max-w-md paint-card relative z-10">
        <CardHeader className="space-y-4 pb-6">
          {/* ロゴセクション */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="p-4 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full shadow-lg">
                <Paintbrush className="h-12 w-12 text-accent" />
              </div>
              <Star className="absolute -top-1 -right-1 h-6 w-6 text-primary animate-pulse" />
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
              無料で始める塗装革命
            </CardTitle>
            <CardDescription className="text-muted-foreground leading-relaxed">
              営業成約率を劇的に向上させる<br />
              AI塗装シミュレーション。<br />
              <span className="text-primary font-semibold">3回まで無料</span>でお試しいただけます。
            </CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleSignUp}>
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
            {success && (
              <Alert className="border-primary/20 bg-primary/5">
                <CheckCircle className="h-4 w-4 text-primary" />
                <AlertDescription className="text-primary/90">
                  🎉 アカウントが作成されました！ダッシュボードへ移動します...
                </AlertDescription>
              </Alert>
            )}
            
            {/* フォームフィールド */}
            <div className="space-y-5">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-sm font-semibold text-foreground flex items-center">
                  <User className="h-4 w-4 mr-2 text-primary" />
                  お名前
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="例: 山田太郎"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading || success}
                  className="paint-input h-12 text-base border-border/60 focus:border-primary transition-all duration-300"
                />
              </div>
              
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
                  disabled={loading || success}
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
                  placeholder="6文字以上で設定"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading || success}
                  className="paint-input h-12 text-base border-border/60 focus:border-primary transition-all duration-300"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-accent" />
                  パスワード（確認）
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="パスワードを再入力"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading || success}
                  className="paint-input h-12 text-base border-border/60 focus:border-primary transition-all duration-300"
                />
              </div>
            </div>

            {/* 特典説明 */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20">
              <div className="flex items-center space-x-2 mb-2">
                <Star className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-sm font-bold text-primary">無料トライアル特典</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                アカウント登録後、<span className="font-semibold text-primary">3回まで無料</span>で画像生成をお試しいただけます。
                塗装業界での営業成約率向上を実感してください。
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-6 pt-6">
            {/* メイン登録ボタン */}
            <Button
              type="submit"
              className="w-full paint-button h-12 text-base font-bold shadow-lg"
              disabled={loading || success}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  登録中...
                </>
              ) : success ? (
                <>
                  <CheckCircle className="mr-3 h-5 w-5" />
                  登録完了！
                </>
              ) : (
                <>
                  <Star className="mr-3 h-5 w-5" />
                  無料でPaintlyを始める
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

            {/* Googleサインアップボタン */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 text-base font-medium border-border/60 hover:bg-secondary/50 paint-hover transition-all duration-300"
              onClick={handleGoogleSignUp}
              disabled={loading || success}
            >
              <FcGoogle className="mr-3 h-5 w-5" />
              Googleで簡単登録
            </Button>

            {/* サインインリンク */}
            <div className="text-center p-4 rounded-xl bg-gradient-to-r from-accent/5 to-secondary/10 border border-accent/10">
              <p className="text-sm text-muted-foreground mb-2">
                すでにアカウントをお持ちの方は
              </p>
              <Link
                href="/auth/signin"
                className="text-accent hover:text-accent/80 font-bold paint-hover inline-flex items-center text-base"
              >
                <Palette className="mr-2 h-4 w-4" />
                サインインして始める
                <Droplet className="ml-1 h-3 w-3 animate-bounce" />
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}