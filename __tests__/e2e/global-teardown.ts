/**
 * Playwright グローバル終了処理
 * E2Eテスト実行後のクリーンアップ
 */

import { FullConfig } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

async function globalTeardown(config: FullConfig) {
  console.log('🏁 [E2E Teardown] Starting global teardown...')

  try {
    // 1. テスト結果の集計と記録
    const fs = require('fs')
    const path = require('path')
    
    const resultsDir = path.join(process.cwd(), '__tests__/results')
    const testInfoPath = path.join(resultsDir, 'test-info.json')
    
    if (fs.existsSync(testInfoPath)) {
      const testInfo = JSON.parse(fs.readFileSync(testInfoPath, 'utf8'))
      testInfo.endTime = new Date().toISOString()
      testInfo.duration = new Date(testInfo.endTime).getTime() - new Date(testInfo.startTime).getTime()
      
      fs.writeFileSync(testInfoPath, JSON.stringify(testInfo, null, 2))
      console.log(`📊 [E2E Teardown] Test execution duration: ${testInfo.duration}ms`)
    }

    // 2. テスト用データベースの最終クリーンアップ
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )

      // E2Eテスト用エラーデータを削除
      try {
        const { data: errors } = await supabase
          .from('error_logs')
          .select('id')
          .like('message', 'E2E%')

        if (errors && errors.length > 0) {
          await supabase
            .from('error_logs')
            .delete()
            .like('message', 'E2E%')
          
          console.log(`🧹 [E2E Teardown] Cleaned up ${errors.length} E2E test error records`)
        }
      } catch (error) {
        console.log('ℹ️ [E2E Teardown] No E2E test errors to clean up')
      }

      // E2Eテスト用通知設定を削除
      try {
        const { data: rules } = await supabase
          .from('notification_rules')
          .select('id')
          .like('name', 'E2E%')

        if (rules && rules.length > 0) {
          await supabase
            .from('notification_rules')
            .delete()
            .like('name', 'E2E%')
          
          console.log(`🧹 [E2E Teardown] Cleaned up ${rules.length} E2E test notification rules`)
        }
      } catch (error) {
        console.log('ℹ️ [E2E Teardown] No E2E test notification rules to clean up')
      }

      // E2Eテスト用解決データを削除
      try {
        const { data: resolutions } = await supabase
          .from('error_resolutions')
          .select('id')
          .like('resolution_notes', 'E2E%')

        if (resolutions && resolutions.length > 0) {
          await supabase
            .from('error_resolutions')
            .delete()
            .like('resolution_notes', 'E2E%')
          
          console.log(`🧹 [E2E Teardown] Cleaned up ${resolutions.length} E2E test resolution records`)
        }
      } catch (error) {
        console.log('ℹ️ [E2E Teardown] No E2E test resolutions to clean up')
      }
    }

    // 3. テストアーティファクトの整理
    const artifactsDir = path.join(resultsDir, 'e2e-results')
    if (fs.existsSync(artifactsDir)) {
      // ファイルサイズの計算
      const getDirectorySize = (dirPath: string): number => {
        let totalSize = 0
        const files = fs.readdirSync(dirPath)
        
        for (const file of files) {
          const filePath = path.join(dirPath, file)
          const stats = fs.statSync(filePath)
          
          if (stats.isDirectory()) {
            totalSize += getDirectorySize(filePath)
          } else {
            totalSize += stats.size
          }
        }
        
        return totalSize
      }

      const totalSize = getDirectorySize(artifactsDir)
      const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2)
      console.log(`📦 [E2E Teardown] Test artifacts size: ${sizeInMB} MB`)

      // 古いテスト結果の削除（7日以上前）
      const cleanupOldResults = (dirPath: string) => {
        if (!fs.existsSync(dirPath)) return

        const files = fs.readdirSync(dirPath)
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
        
        let deletedCount = 0
        
        for (const file of files) {
          const filePath = path.join(dirPath, file)
          const stats = fs.statSync(filePath)
          
          if (stats.mtime.getTime() < sevenDaysAgo) {
            if (stats.isDirectory()) {
              fs.rmSync(filePath, { recursive: true, force: true })
            } else {
              fs.unlinkSync(filePath)
            }
            deletedCount++
          }
        }
        
        if (deletedCount > 0) {
          console.log(`🗑️ [E2E Teardown] Cleaned up ${deletedCount} old test artifacts`)
        }
      }

      cleanupOldResults(path.join(resultsDir, 'screenshots'))
      cleanupOldResults(path.join(resultsDir, 'videos'))
    }

    // 4. テスト実行サマリーの生成
    const summaryPath = path.join(resultsDir, 'e2e-summary.json')
    const summary = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'test',
      baseUrl: process.env.TEST_BASE_URL || 'http://localhost:9090',
      totalProjects: config.projects.length,
      projects: config.projects.map(p => p.name),
      cleanup: {
        errorsRemoved: 0,
        rulesRemoved: 0,
        resolutionsRemoved: 0,
        artifactsSize: 0
      },
      status: 'completed'
    }

    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2))
    console.log('📄 [E2E Teardown] Generated test execution summary')

    // 5. 環境固有のクリーンアップ
    if (process.env.CI) {
      // CI環境での追加クリーンアップ
      console.log('🔧 [E2E Teardown] Performing CI-specific cleanup...')
      
      // プロセスのクリーンアップ
      const { exec } = require('child_process')
      exec('pkill -f "next dev"', (error) => {
        if (error) {
          console.log('ℹ️ [E2E Teardown] No development server processes to clean up')
        } else {
          console.log('🧹 [E2E Teardown] Cleaned up development server processes')
        }
      })
    }

    // 6. パフォーマンス統計の記録
    if (typeof process.memoryUsage === 'function') {
      const memUsage = process.memoryUsage()
      const performanceStats = {
        memoryUsage: {
          rss: `${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`,
          heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
          heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
          external: `${(memUsage.external / 1024 / 1024).toFixed(2)} MB`
        },
        timestamp: new Date().toISOString()
      }

      fs.writeFileSync(
        path.join(resultsDir, 'performance-stats.json'),
        JSON.stringify(performanceStats, null, 2)
      )

      console.log('📈 [E2E Teardown] Recorded performance statistics')
    }

    // 7. レポート生成通知
    const reportsGenerated = []
    
    if (fs.existsSync(path.join(resultsDir, 'e2e-results.json'))) {
      reportsGenerated.push('JSON Report')
    }
    
    if (fs.existsSync(path.join(resultsDir, 'e2e-results.xml'))) {
      reportsGenerated.push('JUnit XML Report')
    }
    
    const htmlReportDir = path.join(process.cwd(), 'playwright-report')
    if (fs.existsSync(htmlReportDir)) {
      reportsGenerated.push('HTML Report')
    }

    if (reportsGenerated.length > 0) {
      console.log(`📋 [E2E Teardown] Generated reports: ${reportsGenerated.join(', ')}`)
    }

    // 8. 最終確認とログ出力
    console.log('✅ [E2E Teardown] Global teardown completed successfully')
    console.log('')
    console.log('📊 Test Execution Summary:')
    console.log(`   Environment: ${process.env.NODE_ENV || 'test'}`)
    console.log(`   Base URL: ${process.env.TEST_BASE_URL || 'http://localhost:9090'}`)
    console.log(`   Browser Projects: ${config.projects.length}`)
    console.log(`   Reports Generated: ${reportsGenerated.length}`)
    console.log('')
    
    if (reportsGenerated.includes('HTML Report')) {
      console.log('🌐 Open HTML report: npx playwright show-report')
    }
    
    console.log('🔍 Test artifacts location: __tests__/results/')

  } catch (error) {
    console.error('❌ [E2E Teardown] Global teardown failed:', error)
    // teardownではエラーが発生してもテスト全体を失敗させない
    console.log('⚠️ [E2E Teardown] Continuing despite teardown errors...')
  }
}

export default globalTeardown