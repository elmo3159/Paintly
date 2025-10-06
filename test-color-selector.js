const { chromium } = require('playwright');

async function testColorSelector() {
  console.log('🧪 カラー選択機能テスト開始');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000 // 1秒遅延でデバッグしやすく
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });

  const page = await context.newPage();

  // コンソールログを監視
  const consoleMessages = [];
  const consoleErrors = [];

  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    });

    if (msg.type() === 'error') {
      consoleErrors.push({
        text: msg.text(),
        timestamp: new Date().toISOString()
      });
    }

    console.log(`🖥️  Console [${msg.type()}]: ${msg.text()}`);
  });

  // エラー監視
  page.on('pageerror', error => {
    console.error('❌ Page Error:', error.message);
    consoleErrors.push({
      text: error.message,
      timestamp: new Date().toISOString(),
      type: 'page-error'
    });
  });

  try {
    console.log('📍 Step 1: ダッシュボードにアクセス');
    await page.goto('http://172.17.161.101:9094/dashboard', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.screenshot({ path: 'test-color-01-dashboard.png' });
    console.log('✅ ダッシュボード読み込み完了');

    console.log('📍 Step 2: 顧客ページリストを確認');
    // サイドバーで顧客ページを探す
    const customerPages = await page.locator('[data-testid*="customer"], .customer-page, a[href*="/customer"]').all();

    if (customerPages.length === 0) {
      console.log('➕ 新規顧客ページを作成');
      const newPageButton = page.locator('button:has-text("＋"), button[aria-label*="新規"], button:has-text("新規")').first();
      if (await newPageButton.isVisible()) {
        await newPageButton.click();
        await page.waitForTimeout(2000);
      } else {
        console.log('⚠️  新規顧客ページボタンが見つかりません');
      }
    } else {
      console.log(`✅ ${customerPages.length}個の顧客ページが見つかりました`);
      // 最初の顧客ページをクリック
      await customerPages[0].click();
      await page.waitForTimeout(2000);
    }

    await page.screenshot({ path: 'test-color-02-customer-page.png' });

    console.log('📍 Step 3: 壁の色選択ドロップダウンを確認');

    // 壁の色セレクターを探す（複数の可能性を考慮）
    const wallColorSelectors = [
      '[data-testid="wall-color-selector"]',
      'select[name*="wall"], select[id*="wall"]',
      '.wall-color select',
      'label:has-text("壁") + select',
      'label:has-text("壁") + div select',
      'div:has-text("壁の色") select',
      'div:has-text("壁") select'
    ];

    let wallColorSelector = null;
    for (const selector of wallColorSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible()) {
        wallColorSelector = element;
        console.log(`✅ 壁の色セレクター発見: ${selector}`);
        break;
      }
    }

    if (!wallColorSelector) {
      console.log('❌ 壁の色セレクターが見つかりません');
      console.log('📊 ページの構造を確認します...');

      // ページの構造を調査
      const formElements = await page.locator('select, input, button').all();
      console.log(`見つかったフォーム要素: ${formElements.length}個`);

      for (let i = 0; i < Math.min(formElements.length, 10); i++) {
        const element = formElements[i];
        const tagName = await element.evaluate(el => el.tagName);
        const id = await element.getAttribute('id') || '';
        const name = await element.getAttribute('name') || '';
        const classes = await element.getAttribute('class') || '';
        console.log(`  ${i + 1}. ${tagName} id="${id}" name="${name}" class="${classes}"`);
      }

      await page.screenshot({ path: 'test-color-03-no-selector-found.png' });
      return;
    }

    console.log('📍 Step 4: 壁の色ドロップダウンを開く');
    await wallColorSelector.click();
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'test-color-04-dropdown-opened.png' });

    console.log('📍 Step 5: レッドカテゴリを探して選択');

    // レッドカテゴリを探す（複数の表記パターンを考慮）
    const redOptions = [
      'option:has-text("レッド")',
      'option:has-text("赤")',
      'option:has-text("Red")',
      'option[value*="red"]',
      'option[value*="Red"]'
    ];

    let redOption = null;
    for (const selector of redOptions) {
      const option = page.locator(selector).first();
      if (await option.isVisible()) {
        redOption = option;
        console.log(`✅ レッドオプション発見: ${selector}`);
        break;
      }
    }

    if (!redOption) {
      console.log('⚠️  レッドカテゴリが見つかりません');
      console.log('📊 利用可能なオプションを確認します...');

      const options = await page.locator('option').all();
      console.log(`見つかったオプション: ${options.length}個`);

      for (let i = 0; i < Math.min(options.length, 10); i++) {
        const option = options[i];
        const text = await option.textContent();
        const value = await option.getAttribute('value') || '';
        console.log(`  ${i + 1}. "${text}" (value: "${value}")`);
      }

      // 最初のオプション（デフォルト以外）を選択してテスト
      if (options.length > 1) {
        console.log('📍 代替テスト: 2番目のオプションを選択');
        redOption = options[1];
      }
    }

    if (redOption) {
      await redOption.click();
      await page.waitForTimeout(1500);

      console.log('✅ レッドカテゴリ選択完了');
      await page.screenshot({ path: 'test-color-05-red-selected.png' });

      console.log('📍 Step 6: サブカテゴリの表示を確認');

      // サブカテゴリセレクターを探す
      const subCategorySelectors = [
        '[data-testid="subcategory-selector"]',
        'select[name*="subcategory"]',
        'select[name*="sub"]',
        '.subcategory select',
        'div:has-text("サブカテゴリ") select'
      ];

      let subCategoryVisible = false;
      for (const selector of subCategorySelectors) {
        const element = page.locator(selector).first();
        if (await element.isVisible()) {
          subCategoryVisible = true;
          console.log(`✅ サブカテゴリセレクター表示確認: ${selector}`);

          // サブカテゴリのオプション数を確認
          const subOptions = await element.locator('option').all();
          console.log(`サブカテゴリオプション数: ${subOptions.length}個`);

          if (subOptions.length > 1) {
            console.log('📍 サブカテゴリの一つを選択してテスト');
            await subOptions[1].click();
            await page.waitForTimeout(1000);
          }
          break;
        }
      }

      if (!subCategoryVisible) {
        console.log('⚠️  サブカテゴリセレクターが表示されていません');
      }

      await page.screenshot({ path: 'test-color-06-subcategory-check.png' });
    }

    console.log('📍 Step 7: コンソールエラーの最終確認');
    await page.waitForTimeout(2000);

    // onColorSelectエラーを特に確認
    const onColorSelectErrors = consoleErrors.filter(error =>
      error.text.includes('onColorSelect') || error.text.includes('colorSelect')
    );

    console.log('\n📊 === テスト結果 ===');
    console.log(`💬 総コンソールメッセージ数: ${consoleMessages.length}`);
    console.log(`❌ エラー数: ${consoleErrors.length}`);
    console.log(`🎯 onColorSelectエラー数: ${onColorSelectErrors.length}`);

    if (consoleErrors.length > 0) {
      console.log('\n❌ エラー詳細:');
      consoleErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. [${error.timestamp}] ${error.text}`);
      });
    }

    if (onColorSelectErrors.length > 0) {
      console.log('\n🎯 onColorSelect関連エラー:');
      onColorSelectErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.text}`);
      });
    } else {
      console.log('✅ onColorSelectエラーは検出されませんでした');
    }

    await page.screenshot({ path: 'test-color-07-final-state.png' });

  } catch (error) {
    console.error('❌ テスト実行エラー:', error.message);
    await page.screenshot({ path: 'test-color-error.png' });
  } finally {
    await browser.close();
    console.log('🏁 テスト完了');
  }
}

// テスト実行
testColorSelector().catch(console.error);