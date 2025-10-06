const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  try {
    console.log('📱 Starting Paintly Slider Test...');

    // Navigate to the app
    await page.goto('http://172.17.161.101:9090/dashboard');
    await page.waitForTimeout(2000);

    // Take screenshot of dashboard
    await page.screenshot({ path: '.playwright-mcp/01-dashboard.png' });
    console.log('✅ Dashboard screenshot saved');

    // Click on first customer
    const firstCustomer = await page.locator('.card').first();
    if (await firstCustomer.isVisible()) {
      await firstCustomer.click();
      await page.waitForTimeout(2000);
      console.log('✅ Navigated to customer page');
    }

    // Click on history tab
    const historyTab = await page.locator('text=生成履歴');
    if (await historyTab.isVisible()) {
      await historyTab.click();
      await page.waitForTimeout(2000);
      console.log('✅ Switched to history tab');
    }

    // Click on detail button of first completed item
    const detailButton = await page.locator('button:has-text("詳細")').first();
    if (await detailButton.isVisible()) {
      await detailButton.click();
      await page.waitForTimeout(3000);
      console.log('✅ Opened detail modal');

      // Take screenshot of the slider
      await page.screenshot({ path: '.playwright-mcp/02-slider-initial.png' });
      console.log('✅ Initial slider screenshot saved');

      // Find the slider handle
      const sliderHandle = await page.locator('[data-rcs="handle-container"]');
      if (await sliderHandle.isVisible()) {
        const boundingBox = await sliderHandle.boundingBox();

        // Move slider to left (show original image only)
        await page.mouse.move(boundingBox.x + boundingBox.width / 2, boundingBox.y + boundingBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(boundingBox.x - 200, boundingBox.y + boundingBox.height / 2);
        await page.mouse.up();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: '.playwright-mcp/03-slider-left.png' });
        console.log('✅ Slider moved left (showing original image)');

        // Move slider to right (show generated image only)
        await page.mouse.move(boundingBox.x - 200, boundingBox.y + boundingBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(boundingBox.x + 400, boundingBox.y + boundingBox.height / 2);
        await page.mouse.up();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: '.playwright-mcp/04-slider-right.png' });
        console.log('✅ Slider moved right (showing generated image)');

        // Move slider to center
        await page.mouse.move(boundingBox.x + 400, boundingBox.y + boundingBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(boundingBox.x + boundingBox.width / 2, boundingBox.y + boundingBox.height / 2);
        await page.mouse.up();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: '.playwright-mcp/05-slider-center.png' });
        console.log('✅ Slider moved to center (showing both images)');
      }

      // Get the image URLs from the page
      const images = await page.evaluate(() => {
        const imgs = document.querySelectorAll('[data-rcs="image"]');
        return Array.from(imgs).map(img => ({
          src: img.src,
          alt: img.alt
        }));
      });

      console.log('📊 Found images:', images);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    await page.screenshot({ path: '.playwright-mcp/error-screenshot.png' });
  } finally {
    await browser.close();
    console.log('🎯 Test completed');
  }
})();