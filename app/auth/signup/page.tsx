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
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!agreedToTerms) {
      setError('利用規約とプライバシーポリシーに同意してください。')
      return
    }

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
        }
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      if (authData?.user) {
        // トリガーが自動的にusersテーブルとsubscriptionsテーブルを作成します
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

    if (!agreedToTerms) {
      setError('利用規約とプライバシーポリシーに同意してください。')
      return
    }

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
    <div className="min-h-dvh overflow-y-auto bg-gradient-to-br from-background via-secondary/30 to-primary/10 p-4 py-2 md:py-6 flex items-center">
      {/* 背景装飾 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-16 right-16 w-28 h-28 opacity-5">
          <Palette className="w-full h-full text-accent" />
        </div>
        <div className="absolute bottom-16 left-16 w-36 h-36 opacity-5">
          <Paintbrush className="w-full h-full text-primary" />
        </div>
        <div className="absolute top-1/3 right-1/4 w-5 h-5 opacity-25 animate-pulse text-primary">
          <Droplet className="w-full h-full" />
        </div>
        <div className="absolute bottom-1/4 left-1/3 w-7 h-7 opacity-20 animate-bounce text-accent">
          <Star className="w-full h-full" />
        </div>
      </div>

      <div className="max-w-md mx-auto">
        <Card className="w-full paint-card relative z-10">
        <CardHeader className="space-y-1 pb-2">
          {/* Paintlyロゴ */}
          <div className="flex justify-center">
            <Image
              src="/logo.png"
              alt="Paintly"
              width={142}
              height={80}
              priority={true}
              className="h-16 md:h-24 w-auto object-contain"
              sizes="(max-width: 768px) 142px, 142px"
            />
          </div>

          <div className="text-center space-y-0.5">
            <CardTitle className="text-base md:text-lg font-bold text-foreground">
              無料で始める塗装革命
            </CardTitle>
            <CardDescription className="text-xs md:text-sm text-muted-foreground leading-tight">
              営業成約率を劇的に向上させる<br />
              AI塗装シミュレーション。<br />
              <span className="text-primary font-semibold">3回まで無料</span>でお試しいただけます。
            </CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleSignUp}>
          <CardContent className="space-y-1.5">
            {/* アラート表示 */}
            {error && (
              <Alert variant="destructive" className="border-destructive/20 bg-destructive/5 py-2">
                <Lock className="h-3.5 w-3.5" />
                <AlertDescription className="text-destructive/90 text-xs">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="border-primary/20 bg-primary/5 py-2">
                <CheckCircle className="h-3.5 w-3.5 text-primary" />
                <AlertDescription className="text-primary/90 text-xs">
                  🎉 アカウントが作成されました！ダッシュボードへ移動します...
                </AlertDescription>
              </Alert>
            )}

            {/* フォームフィールド */}
            <div className="space-y-1.5">
              <div className="space-y-0.5">
                <Label htmlFor="email" className="text-xs md:text-sm font-semibold text-foreground flex items-center">
                  <Home className="h-3.5 w-3.5 mr-1.5 text-primary" />
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
                  className="paint-input h-8 md:h-10 text-sm md:text-base border-border/60 focus:border-primary transition-all duration-300"
                />
              </div>

              <div className="space-y-0.5">
                <Label htmlFor="password" className="text-xs md:text-sm font-semibold text-foreground flex items-center">
                  <Lock className="h-3.5 w-3.5 mr-1.5 text-primary" />
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
                  className="paint-input h-8 md:h-10 text-sm md:text-base border-border/60 focus:border-primary transition-all duration-300"
                />
              </div>

              <div className="space-y-0.5">
                <Label htmlFor="confirmPassword" className="text-xs md:text-sm font-semibold text-foreground flex items-center">
                  <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-accent" />
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
                  className="paint-input h-8 md:h-10 text-sm md:text-base border-border/60 focus:border-primary transition-all duration-300"
                />
              </div>
            </div>

            {/* 利用規約への同意チェックボックス */}
            <div className="space-y-1">
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="agreedToTerms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  disabled={loading || success}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <label
                  htmlFor="agreedToTerms"
                  className="text-xs text-muted-foreground leading-tight cursor-pointer"
                >
                  <Link
                    href="/terms"
                    target="_blank"
                    className="text-primary hover:underline font-medium"
                  >
                    利用規約
                  </Link>
                  および
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="text-primary hover:underline font-medium"
                  >
                    プライバシーポリシー
                  </Link>
                  に同意します
                </label>
              </div>
              {!agreedToTerms && (
                <p className="text-xs text-amber-600 ml-6">
                  ※アカウント登録には同意が必要です
                </p>
              )}
            </div>

            {/* 特典説明 */}
            <div className="p-1.5 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
              <div className="flex items-center space-x-1 mb-0">
                <Star className="h-2.5 w-2.5 text-primary animate-pulse" />
                <span className="text-xs font-bold text-primary">無料トライアル特典</span>
              </div>
              <p className="text-xs text-muted-foreground leading-tight">
                登録後<span className="font-semibold text-primary">3回まで無料</span>で画像生成
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-1.5 pt-1.5">
            {/* メイン登録ボタン */}
            <Button
              type="submit"
              className="w-full paint-button h-8 md:h-10 text-sm md:text-base font-bold shadow-lg"
              disabled={loading || success || !agreedToTerms}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  登録中...
                </>
              ) : success ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  登録完了！
                </>
              ) : (
                <>
                  <Star className="mr-2 h-4 w-4" />
                  無料でPaintlyを始める
                </>
              )}
            </Button>

            {/* 区切り線 */}
            <div className="relative">
              <div className="relative flex justify-center text-xs uppercase font-semibold">
                <span className="bg-background px-3 text-muted-foreground/80">または</span>
              </div>
            </div>

            {/* Googleサインアップボタン */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-8 md:h-10 text-sm md:text-base font-medium border-border/60 hover:bg-secondary/50 paint-hover transition-all duration-300"
              onClick={handleGoogleSignUp}
              disabled={loading || success || !agreedToTerms}
            >
              <FcGoogle className="mr-2 h-4 w-4" />
              Googleで簡単登録
            </Button>

            {/* サインインリンク */}
            <div className="text-center p-1.5 rounded-lg bg-gradient-to-r from-accent/5 to-secondary/10 border border-accent/10">
              <p className="text-xs text-muted-foreground mb-0">
                すでにアカウントをお持ちの方は
              </p>
              <Link
                href="/auth/signin"
                className="text-accent hover:text-accent/80 font-bold paint-hover inline-flex items-center text-xs md:text-sm"
              >
                <Palette className="mr-1 h-3 w-3" />
                サインインして始める
                <Droplet className="ml-1 h-2.5 w-2.5 animate-bounce" />
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
      </div>
    </div>
  )
}