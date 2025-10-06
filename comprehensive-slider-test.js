const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function comprehensiveSliderTest() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  // Comprehensive logging
  const logs = [];

  page.on('console', msg => {
    const logEntry = `[CONSOLE ${msg.type()}]: ${msg.text()}`;
    console.log(logEntry);
    logs.push(logEntry);
  });

  page.on('request', request => {
    if (request.url().includes('supabase') || request.url().includes('image') || request.url().includes('blob')) {
      const logEntry = `[REQUEST]: ${request.method()} ${request.url()}`;
      console.log(logEntry);
      logs.push(logEntry);
    }
  });

  page.on('response', response => {
    if (response.url().includes('supabase') || response.url().includes('image') || response.url().includes('blob')) {
      const logEntry = `[RESPONSE]: ${response.status()} ${response.url()}`;
      console.log(logEntry);
      logs.push(logEntry);
    }
  });

  page.on('pageerror', error => {
    const logEntry = `[PAGE ERROR]: ${error.message}`;
    console.log(logEntry);
    logs.push(logEntry);
  });

  try {
    console.log('=== COMPREHENSIVE SLIDER TEST START ===');

    // Step 1: Navigate to signin
    console.log('\n1. Navigating to signin page...');
    await page.goto('http://172.17.161.101:9090/auth/signin');
    await page.screenshot({ path: '.playwright-mcp/01-signin-page.png' });

    // Step 2: Login
    console.log('\n2. Filling login form...');
    await page.fill('input[type="email"]', 'elmodayo3159@gmail.com');
    await page.fill('input[type="password"]', 'sanri3159');

    console.log('3. Clicking login button...');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ timeout: 15000 });
    await page.screenshot({ path: '.playwright-mcp/02-after-login.png' });

    // Step 3: Find and navigate to customer page
    console.log('\n4. Looking for customer pages in sidebar...');

    // Check what's actually in the sidebar
    const sidebarContent = await page.locator('[data-sidebar="sidebar"]').or(page.locator('nav')).innerHTML();
    console.log('Sidebar content:', sidebarContent);

    // Try to find customer links
    const customerLinks = await page.locator('a[href*="/customer/"]').all();
    console.log(`Found ${customerLinks.length} customer links`);

    if (customerLinks.length > 0) {
      console.log('5. Clicking first customer link...');
      await customerLinks[0].click();
      await page.waitForTimeout(3000);
    } else {
      console.log('5. No customer links found, trying direct URLs...');
      const testIds = [1, 2, 3, 4, 5];

      for (const id of testIds) {
        try {
          console.log(`Trying customer ID: ${id}`);
          await page.goto(`http://172.17.161.101:9090/customer/${id}`);
          await page.waitForTimeout(2000);

          // Check if page loaded successfully
          const pageContent = await page.textContent('body');
          if (!pageContent.includes('404') && !pageContent.includes('not found')) {
            console.log(`Successfully accessed customer ${id}`);
            break;
          }
        } catch (error) {
          console.log(`Failed to access customer ${id}: ${error.message}`);
        }
      }
    }

    await page.screenshot({ path: '.playwright-mcp/03-customer-page.png' });

    // Step 4: Look for existing generation history
    console.log('\n6. Searching for generation history...');

    // Try multiple ways to find history/generations
    const historySelectors = [
      'text=生成履歴',
      'text=History',
      '[role="tab"]:has-text("履歴")',
      '[data-tab="history"]',
      'button:has-text("履歴")',
      'text=履歴'
    ];

    let historyFound = false;
    for (const selector of historySelectors) {
      const element = page.locator(selector);
      if (await element.count() > 0) {
        console.log(`Found history tab with selector: ${selector}`);
        await element.click();
        await page.waitForTimeout(2000);
        historyFound = true;
        break;
      }
    }

    if (!historyFound) {
      console.log('No history tab found, looking for existing generations...');
    }

    await page.screenshot({ path: '.playwright-mcp/04-history-search.png' });

    // Step 5: Look for detail buttons or existing generations
    console.log('\n7. Looking for detail buttons and existing generations...');

    // Check for any existing generation data
    const generationElements = await page.locator('[data-generation-id]').or(page.locator('.generation-item')).all();
    console.log(`Found ${generationElements.length} generation elements`);

    const detailButtons = await page.locator('text=詳細').or(page.locator('button:has-text("詳細")')).all();
    console.log(`Found ${detailButtons.length} detail buttons`);

    const images = await page.locator('img[src*="supabase"]').or(page.locator('img[alt*="生成"]')).all();
    console.log(`Found ${images.length} supabase images`);

    // If no existing data, create test generation
    if (detailButtons.length === 0 && generationElements.length === 0) {
      console.log('\n8. No existing generations found, creating test data...');

      // Navigate to simulation tab to create test data
      const simulationTab = page.locator('text=シミュレーション').or(page.locator('[data-tab="simulation"]'));
      if (await simulationTab.count() > 0) {
        await simulationTab.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: '.playwright-mcp/05-simulation-tab.png' });

        // Try to upload an image for testing
        console.log('9. Attempting to create test generation...');

        // Look for file input
        const fileInput = page.locator('input[type="file"]');
        if (await fileInput.count() > 0) {
          // Create a simple test image file
          const testImagePath = path.join(__dirname, 'test-image.png');

          // Use an existing image if available
          const existingImages = [
            'test-base64-house-with-blue-walls.png',
            'paintly-test-result.png'
          ].map(name => path.join(__dirname, name));

          let imageToUpload = null;
          for (const imagePath of existingImages) {
            if (fs.existsSync(imagePath)) {
              imageToUpload = imagePath;
              break;
            }
          }

          if (imageToUpload) {
            console.log(`Uploading test image: ${imageToUpload}`);
            await fileInput.setInputFiles(imageToUpload);
            await page.waitForTimeout(3000);
            await page.screenshot({ path: '.playwright-mcp/06-image-uploaded.png' });

            // Try to generate
            const generateButton = page.locator('button:has-text("生成")').or(page.locator('button:has-text("Generate")'));
            if (await generateButton.count() > 0) {
              console.log('10. Clicking generate button...');
              await generateButton.click();
              await page.waitForTimeout(10000); // Wait for generation
              await page.screenshot({ path: '.playwright-mcp/07-generation-result.png' });
            }
          }
        }
      }
    }

    // Step 6: Deep dive into slider analysis
    console.log('\n11. Performing deep slider analysis...');

    // Re-check for detail buttons after potential generation
    const updatedDetailButtons = await page.locator('text=詳細').or(page.locator('button:has-text("詳細")')).all();
    console.log(`Updated detail buttons count: ${updatedDetailButtons.length}`);

    if (updatedDetailButtons.length > 0) {
      console.log('12. Clicking detail button...');
      await updatedDetailButtons[0].click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: '.playwright-mcp/08-detail-modal.png' });

      // Comprehensive slider analysis
      console.log('\n13. COMPREHENSIVE SLIDER ANALYSIS...');

      // 1. Check for ReactCompareSlider container
      const sliderSelectors = [
        '[class*="react-compare-slider"]',
        '[data-rcs]',
        '.ReactCompareSlider',
        '[data-testid*="slider"]',
        '[data-component="ReactCompareSlider"]'
      ];

      let sliderContainer = null;
      for (const selector of sliderSelectors) {
        const element = page.locator(selector);
        if (await element.count() > 0) {
          console.log(`Found slider with selector: ${selector}`);
          sliderContainer = element;
          break;
        }
      }

      if (sliderContainer) {
        console.log('14. Analyzing slider container...');

        // Get slider HTML
        const sliderHTML = await sliderContainer.innerHTML();
        console.log('Slider HTML structure:');
        console.log(sliderHTML);

        // Check all images in slider
        const allSliderImages = await sliderContainer.locator('img').all();
        console.log(`Found ${allSliderImages.length} images in slider`);

        for (let i = 0; i < allSliderImages.length; i++) {
          const img = allSliderImages[i];
          const analysis = await img.evaluate((element) => {
            return {
              src: element.src,
              alt: element.alt,
              className: element.className,
              style: element.style.cssText,
              naturalWidth: element.naturalWidth,
              naturalHeight: element.naturalHeight,
              complete: element.complete,
              crossOrigin: element.crossOrigin,
              loading: element.loading,
              computedStyle: window.getComputedStyle(element).cssText,
              parentClass: element.parentElement?.className,
              dataAttributes: Object.fromEntries(
                Array.from(element.attributes)
                  .filter(attr => attr.name.startsWith('data-'))
                  .map(attr => [attr.name, attr.value])
              )
            };
          });

          console.log(`\nImage ${i + 1} analysis:`);
          console.log(JSON.stringify(analysis, null, 2));

          // Test image accessibility
          if (analysis.src && analysis.src.startsWith('http')) {
            try {
              const response = await page.request.get(analysis.src);
              console.log(`Image URL status: ${response.status()}`);
              console.log(`Image URL headers:`, await response.headers());
            } catch (error) {
              console.log(`Failed to fetch image URL: ${error.message}`);
            }
          }
        }

        // Check for specific data-rcs attributes
        const rcsImages = await page.locator('[data-rcs="image"]').all();
        console.log(`\nFound ${rcsImages.length} images with data-rcs="image"`);

        for (let i = 0; i < rcsImages.length; i++) {
          const img = rcsImages[i];
          const rcsAnalysis = await img.evaluate((element) => {
            return {
              src: element.src,
              'data-rcs': element.getAttribute('data-rcs'),
              style: element.style.cssText,
              visibility: window.getComputedStyle(element).visibility,
              opacity: window.getComputedStyle(element).opacity,
              display: window.getComputedStyle(element).display,
              position: window.getComputedStyle(element).position,
              zIndex: window.getComputedStyle(element).zIndex
            };
          });

          console.log(`\nRCS Image ${i + 1}:`);
          console.log(JSON.stringify(rcsAnalysis, null, 2));
        }

        // Test slider functionality
        console.log('\n15. Testing slider functionality...');
        const sliderHandle = page.locator('[class*="handle"]').or(page.locator('[role="slider"]')).or(page.locator('[data-rcs="handle"]'));

        if (await sliderHandle.count() > 0) {
          console.log('Found slider handle, testing movement...');
          await page.screenshot({ path: '.playwright-mcp/09-before-slider-test.png' });

          const handleBox = await sliderHandle.boundingBox();
          if (handleBox) {
            // Move slider to different positions
            const positions = [0.25, 0.5, 0.75];
            for (const pos of positions) {
              const targetX = handleBox.x + (handleBox.width * pos);
              await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2);
              await page.mouse.down();
              await page.mouse.move(targetX, handleBox.y + handleBox.height / 2);
              await page.mouse.up();
              await page.waitForTimeout(1000);
              await page.screenshot({ path: `.playwright-mcp/10-slider-position-${pos}.png` });
            }
          }
        } else {
          console.log('No slider handle found');
        }

      } else {
        console.log('14. No ReactCompareSlider container found');

        // Check for any comparison-related elements
        const comparisonSelectors = [
          '[class*="comparison"]',
          '[class*="compare"]',
          '[class*="before-after"]',
          '[data-component*="comparison"]'
        ];

        for (const selector of comparisonSelectors) {
          const element = page.locator(selector);
          if (await element.count() > 0) {
            console.log(`Found comparison element: ${selector}`);
            const html = await element.innerHTML();
            console.log('Comparison HTML:', html);
          }
        }
      }

      // Final screenshot
      await page.screenshot({ path: '.playwright-mcp/11-final-analysis.png' });

    } else {
      console.log('12. No detail buttons found for analysis');

      // Check if we're in the right place
      const currentUrl = page.url();
      const pageTitle = await page.title();
      console.log(`Current URL: ${currentUrl}`);
      console.log(`Page title: ${pageTitle}`);

      // Look for any images on the page
      const allImages = await page.locator('img').all();
      console.log(`Total images on page: ${allImages.length}`);

      for (let i = 0; i < Math.min(allImages.length, 5); i++) {
        const img = allImages[i];
        const src = await img.getAttribute('src');
        const alt = await img.getAttribute('alt');
        console.log(`Image ${i + 1}: src=${src}, alt=${alt}`);
      }
    }

    // Save logs to file
    const logContent = logs.join('\n');
    fs.writeFileSync('.playwright-mcp/comprehensive-test-logs.txt', logContent);

    console.log('\n=== COMPREHENSIVE SLIDER TEST COMPLETE ===');

  } catch (error) {
    console.error('Test error:', error);
    await page.screenshot({ path: '.playwright-mcp/error-final.png' });

    // Save error logs
    const errorLog = `Error: ${error.message}\nStack: ${error.stack}\nLogs:\n${logs.join('\n')}`;
    fs.writeFileSync('.playwright-mcp/error-logs.txt', errorLog);

  } finally {
    await browser.close();
  }
}

comprehensiveSliderTest().catch(console.error);