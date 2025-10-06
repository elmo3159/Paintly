import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorResolutionDashboard } from '@/components/error-resolution-dashboard'
import '@testing-library/jest-dom'

// フェッチAPIのモック
const mockFetch = jest.fn()
global.fetch = mockFetch

// アラート・確認ダイアログのモック
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
const mockResolutionStats = {
  totalErrors: 100,
  resolvedErrors: 75,
  unresolvedErrors: 25,
  resolutionRate: 0.75,
  averageResolutionTime: 4.5, // 4.5時間
  recentResolutions: [
    {
      errorId: 'error_resolved_1',
      message: 'JavaScript null pointer exception',
      resolvedAt: '2024-01-01T15:30:00Z',
      resolvedBy: 'admin',
      resolutionTime: 120 // 2時間（分）
    },
    {
      errorId: 'error_resolved_2',
      message: 'API timeout error',
      resolvedAt: '2024-01-01T14:00:00Z',
      resolvedBy: 'developer',
      resolutionTime: 45 // 45分
    }
  ],
  pendingResolution: [
    {
      errorId: 'error_pending_1',
      message: 'Database connection timeout',
      firstOccurred: '2024-01-01T10:00:00Z',
      lastOccurred: '2024-01-01T16:00:00Z',
      occurrenceCount: 15,
      priority: 'critical' as const
    },
    {
      errorId: 'error_pending_2',
      message: 'Memory leak in image processing',
      firstOccurred: '2023-12-30T08:00:00Z',
      lastOccurred: '2024-01-01T12:00:00Z',
      occurrenceCount: 8,
      priority: 'high' as const
    },
    {
      errorId: 'error_pending_3',
      message: 'Minor UI glitch in sidebar',
      firstOccurred: '2023-12-28T14:00:00Z',
      lastOccurred: '2024-01-01T09:00:00Z',
      occurrenceCount: 3,
      priority: 'low' as const
    }
  ],
  resolutionTrends: [
    { date: '2024-01-01', resolved: 5, newErrors: 2 },
    { date: '2024-01-02', resolved: 8, newErrors: 3 },
    { date: '2024-01-03', resolved: 6, newErrors: 1 }
  ]
}

const mockResolutionNotes = [
  {
    timestamp: '2024-01-01T15:30:00Z',
    resolvedBy: 'admin',
    notes: 'Restarted database service and increased connection pool size'
  },
  {
    timestamp: '2024-01-01T16:45:00Z',
    resolvedBy: 'developer',
    notes: 'Applied patch for memory optimization'
  }
]

describe('ErrorResolutionDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // デフォルトのフェッチレスポンス
    mockFetch.mockImplementation((url: string, options?: any) => {
      const method = options?.method || 'GET'
      const urlObj = new URL(url, 'http://localhost')
      const action = urlObj.searchParams.get('action')
      
      if (url.includes('/api/error-resolution')) {
        if (method === 'GET') {
          if (action === 'get_stats') {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({
                success: true,
                stats: mockResolutionStats
              })
            })
          } else if (action === 'get_resolution_notes') {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({
                success: true,
                notes: mockResolutionNotes
              })
            })
          } else if (action === 'auto_resolve') {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({
                success: true,
                resolvedCount: 3,
                resolvedErrors: ['error_old_1', 'error_old_2', 'error_old_3']
              })
            })
          }
        } else if (method === 'POST') {
          const body = JSON.parse(options.body)
          if (body.action === 'resolve') {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({
                success: true,
                message: `${body.errorIds.length}件のエラーが解決済みにマークされました`,
                resolvedErrors: body.errorIds.map((id: string) => ({ id, resolved: true }))
              })
            })
          }
        }
      }
      
      if (url.includes('/api/error-reporting')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        })
      }
      
      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Not found' })
      })
    })
  })

  describe('レンダリングテスト', () => {
    test('コンポーネントが正常にレンダリングされること', async () => {
      render(<ErrorResolutionDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('エラー解決追跡ダッシュボード')).toBeInTheDocument()
      })
      
      expect(screen.getByText('エラーの解決状況管理と統計分析')).toBeInTheDocument()
      expect(screen.getByText('自動解決')).toBeInTheDocument()
      expect(screen.getByText('再読み込み')).toBeInTheDocument()
    })

    test('ローディング状態が表示されること', () => {
      // フェッチを遅延させる
      mockFetch.mockImplementation(() => new Promise(() => {}))
      
      render(<ErrorResolutionDashboard />)
      
      expect(screen.getByText('データを読み込み中...')).toBeInTheDocument()
    })

    test('統計情報が表示されること', async () => {
      render(<ErrorResolutionDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('75%')).toBeInTheDocument() // 解決率
        expect(screen.getByText('75 / 100 件')).toBeInTheDocument() // 解決/総数
        expect(screen.getByText('5時間')).toBeInTheDocument() // 平均解決時間（4.5時間→5時間）
        expect(screen.getByText('25')).toBeInTheDocument() // 未解決エラー
        expect(screen.getByText('75')).toBeInTheDocument() // 解決済み
      })
    })

    test('期間選択ボタンが表示されること', async () => {
      render(<ErrorResolutionDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('期間:')).toBeInTheDocument()
        expect(screen.getByText('7日間')).toBeInTheDocument()
        expect(screen.getByText('14日間')).toBeInTheDocument()
        expect(screen.getByText('30日間')).toBeInTheDocument()
      })
    })
  })

  describe('データ取得テスト', () => {
    test('初期データが取得されること', async () => {
      render(<ErrorResolutionDashboard />)
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/error-resolution?action=get_stats&days=7', {
          headers: {
            'Authorization': 'Bearer admin-token'
          }
        })
      })
    })

    test('期間変更時にデータが再取得されること', async () => {
      const user = userEvent.setup()
      render(<ErrorResolutionDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('14日間')).toBeInTheDocument()
      })
      
      // 期間を14日間に変更
      const button14Days = screen.getByText('14日間')
      await user.click(button14Days)
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/error-resolution?action=get_stats&days=14', {
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
      
      render(<ErrorResolutionDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('データの読み込みに失敗しました: Internal server error')).toBeInTheDocument()
      })
    })

    test('ネットワークエラーが処理されること', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))
      
      render(<ErrorResolutionDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('データの読み込みに失敗しました: Network error')).toBeInTheDocument()
      })
    })
  })

  describe('エラー選択機能テスト', () => {
    test('個別エラー選択が機能すること', async () => {
      const user = userEvent.setup()
      render(<ErrorResolutionDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Database connection timeout')).toBeInTheDocument()
      })
      
      // 最初のエラーを選択
      const checkboxes = screen.getAllByRole('checkbox')
      const firstErrorCheckbox = checkboxes.find(cb => 
        cb.getAttribute('aria-label')?.includes('error_pending_1')
      )
      
      if (firstErrorCheckbox) {
        await user.click(firstErrorCheckbox)
        expect(firstErrorCheckbox).toBeChecked()
      }
    })

    test('全選択機能が機能すること', async () => {
      const user = userEvent.setup()
      render(<ErrorResolutionDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('全選択')).toBeInTheDocument()
      })
      
      const selectAllButton = screen.getByLabelText('全選択')
      await user.click(selectAllButton)
      
      // 全選択後は解除ラベルに変わる
      await waitFor(() => {
        expect(screen.getByLabelText('全選択を解除')).toBeInTheDocument()
      })
    })

    test('解決ボタンの状態が選択状況に応じて変化すること', async () => {
      const user = userEvent.setup()
      render(<ErrorResolutionDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('解決 (0)')).toBeInTheDocument()
      })
      
      // 1件選択
      const selectAllButton = screen.getByLabelText('全選択')
      await user.click(selectAllButton)
      
      await waitFor(() => {
        expect(screen.getByText('解決 (3)')).toBeInTheDocument()
      })
    })
  })

  describe('エラー解決機能テスト', () => {
    test('エラー解決ダイアログが開くこと', async () => {
      const user = userEvent.setup()
      render(<ErrorResolutionDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('全選択')).toBeInTheDocument()
      })
      
      // エラーを選択
      const selectAllButton = screen.getByLabelText('全選択')
      await user.click(selectAllButton)
      
      // 解決ボタンをクリック
      const resolveButton = screen.getByText('解決 (3)')
      await user.click(resolveButton)
      
      await waitFor(() => {
        expect(screen.getByText('エラー解決の確認')).toBeInTheDocument()
        expect(screen.getByText('3件のエラーを解決済みにマークします。')).toBeInTheDocument()
      })
    })

    test('解決ノート付きでエラーを解決できること', async () => {
      const user = userEvent.setup()
      render(<ErrorResolutionDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('全選択')).toBeInTheDocument()
      })
      
      // エラーを選択
      const selectAllButton = screen.getByLabelText('全選択')
      await user.click(selectAllButton)
      
      // 解決ダイアログを開く
      const resolveButton = screen.getByText('解決 (3)')
      await user.click(resolveButton)
      
      await waitFor(() => {
        expect(screen.getByText('解決ノート（任意）')).toBeInTheDocument()
      })
      
      // 解決ノートを入力
      const notesTextarea = screen.getByPlaceholderText('解決方法や原因について記録してください...')
      await user.type(notesTextarea, 'Database configuration was updated and connection pool increased.')
      
      // 解決を実行
      const confirmButton = screen.getByText('解決済みにマーク')
      await user.click(confirmButton)
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/error-resolution', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer admin-token'
          },
          body: JSON.stringify({
            action: 'resolve',
            errorIds: ['error_pending_1', 'error_pending_2', 'error_pending_3'],
            resolutionNotes: 'Database configuration was updated and connection pool increased.',
            resolvedBy: 'Admin'
          })
        })
      })
      
      expect(mockAlert).toHaveBeenCalledWith('3件のエラーが解決済みにマークされました')
    })

    test('エラー未選択時に警告が表示されること', async () => {
      const user = userEvent.setup()
      render(<ErrorResolutionDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('解決 (0)')).toBeInTheDocument()
      })
      
      // エラー未選択で解決ボタンをクリック（無効化されているはず）
      const resolveButton = screen.getByText('解決 (0)')
      expect(resolveButton).toBeDisabled()
    })
  })

  describe('自動解決機能テスト', () => {
    test('自動解決が実行されること', async () => {
      mockConfirm.mockReturnValue(true)
      const user = userEvent.setup()
      render(<ErrorResolutionDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('自動解決')).toBeInTheDocument()
      })
      
      const autoResolveButton = screen.getByLabelText('自動解決を実行')
      await user.click(autoResolveButton)
      
      expect(mockConfirm).toHaveBeenCalledWith('自動解決処理を実行しますか？一定期間発生していないエラーが自動的に解決済みにマークされます。')
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/error-resolution?action=auto_resolve&days=7', {
          headers: {
            'Authorization': 'Bearer admin-token'
          }
        })
      })
      
      expect(mockAlert).toHaveBeenCalledWith('自動解決処理が完了しました。3件のエラーが自動解決されました。')
    })

    test('自動解決確認でキャンセルした場合実行されないこと', async () => {
      mockConfirm.mockReturnValue(false)
      const user = userEvent.setup()
      render(<ErrorResolutionDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('自動解決')).toBeInTheDocument()
      })
      
      const autoResolveButton = screen.getByLabelText('自動解決を実行')
      await user.click(autoResolveButton)
      
      expect(mockConfirm).toHaveBeenCalled()
      expect(mockFetch).not.toHaveBeenCalledWith(
        expect.stringContaining('auto_resolve'),
        expect.any(Object)
      )
    })
  })

  describe('解決ノート機能テスト', () => {
    test('解決ノートダイアログが開くこと', async () => {
      const user = userEvent.setup()
      render(<ErrorResolutionDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Database connection timeout')).toBeInTheDocument()
      })
      
      // 解決ノートボタンをクリック
      const noteButtons = screen.getAllByLabelText('解決ノートを表示')
      await user.click(noteButtons[0])
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/error-resolution?action=get_resolution_notes&errorId=error_pending_1', {
          headers: {
            'Authorization': 'Bearer admin-token'
          }
        })
      })
      
      await waitFor(() => {
        expect(screen.getByText('解決ノート')).toBeInTheDocument()
        expect(screen.getByText('エラー ID: error_pending_1')).toBeInTheDocument()
      })
    })

    test('解決ノートが表示されること', async () => {
      const user = userEvent.setup()
      render(<ErrorResolutionDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Database connection timeout')).toBeInTheDocument()
      })
      
      const noteButtons = screen.getAllByLabelText('解決ノートを表示')
      await user.click(noteButtons[0])
      
      await waitFor(() => {
        expect(screen.getByText('admin')).toBeInTheDocument()
        expect(screen.getByText('Restarted database service and increased connection pool size')).toBeInTheDocument()
        expect(screen.getByText('developer')).toBeInTheDocument()
        expect(screen.getByText('Applied patch for memory optimization')).toBeInTheDocument()
      })
    })
  })

  describe('タブ機能テスト', () => {
    test('未解決エラータブが表示されること', async () => {
      render(<ErrorResolutionDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('未解決エラー (25)')).toBeInTheDocument()
        expect(screen.getByText('Database connection timeout')).toBeInTheDocument()
        expect(screen.getByText('Memory leak in image processing')).toBeInTheDocument()
        expect(screen.getByText('Minor UI glitch in sidebar')).toBeInTheDocument()
      })
    })

    test('最近の解決タブに切り替えできること', async () => {
      const user = userEvent.setup()
      render(<ErrorResolutionDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('最近の解決 (2)')).toBeInTheDocument()
      })
      
      const resolvedTab = screen.getByText('最近の解決 (2)')
      await user.click(resolvedTab)
      
      await waitFor(() => {
        expect(screen.getByText('最近解決されたエラー')).toBeInTheDocument()
        expect(screen.getByText('JavaScript null pointer exception')).toBeInTheDocument()
        expect(screen.getByText('API timeout error')).toBeInTheDocument()
      })
    })

    test('解決トレンドタブが表示されること', async () => {
      const user = userEvent.setup()
      render(<ErrorResolutionDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('解決トレンド')).toBeInTheDocument()
      })
      
      const trendsTab = screen.getByText('解決トレンド')
      await user.click(trendsTab)
      
      await waitFor(() => {
        expect(screen.getByText('解決トレンド分析')).toBeInTheDocument()
        expect(screen.getByText('解決トレンドの詳細分析機能は今後実装予定です。')).toBeInTheDocument()
      })
    })

    test('未解決エラーが0件の場合の空状態表示', async () => {
      mockFetch.mockImplementation(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            stats: {
              ...mockResolutionStats,
              unresolvedErrors: 0,
              pendingResolution: []
            }
          })
        })
      )
      
      render(<ErrorResolutionDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('未解決エラーなし')).toBeInTheDocument()
        expect(screen.getByText('すべてのエラーが解決済みです！素晴らしい状況です。')).toBeInTheDocument()
      })
    })
  })

  describe('エラーハンドリングテスト', () => {
    test('エラー解決APIエラーが処理されること', async () => {
      mockFetch.mockImplementation((url: string, options?: any) => {
        if (options?.method === 'POST') {
          return Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ error: 'Resolution failed' })
          })
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            stats: mockResolutionStats
          })
        })
      })
      
      const user = userEvent.setup()
      render(<ErrorResolutionDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('全選択')).toBeInTheDocument()
      })
      
      // エラーを選択して解決を試行
      const selectAllButton = screen.getByLabelText('全選択')
      await user.click(selectAllButton)
      
      const resolveButton = screen.getByText('解決 (3)')
      await user.click(resolveButton)
      
      await waitFor(() => {
        expect(screen.getByText('解決済みにマーク')).toBeInTheDocument()
      })
      
      const confirmButton = screen.getByText('解決済みにマーク')
      await user.click(confirmButton)
      
      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('エラーの解決処理に失敗しました: Resolution failed')
      })
    })

    test('自動解決APIエラーが処理されること', async () => {
      mockConfirm.mockReturnValue(true)
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('auto_resolve')) {
          return Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ error: 'Auto resolution failed' })
          })
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            stats: mockResolutionStats
          })
        })
      })
      
      const user = userEvent.setup()
      render(<ErrorResolutionDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('自動解決')).toBeInTheDocument()
      })
      
      const autoResolveButton = screen.getByLabelText('自動解決を実行')
      await user.click(autoResolveButton)
      
      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('自動解決処理に失敗しました: Auto resolution failed')
      })
    })

    test('解決ノート取得エラーが処理されること', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('get_resolution_notes')) {
          return Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ error: 'Notes not found' })
          })
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            stats: mockResolutionStats
          })
        })
      })
      
      const user = userEvent.setup()
      render(<ErrorResolutionDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Database connection timeout')).toBeInTheDocument()
      })
      
      const noteButtons = screen.getAllByLabelText('解決ノートを表示')
      await user.click(noteButtons[0])
      
      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('解決ノートの読み込みに失敗しました: Notes not found')
      })
    })
  })

  describe('時間フォーマットテスト', () => {
    test('時間が正しくフォーマットされること', async () => {
      render(<ErrorResolutionDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('5時間')).toBeInTheDocument() // 4.5時間 → 5時間
      })
    })

    test('最近の解決で解決時間が表示されること', async () => {
      const user = userEvent.setup()
      render(<ErrorResolutionDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('最近の解決 (2)')).toBeInTheDocument()
      })
      
      const resolvedTab = screen.getByText('最近の解決 (2)')
      await user.click(resolvedTab)
      
      await waitFor(() => {
        expect(screen.getByText('解決時間: 120分')).toBeInTheDocument()
        expect(screen.getByText('解決時間: 45分')).toBeInTheDocument()
      })
    })
  })

  describe('優先度表示テスト', () => {
    test('優先度バッジが正しく表示されること', async () => {
      render(<ErrorResolutionDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('critical')).toBeInTheDocument()
        expect(screen.getByText('high')).toBeInTheDocument()
        expect(screen.getByText('low')).toBeInTheDocument()
      })
    })
  })

  describe('アクセシビリティテスト', () => {
    test('適切なARIA属性が設定されていること', async () => {
      render(<ErrorResolutionDashboard />)
      
      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument()
      })
      
      expect(screen.getByLabelText('自動解決を実行')).toBeInTheDocument()
      expect(screen.getByLabelText('データを再読み込み')).toBeInTheDocument()
      expect(screen.getByRole('group', { name: '期間選択' })).toBeInTheDocument()
    })

    test('期間ボタンに適切なaria-pressed属性が設定されていること', async () => {
      render(<ErrorResolutionDashboard />)
      
      await waitFor(() => {
        const sevenDaysButton = screen.getByText('7日間')
        const fourteenDaysButton = screen.getByText('14日間')
        const thirtyDaysButton = screen.getByText('30日間')
        
        expect(sevenDaysButton).toHaveAttribute('aria-pressed', 'true')
        expect(fourteenDaysButton).toHaveAttribute('aria-pressed', 'false')
        expect(thirtyDaysButton).toHaveAttribute('aria-pressed', 'false')
      })
    })

    test('チェックボックスに適切なラベルが設定されていること', async () => {
      render(<ErrorResolutionDashboard />)
      
      await waitFor(() => {
        expect(screen.getByLabelText('エラー error_pending_1 を選択')).toBeInTheDocument()
        expect(screen.getByLabelText('エラー error_pending_2 を選択')).toBeInTheDocument()
        expect(screen.getByLabelText('エラー error_pending_3 を選択')).toBeInTheDocument()
      })
    })

    test('解決ボタンに動的ラベルが設定されていること', async () => {
      const user = userEvent.setup()
      render(<ErrorResolutionDashboard />)
      
      await waitFor(() => {
        expect(screen.getByLabelText('選択した0件のエラーを解決')).toBeInTheDocument()
      })
      
      // 全選択後
      const selectAllButton = screen.getByLabelText('全選択')
      await user.click(selectAllButton)
      
      await waitFor(() => {
        expect(screen.getByLabelText('選択した3件のエラーを解決')).toBeInTheDocument()
      })
    })
  })

  describe('パフォーマンステスト', () => {
    test('大量のエラーでもパフォーマンスが保たれること', async () => {
      const largeErrorSet = Array.from({ length: 100 }, (_, i) => ({
        errorId: `error_${i}`,
        message: `Error message ${i}`,
        firstOccurred: new Date(Date.now() - i * 60000).toISOString(),
        lastOccurred: new Date().toISOString(),
        occurrenceCount: i + 1,
        priority: ['low', 'medium', 'high', 'critical'][i % 4] as any
      }))
      
      mockFetch.mockImplementation(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            stats: {
              ...mockResolutionStats,
              unresolvedErrors: largeErrorSet.length,
              pendingResolution: largeErrorSet
            }
          })
        })
      )
      
      const startTime = performance.now()
      render(<ErrorResolutionDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Error message 0')).toBeInTheDocument()
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
      
      render(<ErrorResolutionDashboard />)
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/error-reporting', 
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: expect.stringContaining('"component":"ErrorResolutionDashboard"')
          })
        )
      })
    })
  })
})