const { chromium, devices } = require('@playwright/test');

(async () => {
  console.log('実際の顧客ページでのスライダーテストを開始します...');

  const iPhone14 = devices['iPhone 14'];
  const browser = await chromium.launch({
    headless: false,
    slowMo: 2000
  });

  const context = await browser.newContext({
    ...iPhone14,
    hasTouch: true,
    isMobile: true
  });

  const page = await context.newPage();

  try {
    console.log('📱 顧客ページに直接アクセス');

    // 複数のURL候補でテスト
    const testUrls = [
      'http://172.17.161.101:9090/customer/1',
      'http://172.17.161.101:9090/customer/new',
      'http://172.17.161.101:9090/dashboard'
    ];

    let successUrl = null;
    for (const url of testUrls) {
      try {
        console.log(`🔄 ${url} にアクセス中...`);
        await page.goto(url);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const currentUrl = page.url();
        console.log(`実際のURL: ${currentUrl}`);

        // 認証ページにリダイレクトされていない場合は成功
        if (!currentUrl.includes('signin') && !currentUrl.includes('auth')) {
          successUrl = url;
          console.log(`✅ ${url} へのアクセス成功`);
          break;
        } else {
          console.log(`❌ ${url} は認証が必要`);
        }
      } catch (e) {
        console.log(`❌ ${url} へのアクセス失敗: ${e.message}`);
      }
    }

    if (!successUrl) {
      console.log('🔓 全ての顧客ページで認証が必要 - テストページで代替テスト');
      await page.goto('http://172.17.161.101:9090/test');
      await page.waitForLoadState('networkidle');
    }

    await page.screenshot({ path: '.playwright-mcp/customer-01-page-loaded.png' });

    console.log('🔍 履歴タブを探す');
    const historySelectors = [
      'text=履歴',
      '[role="tab"]:has-text("履歴")',
      'button:has-text("履歴")',
      '.tab:has-text("履歴")',
      '[data-testid*="history"]'
    ];

    let historyTab = null;
    for (const selector of historySelectors) {
      try {
        historyTab = await page.locator(selector).first();
        if (await historyTab.isVisible({ timeout: 2000 })) {
          console.log(`✅ 履歴タブを発見: ${selector}`);
          await historyTab.click();
          await page.waitForTimeout(2000);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    await page.screenshot({ path: '.playwright-mcp/customer-02-history-tab.png' });

    console.log('🔍 生成結果や詳細ボタンを探す');
    const detailSelectors = [
      'button:has-text("詳細")',
      'button:has-text("View")',
      'button:has-text("見る")',
      '.generation-result',
      '.history-item',
      '[data-testid*="detail"]',
      '[data-testid*="generation"]'
    ];

    let detailElement = null;
    for (const selector of detailSelectors) {
      try {
        const elements = await page.locator(selector).all();
        if (elements.length > 0) {
          detailElement = elements[0];
          console.log(`✅ 詳細要素を発見: ${selector} (${elements.length}個)`);
          await detailElement.click();
          await page.waitForTimeout(2000);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    await page.screenshot({ path: '.playwright-mcp/customer-03-detail-opened.png' });

    console.log('🔍 ImageComparisonコンポーネントを詳細に探索');

    // 改善されたImageComparisonの特徴を探す
    const improvementSelectors = [
      '.border-blue-500', // 青いボーダー（改善した特徴）
      '.w-12.h-12', // モバイル用大きなハンドル
      '[class*="w-12"][class*="h-12"]',
      'div:has-text("スライダーをタッチして")', // モバイル専用説明文
      '.bg-blue-500', // 青い視覚的インジケータ
      '[style*="clipPath"]' // clipPath使用の要素
    ];

    let foundImprovement = false;
    for (const selector of improvementSelectors) {
      try {
        const elements = await page.locator(selector).all();
        if (elements.length > 0) {
          console.log(`✅ 改善要素を発見: ${selector} (${elements.length}個)`);
          foundImprovement = true;

          // 最初の要素の詳細を確認
          const firstElement = elements[0];
          const isVisible = await firstElement.isVisible();
          const boundingBox = await firstElement.boundingBox();

          console.log(`  - 可視性: ${isVisible}`);
          if (boundingBox) {
            console.log(`  - サイズ: ${boundingBox.width}x${boundingBox.height}`);
            console.log(`  - 位置: x=${boundingBox.x}, y=${boundingBox.y}`);
          }
        }
      } catch (e) {
        continue;
      }
    }

    if (foundImprovement) {
      console.log('✅ 改善されたコンポーネントが動作中！');
    } else {
      console.log('⚠️ 改善要素が見つかりません - 古いコンポーネントかも');
    }

    console.log('👆 タッチテストを実行');

    // スライダーコンテナを探してタッチテスト
    const sliderContainers = await page.locator('[class*="relative"][class*="cursor-col-resize"], .touch-none').all();

    if (sliderContainers.length > 0) {
      const container = sliderContainers[0];
      const containerBox = await container.boundingBox();

      if (containerBox) {
        console.log(`スライダーコンテナ発見: ${containerBox.width}x${containerBox.height}`);

        // 左、中央、右でタッチテスト
        const leftX = containerBox.x + containerBox.width * 0.2;
        const centerX = containerBox.x + containerBox.width * 0.5;
        const rightX = containerBox.x + containerBox.width * 0.8;
        const y = containerBox.y + containerBox.height * 0.5;

        console.log('左側タッチ');
        await page.touchscreen.tap(leftX, y);
        await page.waitForTimeout(1000);
        await page.screenshot({ path: '.playwright-mcp/customer-04-left-touch.png' });

        console.log('中央タッチ');
        await page.touchscreen.tap(centerX, y);
        await page.waitForTimeout(1000);
        await page.screenshot({ path: '.playwright-mcp/customer-05-center-touch.png' });

        console.log('右側タッチ');
        await page.touchscreen.tap(rightX, y);
        await page.waitForTimeout(1000);
        await page.screenshot({ path: '.playwright-mcp/customer-06-right-touch.png' });

        console.log('✅ タッチテスト完了');
      }
    }

    // 最終状態をキャプチャ
    await page.screenshot({ path: '.playwright-mcp/customer-07-final-state.png' });

    console.log('📊 テスト結果サマリー:');
    console.log(`✅ アクセス成功URL: ${successUrl || 'テストページ'}`);
    console.log(`✅ 改善要素発見: ${foundImprovement ? 'はい' : 'いいえ'}`);
    console.log(`✅ スライダーコンテナ数: ${sliderContainers.length}`);

  } catch (error) {
    console.error('❌ テスト中にエラー:', error);
    await page.screenshot({ path: '.playwright-mcp/customer-error.png' });
  } finally {
    console.log('🔍 ブラウザを20秒間開いておきます');
    await page.waitForTimeout(20000);
    await browser.close();
    console.log('🏁 テスト終了');
  }
})();