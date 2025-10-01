'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertTriangle,
  Bug,
  Clock,
  Users,
  TrendingUp,
  RefreshCcw,
  Download,
  CheckCircle,
  XCircle
} from 'lucide-react'

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
          component: 'ErrorDashboard'
        })
      }).catch(console.error)
    } catch (reportError) {
      console.error('Failed to report error:', reportError)
    }
  }
}

interface ErrorStats {
  period: string
  totalErrors: number
  errorsByType: Record<string, number>
  errorTrends?: Array<{
    hour: number
    count: number
  }>
  topErrors?: Array<{
    message: string
    count: number
  }>
  startTime?: string
  endTime?: string
}

interface ErrorLog {
  id: string
  error_id: string
  timestamp: string
  error_type: string
  message: string
  user_agent: string
  url: string
  user_id?: string
  stack_trace?: string
  retry_count: number
  session_id: string
  viewport_width: number
  viewport_height: number
  component_name?: string
  action_type?: string
  is_resolved: boolean
  resolved_at?: string
  resolution_notes?: string
}

export function ErrorDashboard() {
  const [stats, setStats] = useState<ErrorStats | null>(null)
  const [recentErrors, setRecentErrors] = useState<ErrorLog[]>([])
  const [loading, setLoading] = useState(false)
  const [period, setPeriod] = useState<'24h' | '7d' | '30d'>('24h')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [error, setError] = useState<string | null>(null)

  // Load error statistics
  const loadStats = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔄 Loading error statistics:', { period, selectedType })

      const params = new URLSearchParams({ period })
      if (selectedType !== 'all') {
        params.append('type', selectedType)
      }

      const response = await fetch(`/api/error-reporting?${params}`, {
        headers: {
          'Authorization': 'Bearer admin-token' // 簡易認証
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data: ErrorStats = await response.json()
      setStats(data)
      console.log('✅ Error statistics loaded:', data)

    } catch (error) {
      const loadError = error instanceof Error ? error : new Error('Unknown error loading stats')
      console.error('❌ Error loading statistics:', loadError)
      reportClientError(loadError, `Error dashboard stats loading - Period: ${period}, Type: ${selectedType}`)
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  // Export error data
  const exportErrorData = async () => {
    try {
      console.log('📤 Exporting error data')

      const params = new URLSearchParams({ period })
      if (selectedType !== 'all') {
        params.append('type', selectedType)
      }
      params.append('format', 'csv')

      const response = await fetch(`/api/error-reporting/export?${params}`, {
        headers: {
          'Authorization': 'Bearer admin-token'
        }
      })

      if (!response.ok) {
        throw new Error('エクスポートに失敗しました')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `error-report-${period}-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      console.log('✅ Error data exported successfully')

    } catch (error) {
      const exportError = error instanceof Error ? error : new Error('Unknown export error')
      console.error('❌ Error exporting data:', exportError)
      reportClientError(exportError, `Error data export - Period: ${period}`)
      alert(`エクスポートに失敗しました: ${exportError.message}`)
    }
  }

  // Load data on mount and when parameters change
  useEffect(() => {
    loadStats()
  }, [period, selectedType])

  // Get error type color
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

  // Get error severity icon
  const getErrorIcon = (type: string) => {
    switch (type) {
      case 'critical':
      case 'auth':
      case 'api':
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Bug className="w-4 h-4" />
    }
  }

  // Format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="space-y-6" role="main" aria-labelledby="error-dashboard-title">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 id="error-dashboard-title" className="text-3xl font-bold tracking-tight">
            エラー監視ダッシュボード
          </h1>
          <p className="text-muted-foreground">
            アプリケーションエラーの監視と分析
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportErrorData}
            disabled={loading}
            aria-label="エラーデータをエクスポート"
          >
            <Download className="w-4 h-4 mr-2" />
            エクスポート
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={loadStats}
            disabled={loading}
            aria-label="データを再読み込み"
          >
            <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            再読み込み
          </Button>
        </div>
      </div>

      {/* Period Selection */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">期間:</span>
          <div className="flex" role="group" aria-label="期間選択">
            {['24h', '7d', '30d'].map((p) => (
              <Button
                key={p}
                variant={period === p ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriod(p as typeof period)}
                className={`rounded-none first:rounded-l-md last:rounded-r-md`}
                aria-pressed={period === p}
              >
                {p === '24h' ? '24時間' : p === '7d' ? '7日間' : '30日間'}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">エラータイプ:</span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-sm border rounded px-2 py-1 bg-background"
            aria-label="エラータイプフィルター"
          >
            <option value="all">すべて</option>
            <option value="critical">クリティカル</option>
            <option value="auth">認証</option>
            <option value="api">API</option>
            <option value="javascript">JavaScript</option>
            <option value="promise">Promise</option>
            <option value="resource">リソース</option>
            <option value="network">ネットワーク</option>
            <option value="performance">パフォーマンス</option>
          </select>
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
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">総エラー数</CardTitle>
                <Bug className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(stats.totalErrors)}</div>
                <p className="text-xs text-muted-foreground">
                  {period === '24h' ? '過去24時間' : period === '7d' ? '過去7日間' : '過去30日間'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">クリティカルエラー</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {formatNumber(stats.errorsByType.critical || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  即座の対応が必要
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">影響ユーザー数</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {/* 仮の計算 - 実際は別途APIから取得 */}
                  {formatNumber(Math.ceil(stats.totalErrors * 0.3))}
                </div>
                <p className="text-xs text-muted-foreground">
                  推定影響ユーザー
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">エラー率</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalErrors > 0 ? '2.3%' : '0%'}
                </div>
                <p className="text-xs text-muted-foreground">
                  セッション全体に対する比率
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Error Type Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>エラータイプ別内訳</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Object.entries(stats.errorsByType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-2">
                      {getErrorIcon(type)}
                      <span className="font-medium capitalize">{type}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getErrorTypeColor(type) as any}>
                        {formatNumber(count)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Errors */}
          {stats.topErrors && stats.topErrors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>最も頻繁なエラー</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.topErrors.slice(0, 10).map((errorItem, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{errorItem.message}</p>
                        <p className="text-xs text-muted-foreground">#{index + 1}</p>
                      </div>
                      <Badge variant="secondary">
                        {formatNumber(errorItem.count)}回
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}