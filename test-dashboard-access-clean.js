/**
 * ダッシュボードアクセステスト - クリーンサーバー接続確認
 * Gemini & Fal AIマルチプロバイダー機能のテスト
 */

const { chromium } = require('@playwright/test');

async function testDashboardAccess() {
  console.log('🎨 Paintly ダッシュボードアクセステスト開始...');
  console.log('🔗 対象URL: http://172.17.161.101:9090/dashboard');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1200, height: 800 }
  });

  const page = await context.newPage();

  // ネットワークエラー監視
  page.on('requestfailed', request => {
    console.log(`❌ [Request Failed] ${request.method()} ${request.url()}`);
    console.log(`   ├─ Failure: ${request.failure()?.errorText}`);
  });

  // CORS エラー監視
  page.on('response', response => {
    if (!response.ok()) {
      console.log(`⚠️ [HTTP Error] ${response.status()} ${response.url()}`);
    }
  });

  // コンソールログ監視（オフライン状態検出）
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('オフライン') || text.includes('offline') || text.includes('DISABLE')) {
      console.log(`🔍 [Browser Console] ${msg.type()}: ${text}`);
    }
  });

  try {
    console.log('📱 ダッシュボードに直接アクセス...');

    // ネットワークタイムアウトを短く設定
    const response = await page.goto('http://172.17.161.101:9090/dashboard', {
      waitUntil: 'networkidle',
      timeout: 10000
    });

    console.log('📡 初期応答ステータス:', response?.status() || 'タイムアウト');

    // 初期状態のスクリーンショット
    await page.screenshot({
      path: '.playwright-mcp/dashboard-access-01-initial-clean.png',
      fullPage: true
    });

    // サインインページにリダイレクトされているかチェック
    const currentUrl = page.url();
    console.log('🌐 現在のURL:', currentUrl);

    if (currentUrl.includes('/auth/signin') || currentUrl.includes('signin')) {
      console.log('🔐 認証画面にリダイレクトされました');

      // Google認証を自動実行（テスト用）
      const googleButton = page.locator('button:has-text("Google"), button:has-text("Googleで"), [data-provider="google"]').first();

      if (await googleButton.isVisible()) {
        console.log('✅ Google認証ボタンを発見');
        await googleButton.click();
        console.log('✅ Google認証ボタンをクリック');

        // 認証処理を待つ
        await page.waitForTimeout(3000);

        await page.screenshot({
          path: '.playwright-mcp/dashboard-access-02-after-google-auth.png',
          fullPage: true
        });
      } else {
        console.log('⚠️ Google認証ボタンが見つかりません');
      }

    } else if (currentUrl.includes('dashboard')) {
      console.log('✅ ダッシュボードに直接アクセスできました');
    }

    // 最終的にダッシュボード機能が表示されているかチェック
    await page.waitForTimeout(2000);

    // オフライン状態の確認
    const offlineIndicators = [
      'text=オフラインです',
      'text=オフライン',
      '.offline',
      '[data-testid*="offline"]'
    ];

    let isOffline = false;
    for (const selector of offlineIndicators) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible()) {
          console.log('⚠️ オフライン状態が検出されました:', selector);
          isOffline = true;
          break;
        }
      } catch (error) {
        // セレクターが見つからない場合は継続
      }
    }

    // AIプロバイダー選択UIの確認
    const providerSelectors = [
      'select[name*="provider"]',
      'select[name*="ai"]',
      '.provider-selector',
      '[data-testid*="provider"]'
    ];

    let providerFound = false;
    for (const selector of providerSelectors) {
      try {
        const providerElement = page.locator(selector).first();
        if (await providerElement.isVisible()) {
          console.log('✅ AIプロバイダー選択UIを発見:', selector);

          // 利用可能なプロバイダーを確認
          if (selector.includes('select')) {
            const options = await providerElement.locator('option').allTextContents();
            console.log('🤖 利用可能プロバイダー:', options.filter(opt => opt.trim()));

            // GeminiとFal AIの両方があるか確認
            const hasGemini = options.some(opt => opt.toLowerCase().includes('gemini'));
            const hasFalAI = options.some(opt => opt.toLowerCase().includes('fal'));

            console.log('🔍 プロバイダー確認:');
            console.log(`   ├─ Gemini: ${hasGemini ? '✅' : '❌'}`);
            console.log(`   └─ Fal AI: ${hasFalAI ? '✅' : '❌'}`);

            if (hasGemini && hasFalAI) {
              console.log('🎉 マルチプロバイダー機能が正常に動作しています！');
            }
          }

          providerFound = true;
          break;
        }
      } catch (error) {
        // 次のセレクターを試す
      }
    }

    if (!providerFound && !isOffline) {
      console.log('ℹ️ プロバイダー選択UIが見つかりません（未ログインまたは別画面の可能性）');
    }

    // 最終状態のスクリーンショット
    await page.screenshot({
      path: '.playwright-mcp/dashboard-access-03-final-clean.png',
      fullPage: true
    });

    // 接続状況サマリー
    console.log('\n📋 ダッシュボードアクセステスト結果:');
    console.log(`   ├─ URL: ${page.url()}`);
    console.log(`   ├─ オフライン状態: ${isOffline ? '⚠️ Yes' : '✅ No'}`);
    console.log(`   ├─ プロバイダーUI: ${providerFound ? '✅ Found' : '❌ Not Found'}`);
    console.log(`   └─ 最終ステータス: ${!isOffline && (providerFound || currentUrl.includes('dashboard')) ? '🎉 成功' : '⚠️ 要確認'}`);

    console.log('\n🎉 ダッシュボードアクセステスト完了！');

  } catch (error) {
    console.error('❌ ダッシュボードアクセステストエラー:', error.message);

    await page.screenshot({
      path: '.playwright-mcp/dashboard-access-error-clean.png',
      fullPage: true
    });

    // 詳細なエラー情報
    console.log('🔍 エラー詳細:');
    console.log(`   ├─ URL: ${page.url()}`);
    console.log(`   ├─ ネットワークエラー: ${error.message.includes('net::') ? 'Yes' : 'No'}`);
    console.log(`   └─ タイムアウト: ${error.message.includes('timeout') ? 'Yes' : 'No'}`);
  } finally {
    await browser.close();
  }
}

// 実行
testDashboardAccess().catch(console.error);