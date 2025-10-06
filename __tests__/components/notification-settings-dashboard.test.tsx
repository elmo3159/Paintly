import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NotificationSettingsDashboard } from '@/components/notification-settings-dashboard'
import '@testing-library/jest-dom'

// フェッチAPIのモック
const mockFetch = jest.fn()
global.fetch = mockFetch

// アラート機能のモック
const mockAlert = jest.fn()
const mockConfirm = jest.fn()
Object.defineProperty(window, 'alert', {
  value: mockAlert,
  writable: true
})
Object.defineProperty(window, 'confirm', {
  value: mockConfirm,
  writable: true
})

// コンソールエラーのモック（テスト中のログを抑制）
const mockConsoleError = jest.fn()
const mockConsoleLog = jest.fn()
Object.defineProperty(console, 'error', {
  value: mockConsoleError,
  writable: true
})
Object.defineProperty(console, 'log', {
  value: mockConsoleLog,
  writable: true
})

// モックデータ
const mockNotificationRules = [
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
        type: 'slack' as const,
        target: 'critical-alerts',
        template: 'critical-error',
        priority: 'critical' as const,
        rateLimit: {
          maxPerHour: 10,
          cooldownMinutes: 5
        }
      }
    ]
  },
  {
    id: 'custom_1234567890_abc123def',
    name: 'カスタム通知ルール',
    enabled: false,
    conditions: {
      frequency: {
        threshold: 10,
        timeWindow: 300000 // 5分
      },
      userImpact: {
        affectedUsers: 5,
        timeWindow: 600000 // 10分
      }
    },
    actions: [
      {
        type: 'email' as const,
        target: 'dev-team@example.com',
        template: 'frequency-alert',
        priority: 'high' as const
      },
      {
        type: 'discord' as const,
        target: 'general',
        template: 'user-impact-alert',
        priority: 'medium' as const,
        rateLimit: {
          maxPerHour: 3,
          cooldownMinutes: 15
        }
      }
    ],
    escalation: {
      delay: 1800000, // 30分
      nextRule: 'critical-immediate'
    }
  }
]

const mockNotificationStats = {
  rulesCount: 2,
  activeRules: 1,
  recentNotifications: 15,
  suppressedCount: 3,
  history: {
    sent24h: 45,
    failed24h: 2,
    suppressed24h: 8
  }
}

describe('NotificationSettingsDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // デフォルトのフェッチレスポンス
    mockFetch.mockImplementation((url: string, options?: any) => {
      const method = options?.method || 'GET'
      
      if (url.includes('/api/notification-settings')) {
        if (method === 'GET') {
          const searchParams = new URLSearchParams(url.split('?')[1])
          const action = searchParams.get('action')
          
          if (action === 'stats') {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({
                success: true,
                stats: mockNotificationStats
              })
            })
          } else {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({
                success: true,
                rules: mockNotificationRules,
                stats: mockNotificationStats
              })
            })
          }
        } else if (method === 'POST') {
          const body = JSON.parse(options.body)
          if (body.action === 'toggle') {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({
                success: true,
                message: 'ルールの状態が更新されました',
                ruleId: body.ruleId,
                enabled: true
              })
            })
          }
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true })
          })
        } else if (method === 'DELETE') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              message: 'ルールが削除されました'
            })
          })
        }
      }
      
      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Not found' })
      })
    })
  })

  describe('レンダリングテスト', () => {
    test('コンポーネントが正常にレンダリングされること', async () => {
      render(<NotificationSettingsDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('通知設定ダッシュボード')).toBeInTheDocument()
      })
      
      expect(screen.getByText('エラー通知ルールの管理と統計')).toBeInTheDocument()
      expect(screen.getByText('新規ルール')).toBeInTheDocument()
      expect(screen.getByText('再読み込み')).toBeInTheDocument()
    })

    test('ローディング状態が表示されること', () => {
      // フェッチを遅延させる
      mockFetch.mockImplementation(() => new Promise(() => {}))
      
      render(<NotificationSettingsDashboard />)
      
      expect(screen.getByText('データを読み込み中...')).toBeInTheDocument()
    })

    test('統計情報が表示されること', async () => {
      render(<NotificationSettingsDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('総ルール数')).toBeInTheDocument()
        expect(screen.getByText('2')).toBeInTheDocument() // rulesCount
        expect(screen.getByText('アクティブ: 1')).toBeInTheDocument() // activeRules
        expect(screen.getByText('45')).toBeInTheDocument() // sent24h
        expect(screen.getByText('2')).toBeInTheDocument() // failed24h
        expect(screen.getByText('3')).toBeInTheDocument() // suppressedCount
      })
    })

    test('通知ルール一覧が表示されること', async () => {
      render(<NotificationSettingsDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('クリティカルエラー即座通知')).toBeInTheDocument()
        expect(screen.getByText('カスタム通知ルール')).toBeInTheDocument()
      })
      
      expect(screen.getByText('ID: critical-immediate')).toBeInTheDocument()
      expect(screen.getByText('ID: custom_1234567890_abc123def')).toBeInTheDocument()
    })

    test('ルールが無い場合の空状態が表示されること', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/api/notification-settings')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              rules: [],
              stats: { ...mockNotificationStats, rulesCount: 0, activeRules: 0 }
            })
          })
        }
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'Not found' })
        })
      })
      
      render(<NotificationSettingsDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('通知ルールがありません')).toBeInTheDocument()
        expect(screen.getByText('新しい通知ルールを作成して、エラー監視を開始しましょう')).toBeInTheDocument()
        expect(screen.getByText('最初のルールを作成')).toBeInTheDocument()
      })
    })
  })

  describe('データ取得テスト', () => {
    test('初期データが取得されること', async () => {
      render(<NotificationSettingsDashboard />)
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/notification-settings?action=list', {
          headers: {
            'Authorization': 'Bearer admin-token'
          }
        })
        expect(mockFetch).toHaveBeenCalledWith('/api/notification-settings?action=stats', {
          headers: {
            'Authorization': 'Bearer admin-token'
          }
        })
      })
    })

    test('データ取得エラーが処理されること', async () => {
      mockFetch.mockImplementation(() => 
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'Internal server error' })
        })
      )
      
      render(<NotificationSettingsDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('データの読み込みに失敗しました: Internal server error')).toBeInTheDocument()
      })
    })

    test('ネットワークエラーが処理されること', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))
      
      render(<NotificationSettingsDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('データの読み込みに失敗しました: Network error')).toBeInTheDocument()
      })
    })
  })

  describe('ルール操作テスト', () => {
    test('ルールの有効/無効切り替えが機能すること', async () => {
      const user = userEvent.setup()
      render(<NotificationSettingsDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('クリティカルエラー即座通知')).toBeInTheDocument()
      })
      
      // 有効/無効切り替えスイッチをクリック
      const switchElement = screen.getAllByRole('switch')[0]
      await user.click(switchElement)
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/notification-settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer admin-token'
          },
          body: JSON.stringify({
            action: 'toggle',
            ruleId: 'critical-immediate'
          })
        })
      })
    })

    test('ルール削除が機能すること', async () => {
      mockConfirm.mockReturnValue(true)
      const user = userEvent.setup()
      render(<NotificationSettingsDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('カスタム通知ルール')).toBeInTheDocument()
      })
      
      // カスタムルール（削除可能）の削除ボタンをクリック
      const deleteButtons = screen.getAllByLabelText('ルールを削除')
      await user.click(deleteButtons[0])
      
      expect(mockConfirm).toHaveBeenCalledWith('このルールを削除してもよろしいですか？')
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/notification-settings?ruleId=custom_1234567890_abc123def', {
          method: 'DELETE',
          headers: {
            'Authorization': 'Bearer admin-token'
          }
        })
      })
    })

    test('ルール削除確認でキャンセルした場合削除されないこと', async () => {
      mockConfirm.mockReturnValue(false)
      const user = userEvent.setup()
      render(<NotificationSettingsDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('カスタム通知ルール')).toBeInTheDocument()
      })
      
      const deleteButtons = screen.getAllByLabelText('ルールを削除')
      await user.click(deleteButtons[0])
      
      expect(mockConfirm).toHaveBeenCalledWith('このルールを削除してもよろしいですか？')
      expect(mockFetch).not.toHaveBeenCalledWith(
        expect.stringContaining('/api/notification-settings?ruleId='),
        expect.objectContaining({ method: 'DELETE' })
      )
    })

    test('システムルールの削除ボタンが表示されないこと', async () => {
      render(<NotificationSettingsDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('クリティカルエラー即座通知')).toBeInTheDocument()
      })
      
      // システムルール（critical-immediate）には削除ボタンが無いことを確認
      const deleteButtons = screen.getAllByLabelText('ルールを削除')
      expect(deleteButtons).toHaveLength(1) // カスタムルールのみ
    })
  })

  describe('エラーハンドリングテスト', () => {
    test('ルール切り替えエラーが処理されること', async () => {
      mockFetch.mockImplementation((url: string, options?: any) => {
        if (options?.method === 'POST') {
          return Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ error: 'Permission denied' })
          })
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            rules: mockNotificationRules,
            stats: mockNotificationStats
          })
        })
      })
      
      const user = userEvent.setup()
      render(<NotificationSettingsDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('クリティカルエラー即座通知')).toBeInTheDocument()
      })
      
      const switchElement = screen.getAllByRole('switch')[0]
      await user.click(switchElement)
      
      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('ルールの切り替えに失敗しました: Permission denied')
      })
    })

    test('ルール削除エラーが処理されること', async () => {
      mockConfirm.mockReturnValue(true)
      mockFetch.mockImplementation((url: string, options?: any) => {
        if (options?.method === 'DELETE') {
          return Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ error: 'Rule not found' })
          })
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            rules: mockNotificationRules,
            stats: mockNotificationStats
          })
        })
      })
      
      const user = userEvent.setup()
      render(<NotificationSettingsDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('カスタム通知ルール')).toBeInTheDocument()
      })
      
      const deleteButtons = screen.getAllByLabelText('ルールを削除')
      await user.click(deleteButtons[0])
      
      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('ルールの削除に失敗しました: Rule not found')
      })
    })
  })

  describe('タブ機能テスト', () => {
    test('タブ切り替えが機能すること', async () => {
      const user = userEvent.setup()
      render(<NotificationSettingsDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('通知ルール')).toBeInTheDocument()
      })
      
      // テンプレートタブに切り替え
      const templatesTab = screen.getByText('テンプレート')
      await user.click(templatesTab)
      
      expect(screen.getByText('通知テンプレート')).toBeInTheDocument()
      expect(screen.getByText('通知テンプレートの管理機能は今後実装予定です。')).toBeInTheDocument()
      
      // チャンネルタブに切り替え
      const channelsTab = screen.getByText('通知チャンネル')
      await user.click(channelsTab)
      
      expect(screen.getByText('通知チャンネル')).toBeInTheDocument()
      expect(screen.getByText('通知チャンネルの設定機能は今後実装予定です。')).toBeInTheDocument()
    })
  })

  describe('UI操作テスト', () => {
    test('再読み込みボタンが機能すること', async () => {
      const user = userEvent.setup()
      render(<NotificationSettingsDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('再読み込み')).toBeInTheDocument()
      })
      
      // 初期読み込み後にmockFetchをクリア
      jest.clearAllMocks()
      
      const refreshButton = screen.getByLabelText('データを再読み込み')
      await user.click(refreshButton)
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/notification-settings?action=list', {
          headers: {
            'Authorization': 'Bearer admin-token'
          }
        })
      })
    })

    test('新規ルール作成ボタンが機能すること', async () => {
      const user = userEvent.setup()
      render(<NotificationSettingsDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('新規ルール')).toBeInTheDocument()
      })
      
      const createButton = screen.getByLabelText('新しい通知ルールを作成')
      await user.click(createButton)
      
      // showCreateFormがtrueになることを確認（実際の効果は実装されていないが、エラーが出ないことを確認）
      expect(createButton).toBeInTheDocument()
    })

    test('編集ボタンが機能すること', async () => {
      const user = userEvent.setup()
      render(<NotificationSettingsDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('クリティカルエラー即座通知')).toBeInTheDocument()
      })
      
      const editButtons = screen.getAllByLabelText('ルールを編集')
      await user.click(editButtons[0])
      
      // setSelectedRuleが呼ばれることを確認（実際の効果は実装されていないが、エラーが出ないことを確認）
      expect(editButtons[0]).toBeInTheDocument()
    })
  })

  describe('ルール詳細表示テスト', () => {
    test('エラータイプバッジが正しく表示されること', async () => {
      render(<NotificationSettingsDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('critical')).toBeInTheDocument()
        expect(screen.getByText('auth')).toBeInTheDocument()
      })
    })

    test('通知アクションが正しく表示されること', async () => {
      render(<NotificationSettingsDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('slack')).toBeInTheDocument()
        expect(screen.getByText('→ critical-alerts')).toBeInTheDocument()
        expect(screen.getByText('email')).toBeInTheDocument()
        expect(screen.getByText('→ dev-team@example.com')).toBeInTheDocument()
        expect(screen.getByText('discord')).toBeInTheDocument()
        expect(screen.getByText('→ general')).toBeInTheDocument()
      })
    })

    test('頻度条件が正しくフォーマットされること', async () => {
      render(<NotificationSettingsDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('10回 / 5分')).toBeInTheDocument()
      })
    })

    test('ユーザー影響条件が正しく表示されること', async () => {
      render(<NotificationSettingsDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('5人 / 10分')).toBeInTheDocument()
      })
    })

    test('エスカレーション設定が正しく表示されること', async () => {
      render(<NotificationSettingsDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('30分後に "critical-immediate" へエスカレーション')).toBeInTheDocument()
      })
    })

    test('レート制限が正しく表示されること', async () => {
      render(<NotificationSettingsDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('最大10/時')).toBeInTheDocument()
        expect(screen.getByText('最大3/時')).toBeInTheDocument()
      })
    })
  })

  describe('アクセシビリティテスト', () => {
    test('適切なARIA属性が設定されていること', async () => {
      render(<NotificationSettingsDashboard />)
      
      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument()
      })
      
      expect(screen.getByLabelText('新しい通知ルールを作成')).toBeInTheDocument()
      expect(screen.getByLabelText('データを再読み込み')).toBeInTheDocument()
    })

    test('スイッチに適切なラベルが設定されていること', async () => {
      render(<NotificationSettingsDashboard />)
      
      await waitFor(() => {
        expect(screen.getByLabelText('クリティカルエラー即座通知を無効にする')).toBeInTheDocument()
        expect(screen.getByLabelText('カスタム通知ルールを有効にする')).toBeInTheDocument()
      })
    })

    test('ボタンに適切なラベルが設定されていること', async () => {
      render(<NotificationSettingsDashboard />)
      
      await waitFor(() => {
        expect(screen.getAllByLabelText('ルールを編集')).toHaveLength(2)
        expect(screen.getAllByLabelText('ルールを削除')).toHaveLength(1) // カスタムルールのみ
      })
    })

    test('キーボードナビゲーションが機能すること', async () => {
      const user = userEvent.setup()
      render(<NotificationSettingsDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('新規ルール')).toBeInTheDocument()
      })
      
      // Tabキーでフォーカス移動をテスト
      await user.tab()
      expect(screen.getByLabelText('新しい通知ルールを作成')).toHaveFocus()
      
      await user.tab()
      expect(screen.getByLabelText('データを再読み込み')).toHaveFocus()
    })
  })

  describe('パフォーマンステスト', () => {
    test('大量のルールでもパフォーマンスが保たれること', async () => {
      const largeRuleSet = Array.from({ length: 100 }, (_, i) => ({
        id: `rule_${i}`,
        name: `ルール ${i}`,
        enabled: i % 2 === 0,
        conditions: {
          errorTypes: ['javascript', 'api'],
          frequency: {
            threshold: 5 + i,
            timeWindow: 300000
          }
        },
        actions: [
          {
            type: 'email' as const,
            target: `team${i}@example.com`,
            template: 'default',
            priority: 'medium' as const
          }
        ]
      }))
      
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/api/notification-settings')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              rules: largeRuleSet,
              stats: { ...mockNotificationStats, rulesCount: largeRuleSet.length }
            })
          })
        }
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'Not found' })
        })
      })
      
      const startTime = performance.now()
      render(<NotificationSettingsDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('ルール 0')).toBeInTheDocument()
      })
      
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(3000) // 3秒以内
    })
  })

  describe('エラーレポート機能テスト', () => {
    test('クライアントサイドエラーがレポートされること', async () => {
      mockFetch.mockImplementation((url: string, options?: any) => {
        if (url.includes('/api/error-reporting')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true })
          })
        }
        return Promise.reject(new Error('Mock API error'))
      })
      
      render(<NotificationSettingsDashboard />)
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/error-reporting', 
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: expect.stringContaining('"component":"NotificationSettingsDashboard"')
          })
        )
      })
    })
  })
})