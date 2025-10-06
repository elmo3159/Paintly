const { chromium, devices } = require('@playwright/test');

(async () => {
  console.log('🔍 サイドバー問題修正版テストを開始します...');

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
    await page.screenshot({ path: '.playwright-mcp/fixed-01-customer-page.png' });

    console.log('🔍 ステップ2: 初期サイドバー状態の詳細確認');

    // サイドバー関連の要素を詳細にチェック（修正されたセレクタを使用）
    const initialState = await page.evaluate(() => {
      // より厳密なセレクタでサイドバー要素を探す
      const elements = {
        mobileSidebar: document.querySelector('div.fixed.inset-y-0.left-0.z-40.flex'),
        mobileOverlay: document.querySelector('div.fixed.inset-0.z-40.bg-black\\/50'),
        mobileHamburger: document.querySelector('button.fixed.left-4.top-4.z-50.md\\:hidden'),
        desktopHamburger: document.querySelector('button.fixed.left-4.top-4.z-50.hidden.md\\:block'),
        // テキストベースの検索（:has-textは使わない）
        closeButtonByText: Array.from(document.querySelectorAll('button')).find(btn =>
          btn.textContent && btn.textContent.includes('サイドバーを閉じる')),
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
            text: element.textContent ? element.textContent.substring(0, 50) : 'N/A'
          };
        } else {
          result[name] = { exists: false };
        }
      }

      return result;
    });

    console.log('📊 初期状態の詳細:');
    for (const [name, state] of Object.entries(initialState)) {
      if (state.exists) {
        console.log(`  ✅ ${name}: 表示=${state.visible}, display=${state.display}`);
        console.log(`     位置=${JSON.stringify(state.position)}`);
        console.log(`     テキスト="${state.text}"`);
      } else {
        console.log(`  ❌ ${name}: 要素が存在しません`);
      }
    }

    await page.screenshot({ path: '.playwright-mcp/fixed-02-initial-analysis.png' });

    console.log('🎯 ステップ3: モバイルハンバーガーメニューの詳細検索');

    // PlaywrightのLocatorを使ってハンバーガーメニューを探す
    const hamburgerLocators = [
      page.locator('button.fixed.left-4.top-4.z-50.md\\:hidden'),
      page.locator('button[class*="md:hidden"]'),
      page.locator('button[class*="fixed"][class*="left-4"]'),
      page.locator('button').filter({ hasText: 'Menu' }),
      page.locator('[data-testid="mobile-menu"]'),
      page.locator('.hamburger-menu')
    ];

    let foundHamburger = null;
    for (let i = 0; i < hamburgerLocators.length; i++) {
      const locator = hamburgerLocators[i];
      try {
        const count = await locator.count();
        if (count > 0) {
          const isVisible = await locator.first().isVisible({ timeout: 1000 }).catch(() => false);
          console.log(`  パターン${i+1}: 要素数=${count}, 可視=${isVisible}`);

          if (isVisible && !foundHamburger) {
            foundHamburger = locator.first();
            console.log(`✅ ハンバーガーメニュー発見: パターン${i+1}`);
          }
        }
      } catch (e) {
        console.log(`  パターン${i+1}: エラー - ${e.message}`);
      }
    }

    console.log('🔄 ステップ4: サイドバーの強制表示テスト');

    if (foundHamburger) {
      console.log('🎯 ハンバーガーメニューをクリックしてサイドバーを開く');
      await foundHamburger.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: '.playwright-mcp/fixed-03-after-hamburger-click.png' });

      // サイドバーが開いた後の状態を確認
      const afterHamburgerState = await page.evaluate(() => {
        const elements = {
          mobileSidebar: document.querySelector('div.fixed.inset-y-0.left-0.z-40'),
          mobileOverlay: document.querySelector('div.fixed.inset-0.z-40.bg-black\\/50'),
          closeButton: Array.from(document.querySelectorAll('button')).find(btn =>
            btn.textContent && btn.textContent.includes('サイドバーを閉じる'))
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

      console.log('📊 ハンバーガークリック後の状態:');
      for (const [name, state] of Object.entries(afterHamburgerState)) {
        console.log(`  ${name}: 存在=${state.exists}, 表示=${state.visible || 'N/A'}`);
      }

      console.log('🎯 ステップ5: オーバーレイクリックテスト');

      // オーバーレイをクリック
      const overlay = page.locator('div.fixed.inset-0.z-40.bg-black\\/50');
      if (await overlay.isVisible({ timeout: 2000 })) {
        console.log('✅ オーバーレイが表示中 - クリックします');

        await overlay.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: '.playwright-mcp/fixed-04-after-overlay-click.png' });

        // オーバーレイクリック後の状態確認
        const afterOverlayState = await page.evaluate(() => {
          const hamburger = document.querySelector('button.fixed.left-4.top-4.z-50.md\\:hidden');
          const sidebar = document.querySelector('div.fixed.inset-y-0.left-0.z-40');
          const overlay = document.querySelector('div.fixed.inset-0.z-40.bg-black\\/50');

          return {
            hamburgerVisible: hamburger ? hamburger.offsetParent !== null : false,
            sidebarVisible: sidebar ? sidebar.offsetParent !== null : false,
            overlayVisible: overlay ? overlay.offsetParent !== null : false,
            hamburgerDisplay: hamburger ? getComputedStyle(hamburger).display : 'N/A',
            hamburgerClasses: hamburger ? hamburger.className : 'N/A'
          };
        });

        console.log('📊 オーバーレイクリック後の詳細状態:');
        for (const [key, value] of Object.entries(afterOverlayState)) {
          console.log(`  ${key}: ${value}`);
        }

        // ハンバーガーメニューが表示されているかどうかを確認
        if (afterOverlayState.hamburgerVisible) {
          console.log('✅ SUCCESS: ハンバーガーメニューが正常に表示されました！');
        } else {
          console.log('❌ ISSUE: オーバーレイクリック後もハンバーガーメニューが表示されていません');
          console.log('🔍 ANALYSIS: ハンバーガーメニューのCSS表示状態:', afterOverlayState.hamburgerDisplay);
          console.log('🔍 ANALYSIS: ハンバーガーメニューのCSSクラス:', afterOverlayState.hamburgerClasses);
        }
      }

      console.log('🔄 ステップ6: サイドバーを再度開いて閉じるボタンテスト');

      // ハンバーガーメニューが見える場合、再度クリックしてサイドバーを開く
      if (await foundHamburger.isVisible({ timeout: 2000 })) {
        await foundHamburger.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: '.playwright-mcp/fixed-05-sidebar-reopened.png' });

        // 閉じるボタンをクリック（テキストベースで検索）
        const closeButton = page.locator('button').filter({ hasText: 'サイドバーを閉じる' });
        if (await closeButton.isVisible({ timeout: 2000 })) {
          console.log('✅ 閉じるボタンが表示中 - クリックします');

          await closeButton.click();
          await page.waitForTimeout(1000);
          await page.screenshot({ path: '.playwright-mcp/fixed-06-after-close-button.png' });

          // 閉じるボタンクリック後の状態確認
          const afterCloseButtonState = await page.evaluate(() => {
            const hamburger = document.querySelector('button.fixed.left-4.top-4.z-50.md\\:hidden');
            const sidebar = document.querySelector('div.fixed.inset-y-0.left-0.z-40');
            const overlay = document.querySelector('div.fixed.inset-0.z-40.bg-black\\/50');

            return {
              hamburgerVisible: hamburger ? hamburger.offsetParent !== null : false,
              sidebarVisible: sidebar ? sidebar.offsetParent !== null : false,
              overlayVisible: overlay ? overlay.offsetParent !== null : false,
              hamburgerDisplay: hamburger ? getComputedStyle(hamburger).display : 'N/A',
              hamburgerClasses: hamburger ? hamburger.className : 'N/A'
            };
          });

          console.log('📊 閉じるボタンクリック後の詳細状態:');
          for (const [key, value] of Object.entries(afterCloseButtonState)) {
            console.log(`  ${key}: ${value}`);
          }

          if (afterCloseButtonState.hamburgerVisible) {
            console.log('✅ SUCCESS: 閉じるボタンでもハンバーガーメニューが正常に表示されました！');
          } else {
            console.log('❌ ISSUE: 閉じるボタンクリック後もハンバーガーメニューが表示されていません');
            console.log('🔍 ANALYSIS: この問題は閉じるボタン特有の問題の可能性があります');
          }
        }
      }
    } else {
      console.log('❌ CRITICAL: ハンバーガーメニューが見つかりません');
      console.log('🔍 DEBUG: 全ての button 要素を列挙します');

      const allButtons = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.map((btn, index) => ({
          index,
          className: btn.className,
          text: btn.textContent ? btn.textContent.substring(0, 30) : '',
          visible: btn.offsetParent !== null,
          style: btn.style.cssText
        }));
      });

      console.log('📋 全てのボタン要素:');
      allButtons.forEach(btn => {
        if (btn.className.includes('fixed') || btn.className.includes('hamburger') || btn.className.includes('menu')) {
          console.log(`  🎯 [${btn.index}] ${btn.className} - "${btn.text}" (visible: ${btn.visible})`);
        }
      });
    }

    console.log('📝 ステップ7: 最終まとめと問題特定');

    await page.screenshot({ path: '.playwright-mcp/fixed-07-final-state.png' });

    console.log('⏰ 手動確認のため20秒間ブラウザを開いたままにします');
    await page.waitForTimeout(20000);

  } catch (error) {
    console.error('❌ テスト中にエラーが発生:', error);
    await page.screenshot({ path: '.playwright-mcp/fixed-error.png' });
  } finally {
    await browser.close();
    console.log('🏁 サイドバー修正版テスト完了');
  }
})();