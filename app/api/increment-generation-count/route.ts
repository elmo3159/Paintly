import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // 現在のサブスクリプションを取得
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select(`
        id,
        generation_count,
        plan:plans (
          generation_limit
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (subError || !subscription) {
      return NextResponse.json(
        { error: 'アクティブなプランがありません' },
        { status: 403 }
      )
    }

    const plan = subscription.plan as any
    const generationLimit = plan.generation_limit
    const currentCount = subscription.generation_count

    // 無制限プランでない場合は制限チェック
    if (generationLimit !== -1 && currentCount >= generationLimit) {
      return NextResponse.json(
        { error: '今月の生成回数上限に達しました' },
        { status: 403 }
      )
    }

    // 生成回数をインクリメント
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        generation_count: currentCount + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscription.id)

    if (updateError) {
      console.error('Generation count increment error:', updateError)
      return NextResponse.json(
        { error: '生成回数の更新に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        newCount: currentCount + 1,
        remaining: generationLimit === -1 ? -1 : generationLimit - (currentCount + 1),
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Increment generation count error:', error)
    return NextResponse.json(
      { error: '生成回数の更新に失敗しました' },
      { status: 500 }
    )
  }
}
