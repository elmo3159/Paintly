/**
 * Playwright グローバルセットアップ
 * E2Eテスト実行前の環境準備
 */

import { FullConfig } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

async function globalSetup(config: FullConfig) {
  console.log('🚀 [E2E Setup] Starting global setup...')

  try {
    // 1. 環境変数の確認
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'GEMINI_API_KEY'
    ]

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        console.warn(`⚠️ [E2E Setup] Missing environment variable: ${envVar}`)
      }
    }

    // 2. テスト用データベースの準備
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )

      // テスト用エラーデータをクリーンアップ
      try {
        await supabase
          .from('error_logs')
          .delete()
          .like('message', 'E2E%')

        console.log('🧹 [E2E Setup] Cleaned up existing E2E test data')
      } catch (error) {
        console.log('ℹ️ [E2E Setup] No existing E2E test data to clean up')
      }

      // テスト用通知設定をクリーンアップ
      try {
        await supabase
          .from('notification_rules')
          .delete()
          .like('name', 'E2E%')

        console.log('🧹 [E2E Setup] Cleaned up existing E2E notification rules')
      } catch (error) {
        console.log('ℹ️ [E2E Setup] No existing E2E notification rules to clean up')
      }
    }

    // 3. テスト結果ディレクトリの作成
    const fs = require('fs')
    const path = require('path')
    
    const resultsDir = path.join(process.cwd(), '__tests__/results')
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true })
      console.log('📁 [E2E Setup] Created test results directory')
    }

    // 4. スクリーンショットディレクトリの作成
    const screenshotsDir = path.join(process.cwd(), '__tests__/results/screenshots')
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true })
      console.log('📁 [E2E Setup] Created screenshots directory')
    }

    // 5. ビデオディレクトリの作成
    const videosDir = path.join(process.cwd(), '__tests__/results/videos')
    if (!fs.existsSync(videosDir)) {
      fs.mkdirSync(videosDir, { recursive: true })
      console.log('📁 [E2E Setup] Created videos directory')
    }

    // 6. テスト実行情報をファイルに記録
    const testInfo = {
      startTime: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'test',
      baseUrl: process.env.TEST_BASE_URL || 'http://localhost:9090',
      userAgent: 'Paintly-E2E-Tests/1.0',
      browserCount: config.projects.length,
      projects: config.projects.map(p => p.name)
    }

    fs.writeFileSync(
      path.join(resultsDir, 'test-info.json'),
      JSON.stringify(testInfo, null, 2)
    )

    console.log('📝 [E2E Setup] Recorded test execution info')

    // 7. サーバーの起動待機
    const baseURL = process.env.TEST_BASE_URL || 'http://localhost:9090'
    console.log(`⏳ [E2E Setup] Waiting for server at ${baseURL}...`)

    // サーバーのヘルスチェック
    const maxRetries = 30
    let retries = 0
    
    while (retries < maxRetries) {
      try {
        const response = await fetch(`${baseURL}/api/health-check`)
        if (response.status === 200 || response.status === 404) {
          console.log('✅ [E2E Setup] Server is ready')
          break
        }
      } catch (error) {
        // サーバーがまだ起動していない場合
      }
      
      retries++
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      if (retries >= maxRetries) {
        console.warn('⚠️ [E2E Setup] Server health check failed, proceeding anyway')
      }
    }

    // 8. ブラウザキャッシュのクリアファイル作成
    const clearCacheScript = `
      // Browser cache clear script for E2E tests
      if (typeof window !== 'undefined') {
        // Clear localStorage
        localStorage.clear();
        
        // Clear sessionStorage
        sessionStorage.clear();
        
        // Clear cookies (if possible)
        document.cookie.split(";").forEach(function(c) { 
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        
        console.log('🧹 Browser cache cleared for E2E tests');
      }
    `

    fs.writeFileSync(
      path.join(resultsDir, 'clear-cache.js'),
      clearCacheScript
    )

    console.log('✅ [E2E Setup] Global setup completed successfully')

  } catch (error) {
    console.error('❌ [E2E Setup] Global setup failed:', error)
    throw error
  }
}

export default globalSetup