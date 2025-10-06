const { chromium, devices } = require('@playwright/test');

(async () => {
  console.log('🔍 モバイルサイドバーデバッグテストを開始します...');

  const iPhone14 = devices['iPhone 14'];
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000,
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

    console.log('📱 ステップ1: サイトにアクセス');
    await page.goto('http://172.17.161.101:9090');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: '.playwright-mcp/sidebar-01-initial.png' });

    console.log('🔐 ステップ2: ログイン');
    // サインインページの確認
    if (page.url().includes('signin')) {
      console.log('認証ページにリダイレクト - ログインします');

      // Googleサインインボタンをクリック
      const googleSignInButton = page.locator('button:has-text("Googleでサインイン")');
      if (await googleSignInButton.isVisible({ timeout: 5000 })) {
        await googleSignInButton.click();
        await page.waitForTimeout(2000);
      }

      // または通常のログインフォーム
      const emailInput = page.locator('input[type="email"]');
      const passwordInput = page.locator('input[type="password"]');
      const signInButton = page.locator('button[type="submit"]');

      if (await emailInput.isVisible({ timeout: 5000 })) {
        await emailInput.fill('elmodayo3159@gmail.com');
        await passwordInput.fill('sanri3159');
        await signInButton.click();
        await page.waitForNavigation({ timeout: 10000 });
      }
    }

    console.log('📍 ステップ3: 顧客ページに移動');
    // ダッシュボードから顧客ページに移動
    await page.goto('http://172.17.161.101:9090/dashboard', { waitUntil: 'networkidle' });
    await page.screenshot({ path: '.playwright-mcp/sidebar-02-dashboard.png' });

    // 顧客ページリンクを探す
    const customerLinks = await page.locator('a[href^="/customer/"]').all();
    if (customerLinks.length > 0) {
      console.log(`${customerLinks.length}個の顧客ページを発見`);
      await customerLinks[0].click();
      await page.waitForLoadState('networkidle');
    } else {
      // 新規顧客ページを作成
      const newCustomerButton = page.locator('button:has-text("新規顧客ページ作成")');
      if (await newCustomerButton.isVisible({ timeout: 5000 })) {
        await newCustomerButton.click();
        await page.waitForNavigation({ timeout: 10000 });
      }
    }

    await page.screenshot({ path: '.playwright-mcp/sidebar-03-customer-page.png' });

    console.log('🔍 ステップ4: サイドバーの初期状態を確認');

    // サイドバーコンポーネントの存在確認
    const sidebarElements = {
      desktopSidebar: page.locator('div.hidden.md\\:flex.h-screen.w-64'),
      mobileSidebar: page.locator('div.fixed.inset-y-0.left-0.z-40'),
      mobileOverlay: page.locator('div.fixed.inset-0.z-40.bg-black\\/50'),
      desktopHamburger: page.locator('button.fixed.left-4.top-4.z-50.hidden.md\\:block'),
      mobileHamburger: page.locator('button.fixed.left-4.top-4.z-50.md\\:hidden'),
      closeButton: page.locator('button:has-text("サイドバーを閉じる")')
    };

    console.log('📊 要素の可視性チェック:');
    for (const [name, locator] of Object.entries(sidebarElements)) {
      const isVisible = await locator.isVisible({ timeout: 1000 }).catch(() => false);
      const count = await locator.count();
      console.log(`  ${name}: 可視=${isVisible}, 要素数=${count}`);
    }

    // 現在の状態をスクリーンショット
    await page.screenshot({ path: '.playwright-mcp/sidebar-04-initial-state.png' });

    console.log('🎯 ステップ5: オーバーレイクリックテスト');

    // モバイルサイドバーが開いている場合、オーバーレイをクリック
    if (await sidebarElements.mobileOverlay.isVisible({ timeout: 2000 })) {
      console.log('✅ モバイルオーバーレイが表示されています');

      // オーバーレイクリック前の状態を記録
      const beforeOverlayClick = await page.evaluate(() => {
        const sidebar = document.querySelector('div.fixed.inset-y-0.left-0.z-40');
        const overlay = document.querySelector('div.fixed.inset-0.z-40.bg-black\\/50');
        const mobileHamburger = document.querySelector('button.fixed.left-4.top-4.z-50.md\\:hidden');
        return {
          sidebarVisible: sidebar ? getComputedStyle(sidebar).display !== 'none' : false,
          overlayVisible: overlay ? getComputedStyle(overlay).display !== 'none' : false,
          hamburgerVisible: mobileHamburger ? getComputedStyle(mobileHamburger).display !== 'none' : false
        };
      });
      console.log('オーバーレイクリック前:', beforeOverlayClick);

      // オーバーレイをクリック
      await sidebarElements.mobileOverlay.click();
      await page.waitForTimeout(500);

      // オーバーレイクリック後の状態を記録
      const afterOverlayClick = await page.evaluate(() => {
        const sidebar = document.querySelector('div.fixed.inset-y-0.left-0.z-40');
        const overlay = document.querySelector('div.fixed.inset-0.z-40.bg-black\\/50');
        const mobileHamburger = document.querySelector('button.fixed.left-4.top-4.z-50.md\\:hidden');
        return {
          sidebarVisible: sidebar ? getComputedStyle(sidebar).display !== 'none' : false,
          overlayVisible: overlay ? getComputedStyle(overlay).display !== 'none' : false,
          hamburgerVisible: mobileHamburger ? getComputedStyle(mobileHamburger).display !== 'none' : false
        };
      });
      console.log('オーバーレイクリック後:', afterOverlayClick);

      await page.screenshot({ path: '.playwright-mcp/sidebar-05-after-overlay-click.png' });
    }

    console.log('🔄 ステップ6: サイドバーを再度開いてボタンクリックテスト');

    // ハンバーガーメニューが表示されている場合、クリックしてサイドバーを開く
    if (await sidebarElements.mobileHamburger.isVisible({ timeout: 2000 })) {
      console.log('✅ モバイルハンバーガーメニューが表示されています');
      await sidebarElements.mobileHamburger.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: '.playwright-mcp/sidebar-06-sidebar-reopened.png' });
    }

    // 閉じるボタンが表示されている場合、クリック
    if (await sidebarElements.closeButton.isVisible({ timeout: 2000 })) {
      console.log('✅ 閉じるボタンが表示されています');

      // ボタンクリック前の状態を記録
      const beforeButtonClick = await page.evaluate(() => {
        const sidebar = document.querySelector('div.fixed.inset-y-0.left-0.z-40');
        const overlay = document.querySelector('div.fixed.inset-0.z-40.bg-black\\/50');
        const mobileHamburger = document.querySelector('button.fixed.left-4.top-4.z-50.md\\:hidden');
        return {
          sidebarVisible: sidebar ? getComputedStyle(sidebar).display !== 'none' : false,
          overlayVisible: overlay ? getComputedStyle(overlay).display !== 'none' : false,
          hamburgerVisible: mobileHamburger ? getComputedStyle(mobileHamburger).display !== 'none' : false
        };
      });
      console.log('ボタンクリック前:', beforeButtonClick);

      // 閉じるボタンをクリック
      await sidebarElements.closeButton.click();
      await page.waitForTimeout(500);

      // ボタンクリック後の状態を記録
      const afterButtonClick = await page.evaluate(() => {
        const sidebar = document.querySelector('div.fixed.inset-y-0.left-0.z-40');
        const overlay = document.querySelector('div.fixed.inset-0.z-40.bg-black\\/50');
        const mobileHamburger = document.querySelector('button.fixed.left-4.top-4.z-50.md\\:hidden');
        return {
          sidebarVisible: sidebar ? getComputedStyle(sidebar).display !== 'none' : false,
          overlayVisible: overlay ? getComputedStyle(overlay).display !== 'none' : false,
          hamburgerVisible: mobileHamburger ? getComputedStyle(mobileHamburger).display !== 'none' : false
        };
      });
      console.log('ボタンクリック後:', afterButtonClick);

      await page.screenshot({ path: '.playwright-mcp/sidebar-07-after-button-click.png' });
    }

    console.log('🔬 ステップ7: 詳細なReact状態の調査');

    // React Dev Tools的な情報を取得
    const reactState = await page.evaluate(() => {
      // サイドバーコンポーネントを探す
      const sidebarComponent = document.querySelector('[data-testid="sidebar"]') ||
                               document.querySelector('div.hidden.md\\:flex') ||
                               document.querySelector('div.fixed.inset-y-0');

      if (sidebarComponent) {
        // React Fiber情報を取得（開発環境の場合）
        const fiberKey = Object.keys(sidebarComponent).find(key => key.startsWith('__reactFiber'));
        const propsKey = Object.keys(sidebarComponent).find(key => key.startsWith('__reactProps'));

        return {
          hasFiber: !!fiberKey,
          hasProps: !!propsKey,
          classNames: sidebarComponent.className,
          style: sidebarComponent.style.cssText
        };
      }
      return { error: 'Sidebar component not found' };
    });
    console.log('React状態情報:', reactState);

    console.log('📝 ステップ8: 最終分析');

    // 最終的な全要素の状態を確認
    const finalState = await page.evaluate(() => {
      const elements = {
        desktopSidebar: document.querySelector('div.hidden.md\\:flex.h-screen.w-64'),
        mobileSidebar: document.querySelector('div.fixed.inset-y-0.left-0.z-40'),
        mobileOverlay: document.querySelector('div.fixed.inset-0.z-40.bg-black\\/50'),
        desktopHamburger: document.querySelector('button.fixed.left-4.top-4.z-50.hidden.md\\:block'),
        mobileHamburger: document.querySelector('button.fixed.left-4.top-4.z-50.md\\:hidden')
      };

      const result = {};
      for (const [name, element] of Object.entries(elements)) {
        if (element) {
          result[name] = {
            exists: true,
            visible: getComputedStyle(element).display !== 'none',
            className: element.className,
            style: element.style.cssText
          };
        } else {
          result[name] = { exists: false };
        }
      }
      return result;
    });

    console.log('🏁 最終状態分析:');
    for (const [name, state] of Object.entries(finalState)) {
      console.log(`  ${name}:`, state);
    }

    await page.screenshot({ path: '.playwright-mcp/sidebar-08-final-state.png' });

    console.log('⏰ ブラウザを20秒間開いたままにします（手動確認用）');
    await page.waitForTimeout(20000);

  } catch (error) {
    console.error('❌ テスト中にエラーが発生:', error);
    await page.screenshot({ path: '.playwright-mcp/sidebar-error.png' });
  } finally {
    await browser.close();
    console.log('🏁 モバイルサイドバーデバッグテスト完了');
  }
})();