'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ConversionEvents } from '@/lib/google-ads'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function PurchaseSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [tracked, setTracked] = useState(false)

  // URLパラメータから購入情報を取得
  const sessionId = searchParams.get('session_id')
  const planName = searchParams.get('plan')
  const amount = searchParams.get('amount')

  useEffect(() => {
    // 購入情報がある場合、コンバージョンをトラッキング
    if (sessionId && planName && amount && !tracked) {
      const numericAmount = parseInt(amount)

      if (!isNaN(numericAmount)) {
        // Google Ads コンバージョントラッキング
        ConversionEvents.purchase({
          planName,
          value: numericAmount,
          transactionId: sessionId,
        })

        setTracked(true)
        console.log('✅ 購入コンバージョン送信完了:', {
          planName,
          value: numericAmount,
          transactionId: sessionId,
        })
      }
    }
  }, [sessionId, planName, amount, tracked])

  // パラメータがない場合はダッシュボードへリダイレクト
  useEffect(() => {
    if (!sessionId && !planName) {
      const timer = setTimeout(() => {
        router.push('/dashboard')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [sessionId, planName, router])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 workshop-bg">
      <div className="paint-drips"></div>

      <Card className="paint-card max-w-2xl w-full relative z-10">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl sm:text-3xl" style={{ fontFamily: 'var(--font-handwritten)', fontWeight: 700, color: 'var(--brand)' }}>
            お支払いが完了しました！
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {planName ? `${planName}へのアップグレードが完了しました` : 'プランの変更が完了しました'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 購入情報表示 */}
          {planName && amount && (
            <div className="bg-gradient-to-br from-orange-50 to-pink-50 border-2 border-orange-200 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-3 text-orange-900">購入内容</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">プラン:</span>
                  <span className="font-semibold">{planName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">料金:</span>
                  <span className="font-semibold">¥{parseInt(amount).toLocaleString()} / 月</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">決済ID:</span>
                  <span className="font-mono text-xs">{sessionId?.substring(0, 20)}...</span>
                </div>
              </div>
            </div>
          )}

          {/* 次のステップ */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-3 text-blue-900">次のステップ</h3>
            <ul className="space-y-2 text-sm text-blue-900">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>新しいプランの機能がすぐにご利用いただけます</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>請求書はご登録のメールアドレスに送信されます</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>ダッシュボードで使用状況をご確認ください</span>
              </li>
            </ul>
          </div>

          {/* アクションボタン */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link href="/dashboard" className="flex-1">
              <Button className="paint-button w-full" size="lg">
                <span>ダッシュボードへ</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/customer/new" className="flex-1">
              <Button variant="outline" className="w-full" size="lg">
                早速使ってみる
              </Button>
            </Link>
          </div>

          {/* お問い合わせリンク */}
          <div className="text-center text-sm text-muted-foreground pt-4 border-t">
            <p>
              ご不明な点がございましたら、
              <Link href="/settings" className="text-primary hover:underline ml-1">
                お問い合わせ
              </Link>
              からご連絡ください。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
