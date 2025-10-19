import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Service roleクライアント（データベース操作用）
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const MAX_ATTEMPTS = 10
const LOCK_DURATION_MINUTES = 30

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
        { success: false, error: 'ユーザーが見つかりません' },
        { status: 200 }
      )
    }

    const user = userData.users.find(u => u.email === email)

    if (!user) {
      // ユーザーが存在しない場合は処理を中断（タイミング攻撃対策）
      return NextResponse.json(
        { success: true },
        { status: 200 }
      )
    }

    // 現在のセキュリティレコードを取得
    const { data: securityData, error: fetchError } = await supabaseAdmin
      .from('user_security')
      .select('id, failed_login_attempts, locked_until')
      .eq('user_id', user.id)
      .single()

    let currentAttempts = 0

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('セキュリティデータ取得エラー:', fetchError)
    }

    if (securityData) {
      currentAttempts = securityData.failed_login_attempts || 0
    }

    const newAttempts = currentAttempts + 1
    const shouldLock = newAttempts >= MAX_ATTEMPTS

    // ロック時刻を計算（30分後）
    const lockedUntil = shouldLock
      ? new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000).toISOString()
      : null

    // レコードが存在する場合は更新、存在しない場合は作成
    if (securityData) {
      const { error: updateError } = await supabaseAdmin
        .from('user_security')
        .update({
          failed_login_attempts: newAttempts,
          locked_until: lockedUntil
        })
        .eq('user_id', user.id)

      if (updateError) {
        console.error('セキュリティデータ更新エラー:', updateError)
        return NextResponse.json(
          { error: '更新に失敗しました' },
          { status: 500 }
        )
      }
    } else {
      const { error: insertError } = await supabaseAdmin
        .from('user_security')
        .insert({
          user_id: user.id,
          failed_login_attempts: newAttempts,
          locked_until: lockedUntil
        })

      if (insertError) {
        console.error('セキュリティデータ作成エラー:', insertError)
        return NextResponse.json(
          { error: '作成に失敗しました' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      {
        success: true,
        attempts: newAttempts,
        remainingAttempts: Math.max(0, MAX_ATTEMPTS - newAttempts),
        isLocked: shouldLock,
        lockedUntil: lockedUntil
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('ログイン失敗トラッキングエラー:', error)
    return NextResponse.json(
      { error: 'トラッキングに失敗しました' },
      { status: 500 }
    )
  }
}
