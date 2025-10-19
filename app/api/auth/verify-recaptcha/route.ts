import { NextRequest, NextResponse } from 'next/server'

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY
const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify'
const MINIMUM_SCORE = 0.5 // reCAPTCHA v3のスコア閾値（0.0～1.0）

export async function POST(request: NextRequest) {
  try {
    const { token, action } = await request.json()

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'reCAPTCHAトークンが必要です' },
        { status: 400 }
      )
    }

    // reCAPTCHAシークレットキーが設定されていない場合はスキップ
    if (!RECAPTCHA_SECRET_KEY) {
      console.warn('⚠️ reCAPTCHA secret key is not configured. Verification skipped.')
      return NextResponse.json(
        {
          success: true,
          score: 1.0,
          message: 'reCAPTCHA verification skipped (not configured)'
        },
        { status: 200 }
      )
    }

    // Google reCAPTCHA APIに検証リクエストを送信
    const verifyResponse = await fetch(RECAPTCHA_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: RECAPTCHA_SECRET_KEY,
        response: token,
      }).toString(),
    })

    const verifyData = await verifyResponse.json()

    // 検証結果を確認
    if (!verifyData.success) {
      console.error('reCAPTCHA verification failed:', verifyData['error-codes'])
      return NextResponse.json(
        {
          success: false,
          error: 'reCAPTCHA検証に失敗しました',
          errorCodes: verifyData['error-codes']
        },
        { status: 400 }
      )
    }

    // スコアが閾値未満の場合は失敗
    const score = verifyData.score || 0

    if (score < MINIMUM_SCORE) {
      console.warn(`reCAPTCHA score too low: ${score} (action: ${action})`)
      return NextResponse.json(
        {
          success: false,
          error: 'セキュリティ検証に失敗しました。もう一度お試しください。',
          score: score
        },
        { status: 403 }
      )
    }

    // アクションの一致確認（オプション）
    if (action && verifyData.action !== action) {
      console.warn(`reCAPTCHA action mismatch: expected ${action}, got ${verifyData.action}`)
    }

    // 検証成功
    return NextResponse.json(
      {
        success: true,
        score: score,
        action: verifyData.action,
        message: 'reCAPTCHA検証に成功しました'
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('reCAPTCHA verification error:', error)
    return NextResponse.json(
      { success: false, error: '検証処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
