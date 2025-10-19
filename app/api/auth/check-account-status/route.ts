import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Service roleクライアント（データベース操作用）
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'メールアドレスが必要です' },
        { status: 400 }
      )
    }

    // メールアドレスからユーザーIDを取得
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers()

    if (userError) {
      console.error('ユーザー検索エラー:', userError)
      return NextResponse.json(
        { isLocked: false, message: 'ユーザーが見つかりません' },
        { status: 200 }
      )
    }

    const user = userData.users.find(u => u.email === email)

    if (!user) {
      // ユーザーが存在しない場合はロックされていないとして扱う
      return NextResponse.json(
        { isLocked: false, message: 'ユーザーが見つかりません' },
        { status: 200 }
      )
    }

    // user_securityテーブルからロック状態を確認
    const { data: securityData, error: securityError } = await supabaseAdmin
      .from('user_security')
      .select('failed_login_attempts, locked_until')
      .eq('user_id', user.id)
      .single()

    if (securityError && securityError.code !== 'PGRST116') { // PGRST116 = レコードが見つからない
      console.error('セキュリティデータ取得エラー:', securityError)
      return NextResponse.json(
        { isLocked: false },
        { status: 200 }
      )
    }

    // レコードが存在しない場合はロックされていない
    if (!securityData) {
      return NextResponse.json(
        { isLocked: false, attempts: 0 },
        { status: 200 }
      )
    }

    // ロック期限を確認
    const now = new Date()
    const lockedUntil = securityData.locked_until ? new Date(securityData.locked_until) : null

    if (lockedUntil && now < lockedUntil) {
      const remainingMinutes = Math.ceil((lockedUntil.getTime() - now.getTime()) / 60000)
      return NextResponse.json(
        {
          isLocked: true,
          lockedUntil: lockedUntil.toISOString(),
          remainingMinutes,
          message: `アカウントがロックされています。${remainingMinutes}分後に再試行してください。`
        },
        { status: 200 }
      )
    }

    // ロック期限が過ぎていればロック解除（失敗回数もリセット）
    if (lockedUntil && now >= lockedUntil) {
      await supabaseAdmin
        .from('user_security')
        .update({
          failed_login_attempts: 0,
          locked_until: null
        })
        .eq('user_id', user.id)

      return NextResponse.json(
        { isLocked: false, attempts: 0, message: 'ロックが解除されました' },
        { status: 200 }
      )
    }

    // ロックされていない
    return NextResponse.json(
      {
        isLocked: false,
        attempts: securityData.failed_login_attempts || 0,
        remainingAttempts: Math.max(0, 10 - (securityData.failed_login_attempts || 0))
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('アカウント状態チェックエラー:', error)
    return NextResponse.json(
      { error: 'アカウント状態の確認に失敗しました' },
      { status: 500 }
    )
  }
}
