'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Palette, Droplet, Paintbrush, Home, Lock, Mail, Key, CheckCircle } from 'lucide-react'
// GoogleアイコンSVGコンポーネント
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

export default function SignInPage() {
  const router = useRouter()
  const { executeRecaptcha } = useGoogleReCaptcha()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null)
  const supabase = createClient()

  // Email OTP用のステート
  const [otpEmail, setOtpEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpError, setOtpError] = useState<string | null>(null)
  const [otpSuccess, setOtpSuccess] = useState<string | null>(null)

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // ステップ0: reCAPTCHA検証（設定されている場合のみ）
      if (executeRecaptcha) {
        const recaptchaToken = await executeRecaptcha('signin')

        const recaptchaResponse = await fetch('/api/auth/verify-recaptcha', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: recaptchaToken, action: 'signin' })
        })

        const recaptchaData = await recaptchaResponse.json()

        if (!recaptchaData.success) {
          setError('セキュリティ検証に失敗しました。しばらく時間をおいて再試行してください。')
          setLoading(false)
          return
        }
      }

      // ステップ1: アカウントロック状態をチェック
      const checkResponse = await fetch('/api/auth/check-account-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const checkData = await checkResponse.json()

      if (checkData.isLocked) {
        setError(checkData.message || 'アカウントがロックされています。しばらく時間をおいて再試行してください。')
        setLoading(false)
        return
      }

      // ステップ2: ログイン試行
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        // ステップ3: ログイン失敗を記録
        const trackResponse = await fetch('/api/auth/track-login-failure', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        })

        const trackData = await trackResponse.json()

        if (trackData.isLocked) {
          setError('ログイン試行回数が上限に達しました。アカウントが30分間ロックされました。')
        } else if (trackData.remainingAttempts !== undefined) {
          setRemainingAttempts(trackData.remainingAttempts)
          setError(`メールアドレスまたはパスワードが正しくありません。残り${trackData.remainingAttempts}回の試行が可能です。`)
        } else {
          setError('メールアドレスまたはパスワードが正しくありません。')
        }

        setLoading(false)
        return
      }

      // ステップ4: ログイン成功時にカウンターをリセット
      if (data?.user) {
        await fetch('/api/auth/reset-login-failures', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: data.user.id })
        })

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
      // OAuth認証が成功すると自動的にリダイレクトされるため、ここでは何もしない
    } catch (error) {
      setError('Googleサインインに失敗しました。')
      setLoading(false)
    }
  }

  // Email OTPコード送信
  const handleSendOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setOtpError(null)
    setOtpSuccess(null)
    setOtpLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: otpEmail,
        options: {
          shouldCreateUser: false, // 既存ユーザーのみ許可
        },
      })

      if (error) {
        if (error.message.includes('User not found')) {
          setOtpError('このメールアドレスは登録されていません。新規登録してください。')
        } else {
          setOtpError(error.message)
        }
        setOtpLoading(false)
        return
      }

      setOtpSent(true)
      setOtpSuccess('6桁の認証コードをメールで送信しました！メールをご確認ください。')
      setOtpLoading(false)
    } catch (error) {
      setOtpError('認証コードの送信に失敗しました。')
      setOtpLoading(false)
    }
  }

  // Email OTPでログイン
  const handleVerifyOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setOtpError(null)
    setOtpLoading(true)

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: otpEmail,
        token: otpCode,
        type: 'email',
      })

      if (error) {
        setOtpError('認証コードが正しくありません。もう一度お試しください。')
        setOtpLoading(false)
        return
      }

      if (data?.user) {
        setOtpSuccess('ログインに成功しました！')
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh()
        }, 500)
      }
    } catch (error) {
      setOtpError('ログインに失敗しました。')
      setOtpLoading(false)
    }
  }

  return (
    <div className="min-h-dvh overflow-y-auto bg-gradient-to-br from-background via-secondary/30 to-primary/10 p-4 py-2 md:py-6 flex items-center">
      {/* 背景装飾 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 opacity-5">
          <Paintbrush className="w-full h-full text-primary" />
        </div>
        <div className="absolute bottom-20 right-10 w-24 h-24 opacity-5">
          <Palette className="w-full h-full text-accent" />
        </div>
        <div className="absolute top-1/2 left-1/4 w-6 h-6 opacity-20 animate-bounce text-accent">
          <Droplet className="w-full h-full" />
        </div>
        <div className="absolute bottom-1/3 right-1/3 w-8 h-8 opacity-15 animate-pulse text-primary">
          <Droplet className="w-full h-full" />
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
              fetchPriority="high"
              className="h-16 md:h-24 w-auto object-contain"
              sizes="(max-width: 768px) 142px, 142px"
            />
          </div>

          <div className="text-center space-y-0.5">
            <CardTitle id="signin-title" className="text-base md:text-lg font-bold text-foreground">
              営業の成約率を向上させる
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground leading-tight">
              塗装シミュレーションでお客様の理想を<br />
              瞬時に可視化。アカウントにサインインして始めましょう。
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 pt-4">
          {/* タブ切り替え */}
          <Tabs defaultValue="otp" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="otp" className="text-xs md:text-sm flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                メールコード
                <span className="ml-1 px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] rounded-full font-bold">推奨</span>
              </TabsTrigger>
              <TabsTrigger value="password" className="text-xs md:text-sm flex items-center gap-1">
                <Lock className="h-3.5 w-3.5" />
                パスワード
              </TabsTrigger>
            </TabsList>

            {/* Email OTPログイン */}
            <TabsContent value="otp" className="space-y-3">
              {otpError && (
                <Alert variant="destructive" className="border-destructive/20 bg-destructive/5" role="alert" aria-live="polite">
                  <Lock className="h-4 w-4" />
                  <AlertDescription className="text-destructive/90">{otpError}</AlertDescription>
                </Alert>
              )}

              {otpSuccess && (
                <Alert className="border-green-200 bg-green-50" role="alert" aria-live="polite">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{otpSuccess}</AlertDescription>
                </Alert>
              )}

              {!otpSent ? (
                <form onSubmit={handleSendOTP} className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800 flex items-start">
                      <Mail className="h-3.5 w-3.5 mr-1.5 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>完全無料＆アプリ不要！</strong><br />
                        メールで届く6桁のコードでログインできます。
                      </span>
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="otp-email" className="text-xs md:text-sm font-semibold text-foreground flex items-center">
                      <Mail className="h-3.5 w-3.5 mr-1.5 text-primary" />
                      メールアドレス
                    </Label>
                    <Input
                      id="otp-email"
                      type="email"
                      placeholder="例: yamada@example.com"
                      value={otpEmail}
                      onChange={(e) => setOtpEmail(e.target.value)}
                      required
                      disabled={otpLoading}
                      className="paint-input h-9 md:h-10 text-sm md:text-base border-border/60 focus:border-primary transition-all duration-300"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full paint-button h-9 md:h-10 text-sm md:text-base font-bold shadow-lg"
                    disabled={otpLoading}
                  >
                    {otpLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        送信中...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        認証コードを送信
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-xs text-green-800 flex items-start">
                      <CheckCircle className="h-3.5 w-3.5 mr-1.5 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>{otpEmail}</strong> に6桁のコードを送信しました。<br />
                        メールボックスをご確認ください。
                      </span>
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="otp-code" className="text-xs md:text-sm font-semibold text-foreground flex items-center">
                      <Key className="h-3.5 w-3.5 mr-1.5 text-primary" />
                      6桁の認証コード
                    </Label>
                    <Input
                      id="otp-code"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      placeholder="123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      disabled={otpLoading}
                      className="paint-input h-9 md:h-10 text-sm md:text-base border-border/60 focus:border-primary transition-all duration-300 text-center tracking-widest font-mono text-lg"
                      maxLength={6}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setOtpSent(false)
                        setOtpCode('')
                        setOtpError(null)
                        setOtpSuccess(null)
                      }}
                      className="flex-1 h-9 md:h-10 text-sm"
                      disabled={otpLoading}
                    >
                      戻る
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 paint-button h-9 md:h-10 text-sm md:text-base font-bold shadow-lg"
                      disabled={otpLoading || otpCode.length !== 6}
                    >
                      {otpLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          確認中...
                        </>
                      ) : (
                        <>
                          <Palette className="mr-2 h-4 w-4" />
                          ログイン
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </TabsContent>

            {/* パスワードログイン */}
            <TabsContent value="password" className="space-y-3">
              <form onSubmit={handleSignIn} role="form" aria-labelledby="signin-title" aria-describedby={error ? "signin-error" : undefined} className="space-y-3">
                {error && (
                  <Alert variant="destructive" className="border-destructive/20 bg-destructive/5" role="alert" aria-live="polite">
                    <Lock className="h-4 w-4" />
                    <AlertDescription id="signin-error" className="text-destructive/90">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  <div className="space-y-1.5">
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
                      disabled={loading}
                      aria-describedby={error ? "signin-error" : undefined}
                      aria-invalid={error ? "true" : "false"}
                      aria-label="メールアドレスを入力してください"
                      className="paint-input h-9 md:h-10 text-sm md:text-base border-border/60 focus:border-primary transition-all duration-300"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs md:text-sm font-semibold text-foreground flex items-center">
                      <Lock className="h-3.5 w-3.5 mr-1.5 text-primary" />
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
                      aria-describedby={error ? "signin-error" : undefined}
                      aria-invalid={error ? "true" : "false"}
                      aria-label="パスワードを入力してください"
                      className="paint-input h-9 md:h-10 text-sm md:text-base border-border/60 focus:border-primary transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="text-right">
                  <Link
                    href="/auth/reset-password"
                    className="text-sm text-primary hover:text-primary/80 font-medium paint-hover inline-flex items-center"
                    aria-label="パスワードリセットページに移動"
                  >
                    <Droplet className="h-3 w-3 mr-1" />
                    パスワードをお忘れですか？
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full paint-button h-9 md:h-10 text-sm md:text-base font-bold shadow-lg"
                  disabled={loading}
                  aria-label={loading ? "サインイン処理中です" : "Paintlyにサインインする"}
                  aria-describedby={error ? "signin-error" : undefined}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      サインイン中...
                    </>
                  ) : (
                    <>
                      <Palette className="mr-2 h-4 w-4" />
                      Paintlyにサインイン
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3 pt-3">

            {/* 区切り線 */}
            <div className="relative">
              <div className="relative flex justify-center text-xs uppercase font-semibold">
                <span className="bg-background px-3 text-muted-foreground/80">または</span>
              </div>
            </div>

            {/* Googleサインインボタン */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-9 md:h-10 text-sm md:text-base font-medium border-border/60 hover:bg-secondary/50 paint-hover transition-all duration-300"
              onClick={handleGoogleSignIn}
              disabled={loading}
              aria-label="Googleアカウントでサインインする"
              aria-describedby={error ? "signin-error" : undefined}
            >
              <GoogleIcon />
              Googleで始める
            </Button>

            {/* 新規登録リンク */}
            <div className="text-center p-2 md:p-3 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
              <p className="text-xs md:text-sm text-muted-foreground mb-1">
                まだアカウントをお持ちではありませんか？
              </p>
              <Link
                href="/auth/signup"
                className="text-primary hover:text-primary/80 font-bold paint-hover inline-flex items-center text-sm md:text-base"
                aria-label="新規アカウント作成ページに移動"
              >
                <Paintbrush className="mr-1.5 h-3.5 w-3.5" />
                今すぐ無料で始める
                <Droplet className="ml-1 h-3 w-3 animate-bounce" />
              </Link>
              <p className="text-xs text-muted-foreground/70 mt-1">
                3回まで無料で画像生成を試用できます
              </p>
            </div>

            {/* FAQリンク */}
            <div className="text-center pt-1">
              <Link
                href="/faq"
                className="text-xs text-muted-foreground hover:text-primary underline decoration-dotted underline-offset-4 transition-colors"
              >
                よくある質問を見る
              </Link>
            </div>
          </CardFooter>
      </Card>
      </div>
    </div>
  )
}