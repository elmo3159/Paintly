const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  try {
    console.log('🔍 Debugging slider with console capture...');

    // コンソールログをキャプチャ
    page.on('console', msg => {
      console.log('🖥️ Browser:', msg.text());
    });

    // 顧客ページにアクセス
    await page.goto('http://172.17.161.101:9090/customer/33d3c85f-521a-4ee1-a7af-392d4f7bb997');
    await page.waitForTimeout(8000);

    console.log('📸 Taking screenshot...');
    await page.screenshot({ path: '.playwright-mcp/debug-main.png' });

    // 履歴タブを探す（複数のパターン）
    const historySelectors = [
      'text=生成履歴',
      'button:has-text("生成履歴")',
      '[role="tab"]:has-text("生成履歴")'
    ];

    let foundHistory = false;
    for (const selector of historySelectors) {
      try {
        const tab = await page.locator(selector);
        if (await tab.isVisible()) {
          console.log(`✅ Found history tab: ${selector}`);
          await tab.click();
          await page.waitForTimeout(3000);
          foundHistory = true;
          break;
        }
      } catch (e) {
        // 次のセレクターを試す
      }
    }

    if (!foundHistory) {
      console.log('❌ History tab not found');
      return;
    }

    // 詳細ボタンをクリック
    const detailBtn = await page.locator('button:has-text("詳細")').first();
    if (await detailBtn.isVisible()) {
      await detailBtn.click();
      await page.waitForTimeout(5000);
      console.log('✅ Clicked detail button');

      // ReactCompareSlider確認
      const slider = await page.locator('[data-rcs="root"]');
      if (await slider.isVisible()) {
        console.log('✅ ReactCompareSlider found');

        // 画像要素を確認
        const images = await page.locator('[data-rcs="image"]').all();
        console.log(`📸 Found ${images.length} images`);

        for (let i = 0; i < images.length; i++) {
          const src = await images[i].getAttribute('src');
          const alt = await images[i].getAttribute('alt');
          const complete = await images[i].evaluate(img => img.complete);
          const naturalWidth = await images[i].evaluate(img => img.naturalWidth);

          console.log(`🖼️ Image ${i + 1}:`);
          console.log(`  Alt: ${alt}`);
          console.log(`  Src: ${src}`);
          console.log(`  Complete: ${complete}`);
          console.log(`  Width: ${naturalWidth}`);
        }

        await page.screenshot({ path: '.playwright-mcp/debug-slider.png' });
      } else {
        console.log('❌ ReactCompareSlider not found');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
})();
