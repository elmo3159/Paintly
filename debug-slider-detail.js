const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  try {
    console.log('🔍 Debugging slider issue with detailed console capture...');

    // コンソールログをキャプチャ
    page.on('console', msg => {
      console.log('🖥️ Browser Console:', msg.text());
    });

    // 直接顧客ページにアクセス
    await page.goto('http://172.17.161.101:9090/customer/33d3c85f-521a-4ee1-a7af-392d4f7bb997');
    await page.waitForTimeout(8000);

    console.log('📸 Taking main customer page screenshot...');
    await page.screenshot({ path: '.playwright-mcp/debug-customer-main.png' });

    // ページ内のタブやボタンを詳細に確認
    const allButtons = await page.locator('button').all();
    console.log(`🔍 Found ${allButtons.length} buttons on page`);

    for (let i = 0; i < allButtons.length; i++) {
      const text = await allButtons[i].textContent();
      console.log(`  Button ${i + 1}: "${text?.trim()}"`);
    }

    // タブを探す（複数のパターンを試す）
    const tabSelectors = [
      'text=生成履歴',
      '[role="tab"]:has-text("生成履歴")',
      'button:has-text("生成履歴")',
      '.tab:has-text("生成履歴")',
      '*:has-text("生成履歴")'
    ];

    let historyTabFound = false;
    for (const selector of tabSelectors) {
      try {
        const element = await page.locator(selector);
        if (await element.isVisible()) {
          console.log(`✅ Found history tab with selector: ${selector}`);
          await element.click();
          await page.waitForTimeout(3000);
          historyTabFound = true;
          break;
        }
      } catch (e) {
        console.log(`❌ Selector "${selector}" not found`);
      }
    }

    if (!historyTabFound) {
      // ページの全テキスト内容を確認
      const pageText = await page.textContent('body');
      console.log('🔍 Page contains "生成履歴":', pageText.includes('生成履歴'));

      // スクリーンショットを撮って終了
      await page.screenshot({ path: '.playwright-mcp/debug-no-history-tab.png' });
      console.log('❌ Could not find history tab - check debug-no-history-tab.png');
      return;
    }

    await page.screenshot({ path: '.playwright-mcp/debug-history-tab-clicked.png' });

    // 詳細ボタンを探す
    const detailButtons = await page.locator('button:has-text("詳細")').all();
    console.log(`🔍 Found ${detailButtons.length} detail buttons`);

    if (detailButtons.length > 0) {
      await detailButtons[0].click();
      await page.waitForTimeout(5000);
      console.log('✅ Clicked first detail button');

      await page.screenshot({ path: '.playwright-mcp/debug-detail-modal.png' });

      // ImageComparison コンポーネントの存在確認
      const imageComparisonExists = await page.locator('[class*="image-comparison"], [class*="ImageComparison"]').isVisible();
      console.log(`🎯 ImageComparison component exists: ${imageComparisonExists}`);

      // ReactCompareSlider の存在確認
      const sliderExists = await page.locator('[data-rcs="root"]').isVisible();
      console.log(`🎯 ReactCompareSlider exists: ${sliderExists}`);

      if (sliderExists) {
        // 画像要素の詳細を確認
        const images = await page.locator('[data-rcs="image"]').all();
        console.log(`📸 Found ${images.length} slider images`);

        for (let i = 0; i < images.length; i++) {
          const src = await images[i].getAttribute('src');
          const alt = await images[i].getAttribute('alt');
          const naturalWidth = await images[i].evaluate(img => img.naturalWidth);
          const naturalHeight = await images[i].evaluate(img => img.naturalHeight);
          const complete = await images[i].evaluate(img => img.complete);

          console.log(`🖼️ Image ${i + 1}:`);
          console.log(`  Alt: "${alt}"`);
          console.log(`  Src: "${src}"`);
          console.log(`  Natural size: ${naturalWidth}x${naturalHeight}`);
          console.log(`  Loaded: ${complete}`);
          console.log(`  Has valid src: ${!!(src && src.startsWith('http'))}`);
        }

        // 5秒間待って再度確認
        await page.waitForTimeout(5000);
        await page.screenshot({ path: '.playwright-mcp/debug-slider-final.png' });

        // 再度画像の状態を確認
        console.log('🔄 Rechecking image states after 5 seconds...');
        const imagesAfter = await page.locator('[data-rcs="image"]').all();
        for (let i = 0; i < imagesAfter.length; i++) {
          const complete = await imagesAfter[i].evaluate(img => img.complete);
          const naturalWidth = await imagesAfter[i].evaluate(img => img.naturalWidth);
          console.log(`🖼️ Image ${i + 1} after wait: loaded=${complete}, width=${naturalWidth}`);
        }

      } else {
        console.log('❌ ReactCompareSlider not found');
        // カードの内容を確認
        const cardContent = await page.textContent('.card, [class*="card"]');
        console.log('🔍 Card content preview:', cardContent?.substring(0, 200));
      }

    } else {
      console.log('❌ No detail buttons found');
      // 履歴の内容を確認
      const historyContent = await page.textContent('body');
      console.log('🔍 History content contains "完了":', historyContent.includes('完了'));
      console.log('🔍 History content contains "処理中":', historyContent.includes('処理中'));
    }

  } catch (error) {
    console.error('❌ Error:', error);
    await page.screenshot({ path: '.playwright-mcp/debug-error.png' });
  } finally {
    await browser.close();
    console.log('🎯 Debug test completed');
  }
})();