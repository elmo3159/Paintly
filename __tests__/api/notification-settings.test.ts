/**
 * @file 通知設定APIのユニットテスト
 * @description /api/notification-settings エンドポイントの全機能をテスト
 */

import { NextRequest } from 'next/server'
import { GET, POST, DELETE } from '@/app/api/notification-settings/route'

// 通知エンジンのモック
const mockNotificationEngine = {
  getInstance: jest.fn(),
  initialize: jest.fn(),
  addRule: jest.fn(),
  updateRule: jest.fn(),
  removeRule: jest.fn(),
  getRules: jest.fn(),
  getStats: jest.fn(),
  clearRules: jest.fn(),
  clearHistory: jest.fn(),
}

jest.mock('@/lib/notification-engine', () => ({
  notificationEngine: mockNotificationEngine
}))

// テストデータ
const mockNotificationRule = {
  id: 'test-rule-1',
  name: 'テストルール',
  enabled: true,
  conditions: {
    errorTypes: ['critical'],
    severityLevels: ['critical'],
    frequency: {
      threshold: 5,
      timeWindow: 5 * 60 * 1000
    }
  },
  actions: [
    {
      type: 'slack',
      target: 'test-channel',
      template: 'critical-error',
      priority: 'critical',
      rateLimit: {
        maxPerHour: 10,
        cooldownMinutes: 5
      }
    }
  ]
}

const mockStats = {
  totalRules: 2,
  activeRules: 2,
  totalNotifications: 10,
  successfulNotifications: 8,
  failedNotifications: 1,
  suppressedNotifications: 1,
  rateLimitedNotifications: 0
}

const mockHistory = [
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

// モック関数のセットアップ
const setupMocks = (options: {
  authenticated?: boolean
  rulesData?: any[]
  statsData?: any
  updateSuccess?: boolean
  addRuleSuccess?: boolean
  deleteSuccess?: boolean
} = {}) => {
  const {
    authenticated = true,
    rulesData = [mockNotificationRule],
    statsData = mockStats,
    updateSuccess = true,
    addRuleSuccess = true,
    deleteSuccess = true
  } = options

  mockNotificationEngine.getInstance.mockReturnValue(mockNotificationEngine)
  mockNotificationEngine.getRules.mockReturnValue(rulesData)
  mockNotificationEngine.getStats.mockReturnValue(statsData)
  mockNotificationEngine.updateRule.mockReturnValue(updateSuccess)
  mockNotificationEngine.addRule.mockReturnValue(addRuleSuccess)
  mockNotificationEngine.removeRule.mockReturnValue(deleteSuccess)
}

// リクエストモック作成ヘルパー
const createMockRequest = (
  options: {
    method?: string
    body?: any
    searchParams?: Record<string, string>
    headers?: Record<string, string>
  } = {}
) => {
  const {
    method = 'GET',
    body = {},
    searchParams = {},
    headers = {}
  } = options

  const url = new URL('http://localhost:3000/api/notification-settings')
  Object.entries(searchParams).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })

  return {
    method,
    url: url.toString(),
    json: jest.fn().mockResolvedValue(body),
    headers: new Map(Object.entries({
      'content-type': 'application/json',
      'authorization': 'Bearer test-token',
      ...headers
    }))
  } as unknown as NextRequest
}

describe('/api/notification-settings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupMocks()
  })

  describe('GET - 通知設定の取得', () => {
    describe('認証とセキュリティ', () => {
      test('認証されていないリクエストが拒否されること', async () => {
        const request = createMockRequest({
          headers: { authorization: '' }
        })
        
        const response = await GET(request)
        const responseData = await response.json()
        
        expect(response.status).toBe(401)
        expect(responseData.error).toBe('認証が必要です')
      })

      test('不正な認証ヘッダー形式が拒否されること', async () => {
        const request = createMockRequest({
          headers: { authorization: 'InvalidFormat' }
        })
        
        const response = await GET(request)
        const responseData = await response.json()
        
        expect(response.status).toBe(401)
        expect(responseData.error).toBe('認証が必要です')
      })
    })

    describe('ルール一覧取得', () => {
      test('全てのルールが正常に取得されること', async () => {
        const request = createMockRequest({
          searchParams: { action: 'list' }
        })
        
        const response = await GET(request)
        const responseData = await response.json()
        
        expect(response.status).toBe(200)
        expect(responseData.success).toBe(true)
        expect(responseData.rules).toEqual([mockNotificationRule])
        expect(responseData.stats).toEqual(mockStats)
        expect(mockNotificationEngine.initialize).toHaveBeenCalled()
      })

      test('デフォルトアクションでルール一覧が取得されること', async () => {
        const request = createMockRequest()
        
        const response = await GET(request)
        const responseData = await response.json()
        
        expect(response.status).toBe(200)
        expect(responseData.success).toBe(true)
        expect(responseData.rules).toBeDefined()
        expect(responseData.stats).toBeDefined()
      })
    })

    describe('個別ルール取得', () => {
      test('特定のルールが正常に取得されること', async () => {
        const request = createMockRequest({
          searchParams: { action: 'get', ruleId: 'test-rule-1' }
        })
        
        const response = await GET(request)
        const responseData = await response.json()
        
        expect(response.status).toBe(200)
        expect(responseData.success).toBe(true)
        expect(responseData.rule).toEqual(mockNotificationRule)
      })

      test('存在しないルールIDで404が返されること', async () => {
        setupMocks({ rulesData: [] })
        
        const request = createMockRequest({
          searchParams: { action: 'get', ruleId: 'non-existent' }
        })
        
        const response = await GET(request)
        const responseData = await response.json()
        
        expect(response.status).toBe(404)
        expect(responseData.error).toBe('ルールが見つかりません')
      })

      test('ルールIDが指定されていない場合400が返されること', async () => {
        const request = createMockRequest({
          searchParams: { action: 'get' }
        })
        
        const response = await GET(request)
        const responseData = await response.json()
        
        expect(response.status).toBe(400)
        expect(responseData.error).toBe('ルールIDが必要です')
      })
    })

    describe('統計情報取得', () => {
      test('統計情報が正常に取得されること', async () => {
        const request = createMockRequest({
          searchParams: { action: 'stats' }
        })
        
        const response = await GET(request)
        const responseData = await response.json()
        
        expect(response.status).toBe(200)
        expect(responseData.success).toBe(true)
        expect(responseData.stats).toEqual(
          expect.objectContaining({
            ...mockStats,
            history: expect.objectContaining({
              sent24h: expect.any(Number),
              failed24h: expect.any(Number),
              suppressed24h: expect.any(Number)
            })
          })
        )
      })
    })

    describe('エラーハンドリング', () => {
      test('無効なアクションで400が返されること', async () => {
        const request = createMockRequest({
          searchParams: { action: 'invalid' }
        })
        
        const response = await GET(request)
        const responseData = await response.json()
        
        expect(response.status).toBe(400)
        expect(responseData.error).toBe('無効なアクションです')
      })

      test('通知エンジンエラーが適切にハンドリングされること', async () => {
        mockNotificationEngine.initialize.mockImplementation(() => {
          throw new Error('Initialization failed')
        })
        
        const request = createMockRequest()
        
        const response = await GET(request)
        const responseData = await response.json()
        
        expect(response.status).toBe(500)
        expect(responseData.error).toBe('通知設定の取得に失敗しました')
        expect(responseData.details).toBe('Initialization failed')
      })
    })
  })

  describe('POST - 通知設定の作成・更新', () => {
    describe('認証とセキュリティ', () => {
      test('認証されていないリクエストが拒否されること', async () => {
        const request = createMockRequest({
          method: 'POST',
          headers: { authorization: '' },
          body: { action: 'create', rule: mockNotificationRule }
        })
        
        const response = await POST(request)
        const responseData = await response.json()
        
        expect(response.status).toBe(401)
        expect(responseData.error).toBe('認証が必要です')
      })
    })

    describe('ルール作成', () => {
      test('新しいルールが正常に作成されること', async () => {
        const newRule = {
          name: '新しいルール',
          enabled: true,
          conditions: { errorTypes: ['warning'] },
          actions: [{ type: 'email', target: 'admin@example.com' }]
        }
        
        const request = createMockRequest({
          method: 'POST',
          body: { action: 'create', rule: newRule }
        })
        
        const response = await POST(request)
        const responseData = await response.json()
        
        expect(response.status).toBe(200)
        expect(responseData.success).toBe(true)
        expect(responseData.message).toBe('通知ルールが作成されました')
        expect(responseData.rule).toEqual(expect.objectContaining({
          id: expect.stringMatching(/^custom_\d+_/),
          name: '新しいルール',
          enabled: true
        }))
        expect(mockNotificationEngine.addRule).toHaveBeenCalled()
      })

      test('ルール情報が不足している場合400が返されること', async () => {
        const request = createMockRequest({
          method: 'POST',
          body: { action: 'create', rule: {} }
        })
        
        const response = await POST(request)
        const responseData = await response.json()
        
        expect(response.status).toBe(400)
        expect(responseData.error).toBe('ルール情報が不足しています')
      })

      test('ルールが指定されていない場合400が返されること', async () => {
        const request = createMockRequest({
          method: 'POST',
          body: { action: 'create' }
        })
        
        const response = await POST(request)
        const responseData = await response.json()
        
        expect(response.status).toBe(400)
        expect(responseData.error).toBe('ルール情報が不足しています')
      })
    })

    describe('ルール更新', () => {
      test('既存のルールが正常に更新されること', async () => {
        const updateData = {
          name: '更新されたルール',
          enabled: false
        }
        
        const request = createMockRequest({
          method: 'POST',
          body: { action: 'update', ruleId: 'test-rule-1', rule: updateData }
        })
        
        const response = await POST(request)
        const responseData = await response.json()
        
        expect(response.status).toBe(200)
        expect(responseData.success).toBe(true)
        expect(responseData.message).toBe('通知ルールが更新されました')
        expect(responseData.ruleId).toBe('test-rule-1')
        expect(mockNotificationEngine.updateRule).toHaveBeenCalledWith('test-rule-1', updateData)
      })

      test('存在しないルールの更新で404が返されること', async () => {
        setupMocks({ updateSuccess: false })
        
        const request = createMockRequest({
          method: 'POST',
          body: { action: 'update', ruleId: 'non-existent', rule: { name: 'Test' } }
        })
        
        const response = await POST(request)
        const responseData = await response.json()
        
        expect(response.status).toBe(404)
        expect(responseData.error).toBe('ルールが見つかりません')
      })

      test('更新に必要な情報が不足している場合400が返されること', async () => {
        const request = createMockRequest({
          method: 'POST',
          body: { action: 'update', ruleId: 'test-rule-1' }
        })
        
        const response = await POST(request)
        const responseData = await response.json()
        
        expect(response.status).toBe(400)
        expect(responseData.error).toBe('ルールIDと更新情報が必要です')
      })
    })

    describe('ルール切り替え', () => {
      test('ルールの有効/無効が正常に切り替えられること', async () => {
        const request = createMockRequest({
          method: 'POST',
          body: { action: 'toggle', ruleId: 'test-rule-1' }
        })
        
        const response = await POST(request)
        const responseData = await response.json()
        
        expect(response.status).toBe(200)
        expect(responseData.success).toBe(true)
        expect(responseData.message).toBe('通知ルールが無効になりました')
        expect(responseData.ruleId).toBe('test-rule-1')
        expect(responseData.enabled).toBe(false)
        expect(mockNotificationEngine.updateRule).toHaveBeenCalledWith('test-rule-1', { enabled: false })
      })

      test('存在しないルールの切り替えで404が返されること', async () => {
        setupMocks({ rulesData: [] })
        
        const request = createMockRequest({
          method: 'POST',
          body: { action: 'toggle', ruleId: 'non-existent' }
        })
        
        const response = await POST(request)
        const responseData = await response.json()
        
        expect(response.status).toBe(404)
        expect(responseData.error).toBe('ルールが見つかりません')
      })

      test('切り替えに失敗した場合500が返されること', async () => {
        setupMocks({ updateSuccess: false })
        
        const request = createMockRequest({
          method: 'POST',
          body: { action: 'toggle', ruleId: 'test-rule-1' }
        })
        
        const response = await POST(request)
        const responseData = await response.json()
        
        expect(response.status).toBe(500)
        expect(responseData.error).toBe('ルールの切り替えに失敗しました')
      })
    })

    describe('バリデーション', () => {
      test('アクションが指定されていない場合400が返されること', async () => {
        const request = createMockRequest({
          method: 'POST',
          body: { rule: mockNotificationRule }
        })
        
        const response = await POST(request)
        const responseData = await response.json()
        
        expect(response.status).toBe(400)
        expect(responseData.error).toBe('アクションが必要です')
      })

      test('無効なアクションで400が返されること', async () => {
        const request = createMockRequest({
          method: 'POST',
          body: { action: 'invalid', rule: mockNotificationRule }
        })
        
        const response = await POST(request)
        const responseData = await response.json()
        
        expect(response.status).toBe(400)
        expect(responseData.error).toBe('無効なアクションです')
      })

      test('無効なJSONが適切にハンドリングされること', async () => {
        const request = {
          json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
          headers: new Map([['authorization', 'Bearer test-token']])
        } as unknown as NextRequest
        
        const response = await POST(request)
        const responseData = await response.json()
        
        expect(response.status).toBe(500)
        expect(responseData.error).toBe('通知設定の更新に失敗しました')
      })
    })
  })

  describe('DELETE - 通知設定の削除', () => {
    describe('認証とセキュリティ', () => {
      test('認証されていないリクエストが拒否されること', async () => {
        const request = createMockRequest({
          method: 'DELETE',
          headers: { authorization: '' },
          searchParams: { ruleId: 'test-rule-1' }
        })
        
        const response = await DELETE(request)
        const responseData = await response.json()
        
        expect(response.status).toBe(401)
        expect(responseData.error).toBe('認証が必要です')
      })
    })

    describe('ルール削除', () => {
      test('カスタムルールが正常に削除されること', async () => {
        const request = createMockRequest({
          method: 'DELETE',
          searchParams: { ruleId: 'custom_123_abc' }
        })
        
        const response = await DELETE(request)
        const responseData = await response.json()
        
        expect(response.status).toBe(200)
        expect(responseData.success).toBe(true)
        expect(responseData.message).toBe('通知ルールが削除されました')
        expect(responseData.ruleId).toBe('custom_123_abc')
      })

      test('存在しないルールの削除で404が返されること', async () => {
        setupMocks({ deleteSuccess: false })
        
        const request = createMockRequest({
          method: 'DELETE',
          searchParams: { ruleId: 'non-existent' }
        })
        
        const response = await DELETE(request)
        const responseData = await response.json()
        
        expect(response.status).toBe(404)
        expect(responseData.error).toBe('ルールが見つかりません')
      })

      test('ルールIDが指定されていない場合400が返されること', async () => {
        const request = createMockRequest({
          method: 'DELETE'
        })
        
        const response = await DELETE(request)
        const responseData = await response.json()
        
        expect(response.status).toBe(400)
        expect(responseData.error).toBe('ルールIDが必要です')
      })
    })

    describe('システムデフォルトルールの保護', () => {
      test.each([
        'critical-immediate',
        'high-frequency-alerts',
        'api-error-monitoring',
        'user-impact-critical',
        'javascript-error-tracking'
      ])('システムデフォルトルール %s の削除が拒否されること', async (ruleId) => {
        const request = createMockRequest({
          method: 'DELETE',
          searchParams: { ruleId }
        })
        
        const response = await DELETE(request)
        const responseData = await response.json()
        
        expect(response.status).toBe(403)
        expect(responseData.error).toBe('システムデフォルトルールは削除できません')
      })
    })

    describe('エラーハンドリング', () => {
      test('削除処理でエラーが発生した場合500が返されること', async () => {
        const mockDeleteFunction = jest.fn().mockRejectedValue(new Error('Delete failed'))
        
        // モジュール内の deleteNotificationRule 関数をモック
        const request = createMockRequest({
          method: 'DELETE',
          searchParams: { ruleId: 'custom_123_abc' }
        })
        
        // エラーを発生させるために通知エンジンでエラーをスロー
        mockNotificationEngine.initialize.mockImplementation(() => {
          throw new Error('Delete operation failed')
        })
        
        const response = await DELETE(request)
        const responseData = await response.json()
        
        expect(response.status).toBe(500)
        expect(responseData.error).toBe('通知設定の削除に失敗しました')
        expect(responseData.details).toBe('Delete operation failed')
      })
    })
  })

  describe('レスポンス形式とヘッダー', () => {
    test('成功レスポンスが正しい形式であること', async () => {
      const request = createMockRequest()
      
      const response = await GET(request)
      const responseData = await response.json()
      
      expect(responseData).toHaveProperty('success', true)
      expect(responseData).toHaveProperty('rules')
      expect(responseData).toHaveProperty('stats')
    })

    test('エラーレスポンスが正しい形式であること', async () => {
      const request = createMockRequest({
        headers: { authorization: '' }
      })
      
      const response = await GET(request)
      const responseData = await response.json()
      
      expect(responseData).toHaveProperty('error')
      expect(responseData).not.toHaveProperty('success')
    })

    test('Content-Typeヘッダーが正しく設定されること', async () => {
      const request = createMockRequest()
      
      const response = await GET(request)
      
      expect(response.headers.get('content-type')).toBe('application/json')
    })
  })

  describe('パフォーマンス', () => {
    test('大量のルール処理が効率的に行われること', async () => {
      const manyRules = Array.from({ length: 100 }, (_, i) => ({
        ...mockNotificationRule,
        id: `rule-${i}`,
        name: `ルール ${i}`
      }))
      
      setupMocks({ rulesData: manyRules })
      
      const request = createMockRequest()
      
      const start = Date.now()
      const response = await GET(request)
      const end = Date.now()
      
      expect(response.status).toBe(200)
      expect(end - start).toBeLessThan(1000) // 1秒以内
      
      const responseData = await response.json()
      expect(responseData.rules).toHaveLength(100)
    })

    test('並行処理が適切に処理されること', async () => {
      const promises = []
      
      for (let i = 0; i < 5; i++) {
        const request = createMockRequest({
          method: 'POST',
          body: {
            action: 'create',
            rule: {
              name: `並行ルール ${i}`,
              enabled: true,
              conditions: {},
              actions: []
            }
          }
        })
        promises.push(POST(request))
      }
      
      const responses = await Promise.all(promises)
      
      responses.forEach(response => {
        expect(response.status).toBe(200)
      })
      
      expect(mockNotificationEngine.addRule).toHaveBeenCalledTimes(5)
    })
  })
})