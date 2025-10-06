const { chromium, devices } = require('@playwright/test');

(async () => {
  console.log('🔍 サイドバー問題直接調査テストを開始します...');

  const iPhone14 = devices['iPhone 14'];
  const browser = await chromium.launch({
    headless: false,
    slowMo: 800,
    devtools: true
  });

  const context = await browser.newContext({
    ...iPhone14,
    hasTouch: true,
    isMobile: true
  });

  const page = await context.newPage();

  try {
    // コンソールログとエラーを監視
    page.on('console', msg => {
      const type = msg.type();
      if (type === 'error' || type === 'warn' || msg.text().includes('sidebar') || msg.text().includes('mobile')) {
        console.log(`🔍 [${type.toUpperCase()}]`, msg.text());
      }
    });
    page.on('pageerror', error => console.error('❌ ページエラー:', error.message));

    console.log('📱 ステップ1: 既存の顧客ページに直接アクセス');
    // 既知の顧客ページに直接アクセス
    const customerPageUrl = 'http://172.17.161.101:9090/customer/009e75c8-b18d-4583-8b77-ec2623c575ee';
    await page.goto(customerPageUrl);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: '.playwright-mcp/direct-01-customer-page.png' });

    console.log('🔍 ステップ2: 初期サイドバー状態の詳細確認');

    // サイドバー関連の要素を詳細にチェック
    const initialState = await page.evaluate(() => {
      // より厳密なセレクタでサイドバー要素を探す
      const elements = {
        mobileSidebar: document.querySelector('div.fixed.inset-y-0.left-0.z-40.flex'),
        mobileOverlay: document.querySelector('div.fixed.inset-0.z-40.bg-black\\/50'),
        mobileHamburger: document.querySelector('button.fixed.left-4.top-4.z-50.md\\:hidden'),
        desktopHamburger: document.querySelector('button.fixed.left-4.top-4.z-50.hidden.md\\:block'),
        closeButton: document.querySelector('button:has-text("サイドバーを閉じる")'),
        // より広い範囲でサイドバー要素を探す
        anySidebar: document.querySelector('[class*="sidebar"]'),
        anyMobileButton: document.querySelector('button[class*="md:hidden"]'),
        anyFixedButton: document.querySelector('button.fixed')
      };

      const result = {};
      for (const [name, element] of Object.entries(elements)) {
        if (element) {
          const rect = element.getBoundingClientRect();
          result[name] = {
            exists: true,
            visible: element.offsetParent !== null,
            display: getComputedStyle(element).display,
            className: element.className,
            position: {x: rect.x, y: rect.y, width: rect.width, height: rect.height},
            innerHTML: element.innerHTML.substring(0, 100) + '...'
          };
        } else {
          result[name] = { exists: false };
        }
      }

      return result;
    });

    console.log('📊 初期状態の詳細:');
    for (const [name, state] of Object.entries(initialState)) {
      console.log(`  ${name}:`, JSON.stringify(state, null, 2));
    }

    await page.screenshot({ path: '.playwright-mcp/direct-02-initial-analysis.png' });

    console.log('🔍 ステップ3: React state variables の確認');

    // Reactの状態変数を直接確認
    const reactStates = await page.evaluate(() => {
      // Reactの状態をwindowオブジェクトから確認（デバッグ用）
      const states = {};

      // グローバルなReact要素を探す
      const reactRoots = document.querySelectorAll('[data-reactroot], #__next, #root');
      if (reactRoots.length > 0) {
        states.hasReactRoot = true;
        states.reactRootCount = reactRoots.length;
      }

      // サイドバー関連のクラス名を持つ要素を全て探す
      const allSidebarElements = document.querySelectorAll('[class*="sidebar"], [class*="mobile"], [class*="fixed"]');
      states.sidebarRelatedElements = Array.from(allSidebarElements).map(el => ({
        tagName: el.tagName,
        className: el.className,
        visible: el.offsetParent !== null
      }));

      return states;
    });

    console.log('🔬 React状態情報:', JSON.stringify(reactStates, null, 2));

    console.log('🎯 ステップ4: モバイルハンバーガーメニューを強制的に探す');

    // モバイルハンバーガーメニューを様々な方法で探す
    const hamburgerSelectors = [
      'button.fixed.left-4.top-4.z-50.md\\:hidden',
      'button[class*="md:hidden"]',
      'button[class*="fixed"][class*="left-4"]',
      'button:has-text("☰")',
      'button:has-text("Menu")',
      '[data-testid="mobile-menu"]',
      '.hamburger-menu',
      'button svg[class*="menu"]'
    ];

    let foundHamburger = null;
    for (const selector of hamburgerSelectors) {
      try {
        const element = page.locator(selector);
        const count = await element.count();
        if (count > 0) {
          const isVisible = await element.first().isVisible({ timeout: 1000 }).catch(() => false);
          console.log(`  ${selector}: 要素数=${count}, 可視=${isVisible}`);

          if (isVisible && !foundHamburger) {
            foundHamburger = element.first();
            console.log(`✅ ハンバーガーメニュー発見: ${selector}`);
          }
        }
      } catch (e) {
        // セレクタエラーは無視
      }
    }

    console.log('🔄 ステップ5: サイドバーの強制表示テスト');

    if (foundHamburger) {
      console.log('🎯 ハンバーガーメニューをクリックしてサイドバーを開く');
      await foundHamburger.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: '.playwright-mcp/direct-03-after-hamburger-click.png' });

      // サイドバーが開いた後の状態を確認
      const afterHamburgerState = await page.evaluate(() => {
        const elements = {
          mobileSidebar: document.querySelector('div.fixed.inset-y-0.left-0.z-40'),
          mobileOverlay: document.querySelector('div.fixed.inset-0.z-40.bg-black\\/50'),
          closeButton: document.querySelector('button:has-text("サイドバーを閉じる")')
        };

        const result = {};
        for (const [name, element] of Object.entries(elements)) {
          if (element) {
            result[name] = {
              exists: true,
              visible: element.offsetParent !== null,
              display: getComputedStyle(element).display
            };
          } else {
            result[name] = { exists: false };
          }
        }
        return result;
      });

      console.log('📊 ハンバーガークリック後の状態:', JSON.stringify(afterHamburgerState, null, 2));

      console.log('🎯 ステップ6: オーバーレイクリックテスト');

      // オーバーレイをクリック
      const overlay = page.locator('div.fixed.inset-0.z-40.bg-black\\/50');
      if (await overlay.isVisible({ timeout: 2000 })) {
        console.log('✅ オーバーレイが表示中 - クリックします');

        await overlay.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: '.playwright-mcp/direct-04-after-overlay-click.png' });

        // オーバーレイクリック後の状態確認
        const afterOverlayState = await page.evaluate(() => {
          const hamburger = document.querySelector('button.fixed.left-4.top-4.z-50.md\\:hidden');
          const sidebar = document.querySelector('div.fixed.inset-y-0.left-0.z-40');
          const overlay = document.querySelector('div.fixed.inset-0.z-40.bg-black\\/50');

          return {
            hamburgerVisible: hamburger ? hamburger.offsetParent !== null : false,
            sidebarVisible: sidebar ? sidebar.offsetParent !== null : false,
            overlayVisible: overlay ? overlay.offsetParent !== null : false
          };
        });

        console.log('📊 オーバーレイクリック後:', JSON.stringify(afterOverlayState, null, 2));

        // ハンバーガーメニューが表示されているかどうかを確認
        if (afterOverlayState.hamburgerVisible) {
          console.log('✅ SUCCESS: ハンバーガーメニューが正常に表示されました！');
        } else {
          console.log('❌ ISSUE: オーバーレイクリック後もハンバーガーメニューが表示されていません');
        }
      }

      console.log('🔄 ステップ7: サイドバーを再度開いて閉じるボタンテスト');

      // ハンバーガーメニューが見える場合、再度クリックしてサイドバーを開く
      if (await foundHamburger.isVisible({ timeout: 2000 })) {
        await foundHamburger.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: '.playwright-mcp/direct-05-sidebar-reopened.png' });

        // 閉じるボタンをクリック
        const closeButton = page.locator('button:has-text("サイドバーを閉じる")');
        if (await closeButton.isVisible({ timeout: 2000 })) {
          console.log('✅ 閉じるボタンが表示中 - クリックします');

          await closeButton.click();
          await page.waitForTimeout(1000);
          await page.screenshot({ path: '.playwright-mcp/direct-06-after-close-button.png' });

          // 閉じるボタンクリック後の状態確認
          const afterCloseButtonState = await page.evaluate(() => {
            const hamburger = document.querySelector('button.fixed.left-4.top-4.z-50.md\\:hidden');
            const sidebar = document.querySelector('div.fixed.inset-y-0.left-0.z-40');
            const overlay = document.querySelector('div.fixed.inset-0.z-40.bg-black\\/50');

            return {
              hamburgerVisible: hamburger ? hamburger.offsetParent !== null : false,
              sidebarVisible: sidebar ? sidebar.offsetParent !== null : false,
              overlayVisible: overlay ? overlay.offsetParent !== null : false
            };
          });

          console.log('📊 閉じるボタンクリック後:', JSON.stringify(afterCloseButtonState, null, 2));

          if (afterCloseButtonState.hamburgerVisible) {
            console.log('✅ SUCCESS: 閉じるボタンでもハンバーガーメニューが正常に表示されました！');
          } else {
            console.log('❌ ISSUE: 閉じるボタンクリック後もハンバーガーメニューが表示されていません');
          }
        }
      }
    } else {
      console.log('❌ CRITICAL: ハンバーガーメニューが見つかりません');
    }

    console.log('📝 ステップ8: 最終まとめと問題特定');

    // 最終的な状態をまとめて確認
    const finalDiagnosis = await page.evaluate(() => {
      // 問題の根本原因を探る
      const diagnosis = {
        timestamp: new Date().toISOString(),
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
          isMobile: window.innerWidth < 768
        },
        elements: {}
      };

      // 重要な要素の状態をチェック
      const criticalElements = [
        { name: 'mobileHamburger', selector: 'button.fixed.left-4.top-4.z-50.md\\:hidden' },
        { name: 'mobileSidebar', selector: 'div.fixed.inset-y-0.left-0.z-40' },
        { name: 'mobileOverlay', selector: 'div.fixed.inset-0.z-40.bg-black\\/50' }
      ];

      for (const { name, selector } of criticalElements) {
        const element = document.querySelector(selector);
        if (element) {
          const styles = getComputedStyle(element);
          diagnosis.elements[name] = {
            exists: true,
            visible: element.offsetParent !== null,
            display: styles.display,
            visibility: styles.visibility,
            opacity: styles.opacity,
            transform: styles.transform,
            className: element.className
          };
        } else {
          diagnosis.elements[name] = { exists: false };
        }
      }

      return diagnosis;
    });

    console.log('🏁 最終診断結果:');
    console.log(JSON.stringify(finalDiagnosis, null, 2));

    await page.screenshot({ path: '.playwright-mcp/direct-07-final-diagnosis.png' });

    console.log('⏰ 手動確認のため20秒間ブラウザを開いたままにします');
    await page.waitForTimeout(20000);

  } catch (error) {
    console.error('❌ テスト中にエラーが発生:', error);
    await page.screenshot({ path: '.playwright-mcp/direct-error.png' });
  } finally {
    await browser.close();
    console.log('🏁 サイドバー直接調査テスト完了');
  }
})();