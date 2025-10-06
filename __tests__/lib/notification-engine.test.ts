/**
 * @file 通知エンジンライブラリのユニットテスト
 * @description NotificationEngine クラスの全機能をテスト
 */

import { NotificationEngine, type NotificationRule, type NotificationContext } from '@/lib/notification-engine'

// テストデータ
const mockNotificationRule: NotificationRule = {
  id: 'test-rule-1',
  name: 'テストルール',
  enabled: true,
  conditions: {
    errorTypes: ['critical'],
    severityLevels: ['critical'],
    frequency: {
      threshold: 5,
      timeWindow: 5 * 60 * 1000 // 5分
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

const mockNotificationContext: NotificationContext = {
  errorId: 'test-error-123',
  errorType: 'critical',
  message: 'テストエラー',
  severity: 'critical',
  timestamp: new Date().toISOString(),
  userAgent: 'test-agent',
  url: '/test',
  userId: 'test-user-id',
  sessionId: 'test-session-id',
  stackTrace: 'Error: Test error\n  at test.js:1:1',
  additionalInfo: { testData: 'value' },
  userImpact: 50,
  frequency: 3,
  similarErrors: ['error-1', 'error-2']
}

// モック関数
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation()
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation()

describe('NotificationEngine', () => {
  let notificationEngine: NotificationEngine

  beforeEach(() => {
    // 各テストの前にエンジンを初期化
    notificationEngine = NotificationEngine.getInstance()
    notificationEngine.initialize()
    
    // モック関数をクリア
    mockConsoleLog.mockClear()
    mockConsoleError.mockClear()
  })

  afterEach(() => {
    // 各テストの後にクリーンアップ
    notificationEngine.clearRules()
    notificationEngine.clearHistory()
  })

  describe('シングルトンパターン', () => {
    test('getInstance() が同じインスタンスを返すこと', () => {
      const instance1 = NotificationEngine.getInstance()
      const instance2 = NotificationEngine.getInstance()
      
      expect(instance1).toBe(instance2)
    })

    test('複数回初期化しても安全であること', () => {
      expect(() => {
        notificationEngine.initialize()
        notificationEngine.initialize()
        notificationEngine.initialize()
      }).not.toThrow()
    })
  })

  describe('ルール管理', () => {
    test('ルールの追加ができること', () => {
      notificationEngine.addRule(mockNotificationRule)
      
      const rules = notificationEngine.getRules()
      expect(rules).toHaveLength(1)
      expect(rules[0]).toEqual(mockNotificationRule)
    })

    test('複数のルールを追加できること', () => {
      const rule2: NotificationRule = {
        ...mockNotificationRule,
        id: 'test-rule-2',
        name: 'テストルール2'
      }

      notificationEngine.addRule(mockNotificationRule)
      notificationEngine.addRule(rule2)
      
      const rules = notificationEngine.getRules()
      expect(rules).toHaveLength(2)
      expect(rules.map(r => r.id)).toContain('test-rule-1')
      expect(rules.map(r => r.id)).toContain('test-rule-2')
    })

    test('同じIDのルールを追加すると上書きされること', () => {
      const originalRule = mockNotificationRule
      const updatedRule: NotificationRule = {
        ...mockNotificationRule,
        name: '更新されたルール'
      }

      notificationEngine.addRule(originalRule)
      notificationEngine.addRule(updatedRule)
      
      const rules = notificationEngine.getRules()
      expect(rules).toHaveLength(1)
      expect(rules[0].name).toBe('更新されたルール')
    })

    test('ルールの更新ができること', () => {
      notificationEngine.addRule(mockNotificationRule)
      
      const updated = notificationEngine.updateRule('test-rule-1', {
        name: '更新されたルール名',
        enabled: false
      })
      
      expect(updated).toBe(true)
      
      const rules = notificationEngine.getRules()
      expect(rules[0].name).toBe('更新されたルール名')
      expect(rules[0].enabled).toBe(false)
    })

    test('存在しないルールの更新は失敗すること', () => {
      const updated = notificationEngine.updateRule('non-existent', {
        name: 'テスト'
      })
      
      expect(updated).toBe(false)
    })

    test('ルールの削除ができること', () => {
      notificationEngine.addRule(mockNotificationRule)
      
      const deleted = notificationEngine.removeRule('test-rule-1')
      expect(deleted).toBe(true)
      
      const rules = notificationEngine.getRules()
      expect(rules).toHaveLength(0)
    })

    test('存在しないルールの削除は失敗すること', () => {
      const deleted = notificationEngine.removeRule('non-existent')
      expect(deleted).toBe(false)
    })

    test('すべてのルールをクリアできること', () => {
      notificationEngine.addRule(mockNotificationRule)
      notificationEngine.addRule({
        ...mockNotificationRule,
        id: 'test-rule-2'
      })
      
      notificationEngine.clearRules()
      
      const rules = notificationEngine.getRules()
      expect(rules).toHaveLength(0)
    })
  })

  describe('通知処理', () => {
    beforeEach(() => {
      notificationEngine.addRule(mockNotificationRule)
    })

    test('条件に合致する通知が処理されること', async () => {
      await notificationEngine.processErrorNotification(mockNotificationContext)
      
      const history = notificationEngine.getHistory()
      expect(history).toHaveLength(1)
      expect(history[0].ruleId).toBe('test-rule-1')
      expect(history[0].status).toBe('sent')
    })

    test('無効化されたルールは処理されないこと', async () => {
      notificationEngine.updateRule('test-rule-1', { enabled: false })
      
      await notificationEngine.processErrorNotification(mockNotificationContext)
      
      const history = notificationEngine.getHistory()
      expect(history).toHaveLength(0)
    })

    test('条件に合致しない通知は処理されないこと', async () => {
      const nonMatchingContext: NotificationContext = {
        ...mockNotificationContext,
        errorType: 'info', // criticalではない
        severity: 'low'     // criticalではない
      }
      
      await notificationEngine.processErrorNotification(nonMatchingContext)
      
      const history = notificationEngine.getHistory()
      expect(history).toHaveLength(0)
    })

    test('頻度制限が正しく動作すること', async () => {
      // 頻度制限専用のルール（閾値1で即座に抑制）を作成
      const frequencyLimitRule: NotificationRule = {
        ...mockNotificationRule,
        id: 'frequency-limit-test',
        conditions: {
          errorTypes: ['critical'],
          severityLevels: ['critical'],
          frequency: {
            threshold: 1, // 1回で即座に抑制
            timeWindow: 5 * 60 * 1000 // 5分
          }
        },
        actions: [
          {
            type: 'slack',
            target: 'test-channel',
            template: 'critical-error',
            priority: 'critical'
            // rateLimitやcooldownを削除してfrequency suppressionのみをテスト
          }
        ]
      }

      // 既存のすべてのルールをクリアして新しいルールのみを追加
      notificationEngine.clearRules()
      notificationEngine.addRule(frequencyLimitRule)

      // 最初の通知（送信される）
      await notificationEngine.processErrorNotification(mockNotificationContext)

      // 同じエラーを短時間で再送信（抑制される）
      await notificationEngine.processErrorNotification(mockNotificationContext)

      const history = notificationEngine.getHistory()

      // 1回目は送信、2回目は抑制されるはず
      const sentNotifications = history.filter(h => h.status === 'sent')
      const suppressedNotifications = history.filter(h => h.status === 'suppressed')

      expect(sentNotifications).toHaveLength(1)
      expect(suppressedNotifications).toHaveLength(1)
    })

    test('レート制限が正しく動作すること', async () => {
      // レート制限専用のルール（クールダウンと頻度制限なし）を作成
      const rateLimitRule: NotificationRule = {
        ...mockNotificationRule,
        id: 'rate-limit-test',
        conditions: {
          errorTypes: ['critical'],
          severityLevels: ['critical']
          // frequency条件を削除してすべての通知を処理
        },
        actions: [
          {
            type: 'slack',
            target: 'test-channel',
            template: 'critical-error',
            priority: 'critical',
            rateLimit: {
              maxPerHour: 10
              // cooldownMinutesを削除してsuppressionを防ぐ
            }
          }
        ]
      }

      // 既存のルールをクリアして新しいルールを追加
      notificationEngine.clearRules()
      notificationEngine.addRule(rateLimitRule)

      // maxPerHour: 10 の設定で11回通知を順次送信（レート制限を確実にテストするため）
      for (let i = 0; i < 11; i++) {
        const context = {
          ...mockNotificationContext,
          errorId: `test-error-${i}` // 異なるエラーID
        }
        await notificationEngine.processErrorNotification(context)
      }

      const history = notificationEngine.getHistory()
      const sentNotifications = history.filter(h => h.status === 'sent')
      const rateLimitedNotifications = history.filter(h => h.status === 'rate_limited')

      expect(sentNotifications.length).toBeLessThanOrEqual(10)
      expect(rateLimitedNotifications.length).toBeGreaterThan(0)
    })
  })

  describe('条件マッチング', () => {
    test('エラータイプ条件が正しく評価されること', async () => {
      const rule: NotificationRule = {
        ...mockNotificationRule,
        id: 'error-type-test',
        conditions: {
          errorTypes: ['auth', 'payment']
        }
      }
      
      notificationEngine.addRule(rule)
      
      // マッチするケース
      await notificationEngine.processErrorNotification({
        ...mockNotificationContext,
        errorType: 'auth'
      })
      
      // マッチしないケース
      await notificationEngine.processErrorNotification({
        ...mockNotificationContext,
        errorType: 'validation'
      })
      
      const history = notificationEngine.getHistory()
      const sentNotifications = history.filter(h => h.status === 'sent')
      
      expect(sentNotifications).toHaveLength(1)
    })

    test('重要度条件が正しく評価されること', async () => {
      const rule: NotificationRule = {
        ...mockNotificationRule,
        id: 'severity-test',
        conditions: {
          severityLevels: ['high', 'critical']
        }
      }
      
      notificationEngine.addRule(rule)
      
      // マッチするケース
      await notificationEngine.processErrorNotification({
        ...mockNotificationContext,
        severity: 'high'
      })
      
      // マッチしないケース
      await notificationEngine.processErrorNotification({
        ...mockNotificationContext,
        severity: 'low'
      })
      
      const history = notificationEngine.getHistory()
      const sentNotifications = history.filter(h => h.status === 'sent')
      
      expect(sentNotifications).toHaveLength(1)
    })

    test('ユーザー影響度条件が正しく評価されること', async () => {
      const rule: NotificationRule = {
        ...mockNotificationRule,
        id: 'user-impact-test',
        conditions: {
          userImpact: {
            threshold: 50
          }
        }
      }
      
      notificationEngine.addRule(rule)
      
      // マッチするケース
      await notificationEngine.processErrorNotification({
        ...mockNotificationContext,
        userImpact: 75
      })
      
      // マッチしないケース
      await notificationEngine.processErrorNotification({
        ...mockNotificationContext,
        userImpact: 25
      })
      
      const history = notificationEngine.getHistory()
      const sentNotifications = history.filter(h => h.status === 'sent')
      
      expect(sentNotifications).toHaveLength(1)
    })
  })

  describe('統計情報', () => {
    test('基本統計が正しく計算されること', () => {
      notificationEngine.addRule(mockNotificationRule)
      
      const stats = notificationEngine.getStats()
      
      expect(stats).toHaveProperty('totalRules')
      expect(stats).toHaveProperty('activeRules')
      expect(stats).toHaveProperty('totalNotifications')
      expect(stats).toHaveProperty('successfulNotifications')
      expect(stats).toHaveProperty('failedNotifications')
      expect(stats).toHaveProperty('suppressedNotifications')
      expect(stats).toHaveProperty('rateLimitedNotifications')
      
      expect(stats.totalRules).toBe(1)
      expect(stats.activeRules).toBe(1)
    })

    test('通知後の統計が更新されること', async () => {
      // 頻度条件なしの単純なルール
      const simpleRule: NotificationRule = {
        ...mockNotificationRule,
        id: 'simple-rule',
        conditions: {
          errorTypes: ['critical'],
          severityLevels: ['critical']
          // frequency条件を削除
        }
      }

      notificationEngine.addRule(simpleRule)

      await notificationEngine.processErrorNotification(mockNotificationContext)

      const stats = notificationEngine.getStats()

      expect(stats.totalNotifications).toBe(1)
      expect(stats.successfulNotifications).toBe(1)
    })
  })

  describe('履歴管理', () => {
    test('通知履歴が正しく記録されること', async () => {
      // frequency条件のないシンプルなルールを作成
      const simpleRule: NotificationRule = {
        ...mockNotificationRule,
        id: 'simple-history-rule',
        conditions: {
          errorTypes: ['critical'],
          severityLevels: ['critical']
          // frequency条件を削除
        }
      }

      notificationEngine.addRule(simpleRule)

      await notificationEngine.processErrorNotification(mockNotificationContext)

      const history = notificationEngine.getHistory()

      expect(history).toHaveLength(1)
      expect(history[0]).toHaveProperty('id')
      expect(history[0]).toHaveProperty('timestamp')
      expect(history[0]).toHaveProperty('ruleId', 'simple-history-rule')
      expect(history[0]).toHaveProperty('errorId', 'test-error-123')
      expect(history[0]).toHaveProperty('status', 'sent')
      expect(history[0]).toHaveProperty('channel', 'slack')
      expect(history[0]).toHaveProperty('target', 'test-channel')
    })

    test('履歴のクリアができること', async () => {
      // frequency条件のないシンプルなルールを作成
      const simpleRule: NotificationRule = {
        ...mockNotificationRule,
        id: 'simple-clear-rule',
        conditions: {
          errorTypes: ['critical'],
          severityLevels: ['critical']
          // frequency条件を削除
        }
      }

      notificationEngine.addRule(simpleRule)

      await notificationEngine.processErrorNotification(mockNotificationContext)

      expect(notificationEngine.getHistory()).toHaveLength(1)

      notificationEngine.clearHistory()

      expect(notificationEngine.getHistory()).toHaveLength(0)
    })

    test('履歴の最大件数制限が機能すること', async () => {
      notificationEngine.addRule(mockNotificationRule)
      
      // 大量の通知を送信（履歴の最大件数を超える）
      const promises = []
      for (let i = 0; i < 150; i++) {
        const context = {
          ...mockNotificationContext,
          errorId: `test-error-${i}`
        }
        promises.push(notificationEngine.processErrorNotification(context))
      }
      
      await Promise.all(promises)
      
      const history = notificationEngine.getHistory()
      
      // 履歴は100件に制限されているはず
      expect(history.length).toBeLessThanOrEqual(100)
    })
  })

  describe('エラーハンドリング', () => {
    test('無効なルールの追加でエラーが発生しないこと', () => {
      expect(() => {
        notificationEngine.addRule(null as any)
      }).not.toThrow()
      
      expect(() => {
        notificationEngine.addRule(undefined as any)
      }).not.toThrow()
      
      expect(() => {
        notificationEngine.addRule({} as any)
      }).not.toThrow()
    })

    test('無効な通知コンテキストでエラーが発生しないこと', async () => {
      notificationEngine.addRule(mockNotificationRule)
      
      await expect(
        notificationEngine.processErrorNotification(null as any)
      ).resolves.not.toThrow()
      
      await expect(
        notificationEngine.processErrorNotification(undefined as any)
      ).resolves.not.toThrow()
      
      await expect(
        notificationEngine.processErrorNotification({} as any)
      ).resolves.not.toThrow()
    })

    test('通知アクション実行エラーが適切にハンドリングされること', async () => {
      // エラーを発生させるための特殊なルール（frequency条件なし）
      const errorRule: NotificationRule = {
        ...mockNotificationRule,
        id: 'error-test',
        conditions: {
          errorTypes: ['critical'],
          severityLevels: ['critical']
          // frequency条件を削除
        },
        actions: [
          {
            type: 'webhook',
            target: 'invalid-url',
            template: 'test',
            priority: 'high'
          }
        ]
      }

      notificationEngine.addRule(errorRule)

      await notificationEngine.processErrorNotification(mockNotificationContext)

      const history = notificationEngine.getHistory()

      // エラーが発生しても履歴に記録されること
      expect(history).toHaveLength(1)
      expect(history[0].status).toBe('failed')
    })
  })
})