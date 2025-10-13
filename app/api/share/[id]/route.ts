import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: shareId } = await params

    // API Route用にservice_role keyを使用してクライアントを作成
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // 共有画像データを取得
    const { data: sharedImage, error: fetchError } = await supabase
      .from('shared_images')
      .select('*')
      .eq('id', shareId)
      .single()

    if (fetchError || !sharedImage) {
      return NextResponse.json(
        { error: '共有リンクが見つかりません' },
        { status: 404 }
      )
    }

    // 有効期限チェック
    const expiresAt = new Date(sharedImage.expires_at)
    const now = new Date()
    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'この共有リンクは有効期限が切れています' },
        { status: 410 }
      )
    }

    // 画像URLを解析
    let imageUrls: string[] = []
    try {
      imageUrls = JSON.parse(sharedImage.image_url)
    } catch (parseError) {
      return NextResponse.json(
        { error: '画像データの解析に失敗しました' },
        { status: 500 }
      )
    }

    // 各画像URLから署名付きURLを生成
    const signedUrls: string[] = []
    
    for (const url of imageUrls) {
      // URLからバケット名とパスを抽出
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/storage/v1/object/public/')
      
      if (pathParts.length < 2) {
        // URLが期待される形式でない場合は元のURLを使用
        signedUrls.push(url)
        continue
      }

      const [bucketName, ...filePath] = pathParts[1].split('/')
      const fileName = filePath.join('/')

      console.log('Attempting to create signed URL:', { bucketName, fileName })

      // 署名付きURLを生成（7日間有効）
      const { data: signedData, error: signError } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(fileName, 60 * 60 * 24 * 7) // 7日間

      if (signError || !signedData) {
        console.error('Error creating signed URL:', {
          error: signError,
          bucketName,
          fileName,
          url
        })
        // エラーの場合は元のURLを使用
        signedUrls.push(url)
      } else {
        console.log('Successfully created signed URL')
        signedUrls.push(signedData.signedUrl)
      }
    }

    // アクセスカウントを更新
    await supabase
      .from('shared_images')
      .update({ access_count: sharedImage.access_count + 1 })
      .eq('id', shareId)

    return NextResponse.json({
      id: sharedImage.id,
      imageUrls: signedUrls,
      expires_at: sharedImage.expires_at,
      access_count: sharedImage.access_count + 1,
      created_at: sharedImage.created_at,
    })
  } catch (error) {
    console.error('Unexpected error in share API:', error)
    return NextResponse.json(
      { error: '予期しないエラーが発生しました' },
      { status: 500 }
    )
  }
}
