'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, ArrowLeft } from 'lucide-react'

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            パスワードをリセット
          </CardTitle>
          <CardDescription className="text-center">
            登録済みのメールアドレスにパスワードリセット用のリンクを送信します
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleResetPassword}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  パスワードリセット用のメールを送信しました。
                  メールボックスをご確認ください。
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            {!success && (
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    送信中...
                  </>
                ) : (
                  'リセットメールを送信'
                )}
              </Button>
            )}
            <Link
              href="/auth/signin"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              サインインに戻る
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}