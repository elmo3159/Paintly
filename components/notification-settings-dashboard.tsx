'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import {
  AlertTriangle,
  Bell,
  Settings,
  Users,
  Clock,
  TrendingUp,
  RefreshCcw,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info
} from 'lucide-react'

interface NotificationRule {
  id: string
  name: string
  enabled: boolean
  conditions: {
    errorTypes?: string[]
    severityLevels?: string[]
    components?: string[]
    frequency?: {
      threshold: number
      timeWindow: number
    }
    userImpact?: {
      affectedUsers: number
      timeWindow: number
    }
  }
  actions: Array<{
    type: 'slack' | 'email' | 'discord' | 'webhook' | 'sms'
    target: string
    template: string
    priority: 'low' | 'medium' | 'high' | 'critical'
    rateLimit?: {
      maxPerHour: number
      cooldownMinutes: number
    }
  }>
  escalation?: {
    delay: number
    nextRule: string
  }
}

interface NotificationStats {
  rulesCount: number
  activeRules: number
  recentNotifications: number
  suppressedCount: number
  history: {
    sent24h: number
    failed24h: number
    suppressed24h: number
  }
}

// Client-side error reporting function
const reportClientError = (error: Error, context: string) => {
  if (typeof window !== 'undefined') {
    try {
      fetch('/api/error-reporting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          context: context,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          component: 'NotificationSettingsDashboard'
        })
      }).catch(console.error)
    } catch (reportError) {
      console.error('Failed to report error:', reportError)
    }
  }
}

export function NotificationSettingsDashboard() {
  const [rules, setRules] = useState<NotificationRule[]>([])
  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedRule, setSelectedRule] = useState<NotificationRule | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // 通知設定の読み込み
  const loadNotificationSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔄 Loading notification settings')

      const response = await fetch('/api/notification-settings?action=list', {
        headers: {
          'Authorization': 'Bearer admin-token' // 簡易認証
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      setRules(data.rules || [])
      setStats(data.stats || null)
      console.log('✅ Notification settings loaded:', data)

    } catch (error) {
      const loadError = error instanceof Error ? error : new Error('Unknown error loading notification settings')
      console.error('❌ Error loading notification settings:', loadError)
      reportClientError(loadError, 'Notification settings loading')
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  // 通知統計の読み込み
  const loadNotificationStats = async () => {
    try {
      console.log('📊 Loading notification statistics')

      const response = await fetch('/api/notification-settings?action=stats', {
        headers: {
          'Authorization': 'Bearer admin-token'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      setStats(data.stats)
      console.log('✅ Notification statistics loaded:', data.stats)

    } catch (error) {
      const statsError = error instanceof Error ? error : new Error('Unknown error loading stats')
      console.error('❌ Error loading notification stats:', statsError)
      reportClientError(statsError, 'Notification statistics loading')
    }
  }

  // ルールの有効/無効切り替え
  const toggleRule = async (ruleId: string) => {
    try {
      console.log('🔄 Toggling rule:', ruleId)

      const response = await fetch('/api/notification-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token'
        },
        body: JSON.stringify({
          action: 'toggle',
          ruleId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Rule toggled:', data)

      // ルール一覧を再読み込み
      await loadNotificationSettings()

    } catch (error) {
      const toggleError = error instanceof Error ? error : new Error('Unknown error toggling rule')
      console.error('❌ Error toggling rule:', toggleError)
      reportClientError(toggleError, `Rule toggle - RuleID: ${ruleId}`)
      alert(`ルールの切り替えに失敗しました: ${toggleError.message}`)
    }
  }

  // ルールの削除
  const deleteRule = async (ruleId: string) => {
    if (!confirm('このルールを削除してもよろしいですか？')) {
      return
    }

    try {
      console.log('🗑️ Deleting rule:', ruleId)

      const response = await fetch(`/api/notification-settings?ruleId=${ruleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer admin-token'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Rule deleted:', data)

      // ルール一覧を再読み込み
      await loadNotificationSettings()

    } catch (error) {
      const deleteError = error instanceof Error ? error : new Error('Unknown error deleting rule')
      console.error('❌ Error deleting rule:', deleteError)
      reportClientError(deleteError, `Rule deletion - RuleID: ${ruleId}`)
      alert(`ルールの削除に失敗しました: ${deleteError.message}`)
    }
  }

  // 初期読み込み
  useEffect(() => {
    loadNotificationSettings()
    loadNotificationStats()
  }, [])

  // エラータイプのカラー取得
  const getErrorTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      'critical': 'destructive',
      'auth': 'destructive',
      'api': 'destructive',
      'javascript': 'secondary',
      'promise': 'secondary',
      'resource': 'outline',
      'network': 'outline',
      'performance': 'outline'
    }
    return colors[type] || 'secondary'
  }

  // 優先度のカラー取得
  const getPriorityColor = (priority: string): string => {
    const colors: Record<string, string> = {
      'critical': 'destructive',
      'high': 'destructive',
      'medium': 'secondary',
      'low': 'outline'
    }
    return colors[priority] || 'secondary'
  }

  // 通知チャンネルのアイコン取得
  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'slack':
        return <Bell className="w-4 h-4" />
      case 'email':
        return <AlertCircle className="w-4 h-4" />
      case 'discord':
        return <Users className="w-4 h-4" />
      case 'webhook':
        return <Settings className="w-4 h-4" />
      default:
        return <Info className="w-4 h-4" />
    }
  }

  // 時間をフォーマット
  const formatTime = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}日`
    if (hours > 0) return `${hours}時間`
    return `${minutes}分`
  }

  return (
    <div className="space-y-6" role="main" aria-labelledby="notification-dashboard-title">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 id="notification-dashboard-title" className="text-3xl font-bold tracking-tight">
            通知設定ダッシュボード
          </h1>
          <p className="text-muted-foreground">
            エラー通知ルールの管理と統計
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreateForm(true)}
            disabled={loading}
            aria-label="新しい通知ルールを作成"
          >
            <Plus className="w-4 h-4 mr-2" />
            新規ルール
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={loadNotificationSettings}
            disabled={loading}
            aria-label="データを再読み込み"
          >
            <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            再読み込み
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            データの読み込みに失敗しました: {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2">
            <RefreshCcw className="w-5 h-5 animate-spin" />
            <span>データを読み込み中...</span>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      {stats && !loading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">総ルール数</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rulesCount}</div>
              <p className="text-xs text-muted-foreground">
                アクティブ: {stats.activeRules}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">24時間送信数</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.history?.sent24h || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                成功した通知
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">24時間失敗数</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.history?.failed24h || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                失敗した通知
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">抑制中</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.suppressedCount || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                クールダウン中
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notification Rules */}
      {!loading && (
        <Tabs defaultValue="rules" className="space-y-4">
          <TabsList>
            <TabsTrigger value="rules">通知ルール</TabsTrigger>
            <TabsTrigger value="templates">テンプレート</TabsTrigger>
            <TabsTrigger value="channels">通知チャンネル</TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="space-y-4">
            {rules.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">通知ルールがありません</h3>
                    <p className="text-muted-foreground mb-4">
                      新しい通知ルールを作成して、エラー監視を開始しましょう
                    </p>
                    <Button onClick={() => setShowCreateForm(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      最初のルールを作成
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {rules.map((rule) => (
                  <Card key={rule.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Switch
                            checked={rule.enabled}
                            onCheckedChange={() => toggleRule(rule.id)}
                            aria-label={`${rule.name}を${rule.enabled ? '無効' : '有効'}にする`}
                          />
                          <div>
                            <CardTitle className="text-lg">{rule.name}</CardTitle>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                                {rule.enabled ? '有効' : '無効'}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                ID: {rule.id}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedRule(rule)}
                            aria-label="ルールを編集"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {rule.id.startsWith('custom_') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteRule(rule.id)}
                              aria-label="ルールを削除"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-4">
                        {/* 条件 */}
                        <div>
                          <h4 className="font-semibold mb-2">トリガー条件</h4>
                          <div className="space-y-2">
                            {rule.conditions.errorTypes && (
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-muted-foreground">エラータイプ:</span>
                                <div className="flex flex-wrap gap-1">
                                  {rule.conditions.errorTypes.map((type) => (
                                    <Badge key={type} variant={getErrorTypeColor(type) as any}>
                                      {type}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {rule.conditions.frequency && (
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-muted-foreground">頻度:</span>
                                <Badge variant="outline">
                                  {rule.conditions.frequency.threshold}回 / {formatTime(rule.conditions.frequency.timeWindow)}
                                </Badge>
                              </div>
                            )}

                            {rule.conditions.userImpact && (
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-muted-foreground">ユーザー影響:</span>
                                <Badge variant="outline">
                                  {rule.conditions.userImpact.affectedUsers}人 / {formatTime(rule.conditions.userImpact.timeWindow)}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* アクション */}
                        <div>
                          <h4 className="font-semibold mb-2">通知アクション</h4>
                          <div className="space-y-2">
                            {rule.actions.map((action, index) => (
                              <div key={index} className="flex items-center justify-between p-2 border rounded">
                                <div className="flex items-center space-x-2">
                                  {getChannelIcon(action.type)}
                                  <span className="font-medium">{action.type}</span>
                                  <span className="text-muted-foreground">→ {action.target}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge variant={getPriorityColor(action.priority) as any}>
                                    {action.priority}
                                  </Badge>
                                  {action.rateLimit && (
                                    <Badge variant="outline">
                                      最大{action.rateLimit.maxPerHour}/時
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* エスカレーション */}
                        {rule.escalation && (
                          <div>
                            <h4 className="font-semibold mb-2">エスカレーション</h4>
                            <div className="p-2 border rounded">
                              <span className="text-sm">
                                {formatTime(rule.escalation.delay)}後に "{rule.escalation.nextRule}" へエスカレーション
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle>通知テンプレート</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  通知テンプレートの管理機能は今後実装予定です。
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="channels">
            <Card>
              <CardHeader>
                <CardTitle>通知チャンネル</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  通知チャンネルの設定機能は今後実装予定です。
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}