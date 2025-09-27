import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId') || '33d3c85f-521a-4ee1-a7af-392d4f7bb997'

    const supabase = await createClient()

    // 最新の生成データを取得
    const { data, error } = await supabase
      .from('generations')
      .select('*')
      .eq('customer_page_id', customerId)
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // データを整理して返す
    const debugData = data?.map(item => ({
      id: item.id,
      status: item.status,
      created_at: item.created_at,
      original_image_url: item.original_image_url,
      generated_image_url: item.generated_image_url,
      gemini_response: item.gemini_response,
      urls_analysis: {
        has_original_url: !!item.original_image_url,
        has_generated_url: !!item.generated_image_url,
        original_is_placeholder: item.original_image_url === 'placeholder',
        original_is_valid_http: item.original_image_url?.startsWith('http'),
        generated_is_valid_http: item.generated_image_url?.startsWith('http'),
        gemini_has_image_url: !!item.gemini_response?.imageUrl,
        gemini_has_original_url: !!item.gemini_response?.originalImageUrl,
      }
    }))

    return NextResponse.json({
      success: true,
      customer_id: customerId,
      total_records: data?.length || 0,
      data: debugData
    })

  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}