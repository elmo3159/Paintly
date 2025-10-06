const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  try {
    console.log('📱 Starting Paintly Slider Test with Auth...');

    // Navigate to the sign-in page
    await page.goto('http://172.17.161.101:9090/auth/signin');
    await page.waitForTimeout(3000);

    // Take screenshot of sign-in page
    await page.screenshot({ path: '.playwright-mcp/auth-signin.png' });
    console.log('✅ Sign-in page screenshot saved');

    // Sign in with Google (if available)
    const googleSignInButton = page.locator('text=Googleで始める');
    if (await googleSignInButton.isVisible({ timeout: 5000 })) {
      console.log('🔍 Google sign-in option found');
      await googleSignInButton.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: '.playwright-mcp/google-signin.png' });
    } else {
      console.log('🔍 No Google sign-in found, trying email/password');

      // Try direct dashboard access
      await page.goto('http://172.17.161.101:9090/dashboard');
      await page.waitForTimeout(3000);
    }

    // Check if we're on dashboard
    if (page.url().includes('/dashboard')) {
      console.log('✅ Successfully accessed dashboard');
      await page.screenshot({ path: '.playwright-mcp/dashboard-authenticated.png' });

      // Click on first customer
      const firstCustomer = await page.locator('.card').first();
      if (await firstCustomer.isVisible()) {
        await firstCustomer.click();
        await page.waitForTimeout(3000);
        console.log('✅ Navigated to customer page');
        await page.screenshot({ path: '.playwright-mcp/customer-page.png' });

        // Click on history tab
        const historyTab = await page.locator('text=生成履歴');
        if (await historyTab.isVisible()) {
          await historyTab.click();
          await page.waitForTimeout(3000);
          console.log('✅ Switched to history tab');
          await page.screenshot({ path: '.playwright-mcp/history-tab.png' });

          // Click on detail button of first completed item
          const detailButton = await page.locator('button:has-text("詳細")').first();
          if (await detailButton.isVisible()) {
            await detailButton.click();
            await page.waitForTimeout(3000);
            console.log('✅ Opened detail modal');
            await page.screenshot({ path: '.playwright-mcp/detail-modal.png' });

            // Check for ReactCompareSlider
            const slider = await page.locator('[data-rcs="root"]');
            if (await slider.isVisible()) {
              console.log('✅ ReactCompareSlider found');

              // Get images information
              const images = await page.evaluate(() => {
                const imgs = document.querySelectorAll('[data-rcs="image"]');
                return Array.from(imgs).map((img, index) => ({
                  index: index,
                  src: img.src,
                  alt: img.alt,
                  position: img.getAttribute('data-rcs')
                }));
              });

              console.log('📊 Found images in slider:', images);

              // Get slider handle
              const handle = await page.locator('[data-rcs="handle-container"]');
              if (await handle.isVisible()) {
                const boundingBox = await handle.boundingBox();
                console.log('📏 Slider handle position:', boundingBox);

                // Test slider movement
                console.log('🧪 Testing slider movement...');

                // Move to left (should show more of itemOne - original image)
                await page.mouse.move(boundingBox.x + boundingBox.width / 2, boundingBox.y + boundingBox.height / 2);
                await page.mouse.down();
                await page.mouse.move(boundingBox.x - 100, boundingBox.y + boundingBox.height / 2);
                await page.mouse.up();
                await page.waitForTimeout(1000);
                await page.screenshot({ path: '.playwright-mcp/slider-left.png' });
                console.log('✅ Slider moved left');

                // Move to right (should show more of itemTwo - generated image)
                await page.mouse.move(boundingBox.x - 100, boundingBox.y + boundingBox.height / 2);
                await page.mouse.down();
                await page.mouse.move(boundingBox.x + 200, boundingBox.y + boundingBox.height / 2);
                await page.mouse.up();
                await page.waitForTimeout(1000);
                await page.screenshot({ path: '.playwright-mcp/slider-right.png' });
                console.log('✅ Slider moved right');

                // Return to center
                await page.mouse.move(boundingBox.x + 200, boundingBox.y + boundingBox.height / 2);
                await page.mouse.down();
                await page.mouse.move(boundingBox.x + boundingBox.width / 2, boundingBox.y + boundingBox.height / 2);
                await page.mouse.up();
                await page.waitForTimeout(1000);
                await page.screenshot({ path: '.playwright-mcp/slider-center.png' });
                console.log('✅ Slider returned to center');
              } else {
                console.log('❌ Slider handle not found');
              }
            } else {
              console.log('❌ ReactCompareSlider not found');
            }
          } else {
            console.log('❌ Detail button not found');
          }
        } else {
          console.log('❌ History tab not found');
        }
      } else {
        console.log('❌ No customers found');
      }
    } else {
      console.log('❌ Could not access dashboard');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    await page.screenshot({ path: '.playwright-mcp/error-screenshot.png' });
  } finally {
    await browser.close();
    console.log('🎯 Test completed');
  }
})();