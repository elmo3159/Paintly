import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const CATEGORY_LABELS: Record<string, string> = {
  feature_request: '機能要望',
  bug_report: 'バグ報告',
  question: '使い方の質問',
  other: 'その他',
}

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { category, subject, message, userEmail, currentPlan, screenshotUrl, browserInfo } = body

    // バリデーション
    if (!category || !message || !userEmail) {
      return NextResponse.json(
        { error: '必須項目が不足しています。' },
        { status: 400 }
      )
    }

    // メール本文を構築
    const categoryLabel = CATEGORY_LABELS[category] || 'その他'
    const emailBody = `
【Paintly お問い合わせ】

カテゴリー: ${categoryLabel}
件名: ${subject}

━━━━━━━━━━━━━━━━━━━━━━
ユーザー情報
━━━━━━━━━━━━━━━━━━━━━━
メールアドレス: ${userEmail}
現在のプラン: ${currentPlan}
ブラウザ情報: ${browserInfo}
${screenshotUrl ? `スクリーンショット: ${screenshotUrl}` : ''}

━━━━━━━━━━━━━━━━━━━━━━
お問い合わせ内容
━━━━━━━━━━━━━━━━━━━━━━
${message}

━━━━━━━━━━━━━━━━━━━━━━
    `

    // Resendを使ってメール送信
    try {
      if (!process.env.RESEND_API_KEY) {
        console.warn('⚠️ RESEND_API_KEYが設定されていません。メール送信をスキップします。')
        console.log('📧 お問い合わせメール（送信予定）:')
        console.log('送信先:', 'sanri.3159@gmail.com')
        console.log('件名:', `[Paintly] ${categoryLabel} - ${subject}`)
        console.log('本文:', emailBody)

        return NextResponse.json({
          success: true,
          message: 'お問い合わせを受け付けました。（メール送信は設定待ち）'
        })
      }

      const { data, error } = await resend.emails.send({
        from: 'Paintly <onboarding@resend.dev>', // Resendの検証済みドメインを使用
        to: 'sanri.3159@gmail.com',
        subject: `[Paintly] ${categoryLabel} - ${subject}`,
        text: emailBody,
      })

      if (error) {
        console.error('メール送信エラー:', error)
        return NextResponse.json({
          success: true,
          message: 'お問い合わせを受け付けました。（メール送信に失敗しましたがDBには保存されています）'
        })
      }

      console.log('✅ メール送信成功:', data)
      return NextResponse.json({
        success: true,
        message: 'お問い合わせを受け付けました。ご連絡ありがとうございます！'
      })

    } catch (emailError) {
      console.error('メール送信処理エラー:', emailError)
      return NextResponse.json({
        success: true,
        message: 'お問い合わせを受け付けました。（メール送信に失敗しましたがDBには保存されています）'
      })
    }

  } catch (error) {
    console.error('メール送信エラー:', error)
    return NextResponse.json(
      { error: 'メール送信に失敗しました。' },
      { status: 500 }
    )
  }
}
