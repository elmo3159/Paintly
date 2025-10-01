import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * エラー解決追跡API
 * エラーの解決状況管理、自動解決検出、解決統計の提供
 */

interface ErrorResolutionRequest {
  action: 'resolve' | 'unresolve' | 'get_status' | 'get_stats' | 'auto_resolve' | 'get_resolution_notes'
  errorIds?: string[]
  errorId?: string
  resolutionNotes?: string
  resolvedBy?: string
  autoResolutionDays?: number
}

interface ErrorResolutionStats {
  totalErrors: number
  resolvedErrors: number
  unresolvedErrors: number
  resolutionRate: number
  averageResolutionTime: number // 時間単位
  recentResolutions: Array<{
    errorId: string
    message: string
    resolvedAt: string
    resolvedBy: string
    resolutionTime: number // 分単位
  }>
  pendingResolution: Array<{
    errorId: string
    message: string
    firstOccurred: string
    lastOccurred: string
    occurrenceCount: number
    priority: 'low' | 'medium' | 'high' | 'critical'
  }>
  resolutionTrends: Array<{
    date: string
    resolved: number
    newErrors: number
  }>
}

/**
 * エラー解決状況の取得（GET）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'get_stats'
    const errorId = searchParams.get('errorId')
    const days = parseInt(searchParams.get('days') || '7')

    // 認証チェック
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    console.log('📊 [Error Resolution API] Processing GET request:', { action, errorId, days })

    switch (action) {
      case 'get_stats':
        const stats = await getResolutionStats(days)
        return NextResponse.json({
          success: true,
          stats,
          period: `${days}日間`
        })

      case 'get_status':
        if (!errorId) {
          return NextResponse.json(
            { error: 'エラーIDが必要です' },
            { status: 400 }
          )
        }

        const status = await getErrorResolutionStatus(errorId)
        return NextResponse.json({
          success: true,
          status
        })

      case 'get_resolution_notes':
        if (!errorId) {
          return NextResponse.json(
            { error: 'エラーIDが必要です' },
            { status: 400 }
          )
        }

        const notes = await getResolutionNotes(errorId)
        return NextResponse.json({
          success: true,
          notes
        })

      case 'auto_resolve':
        const autoResolved = await performAutoResolution(days)
        return NextResponse.json({
          success: true,
          message: `自動解決処理が完了しました`,
          resolvedCount: autoResolved.length,
          resolvedErrors: autoResolved
        })

      default:
        return NextResponse.json(
          { error: '無効なアクションです' },
          { status: 400 }
        )
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('❌ [Error Resolution API] GET error:', errorMessage)

    return NextResponse.json(
      {
        error: 'エラー解決情報の取得に失敗しました',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}

/**
 * エラー解決状況の更新（POST）
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔧 [Error Resolution API] Processing POST request')

    // 認証チェック
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const requestData: ErrorResolutionRequest = await request.json()
    const { action, errorId, errorIds, resolutionNotes, resolvedBy } = requestData

    // 基本的なバリデーション
    if (!action) {
      return NextResponse.json(
        { error: 'アクションが必要です' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'resolve':
        if (!errorId && !errorIds) {
          return NextResponse.json(
            { error: 'エラーIDが必要です' },
            { status: 400 }
          )
        }

        const resolveTargets = errorIds || [errorId!]
        const resolveResults = await resolveErrors(resolveTargets, resolutionNotes, resolvedBy)

        console.log('✅ [Error Resolution] Errors resolved:', resolveTargets.length)
        return NextResponse.json({
          success: true,
          message: `${resolveTargets.length}件のエラーが解決済みにマークされました`,
          resolvedErrors: resolveResults
        })

      case 'unresolve':
        if (!errorId) {
          return NextResponse.json(
            { error: 'エラーIDが必要です' },
            { status: 400 }
          )
        }

        const unresolveResult = await unresolveError(errorId)
        if (!unresolveResult) {
          return NextResponse.json(
            { error: 'エラーが見つかりません' },
            { status: 404 }
          )
        }

        console.log('✅ [Error Resolution] Error unresolved:', errorId)
        return NextResponse.json({
          success: true,
          message: 'エラーが未解決にマークされました',
          errorId
        })

      default:
        return NextResponse.json(
          { error: '無効なアクションです' },
          { status: 400 }
        )
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('❌ [Error Resolution API] POST error:', errorMessage)

    return NextResponse.json(
      {
        error: 'エラー解決状況の更新に失敗しました',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}

/**
 * エラー解決統計の取得
 */
async function getResolutionStats(days: number): Promise<ErrorResolutionStats> {
  try {
    if (process.env.NODE_ENV === 'development') {
      // 開発環境では模擬データを返す
      const mockStats: ErrorResolutionStats = {
        totalErrors: Math.floor(Math.random() * 200) + 50,
        resolvedErrors: Math.floor(Math.random() * 150) + 30,
        unresolvedErrors: Math.floor(Math.random() * 50) + 10,
        resolutionRate: Math.random() * 0.4 + 0.6, // 60-100%
        averageResolutionTime: Math.random() * 48 + 2, // 2-50時間
        recentResolutions: Array.from({ length: 5 }, (_, i) => ({
          errorId: `error_${Date.now() - i * 60000}`,
          message: `Sample error ${i + 1}`,
          resolvedAt: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
          resolvedBy: `admin${i + 1}`,
          resolutionTime: Math.floor(Math.random() * 300) + 30 // 30-330分
        })),
        pendingResolution: Array.from({ length: 3 }, (_, i) => ({
          errorId: `pending_${Date.now() - i * 120000}`,
          message: `Pending error ${i + 1}`,
          firstOccurred: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
          lastOccurred: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
          occurrenceCount: Math.floor(Math.random() * 20) + 1,
          priority: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any
        })),
        resolutionTrends: Array.from({ length: days }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          resolved: Math.floor(Math.random() * 10),
          newErrors: Math.floor(Math.random() * 15)
        }))
      }

      return mockStats
    }

    // 本番環境では実際のデータベースクエリを実行
    if (supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

      // 基本統計
      const { data: allErrors } = await supabase
        .from('error_logs')
        .select('*')
        .gte('created_at', startDate)

      const totalErrors = allErrors?.length || 0
      const resolvedErrors = allErrors?.filter(e => e.is_resolved).length || 0
      const unresolvedErrors = totalErrors - resolvedErrors

      // 解決時間の計算
      const resolvedWithTime = allErrors?.filter(e =>
        e.is_resolved && e.resolved_at && e.created_at
      ) || []

      const avgResolutionTime = resolvedWithTime.length > 0
        ? resolvedWithTime.reduce((sum, error) => {
            const created = new Date(error.created_at).getTime()
            const resolved = new Date(error.resolved_at).getTime()
            return sum + (resolved - created) / (1000 * 60 * 60) // 時間単位
          }, 0) / resolvedWithTime.length
        : 0

      const stats: ErrorResolutionStats = {
        totalErrors,
        resolvedErrors,
        unresolvedErrors,
        resolutionRate: totalErrors > 0 ? resolvedErrors / totalErrors : 0,
        averageResolutionTime: avgResolutionTime,
        recentResolutions: resolvedWithTime.slice(0, 5).map(error => ({
          errorId: error.error_id,
          message: error.message,
          resolvedAt: error.resolved_at,
          resolvedBy: error.resolved_by || 'System',
          resolutionTime: Math.round((new Date(error.resolved_at).getTime() - new Date(error.created_at).getTime()) / (1000 * 60))
        })),
        pendingResolution: allErrors?.filter(e => !e.is_resolved).slice(0, 10).map(error => ({
          errorId: error.error_id,
          message: error.message,
          firstOccurred: error.created_at,
          lastOccurred: error.updated_at || error.created_at,
          occurrenceCount: 1, // 実装時は集約クエリで正確な値を取得
          priority: determinePriority(error.error_type, error.message)
        })) || [],
        resolutionTrends: [] // 実装時は日別の統計を取得
      }

      return stats
    }

    throw new Error('データベース接続が設定されていません')

  } catch (error) {
    console.error('❌ Error getting resolution stats:', error)
    throw error
  }
}

/**
 * エラー解決状況の取得
 */
async function getErrorResolutionStatus(errorId: string): Promise<{
  isResolved: boolean
  resolvedAt?: string
  resolvedBy?: string
  resolutionNotes?: string
  occurrenceCount: number
  firstOccurred: string
  lastOccurred: string
}> {
  try {
    if (process.env.NODE_ENV === 'development') {
      // 開発環境では模擬データ
      return {
        isResolved: Math.random() > 0.5,
        resolvedAt: Math.random() > 0.5 ? new Date().toISOString() : undefined,
        resolvedBy: 'admin1',
        resolutionNotes: 'Sample resolution notes',
        occurrenceCount: Math.floor(Math.random() * 10) + 1,
        firstOccurred: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        lastOccurred: new Date().toISOString()
      }
    }

    if (supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      const { data: errorLog, error } = await supabase
        .from('error_logs')
        .select('*')
        .eq('error_id', errorId)
        .single()

      if (error || !errorLog) {
        throw new Error('エラーが見つかりません')
      }

      // 同じエラーの発生回数を取得
      const { data: similarErrors } = await supabase
        .from('error_logs')
        .select('created_at')
        .eq('error_type', errorLog.error_type)
        .eq('message', errorLog.message)
        .order('created_at', { ascending: true })

      const occurrenceCount = similarErrors?.length || 1
      const firstOccurred = similarErrors?.[0]?.created_at || errorLog.created_at
      const lastOccurred = similarErrors?.[similarErrors.length - 1]?.created_at || errorLog.created_at

      return {
        isResolved: errorLog.is_resolved,
        resolvedAt: errorLog.resolved_at,
        resolvedBy: errorLog.resolved_by,
        resolutionNotes: errorLog.resolution_notes,
        occurrenceCount,
        firstOccurred,
        lastOccurred
      }
    }

    throw new Error('データベース接続が設定されていません')

  } catch (error) {
    console.error('❌ Error getting resolution status:', error)
    throw error
  }
}

/**
 * エラーの解決マーク
 */
async function resolveErrors(
  errorIds: string[],
  resolutionNotes?: string,
  resolvedBy?: string
): Promise<string[]> {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('🧪 [Development] Mock resolving errors:', errorIds)
      return errorIds
    }

    if (supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      const updates = {
        is_resolved: true,
        resolved_at: new Date().toISOString(),
        resolved_by: resolvedBy || 'Admin',
        resolution_notes: resolutionNotes || '',
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('error_logs')
        .update(updates)
        .in('error_id', errorIds)
        .select('error_id')

      if (error) {
        throw error
      }

      return data?.map(row => row.error_id) || []
    }

    throw new Error('データベース接続が設定されていません')

  } catch (error) {
    console.error('❌ Error resolving errors:', error)
    throw error
  }
}

/**
 * エラーの未解決マーク
 */
async function unresolveError(errorId: string): Promise<boolean> {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('🧪 [Development] Mock unresolving error:', errorId)
      return true
    }

    if (supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      const updates = {
        is_resolved: false,
        resolved_at: null,
        resolved_by: null,
        resolution_notes: null,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('error_logs')
        .update(updates)
        .eq('error_id', errorId)

      if (error) {
        throw error
      }

      return true
    }

    throw new Error('データベース接続が設定されていません')

  } catch (error) {
    console.error('❌ Error unresolving error:', error)
    throw error
  }
}

/**
 * 自動解決処理
 */
async function performAutoResolution(days: number): Promise<string[]> {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('🧪 [Development] Mock auto resolution')
      return [`auto_resolved_${Date.now()}`]
    }

    if (supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      // 指定された日数以上前のエラーで、未解決かつ最近発生していないものを自動解決
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

      const { data: candidateErrors } = await supabase
        .from('error_logs')
        .select('error_id, error_type, message, created_at')
        .eq('is_resolved', false)
        .lt('created_at', cutoffDate)

      if (!candidateErrors || candidateErrors.length === 0) {
        return []
      }

      // 各エラーについて、最近発生していないかチェック
      const autoResolveTargets: string[] = []
      const recentThreshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7日間

      for (const error of candidateErrors) {
        const { data: recentOccurrences } = await supabase
          .from('error_logs')
          .select('id')
          .eq('error_type', error.error_type)
          .eq('message', error.message)
          .gte('created_at', recentThreshold)

        if (!recentOccurrences || recentOccurrences.length === 0) {
          autoResolveTargets.push(error.error_id)
        }
      }

      if (autoResolveTargets.length > 0) {
        await resolveErrors(
          autoResolveTargets,
          '自動解決: 一定期間発生していないため',
          'System'
        )
      }

      return autoResolveTargets
    }

    throw new Error('データベース接続が設定されていません')

  } catch (error) {
    console.error('❌ Error in auto resolution:', error)
    return []
  }
}

/**
 * 解決ノートの取得
 */
async function getResolutionNotes(errorId: string): Promise<Array<{
  timestamp: string
  resolvedBy: string
  notes: string
}>> {
  try {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          timestamp: new Date().toISOString(),
          resolvedBy: 'admin1',
          notes: 'Sample resolution notes for development'
        }
      ]
    }

    if (supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      const { data: errorLog } = await supabase
        .from('error_logs')
        .select('resolved_at, resolved_by, resolution_notes')
        .eq('error_id', errorId)
        .single()

      if (!errorLog || !errorLog.resolved_at) {
        return []
      }

      return [{
        timestamp: errorLog.resolved_at,
        resolvedBy: errorLog.resolved_by || 'Unknown',
        notes: errorLog.resolution_notes || ''
      }]
    }

    return []

  } catch (error) {
    console.error('❌ Error getting resolution notes:', error)
    return []
  }
}

/**
 * エラーの優先度判定
 */
function determinePriority(errorType: string, message: string): 'low' | 'medium' | 'high' | 'critical' {
  if (errorType === 'critical' || errorType === 'auth') {
    return 'critical'
  }

  if (errorType === 'api') {
    return 'high'
  }

  const lowerMessage = message.toLowerCase()
  if (lowerMessage.includes('memory') || lowerMessage.includes('performance')) {
    return 'high'
  }

  if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
    return 'medium'
  }

  return 'low'
}