const { chromium, devices } = require('@playwright/test');

(async () => {
  console.log('🔍 シンプルページテストを開始します...');

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
    console.log('📱 ステップ1: ダッシュボードにアクセス');
    await page.goto('http://172.17.161.101:9090/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '.playwright-mcp/simple-01-dashboard.png' });

    console.log('🔍 ステップ2: ダッシュボードでサイドバー確認');

    const dashboardState = await page.evaluate(() => {
      const elements = {
        mobileHamburger: document.querySelector('button.fixed.left-4.top-4.z-50.md\\:hidden'),
        mobileSidebar: document.querySelector('div.fixed.inset-y-0.left-0'),
        desktopSidebar: document.querySelector('div.hidden.md\\:flex'),
        allSidebarElements: document.querySelectorAll('[class*="sidebar"]'),
        allFixedElements: document.querySelectorAll('.fixed'),
        body: document.body
      };

      return {
        url: window.location.href,
        viewport: { width: window.innerWidth, height: window.innerHeight },
        bodyClasses: elements.body.className,
        mobileHamburgerExists: !!elements.mobileHamburger,
        mobileSidebarExists: !!elements.mobileSidebar,
        desktopSidebarExists: !!elements.desktopSidebar,
        sidebarElementsCount: elements.allSidebarElements.length,
        fixedElementsCount: elements.allFixedElements.length,
        pageTitle: document.title,
        hasReact: typeof window.React !== 'undefined'
      };
    });

    console.log('📊 ダッシュボード状態:');
    console.log(`  URL: ${dashboardState.url}`);
    console.log(`  ページタイトル: ${dashboardState.pageTitle}`);
    console.log(`  ビューポート: ${dashboardState.viewport.width}x${dashboardState.viewport.height}`);
    console.log(`  React存在: ${dashboardState.hasReact}`);
    console.log(`  モバイルハンバーガー: ${dashboardState.mobileHamburgerExists}`);
    console.log(`  モバイルサイドバー: ${dashboardState.mobileSidebarExists}`);
    console.log(`  デスクトップサイドバー: ${dashboardState.desktopSidebarExists}`);
    console.log(`  サイドバー要素数: ${dashboardState.sidebarElementsCount}`);
    console.log(`  Fixed要素数: ${dashboardState.fixedElementsCount}`);

    console.log('📍 ステップ3: 直接ルートにアクセス');
    await page.goto('http://172.17.161.101:9090/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '.playwright-mcp/simple-02-root.png' });

    const rootState = await page.evaluate(() => {
      return {
        url: window.location.href,
        pageTitle: document.title,
        bodyHTML: document.body.innerHTML.substring(0, 200) + '...'
      };
    });

    console.log('📊 ルート状態:');
    console.log(`  URL: ${rootState.url}`);
    console.log(`  ページタイトル: ${rootState.pageTitle}`);
    console.log(`  Body HTML: ${rootState.bodyHTML}`);

    console.log('⏰ 手動確認のため20秒間ブラウザを開いたままにします');
    await page.waitForTimeout(20000);

  } catch (error) {
    console.error('❌ テスト中にエラーが発生:', error);
    await page.screenshot({ path: '.playwright-mcp/simple-error.png' });
  } finally {
    await browser.close();
    console.log('🏁 シンプルページテスト完了');
  }
})();