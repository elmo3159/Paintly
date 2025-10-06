const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Next.js アプリのパスを指定
  dir: './',
})

// Jest のカスタム設定
const customJestConfig = {
  // テスト環境をDOM環境に設定
  testEnvironment: 'jsdom',
  
  // セットアップファイルを指定
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  
  // テストファイルのパターンを指定
  testMatch: [
    '**/__tests__/**/*.(test|spec).(js|jsx|ts|tsx)',
    '**/*.(test|spec).(js|jsx|ts|tsx)'
  ],
  
  // カバレッジ対象外のファイルを指定
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/__tests__/setup.ts',
    '<rootDir>/__tests__/mocks/',
    '<rootDir>/__tests__/utils/'
  ],
  
  // カバレッジ設定
  collectCoverage: false, // デフォルトではオフ（--coverage フラグで有効化）
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    'utils/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/__tests__/**',
    '!**/test-*',
    '!**/stories/**',
    '!**/*.stories.{js,jsx,ts,tsx}',
    '!**/playwright-report/**',
    '!**/test-results/**',
    '!app/**/layout.tsx',
    '!app/**/loading.tsx',
    '!app/**/error.tsx',
    '!app/**/not-found.tsx',
    '!app/**/global-error.tsx',
    '!**/middleware.ts',
    '!next.config.js',
    '!tailwind.config.ts',
    '!postcss.config.js'
  ],

  // カバレッジレポーターの設定
  coverageReporters: [
    'text',           // コンソール出力
    'text-summary',   // サマリー表示
    'html',           // HTML レポート
    'lcov',           // lcov.info ファイル（他ツール連携用）
    'json',           // JSON 形式
    'json-summary',   // JSON サマリー
    'clover',         // Clover XML
    'cobertura'       // Cobertura XML
  ],

  // カバレッジ出力ディレクトリ
  coverageDirectory: 'coverage',

  // カバレッジの閾値設定（エラー管理システム用に厳格化）
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85
    },
    // 重要なファイルには更に高い閾値を設定
    './lib/notification-engine.ts': {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95
    },
    './app/api/error-reporting/route.ts': {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './components/error-dashboard.tsx': {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  
  // モジュールマッピング（Next.js エイリアス対応）
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/hooks/(.*)$': '<rootDir>/hooks/$1',
    '^@/utils/(.*)$': '<rootDir>/utils/$1',
    '^@/types/(.*)$': '<rootDir>/types/$1',
    '^@/store/(.*)$': '<rootDir>/store/$1'
  },
  
  // トランスフォーム設定
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
  },
  
  // モジュール拡張子
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // テスト実行時の詳細設定
  verbose: true,
  silent: false,
  
  // タイムアウト設定（30秒）
  testTimeout: 30000,
  
  // 並列実行設定
  maxWorkers: '50%',
  
  // モックファイルの自動検出
  clearMocks: true,
  restoreMocks: true,
  
  // テスト環境の設定
  testEnvironmentOptions: {
    url: 'http://localhost/'
  }
}

// Next.js 設定とマージして export
module.exports = createJestConfig(customJestConfig)