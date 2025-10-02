import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { notificationEngine, processErrorNotification, type NotificationContext } from '@/lib/notification-engine'
import { errorAnalyzer } from '@/lib/error-analysis'

// グローバル型定義の拡張
declare global {
  // eslint-disable-next-line no-var
  var errorStats: Record<string, Record<string, number>> | undefined
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface ErrorReport {
  id: string
  timestamp: string
  errorType: string
  message: string
  userAgent: string
  url: string
  userId?: string
  stackTrace?: string
  retryCount: number
  sessionId: string
  viewport: {
    width: number
    height: number
  }
  performance: {
    loadTime: number
    domContentLoaded: number
    memoryUsage?: {
      used: number
      total: number
      limit: number
    }
  } | null
  component?: string
  context?: {
    actionType?: string
    customData?: any
  }
}

/**
 * エラーレポート収集API
 * クライアントサイドからのエラーレポートを受信し、ログに記録
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🚨 [Error Reporting API] Received error report')
    
    const errorReport: ErrorReport = await request.json()
    
    // 基本的なバリデーション
    if (!errorReport.id || !errorReport.timestamp || !errorReport.message) {
      return NextResponse.json(
        { error: '必須フィールドが不足しています' },
        { status: 400 }
      )
    }

    // 本番環境でのみSupabaseに保存
    if (process.env.NODE_ENV === 'production' && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      
      // エラーログテーブルに保存
      const { error: insertError } = await supabase
        .from('error_logs')
        .insert({
          error_id: errorReport.id,
          timestamp: errorReport.timestamp,
          error_type: errorReport.errorType,
          message: errorReport.message,
          user_agent: errorReport.userAgent,
          url: errorReport.url,
          user_id: errorReport.userId,
          stack_trace: errorReport.stackTrace,
          retry_count: errorReport.retryCount,
          session_id: errorReport.sessionId,
          viewport_width: errorReport.viewport.width,
          viewport_height: errorReport.viewport.height,
          load_time: errorReport.performance?.loadTime,
          dom_content_loaded: errorReport.performance?.domContentLoaded,
          memory_used: errorReport.performance?.memoryUsage?.used,
          memory_total: errorReport.performance?.memoryUsage?.total,
          memory_limit: errorReport.performance?.memoryUsage?.limit,
          created_at: new Date().toISOString()
        })
      
      if (insertError) {
        console.error('❌ [Error Reporting] Failed to insert error log:', insertError)
      } else {
        console.log('✅ [Error Reporting] Error log saved to database')
      }
    }

    // 開発環境では詳細ログを出力
    if (process.env.NODE_ENV === 'development') {
      console.group('🐛 [Error Report] ' + errorReport.errorType.toUpperCase())
      console.log('📋 Error ID:', errorReport.id)
      console.log('⏰ Timestamp:', errorReport.timestamp)
      console.log('📱 User Agent:', errorReport.userAgent)
      console.log('🔗 URL:', errorReport.url)
      console.log('💬 Message:', errorReport.message)
      console.log('👤 User ID:', errorReport.userId || 'Unknown')
      console.log('🔧 Session ID:', errorReport.sessionId)
      console.log('📺 Viewport:', `${errorReport.viewport.width}x${errorReport.viewport.height}`)
      
      if (errorReport.performance) {
        console.log('⚡ Performance:', {
          loadTime: errorReport.performance.loadTime + 'ms',
          domContentLoaded: errorReport.performance.domContentLoaded + 'ms',
          memoryUsage: errorReport.performance.memoryUsage ? 
            `${Math.round(errorReport.performance.memoryUsage.used / 1024 / 1024)}MB / ${Math.round(errorReport.performance.memoryUsage.total / 1024 / 1024)}MB` : 
            'N/A'
        })
      }
      
      if (errorReport.stackTrace) {
        console.log('📚 Stack Trace:')
        console.log(errorReport.stackTrace)
      }
      console.groupEnd()
    }

    // 通知エンジンの初期化（一度だけ実行）
    notificationEngine.initialize()

    // エラー分析とコンテキストの構築
    const errorContext: NotificationContext = {
      errorReport: {
        id: errorReport.id,
        errorType: errorReport.errorType,
        severity: determineSeverity(errorReport.errorType, errorReport.message),
        message: errorReport.message,
        stackTrace: errorReport.stackTrace,
        componentName: errorReport.component,
        actionType: errorReport.context?.actionType,
        url: errorReport.url,
        sessionId: errorReport.sessionId,
        timestamp: errorReport.timestamp,
        userId: errorReport.userId
      },
      systemMetrics: {
        activeUsers: await getActiveUserCount(),
        errorRate: await getRecentErrorRate(),
        systemLoad: 0.5 // 実装時に実際の値を取得
      },
      similar: await getSimilarErrors(errorReport)
    }

    // 新しい通知エンジンでエラー通知処理
    await processErrorNotification(errorContext)

    // エラー分析・パターン検出
    try {
      await errorAnalyzer.analyzeError({
        id: errorReport.id,
        errorType: errorReport.errorType,
        message: errorReport.message,
        stackTrace: errorReport.stackTrace,
        componentName: errorReport.component,
        url: errorReport.url,
        timestamp: errorReport.timestamp,
        userId: errorReport.userId,
        sessionId: errorReport.sessionId,
        context: errorReport.context
      })
    } catch (analysisError) {
      console.error('❌ [Error Reporting] Error analysis failed:', analysisError)
    }

    // エラー統計の更新（今後実装可能）
    await updateErrorStatistics(errorReport)

    return NextResponse.json({ 
      success: true, 
      message: 'エラーレポートを受信しました',
      errorId: errorReport.id
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('❌ [Error Reporting API] Processing error:', errorMessage)
    
    return NextResponse.json(
      { 
        error: 'エラーレポートの処理に失敗しました',
        details: errorMessage 
      },
      { status: 500 }
    )
  }
}

/**
 * エラー統計情報の取得（管理者用）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '24h' // 24h, 7d, 30d
    const errorType = searchParams.get('type')
    
    // 簡単な認証チェック（本番環境では適切な認証を実装）
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    console.log('📊 [Error Reporting API] Getting error statistics')

    // 開発環境では統計情報をモックで返す
    if (process.env.NODE_ENV === 'development') {
      const mockStats = {
        period,
        totalErrors: Math.floor(Math.random() * 100),
        errorsByType: {
          javascript: Math.floor(Math.random() * 30),
          promise: Math.floor(Math.random() * 20),
          resource: Math.floor(Math.random() * 15),
          api: Math.floor(Math.random() * 10),
          auth: Math.floor(Math.random() * 5),
          critical: Math.floor(Math.random() * 3)
        },
        errorTrends: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          count: Math.floor(Math.random() * 10)
        })),
        topErrors: [
          { message: 'Network request failed', count: 15 },
          { message: 'Cannot read property of undefined', count: 12 },
          { message: 'Failed to fetch', count: 8 }
        ]
      }
      
      return NextResponse.json(mockStats)
    }

    // 本番環境ではSupabaseから実際の統計を取得
    if (supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      
      // 期間の計算
      const now = new Date()
      const startTime = new Date()
      switch (period) {
        case '7d':
          startTime.setDate(now.getDate() - 7)
          break
        case '30d':
          startTime.setDate(now.getDate() - 30)
          break
        default: // 24h
          startTime.setHours(now.getHours() - 24)
      }

      let query = supabase
        .from('error_logs')
        .select('*')
        .gte('created_at', startTime.toISOString())

      if (errorType) {
        query = query.eq('error_type', errorType)
      }

      const { data: errorLogs, error: fetchError } = await query

      if (fetchError) {
        console.error('❌ [Error Reporting] Failed to fetch error logs:', fetchError)
        throw fetchError
      }

      // 統計情報の計算
      const totalErrors = errorLogs?.length || 0
      const errorsByType = errorLogs?.reduce((acc: Record<string, number>, log) => {
        acc[log.error_type] = (acc[log.error_type] || 0) + 1
        return acc
      }, {}) || {}

      const stats = {
        period,
        totalErrors,
        errorsByType,
        startTime: startTime.toISOString(),
        endTime: now.toISOString()
      }

      return NextResponse.json(stats)
    }

    return NextResponse.json({
      error: 'データベース接続が設定されていません'
    }, { status: 503 })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('❌ [Error Reporting API] Failed to get statistics:', errorMessage)
    
    return NextResponse.json(
      { 
        error: '統計情報の取得に失敗しました',
        details: errorMessage 
      },
      { status: 500 }
    )
  }
}

/**
 * クリティカルエラーの通知送信
 */
async function sendCriticalErrorNotification(errorReport: ErrorReport): Promise<void> {
  try {
    // Slack Webhook URL (環境変数から取得)
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL
    
    if (slackWebhookUrl) {
      const slackMessage = {
        text: `🚨 Paintly クリティカルエラー発生`,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*🚨 クリティカルエラーが発生しました*\n\n*エラータイプ:* ${errorReport.errorType}\n*メッセージ:* ${errorReport.message}\n*URL:* ${errorReport.url}\n*セッションID:* ${errorReport.sessionId}\n*タイムスタンプ:* ${errorReport.timestamp}`
            }
          }
        ]
      }

      await fetch(slackWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(slackMessage)
      })

      console.log('✅ [Error Reporting] Critical error notification sent to Slack')
    }
  } catch (error) {
    console.error('❌ [Error Reporting] Failed to send notification:', error)
  }
}

/**
 * エラー統計の更新
 */
async function updateErrorStatistics(errorReport: ErrorReport): Promise<void> {
  try {
    // Redis やメモリ内での統計更新（今後実装可能）
    // 現在の時間での統計カウンタを更新
    const hourKey = new Date().getHours()
    
    // 簡単なメモリ内統計（本番環境では永続化が必要）
    if (typeof globalThis !== 'undefined') {
      if (!globalThis.errorStats) {
        globalThis.errorStats = {}
      }
      
      const stats = globalThis.errorStats
      const today = new Date().toISOString().split('T')[0]
      
      if (!stats[today]) {
        stats[today] = {}
      }
      
      if (!stats[today][errorReport.errorType]) {
        stats[today][errorReport.errorType] = 0
      }
      
      stats[today][errorReport.errorType]++
    }
  } catch (error) {
    console.error('❌ [Error Reporting] Failed to update statistics:', error)
  }
}

/**
 * エラーの重要度を判定
 */
function determineSeverity(errorType: string, message: string): string {
  // クリティカルなエラータイプ
  if (errorType === 'critical' || errorType === 'auth') {
    return 'critical'
  }

  // APIエラーは通常高優先度
  if (errorType === 'api') {
    return 'high'
  }

  // エラーメッセージによる判定
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
    return 'medium'
  }

  if (lowerMessage.includes('permission') || lowerMessage.includes('unauthorized')) {
    return 'high'
  }

  if (lowerMessage.includes('memory') || lowerMessage.includes('quota')) {
    return 'high'
  }

  return 'low'
}

/**
 * アクティブユーザー数の取得
 */
async function getActiveUserCount(): Promise<number> {
  try {
    if (process.env.NODE_ENV === 'development') {
      return Math.floor(Math.random() * 50) + 10 // 開発環境では模擬値
    }

    // 本番環境では実際のデータベースクエリを実装
    if (supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      // 過去1時間のアクティブセッション数を取得
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

      const { data, error } = await supabase
        .from('error_logs')
        .select('session_id')
        .gte('created_at', oneHourAgo)

      if (error) {
        console.error('❌ Failed to get active user count:', error)
        return 0
      }

      // JavaScriptでユニークなsession_idをカウント
      const uniqueSessions = new Set(data?.map(item => item.session_id) || [])
      return uniqueSessions.size
    }

    return 0
  } catch (error) {
    console.error('❌ Error getting active user count:', error)
    return 0
  }
}

/**
 * 最近のエラー率取得
 */
async function getRecentErrorRate(): Promise<number> {
  try {
    if (process.env.NODE_ENV === 'development') {
      return Math.random() * 0.1 // 開発環境では0-10%のランダム値
    }

    // 本番環境では実際の計算を実装
    // セッション数に対するエラー数の比率を計算
    if (supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

      const { data: errors, error: errorQuery } = await supabase
        .from('error_logs')
        .select('id')
        .gte('created_at', oneHourAgo)

      const { data: sessions, error: sessionQuery } = await supabase
        .from('error_logs')
        .select('session_id')
        .gte('created_at', oneHourAgo)

      if (errorQuery || sessionQuery) {
        console.error('❌ Failed to calculate error rate')
        return 0
      }

      const errorCount = errors?.length || 0
      // JavaScriptでユニークなsession_idをカウント
      const uniqueSessions = new Set(sessions?.map(item => item.session_id) || [])
      const sessionCount = uniqueSessions.size || 1

      return errorCount / sessionCount
    }

    return 0
  } catch (error) {
    console.error('❌ Error calculating error rate:', error)
    return 0
  }
}

/**
 * 類似エラーの取得
 */
async function getSimilarErrors(errorReport: ErrorReport): Promise<{
  count: number
  timeWindow: number
  users: number
}> {
  try {
    if (process.env.NODE_ENV === 'development') {
      return {
        count: Math.floor(Math.random() * 20) + 1,
        timeWindow: 15 * 60 * 1000, // 15分
        users: Math.floor(Math.random() * 10) + 1
      }
    }

    // 本番環境では実際のデータベースクエリを実装
    if (supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString()

      const { data: similarErrors, error } = await supabase
        .from('error_logs')
        .select('session_id, user_id')
        .eq('error_type', errorReport.errorType)
        .eq('message', errorReport.message)
        .gte('created_at', fifteenMinutesAgo)

      if (error) {
        console.error('❌ Failed to get similar errors:', error)
        return { count: 1, timeWindow: 15 * 60 * 1000, users: 1 }
      }

      const uniqueUsers = new Set(similarErrors?.map(e => e.user_id || e.session_id) || [])

      return {
        count: similarErrors?.length || 1,
        timeWindow: 15 * 60 * 1000,
        users: uniqueUsers.size
      }
    }

    return { count: 1, timeWindow: 15 * 60 * 1000, users: 1 }
  } catch (error) {
    console.error('❌ Error getting similar errors:', error)
    return { count: 1, timeWindow: 15 * 60 * 1000, users: 1 }
  }
}