import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Service roleクライアント（データベース操作用）
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'ユーザーIDが必要です' },
        { status: 400 }
      )
    }

    // user_securityレコードをリセット
    const { data: existingData } = await supabaseAdmin
      .from('user_security')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (existingData) {
      // レコードが存在する場合は更新
      const { error: updateError } = await supabaseAdmin
        .from('user_security')
        .update({
          failed_login_attempts: 0,
          locked_until: null
        })
        .eq('user_id', userId)

      if (updateError) {
        console.error('ログイン失敗リセットエラー:', updateError)
        return NextResponse.json(
          { error: 'リセットに失敗しました' },
          { status: 500 }
        )
      }
    } else {
      // レコードが存在しない場合は作成
      const { error: insertError } = await supabaseAdmin
        .from('user_security')
        .insert({
          user_id: userId,
          failed_login_attempts: 0,
          locked_until: null
        })

      if (insertError) {
        console.error('ログイン失敗リセット（作成）エラー:', insertError)
        // エラーでも処理は続行（セキュリティレコードがないだけなので）
      }
    }

    return NextResponse.json(
      { success: true, message: 'ログイン失敗回数をリセットしました' },
      { status: 200 }
    )

  } catch (error) {
    console.error('ログイン失敗リセットエラー:', error)
    return NextResponse.json(
      { error: 'リセット処理に失敗しました' },
      { status: 500 }
    )
  }
}
