const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  try {
    console.log('🔍 Starting authentication and slider test...');

    // コンソールログをキャプチャ
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      if (text.includes('🖼️') || text.includes('🎯') || text.includes('✅') || text.includes('❌')) {
        console.log(`🖥️ Browser [${type}]: ${text}`);
      }
    });

    // サインインページにアクセス
    console.log('1️⃣ Accessing signin page...');
    await page.goto('http://172.17.161.101:9090/auth/signin');
    await page.waitForTimeout(3000);

    console.log('📸 Taking signin page screenshot...');
    await page.screenshot({ path: '.playwright-mcp/01-signin-page.png' });

    // Google認証ボタンを探す
    const googleButton = await page.locator('text=Googleで始める');
    if (await googleButton.isVisible()) {
      console.log('2️⃣ Found Google auth button - clicking...');
      await googleButton.click();
      await page.waitForTimeout(3000);

      console.log('🙋‍♂️ Please complete Google authentication manually in the browser window.');
      console.log('   After authentication, press Enter to continue the test...');

      // ユーザーの入力を待つ（認証完了まで）
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      await new Promise(resolve => {
        rl.question('Press Enter after completing authentication: ', () => {
          rl.close();
          resolve();
        });
      });

    } else {
      console.log('❌ Google auth button not found');
      await page.screenshot({ path: '.playwright-mcp/error-no-google-button.png' });
      return;
    }

    // 認証後、顧客ページにアクセス
    console.log('3️⃣ Accessing customer page after authentication...');
    await page.goto('http://172.17.161.101:9090/customer/33d3c85f-521a-4ee1-a7af-392d4f7bb997');
    await page.waitForTimeout(5000);

    console.log('📸 Taking authenticated customer page screenshot...');
    await page.screenshot({ path: '.playwright-mcp/02-customer-page-auth.png' });

    // 生成履歴タブを探す
    console.log('4️⃣ Looking for history tab...');
    const historySelectors = [
      'text=生成履歴',
      'button:has-text("生成履歴")',
      '[role="tab"]:has-text("生成履歴")',
      '*:has-text("生成履歴")'
    ];

    let historyTabFound = false;
    for (const selector of historySelectors) {
      try {
        const tab = await page.locator(selector);
        if (await tab.isVisible()) {
          console.log(`✅ Found history tab with selector: ${selector}`);
          await tab.click();
          await page.waitForTimeout(3000);
          historyTabFound = true;
          break;
        }
      } catch (e) {
        console.log(`❌ Selector "${selector}" not found`);
      }
    }

    if (!historyTabFound) {
      console.log('❌ History tab not found - checking page content');
      const pageText = await page.textContent('body');
      console.log('🔍 Page contains "生成履歴":', pageText.includes('生成履歴'));
      await page.screenshot({ path: '.playwright-mcp/error-no-history-tab.png' });
      return;
    }

    console.log('📸 Taking history tab screenshot...');
    await page.screenshot({ path: '.playwright-mcp/03-history-tab.png' });

    // 詳細ボタンを探してクリック
    console.log('5️⃣ Looking for detail buttons...');
    const detailButtons = await page.locator('button:has-text("詳細")').all();
    console.log(`🔍 Found ${detailButtons.length} detail buttons`);

    if (detailButtons.length > 0) {
      await detailButtons[0].click();
      await page.waitForTimeout(5000);
      console.log('✅ Clicked first detail button');

      console.log('📸 Taking detail modal screenshot...');
      await page.screenshot({ path: '.playwright-mcp/04-detail-modal.png' });

      // ReactCompareSliderの詳細確認
      console.log('6️⃣ Checking ReactCompareSlider...');
      const sliderExists = await page.locator('[data-rcs="root"]').isVisible();
      console.log(`🎯 ReactCompareSlider exists: ${sliderExists}`);

      if (sliderExists) {
        // 画像要素の詳細確認
        const images = await page.locator('[data-rcs="image"]').all();
        console.log(`📸 Found ${images.length} slider images`);

        for (let i = 0; i < images.length; i++) {
          const src = await images[i].getAttribute('src');
          const alt = await images[i].getAttribute('alt');
          const complete = await images[i].evaluate(img => img.complete);
          const naturalWidth = await images[i].evaluate(img => img.naturalWidth);
          const naturalHeight = await images[i].evaluate(img => img.naturalHeight);

          console.log(`🖼️ Image ${i + 1} Details:`);
          console.log(`  Alt text: "${alt}"`);
          console.log(`  Source URL: "${src}"`);
          console.log(`  Loaded: ${complete}`);
          console.log(`  Natural size: ${naturalWidth}x${naturalHeight}`);
          console.log(`  Valid HTTP URL: ${!!(src && src.startsWith('http'))}`);
          console.log(`  URL length: ${src?.length || 0} characters`);
        }

        // スライダーハンドルの確認
        const handle = await page.locator('[data-rcs="handle-container"]');
        if (await handle.isVisible()) {
          console.log('✅ Slider handle found');

          // スライダーテスト
          console.log('7️⃣ Testing slider movement...');
          const boundingBox = await handle.boundingBox();
          if (boundingBox) {
            await page.mouse.move(boundingBox.x + boundingBox.width / 2, boundingBox.y + boundingBox.height / 2);
            await page.mouse.down();
            await page.mouse.move(boundingBox.x - 50, boundingBox.y + boundingBox.height / 2);
            await page.mouse.up();
            await page.waitForTimeout(1000);

            console.log('📸 Taking slider moved left screenshot...');
            await page.screenshot({ path: '.playwright-mcp/05-slider-left.png' });

            await page.mouse.move(boundingBox.x - 50, boundingBox.y + boundingBox.height / 2);
            await page.mouse.down();
            await page.mouse.move(boundingBox.x + 100, boundingBox.y + boundingBox.height / 2);
            await page.mouse.up();
            await page.waitForTimeout(1000);

            console.log('📸 Taking slider moved right screenshot...');
            await page.screenshot({ path: '.playwright-mcp/06-slider-right.png' });

            console.log('✅ Slider movement test completed');
          }
        } else {
          console.log('❌ Slider handle not found');
        }

        // デバッグAPIを呼び出してデータベースの内容を確認
        console.log('8️⃣ Checking database data via API...');
        try {
          const response = await page.goto('http://172.17.161.101:9090/api/debug-data?customerId=33d3c85f-521a-4ee1-a7af-392d4f7bb997');
          const debugData = await response.json();
          console.log('📊 Database Debug Data:', JSON.stringify(debugData, null, 2));
        } catch (e) {
          console.log('❌ Failed to fetch debug data:', e.message);
        }

      } else {
        console.log('❌ ReactCompareSlider not found');

        // ImageComparisonコンポーネントの確認
        const imageCompExists = await page.locator('[class*="ImageComparison"], .image-comparison').isVisible();
        console.log(`🔍 ImageComparison component exists: ${imageCompExists}`);

        // カード内容の確認
        const cardContent = await page.textContent('.card, [class*="card"]');
        console.log('🔍 Card content preview:', cardContent?.substring(0, 300));
      }

    } else {
      console.log('❌ No detail buttons found');

      // 履歴コンテンツの確認
      const historyItems = await page.locator('.card').all();
      console.log(`🔍 Found ${historyItems.length} history items`);

      if (historyItems.length > 0) {
        const firstItemText = await historyItems[0].textContent();
        console.log('🔍 First history item content:', firstItemText?.substring(0, 200));
      }
    }

    console.log('✅ Authentication and slider test completed successfully');

  } catch (error) {
    console.error('❌ Test error:', error);
    await page.screenshot({ path: '.playwright-mcp/error-test-failed.png' });
  } finally {
    console.log('🎯 Closing browser in 10 seconds...');
    await page.waitForTimeout(10000);
    await browser.close();
  }
})();