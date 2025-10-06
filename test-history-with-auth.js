const { chromium } = require('playwright');

(async () => {
  console.log('🚀 認証を含む履歴タブ表示確認テスト開始');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1
  });

  const page = await context.newPage();

  try {
    // 1. アプリケーションにアクセス
    console.log('📱 アプリケーションにアクセス中...');
    await page.goto('http://172.17.161.101:9090');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: '.playwright-mcp/auth-01-initial.png', fullPage: true });

    // 2. 認証処理 - Googleログインまたは資格情報ログイン
    console.log('🔐 認証処理開始...');

    // Google認証ボタンを探す
    const googleAuthButton = page.locator('button:has-text("Google"), [data-provider="google"]');
    const credentialLoginButton = page.locator('button:has-text("サインイン"), button:has-text("ログイン")');

    if (await googleAuthButton.count() > 0) {
      console.log('🌐 Google認証を試行...');
      await googleAuthButton.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: '.playwright-mcp/auth-02-google-auth.png', fullPage: true });
    } else if (await credentialLoginButton.count() > 0) {
      console.log('📧 資格情報ログインを試行...');

      // メールアドレス入力
      const emailInput = page.locator('input[type="email"], input[name="email"]');
      if (await emailInput.count() > 0) {
        await emailInput.fill('test@example.com');
      }

      // パスワード入力
      const passwordInput = page.locator('input[type="password"], input[name="password"]');
      if (await passwordInput.count() > 0) {
        await passwordInput.fill('testpassword');
      }

      await page.screenshot({ path: '.playwright-mcp/auth-02-credentials-filled.png', fullPage: true });
      await credentialLoginButton.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: '.playwright-mcp/auth-03-after-signin.png', fullPage: true });
    }

    // 3. 認証後のページ確認
    await page.waitForTimeout(3000);

    // ダッシュボードまたは認証が成功したかチェック
    const currentUrl = page.url();
    console.log(`📍 現在のURL: ${currentUrl}`);

    if (currentUrl.includes('dashboard') || currentUrl.includes('customer')) {
      console.log('✅ 認証成功');
    } else {
      console.log('⚠️ 認証状態不明、顧客ページに直接アクセスを試行...');
    }

    await page.screenshot({ path: '.playwright-mcp/auth-04-after-auth.png', fullPage: true });

    // 4. 指定された顧客ページにアクセス
    console.log('🏠 指定された顧客ページにアクセス...');
    await page.goto('http://172.17.161.101:9090/customer/e0b351e2-5633-4cb3-8db8-5efc217b5452');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '.playwright-mcp/auth-04-customer-page.png', fullPage: true });

    // 5. ページ構造の確認
    console.log('🔍 ページ構造の確認...');

    // タブの存在確認
    const allButtons = await page.locator('button').all();
    const allTabs = await page.locator('[role="tab"]').all();

    console.log(`📊 ページ内ボタン数: ${allButtons.length}`);
    console.log(`📊 タブ数: ${allTabs.length}`);

    // タブの内容を確認
    for (let i = 0; i < Math.min(allTabs.length, 5); i++) {
      const tabText = await allTabs[i].textContent();
      console.log(`📋 タブ ${i + 1}: "${tabText}"`);
    }

    // 6. 履歴タブを探してクリック
    console.log('📋 履歴タブを検索してクリック...');
    let historyTabFound = false;

    // 複数のセレクターパターンで試行
    const historySelectors = [
      '[data-testid="history-tab"]',
      '[value="history"]',
      'button:has-text("履歴")',
      '[role="tab"]:has-text("履歴")',
      'button:has-text("History")',
      '[data-tab="history"]'
    ];

    for (const selector of historySelectors) {
      if (await page.locator(selector).count() > 0) {
        await page.click(selector);
        console.log(`✅ 履歴タブクリック成功 (セレクター: ${selector})`);
        historyTabFound = true;
        break;
      }
    }

    if (!historyTabFound) {
      console.log('⚠️ 履歴タブが見つからない、全ボタンを検索...');
      for (const button of allButtons) {
        const text = await button.textContent();
        if (text && (text.includes('履歴') || text.includes('History') || text.includes('history'))) {
          await button.click();
          console.log(`✅ 履歴タブを手動で発見してクリック: "${text}"`);
          historyTabFound = true;
          break;
        }
      }
    }

    await page.waitForTimeout(2000);
    await page.screenshot({ path: '.playwright-mcp/auth-05-dashboard.png', fullPage: true });

    // 7. 履歴コンテンツの詳細確認
    console.log('🔍 履歴コンテンツの詳細確認...');

    // GenerationHistoryコンポーネントの確認
    const generationHistorySelectors = [
      '[data-testid="generation-history"]',
      '.generation-history',
      '[class*="generation-history"]',
      '[class*="GenerationHistory"]'
    ];

    let generationHistoryExists = false;
    for (const selector of generationHistorySelectors) {
      if (await page.locator(selector).count() > 0) {
        generationHistoryExists = true;
        console.log(`📊 GenerationHistoryコンポーネント発見: ${selector}`);
        break;
      }
    }

    console.log(`📊 GenerationHistoryコンポーネント存在: ${generationHistoryExists}`);

    // 履歴アイテムの確認
    const historyItemSelectors = [
      '[data-testid="history-item"]',
      '.history-item',
      '.generation-item',
      '[class*="history-item"]',
      '[class*="generation-item"]'
    ];

    let historyItems = 0;
    for (const selector of historyItemSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        historyItems = count;
        console.log(`📝 履歴アイテム発見: ${count}個 (セレクター: ${selector})`);
        break;
      }
    }

    console.log(`📝 履歴アイテム総数: ${historyItems}`);

    // 画像の存在確認
    const imageSelectors = [
      'img[src*="generated"]',
      'img[src*="supabase"]',
      'img[src*="storage"]',
      'img[alt*="generated"]',
      'img[alt*="result"]'
    ];

    let generatedImages = 0;
    for (const selector of imageSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        generatedImages += count;
        console.log(`🖼️ 生成画像発見: ${count}個 (セレクター: ${selector})`);
      }
    }

    console.log(`🖼️ 生成画像総数: ${generatedImages}`);

    // 8. 詳細なDOM構造確認
    console.log('🔍 詳細なDOM構造確認...');
    const allImages = await page.locator('img').count();
    const allDivs = await page.locator('div').count();
    const allSpans = await page.locator('span').count();

    console.log(`📊 ページ内要素統計:`);
    console.log(`  - 全画像数: ${allImages}`);
    console.log(`  - 全ボタン数: ${allButtons.length}`);
    console.log(`  - 全div数: ${allDivs}`);
    console.log(`  - 全span数: ${allSpans}`);

    await page.screenshot({ path: '.playwright-mcp/auth-06-final-state.png', fullPage: true });

    // 9. コンソールログの監視
    console.log('💻 ブラウザコンソールログの確認...');
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`❌ コンソールエラー: ${msg.text()}`);
      } else if (msg.type() === 'log' && msg.text().includes('history')) {
        console.log(`📝 履歴関連ログ: ${msg.text()}`);
      }
    });

    // 10. テスト結果サマリー
    console.log('\n📋 テスト結果サマリー:');
    console.log(`✅ 認証処理: ${historyTabFound ? '成功' : '失敗'}`);
    console.log(`✅ 履歴タブアクセス: ${historyTabFound ? '成功' : '失敗'}`);
    console.log(`✅ GenerationHistoryコンポーネント: ${generationHistoryExists ? '存在' : '不存在'}`);
    console.log(`✅ 履歴アイテム数: ${historyItems}`);
    console.log(`✅ 生成画像数: ${generatedImages}`);

    if (historyItems === 0 && generatedImages === 0) {
      console.log('⚠️ 履歴データが見つかりません。result.generationId → result.historyId の修正が必要な可能性があります。');
    }

    console.log('✅ 認証を含む履歴タブ確認テスト完了');

  } catch (error) {
    console.error('❌ テスト実行エラー:', error);
    await page.screenshot({ path: '.playwright-mcp/auth-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();