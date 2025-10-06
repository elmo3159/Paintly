import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorDashboard } from '@/components/error-dashboard'
import '@testing-library/jest-dom'

// フェッチAPIのモック
const mockFetch = jest.fn()
global.fetch = mockFetch

// ダウンロード機能のモック
const mockCreateObjectURL = jest.fn(() => 'blob:mock-url')
const mockRevokeObjectURL = jest.fn()
Object.defineProperty(URL, 'createObjectURL', {
  value: mockCreateObjectURL,
  writable: true
})
Object.defineProperty(URL, 'revokeObjectURL', {
  value: mockRevokeObjectURL,
  writable: true
})

// DOM要素のモック（ダウンロード用）
const mockDownloadLink = {
  click: jest.fn(),
  setAttribute: jest.fn(),
  style: {}
}
const mockCreateElement = jest.fn(() => mockDownloadLink)
const mockAppendChild = jest.fn()
const mockRemoveChild = jest.fn()

Object.defineProperty(document, 'createElement', {
  value: mockCreateElement,
  writable: true
})
Object.defineProperty(document.body, 'appendChild', {
  value: mockAppendChild,
  writable: true
})
Object.defineProperty(document.body, 'removeChild', {
  value: mockRemoveChild,
  writable: true
})

// アラート機能のモック
const mockAlert = jest.fn()
Object.defineProperty(window, 'alert', {
  value: mockAlert,
  writable: true
})

// モックデータ
const mockErrorStats = {
  totalErrors: 150,
  resolvedErrors: 120,
  pendingErrors: 30,
  criticalErrors: 5,
  errorsByType: {
    javascript: 80,
    api: 45,
    auth: 15,
    database: 10
  },
  errorsTrend: [
    { date: '2024-01-01', count: 20 },
    { date: '2024-01-02', count: 25 },
    { date: '2024-01-03', count: 15 }
  ],
  resolutionRate: 80
}

const mockErrorLogs = [
  {
    id: 'error_1',
    timestamp: '2024-01-01T10:00:00Z',
    message: 'JavaScript error in component',
    type: 'javascript',
    severity: 'high',
    component: 'UserDashboard',
    user_id: 'user_123',
    session_id: 'session_456',
    resolved: false,
    resolution_notes: null,
    created_at: '2024-01-01T10:00:00Z'
  },
  {
    id: 'error_2',
    timestamp: '2024-01-01T11:00:00Z',
    message: 'API timeout error',
    type: 'api',
    severity: 'critical',
    component: 'DataService',
    user_id: 'user_789',
    session_id: 'session_012',
    resolved: true,
    resolution_notes: 'Increased timeout limit',
    created_at: '2024-01-01T11:00:00Z'
  }
]

describe('ErrorDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // デフォルトのフェッチレスポンス
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/error-stats')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            stats: mockErrorStats
          })
        })
      } else if (url.includes('/api/error-logs')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            logs: mockErrorLogs,
            total: mockErrorLogs.length
          })
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
      render(<ErrorDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('エラー監視ダッシュボード')).toBeInTheDocument()
      })
      
      expect(screen.getByText('統計情報')).toBeInTheDocument()
      expect(screen.getByText('エラーログ')).toBeInTheDocument()
    })

    test('ローディング状態が表示されること', () => {
      // フェッチを遅延させる
      mockFetch.mockImplementation(() => new Promise(() => {}))
      
      render(<ErrorDashboard />)
      
      expect(screen.getByText('データを読み込んでいます...')).toBeInTheDocument()
    })

    test('エラー統計が表示されること', async () => {
      render(<ErrorDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('150')).toBeInTheDocument() // totalErrors
        expect(screen.getByText('120')).toBeInTheDocument() // resolvedErrors
        expect(screen.getByText('30')).toBeInTheDocument() // pendingErrors
        expect(screen.getByText('5')).toBeInTheDocument() // criticalErrors
      })
    })

    test('エラーログテーブルが表示されること', async () => {
      render(<ErrorDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('JavaScript error in component')).toBeInTheDocument()
        expect(screen.getByText('API timeout error')).toBeInTheDocument()
      })
    })
  })

  describe('データ取得テスト', () => {
    test('初期データが取得されること', async () => {
      render(<ErrorDashboard />)
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/error-stats')
        expect(mockFetch).toHaveBeenCalledWith('/api/error-logs?page=1&limit=50')
      })
    })

    test('統計データ取得エラーが処理されること', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/api/error-stats')) {
          return Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ error: 'Internal server error' })
          })
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            logs: [],
            total: 0
          })
        })
      })
      
      render(<ErrorDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('統計データの取得に失敗しました')).toBeInTheDocument()
      })
    })

    test('ログデータ取得エラーが処理されること', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/api/error-logs')) {
          return Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ error: 'Database error' })
          })
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            stats: mockErrorStats
          })
        })
      })
      
      render(<ErrorDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('エラーログの取得に失敗しました')).toBeInTheDocument()
      })
    })

    test('ネットワークエラーが処理されること', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))
      
      render(<ErrorDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('統計データの取得に失敗しました')).toBeInTheDocument()
        expect(screen.getByText('エラーログの取得に失敗しました')).toBeInTheDocument()
      })
    })
  })

  describe('フィルタリングテスト', () => {
    test('タイプフィルターが機能すること', async () => {
      const user = userEvent.setup()
      render(<ErrorDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('JavaScript error in component')).toBeInTheDocument()
      })
      
      const typeFilter = screen.getByDisplayValue('全て')
      await user.selectOptions(typeFilter, 'javascript')
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/error-logs?page=1&limit=50&type=javascript')
      })
    })

    test('重要度フィルターが機能すること', async () => {
      const user = userEvent.setup()
      render(<ErrorDashboard />)
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('全て')).toBeInTheDocument()
      })
      
      const severityFilters = screen.getAllByDisplayValue('全て')
      const severityFilter = severityFilters[1] // 2番目のセレクトが重要度フィルター
      await user.selectOptions(severityFilter, 'critical')
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/error-logs?page=1&limit=50&severity=critical')
      })
    })

    test('解決状態フィルターが機能すること', async () => {
      const user = userEvent.setup()
      render(<ErrorDashboard />)
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('全て')).toBeInTheDocument()
      })
      
      const resolvedFilters = screen.getAllByDisplayValue('全て')
      const resolvedFilter = resolvedFilters[2] // 3番目のセレクトが解決状態フィルター
      await user.selectOptions(resolvedFilter, 'true')
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/error-logs?page=1&limit=50&resolved=true')
      })
    })

    test('日付範囲フィルターが機能すること', async () => {
      const user = userEvent.setup()
      render(<ErrorDashboard />)
      
      await waitFor(() => {
        expect(screen.getByLabelText('開始日')).toBeInTheDocument()
      })
      
      const startDateInput = screen.getByLabelText('開始日')
      const endDateInput = screen.getByLabelText('終了日')
      
      await user.type(startDateInput, '2024-01-01')
      await user.type(endDateInput, '2024-01-31')
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/error-logs?page=1&limit=50&startDate=2024-01-01&endDate=2024-01-31')
      })
    })

    test('複数フィルターの組み合わせが機能すること', async () => {
      const user = userEvent.setup()
      render(<ErrorDashboard />)
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('全て')).toBeInTheDocument()
      })
      
      const typeFilter = screen.getByDisplayValue('全て')
      await user.selectOptions(typeFilter, 'api')
      
      const severityFilters = screen.getAllByDisplayValue('全て')
      const severityFilter = severityFilters[1]
      await user.selectOptions(severityFilter, 'high')
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/error-logs?page=1&limit=50&type=api&severity=high')
      })
    })
  })

  describe('ページングテスト', () => {
    test('ページング機能が動作すること', async () => {
      const user = userEvent.setup()
      render(<ErrorDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('次のページ')).toBeInTheDocument()
      })
      
      const nextButton = screen.getByText('次のページ')
      await user.click(nextButton)
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/error-logs?page=2&limit=50')
      })
    })

    test('ページサイズ変更が機能すること', async () => {
      const user = userEvent.setup()
      render(<ErrorDashboard />)
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('50')).toBeInTheDocument()
      })
      
      const pageSizeSelect = screen.getByDisplayValue('50')
      await user.selectOptions(pageSizeSelect, '100')
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/error-logs?page=1&limit=100')
      })
    })
  })

  describe('エクスポート機能テスト', () => {
    test('CSVエクスポートが機能すること', async () => {
      const user = userEvent.setup()
      render(<ErrorDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('CSVエクスポート')).toBeInTheDocument()
      })
      
      const exportButton = screen.getByText('CSVエクスポート')
      await user.click(exportButton)
      
      await waitFor(() => {
        expect(mockCreateObjectURL).toHaveBeenCalled()
        expect(mockDownloadLink.click).toHaveBeenCalled()
        expect(mockRevokeObjectURL).toHaveBeenCalled()
      })
    })

    test('エクスポートファイル名が正しく設定されること', async () => {
      const user = userEvent.setup()
      render(<ErrorDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('CSVエクスポート')).toBeInTheDocument()
      })
      
      const exportButton = screen.getByText('CSVエクスポート')
      await user.click(exportButton)
      
      await waitFor(() => {
        expect(mockDownloadLink.setAttribute).toHaveBeenCalledWith(
          'download',
          expect.stringMatching(/error-logs-\d{4}-\d{2}-\d{2}\.csv/)
        )
      })
    })

    test('エクスポートエラーが処理されること', async () => {
      mockCreateObjectURL.mockImplementation(() => {
        throw new Error('Export error')
      })
      
      const user = userEvent.setup()
      render(<ErrorDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('CSVエクスポート')).toBeInTheDocument()
      })
      
      const exportButton = screen.getByText('CSVエクスポート')
      await user.click(exportButton)
      
      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('エクスポートに失敗しました')
      })
    })
  })

  describe('リアルタイム更新テスト', () => {
    test('自動更新が機能すること', async () => {
      jest.useFakeTimers()
      
      render(<ErrorDashboard />)
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2) // 初期読み込み
      })
      
      // 30秒経過をシミュレート
      act(() => {
        jest.advanceTimersByTime(30000)
      })
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(4) // 更新リクエスト
      })
      
      jest.useRealTimers()
    })

    test('手動更新ボタンが機能すること', async () => {
      const user = userEvent.setup()
      render(<ErrorDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('更新')).toBeInTheDocument()
      })
      
      const refreshButton = screen.getByText('更新')
      await user.click(refreshButton)
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/error-stats')
        expect(mockFetch).toHaveBeenCalledWith('/api/error-logs?page=1&limit=50')
      })
    })
  })

  describe('詳細表示テスト', () => {
    test('エラー詳細モーダルが開くこと', async () => {
      const user = userEvent.setup()
      render(<ErrorDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('JavaScript error in component')).toBeInTheDocument()
      })
      
      const errorRow = screen.getByText('JavaScript error in component')
      await user.click(errorRow)
      
      await waitFor(() => {
        expect(screen.getByText('エラー詳細')).toBeInTheDocument()
        expect(screen.getByText('error_1')).toBeInTheDocument()
        expect(screen.getByText('UserDashboard')).toBeInTheDocument()
      })
    })

    test('詳細モーダルが閉じること', async () => {
      const user = userEvent.setup()
      render(<ErrorDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('JavaScript error in component')).toBeInTheDocument()
      })
      
      const errorRow = screen.getByText('JavaScript error in component')
      await user.click(errorRow)
      
      await waitFor(() => {
        expect(screen.getByText('閉じる')).toBeInTheDocument()
      })
      
      const closeButton = screen.getByText('閉じる')
      await user.click(closeButton)
      
      await waitFor(() => {
        expect(screen.queryByText('エラー詳細')).not.toBeInTheDocument()
      })
    })
  })

  describe('パフォーマンステスト', () => {
    test('大量データでもパフォーマンスが保たれること', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `error_${i}`,
        timestamp: new Date().toISOString(),
        message: `Error message ${i}`,
        type: 'javascript',
        severity: 'medium',
        component: `Component${i}`,
        user_id: `user_${i}`,
        session_id: `session_${i}`,
        resolved: false,
        resolution_notes: null,
        created_at: new Date().toISOString()
      }))
      
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/api/error-logs')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              logs: largeDataset.slice(0, 50),
              total: largeDataset.length
            })
          })
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            stats: mockErrorStats
          })
        })
      })
      
      const startTime = performance.now()
      render(<ErrorDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Error message 0')).toBeInTheDocument()
      })
      
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(3000) // 3秒以内
    })
  })

  describe('アクセシビリティテスト', () => {
    test('適切なARIA属性が設定されていること', async () => {
      render(<ErrorDashboard />)
      
      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument()
      })
      
      expect(screen.getByRole('region', { name: '統計情報' })).toBeInTheDocument()
      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'CSVエクスポート' })).toBeInTheDocument()
    })

    test('キーボードナビゲーションが機能すること', async () => {
      const user = userEvent.setup()
      render(<ErrorDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('CSVエクスポート')).toBeInTheDocument()
      })
      
      // Tabキーでフォーカス移動をテスト
      await user.tab()
      expect(screen.getByDisplayValue('全て')).toHaveFocus()
      
      await user.tab()
      const severityFilters = screen.getAllByDisplayValue('全て')
      expect(severityFilters[1]).toHaveFocus()
    })

    test('スクリーンリーダー用のラベルが適切に設定されていること', async () => {
      render(<ErrorDashboard />)
      
      await waitFor(() => {
        expect(screen.getByLabelText('エラータイプでフィルター')).toBeInTheDocument()
      })
      
      expect(screen.getByLabelText('重要度でフィルター')).toBeInTheDocument()
      expect(screen.getByLabelText('解決状態でフィルター')).toBeInTheDocument()
      expect(screen.getByLabelText('開始日')).toBeInTheDocument()
      expect(screen.getByLabelText('終了日')).toBeInTheDocument()
    })
  })

  describe('エラーハンドリングテスト', () => {
    test('予期しないAPIレスポンスが処理されること', async () => {
      mockFetch.mockImplementation(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            // 不正なレスポンス構造
            data: null,
            message: 'Unexpected response'
          })
        })
      )
      
      render(<ErrorDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('統計データの取得に失敗しました')).toBeInTheDocument()
        expect(screen.getByText('エラーログの取得に失敗しました')).toBeInTheDocument()
      })
    })

    test('無効な日付入力が処理されること', async () => {
      const user = userEvent.setup()
      render(<ErrorDashboard />)
      
      await waitFor(() => {
        expect(screen.getByLabelText('開始日')).toBeInTheDocument()
      })
      
      const startDateInput = screen.getByLabelText('開始日')
      const endDateInput = screen.getByLabelText('終了日')
      
      // 無効な日付範囲（終了日が開始日より前）
      await user.type(startDateInput, '2024-01-31')
      await user.type(endDateInput, '2024-01-01')
      
      await waitFor(() => {
        expect(screen.getByText('終了日は開始日より後の日付を選択してください')).toBeInTheDocument()
      })
    })
  })
})