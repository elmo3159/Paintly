const { chromium } = require('playwright');

async function simpleColorTest() {
  console.log('🎯 シンプルカラー選択テスト開始');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });

  const page = await context.newPage();

  // コンソールエラーを監視
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.log(`❌ Console Error: ${msg.text()}`);
    }
  });

  page.on('pageerror', error => {
    errors.push(error.message);
    console.log(`❌ Page Error: ${error.message}`);
  });

  try {
    console.log('📍 ダッシュボードアクセス');
    await page.goto('http://172.17.161.101:9094/dashboard', {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });

    // 少し待機
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'simple-test-01-dashboard.png' });

    console.log('📍 サイドバーで顧客ページ探索');

    // より一般的なセレクターで顧客リンクを探す
    const linkSelectors = [
      'a[href*="/customer"]',
      'button:has-text("顧客")',
      '.sidebar a',
      'nav a',
      '[data-testid*="customer"]'
    ];

    let customerLink = null;
    for (const selector of linkSelectors) {
      const links = await page.locator(selector).all();
      if (links.length > 0) {
        customerLink = links[0];
        console.log(`✅ 顧客リンク発見: ${selector}`);
        break;
      }
    }

    if (!customerLink) {
      console.log('⚠️  既存顧客ページなし、新規作成を試行');

      // 新規作成ボタンを探す
      const createSelectors = [
        'button:has-text("＋")',
        'button:has-text("新規")',
        'button[aria-label*="追加"]',
        '.add-button'
      ];

      for (const selector of createSelectors) {
        const button = page.locator(selector).first();
        if (await button.isVisible()) {
          console.log(`✅ 新規作成ボタンクリック: ${selector}`);
          await button.click();
          await page.waitForTimeout(2000);
          break;
        }
      }
    } else {
      console.log('✅ 既存顧客ページクリック');
      await customerLink.click();
      await page.waitForTimeout(2000);
    }

    await page.screenshot({ path: 'simple-test-02-customer-page.png' });

    console.log('📍 カラーセレクター検索');

    // より一般的なカラーセレクター検索
    const colorSelectors = [
      'select',
      'input[type="color"]',
      '.color-selector',
      '[class*="color"]',
      'button[class*="color"]'
    ];

    const allSelectors = await page.locator('select, button, input').all();
    console.log(`💡 ページ内の対話的要素: ${allSelectors.length}個`);

    let foundColorSelector = false;
    for (let i = 0; i < Math.min(allSelectors.length, 10); i++) {
      const element = allSelectors[i];
      const tagName = await element.evaluate(el => el.tagName);
      const classes = await element.getAttribute('class') || '';
      const id = await element.getAttribute('id') || '';

      console.log(`  ${i + 1}. ${tagName} class="${classes}" id="${id}"`);

      // カラー関連のclass/idを含む要素を探す
      if (classes.includes('color') || id.includes('color') ||
          classes.includes('壁') || classes.includes('wall')) {
        console.log(`🎨 カラー関連要素発見!`);

        try {
          await element.click();
          await page.waitForTimeout(1000);
          foundColorSelector = true;

          await page.screenshot({ path: 'simple-test-03-color-clicked.png' });
          break;
        } catch (e) {
          console.log(`  ⚠️  クリック失敗: ${e.message}`);
        }
      }
    }

    if (!foundColorSelector) {
      console.log('❌ カラーセレクターが見つかりませんでした');

      // selectタグを全て試す
      const selectElements = await page.locator('select').all();
      console.log(`📊 Select要素: ${selectElements.length}個`);

      for (let i = 0; i < selectElements.length; i++) {
        const select = selectElements[i];
        console.log(`🧪 Select ${i + 1} をテスト`);

        try {
          await select.click();
          await page.waitForTimeout(500);

          const options = await select.locator('option').all();
          console.log(`  オプション数: ${options.length}`);

          if (options.length > 1) {
            // オプション内容を確認
            for (let j = 0; j < Math.min(options.length, 5); j++) {
              const text = await options[j].textContent();
              console.log(`    ${j + 1}. "${text}"`);
            }

            // 2番目のオプションを選択してテスト
            await options[1].click();
            await page.waitForTimeout(1000);

            await page.screenshot({ path: `simple-test-04-select-${i + 1}-tested.png` });
          }
        } catch (e) {
          console.log(`  ⚠️  Select ${i + 1} テスト失敗: ${e.message}`);
        }
      }
    }

    console.log('📍 最終状態確認');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'simple-test-05-final.png' });

    console.log('\n📊 === テスト結果 ===');
    console.log(`❌ 検出されたエラー数: ${errors.length}`);

    if (errors.length > 0) {
      console.log('❌ エラー詳細:');
      errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    } else {
      console.log('✅ エラーは検出されませんでした');
    }

    const onColorErrors = errors.filter(e => e.includes('onColorSelect') || e.includes('colorSelect'));
    console.log(`🎯 onColorSelect関連エラー: ${onColorErrors.length}個`);

  } catch (error) {
    console.error('❌ テスト実行エラー:', error.message);
    await page.screenshot({ path: 'simple-test-error.png' });
  } finally {
    await browser.close();
    console.log('🏁 シンプルテスト完了');
  }
}

// テスト実行
simpleColorTest().catch(console.error);