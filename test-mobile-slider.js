const { chromium, devices } = require('@playwright/test');

(async () => {
  console.log('モバイル表示でのスライダー機能テストを開始します...');

  // iPhone 14の設定を使用
  const iPhone14 = devices['iPhone 14'];

  // ブラウザを起動
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000 // デバッグのために操作を遅くする
  });

  const context = await browser.newContext({
    ...iPhone14,
    // タッチイベントを有効にする
    hasTouch: true,
    isMobile: true
  });

  const page = await context.newPage();

  try {
    console.log('1. サイトにアクセス');
    await page.goto('http://172.17.161.101:9090');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: '.playwright-mcp/01-initial-mobile-page.png' });

    console.log('2. Google OAuthでサインイン');
    // サインインボタンを探す
    const signinSelectors = [
      'text=サインイン',
      'button:has-text("サインイン")',
      '[data-testid="signin-button"]',
      'a[href*="signin"]',
      'a[href*="auth"]'
    ];

    let signinButton = null;
    for (const selector of signinSelectors) {
      try {
        signinButton = await page.locator(selector).first();
        if (await signinButton.isVisible({ timeout: 2000 })) {
          console.log(`サインインボタンを発見: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (signinButton && await signinButton.isVisible()) {
      await signinButton.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: '.playwright-mcp/02-signin-clicked.png' });
    }

    // Google認証ボタンを探す
    const googleSelectors = [
      '[data-testid="google-signin"]',
      'button:has-text("Google")',
      'button:has-text("google")',
      '[class*="google"]',
      'button[type="button"]:has-text("Google")'
    ];

    let googleButton = null;
    for (const selector of googleSelectors) {
      try {
        googleButton = await page.locator(selector).first();
        if (await googleButton.isVisible({ timeout: 2000 })) {
          console.log(`Googleボタンを発見: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (googleButton && await googleButton.isVisible()) {
      await googleButton.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: '.playwright-mcp/03-google-auth.png' });
    }

    // 認証後の確認
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '.playwright-mcp/04-after-auth.png' });

    console.log('3. サイドバーの「新規顧客2025/9/15」ページにアクセス');
    // モバイルではハンバーガーメニューを確認
    const menuSelectors = [
      'button[aria-label="メニューを開く"]',
      'button:has-text("☰")',
      '[data-testid="hamburger-menu"]',
      '[data-testid="mobile-menu"]',
      '.hamburger-menu',
      'button[class*="hamburger"]'
    ];

    let menuButton = null;
    for (const selector of menuSelectors) {
      try {
        menuButton = await page.locator(selector).first();
        if (await menuButton.isVisible({ timeout: 2000 })) {
          console.log(`メニューボタンを発見: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (menuButton && await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: '.playwright-mcp/05-menu-opened.png' });
    }

    // 顧客ページリンクを探す
    const customerSelectors = [
      'text=新規顧客2025/9/15',
      'a:has-text("新規顧客2025/9/15")',
      'button:has-text("新規顧客2025/9/15")',
      '[href*="customer"]',
      'a[href*="2025/9/15"]'
    ];

    let customerFound = false;
    for (const selector of customerSelectors) {
      try {
        const customerLink = await page.locator(selector).first();
        if (await customerLink.isVisible({ timeout: 2000 })) {
          console.log(`顧客リンクを発見: ${selector}`);
          await customerLink.click();
          await page.waitForLoadState('networkidle');
          customerFound = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!customerFound) {
      console.log('直接URLで顧客ページにアクセスを試みます');
      // 直接URLでアクセスを試行
      const possibleUrls = [
        'http://172.17.161.101:9090/customer/1',
        'http://172.17.161.101:9090/customer/new',
        'http://172.17.161.101:9090/dashboard'
      ];

      for (const url of possibleUrls) {
        try {
          await page.goto(url);
          await page.waitForLoadState('networkidle');
          const title = await page.title();
          console.log(`${url} - タイトル: ${title}`);
          break;
        } catch (e) {
          console.log(`${url} へのアクセスに失敗`);
        }
      }
    }

    await page.screenshot({ path: '.playwright-mcp/06-customer-page.png' });

    console.log('4. 履歴タブを開く');
    const historySelectors = [
      'button:has-text("履歴")',
      '[data-testid="history-tab"]',
      'button[role="tab"]:has-text("履歴")',
      '.tab:has-text("履歴")',
      'a:has-text("履歴")'
    ];

    let historyTab = null;
    for (const selector of historySelectors) {
      try {
        historyTab = await page.locator(selector).first();
        if (await historyTab.isVisible({ timeout: 2000 })) {
          console.log(`履歴タブを発見: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (historyTab && await historyTab.isVisible()) {
      await historyTab.click();
      await page.waitForTimeout(2000);
      console.log('履歴タブを開きました');
    } else {
      console.log('履歴タブが見つからない - 利用可能なタブを確認します');
      const allTabs = await page.locator('button, [role="tab"], .tab').allTextContents();
      console.log('利用可能なタブ:', allTabs);
    }

    await page.screenshot({ path: '.playwright-mcp/07-history-tab.png' });

    console.log('5. 既存の生成結果の詳細ボタンを押す');
    const detailSelectors = [
      'button:has-text("詳細")',
      '[data-testid="detail-button"]',
      'button:has-text("View")',
      'button:has-text("見る")',
      '.detail-button',
      '.generation-result button'
    ];

    let detailButton = null;
    for (const selector of detailSelectors) {
      try {
        detailButton = await page.locator(selector).first();
        if (await detailButton.isVisible({ timeout: 2000 })) {
          console.log(`詳細ボタンを発見: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (detailButton && await detailButton.isVisible()) {
      await detailButton.click();
      await page.waitForTimeout(2000);
      console.log('詳細ボタンを押しました');
    } else {
      console.log('詳細ボタンが見つからない');
      // 生成結果全体をクリックしてみる
      const generationResults = await page.locator('.generation-result, [data-testid="generation-result"], .history-item').all();
      if (generationResults.length > 0) {
        await generationResults[0].click();
        await page.waitForTimeout(2000);
        console.log('生成結果をクリックしました');
      }
    }

    await page.screenshot({ path: '.playwright-mcp/08-detail-view.png' });

    console.log('6-7. スライダーの表示確認とハンドルサイズ確認');
    const sliderSelectors = [
      '.react-compare-slider',
      '[data-testid="comparison-slider"]',
      '.slider-container',
      '[class*="slider"]',
      '[class*="compare"]'
    ];

    let slider = null;
    for (const selector of sliderSelectors) {
      try {
        slider = await page.locator(selector).first();
        if (await slider.isVisible({ timeout: 2000 })) {
          console.log(`スライダーを発見: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (slider && await slider.isVisible()) {
      console.log('✓ スライダーが表示されています');

      // ハンドルを探す
      const handleSelectors = [
        '.react-compare-slider-handle',
        '[data-testid="slider-handle"]',
        '.slider-handle',
        '[class*="handle"]'
      ];

      let sliderHandle = null;
      for (const selector of handleSelectors) {
        try {
          sliderHandle = await page.locator(selector).first();
          if (await sliderHandle.isVisible({ timeout: 2000 })) {
            console.log(`スライダーハンドルを発見: ${selector}`);
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (sliderHandle && await sliderHandle.isVisible()) {
        const handleBox = await sliderHandle.boundingBox();
        if (handleBox) {
          console.log(`スライダーハンドルサイズ: ${handleBox.width}x${handleBox.height}`);
          if (handleBox.width >= 12 && handleBox.height >= 12) {
            console.log('✓ ハンドルサイズがモバイル対応できています（12x12以上）');
          } else {
            console.log('⚠ ハンドルサイズが小さい可能性があります');
          }
        }
      } else {
        console.log('⚠ スライダーハンドルが見つかりません');
      }
    } else {
      console.log('⚠ スライダーが表示されていません');
    }

    await page.screenshot({ path: '.playwright-mcp/09-slider-display.png' });

    console.log('8. スライダーのタッチ操作テスト');
    if (slider && await slider.isVisible()) {
      const sliderBox = await slider.boundingBox();
      if (sliderBox) {
        const leftPoint = { x: sliderBox.x + 20, y: sliderBox.y + sliderBox.height / 2 };
        const centerPoint = { x: sliderBox.x + sliderBox.width / 2, y: sliderBox.y + sliderBox.height / 2 };
        const rightPoint = { x: sliderBox.x + sliderBox.width - 20, y: sliderBox.y + sliderBox.height / 2 };

        console.log('左端をタッチ');
        await page.touchscreen.tap(leftPoint.x, leftPoint.y);
        await page.waitForTimeout(1000);
        await page.screenshot({ path: '.playwright-mcp/10-left-touch.png' });

        console.log('中央をタッチ');
        await page.touchscreen.tap(centerPoint.x, centerPoint.y);
        await page.waitForTimeout(1000);
        await page.screenshot({ path: '.playwright-mcp/11-center-touch.png' });

        console.log('右端をタッチ');
        await page.touchscreen.tap(rightPoint.x, rightPoint.y);
        await page.waitForTimeout(1000);
        await page.screenshot({ path: '.playwright-mcp/12-right-touch.png' });

        console.log('✓ タッチ操作テストが完了しました');
      }
    } else {
      console.log('スライダーが見つからないため、タッチ操作をスキップします');
    }

    console.log('9. 画像表示の確認');
    const imageSelectors = [
      'img[alt*="元"]',
      'img[alt*="original"]',
      '.original-image',
      'img[alt*="生成"]',
      'img[alt*="generated"]',
      '.generated-image'
    ];

    let imageCount = 0;
    for (const selector of imageSelectors) {
      try {
        const images = await page.locator(selector).all();
        imageCount += images.length;
        for (const img of images) {
          const isVisible = await img.isVisible();
          const alt = await img.getAttribute('alt');
          console.log(`画像: alt="${alt}", visible=${isVisible}`);
        }
      } catch (e) {
        continue;
      }
    }

    console.log(`合計画像数: ${imageCount}`);

    // 最終スクリーンショット
    await page.screenshot({ path: '.playwright-mcp/13-final-mobile-view.png' });

    // デバッグ情報収集
    console.log('=== デバッグ情報 ===');
    const title = await page.title();
    console.log('ページタイトル:', title);

    const url = page.url();
    console.log('現在のURL:', url);

    // DOM要素の詳細確認
    const sliderElements = await page.locator('[class*="slider"], [class*="compare"], [data-testid*="slider"]').all();
    console.log(`スライダー関連要素数: ${sliderElements.length}`);

    for (let i = 0; i < Math.min(sliderElements.length, 5); i++) {
      const element = sliderElements[i];
      const className = await element.getAttribute('class');
      const isVisible = await element.isVisible();
      console.log(`スライダー要素 ${i + 1}: class="${className}", visible=${isVisible}`);
    }

    console.log('✓ テスト完了');

  } catch (error) {
    console.error('エラーが発生しました:', error);
    await page.screenshot({ path: '.playwright-mcp/error-screenshot.png' });
  } finally {
    await browser.close();
  }
})();