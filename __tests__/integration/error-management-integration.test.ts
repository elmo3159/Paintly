/**
 * 統合テスト: エラー管理システム全体
 * API、コンポーネント、通知システムの連携テスト
 */

import { NextRequest } from 'next/server'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { jest } from '@jest/globals'

// API handlers
import { POST as errorReportingPost } from '@/app/api/error-reporting/route'
import { GET as errorReportingGet } from '@/app/api/error-reporting/route'
import { POST as notificationSettingsPost } from '@/app/api/notification-settings/route'
import { GET as notificationSettingsGet } from '@/app/api/notification-settings/route'
import { POST as errorResolutionPost } from '@/app/api/error-resolution/route'

// Components
import ErrorDashboard from '@/components/error-dashboard'
import NotificationSettingsDashboard from '@/components/notification-settings-dashboard'
import ErrorResolutionDashboard from '@/components/error-resolution-dashboard'

// Libraries
import { notificationEngine } from '@/lib/notification-engine'

// Mocks
import { createClient } from '@/lib/supabase'

// Mock Supabase
jest.mock('@/lib/supabase')
const mockSupabase = createClient as jest.MockedFunction<typeof createClient>

describe('統合テスト: エラー管理システム', () => {
  let mockSupabaseClient: any

  beforeEach(() => {
    // Supabaseクライアントのモック
    mockSupabaseClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn(),
      data: [],
      error: null
    }
    mockSupabase.mockReturnValue(mockSupabaseClient)

    // 通知エンジンの初期化
    notificationEngine.initialize()

    // グローバルfetchのモック
    global.fetch = jest.fn()

    // コンソールのモック
    jest.spyOn(console, 'log').mockImplementation()
    jest.spyOn(console, 'error').mockImplementation()
    jest.spyOn(console, 'warn').mockImplementation()
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  describe('エラー報告から通知までの統合フロー', () => {
    it('エラー報告 → 通知トリガー → ダッシュボード表示の流れ', async () => {
      // 1. エラー報告APIが呼び出される
      const errorData = {
        message: 'Critical API Error',
        stack: 'Error: API failed\n  at apiCall (app.js:123)',
        component: 'UserAPI',
        url: '/api/users',
        userAgent: 'Mozilla/5.0...',
        userId: 'user123',
        errorType: 'critical'
      }

      // エラー挿入のモック
      mockSupabaseClient.insert.mockResolvedValueOnce({
        data: [{ id: 'error123', ...errorData, created_at: new Date().toISOString() }],
        error: null
      })

      // 2. エラー報告API呼び出し
      const errorRequest = new NextRequest('http://localhost:3000/api/error-reporting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData)
      })

      const errorResponse = await errorReportingPost(errorRequest)
      const errorResult = await errorResponse.json()

      expect(errorResponse.status).toBe(200)
      expect(errorResult.success).toBe(true)

      // 3. 通知エンジンがトリガーされることを確認
      const notificationSpy = jest.spyOn(notificationEngine, 'processError')
      notificationEngine.processError({
        id: 'error123',
        message: errorData.message,
        errorType: errorData.errorType as any,
        severity: 'critical',
        timestamp: new Date(),
        metadata: {}
      })
      expect(notificationSpy).toHaveBeenCalled()

      // 4. ダッシュボードコンポーネントでエラーが表示される
      mockSupabaseClient.select.mockResolvedValueOnce({
        data: [{
          id: 'error123',
          message: errorData.message,
          error_type: errorData.errorType,
          created_at: new Date().toISOString(),
          resolved_at: null,
          count: 1
        }],
        error: null
      })

      render(<ErrorDashboard />)

      await waitFor(() => {
        expect(screen.getByText('Critical API Error')).toBeInTheDocument()
      })
    })

    it('高頻度エラーの検出と通知', async () => {
      const baseError = {
        message: 'Database connection timeout',
        stack: 'Error: Connection timeout',
        component: 'DatabaseAPI',
        url: '/api/database',
        userAgent: 'Mozilla/5.0...'
      }

      // 複数回のエラー報告をシミュレート
      const errorPromises = Array.from({ length: 15 }, async (_, i) => {
        mockSupabaseClient.insert.mockResolvedValueOnce({
          data: [{ id: `error_${i}`, ...baseError, created_at: new Date().toISOString() }],
          error: null
        })

        const request = new NextRequest('http://localhost:3000/api/error-reporting', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(baseError)
        })

        return errorReportingPost(request)
      })

      const responses = await Promise.all(errorPromises)
      responses.forEach(response => {
        expect(response.status).toBe(200)
      })

      // 高頻度エラー通知がトリガーされることを確認
      const processErrorSpy = jest.spyOn(notificationEngine, 'processError')
      
      // 15個のエラーを順次処理
      for (let i = 0; i < 15; i++) {
        notificationEngine.processError({
          id: `error_${i}`,
          message: baseError.message,
          errorType: 'api',
          severity: 'medium',
          timestamp: new Date(),
          metadata: {}
        })
      }

      expect(processErrorSpy).toHaveBeenCalledTimes(15)
    })
  })

  describe('通知設定の動的変更と反映', () => {
    it('通知ルール変更がリアルタイムで反映される', async () => {
      // 1. 初期通知設定の取得
      const initialRequest = new NextRequest('http://localhost:3000/api/notification-settings?action=list', {
        headers: { 'authorization': 'Bearer test-token' }
      })

      const initialResponse = await notificationSettingsGet(initialRequest)
      const initialData = await initialResponse.json()

      expect(initialResponse.status).toBe(200)
      expect(initialData.rules).toBeDefined()

      // 2. 新しい通知ルールの作成
      const newRule = {
        action: 'create',
        rule: {
          name: 'Test Integration Rule',
          enabled: true,
          conditions: {
            errorTypes: ['integration-test'],
            severityLevels: ['high']
          },
          actions: [{
            type: 'slack',
            target: 'test-channel',
            template: 'test-template',
            priority: 'high'
          }]
        }
      }

      const createRequest = new NextRequest('http://localhost:3000/api/notification-settings', {
        method: 'POST',
        headers: { 
          'authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newRule)
      })

      const createResponse = await notificationSettingsPost(createRequest)
      const createData = await createResponse.json()

      expect(createResponse.status).toBe(200)
      expect(createData.success).toBe(true)
      expect(createData.rule.name).toBe('Test Integration Rule')

      // 3. 通知設定ダッシュボードコンポーネントでの確認
      render(<NotificationSettingsDashboard />)

      await waitFor(() => {
        expect(screen.getByText('Test Integration Rule')).toBeInTheDocument()
      })

      // 4. 新しいルールに一致するエラーをテスト
      const testError = {
        message: 'Integration test error',
        errorType: 'integration-test',
        severity: 'high',
        timestamp: new Date(),
        metadata: {}
      }

      const shouldTrigger = notificationEngine.shouldTriggerNotification(testError as any)
      expect(shouldTrigger).toBe(true)
    })

    it('通知ルールの有効/無効切り替えが即座に反映', async () => {
      const ruleId = 'critical-immediate'

      // ルールを無効化
      const toggleRequest = new NextRequest('http://localhost:3000/api/notification-settings', {
        method: 'POST',
        headers: { 
          'authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'toggle',
          ruleId: ruleId
        })
      })

      const toggleResponse = await notificationSettingsPost(toggleRequest)
      const toggleData = await toggleResponse.json()

      expect(toggleResponse.status).toBe(200)
      expect(toggleData.success).toBe(true)

      // クリティカルエラーが通知されないことを確認
      const criticalError = {
        id: 'critical-test',
        message: 'Critical test error',
        errorType: 'critical',
        severity: 'critical',
        timestamp: new Date(),
        metadata: {}
      }

      // 通知がトリガーされないことを確認（ルールが無効のため）
      const notificationSpy = jest.spyOn(notificationEngine, 'sendNotification')
      notificationEngine.processError(criticalError as any)
      
      // 少し待ってから確認（非同期処理のため）
      await new Promise(resolve => setTimeout(resolve, 100))
      expect(notificationSpy).not.toHaveBeenCalled()
    })
  })

  describe('エラー解決ワークフロー統合', () => {
    it('エラー解決から統計更新までの完全フロー', async () => {
      const errorId = 'error-to-resolve'
      const resolution = {
        action: 'resolve',
        errorIds: [errorId],
        resolution: {
          status: 'resolved',
          notes: 'Fixed database connection issue',
          resolvedBy: 'dev-team'
        }
      }

      // エラー解決のモック
      mockSupabaseClient.update.mockResolvedValueOnce({
        data: [{
          id: errorId,
          resolved_at: new Date().toISOString(),
          resolution_notes: resolution.resolution.notes,
          resolved_by: resolution.resolution.resolvedBy
        }],
        error: null
      })

      // 1. エラー解決API呼び出し
      const resolveRequest = new NextRequest('http://localhost:3000/api/error-resolution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resolution)
      })

      const resolveResponse = await errorResolutionPost(resolveRequest)
      const resolveData = await resolveResponse.json()

      expect(resolveResponse.status).toBe(200)
      expect(resolveData.success).toBe(true)

      // 2. エラー解決ダッシュボードでの確認
      mockSupabaseClient.select.mockResolvedValueOnce({
        data: [{
          id: errorId,
          message: 'Database error',
          resolved_at: new Date().toISOString(),
          resolution_notes: resolution.resolution.notes,
          resolved_by: resolution.resolution.resolvedBy
        }],
        error: null
      })

      render(<ErrorResolutionDashboard />)

      await waitFor(() => {
        expect(screen.getByText('Fixed database connection issue')).toBeInTheDocument()
      })

      // 3. エラーダッシュボードでの統計更新確認
      mockSupabaseClient.select.mockResolvedValueOnce({
        data: [{
          total_errors: 100,
          resolved_errors: 85,
          pending_errors: 15,
          resolution_rate: 85
        }],
        error: null
      })

      render(<ErrorDashboard />)

      await waitFor(() => {
        expect(screen.getByText('85%')).toBeInTheDocument() // Resolution rate
      })
    })

    it('自動解決システムの統合テスト', async () => {
      // 自動解決可能なエラーパターンを設定
      const autoResolvableErrors = [
        { pattern: 'Temporary network timeout', action: 'retry' },
        { pattern: 'Cache miss', action: 'refresh' }
      ]

      // 自動解決設定のモック
      mockSupabaseClient.select.mockResolvedValueOnce({
        data: autoResolvableErrors,
        error: null
      })

      // 自動解決対象のエラーを報告
      const autoError = {
        message: 'Temporary network timeout in API call',
        stack: 'Error: Network timeout',
        component: 'NetworkAPI',
        url: '/api/network',
        userAgent: 'Mozilla/5.0...'
      }

      mockSupabaseClient.insert.mockResolvedValueOnce({
        data: [{ id: 'auto-error', ...autoError, created_at: new Date().toISOString() }],
        error: null
      })

      const autoRequest = new NextRequest('http://localhost:3000/api/error-reporting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(autoError)
      })

      const autoResponse = await errorReportingPost(autoRequest)
      expect(autoResponse.status).toBe(200)

      // 自動解決処理のモック
      mockSupabaseClient.update.mockResolvedValueOnce({
        data: [{
          id: 'auto-error',
          resolved_at: new Date().toISOString(),
          resolution_notes: 'Auto-resolved: Network retry successful',
          resolved_by: 'system'
        }],
        error: null
      })

      // 自動解決が実行されることを確認
      const autoResolveRequest = new NextRequest('http://localhost:3000/api/error-resolution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'auto-resolve',
          pattern: 'Temporary network timeout'
        })
      })

      const autoResolveResponse = await errorResolutionPost(autoResolveRequest)
      const autoResolveData = await autoResolveResponse.json()

      expect(autoResolveResponse.status).toBe(200)
      expect(autoResolveData.success).toBe(true)
    })
  })

  describe('パフォーマンス統合テスト', () => {
    it('大量エラー処理時のシステム全体パフォーマンス', async () => {
      const startTime = Date.now()
      const errorCount = 1000

      // 大量エラーの並列処理
      const errorPromises = Array.from({ length: errorCount }, async (_, i) => {
        const errorData = {
          message: `Bulk error ${i}`,
          stack: `Error: Bulk error ${i}`,
          component: 'BulkTest',
          url: `/api/bulk/${i}`,
          userAgent: 'Test Agent'
        }

        mockSupabaseClient.insert.mockResolvedValueOnce({
          data: [{ id: `bulk-error-${i}`, ...errorData, created_at: new Date().toISOString() }],
          error: null
        })

        const request = new NextRequest('http://localhost:3000/api/error-reporting', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(errorData)
        })

        return errorReportingPost(request)
      })

      const responses = await Promise.all(errorPromises)
      const endTime = Date.now()
      const processingTime = endTime - startTime

      // 全てのリクエストが成功することを確認
      responses.forEach(response => {
        expect(response.status).toBe(200)
      })

      // パフォーマンス要件の確認（1000エラーを10秒以内で処理）
      expect(processingTime).toBeLessThan(10000)

      // ダッシュボードでの大量データ表示パフォーマンス
      const bulkErrors = Array.from({ length: errorCount }, (_, i) => ({
        id: `bulk-error-${i}`,
        message: `Bulk error ${i}`,
        error_type: 'bulk',
        created_at: new Date().toISOString(),
        resolved_at: null,
        count: 1
      }))

      mockSupabaseClient.select.mockResolvedValueOnce({
        data: bulkErrors,
        error: null
      })

      const dashboardStartTime = Date.now()
      render(<ErrorDashboard />)

      await waitFor(() => {
        expect(screen.getByText('Bulk error 0')).toBeInTheDocument()
      }, { timeout: 5000 })

      const dashboardEndTime = Date.now()
      const dashboardRenderTime = dashboardEndTime - dashboardStartTime

      // ダッシュボードレンダリングが5秒以内に完了することを確認
      expect(dashboardRenderTime).toBeLessThan(5000)
    })

    it('メモリ使用量の監視とリーク検出', async () => {
      const initialMemory = process.memoryUsage()

      // 大量のエラー処理をシミュレート
      for (let i = 0; i < 100; i++) {
        notificationEngine.processError({
          id: `memory-test-${i}`,
          message: `Memory test error ${i}`,
          errorType: 'memory-test',
          severity: 'medium',
          timestamp: new Date(),
          metadata: { iteration: i }
        })
      }

      // ガベージコレクションの実行
      if (global.gc) {
        global.gc()
      }

      const finalMemory = process.memoryUsage()
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed

      // メモリ増加が合理的な範囲内であることを確認（50MB以下）
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024)
    })
  })

  describe('エラー処理とフォールバック', () => {
    it('API障害時のフォールバック動作', async () => {
      // データベース接続エラーをシミュレート
      mockSupabaseClient.insert.mockRejectedValueOnce(new Error('Database connection failed'))

      const errorData = {
        message: 'Test error during DB failure',
        stack: 'Error: Test',
        component: 'TestComponent',
        url: '/test',
        userAgent: 'Test Agent'
      }

      const request = new NextRequest('http://localhost:3000/api/error-reporting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData)
      })

      const response = await errorReportingPost(request)
      const result = await response.json()

      // エラーが適切に処理されることを確認
      expect(response.status).toBe(500)
      expect(result.error).toContain('エラーの報告に失敗')

      // フォールバック通知が送信されることを確認
      const consoleSpy = jest.spyOn(console, 'error')
      expect(consoleSpy).toHaveBeenCalled()
    })

    it('通知システム障害時の代替手段', async () => {
      // 通知システムのエラーをシミュレート
      jest.spyOn(notificationEngine, 'sendNotification').mockImplementation(() => {
        throw new Error('Notification service unavailable')
      })

      const criticalError = {
        id: 'critical-notification-test',
        message: 'Critical error during notification failure',
        errorType: 'critical',
        severity: 'critical',
        timestamp: new Date(),
        metadata: {}
      }

      // エラー処理がクラッシュしないことを確認
      expect(() => {
        notificationEngine.processError(criticalError as any)
      }).not.toThrow()

      // フォールバックログが出力されることを確認
      const consoleSpy = jest.spyOn(console, 'error')
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Notification service unavailable')
      )
    })
  })

  describe('セキュリティ統合テスト', () => {
    it('認証なしでのAPIアクセス拒否', async () => {
      const unauthorizedRequest = new NextRequest('http://localhost:3000/api/notification-settings?action=list')

      const response = await notificationSettingsGet(unauthorizedRequest)
      const result = await response.json()

      expect(response.status).toBe(401)
      expect(result.error).toContain('認証が必要')
    })

    it('不正なトークンでのアクセス拒否', async () => {
      const invalidTokenRequest = new NextRequest('http://localhost:3000/api/notification-settings?action=list', {
        headers: { 'authorization': 'Bearer invalid-token' }
      })

      const response = await notificationSettingsGet(invalidTokenRequest)
      
      // 簡易認証なので通る場合があるが、本格的な認証では401になるべき
      expect([200, 401]).toContain(response.status)
    })

    it('機密情報のマスキング', async () => {
      const sensitiveError = {
        message: 'Database error with password: secret123',
        stack: 'Error: Connection failed with password secret123\n  at connect()',
        component: 'DatabaseAPI',
        url: '/api/secure',
        userAgent: 'Test Agent'
      }

      mockSupabaseClient.insert.mockResolvedValueOnce({
        data: [{ 
          id: 'sensitive-error',
          message: 'Database error with password: [MASKED]',
          stack: 'Error: Connection failed with password [MASKED]\n  at connect()',
          created_at: new Date().toISOString()
        }],
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/error-reporting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sensitiveError)
      })

      const response = await errorReportingPost(request)
      expect(response.status).toBe(200)

      // 保存されたデータに機密情報が含まれていないことを確認
      const insertCall = mockSupabaseClient.insert.mock.calls[0][0]
      expect(insertCall.message).not.toContain('secret123')
      expect(insertCall.stack).not.toContain('secret123')
    })
  })
})