import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 認証不要のパブリックデバッグエンドポイント
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId') || searchParams.get('customer_id')
    const showAll = searchParams.get('all') === 'true'

    // Service roleクライアントを直接作成してRLSをバイパス
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing Supabase configuration'
      }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    console.log('🔍 Debug API: Searching for data:', { customerId, showAll })

    let query = supabase.from('generations').select('*')
    
    if (showAll) {
      console.log('📊 Fetching ALL generation records')
      query = query.order('created_at', { ascending: false }).limit(20)
    } else if (customerId) {
      console.log('📊 Fetching records for customer:', customerId)
      query = query.eq('customer_page_id', customerId).order('created_at', { ascending: false }).limit(5)
    } else {
      console.log('📊 Fetching latest records (no customer specified)')
      query = query.order('created_at', { ascending: false }).limit(10)
    }

    const { data, error } = await query

    console.log('📊 Debug API result:', { 
      data: data?.length, 
      error: error?.message,
      customer_id: customerId 
    })

    if (error) {
      console.error('❌ Debug API error:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      }, { status: 500 })
    }

    // データを詳細に分析
    const debugData = data?.map((item, index) => {
      const geminiResponse = item.gemini_response
      return {
        index: index + 1,
        id: item.id,
        status: item.status,
        created_at: item.created_at,
        completed_at: item.completed_at,

        // URL詳細分析
        urls: {
          original_image_url: item.original_image_url,
          generated_image_url: item.generated_image_url,
          analysis: {
            has_original: !!item.original_image_url,
            has_generated: !!item.generated_image_url,
            original_length: item.original_image_url?.length || 0,
            generated_length: item.generated_image_url?.length || 0,
            original_is_placeholder: item.original_image_url === 'placeholder',
            original_starts_with_http: item.original_image_url?.startsWith('http'),
            generated_starts_with_http: item.generated_image_url?.startsWith('http'),
            original_preview: item.original_image_url?.substring(0, 100),
            generated_preview: item.generated_image_url?.substring(0, 100),
          }
        },

        // Gemini Response分析
        gemini_response: {
          raw: geminiResponse,
          analysis: {
            has_gemini_response: !!geminiResponse,
            has_image_url: !!geminiResponse?.imageUrl,
            has_original_url: !!geminiResponse?.originalImageUrl,
            image_url_length: geminiResponse?.imageUrl?.length || 0,
            original_url_length: geminiResponse?.originalImageUrl?.length || 0,
            image_url_preview: geminiResponse?.imageUrl?.substring(0, 100),
            original_url_preview: geminiResponse?.originalImageUrl?.substring(0, 100),
          }
        },

        // 設定値
        settings: {
          wall_color: item.wall_color,
          roof_color: item.roof_color,
          door_color: item.door_color,
          weather: item.weather,
        },

        error_message: item.error_message
      }
    })

    return NextResponse.json({
      success: true,
      customer_id: customerId,
      total_records: data?.length || 0,
      timestamp: new Date().toISOString(),
      data: debugData,

      // 統計情報
      statistics: {
        completed_count: data?.filter(item => item.status === 'completed').length || 0,
        processing_count: data?.filter(item => item.status === 'processing').length || 0,
        failed_count: data?.filter(item => item.status === 'failed').length || 0,
        has_valid_original: data?.filter(item =>
          item.original_image_url &&
          item.original_image_url !== 'placeholder' &&
          item.original_image_url.startsWith('http')
        ).length || 0,
        has_valid_generated: data?.filter(item =>
          item.generated_image_url &&
          item.generated_image_url.startsWith('http')
        ).length || 0,
      }
    })

  } catch (error) {
    console.error('Public Debug API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}