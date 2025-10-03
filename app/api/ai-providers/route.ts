/**
 * AIプロバイダー管理API
 * プロバイダーの取得、切り替え、ステータス確認
 */

import { NextRequest, NextResponse } from 'next/server'
import { getProviderManager, type ProviderType } from '@/lib/ai-providers'
import { errorLogger, retryManager, withErrorHandling } from '@/lib/error-management'

// Force dynamic rendering to ensure environment variables are accessible at runtime
export const dynamic = 'force-dynamic'

// GET: 利用可能なプロバイダー一覧と現在の設定を取得
export async function GET() {
  try {
    console.log('🔍 [AI Providers API] GET request received')
    
    // Cache Control: 短期間キャッシュでAPIパフォーマンス向上
    const cacheControl = 'public, max-age=60, s-maxage=300, stale-while-revalidate=600'
    
    const providerManager = getProviderManager()
    
    // 利用可能なプロバイダー一覧を取得
    const availableProviders = providerManager.getAvailableProviders()
    const currentProvider = providerManager.getCurrentProvider()
    const currentConfig = providerManager.getCurrentProviderConfig()
    
    // ヘルスチェックを実行（リトライ機能付き）
    const healthStatus = await retryManager.executeWithRetry(
      () => providerManager.healthCheck(),
      'api',
      { userId: 'system' }
    )
    
    console.log('📋 [AI Providers API] Available providers:', availableProviders.length)
    console.log('📍 [AI Providers API] Current provider:', currentProvider)
    
    const response = NextResponse.json({
      success: true,
      providers: availableProviders,
      currentProvider: currentProvider,
      currentConfig: currentConfig,
      healthStatus: healthStatus,
      totalProviders: availableProviders.length,
      enabledProviders: availableProviders.filter(p => p.enabled).length,
      cached: false, // クライアント側でキャッシュ状態を判定するため
      timestamp: Date.now()
    })
    
    // キャッシュヘッダーを設定
    response.headers.set('Cache-Control', cacheControl)
    response.headers.set('Vary', 'Accept, User-Agent')
    response.headers.set('X-Cache-Strategy', 'api-response-cache')
    
    return response
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    // Enhanced error logging with error management system
    errorLogger.log(
      error instanceof Error ? error : new Error(errorMessage),
      'api',
      {
        userId: 'system',
        url: '/api/ai-providers',
        retryCount: 0
      }
    )

    console.error('❌ [AI Providers API] GET error:', errorMessage)
    console.error('🔍 GET error details:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : 'No stack trace available',
      endpoint: 'GET /api/ai-providers'
    })

    return NextResponse.json(
      {
        success: false,
        error: 'プロバイダー情報の取得に失敗しました',
        details: errorMessage,
        providers: [],
        currentProvider: 'fal-ai', // フォールバック
        timestamp: new Date().toISOString(),
        errorType: 'api'
      },
      { status: 500 }
    )
  }
}

// POST: プロバイダーの切り替え
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 [AI Providers API] POST request received')
    
    const body = await request.json()
    const { provider } = body
    
    if (!provider) {
      return NextResponse.json(
        {
          success: false,
          error: 'プロバイダー名が指定されていません'
        },
        { status: 400 }
      )
    }
    
    // プロバイダー名の検証
    const validProviders: ProviderType[] = ['fal-ai', 'gemini']
    if (!validProviders.includes(provider)) {
      return NextResponse.json(
        {
          success: false,
          error: `無効なプロバイダー名です: ${provider}`,
          validProviders: validProviders
        },
        { status: 400 }
      )
    }
    
    console.log(`🔄 [AI Providers API] Switching to provider: ${provider}`)
    
    const providerManager = getProviderManager()
    
    // プロバイダーの切り替えを実行
    const switchSuccess = providerManager.setCurrentProvider(provider)
    
    if (!switchSuccess) {
      return NextResponse.json(
        {
          success: false,
          error: `プロバイダー '${provider}' への切り替えに失敗しました`,
          reason: 'プロバイダーが利用できないか、設定が無効です'
        },
        { status: 400 }
      )
    }
    
    // 切り替え後の状態を取得
    const newCurrentProvider = providerManager.getCurrentProvider()
    const newCurrentConfig = providerManager.getCurrentProviderConfig()
    
    console.log(`✅ [AI Providers API] Successfully switched to: ${newCurrentProvider}`)
    
    return NextResponse.json({
      success: true,
      message: `プロバイダーを ${newCurrentConfig?.displayName || provider} に切り替えました`,
      previousProvider: provider !== newCurrentProvider ? provider : null,
      currentProvider: newCurrentProvider,
      currentConfig: newCurrentConfig
    })
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    // Enhanced error logging with error management system
    errorLogger.log(
      error instanceof Error ? error : new Error(errorMessage),
      'api',
      {
        userId: 'system',
        url: request.url,
        retryCount: 0
      }
    )

    console.error('❌ [AI Providers API] POST error:', errorMessage)
    console.error('🔍 POST error details:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : 'No stack trace available',
      endpoint: 'POST /api/ai-providers',
      url: request.url
    })

    return NextResponse.json(
      {
        success: false,
        error: 'プロバイダーの切り替えに失敗しました',
        details: errorMessage,
        timestamp: new Date().toISOString(),
        errorType: 'api'
      },
      { status: 500 }
    )
  }
}

// PUT: プロバイダー設定の更新（将来の拡張用）
export async function PUT() {
  try {
    console.log('🔧 [AI Providers API] PUT request received')
    
    // 将来的には個別の設定更新機能を実装
    return NextResponse.json(
      {
        success: false,
        error: 'プロバイダー設定の更新機能は現在実装されていません'
      },
      { status: 501 }
    )
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    // Enhanced error logging with error management system
    errorLogger.log(
      error instanceof Error ? error : new Error(errorMessage),
      'api',
      {
        userId: 'system',
        url: '/api/ai-providers',
        retryCount: 0
      }
    )

    console.error('❌ [AI Providers API] PUT error:', errorMessage)
    console.error('🔍 PUT error details:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : 'No stack trace available',
      endpoint: 'PUT /api/ai-providers'
    })

    return NextResponse.json(
      {
        success: false,
        error: '設定の更新に失敗しました',
        details: errorMessage,
        timestamp: new Date().toISOString(),
        errorType: 'api'
      },
      { status: 500 }
    )
  }
}