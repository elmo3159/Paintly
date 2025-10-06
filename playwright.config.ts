import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright設定 - エラー管理システムE2Eテスト用
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './__tests__/e2e',
  
  /* 並列実行 */
  fullyParallel: true,
  
  /* CI環境での失敗時にワーカーを再試行しない */
  forbidOnly: !!process.env.CI,
  
  /* CI環境でのリトライ設定 */
  retries: process.env.CI ? 2 : 0,
  
  /* 並列ワーカー数 */
  workers: process.env.CI ? 1 : undefined,
  
  /* レポーター設定 */
  reporter: [
    ['html'],
    ['json', { outputFile: '__tests__/results/e2e-results.json' }],
    ['junit', { outputFile: '__tests__/results/e2e-results.xml' }]
  ],
  
  /* 共通設定 */
  use: {
    /* ベースURL */
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:9090',
    
    /* スクリーンショット設定 */
    screenshot: 'only-on-failure',
    
    /* 動画録画設定 */
    video: 'retain-on-failure',
    
    /* トレース設定 */
    trace: 'on-first-retry',
    
    /* デフォルトタイムアウト */
    actionTimeout: 10000,
    navigationTimeout: 30000,
    
    /* ユーザーエージェント */
    userAgent: 'Paintly-E2E-Tests/1.0',
    
    /* リクエストヘッダー */
    extraHTTPHeaders: {
      'X-Test-Environment': 'e2e',
    },
    
    /* 地域設定 */
    locale: 'ja-JP',
    timezoneId: 'Asia/Tokyo',
  },

  /* プロジェクト設定 */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* モバイルテスト */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    /* タブレットテスト */
    {
      name: 'iPad',
      use: { ...devices['iPad Pro'] },
    },

    /* Microsoft Edge */
    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },

    /* Google Chrome */
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],

  /* Web Server設定 */
  webServer: {
    command: 'npm run dev -- -p 9090',
    url: 'http://localhost:9090',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'ignore',
    stderr: 'pipe',
  },

  /* グローバル設定 */
  globalSetup: require.resolve('./__tests__/e2e/global-setup.ts'),
  globalTeardown: require.resolve('./__tests__/e2e/global-teardown.ts'),

  /* テストマッチパターン */
  testMatch: '**/*.e2e.test.ts',

  /* 出力ディレクトリ */
  outputDir: '__tests__/results/e2e-results',

  /* 期待設定 */
  expect: {
    /* アサーションタイムアウト */
    timeout: 10000,
    
    /* 視覚的比較のしきい値 */
    toMatchSnapshot: {
      threshold: 0.2
    },
    
    /* カスタムマッチャー */
    toHaveScreenshot: {
      threshold: 0.2
    }
  },

  /* メタデータ */
  metadata: {
    testSuite: 'Error Management System E2E Tests',
    version: '1.0.0',
    author: 'Paintly Development Team',
    environment: process.env.NODE_ENV || 'test'
  }
})