const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  try {
    console.log('🔍 Testing with provided Paintly account...');

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

    console.log('📸 Taking signin screenshot...');
    await page.screenshot({ path: '.playwright-mcp/account-01-signin.png' });

    // メールアドレスを入力
    console.log('2️⃣ Entering credentials...');
    await page.fill('input[type="email"]', 'elmodayo3159@gmail.com');
    await page.fill('input[type="password"]', 'sanri3159');
    await page.waitForTimeout(1000);

    console.log('📸 Taking credentials screenshot...');
    await page.screenshot({ path: '.playwright-mcp/account-02-credentials.png' });

    // サインインボタンをクリック
    const signinButton = await page.locator('button:has-text("Paintlyにサインイン")');
    if (await signinButton.isVisible()) {
      await signinButton.click();
      console.log('✅ Clicked signin button');
      await page.waitForTimeout(5000);
    } else {
      console.log('❌ Signin button not found');
      return;
    }

    console.log('📸 Taking post-signin screenshot...');
    await page.screenshot({ path: '.playwright-mcp/account-03-post-signin.png' });

    // ダッシュボードにリダイレクトされているか確認
    const currentUrl = page.url();
    console.log(`🌐 Current URL: ${currentUrl}`);

    if (currentUrl.includes('/dashboard')) {
      console.log('✅ Successfully authenticated and redirected to dashboard');

      // 顧客ページリストを確認
      console.log('3️⃣ Looking for customer pages...');
      await page.waitForTimeout(3000);

      // 顧客ページリンクを探す
      const customerLinks = await page.locator('a[href^="/customer/"]').all();
      console.log(`🔍 Found ${customerLinks.length} customer page links`);

      if (customerLinks.length > 0) {
        // 最初の顧客ページにアクセス
        const firstCustomerUrl = await customerLinks[0].getAttribute('href');
        console.log(`📍 Accessing first customer page: ${firstCustomerUrl}`);

        await customerLinks[0].click();
        await page.waitForTimeout(5000);

        console.log('📸 Taking customer page screenshot...');
        await page.screenshot({ path: '.playwright-mcp/account-04-customer-page.png' });

        // 生成履歴タブを探す
        console.log('4️⃣ Looking for history tab...');
        const historySelectors = [
          'text=生成履歴',
          'button:has-text("生成履歴")',
          '[role="tab"]:has-text("生成履歴")'
        ];

        let historyTabFound = false;
        for (const selector of historySelectors) {
          try {
            const tab = await page.locator(selector);
            if (await tab.isVisible()) {
              console.log(`✅ Found history tab: ${selector}`);
              await tab.click();
              await page.waitForTimeout(3000);
              historyTabFound = true;
              break;
            }
          } catch (e) {
            // 次のセレクターを試す
          }
        }

        if (historyTabFound) {
          console.log('📸 Taking history tab screenshot...');
          await page.screenshot({ path: '.playwright-mcp/account-05-history-tab.png' });

          // 詳細ボタンを探す
          console.log('5️⃣ Looking for detail buttons...');
          const detailButtons = await page.locator('button:has-text("詳細")').all();
          console.log(`🔍 Found ${detailButtons.length} detail buttons`);

          if (detailButtons.length > 0) {
            await detailButtons[0].click();
            await page.waitForTimeout(5000);
            console.log('✅ Clicked detail button');

            console.log('📸 Taking detail modal screenshot...');
            await page.screenshot({ path: '.playwright-mcp/account-06-detail-modal.png' });

            // ReactCompareSliderの詳細確認
            console.log('6️⃣ Analyzing ReactCompareSlider...');
            const sliderExists = await page.locator('[data-rcs="root"]').isVisible();
            console.log(`🎯 ReactCompareSlider exists: ${sliderExists}`);

            if (sliderExists) {
              const images = await page.locator('[data-rcs="image"]').all();
              console.log(`📸 Found ${images.length} slider images`);

              for (let i = 0; i < images.length; i++) {
                const src = await images[i].getAttribute('src');
                const alt = await images[i].getAttribute('alt');
                const complete = await images[i].evaluate(img => img.complete);
                const naturalWidth = await images[i].evaluate(img => img.naturalWidth);
                const naturalHeight = await images[i].evaluate(img => img.naturalHeight);

                console.log(`🖼️ Image ${i + 1}:`);
                console.log(`  Alt: "${alt}"`);
                console.log(`  Src: "${src}"`);
                console.log(`  Loaded: ${complete}`);
                console.log(`  Size: ${naturalWidth}x${naturalHeight}`);
                console.log(`  Valid: ${!!(src && src.startsWith('http'))}`);
              }

              // スライダーハンドルのテスト
              const handle = await page.locator('[data-rcs="handle-container"]');
              if (await handle.isVisible()) {
                console.log('✅ Testing slider movement...');
                const boundingBox = await handle.boundingBox();
                if (boundingBox) {
                  // 左に移動
                  await page.mouse.move(boundingBox.x + boundingBox.width / 2, boundingBox.y + boundingBox.height / 2);
                  await page.mouse.down();
                  await page.mouse.move(boundingBox.x - 50, boundingBox.y + boundingBox.height / 2);
                  await page.mouse.up();
                  await page.waitForTimeout(1000);

                  console.log('📸 Taking slider left screenshot...');
                  await page.screenshot({ path: '.playwright-mcp/account-07-slider-left.png' });

                  // 右に移動
                  await page.mouse.move(boundingBox.x - 50, boundingBox.y + boundingBox.height / 2);
                  await page.mouse.down();
                  await page.mouse.move(boundingBox.x + 100, boundingBox.y + boundingBox.height / 2);
                  await page.mouse.up();
                  await page.waitForTimeout(1000);

                  console.log('📸 Taking slider right screenshot...');
                  await page.screenshot({ path: '.playwright-mcp/account-08-slider-right.png' });

                  console.log('✅ Slider movement test completed');
                }
              } else {
                console.log('❌ Slider handle not found');
              }

              // この顧客のデータを確認
              const customerId = firstCustomerUrl.split('/').pop();
              console.log('7️⃣ Checking database data for this customer...');
              try {
                const response = await page.goto(`http://172.17.161.101:9090/api/public-debug?customerId=${customerId}`);
                const debugData = await response.json();
                console.log('📊 Customer Database Data:');
                console.log(`  Total records: ${debugData.total_records}`);
                console.log(`  Completed: ${debugData.statistics?.completed_count}`);
                console.log(`  Has valid images: ${debugData.statistics?.has_valid_generated}`);
              } catch (e) {
                console.log('❌ Failed to fetch debug data:', e.message);
              }

            } else {
              console.log('❌ ReactCompareSlider not found');
            }

          } else {
            console.log('❌ No detail buttons found - no history items');
          }

        } else {
          console.log('❌ History tab not found');
        }

      } else {
        console.log('❌ No customer pages found - need to create one first');
      }

    } else {
      console.log('❌ Authentication failed or not redirected to dashboard');
    }

  } catch (error) {
    console.error('❌ Test error:', error);
    await page.screenshot({ path: '.playwright-mcp/account-error.png' });
  } finally {
    console.log('🎯 Keeping browser open for 30 seconds for inspection...');
    await page.waitForTimeout(30000);
    await browser.close();
  }
})();