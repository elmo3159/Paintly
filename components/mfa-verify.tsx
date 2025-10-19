'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Loader2, XCircle } from 'lucide-react'

interface MFAVerifyProps {
  factorId: string
  onSuccess?: () => void
}

export function MFAVerify({ factorId, onSuccess }: MFAVerifyProps) {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault()

    if (code.length !== 6) {
      setError('6桁のコードを入力してください')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create MFA challenge
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: factorId
      })

      if (challengeError) {
        setError('認証チャレンジの作成に失敗しました')
        setLoading(false)
        return
      }

      // Verify the code
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: factorId,
        challengeId: challengeData.id,
        code: code
      })

      if (verifyError) {
        setError('コードが正しくありません。もう一度お試しください。')
        setCode('')
        setLoading(false)
        return
      }

      // Success
      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('認証に失敗しました')
      console.error('MFA verification error:', err)
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md paint-card">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <Shield className="h-12 w-12 text-primary" />
        </div>
        <CardTitle>2要素認証</CardTitle>
        <CardDescription>
          Authenticatorアプリに表示されている6桁のコードを入力してください
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={verifyCode} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="mfa-code">認証コード</Label>
            <Input
              id="mfa-code"
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="text-center text-2xl tracking-widest font-mono"
              autoFocus
              required
              disabled={loading}
            />
            <p className="text-sm text-muted-foreground text-center">
              コードは30秒ごとに更新されます
            </p>
          </div>

          <Button
            type="submit"
            className="w-full paint-button"
            disabled={loading || code.length !== 6}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                確認中...
              </>
            ) : (
              '確認'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
