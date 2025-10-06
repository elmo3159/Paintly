/**
 * @file エラーレポートAPIのユニットテスト
 * @description /api/error-reporting エンドポイントの全機能をテスト
 */

import { NextRequest } from 'next/server'
import { POST } from '@/app/api/error-reporting/route'

// モック関数
const mockCreateClient = jest.fn()
const mockSupabaseFrom = jest.fn()
const mockSupabaseInsert = jest.fn()
const mockSupabaseSelect = jest.fn()

// Supabase のモック
jest.mock('@/lib/supabase', () => ({
  createClient: () => mockCreateClient()
}))

// 通知エンジンのモック
const mockNotificationEngine = {
  getInstance: jest.fn(),
  initialize: jest.fn(),
  processErrorNotification: jest.fn(),
}

jest.mock('@/lib/notification-engine', () => ({
  notificationEngine: mockNotificationEngine
}))

// 認証のモック
const mockGetUser = jest.fn()

// テストデータ
const validErrorReport = {
  message: 'Test error message',
  severity: 'high',
  errorType: 'javascript',
  stackTrace: 'Error: Test error\n  at test.js:1:1',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  url: '/test-page',
  userId: 'test-user-id',
  sessionId: 'test-session-id',
  timestamp: new Date().toISOString(),
  additionalInfo: { testData: 'value' }
}

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com'
}

// モック関数のセットアップ
const setupMocks = (options: {
  userAuthenticated?: boolean
  supabaseInsertSuccess?: boolean
  supabaseSelectSuccess?: boolean
  notificationSuccess?: boolean
} = {}) => {
  const {
    userAuthenticated = true,
    supabaseInsertSuccess = true,
    supabaseSelectSuccess = true,
    notificationSuccess = true
  } = options

  // 認証モック
  mockGetUser.mockResolvedValue(
    userAuthenticated 
      ? { data: { user: mockUser }, error: null }
      : { data: { user: null }, error: new Error('Not authenticated') }
  )

  // Supabase モック
  mockSupabaseSelect.mockResolvedValue(
    supabaseSelectSuccess
      ? { data: [{ count: 5 }], error: null }
      : { data: null, error: new Error('Select failed') }
  )

  mockSupabaseInsert.mockResolvedValue(
    supabaseInsertSuccess
      ? { data: { id: 'test-error-id' }, error: null }
      : { data: null, error: new Error('Insert failed') }
  )

  mockSupabaseFrom.mockReturnValue({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        gte: jest.fn(() => mockSupabaseSelect),
        single: jest.fn(() => mockSupabaseSelect)
      })),
      gte: jest.fn(() => mockSupabaseSelect)
    })),
    insert: jest.fn(() => mockSupabaseInsert)
  })

  mockCreateClient.mockReturnValue({
    auth: {
      getUser: mockGetUser
    },
    from: mockSupabaseFrom
  })

  // 通知エンジンモック
  mockNotificationEngine.getInstance.mockReturnValue(mockNotificationEngine)
  mockNotificationEngine.processErrorNotification.mockResolvedValue(
    notificationSuccess ? undefined : Promise.reject(new Error('Notification failed'))
  )
}

// リクエストモック作成ヘルパー
const createMockRequest = (body: any, headers: Record<string, string> = {}) => {
  return {
    json: jest.fn().mockResolvedValue(body),
    headers: new Map(Object.entries({
      'content-type': 'application/json',
      'authorization': 'Bearer test-token',
      ...headers
    }))
  } as unknown as NextRequest
}

describe('/api/error-reporting', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupMocks()
  })

  describe('正常なエラーレポート処理', () => {
    test('有効なエラーレポートが正常に処理されること', async () => {
      const request = createMockRequest(validErrorReport)
      
      const response = await POST(request)
      const responseData = await response.json()
      
      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.message).toBe('エラーが正常に記録されました')
      expect(responseData.errorId).toBeDefined()
      expect(responseData.severity).toBe('high')
    })

    test('最小限の必須フィールドでもエラーレポートが処理されること', async () => {
      const minimalReport = {
        message: 'Minimal error message',
        severity: 'medium'
      }
      
      const request = createMockRequest(minimalReport)
      
      const response = await POST(request)
      const responseData = await response.json()
      
      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
    })

    test('通知エンジンが正しく呼び出されること', async () => {
      const request = createMockRequest(validErrorReport)
      
      await POST(request)
      
      expect(mockNotificationEngine.getInstance).toHaveBeenCalled()
      expect(mockNotificationEngine.initialize).toHaveBeenCalled()
      expect(mockNotificationEngine.processErrorNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          errorId: expect.any(String),
          errorType: 'javascript',
          message: 'Test error message',
          severity: 'high',
          userAgent: expect.any(String),
          url: '/test-page',
          userId: 'test-user-id',
          sessionId: 'test-session-id'
        })
      )
    })
  })

  describe('認証とセキュリティ', () => {
    test('認証されていないリクエストが拒否されること', async () => {
      setupMocks({ userAuthenticated: false })
      
      const request = createMockRequest(validErrorReport)
      
      const response = await POST(request)
      const responseData = await response.json()
      
      expect(response.status).toBe(401)
      expect(responseData.error).toBe('認証が必要です')
    })

    test('認証ヘッダーが無いリクエストが拒否されること', async () => {
      const request = createMockRequest(validErrorReport, { authorization: '' })
      
      const response = await POST(request)
      const responseData = await response.json()
      
      expect(response.status).toBe(401)
      expect(responseData.error).toBe('認証が必要です')
    })

    test('不正な認証ヘッダー形式が拒否されること', async () => {
      const request = createMockRequest(validErrorReport, { 
        authorization: 'InvalidTokenFormat' 
      })
      
      const response = await POST(request)
      const responseData = await response.json()
      
      expect(response.status).toBe(401)
      expect(responseData.error).toBe('認証が必要です')
    })
  })

  describe('バリデーション', () => {
    test('空のリクエストボディが適切にハンドリングされること', async () => {
      const request = createMockRequest({})
      
      const response = await POST(request)
      const responseData = await response.json()
      
      expect(response.status).toBe(400)
      expect(responseData.error).toBe('エラーメッセージは必須です')
    })

    test('メッセージが無いリクエストが拒否されること', async () => {
      const invalidReport = {
        severity: 'high',
        errorType: 'javascript'
      }
      
      const request = createMockRequest(invalidReport)
      
      const response = await POST(request)
      const responseData = await response.json()
      
      expect(response.status).toBe(400)
      expect(responseData.error).toBe('エラーメッセージは必須です')
    })

    test('無効なJSONが適切にハンドリングされること', async () => {
      const request = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
        headers: new Map([['authorization', 'Bearer test-token']])
      } as unknown as NextRequest
      
      const response = await POST(request)
      const responseData = await response.json()
      
      expect(response.status).toBe(400)
      expect(responseData.error).toBe('無効なリクエスト形式です')
    })

    test('非常に長いメッセージが適切に処理されること', async () => {
      const longMessage = 'a'.repeat(10000)
      const reportWithLongMessage = {
        ...validErrorReport,
        message: longMessage
      }
      
      const request = createMockRequest(reportWithLongMessage)
      
      const response = await POST(request)
      const responseData = await response.json()
      
      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
    })
  })

  describe('重要度分析', () => {
    test.each([
      ['critical', ['critical', 'auth', 'database'], 'critical'],
      ['high', ['high', 'api', 'payment'], 'high'], 
      ['medium', ['medium', 'validation'], 'medium'],
      ['low', ['low', 'info'], 'low'],
      ['unknown', ['unknown'], 'medium'] // デフォルト値
    ])('重要度 %s のエラーが正しく分類されること', async (inputSeverity, errorTypes, expectedSeverity) => {
      for (const errorType of errorTypes) {
        const report = {
          ...validErrorReport,
          severity: inputSeverity,
          errorType: errorType
        }
        
        const request = createMockRequest(report)
        
        const response = await POST(request)
        const responseData = await response.json()
        
        expect(response.status).toBe(200)
        expect(responseData.severity).toBe(expectedSeverity)
      }
    })

    test('エラー頻度が正しく計算されること', async () => {
      // 同じエラーが複数回発生した場合の頻度計算をテスト
      setupMocks({
        supabaseSelectSuccess: true
      })
      
      // Select モックで頻度データを返す
      mockSupabaseSelect.mockResolvedValueOnce({
        data: [{ count: '15' }],
        error: null
      })
      
      const request = createMockRequest(validErrorReport)
      
      const response = await POST(request)
      const responseData = await response.json()
      
      expect(response.status).toBe(200)
      expect(mockNotificationEngine.processErrorNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          frequency: 15
        })
      )
    })

    test('ユーザー影響度が正しく計算されること', async () => {
      // アクティブユーザー数の計算をテスト
      mockSupabaseSelect
        .mockResolvedValueOnce({ data: [{ count: '15' }], error: null }) // 頻度
        .mockResolvedValueOnce({ data: [{ count: '200' }], error: null }) // アクティブユーザー
      
      const request = createMockRequest(validErrorReport)
      
      const response = await POST(request)
      const responseData = await response.json()
      
      expect(response.status).toBe(200)
      expect(mockNotificationEngine.processErrorNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          userImpact: 7.5 // 15/200 * 100
        })
      )
    })
  })

  describe('データベース操作', () => {
    test('データベース挿入エラーが適切にハンドリングされること', async () => {
      setupMocks({ supabaseInsertSuccess: false })
      
      const request = createMockRequest(validErrorReport)
      
      const response = await POST(request)
      const responseData = await response.json()
      
      expect(response.status).toBe(500)
      expect(responseData.error).toBe('エラーの記録に失敗しました')
      expect(responseData.details).toBeDefined()
    })

    test('データベース選択エラーが適切にハンドリングされること', async () => {
      setupMocks({ supabaseSelectSuccess: false })
      
      const request = createMockRequest(validErrorReport)
      
      const response = await POST(request)
      
      // 選択エラーがあってもエラーレポートは記録される
      expect(response.status).toBe(200)
      
      // ただし頻度は0として処理される
      expect(mockNotificationEngine.processErrorNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          frequency: 0
        })
      )
    })

    test('正しいデータベース構造でエラーが保存されること', async () => {
      const request = createMockRequest(validErrorReport)
      
      await POST(request)
      
      expect(mockSupabaseInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String),
          message: 'Test error message',
          severity: 'high',
          error_type: 'javascript',
          stack_trace: expect.any(String),
          user_agent: expect.any(String),
          url: '/test-page',
          user_id: 'test-user-id',
          session_id: 'test-session-id',
          timestamp: expect.any(String),
          additional_info: expect.any(Object),
          resolved: false,
          created_at: expect.any(String)
        })
      )
    })
  })

  describe('通知システム統合', () => {
    test('通知エンジンエラーが適切にハンドリングされること', async () => {
      setupMocks({ notificationSuccess: false })
      
      const request = createMockRequest(validErrorReport)
      
      const response = await POST(request)
      const responseData = await response.json()
      
      // エラーレポートは正常に記録されるが、通知エラーは記録される
      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.notificationSent).toBe(false)
    })

    test('重要度の高いエラーで通知が確実に送信されること', async () => {
      const criticalError = {
        ...validErrorReport,
        severity: 'critical',
        errorType: 'critical'
      }
      
      const request = createMockRequest(criticalError)
      
      await POST(request)
      
      expect(mockNotificationEngine.processErrorNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'critical',
          errorType: 'critical'
        })
      )
    })
  })

  describe('レスポンス形式', () => {
    test('成功レスポンスが正しい形式であること', async () => {
      const request = createMockRequest(validErrorReport)
      
      const response = await POST(request)
      const responseData = await response.json()
      
      expect(responseData).toHaveProperty('success', true)
      expect(responseData).toHaveProperty('message')
      expect(responseData).toHaveProperty('errorId')
      expect(responseData).toHaveProperty('severity')
      expect(responseData).toHaveProperty('notificationSent')
      expect(responseData).toHaveProperty('timestamp')
    })

    test('エラーレスポンスが正しい形式であること', async () => {
      setupMocks({ userAuthenticated: false })
      
      const request = createMockRequest(validErrorReport)
      
      const response = await POST(request)
      const responseData = await response.json()
      
      expect(responseData).toHaveProperty('error')
      expect(responseData).not.toHaveProperty('success')
      expect(responseData).not.toHaveProperty('errorId')
    })

    test('Content-Typeヘッダーが正しく設定されること', async () => {
      const request = createMockRequest(validErrorReport)
      
      const response = await POST(request)
      
      expect(response.headers.get('content-type')).toBe('application/json')
    })
  })

  describe('パフォーマンス', () => {
    test('大量のエラーレポートが効率的に処理されること', async () => {
      const promises = []
      
      for (let i = 0; i < 10; i++) {
        const report = {
          ...validErrorReport,
          message: `Error message ${i}`,
          sessionId: `session-${i}`
        }
        
        const request = createMockRequest(report)
        promises.push(POST(request))
      }
      
      const responses = await Promise.all(promises)
      
      responses.forEach(response => {
        expect(response.status).toBe(200)
      })
      
      expect(mockSupabaseInsert).toHaveBeenCalledTimes(10)
      expect(mockNotificationEngine.processErrorNotification).toHaveBeenCalledTimes(10)
    })

    test('非同期処理が適切に処理されること', async () => {
      const request = createMockRequest(validErrorReport)
      
      const start = Date.now()
      const response = await POST(request)
      const end = Date.now()
      
      expect(response.status).toBe(200)
      expect(end - start).toBeLessThan(5000) // 5秒以内に完了
    })
  })
})