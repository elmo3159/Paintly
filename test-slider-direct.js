const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  try {
    console.log('🔍 Direct access to customer page and slider test...');

    // コンソールログをキャプチャ
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      console.log(`🖥️ Browser Console [${type}]: ${text}`);
    });

    // 直接顧客ページにアクセス（認証をバイパス）
    await page.goto('http://172.17.161.101:9090/customer/33d3c85f-521a-4ee1-a7af-392d4f7bb997');
    await page.waitForTimeout(8000);

    console.log('📸 Taking customer page screenshot...');
    await page.screenshot({ path: '.playwright-mcp/direct-customer-page.png' });

    // 生成履歴タブをクリック
    const historyTab = await page.locator('text=生成履歴');
    if (await historyTab.isVisible()) {
      await historyTab.click();
      await page.waitForTimeout(3000);
      console.log('✅ Clicked history tab');

      await page.screenshot({ path: '.playwright-mcp/history-tab-direct.png' });

      // 詳細ボタンを探してクリック
      const detailButtons = await page.locator('button:has-text("詳細")');
      const count = await detailButtons.count();
      console.log(`🔍 Found ${count} detail buttons`);

      if (count > 0) {
        await detailButtons.first().click();
        await page.waitForTimeout(3000);
        console.log('✅ Clicked detail button');

        await page.screenshot({ path: '.playwright-mcp/detail-modal-direct.png' });

        // ReactCompareSliderの存在を確認
        const sliderExists = await page.locator('[data-rcs="root"]').isVisible();
        console.log(`🎯 ReactCompareSlider exists: ${sliderExists}`);

        if (sliderExists) {
          // 画像要素を確認
          const images = await page.locator('[data-rcs="image"]').all();
          console.log(`📸 Found ${images.length} slider images`);

          for (let i = 0; i < images.length; i++) {
            const src = await images[i].getAttribute('src');
            const alt = await images[i].getAttribute('alt');
            console.log(`🖼️ Image ${i + 1}: alt="${alt}", src="${src?.substring(0, 100)}..."`);
          }

          // スライダーハンドルを確認
          const handle = await page.locator('[data-rcs="handle-container"]');
          if (await handle.isVisible()) {
            console.log('✅ Slider handle found');

            // スライダーを少し動かしてテスト
            const boundingBox = await handle.boundingBox();
            if (boundingBox) {
              await page.mouse.move(boundingBox.x + boundingBox.width / 2, boundingBox.y + boundingBox.height / 2);
              await page.mouse.down();
              await page.mouse.move(boundingBox.x - 50, boundingBox.y + boundingBox.height / 2);
              await page.mouse.up();
              await page.waitForTimeout(1000);
              await page.screenshot({ path: '.playwright-mcp/slider-moved-left.png' });
              console.log('✅ Moved slider left');

              await page.mouse.move(boundingBox.x - 50, boundingBox.y + boundingBox.height / 2);
              await page.mouse.down();
              await page.mouse.move(boundingBox.x + 100, boundingBox.y + boundingBox.height / 2);
              await page.mouse.up();
              await page.waitForTimeout(1000);
              await page.screenshot({ path: '.playwright-mcp/slider-moved-right.png' });
              console.log('✅ Moved slider right');
            }
          } else {
            console.log('❌ Slider handle not found');
          }
        } else {
          console.log('❌ ReactCompareSlider not found');
        }
      } else {
        console.log('❌ No detail buttons found');
      }
    } else {
      console.log('❌ History tab not found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    await page.screenshot({ path: '.playwright-mcp/error-direct.png' });
  } finally {
    await browser.close();
    console.log('🎯 Direct test completed');
  }
})();