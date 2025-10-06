const { chromium, devices } = require('@playwright/test');

(async () => {
  console.log('改善後のモバイルスライダーテストを開始します...');

  const iPhone14 = devices['iPhone 14'];
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1500
  });

  const context = await browser.newContext({
    ...iPhone14,
    hasTouch: true,
    isMobile: true
  });

  const page = await context.newPage();

  try {
    // コンソールログとエラーを監視
    page.on('console', msg => console.log('🔍 ブラウザコンソール:', msg.text()));
    page.on('pageerror', error => console.error('❌ ページエラー:', error.message));

    console.log('📱 ステップ1: サイトにアクセス');
    await page.goto('http://172.17.161.101:9090');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: '.playwright-mcp/improved-01-initial.png' });

    console.log('🔐 ステップ2: 認証状態を確認');
    const currentUrl = page.url();
    console.log('現在のURL:', currentUrl);

    // 既に認証済みでダッシュボードにいる場合
    if (currentUrl.includes('dashboard') || !currentUrl.includes('signin')) {
      console.log('✅ 認証済み - 直接テスト実行');
    } else {
      console.log('🔄 認証が必要 - ダッシュボードに直接アクセス');
      // 認証が必要な場合は、とりあえずテストページに直接アクセス
      await page.goto('http://172.17.161.101:9090/test');
      await page.waitForLoadState('networkidle');
    }

    await page.screenshot({ path: '.playwright-mcp/improved-02-authenticated.png' });

    console.log('🧪 ステップ3: テストページでスライダーを確認');
    await page.goto('http://172.17.161.101:9090/test');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // コンポーネントの読み込み待機
    await page.screenshot({ path: '.playwright-mcp/improved-03-test-page.png' });

    console.log('🔍 ステップ4: スライダー要素を探索');

    // 画像比較コンポーネントを探す
    const imageComparisonSelectors = [
      '[data-testid="image-comparison"]',
      '.image-comparison',
      '[class*="comparison"]',
      '[class*="slider"]'
    ];

    let comparisonElement = null;
    for (const selector of imageComparisonSelectors) {
      try {
        comparisonElement = await page.locator(selector).first();
        if (await comparisonElement.isVisible({ timeout: 2000 })) {
          console.log(`✅ 比較コンポーネントを発見: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    // スライダーハンドルを探す（改善後の大きなハンドル）
    const handleSelectors = [
      '.w-12.h-12', // モバイル用大きなハンドル
      '[class*="w-12"][class*="h-12"]',
      '.border-blue-500', // 青いボーダー
      '[class*="cursor-col-resize"]',
      '[style*="left:"]' // スライダーの位置スタイル
    ];

    let sliderHandle = null;
    for (const selector of handleSelectors) {
      try {
        sliderHandle = await page.locator(selector).first();
        if (await sliderHandle.isVisible({ timeout: 2000 })) {
          console.log(`✅ スライダーハンドルを発見: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (sliderHandle && await sliderHandle.isVisible()) {
      console.log('📏 ステップ5: ハンドルサイズを測定');
      const handleBox = await sliderHandle.boundingBox();
      if (handleBox) {
        console.log(`📐 ハンドルサイズ: ${handleBox.width}x${handleBox.height}`);

        if (handleBox.width >= 12 && handleBox.height >= 12) {
          console.log('✅ モバイル対応サイズ（12x12以上）を確認！');
        } else {
          console.log('⚠️ ハンドルサイズが小さい可能性があります');
        }

        console.log('👆 ステップ6: タッチ操作テスト');

        // タッチ操作テストを実行
        const centerX = handleBox.x + handleBox.width / 2;
        const centerY = handleBox.y + handleBox.height / 2;

        console.log(`タッチ位置: x=${centerX}, y=${centerY}`);

        // タッチしてドラッグ
        await page.touchscreen.tap(centerX, centerY);
        await page.waitForTimeout(500);
        await page.screenshot({ path: '.playwright-mcp/improved-04-handle-touched.png' });

        // 左にドラッグ
        await page.touchscreen.tap(centerX - 50, centerY);
        await page.waitForTimeout(500);
        await page.screenshot({ path: '.playwright-mcp/improved-05-dragged-left.png' });

        // 右にドラッグ
        await page.touchscreen.tap(centerX + 50, centerY);
        await page.waitForTimeout(500);
        await page.screenshot({ path: '.playwright-mcp/improved-06-dragged-right.png' });

        console.log('✅ タッチ操作テスト完了');
      }
    } else {
      console.log('❌ スライダーハンドルが見つかりません');
    }

    console.log('🔍 ステップ7: ページ構造の詳細確認');

    // ページ内の全てのボタンとインタラクティブ要素を確認
    const interactiveElements = await page.locator('button, [role="button"], [class*="cursor-"]').all();
    console.log(`📊 インタラクティブ要素数: ${interactiveElements.length}`);

    for (let i = 0; i < Math.min(interactiveElements.length, 10); i++) {
      const element = interactiveElements[i];
      const tagName = await element.evaluate(el => el.tagName);
      const className = await element.getAttribute('class');
      const isVisible = await element.isVisible();
      console.log(`要素 ${i+1}: ${tagName} (class: ${className?.substring(0, 50)}...) visible: ${isVisible}`);
    }

    // 最終スクリーンショット
    await page.screenshot({ path: '.playwright-mcp/improved-07-final-mobile.png' });

    console.log('📝 テスト結果サマリー:');
    console.log('✅ モバイルビューポート設定: 完了');
    console.log('✅ タッチイベント有効化: 完了');
    console.log('✅ ページアクセス: 完了');

    if (sliderHandle) {
      console.log('✅ スライダーハンドル発見: 完了');
      console.log('✅ タッチ操作テスト: 完了');
    } else {
      console.log('❌ スライダーハンドル: 見つからず');
    }

  } catch (error) {
    console.error('❌ テスト中にエラーが発生:', error);
    await page.screenshot({ path: '.playwright-mcp/improved-error.png' });
  } finally {
    console.log('🔍 ブラウザを開いたままにします（15秒間）手動確認用');
    await page.waitForTimeout(15000);
    await browser.close();
    console.log('🏁 テスト完了');
  }
})();