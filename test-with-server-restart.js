const { chromium, devices } = require('@playwright/test');

(async () => {
  console.log('🔄 サーバー再起動後のモバイルテストを開始します...');

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
    // コンソールログを監視
    page.on('console', msg => console.log('🔍 Browser:', msg.text()));
    page.on('pageerror', error => console.error('❌ Page Error:', error.message));

    console.log('📱 新しいサーバーのテストページにアクセス');
    await page.goto('http://localhost:3000/test');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    await page.screenshot({ path: '.playwright-mcp/server-restart-01-page.png' });

    // ページの内容を確認
    const pageTitle = await page.title();
    console.log('ページタイトル:', pageTitle);

    const mainHeading = await page.locator('h1').textContent();
    console.log('メインヘッディング:', mainHeading);

    console.log('🔍 改善されたImageComparisonを詳細に探索');

    // 改善されたコンポーネントの特徴を段階的にチェック
    const detailedChecks = [
      {
        name: 'ImageComparisonコンポーネント',
        selectors: ['[data-testid="image-comparison"]', '.image-comparison', 'div:has-text("モバイル対応スライダー")']
      },
      {
        name: '青いボーダー（border-blue-500）',
        selectors: ['.border-blue-500', '[class*="border-blue"]']
      },
      {
        name: 'モバイル用ハンドル（w-12 h-12）',
        selectors: ['.w-12.h-12', '[class*="w-12"][class*="h-12"]', '.w-12']
      },
      {
        name: 'タッチ説明文',
        selectors: ['text=スライダーをタッチして', 'text=タッチして左右に', 'p:has-text("タッチ")']
      },
      {
        name: '青い視覚インジケータ',
        selectors: ['.bg-blue-500', '[class*="bg-blue"]']
      },
      {
        name: 'タッチ無効化',
        selectors: ['.touch-none', '[class*="touch-none"]']
      },
      {
        name: 'clipPath使用要素',
        selectors: ['[style*="clipPath"]', '[style*="clip-path"]']
      }
    ];

    let foundComponents = [];

    for (const check of detailedChecks) {
      console.log(`\n🔍 ${check.name}を探索中...`);

      let found = false;
      for (const selector of check.selectors) {
        try {
          const elements = await page.locator(selector).all();
          if (elements.length > 0) {
            console.log(`  ✅ ${selector}: ${elements.length}個発見`);
            found = true;

            // 詳細情報を取得
            for (let i = 0; i < Math.min(elements.length, 3); i++) {
              const element = elements[i];
              const isVisible = await element.isVisible();
              const bbox = await element.boundingBox();
              console.log(`    要素${i + 1}: visible=${isVisible}, size=${bbox ? `${bbox.width}x${bbox.height}` : 'N/A'}`);
            }
            break;
          }
        } catch (e) {
          // セレクターエラーは無視
        }
      }

      if (found) {
        foundComponents.push(check.name);
      } else {
        console.log(`  ❌ ${check.name}: 見つからず`);
      }
    }

    await page.screenshot({ path: '.playwright-mcp/server-restart-02-analysis.png' });

    console.log('\n📋 DOM構造の詳細確認');

    // CardやCardContentなどのshadcn/uiコンポーネントを確認
    const shadcnElements = await page.locator('[class*="card"], [class*="Card"]').all();
    console.log(`Card系要素: ${shadcnElements.length}個`);

    // スタイル属性を持つ要素を確認
    const styledElements = await page.locator('[style*="clip"], [style*="left"], [style*="background"]').all();
    console.log(`style属性付き要素: ${styledElements.length}個`);

    // 実際にタッチ操作可能な要素を探す
    const interactiveElements = await page.locator('[class*="cursor"], button, [role="button"]').all();
    console.log(`インタラクティブ要素: ${interactiveElements.length}個`);

    console.log('\n👆 利用可能な要素でタッチテスト実行');

    if (interactiveElements.length > 0) {
      for (let i = 0; i < Math.min(interactiveElements.length, 3); i++) {
        const element = interactiveElements[i];
        const bbox = await element.boundingBox();

        if (bbox && bbox.width > 10 && bbox.height > 10) {
          console.log(`要素 ${i + 1} でタッチテスト (${bbox.width}x${bbox.height})`);

          const centerX = bbox.x + bbox.width / 2;
          const centerY = bbox.y + bbox.height / 2;

          await page.touchscreen.tap(centerX, centerY);
          await page.waitForTimeout(1000);
          await page.screenshot({ path: `.playwright-mcp/server-restart-03-touch-${i + 1}.png` });
        }
      }
    }

    // 最終スクリーンショット
    await page.screenshot({ path: '.playwright-mcp/server-restart-04-final.png' });

    console.log('\n📊 === サーバー再起動後テスト結果 ===');
    console.log(`✅ 発見されたコンポーネント (${foundComponents.length}/${detailedChecks.length}):`);
    foundComponents.forEach(comp => console.log(`  - ${comp}`));

    console.log('\n📈 改善状況:');
    if (foundComponents.length > 0) {
      console.log('✅ 改善されたコンポーネントが部分的に動作中');
    } else {
      console.log('⚠️ 改善されたコンポーネントが見つからない - 手動確認が必要');
    }

  } catch (error) {
    console.error('❌ テストエラー:', error);
    await page.screenshot({ path: '.playwright-mcp/server-restart-error.png' });
  } finally {
    console.log('\n⏰ 手動確認のため30秒間ブラウザを開いておきます');
    await page.waitForTimeout(30000);
    await browser.close();
    console.log('🏁 テスト完了');
  }
})();