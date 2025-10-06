const { chromium } = require('playwright');

(async () => {
  console.log('🚀 履歴タブ表示確認テスト開始');

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
    // 1. アプリケーションへのアクセス
    console.log('📱 アプリケーションにアクセス中...');
    await page.goto('http://172.17.161.101:9090');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: '.playwright-mcp/01-initial-app-load.png', fullPage: true });

    // 2. 認証が必要な場合はスキップして直接顧客ページへ
    console.log('🏠 顧客ページに直接アクセス...');
    await page.goto('http://172.17.161.101:9090/customer/e0b351e2-5633-4cb3-8db8-5efc217b5452');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '.playwright-mcp/02-customer-page-loaded.png', fullPage: true });

    // 3. 履歴タブをクリック
    console.log('📋 履歴タブをクリック...');
    const historyTabSelector = '[data-testid="history-tab"], [value="history"], button:has-text("履歴"), [role="tab"]:has-text("履歴")';

    try {
      await page.waitForSelector(historyTabSelector, { timeout: 5000 });
      await page.click(historyTabSelector);
      console.log('✅ 履歴タブクリック成功');
    } catch (error) {
      console.log('⚠️ 履歴タブが見つからない、手動検索中...');
      // タブを手動で探す
      const tabs = await page.locator('[role="tab"], button').all();
      for (const tab of tabs) {
        const text = await tab.textContent();
        if (text && text.includes('履歴')) {
          await tab.click();
          console.log('✅ 履歴タブを手動で発見してクリック');
          break;
        }
      }
    }

    await page.waitForTimeout(2000);
    await page.screenshot({ path: '.playwright-mcp/03-history-tab-clicked.png', fullPage: true });

    // 4. 履歴コンテンツの確認
    console.log('🔍 履歴コンテンツの確認中...');

    // GenerationHistoryコンポーネントの存在確認
    const generationHistoryExists = await page.locator('[data-testid="generation-history"], .generation-history').count() > 0;
    console.log(`📊 GenerationHistoryコンポーネント存在: ${generationHistoryExists}`);

    // 履歴アイテムの確認
    const historyItems = await page.locator('[data-testid="history-item"], .history-item, .generation-item').count();
    console.log(`📝 履歴アイテム数: ${historyItems}`);

    // 画像の存在確認
    const generatedImages = await page.locator('img[src*="generated"], img[src*="supabase"]').count();
    console.log(`🖼️ 生成画像数: ${generatedImages}`);

    // 詳細な要素を探す
    console.log('🔍 詳細な要素スキャン中...');
    const allImages = await page.locator('img').count();
    const allButtons = await page.locator('button').count();
    const allDivs = await page.locator('div').count();

    console.log(`📊 ページ内要素統計:`);
    console.log(`  - 全画像数: ${allImages}`);
    console.log(`  - 全ボタン数: ${allButtons}`);
    console.log(`  - 全div数: ${allDivs}`);

    await page.screenshot({ path: '.playwright-mcp/04-history-content-analysis.png', fullPage: true });

    // 5. コンソールエラーの確認
    console.log('💻 ブラウザコンソールログの確認...');
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`❌ コンソールエラー: ${msg.text()}`);
      } else if (msg.type() === 'log') {
        console.log(`📝 コンソールログ: ${msg.text()}`);
      }
    });

    // 6. 何も表示されていない場合、生成から履歴表示のフローをテスト
    if (historyItems === 0) {
      console.log('⚠️ 履歴アイテムが見つからない。新しい生成テストを実行します...');

      // 生成タブに戻る
      await page.click('[value="generation"], button:has-text("生成"), [role="tab"]:has-text("生成")');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: '.playwright-mcp/05-back-to-generation-tab.png', fullPage: true });

      // 画像アップロード（既存の画像がある場合はスキップ）
      const existingImage = await page.locator('img[src*="original"], img[src*="uploaded"]').count();
      if (existingImage === 0) {
        console.log('📤 テスト画像のアップロード...');
        const fileInput = page.locator('input[type="file"]');
        if (await fileInput.count() > 0) {
          await fileInput.setInputFiles(['test-base64-house-with-blue-walls.png']); // より適切なテスト画像を使用
          await page.waitForTimeout(2000);
        }
      }

      // 生成ボタンをクリック
      console.log('🎨 画像生成実行...');
      const generateButton = page.locator('button:has-text("生成"), button:has-text("実行"), [data-testid="generate-button"]');
      if (await generateButton.count() > 0) {
        await generateButton.click();
        console.log('✅ 生成ボタンクリック完了');

        // 生成完了まで待機
        await page.waitForTimeout(20000);
        await page.screenshot({ path: '.playwright-mcp/06-after-generation.png', fullPage: true });

        // 自動的に履歴タブに移動するかチェック
        await page.waitForTimeout(2000);
        await page.screenshot({ path: '.playwright-mcp/07-after-generation-navigation.png', fullPage: true });

        // 履歴タブの内容を再確認
        const newHistoryItems = await page.locator('[data-testid="history-item"], .history-item, .generation-item').count();
        console.log(`📝 生成後の履歴アイテム数: ${newHistoryItems}`);
      }
    }

    // 7. 最終状態のスクリーンショット
    await page.screenshot({ path: '.playwright-mcp/08-final-history-verification.png', fullPage: true });

    console.log('✅ 履歴タブ確認テスト完了');

  } catch (error) {
    console.error('❌ テスト実行エラー:', error);
    await page.screenshot({ path: '.playwright-mcp/error-history-test.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();