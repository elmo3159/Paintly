const { chromium, devices } = require('@playwright/test');

(async () => {
  console.log('🔍 認証付きサイドバーテストを開始します...');

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

    console.log('📱 ステップ1: サイトにアクセスして認証');
    await page.goto('http://172.17.161.101:9090');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: '.playwright-mcp/auth-01-initial.png' });

    // サインインページの場合は認証を実行
    const currentUrl = page.url();
    if (currentUrl.includes('signin') || currentUrl.includes('auth')) {
      console.log('🔐 認証が必要です - メールアドレスとパスワードでログイン');

      // メールアドレスとパスワードでログイン
      const emailInput = page.locator('input[type="email"]');
      const passwordInput = page.locator('input[type="password"]');
      const signInButton = page.locator('button[type="submit"]');

      if (await emailInput.isVisible({ timeout: 5000 })) {
        await emailInput.fill('elmodayo3159@gmail.com');
        await passwordInput.fill('sanri3159');
        await page.screenshot({ path: '.playwright-mcp/auth-02-credentials-filled.png' });

        await signInButton.click();
        console.log('🔄 ログイン試行中...');

        // リダイレクトを待機
        await page.waitForURL(/dashboard|customer/, { timeout: 15000 }).catch(() => {
          console.log('⚠️ ダッシュボードへのリダイレクトがタイムアウト - 手動で移動します');
        });
      }
    }

    // ダッシュボードに移動
    console.log('📍 ダッシュボードに移動');
    await page.goto('http://172.17.161.101:9090/dashboard', { waitUntil: 'networkidle' });
    await page.screenshot({ path: '.playwright-mcp/auth-03-dashboard.png' });

    // 顧客ページリンクを探して移動
    console.log('🎯 顧客ページに移動');

    // 新規顧客ページを作成（サイドバーが開いた状態で）
    const newCustomerButton = page.locator('button').filter({ hasText: '新規顧客ページ作成' });
    if (await newCustomerButton.isVisible({ timeout: 5000 })) {
      await newCustomerButton.click();
      await page.waitForNavigation({ timeout: 10000 });
      console.log('✅ 新規顧客ページを作成しました');
    } else {
      // 既存の顧客ページに移動
      await page.goto('http://172.17.161.101:9090/customer/009e75c8-b18d-4583-8b77-ec2623c575ee', { waitUntil: 'networkidle' });
    }

    await page.screenshot({ path: '.playwright-mcp/auth-04-customer-page.png' });

    console.log('🔍 ステップ2: 初期サイドバー状態の詳細確認');

    // サイドバーの状態を確認
    const initialSidebarState = await page.evaluate(() => {
      const elements = {
        mobileSidebar: document.querySelector('div.fixed.inset-y-0.left-0.z-40'),
        mobileOverlay: document.querySelector('div.fixed.inset-0.z-40.bg-black\\/50'),
        mobileHamburger: document.querySelector('button.fixed.left-4.top-4.z-50.md\\:hidden'),
        desktopSidebar: document.querySelector('div.hidden.md\\:flex.h-screen.w-64'),
        closeButton: Array.from(document.querySelectorAll('button')).find(btn =>
          btn.textContent && btn.textContent.includes('サイドバーを閉じる'))
      };

      const result = {};
      for (const [name, element] of Object.entries(elements)) {
        if (element) {
          const rect = element.getBoundingClientRect();
          const styles = getComputedStyle(element);
          result[name] = {
            exists: true,
            visible: element.offsetParent !== null,
            display: styles.display,
            visibility: styles.visibility,
            position: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
            className: element.className,
            computedClasses: {
              'md:hidden': styles.getPropertyValue('--tw-hidden') || 'N/A'
            }
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

    console.log('📊 初期サイドバー状態:');
    console.log(`  📱 ビューポート: ${initialSidebarState.viewport.width}x${initialSidebarState.viewport.height} (モバイル: ${initialSidebarState.isMobile})`);
    for (const [name, state] of Object.entries(initialSidebarState.elements)) {
      if (state.exists) {
        console.log(`  ✅ ${name}: 表示=${state.visible}, display=${state.display}`);
      } else {
        console.log(`  ❌ ${name}: 存在しません`);
      }
    }

    console.log('🎯 ステップ3: モバイルサイドバーの動作テスト');

    // モバイルサイドバーが開いている場合はテストを実行
    if (initialSidebarState.elements.mobileSidebar?.exists && initialSidebarState.elements.mobileSidebar?.visible) {
      console.log('✅ モバイルサイドバーが初期表示されています');

      console.log('🔴 テスト1: オーバーレイクリック');

      // オーバーレイクリック前の状態記録
      await page.screenshot({ path: '.playwright-mcp/auth-05-before-overlay-click.png' });

      const overlay = page.locator('div.fixed.inset-0.z-40.bg-black\\/50');
      if (await overlay.isVisible({ timeout: 2000 })) {
        await overlay.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: '.playwright-mcp/auth-06-after-overlay-click.png' });

        // オーバーレイクリック後の状態確認
        const afterOverlayState = await page.evaluate(() => {
          const hamburger = document.querySelector('button.fixed.left-4.top-4.z-50.md\\:hidden');
          const sidebar = document.querySelector('div.fixed.inset-y-0.left-0.z-40');
          const overlay = document.querySelector('div.fixed.inset-0.z-40.bg-black\\/50');

          return {
            hamburgerExists: !!hamburger,
            hamburgerVisible: hamburger ? hamburger.offsetParent !== null : false,
            hamburgerDisplay: hamburger ? getComputedStyle(hamburger).display : 'N/A',
            hamburgerClasses: hamburger ? hamburger.className : 'N/A',
            sidebarVisible: sidebar ? sidebar.offsetParent !== null : false,
            overlayVisible: overlay ? overlay.offsetParent !== null : false
          };
        });

        console.log('📊 オーバーレイクリック後:');
        console.log(`  ハンバーガー存在: ${afterOverlayState.hamburgerExists}`);
        console.log(`  ハンバーガー表示: ${afterOverlayState.hamburgerVisible}`);
        console.log(`  ハンバーガーdisplay: ${afterOverlayState.hamburgerDisplay}`);
        console.log(`  サイドバー表示: ${afterOverlayState.sidebarVisible}`);
        console.log(`  オーバーレイ表示: ${afterOverlayState.overlayVisible}`);

        if (afterOverlayState.hamburgerVisible) {
          console.log('✅ SUCCESS: オーバーレイクリック後にハンバーガーメニューが表示されました！');
        } else {
          console.log('❌ ISSUE: オーバーレイクリック後もハンバーガーメニューが表示されていません');
        }

        console.log('🔵 テスト2: ハンバーガークリック→閉じるボタンクリック');

        // ハンバーガーメニューをクリックしてサイドバーを再度開く
        const hamburger = page.locator('button.fixed.left-4.top-4.z-50.md\\:hidden');
        if (await hamburger.isVisible({ timeout: 2000 })) {
          await hamburger.click();
          await page.waitForTimeout(1000);
          await page.screenshot({ path: '.playwright-mcp/auth-07-sidebar-reopened.png' });

          // 閉じるボタンをクリック
          const closeButton = page.locator('button').filter({ hasText: 'サイドバーを閉じる' });
          if (await closeButton.isVisible({ timeout: 2000 })) {
            await closeButton.click();
            await page.waitForTimeout(1000);
            await page.screenshot({ path: '.playwright-mcp/auth-08-after-close-button.png' });

            // 閉じるボタンクリック後の状態確認
            const afterCloseButtonState = await page.evaluate(() => {
              const hamburger = document.querySelector('button.fixed.left-4.top-4.z-50.md\\:hidden');
              const sidebar = document.querySelector('div.fixed.inset-y-0.left-0.z-40');
              const overlay = document.querySelector('div.fixed.inset-0.z-40.bg-black\\/50');

              return {
                hamburgerExists: !!hamburger,
                hamburgerVisible: hamburger ? hamburger.offsetParent !== null : false,
                hamburgerDisplay: hamburger ? getComputedStyle(hamburger).display : 'N/A',
                sidebarVisible: sidebar ? sidebar.offsetParent !== null : false,
                overlayVisible: overlay ? overlay.offsetParent !== null : false
              };
            });

            console.log('📊 閉じるボタンクリック後:');
            console.log(`  ハンバーガー存在: ${afterCloseButtonState.hamburgerExists}`);
            console.log(`  ハンバーガー表示: ${afterCloseButtonState.hamburgerVisible}`);
            console.log(`  ハンバーガーdisplay: ${afterCloseButtonState.hamburgerDisplay}`);
            console.log(`  サイドバー表示: ${afterCloseButtonState.sidebarVisible}`);
            console.log(`  オーバーレイ表示: ${afterCloseButtonState.overlayVisible}`);

            if (afterCloseButtonState.hamburgerVisible) {
              console.log('✅ SUCCESS: 閉じるボタンクリック後もハンバーガーメニューが表示されました！');
              console.log('🎉 CONCLUSION: 両方のパターンで正常に動作しています！');
            } else {
              console.log('❌ ISSUE: 閉じるボタンクリック後はハンバーガーメニューが表示されていません');
              console.log('🔍 ANALYSIS: これが報告された問題の症状です');
            }
          }
        }
      }
    } else {
      console.log('ℹ️ モバイルサイドバーが初期表示されていません - ハンバーガーメニューをクリックして開きます');

      const hamburger = page.locator('button.fixed.left-4.top-4.z-50.md\\:hidden');
      if (await hamburger.isVisible({ timeout: 2000 })) {
        console.log('✅ ハンバーガーメニューが表示されています');
        await hamburger.click();
        await page.waitForTimeout(1000);

        // ここから上記のテストを実行
        console.log('🔄 サイドバーが開きました - テストを継続します');
        // ... 上記のテストロジックを繰り返し
      } else {
        console.log('❌ CRITICAL: ハンバーガーメニューが見つかりません');
      }
    }

    console.log('📝 ステップ4: React DevTools的な状態確認');

    // より詳細なReact状態を確認
    const reactStateAnalysis = await page.evaluate(() => {
      // React DevToolsのような情報を取得
      const analysis = {
        timestamp: new Date().toISOString(),
        reactVersion: window.React?.version || 'Unknown',
        environment: process?.env?.NODE_ENV || 'Unknown'
      };

      // 全てのボタン要素を解析
      const buttons = Array.from(document.querySelectorAll('button'));
      analysis.buttons = buttons.map((btn, index) => ({
        index,
        text: btn.textContent?.substring(0, 30) || '',
        className: btn.className,
        visible: btn.offsetParent !== null,
        hasClickHandler: !!btn.onclick || btn.hasAttribute('onclick'),
        position: (() => {
          const rect = btn.getBoundingClientRect();
          return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
        })()
      })).filter(btn =>
        btn.className.includes('fixed') ||
        btn.text.includes('サイドバー') ||
        btn.text.includes('Menu') ||
        btn.className.includes('hamburger')
      );

      return analysis;
    });

    console.log('🔬 React状態分析:');
    console.log(`  React Version: ${reactStateAnalysis.reactVersion}`);
    console.log(`  Environment: ${reactStateAnalysis.environment}`);
    console.log('  関連ボタン要素:');
    reactStateAnalysis.buttons.forEach(btn => {
      console.log(`    [${btn.index}] "${btn.text}" (visible: ${btn.visible})`);
      console.log(`        classes: ${btn.className}`);
    });

    await page.screenshot({ path: '.playwright-mcp/auth-09-final-analysis.png' });

    console.log('⏰ 手動確認のため30秒間ブラウザを開いたままにします');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('❌ テスト中にエラーが発生:', error);
    await page.screenshot({ path: '.playwright-mcp/auth-error.png' });
  } finally {
    await browser.close();
    console.log('🏁 認証付きサイドバーテスト完了');
  }
})();