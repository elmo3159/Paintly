import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/share/create
 *
 * 選択された画像からコラージュを作成し、共有リンクを生成
 *
 * Request Body:
 * - generationIds: string[] - 生成画像のIDリスト
 * - customerPageId: string - 顧客ページID
 * - expiresInDays?: number - 有効期限（日数、デフォルト: 7日）
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // リクエストボディを解析
    const body = await request.json()
    const { generationIds, customerPageId, expiresInDays = 7 } = body

    // バリデーション
    if (!generationIds || !Array.isArray(generationIds) || generationIds.length === 0) {
      return NextResponse.json(
        { error: '少なくとも1つの画像を選択してください' },
        { status: 400 }
      )
    }

    if (!customerPageId) {
      return NextResponse.json(
        { error: '顧客ページIDが必要です' },
        { status: 400 }
      )
    }

    // 選択された生成画像を取得
    const { data: generations, error: fetchError } = await supabase
      .from('generations')
      .select('id, generated_image_url, original_image_url, customer_page_id')
      .in('id', generationIds)
      .eq('customer_page_id', customerPageId)
      .eq('status', 'completed')

    if (fetchError) {
      console.error('Error fetching generations:', fetchError)
      return NextResponse.json(
        { error: '画像の取得に失敗しました' },
        { status: 500 }
      )
    }

    if (!generations || generations.length === 0) {
      return NextResponse.json(
        { error: '指定された画像が見つかりません' },
        { status: 404 }
      )
    }

    // すべての画像にgenerated_image_urlがあることを確認
    const imageUrls = generations
      .map(g => g.generated_image_url)
      .filter((url): url is string => !!url)

    if (imageUrls.length === 0) {
      return NextResponse.json(
        { error: '有効な画像URLが見つかりません' },
        { status: 400 }
      )
    }

    // 画像URLを配列として保存（コラージュはクライアント側で生成）
    // これにより、サーバー側でのCanvasAPI使用を回避
    const imageUrlsJson = JSON.stringify(imageUrls)

    // 有効期限を計算
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)

    // shared_imagesテーブルにレコードを作成
    const { data: sharedImage, error: insertError } = await supabase
      .from('shared_images')
      .insert({
        user_id: user.id,
        customer_page_id: customerPageId,
        image_url: imageUrlsJson, // JSON配列として保存
        generation_ids: generationIds,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating shared image:', insertError)
      return NextResponse.json(
        { error: '共有リンクの作成に失敗しました' },
        { status: 500 }
      )
    }

    // 共有URLを生成
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
    const shareUrl = `${baseUrl}/share/${sharedImage.id}`

    return NextResponse.json({
      success: true,
      shareId: sharedImage.id,
      shareUrl,
      expiresAt: expiresAt.toISOString(),
      imageCount: imageUrls.length
    })
  } catch (error) {
    console.error('Unexpected error in /api/share/create:', error)
    return NextResponse.json(
      { error: '予期しないエラーが発生しました' },
      { status: 500 }
    )
  }
}
