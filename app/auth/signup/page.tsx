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
import { Loader2, CheckCircle } from 'lucide-react'

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
            name: name,
          })

        if (dbError) {
          console.error('Error creating user record:', dbError)
        }

        // Create free plan subscription
        const { data: plans } = await supabase
          .from('plans')
          .select('id')
          .eq('name', '無料プラン')
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            新規アカウント登録
          </CardTitle>
          <CardDescription className="text-center">
            Paintlyで塗装シミュレーションを始めましょう
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignUp}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  アカウントが作成されました！ダッシュボードへ移動します...
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">お名前</Label>
              <Input
                id="name"
                type="text"
                placeholder="山田太郎"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading || success}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading || success}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                placeholder="6文字以上"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading || success}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">パスワード（確認）</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="パスワードを再入力"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading || success}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              アカウント登録後、3回まで無料で画像生成をお試しいただけます。
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={loading || success}
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
                '新規登録'
              )}
            </Button>
            <div className="text-center text-sm">
              すでにアカウントをお持ちの方は{' '}
              <Link
                href="/auth/signin"
                className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium"
              >
                サインイン
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}