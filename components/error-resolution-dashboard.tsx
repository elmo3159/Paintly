'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  RefreshCcw,
  CheckSquare,
  Square,
  FileText,
  Users,
  Calendar,
  Target,
  Award,
  Zap,
  BarChart3
} from 'lucide-react'

interface ErrorResolutionStats {
  totalErrors: number
  resolvedErrors: number
  unresolvedErrors: number
  resolutionRate: number
  averageResolutionTime: number
  recentResolutions: Array<{
    errorId: string
    message: string
    resolvedAt: string
    resolvedBy: string
    resolutionTime: number
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

interface ResolutionNote {
  timestamp: string
  resolvedBy: string
  notes: string
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
          component: 'ErrorResolutionDashboard'
        })
      }).catch(console.error)
    } catch (reportError) {
      console.error('Failed to report error:', reportError)
    }
  }
}

export function ErrorResolutionDashboard() {
  const [stats, setStats] = useState<ErrorResolutionStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedErrors, setSelectedErrors] = useState<string[]>([])
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [showResolutionDialog, setShowResolutionDialog] = useState(false)
  const [showNotesDialog, setShowNotesDialog] = useState(false)
  const [currentErrorNotes, setCurrentErrorNotes] = useState<ResolutionNote[]>([])
  const [currentErrorId, setCurrentErrorId] = useState<string | null>(null)
  const [period, setPeriod] = useState<number>(7)

  // 解決統計の読み込み
  const loadResolutionStats = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔄 Loading error resolution statistics')

      const response = await fetch(`/api/error-resolution?action=get_stats&days=${period}`, {
        headers: {
          'Authorization': 'Bearer admin-token' // 簡易認証
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      setStats(data.stats)
      console.log('✅ Error resolution statistics loaded:', data.stats)

    } catch (error) {
      const loadError = error instanceof Error ? error : new Error('Unknown error loading resolution stats')
      console.error('❌ Error loading resolution statistics:', loadError)
      reportClientError(loadError, `Resolution stats loading - Period: ${period}`)
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  // エラー解決の実行
  const resolveSelectedErrors = async () => {
    if (selectedErrors.length === 0) {
      alert('解決するエラーを選択してください')
      return
    }

    try {
      console.log('✅ Resolving selected errors:', selectedErrors)

      const response = await fetch('/api/error-resolution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token'
        },
        body: JSON.stringify({
          action: 'resolve',
          errorIds: selectedErrors,
          resolutionNotes,
          resolvedBy: 'Admin' // 実装時は実際のユーザー情報を使用
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Errors resolved:', data)

      // 状態をリセット
      setSelectedErrors([])
      setResolutionNotes('')
      setShowResolutionDialog(false)

      // 統計を再読み込み
      await loadResolutionStats()

      alert(`${data.resolvedErrors.length}件のエラーが解決済みにマークされました`)

    } catch (error) {
      const resolveError = error instanceof Error ? error : new Error('Unknown error resolving errors')
      console.error('❌ Error resolving errors:', resolveError)
      reportClientError(resolveError, `Error resolution - ErrorIDs: ${selectedErrors.join(',')}`)
      alert(`エラーの解決処理に失敗しました: ${resolveError.message}`)
    }
  }

  // 自動解決の実行
  const performAutoResolution = async () => {
    if (!confirm('自動解決処理を実行しますか？一定期間発生していないエラーが自動的に解決済みにマークされます。')) {
      return
    }

    try {
      console.log('🤖 Performing auto resolution')

      const response = await fetch(`/api/error-resolution?action=auto_resolve&days=${period}`, {
        headers: {
          'Authorization': 'Bearer admin-token'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Auto resolution completed:', data)

      await loadResolutionStats()

      alert(`自動解決処理が完了しました。${data.resolvedCount}件のエラーが自動解決されました。`)

    } catch (error) {
      const autoError = error instanceof Error ? error : new Error('Unknown error in auto resolution')
      console.error('❌ Error in auto resolution:', autoError)
      reportClientError(autoError, 'Auto resolution execution')
      alert(`自動解決処理に失敗しました: ${autoError.message}`)
    }
  }

  // 解決ノートの取得
  const loadResolutionNotes = async (errorId: string) => {
    try {
      console.log('📝 Loading resolution notes for:', errorId)

      const response = await fetch(`/api/error-resolution?action=get_resolution_notes&errorId=${errorId}`, {
        headers: {
          'Authorization': 'Bearer admin-token'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      setCurrentErrorNotes(data.notes)
      setCurrentErrorId(errorId)
      setShowNotesDialog(true)

    } catch (error) {
      const notesError = error instanceof Error ? error : new Error('Unknown error loading notes')
      console.error('❌ Error loading resolution notes:', notesError)
      reportClientError(notesError, `Resolution notes loading - ErrorID: ${errorId}`)
      alert(`解決ノートの読み込みに失敗しました: ${notesError.message}`)
    }
  }

  // エラー選択の切り替え
  const toggleErrorSelection = (errorId: string) => {
    setSelectedErrors(prev =>
      prev.includes(errorId)
        ? prev.filter(id => id !== errorId)
        : [...prev, errorId]
    )
  }

  // 全選択/全解除
  const toggleSelectAll = () => {
    if (!stats) return

    if (selectedErrors.length === stats.pendingResolution.length) {
      setSelectedErrors([])
    } else {
      setSelectedErrors(stats.pendingResolution.map(error => error.errorId))
    }
  }

  // 初期読み込み
  useEffect(() => {
    loadResolutionStats()
  }, [period])

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

  // 時間のフォーマット
  const formatTime = (hours: number): string => {
    if (hours < 1) return `${Math.round(hours * 60)}分`
    if (hours < 24) return `${Math.round(hours)}時間`
    return `${Math.round(hours / 24)}日`
  }

  // 日付のフォーマット
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6" role="main" aria-labelledby="resolution-dashboard-title">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 id="resolution-dashboard-title" className="text-3xl font-bold tracking-tight">
            エラー解決追跡ダッシュボード
          </h1>
          <p className="text-muted-foreground">
            エラーの解決状況管理と統計分析
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">期間:</span>
            <div className="flex" role="group" aria-label="期間選択">
              {[7, 14, 30].map((days) => (
                <Button
                  key={days}
                  variant={period === days ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPeriod(days)}
                  className={`rounded-none first:rounded-l-md last:rounded-r-md`}
                  aria-pressed={period === days}
                >
                  {days}日間
                </Button>
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={performAutoResolution}
            disabled={loading}
            aria-label="自動解決を実行"
          >
            <Zap className="w-4 h-4 mr-2" />
            自動解決
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={loadResolutionStats}
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
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">解決率</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(stats.resolutionRate * 100)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.resolvedErrors} / {stats.totalErrors} 件
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">平均解決時間</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatTime(stats.averageResolutionTime)}
                </div>
                <p className="text-xs text-muted-foreground">
                  平均解決までの時間
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">未解決エラー</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {stats.unresolvedErrors}
                </div>
                <p className="text-xs text-muted-foreground">
                  対応が必要なエラー
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">解決済み</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.resolvedErrors}
                </div>
                <p className="text-xs text-muted-foreground">
                  解決完了したエラー
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList>
              <TabsTrigger value="pending">未解決エラー ({stats.unresolvedErrors})</TabsTrigger>
              <TabsTrigger value="resolved">最近の解決 ({stats.recentResolutions.length})</TabsTrigger>
              <TabsTrigger value="trends">解決トレンド</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {stats.pendingResolution.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <Award className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">未解決エラーなし</h3>
                      <p className="text-muted-foreground">
                        すべてのエラーが解決済みです！素晴らしい状況です。
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Bulk Actions */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>一括操作</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleSelectAll}
                            aria-label={selectedErrors.length === stats.pendingResolution.length ? '全選択を解除' : '全選択'}
                          >
                            {selectedErrors.length === stats.pendingResolution.length ? (
                              <CheckSquare className="w-4 h-4 mr-2" />
                            ) : (
                              <Square className="w-4 h-4 mr-2" />
                            )}
                            全選択
                          </Button>

                          <Dialog open={showResolutionDialog} onOpenChange={setShowResolutionDialog}>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                disabled={selectedErrors.length === 0}
                                aria-label={`選択した${selectedErrors.length}件のエラーを解決`}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                解決 ({selectedErrors.length})
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>エラー解決の確認</DialogTitle>
                                <DialogDescription>
                                  {selectedErrors.length}件のエラーを解決済みにマークします。
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium">解決ノート（任意）</label>
                                  <Textarea
                                    value={resolutionNotes}
                                    onChange={(e) => setResolutionNotes(e.target.value)}
                                    placeholder="解決方法や原因について記録してください..."
                                    className="mt-1"
                                    rows={4}
                                  />
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => setShowResolutionDialog(false)}
                                  >
                                    キャンセル
                                  </Button>
                                  <Button onClick={resolveSelectedErrors}>
                                    解決済みにマーク
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>

                  {/* Pending Errors List */}
                  <div className="space-y-3">
                    {stats.pendingResolution.map((error) => (
                      <Card key={error.errorId}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              <Checkbox
                                checked={selectedErrors.includes(error.errorId)}
                                onCheckedChange={() => toggleErrorSelection(error.errorId)}
                                aria-label={`エラー ${error.errorId} を選択`}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Badge variant={getPriorityColor(error.priority) as any}>
                                    {error.priority}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">
                                    {error.occurrenceCount}回発生
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    ID: {error.errorId}
                                  </span>
                                </div>
                                <p className="font-medium text-sm mb-2">{error.message}</p>
                                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                  <span className="flex items-center">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    初回: {formatDate(error.firstOccurred)}
                                  </span>
                                  <span className="flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    最終: {formatDate(error.lastOccurred)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => loadResolutionNotes(error.errorId)}
                              aria-label="解決ノートを表示"
                            >
                              <FileText className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="resolved" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>最近解決されたエラー</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.recentResolutions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      最近解決されたエラーはありません
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {stats.recentResolutions.map((resolution, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{resolution.message}</p>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center">
                                <Users className="w-3 h-3 mr-1" />
                                {resolution.resolvedBy}
                              </span>
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                解決時間: {Math.round(resolution.resolutionTime)}分
                              </span>
                              <span>{formatDate(resolution.resolvedAt)}</span>
                            </div>
                          </div>
                          <Badge variant="secondary">解決済み</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    解決トレンド分析
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    解決トレンドの詳細分析機能は今後実装予定です。
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Resolution Notes Dialog */}
          <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>解決ノート</DialogTitle>
                <DialogDescription>
                  エラー ID: {currentErrorId}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {currentErrorNotes.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    解決ノートはありません
                  </p>
                ) : (
                  <div className="space-y-3">
                    {currentErrorNotes.map((note, index) => (
                      <div key={index} className="p-3 border rounded">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{note.resolvedBy}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(note.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm">{note.notes}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}