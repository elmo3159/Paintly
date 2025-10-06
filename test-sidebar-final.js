const { chromium, devices } = require('@playwright/test');

(async () => {
  console.log('🎯 修正版サイドバーテストを開始します...');

  const iPhone14 = devices['iPhone 14'];
  const browser = await chromium.launch({
    headless: false,
    slowMo: 800,
    devtools: false
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
      if (type === 'error' || type === 'warn' || msg.text().includes('sidebar')) {
        console.log(`🔍 [${type.toUpperCase()}]`, msg.text());
      }
    });
    page.on('pageerror', error => console.error('❌ ページエラー:', error.message));

    console.log('📱 ステップ1: サイトにアクセス');
    await page.goto('http://172.17.161.101:9090/auth/signin');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: '.playwright-mcp/final-01-signin.png' });

    console.log('🔐 ステップ2: ログイン');
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const signInButton = page.locator('button[type="submit"]');

    if (await emailInput.isVisible({ timeout: 5000 })) {
      await emailInput.fill('elmodayo3159@gmail.com');
      await passwordInput.fill('sanri3159');
      await signInButton.click();
      console.log('🔄 ログイン中...');
      await page.waitForTimeout(3000);
    }

    console.log('📍 ステップ3: 顧客ページに直接移動');
    await page.goto('http://172.17.161.101:9090/customer/009e75c8-b18d-4583-8b77-ec2623c575ee');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // サイドバーコンポーネントの読み込み待機
    await page.screenshot({ path: '.playwright-mcp/final-02-customer-page.png' });

    console.log('🔍 ステップ4: 修正後のサイドバー状態確認');

    // サイドバー要素の状態を詳細確認
    const sidebarState = await page.evaluate(() => {
      const elements = {
        mobileHamburger: document.querySelector('button.fixed.left-4.top-4.z-50.md\\:hidden'),
        mobileSidebar: document.querySelector('div.fixed.inset-y-0.left-0.z-50'),
        mobileOverlay: document.querySelector('div.fixed.inset-0.z-40.bg-black\\/50'),
        desktopSidebar: document.querySelector('div.hidden.md\\:flex.h-screen.w-64')
      };

      const result = {};
      for (const [name, element] of Object.entries(elements)) {
        if (element) {
          const rect = element.getBoundingClientRect();
          const styles = getComputedStyle(element);
          result[name] = {
            exists: true,
            visible: element.offsetParent !== null && rect.width > 0 && rect.height > 0,
            display: styles.display,
            zIndex: styles.zIndex,
            position: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
            className: element.className,
            innerHTML: element.innerHTML.substring(0, 50) + '...'
          };
        } else {
          result[name] = { exists: false };
        }
      }

      return {
        viewport: { width: window.innerWidth, height: window.innerHeight },
        isMobile: window.innerWidth < 768,
        elements: result
      };
    });

    console.log('📊 修正後のサイドバー状態:');
    console.log(`  📱 ビューポート: ${sidebarState.viewport.width}x${sidebarState.viewport.height} (モバイル: ${sidebarState.isMobile})`);

    for (const [name, state] of Object.entries(sidebarState.elements)) {
      if (state.exists) {
        console.log(`  ✅ ${name}:`);
        console.log(`     表示: ${state.visible}`);
        console.log(`     display: ${state.display}`);
        console.log(`     z-index: ${state.zIndex}`);
        console.log(`     位置: x=${state.position.x}, y=${state.position.y}, w=${state.position.width}, h=${state.position.height}`);
      } else {
        console.log(`  ❌ ${name}: 存在しません`);
      }
    }

    // ハンバーガーメニューが表示されているかチェック
    if (sidebarState.elements.mobileHamburger?.exists && sidebarState.elements.mobileHamburger?.visible) {
      console.log('🎉 SUCCESS: モバイルハンバーガーメニューが正常に表示されています！');

      console.log('🎯 ステップ5: ハンバーガーメニューをクリックしてサイドバーを開く');

      const hamburger = page.locator('button.fixed.left-4.top-4.z-50.md\\:hidden');
      await hamburger.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: '.playwright-mcp/final-03-sidebar-opened.png' });

      // サイドバーが開いた後の状態確認
      const afterOpenState = await page.evaluate(() => {
        const sidebar = document.querySelector('div.fixed.inset-y-0.left-0.z-50');
        const overlay = document.querySelector('div.fixed.inset-0.z-40.bg-black\\/50');
        const hamburger = document.querySelector('button.fixed.left-4.top-4.z-50.md\\:hidden');

        return {
          sidebarVisible: sidebar ? sidebar.offsetParent !== null : false,
          overlayVisible: overlay ? overlay.offsetParent !== null : false,
          hamburgerVisible: hamburger ? hamburger.offsetParent !== null : false
        };
      });

      console.log('📊 サイドバーオープン後:');
      console.log(`  サイドバー表示: ${afterOpenState.sidebarVisible}`);
      console.log(`  オーバーレイ表示: ${afterOpenState.overlayVisible}`);
      console.log(`  ハンバーガー表示: ${afterOpenState.hamburgerVisible}`);

      if (afterOpenState.sidebarVisible && afterOpenState.overlayVisible) {
        console.log('✅ SUCCESS: サイドバーとオーバーレイが正常に表示されました！');

        console.log('🔴 テスト6: オーバーレイクリック');

        const overlay = page.locator('div.fixed.inset-0.z-40.bg-black\\/50');
        await overlay.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: '.playwright-mcp/final-04-after-overlay-click.png' });

        // オーバーレイクリック後の状態確認
        const afterOverlayClick = await page.evaluate(() => {
          const sidebar = document.querySelector('div.fixed.inset-y-0.left-0.z-50');
          const overlay = document.querySelector('div.fixed.inset-0.z-40.bg-black\\/50');
          const hamburger = document.querySelector('button.fixed.left-4.top-4.z-50.md\\:hidden');

          return {
            sidebarVisible: sidebar ? sidebar.offsetParent !== null : false,
            overlayVisible: overlay ? overlay.offsetParent !== null : false,
            hamburgerVisible: hamburger ? hamburger.offsetParent !== null : false
          };
        });

        console.log('📊 オーバーレイクリック後:');
        console.log(`  サイドバー表示: ${afterOverlayClick.sidebarVisible}`);
        console.log(`  オーバーレイ表示: ${afterOverlayClick.overlayVisible}`);
        console.log(`  ハンバーガー表示: ${afterOverlayClick.hamburgerVisible}`);

        if (!afterOverlayClick.sidebarVisible && !afterOverlayClick.overlayVisible && afterOverlayClick.hamburgerVisible) {
          console.log('🎉 PERFECT: オーバーレイクリックで正常にサイドバーが閉じ、ハンバーガーメニューが表示されました！');
        } else {
          console.log('⚠️ WARNING: オーバーレイクリック後の状態に問題があります');
        }

        console.log('🔵 テスト7: ハンバーガー再クリック→閉じるボタンテスト');

        // ハンバーガーメニューを再度クリック
        if (afterOverlayClick.hamburgerVisible) {
          await hamburger.click();
          await page.waitForTimeout(1000);
          await page.screenshot({ path: '.playwright-mcp/final-05-sidebar-reopened.png' });

          // 閉じるボタンをクリック
          const closeButton = page.locator('button').filter({ hasText: 'サイドバーを閉じる' });
          if (await closeButton.isVisible({ timeout: 2000 })) {
            await closeButton.click();
            await page.waitForTimeout(1000);
            await page.screenshot({ path: '.playwright-mcp/final-06-after-close-button.png' });

            // 閉じるボタンクリック後の状態確認
            const afterCloseButton = await page.evaluate(() => {
              const sidebar = document.querySelector('div.fixed.inset-y-0.left-0.z-50');
              const overlay = document.querySelector('div.fixed.inset-0.z-40.bg-black\\/50');
              const hamburger = document.querySelector('button.fixed.left-4.top-4.z-50.md\\:hidden');

              return {
                sidebarVisible: sidebar ? sidebar.offsetParent !== null : false,
                overlayVisible: overlay ? overlay.offsetParent !== null : false,
                hamburgerVisible: hamburger ? hamburger.offsetParent !== null : false
              };
            });

            console.log('📊 閉じるボタンクリック後:');
            console.log(`  サイドバー表示: ${afterCloseButton.sidebarVisible}`);
            console.log(`  オーバーレイ表示: ${afterCloseButton.overlayVisible}`);
            console.log(`  ハンバーガー表示: ${afterCloseButton.hamburgerVisible}`);

            if (!afterCloseButton.sidebarVisible && !afterCloseButton.overlayVisible && afterCloseButton.hamburgerVisible) {
              console.log('🎉 PERFECT: 閉じるボタンでも正常にサイドバーが閉じ、ハンバーガーメニューが表示されました！');
              console.log('✅ 全てのテストが成功しました！モバイルサイドバーは正常に動作しています！');
            } else {
              console.log('❌ ISSUE: 閉じるボタンクリック後の状態に問題があります');
            }
          }
        }
      }
    } else {
      console.log('❌ CRITICAL: ハンバーガーメニューがまだ表示されていません');

      // デバッグ情報を出力
      const debugInfo = await page.evaluate(() => {
        const allButtons = Array.from(document.querySelectorAll('button'));
        const fixedElements = Array.from(document.querySelectorAll('.fixed'));

        return {
          totalButtons: allButtons.length,
          totalFixedElements: fixedElements.length,
          buttonClassNames: allButtons.map(btn => btn.className).slice(0, 10),
          fixedElementClassNames: fixedElements.map(el => el.className).slice(0, 10)
        };
      });

      console.log('🔍 デバッグ情報:');
      console.log(`  総ボタン数: ${debugInfo.totalButtons}`);
      console.log(`  総fixed要素数: ${debugInfo.totalFixedElements}`);
      console.log('  ボタンクラス名:', debugInfo.buttonClassNames);
      console.log('  Fixed要素クラス名:', debugInfo.fixedElementClassNames);
    }

    await page.screenshot({ path: '.playwright-mcp/final-07-final-state.png' });

    console.log('⏰ 手動確認のため20秒間ブラウザを開いたままにします');
    await page.waitForTimeout(20000);

  } catch (error) {
    console.error('❌ テスト中にエラーが発生:', error);
    await page.screenshot({ path: '.playwright-mcp/final-error.png' });
  } finally {
    await browser.close();
    console.log('🏁 修正版サイドバーテスト完了');
  }
})();