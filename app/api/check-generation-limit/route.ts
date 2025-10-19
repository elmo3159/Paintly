import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
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

    // 現在のサブスクリプションとプラン情報を取得
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select(`
        id,
        generation_count,
        status,
        plan:plans (
          name,
          generation_limit
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (subError || !subscription) {
      return NextResponse.json(
        {
          canGenerate: false,
          error: 'アクティブなプランがありません',
          remaining: 0,
        },
        { status: 403 }
      )
    }

    const plan = subscription.plan as any
    const generationLimit = plan.generation_limit
    const generationCount = subscription.generation_count

    // 無制限プランの場合
    if (generationLimit === -1) {
      return NextResponse.json(
        {
          canGenerate: true,
          remaining: -1, // 無制限
          used: generationCount,
          limit: -1,
        },
        { status: 200 }
      )
    }

    // 制限チェック
    const canGenerate = generationCount < generationLimit
    const remaining = generationLimit - generationCount

    if (!canGenerate) {
      return NextResponse.json(
        {
          canGenerate: false,
          error: '今月の生成回数上限に達しました',
          remaining: 0,
          used: generationCount,
          limit: generationLimit,
        },
        { status: 403 }
      )
    }

    return NextResponse.json(
      {
        canGenerate: true,
        remaining,
        used: generationCount,
        limit: generationLimit,
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Generation limit check error:', error)
    return NextResponse.json(
      { error: '生成回数のチェックに失敗しました' },
      { status: 500 }
    )
  }
}
