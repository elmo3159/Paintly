#!/usr/bin/env node

/**
 * テストカバレッジ品質確認スクリプト
 * 全テストの実行、カバレッジレポート生成、品質ゲートチェック
 */

const { execSync, spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

// カラー出力用定数
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m'
}

// 設定
const config = {
  coverageThresholds: {
    global: {
      lines: 85,
      functions: 85,
      branches: 80,
      statements: 85
    },
    critical: {
      lines: 95,
      functions: 95,
      branches: 90,
      statements: 95
    }
  },
  testTimeout: 300000, // 5分
  e2eTimeout: 600000,  // 10分
  outputDir: '__tests__/results',
  reportFormats: ['html', 'lcov', 'json', 'text-summary']
}

class TestRunner {
  constructor() {
    this.startTime = Date.now()
    this.results = {
      unit: null,
      integration: null,
      e2e: null,
      coverage: null,
      quality: null
    }
    this.errors = []
  }

  log(message, color = 'white') {
    const timestamp = new Date().toISOString()
    console.log(`${colors[color]}${colors.bright}[${timestamp}]${colors.reset} ${message}`)
  }

  error(message, error = null) {
    this.log(`❌ ${message}`, 'red')
    if (error) {
      console.error(error)
      this.errors.push({ message, error: error.toString() })
    } else {
      this.errors.push({ message })
    }
  }

  success(message) {
    this.log(`✅ ${message}`, 'green')
  }

  warning(message) {
    this.log(`⚠️ ${message}`, 'yellow')
  }

  info(message) {
    this.log(`ℹ️ ${message}`, 'cyan')
  }

  async setupDirectories() {
    this.info('テスト結果ディレクトリを準備中...')
    
    const dirs = [
      config.outputDir,
      `${config.outputDir}/unit`,
      `${config.outputDir}/integration`,
      `${config.outputDir}/e2e`,
      `${config.outputDir}/coverage`,
      'coverage'
    ]

    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
        this.info(`ディレクトリ作成: ${dir}`)
      }
    }
  }

  async runCommand(command, description, timeout = config.testTimeout) {
    this.info(`${description} 実行中...`)
    this.log(`Command: ${command}`, 'dim')

    return new Promise((resolve, reject) => {
      const startTime = Date.now()
      
      const process = spawn('sh', ['-c', command], {
        stdio: 'pipe',
        timeout: timeout
      })

      let stdout = ''
      let stderr = ''

      process.stdout.on('data', (data) => {
        stdout += data.toString()
        // リアルタイム出力（重要な情報のみ）
        const output = data.toString()
        if (output.includes('PASS') || output.includes('FAIL') || output.includes('Tests:')) {
          process.stdout.write(data)
        }
      })

      process.stderr.on('data', (data) => {
        stderr += data.toString()
        // エラー出力は常に表示
        process.stderr.write(data)
      })

      process.on('close', (code) => {
        const duration = Date.now() - startTime
        this.log(`実行時間: ${(duration / 1000).toFixed(2)}秒`, 'dim')

        if (code === 0) {
          this.success(`${description} 完了`)
          resolve({ code, stdout, stderr, duration })
        } else {
          this.error(`${description} 失敗 (exit code: ${code})`)
          reject({ code, stdout, stderr, duration })
        }
      })

      process.on('error', (error) => {
        this.error(`${description} 実行エラー`, error)
        reject(error)
      })

      // タイムアウト設定
      setTimeout(() => {
        this.warning(`${description} がタイムアウトしました (${timeout / 1000}秒)`)
        process.kill('SIGTERM')
        reject(new Error(`Timeout after ${timeout}ms`))
      }, timeout)
    })
  }

  async runUnitTests() {
    this.log('📋 ユニットテスト実行開始', 'blue')
    
    try {
      const result = await this.runCommand(
        'npm run test:coverage:unit -- --outputFile=__tests__/results/unit/test-results.json',
        'ユニットテスト'
      )
      
      this.results.unit = {
        status: 'success',
        duration: result.duration,
        output: result.stdout
      }
      
      return true
    } catch (error) {
      this.results.unit = {
        status: 'failed',
        error: error.toString()
      }
      return false
    }
  }

  async runIntegrationTests() {
    this.log('🔗 統合テスト実行開始', 'blue')
    
    try {
      const result = await this.runCommand(
        'npm run test:coverage:integration -- --outputFile=__tests__/results/integration/test-results.json',
        '統合テスト'
      )
      
      this.results.integration = {
        status: 'success',
        duration: result.duration,
        output: result.stdout
      }
      
      return true
    } catch (error) {
      this.results.integration = {
        status: 'failed',
        error: error.toString()
      }
      return false
    }
  }

  async runE2ETests() {
    this.log('🎭 E2Eテスト実行開始', 'blue')
    
    try {
      const result = await this.runCommand(
        'npm run test:e2e -- --reporter=json --output-file=__tests__/results/e2e/test-results.json',
        'E2Eテスト',
        config.e2eTimeout
      )
      
      this.results.e2e = {
        status: 'success',
        duration: result.duration,
        output: result.stdout
      }
      
      return true
    } catch (error) {
      this.results.e2e = {
        status: 'failed',
        error: error.toString()
      }
      return false
    }
  }

  async generateCoverageReport() {
    this.log('📊 カバレッジレポート生成開始', 'magenta')
    
    try {
      // Jest カバレッジレポートの生成
      await this.runCommand(
        'npm run test:coverage -- --outputFile=__tests__/results/coverage/jest-coverage.json',
        'Jestカバレッジ生成'
      )

      // カバレッジファイルの確認
      const coveragePath = 'coverage/coverage-summary.json'
      if (fs.existsSync(coveragePath)) {
        const coverageData = JSON.parse(fs.readFileSync(coveragePath, 'utf8'))
        this.results.coverage = {
          status: 'success',
          data: coverageData
        }
        
        this.info('カバレッジサマリー:')
        this.logCoverageSummary(coverageData.total)
        
        return true
      } else {
        this.warning('カバレッジファイルが見つかりません')
        return false
      }
    } catch (error) {
      this.error('カバレッジレポート生成失敗', error)
      this.results.coverage = {
        status: 'failed',
        error: error.toString()
      }
      return false
    }
  }

  logCoverageSummary(total) {
    const formatPercentage = (pct) => {
      const color = pct >= 90 ? 'green' : pct >= 80 ? 'yellow' : 'red'
      return `${colors[color]}${pct.toFixed(2)}%${colors.reset}`
    }

    console.log(`  Lines:      ${formatPercentage(total.lines.pct)}`)
    console.log(`  Functions:  ${formatPercentage(total.functions.pct)}`)
    console.log(`  Branches:   ${formatPercentage(total.branches.pct)}`)
    console.log(`  Statements: ${formatPercentage(total.statements.pct)}`)
  }

  async checkQualityGates() {
    this.log('🚨 品質ゲートチェック開始', 'magenta')
    
    const issues = []
    let passed = true

    // カバレッジ閾値チェック
    if (this.results.coverage && this.results.coverage.data) {
      const total = this.results.coverage.data.total
      const thresholds = config.coverageThresholds.global

      const checks = [
        { metric: 'lines', actual: total.lines.pct, threshold: thresholds.lines },
        { metric: 'functions', actual: total.functions.pct, threshold: thresholds.functions },
        { metric: 'branches', actual: total.branches.pct, threshold: thresholds.branches },
        { metric: 'statements', actual: total.statements.pct, threshold: thresholds.statements }
      ]

      for (const check of checks) {
        if (check.actual < check.threshold) {
          issues.push(`${check.metric} カバレッジが閾値を下回っています: ${check.actual.toFixed(2)}% < ${check.threshold}%`)
          passed = false
        }
      }
    }

    // テスト失敗チェック
    const failedTests = []
    for (const [testType, result] of Object.entries(this.results)) {
      if (result && result.status === 'failed') {
        failedTests.push(testType)
        passed = false
      }
    }

    if (failedTests.length > 0) {
      issues.push(`失敗したテスト: ${failedTests.join(', ')}`)
    }

    this.results.quality = {
      passed,
      issues,
      timestamp: new Date().toISOString()
    }

    if (passed) {
      this.success('✨ 全ての品質ゲートを通過しました！')
    } else {
      this.error('❌ 品質ゲートで問題が検出されました:')
      for (const issue of issues) {
        this.log(`  - ${issue}`, 'red')
      }
    }

    return passed
  }

  async generateFinalReport() {
    this.log('📄 最終レポート生成中...', 'magenta')
    
    const duration = Date.now() - this.startTime
    const report = {
      timestamp: new Date().toISOString(),
      duration: duration,
      durationFormatted: `${(duration / 1000 / 60).toFixed(2)} 分`,
      results: this.results,
      errors: this.errors,
      summary: this.generateSummary(),
      recommendations: this.generateRecommendations()
    }

    // JSON レポートの保存
    const reportPath = `${config.outputDir}/final-test-report.json`
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

    // HTML レポートの生成
    const htmlReport = this.generateHtmlReport(report)
    const htmlPath = `${config.outputDir}/final-test-report.html`
    fs.writeFileSync(htmlPath, htmlReport)

    this.success(`最終レポートが生成されました: ${reportPath}`)
    this.success(`HTML レポート: ${htmlPath}`)

    return report
  }

  generateSummary() {
    const summary = {
      total: 0,
      passed: 0,
      failed: 0,
      coverage: null
    }

    for (const [type, result] of Object.entries(this.results)) {
      if (result && type !== 'coverage' && type !== 'quality') {
        summary.total++
        if (result.status === 'success') {
          summary.passed++
        } else {
          summary.failed++
        }
      }
    }

    if (this.results.coverage && this.results.coverage.data) {
      summary.coverage = this.results.coverage.data.total
    }

    return summary
  }

  generateRecommendations() {
    const recommendations = []

    // カバレッジベースの推奨
    if (this.results.coverage && this.results.coverage.data) {
      const total = this.results.coverage.data.total
      
      if (total.lines.pct < 85) {
        recommendations.push('ラインカバレッジを85%以上に向上させることを推奨します')
      }
      
      if (total.branches.pct < 80) {
        recommendations.push('ブランチカバレッジを80%以上に向上させることを推奨します')
      }
      
      if (total.functions.pct < 85) {
        recommendations.push('関数カバレッジを85%以上に向上させることを推奨します')
      }
    }

    // 失敗したテストベースの推奨
    if (this.results.unit && this.results.unit.status === 'failed') {
      recommendations.push('ユニットテストの失敗を修正してください')
    }
    
    if (this.results.integration && this.results.integration.status === 'failed') {
      recommendations.push('統合テストの失敗を修正してください')
    }
    
    if (this.results.e2e && this.results.e2e.status === 'failed') {
      recommendations.push('E2Eテストの失敗を修正してください')
    }

    return recommendations
  }

  generateHtmlReport(report) {
    const statusIcon = (status) => {
      return status === 'success' ? '✅' : status === 'failed' ? '❌' : '⏳'
    }

    const formatPercentage = (pct) => {
      const className = pct >= 90 ? 'high' : pct >= 80 ? 'medium' : 'low'
      return `<span class="${className}">${pct.toFixed(2)}%</span>`
    }

    return `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Paintly テストカバレッジ品質レポート</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2563eb; margin-bottom: 30px; }
        h2 { color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
        .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; }
        .card h3 { margin: 0 0 10px 0; color: #1f2937; }
        .status-success { color: #059669; }
        .status-failed { color: #dc2626; }
        .high { color: #059669; font-weight: bold; }
        .medium { color: #d97706; font-weight: bold; }
        .low { color: #dc2626; font-weight: bold; }
        .coverage-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .coverage-table th, .coverage-table td { padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        .coverage-table th { background: #f9fafb; font-weight: 600; }
        .recommendations { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0; }
        .error { background: #fef2f2; border: 1px solid #fca5a5; border-radius: 6px; padding: 15px; margin: 10px 0; }
        .timestamp { color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 Paintly テストカバレッジ品質レポート</h1>
        <p class="timestamp">生成日時: ${report.timestamp}</p>
        <p class="timestamp">実行時間: ${report.durationFormatted}</p>

        <h2>📊 テスト実行サマリー</h2>
        <div class="summary">
            <div class="card">
                <h3>ユニットテスト</h3>
                <p>${statusIcon(report.results.unit?.status)} ${report.results.unit?.status || 'not run'}</p>
            </div>
            <div class="card">
                <h3>統合テスト</h3>
                <p>${statusIcon(report.results.integration?.status)} ${report.results.integration?.status || 'not run'}</p>
            </div>
            <div class="card">
                <h3>E2Eテスト</h3>
                <p>${statusIcon(report.results.e2e?.status)} ${report.results.e2e?.status || 'not run'}</p>
            </div>
            <div class="card">
                <h3>品質ゲート</h3>
                <p>${report.results.quality?.passed ? '✅ 通過' : '❌ 失敗'}</p>
            </div>
        </div>

        ${report.summary.coverage ? `
        <h2>📈 カバレッジ詳細</h2>
        <table class="coverage-table">
            <thead>
                <tr>
                    <th>メトリック</th>
                    <th>カバー済み</th>
                    <th>総数</th>
                    <th>カバレッジ率</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Lines</td>
                    <td>${report.summary.coverage.lines.covered}</td>
                    <td>${report.summary.coverage.lines.total}</td>
                    <td>${formatPercentage(report.summary.coverage.lines.pct)}</td>
                </tr>
                <tr>
                    <td>Functions</td>
                    <td>${report.summary.coverage.functions.covered}</td>
                    <td>${report.summary.coverage.functions.total}</td>
                    <td>${formatPercentage(report.summary.coverage.functions.pct)}</td>
                </tr>
                <tr>
                    <td>Branches</td>
                    <td>${report.summary.coverage.branches.covered}</td>
                    <td>${report.summary.coverage.branches.total}</td>
                    <td>${formatPercentage(report.summary.coverage.branches.pct)}</td>
                </tr>
                <tr>
                    <td>Statements</td>
                    <td>${report.summary.coverage.statements.covered}</td>
                    <td>${report.summary.coverage.statements.total}</td>
                    <td>${formatPercentage(report.summary.coverage.statements.pct)}</td>
                </tr>
            </tbody>
        </table>
        ` : ''}

        ${report.recommendations.length > 0 ? `
        <h2>💡 改善推奨事項</h2>
        <div class="recommendations">
            <ul>
                ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
        ` : ''}

        ${report.errors.length > 0 ? `
        <h2>⚠️ エラー詳細</h2>
        ${report.errors.map(error => `
            <div class="error">
                <strong>${error.message}</strong>
                ${error.error ? `<pre>${error.error}</pre>` : ''}
            </div>
        `).join('')}
        ` : ''}

        <h2>🔗 関連リンク</h2>
        <ul>
            <li><a href="./coverage/lcov-report/index.html">詳細カバレッジレポート</a></li>
            <li><a href="./e2e/playwright-report/index.html">E2Eテストレポート</a></li>
            <li><a href="./final-test-report.json">JSON形式レポート</a></li>
        </ul>
    </div>
</body>
</html>`
  }

  async run() {
    try {
      this.log('🚀 テストカバレッジ品質確認を開始します', 'green')
      
      // 1. ディレクトリ準備
      await this.setupDirectories()
      
      // 2. ユニットテスト実行
      const unitSuccess = await this.runUnitTests()
      
      // 3. 統合テスト実行
      const integrationSuccess = await this.runIntegrationTests()
      
      // 4. E2Eテスト実行
      const e2eSuccess = await this.runE2ETests()
      
      // 5. カバレッジレポート生成
      const coverageSuccess = await this.generateCoverageReport()
      
      // 6. 品質ゲートチェック
      const qualityPassed = await this.checkQualityGates()
      
      // 7. 最終レポート生成
      const report = await this.generateFinalReport()
      
      // 8. 結果サマリー
      this.log('📋 実行結果サマリー:', 'blue')
      this.log(`  ユニットテスト: ${unitSuccess ? '✅' : '❌'}`, unitSuccess ? 'green' : 'red')
      this.log(`  統合テスト: ${integrationSuccess ? '✅' : '❌'}`, integrationSuccess ? 'green' : 'red')
      this.log(`  E2Eテスト: ${e2eSuccess ? '✅' : '❌'}`, e2eSuccess ? 'green' : 'red')
      this.log(`  カバレッジ: ${coverageSuccess ? '✅' : '❌'}`, coverageSuccess ? 'green' : 'red')
      this.log(`  品質ゲート: ${qualityPassed ? '✅' : '❌'}`, qualityPassed ? 'green' : 'red')
      
      const totalDuration = Date.now() - this.startTime
      this.log(`⏱️ 総実行時間: ${(totalDuration / 1000 / 60).toFixed(2)} 分`, 'cyan')
      
      // 終了コードの決定
      const allPassed = unitSuccess && integrationSuccess && e2eSuccess && coverageSuccess && qualityPassed
      
      if (allPassed) {
        this.success('🎉 全てのテストが成功しました！')
        process.exit(0)
      } else {
        this.error('❌ 一部のテストが失敗しました')
        process.exit(1)
      }
      
    } catch (error) {
      this.error('致命的なエラーが発生しました', error)
      process.exit(1)
    }
  }
}

// メイン実行
if (require.main === module) {
  const runner = new TestRunner()
  runner.run()
}

module.exports = TestRunner