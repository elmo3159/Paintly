/**
 * E2Eテスト: エラー管理システム全体フロー
 * ブラウザ環境でのユーザー操作シミュレーション
 */

import { test, expect } from '@playwright/test'

// テスト用の設定
const TEST_BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:9090'
const TEST_AUTH_TOKEN = 'test-admin-token'

test.describe('エラー管理システム E2E テスト', () => {
  test.beforeEach(async ({ page }) => {
    // ブラウザのコンソールエラーをキャプチャ
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser Console Error:', msg.text())
      }
    })

    // ネットワークエラーをキャプチャ
    page.on('requestfailed', request => {
      console.log('Network Error:', request.url(), request.failure()?.errorText)
    })

    // 認証情報を設定（本番環境では適切な認証フローを使用）
    await page.setExtraHTTPHeaders({
      'Authorization': `Bearer ${TEST_AUTH_TOKEN}`
    })
  })

  test.describe('エラー報告から表示までの完全フロー', () => {
    test('JavaScript エラーの自動報告とダッシュボード表示', async ({ page }) => {
      // 1. メインアプリケーションページに移動
      await page.goto(TEST_BASE_URL)

      // 2. 意図的にJavaScriptエラーを発生させる
      await page.evaluate(() => {
        // エラーを発生させる
        throw new Error('E2E Test Error: Intentional JavaScript error')
      })

      // 3. エラーが自動報告されるまで少し待つ
      await page.waitForTimeout(2000)

      // 4. エラーダッシュボードページに移動
      await page.goto(`${TEST_BASE_URL}/admin/error-dashboard`)

      // 5. ダッシュボードが表示されることを確認
      await expect(page.locator('h1')).toContainText('エラー統計ダッシュボード')

      // 6. 報告されたエラーがダッシュボードに表示されることを確認
      await expect(page.locator('text=E2E Test Error')).toBeVisible({ timeout: 10000 })

      // 7. エラーの詳細情報が正しく表示されることを確認
      const errorRow = page.locator('text=E2E Test Error').locator('..')
      await expect(errorRow).toContainText('Intentional JavaScript error')
      await expect(errorRow).toContainText('未解決')
    })

    test('API エラーの報告と表示', async ({ page }) => {
      // 1. アプリケーションページに移動
      await page.goto(TEST_BASE_URL)

      // 2. 存在しないAPIエンドポイントを呼び出してエラーを発生
      await page.evaluate(async () => {
        try {
          await fetch('/api/non-existent-endpoint')
        } catch (error) {
          // エラーを手動報告
          await fetch('/api/error-reporting', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: 'E2E Test API Error: Non-existent endpoint',
              stack: 'Error: 404 Not Found\n  at fetch (/api/non-existent-endpoint)',
              component: 'E2ETest',
              url: '/api/non-existent-endpoint',
              userAgent: navigator.userAgent,
              errorType: 'api'
            })
          })
        }
      })

      // 3. エラーダッシュボードで確認
      await page.goto(`${TEST_BASE_URL}/admin/error-dashboard`)
      
      // 4. APIエラーが表示されることを確認
      await expect(page.locator('text=E2E Test API Error')).toBeVisible({ timeout: 15000 })

      // 5. エラータイプがAPIとして表示されることを確認
      const apiErrorRow = page.locator('text=E2E Test API Error').locator('..')
      await expect(apiErrorRow).toContainText('api')
    })

    test('大量エラー発生時の高頻度エラー検出', async ({ page }) => {
      // 1. 複数回のエラーを連続で発生させる
      for (let i = 0; i < 12; i++) {
        await page.evaluate((index) => {
          // 同じタイプのエラーを複数回発生
          fetch('/api/error-reporting', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: `E2E Bulk Error ${index}: Repeated database timeout`,
              stack: `Error: Database timeout ${index}`,
              component: 'DatabaseAPI',
              url: '/api/database',
              userAgent: navigator.userAgent,
              errorType: 'database'
            })
          })
        }, i)
        
        // 短い間隔でエラーを発生
        await page.waitForTimeout(200)
      }

      // 2. エラーダッシュボードで確認
      await page.goto(`${TEST_BASE_URL}/admin/error-dashboard`)

      // 3. 高頻度エラーの警告が表示されることを確認
      await expect(page.locator('text=高頻度エラー検出')).toBeVisible({ timeout: 10000 })
      
      // 4. 同じエラーメッセージが複数回カウントされることを確認
      await expect(page.locator('text=E2E Bulk Error')).toBeVisible()
    })
  })

  test.describe('通知設定管理フロー', () => {
    test('新しい通知ルールの作成と動作確認', async ({ page }) => {
      // 1. 通知設定ダッシュボードに移動
      await page.goto(`${TEST_BASE_URL}/admin/notification-settings`)

      // 2. ダッシュボードが表示されることを確認
      await expect(page.locator('h1')).toContainText('通知設定ダッシュボード')

      // 3. 新しいルール作成ボタンをクリック
      await page.click('button:has-text("新しいルールを作成")')

      // 4. ルール作成フォームに入力
      await page.fill('input[placeholder*="ルール名"]', 'E2E Test Rule')
      
      // 5. 条件設定
      await page.selectOption('select[aria-label*="エラータイプ"]', 'e2e-test')
      await page.selectOption('select[aria-label*="重要度"]', 'high')

      // 6. アクション設定
      await page.selectOption('select[aria-label*="通知タイプ"]', 'slack')
      await page.fill('input[placeholder*="チャンネル"]', 'e2e-test-channel')

      // 7. ルールを保存
      await page.click('button:has-text("ルールを作成")')

      // 8. 成功メッセージが表示されることを確認
      await expect(page.locator('text=ルールが作成されました')).toBeVisible({ timeout: 5000 })

      // 9. 作成されたルールがリストに表示されることを確認
      await expect(page.locator('text=E2E Test Rule')).toBeVisible()

      // 10. ルールが有効状態であることを確認
      const ruleRow = page.locator('text=E2E Test Rule').locator('..')
      await expect(ruleRow.locator('text=有効')).toBeVisible()
    })

    test('通知ルールの有効/無効切り替え', async ({ page }) => {
      // 1. 通知設定ダッシュボードに移動
      await page.goto(`${TEST_BASE_URL}/admin/notification-settings`)

      // 2. 既存のルール（デフォルトルール）を見つける
      const criticalRuleRow = page.locator('text=クリティカルエラー即座通知').locator('..')

      // 3. 現在のステータスを確認
      const currentStatus = await criticalRuleRow.locator('[aria-label*="ステータス"]').textContent()

      // 4. 切り替えボタンをクリック
      await criticalRuleRow.locator('button:has-text("切り替え")').click()

      // 5. ステータスが変更されることを確認
      await expect(criticalRuleRow.locator('[aria-label*="ステータス"]')).not.toContainText(currentStatus!)

      // 6. 再度切り替えて元に戻す
      await criticalRuleRow.locator('button:has-text("切り替え")').click()

      // 7. 元のステータスに戻ることを確認
      await expect(criticalRuleRow.locator('[aria-label*="ステータス"]')).toContainText(currentStatus!)
    })

    test('通知統計の表示確認', async ({ page }) => {
      // 1. 通知設定ダッシュボードに移動
      await page.goto(`${TEST_BASE_URL}/admin/notification-settings`)

      // 2. 統計タブをクリック
      await page.click('button:has-text("統計")')

      // 3. 統計情報が表示されることを確認
      await expect(page.locator('text=24時間以内の通知送信数')).toBeVisible()
      await expect(page.locator('text=24時間以内の通知失敗数')).toBeVisible()
      await expect(page.locator('text=24時間以内の通知抑制数')).toBeVisible()

      // 4. 数値が表示されることを確認
      await expect(page.locator('[data-testid="sent-count"]')).toContainText(/\d+/)
      await expect(page.locator('[data-testid="failed-count"]')).toContainText(/\d+/)
      await expect(page.locator('[data-testid="suppressed-count"]')).toContainText(/\d+/)
    })
  })

  test.describe('エラー解決ワークフロー', () => {
    test('個別エラーの解決フロー', async ({ page }) => {
      // 1. まずテスト用エラーを作成
      await page.goto(TEST_BASE_URL)
      await page.evaluate(() => {
        fetch('/api/error-reporting', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: 'E2E Resolution Test Error',
            stack: 'Error: Test error for resolution\n  at test()',
            component: 'E2EResolutionTest',
            url: '/test-resolution',
            userAgent: navigator.userAgent,
            errorType: 'test'
          })
        })
      })

      // 2. エラー解決ダッシュボードに移動
      await page.goto(`${TEST_BASE_URL}/admin/error-resolution`)

      // 3. ダッシュボードが表示されることを確認
      await expect(page.locator('h1')).toContainText('エラー解決ダッシュボード')

      // 4. 作成したエラーを検索
      await page.fill('input[placeholder*="エラーを検索"]', 'E2E Resolution Test Error')
      await page.press('input[placeholder*="エラーを検索"]', 'Enter')

      // 5. エラーが表示されることを確認
      await expect(page.locator('text=E2E Resolution Test Error')).toBeVisible({ timeout: 10000 })

      // 6. エラーを選択
      const errorRow = page.locator('text=E2E Resolution Test Error').locator('..')
      await errorRow.locator('input[type="checkbox"]').check()

      // 7. 解決ボタンをクリック
      await page.click('button:has-text("選択したエラーを解決")')

      // 8. 解決理由を入力
      await page.fill('textarea[placeholder*="解決理由"]', 'E2E テストで修正確認済み。コードを修正してテストパス。')

      // 9. 解決を確定
      await page.click('button:has-text("解決を確定")')

      // 10. 成功メッセージが表示されることを確認
      await expect(page.locator('text=エラーが解決されました')).toBeVisible({ timeout: 5000 })

      // 11. エラーが解決済みステータスになることを確認
      await expect(errorRow.locator('text=解決済み')).toBeVisible()
    })

    test('一括エラー解決フロー', async ({ page }) => {
      // 1. 複数のテスト用エラーを作成
      for (let i = 0; i < 3; i++) {
        await page.evaluate((index) => {
          fetch('/api/error-reporting', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: `E2E Bulk Resolution Test ${index}`,
              stack: `Error: Bulk test error ${index}`,
              component: 'E2EBulkTest',
              url: '/bulk-test',
              userAgent: navigator.userAgent,
              errorType: 'bulk-test'
            })
          })
        }, i)
      }

      // 2. エラー解決ダッシュボードに移動
      await page.goto(`${TEST_BASE_URL}/admin/error-resolution`)

      // 3. 期間フィルターを今日に設定
      await page.selectOption('select[aria-label="期間選択"]', 'today')

      // 4. 作成したエラーを検索
      await page.fill('input[placeholder*="エラーを検索"]', 'E2E Bulk Resolution Test')
      await page.press('input[placeholder*="エラーを検索"]', 'Enter')

      // 5. 全て選択チェックボックスをクリック
      await page.click('input[aria-label="全て選択"]')

      // 6. 選択されたエラー数が表示されることを確認
      await expect(page.locator('text=3件のエラーが選択されています')).toBeVisible()

      // 7. 一括解決ボタンをクリック
      await page.click('button:has-text("選択したエラーを解決")')

      // 8. 一括解決理由を入力
      await page.fill('textarea[placeholder*="解決理由"]', 'E2E 一括テスト: 同一原因による複数エラーを一括修正')

      // 9. 一括解決を確定
      await page.click('button:has-text("解決を確定")')

      // 10. 成功メッセージが表示されることを確認
      await expect(page.locator('text=3件のエラーが解決されました')).toBeVisible({ timeout: 5000 })

      // 11. 全てのエラーが解決済みステータスになることを確認
      const resolvedErrors = page.locator('text=E2E Bulk Resolution Test').count()
      expect(await resolvedErrors).toBe(3)
    })

    test('自動解決ルールのテスト', async ({ page }) => {
      // 1. エラー解決ダッシュボードに移動
      await page.goto(`${TEST_BASE_URL}/admin/error-resolution`)

      // 2. 自動解決設定タブをクリック
      await page.click('button:has-text("自動解決設定")')

      // 3. 新しい自動解決ルールを作成
      await page.click('button:has-text("新しいルールを追加")')

      // 4. ルール設定を入力
      await page.fill('input[placeholder*="エラーパターン"]', 'E2E Auto Resolution Test')
      await page.selectOption('select[aria-label*="解決アクション"]', 'auto-fix')
      await page.fill('textarea[placeholder*="解決理由テンプレート"]', '自動修正: E2Eテストパターンとして認識され自動解決')

      // 5. ルールを保存
      await page.click('button:has-text("ルールを保存")')

      // 6. 自動解決対象のエラーを作成
      await page.goto(TEST_BASE_URL)
      await page.evaluate(() => {
        fetch('/api/error-reporting', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: 'E2E Auto Resolution Test: Network timeout',
            stack: 'Error: Auto resolution test',
            component: 'E2EAutoTest',
            url: '/auto-test',
            userAgent: navigator.userAgent,
            errorType: 'auto-test'
          })
        })
      })

      // 7. エラー解決ダッシュボードで自動解決を実行
      await page.goto(`${TEST_BASE_URL}/admin/error-resolution`)
      await page.click('button:has-text("自動解決を実行")')

      // 8. 自動解決が実行されることを確認
      await expect(page.locator('text=自動解決が完了しました')).toBeVisible({ timeout: 10000 })

      // 9. 対象エラーが自動解決されることを確認
      await page.fill('input[placeholder*="エラーを検索"]', 'E2E Auto Resolution Test')
      await page.press('input[placeholder*="エラーを検索"]', 'Enter')
      
      const autoResolvedError = page.locator('text=E2E Auto Resolution Test').locator('..')
      await expect(autoResolvedError.locator('text=自動解決')).toBeVisible()
    })
  })

  test.describe('レスポンシブ対応と操作性テスト', () => {
    test('モバイル画面でのダッシュボード操作', async ({ page }) => {
      // 1. モバイル画面サイズに設定
      await page.setViewportSize({ width: 375, height: 667 })

      // 2. エラーダッシュボードに移動
      await page.goto(`${TEST_BASE_URL}/admin/error-dashboard`)

      // 3. モバイル対応のレイアウトが表示されることを確認
      await expect(page.locator('h1')).toBeVisible()

      // 4. エラーリストがスクロール可能であることを確認
      const errorList = page.locator('[data-testid="error-list"]')
      await expect(errorList).toBeVisible()

      // 5. フィルター機能がモバイルでも使用可能であることを確認
      await page.click('button:has-text("フィルター")')
      await expect(page.locator('select[aria-label*="エラータイプ"]')).toBeVisible()

      // 6. 詳細表示がモバイルで適切に表示されることを確認
      const firstError = page.locator('[data-testid="error-row"]').first()
      await firstError.click()
      await expect(page.locator('[data-testid="error-details"]')).toBeVisible()
    })

    test('タブレット画面での操作性確認', async ({ page }) => {
      // 1. タブレット画面サイズに設定
      await page.setViewportSize({ width: 768, height: 1024 })

      // 2. 通知設定ダッシュボードに移動
      await page.goto(`${TEST_BASE_URL}/admin/notification-settings`)

      // 3. タブレット用レイアウトが適用されることを確認
      await expect(page.locator('.tablet-layout')).toBeVisible()

      // 4. ルール一覧とフォームが同時に表示されることを確認
      await expect(page.locator('[data-testid="rules-list"]')).toBeVisible()
      await expect(page.locator('[data-testid="rule-form"]')).toBeVisible()

      // 5. タッチ操作でルールの編集ができることを確認
      const editButton = page.locator('button:has-text("編集")').first()
      await editButton.click()
      await expect(page.locator('[data-testid="edit-form"]')).toBeVisible()
    })
  })

  test.describe('パフォーマンステスト', () => {
    test('大量データロード時のパフォーマンス', async ({ page }) => {
      // 1. パフォーマンス測定を開始
      await page.goto(`${TEST_BASE_URL}/admin/error-dashboard`)

      // 2. 初期ロード時間を測定
      const startTime = Date.now()
      await page.waitForSelector('[data-testid="error-list"]')
      const loadTime = Date.now() - startTime

      // 3. 初期ロードが5秒以内に完了することを確認
      expect(loadTime).toBeLessThan(5000)

      // 4. 大量データフィルタリングのパフォーマンス確認
      const filterStartTime = Date.now()
      await page.selectOption('select[aria-label*="エラータイプ"]', 'api')
      await page.waitForSelector('[data-testid="filtered-results"]')
      const filterTime = Date.now() - filterStartTime

      // 5. フィルタリングが2秒以内に完了することを確認
      expect(filterTime).toBeLessThan(2000)

      // 6. スクロール時のパフォーマンス確認
      const scrollStartTime = Date.now()
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight)
      })
      await page.waitForTimeout(1000)
      const scrollTime = Date.now() - scrollStartTime

      // 7. スクロール処理が1秒以内に完了することを確認
      expect(scrollTime).toBeLessThan(1000)
    })

    test('メモリ使用量監視', async ({ page }) => {
      // 1. ダッシュボードページに移動
      await page.goto(`${TEST_BASE_URL}/admin/error-dashboard`)

      // 2. 初期メモリ使用量を取得
      const initialMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0
      })

      // 3. 大量操作を実行（フィルター、ソート、検索を繰り返し）
      for (let i = 0; i < 10; i++) {
        await page.selectOption('select[aria-label*="エラータイプ"]', 'api')
        await page.selectOption('select[aria-label*="エラータイプ"]', 'critical')
        await page.fill('input[placeholder*="検索"]', `test ${i}`)
        await page.press('input[placeholder*="検索"]', 'Enter')
        await page.click('button:has-text("クリア")')
      }

      // 4. 最終メモリ使用量を取得
      const finalMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0
      })

      // 5. メモリ増加が合理的な範囲内であることを確認（50MB以下）
      const memoryIncrease = finalMemory - initialMemory
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024)
    })
  })

  test.describe('エラー処理とフォールバック', () => {
    test('ネットワーク障害時のフォールバック', async ({ page }) => {
      // 1. ネットワークリクエストを失敗させる
      await page.route('**/api/error-reporting', route => {
        route.abort()
      })

      // 2. ダッシュボードに移動
      await page.goto(`${TEST_BASE_URL}/admin/error-dashboard`)

      // 3. エラーメッセージが表示されることを確認
      await expect(page.locator('text=データの読み込みに失敗しました')).toBeVisible({ timeout: 10000 })

      // 4. 再試行ボタンが表示されることを確認
      await expect(page.locator('button:has-text("再試行")')).toBeVisible()

      // 5. ネットワークを復旧
      await page.unroute('**/api/error-reporting')

      // 6. 再試行ボタンをクリック
      await page.click('button:has-text("再試行")')

      // 7. データが正常に読み込まれることを確認
      await expect(page.locator('[data-testid="error-list"]')).toBeVisible({ timeout: 5000 })
    })

    test('認証エラー時のリダイレクト', async ({ page }) => {
      // 1. 認証なしでダッシュボードにアクセス
      await page.setExtraHTTPHeaders({})

      // 2. 管理画面に移動
      await page.goto(`${TEST_BASE_URL}/admin/error-dashboard`)

      // 3. 認証エラーメッセージまたはリダイレクトが発生することを確認
      await expect(
        page.locator('text=認証が必要です').or(page.locator('h1:has-text("Sign In")'))
      ).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('アクセシビリティテスト', () => {
    test('キーボードナビゲーション', async ({ page }) => {
      // 1. ダッシュボードに移動
      await page.goto(`${TEST_BASE_URL}/admin/error-dashboard`)

      // 2. Tabキーでフォーカス移動ができることを確認
      await page.press('body', 'Tab')
      await expect(page.locator(':focus')).toBeVisible()

      // 3. Enterキーで要素がアクティベートできることを確認
      const focusedElement = page.locator(':focus')
      await page.press(':focus', 'Enter')

      // 4. エスケープキーでモーダルが閉じることを確認
      await page.press('body', 'Escape')
    })

    test('スクリーンリーダー対応', async ({ page }) => {
      // 1. ダッシュボードに移動
      await page.goto(`${TEST_BASE_URL}/admin/error-dashboard`)

      // 2. 適切なARIAラベルが設定されていることを確認
      await expect(page.locator('[aria-label]')).toHaveCount({ min: 1 })

      // 3. 見出し構造が適切であることを確認
      await expect(page.locator('h1')).toHaveCount(1)
      await expect(page.locator('h2')).toHaveCount({ min: 1 })

      // 4. フォーム要素にラベルが関連付けられていることを確認
      const inputs = page.locator('input')
      const inputCount = await inputs.count()
      
      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i)
        const hasLabel = await input.getAttribute('aria-label') || 
                        await input.getAttribute('aria-labelledby') ||
                        await page.locator(`label[for="${await input.getAttribute('id')}"]`).count() > 0
        expect(hasLabel).toBeTruthy()
      }
    })
  })
})