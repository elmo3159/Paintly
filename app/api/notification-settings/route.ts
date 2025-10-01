import { NextRequest, NextResponse } from 'next/server'
import { notificationEngine, type NotificationRule } from '@/lib/notification-engine'

/**
 * 通知設定管理API
 * 管理者による通知ルールの作成・更新・削除・取得
 */

interface NotificationSettingsRequest {
  action: 'list' | 'get' | 'create' | 'update' | 'delete' | 'toggle'
  ruleId?: string
  rule?: Partial<NotificationRule>
}

/**
 * 通知設定の取得（GET）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'list'
    const ruleId = searchParams.get('ruleId')

    // 簡単な認証チェック（本番環境では適切な認証を実装）
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    console.log('🔧 [Notification Settings API] Processing request:', { action, ruleId })

    // 通知エンジンの初期化
    notificationEngine.initialize()

    switch (action) {
      case 'list':
        // すべての通知ルールを取得
        const rules = await getAllNotificationRules()
        return NextResponse.json({
          success: true,
          rules,
          stats: notificationEngine.getStats()
        })

      case 'get':
        if (!ruleId) {
          return NextResponse.json(
            { error: 'ルールIDが必要です' },
            { status: 400 }
          )
        }

        const rule = await getNotificationRule(ruleId)
        if (!rule) {
          return NextResponse.json(
            { error: 'ルールが見つかりません' },
            { status: 404 }
          )
        }

        return NextResponse.json({
          success: true,
          rule
        })

      case 'stats':
        // 通知統計情報を取得
        const stats = notificationEngine.getStats()
        const history = await getNotificationHistory()

        return NextResponse.json({
          success: true,
          stats: {
            ...stats,
            history: {
              sent24h: history.filter(h =>
                Date.now() - new Date(h.timestamp).getTime() < 24 * 60 * 60 * 1000 &&
                h.status === 'sent'
              ).length,
              failed24h: history.filter(h =>
                Date.now() - new Date(h.timestamp).getTime() < 24 * 60 * 60 * 1000 &&
                h.status === 'failed'
              ).length,
              suppressed24h: history.filter(h =>
                Date.now() - new Date(h.timestamp).getTime() < 24 * 60 * 60 * 1000 &&
                h.status === 'suppressed'
              ).length
            }
          }
        })

      default:
        return NextResponse.json(
          { error: '無効なアクションです' },
          { status: 400 }
        )
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('❌ [Notification Settings API] GET error:', errorMessage)

    return NextResponse.json(
      {
        error: '通知設定の取得に失敗しました',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}

/**
 * 通知設定の作成・更新（POST）
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔧 [Notification Settings API] Processing POST request')

    // 認証チェック
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const requestData: NotificationSettingsRequest = await request.json()
    const { action, ruleId, rule } = requestData

    // 基本的なバリデーション
    if (!action) {
      return NextResponse.json(
        { error: 'アクションが必要です' },
        { status: 400 }
      )
    }

    // 通知エンジンの初期化
    notificationEngine.initialize()

    switch (action) {
      case 'create':
        if (!rule || !rule.name) {
          return NextResponse.json(
            { error: 'ルール情報が不足しています' },
            { status: 400 }
          )
        }

        const newRule: NotificationRule = {
          id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: rule.name,
          enabled: rule.enabled ?? true,
          conditions: rule.conditions || {},
          actions: rule.actions || [],
          escalation: rule.escalation
        }

        notificationEngine.addRule(newRule)

        console.log('✅ [Notification Settings] New rule created:', newRule.id)
        return NextResponse.json({
          success: true,
          message: '通知ルールが作成されました',
          rule: newRule
        })

      case 'update':
        if (!ruleId || !rule) {
          return NextResponse.json(
            { error: 'ルールIDと更新情報が必要です' },
            { status: 400 }
          )
        }

        const updated = notificationEngine.updateRule(ruleId, rule)
        if (!updated) {
          return NextResponse.json(
            { error: 'ルールが見つかりません' },
            { status: 404 }
          )
        }

        console.log('✅ [Notification Settings] Rule updated:', ruleId)
        return NextResponse.json({
          success: true,
          message: '通知ルールが更新されました',
          ruleId
        })

      case 'toggle':
        if (!ruleId) {
          return NextResponse.json(
            { error: 'ルールIDが必要です' },
            { status: 400 }
          )
        }

        const currentRule = await getNotificationRule(ruleId)
        if (!currentRule) {
          return NextResponse.json(
            { error: 'ルールが見つかりません' },
            { status: 404 }
          )
        }

        const toggled = notificationEngine.updateRule(ruleId, {
          enabled: !currentRule.enabled
        })

        if (!toggled) {
          return NextResponse.json(
            { error: 'ルールの切り替えに失敗しました' },
            { status: 500 }
          )
        }

        console.log('✅ [Notification Settings] Rule toggled:', ruleId, !currentRule.enabled)
        return NextResponse.json({
          success: true,
          message: `通知ルールが${!currentRule.enabled ? '有効' : '無効'}になりました`,
          ruleId,
          enabled: !currentRule.enabled
        })

      default:
        return NextResponse.json(
          { error: '無効なアクションです' },
          { status: 400 }
        )
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('❌ [Notification Settings API] POST error:', errorMessage)

    return NextResponse.json(
      {
        error: '通知設定の更新に失敗しました',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}

/**
 * 通知設定の削除（DELETE）
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ruleId = searchParams.get('ruleId')

    // 認証チェック
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    if (!ruleId) {
      return NextResponse.json(
        { error: 'ルールIDが必要です' },
        { status: 400 }
      )
    }

    console.log('🗑️ [Notification Settings API] Deleting rule:', ruleId)

    // デフォルトルールの削除を防ぐ
    if (ruleId.startsWith('critical-') || ruleId.startsWith('high-frequency-') ||
        ruleId.startsWith('api-error-') || ruleId.startsWith('user-impact-') ||
        ruleId.startsWith('javascript-error-')) {
      return NextResponse.json(
        { error: 'システムデフォルトルールは削除できません' },
        { status: 403 }
      )
    }

    const deleted = await deleteNotificationRule(ruleId)
    if (!deleted) {
      return NextResponse.json(
        { error: 'ルールが見つかりません' },
        { status: 404 }
      )
    }

    console.log('✅ [Notification Settings] Rule deleted:', ruleId)
    return NextResponse.json({
      success: true,
      message: '通知ルールが削除されました',
      ruleId
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('❌ [Notification Settings API] DELETE error:', errorMessage)

    return NextResponse.json(
      {
        error: '通知設定の削除に失敗しました',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}

/**
 * すべての通知ルールを取得
 */
async function getAllNotificationRules(): Promise<NotificationRule[]> {
  // 実装時はデータベースまたは設定ストレージから取得
  // 現在は通知エンジンから直接取得（模擬実装）
  return [
    {
      id: 'critical-immediate',
      name: 'クリティカルエラー即座通知',
      enabled: true,
      conditions: {
        errorTypes: ['critical', 'auth'],
        severityLevels: ['critical']
      },
      actions: [
        {
          type: 'slack',
          target: 'critical-alerts',
          template: 'critical-error',
          priority: 'critical'
        }
      ]
    },
    {
      id: 'high-frequency-errors',
      name: '高頻度エラー検出',
      enabled: true,
      conditions: {
        frequency: {
          threshold: 10,
          timeWindow: 5 * 60 * 1000
        }
      },
      actions: [
        {
          type: 'slack',
          target: 'error-monitoring',
          template: 'high-frequency-alert',
          priority: 'high',
          rateLimit: {
            maxPerHour: 3,
            cooldownMinutes: 15
          }
        }
      ]
    }
  ]
}

/**
 * 指定された通知ルールを取得
 */
async function getNotificationRule(ruleId: string): Promise<NotificationRule | null> {
  const rules = await getAllNotificationRules()
  return rules.find(rule => rule.id === ruleId) || null
}

/**
 * 通知ルールを削除
 */
async function deleteNotificationRule(ruleId: string): Promise<boolean> {
  // 実装時はデータベースから削除
  // 現在は模擬実装
  console.log(`🗑️ Mock deletion of rule: ${ruleId}`)
  return true
}

/**
 * 通知履歴を取得
 */
async function getNotificationHistory(): Promise<Array<{
  id: string
  timestamp: string
  status: 'sent' | 'failed' | 'suppressed'
}>> {
  // 実装時はデータベースから取得
  // 現在は模擬データ
  return [
    {
      id: 'notif_1',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'sent'
    },
    {
      id: 'notif_2',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      status: 'failed'
    }
  ]
}