'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Smartphone, QrCode, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import QRCode from 'qrcode'

export function MFASetup() {
  const [loading, setLoading] = useState(false)
  const [qrCode, setQrCode] = useState<string>('')
  const [secret, setSecret] = useState<string>('')
  const [factorId, setFactorId] = useState<string>('')
  const [verifyCode, setVerifyCode] = useState('')
  const [mfaEnabled, setMfaEnabled] = useState(false)
  const [enrolledFactors, setEnrolledFactors] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    checkMFAStatus()
  }, [])

  const checkMFAStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get enrolled factors
      const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors()

      if (factorsError) {
        console.error('Failed to list factors:', factorsError)
        return
      }

      if (factors && factors.totp) {
        setEnrolledFactors(factors.totp)
        setMfaEnabled(factors.totp.length > 0)
      }
    } catch (err) {
      console.error('MFA status check error:', err)
    }
  }

  const enrollMFA = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: `Paintly MFA ${new Date().toLocaleDateString('ja-JP')}`
      })

      if (enrollError) {
        setError(enrollError.message)
        setLoading(false)
        return
      }

      if (data) {
        setFactorId(data.id)
        setSecret(data.totp.secret)

        // Generate QR code
        const { data: { user } } = await supabase.auth.getUser()
        const email = user?.email || 'user@paintly.pro'
        const totpUri = data.totp.uri || `otpauth://totp/Paintly:${email}?secret=${data.totp.secret}&issuer=Paintly`

        const qrCodeDataUrl = await QRCode.toDataURL(totpUri)
        setQrCode(qrCodeDataUrl)
        setSuccess('QRコードを生成しました。Authenticatorアプリでスキャンしてください。')
      }
    } catch (err) {
      setError('MFA登録に失敗しました')
      console.error('MFA enrollment error:', err)
    } finally {
      setLoading(false)
    }
  }

  const verifyMFA = async () => {
    if (!verifyCode || verifyCode.length !== 6) {
      setError('6桁のコードを入力してください')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: factorId
      })

      if (challengeError) {
        setError(challengeError.message)
        setLoading(false)
        return
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: factorId,
        challengeId: challengeData.id,
        code: verifyCode
      })

      if (verifyError) {
        setError('確認コードが正しくありません')
        setLoading(false)
        return
      }

      setSuccess('2要素認証が有効になりました！')
      setMfaEnabled(true)
      setQrCode('')
      setVerifyCode('')
      await checkMFAStatus()
    } catch (err) {
      setError('検証に失敗しました')
      console.error('MFA verification error:', err)
    } finally {
      setLoading(false)
    }
  }

  const unenrollMFA = async (factorId: string) => {
    if (!confirm('本当に2要素認証を無効にしますか？セキュリティが低下します。')) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error: unenrollError } = await supabase.auth.mfa.unenroll({
        factorId: factorId
      })

      if (unenrollError) {
        setError(unenrollError.message)
        setLoading(false)
        return
      }

      setSuccess('2要素認証を無効にしました')
      await checkMFAStatus()
    } catch (err) {
      setError('無効化に失敗しました')
      console.error('MFA unenroll error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="paint-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle>2要素認証（MFA）</CardTitle>
        </div>
        <CardDescription>
          アカウントのセキュリティを強化するため、2要素認証を有効にすることを強く推奨します。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {!mfaEnabled && !qrCode && (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
              <div className="flex items-start gap-3">
                <Smartphone className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-semibold text-blue-900">2要素認証とは？</h4>
                  <p className="text-sm text-blue-800">
                    パスワードに加えて、スマートフォンのAuthenticatorアプリで生成される6桁のコードを使用してログインします。
                  </p>
                  <p className="text-sm text-blue-800">
                    推奨アプリ：Google Authenticator、Microsoft Authenticator、1Password、Authy
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={enrollMFA}
              disabled={loading}
              className="w-full paint-button"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  設定中...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  2要素認証を有効にする
                </>
              )}
            </Button>
          </div>
        )}

        {qrCode && !mfaEnabled && (
          <div className="space-y-4">
            <div className="text-center space-y-4">
              <div className="p-4 bg-white rounded-lg inline-block">
                <img src={qrCode} alt="QR Code" className="w-64 h-64" />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <QrCode className="h-4 w-4" />
                  Authenticatorアプリでこのコードをスキャン
                </Label>
                <p className="text-sm text-muted-foreground">
                  または、以下のシークレットキーを手動で入力：
                </p>
                <code className="block p-2 bg-muted rounded text-sm font-mono break-all">
                  {secret}
                </code>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verify-code">Authenticatorアプリに表示された6桁のコードを入力</Label>
              <Input
                id="verify-code"
                type="text"
                maxLength={6}
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="text-center text-2xl tracking-widest font-mono"
              />
            </div>

            <Button
              onClick={verifyMFA}
              disabled={loading || verifyCode.length !== 6}
              className="w-full paint-button"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  確認中...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  確認して有効化
                </>
              )}
            </Button>
          </div>
        )}

        {mfaEnabled && enrolledFactors.length > 0 && (
          <div className="space-y-4">
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                2要素認証が有効です。次回ログイン時から6桁のコードが必要になります。
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>登録済みデバイス</Label>
              {enrolledFactors.map((factor) => (
                <div key={factor.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-green-600" />
                    <span className="font-medium">{factor.friendly_name || 'Authenticator'}</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(factor.created_at).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => unenrollMFA(factor.id)}
                    disabled={loading}
                  >
                    無効化
                  </Button>
                </div>
              ))}
            </div>

            <div className="p-4 border rounded-lg bg-amber-50 border-amber-200">
              <p className="text-sm text-amber-900">
                <strong>推奨：</strong> バックアップ用に2つ目のデバイスを登録することをお勧めします。
                メインデバイスを紛失した場合でもアカウントにアクセスできます。
              </p>
              {enrolledFactors.length < 10 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={enrollMFA}
                  disabled={loading}
                  className="mt-2"
                >
                  別のデバイスを追加
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
