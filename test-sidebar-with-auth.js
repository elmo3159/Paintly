const { chromium } = require('playwright');

async function runSidebarVerificationWithAuth() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  try {
    console.log('=== 認証付きサイドバー確認開始 ===');
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    // コンソールエラーをキャッチ
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console Error:', msg.text());
      }
    });

    // 1. サイトにアクセス
    console.log('1. サイトにアクセス中...');
    await page.goto('http://172.17.161.101:9090', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('現在のURL:', page.url());
    await page.screenshot({ path: '.playwright-mcp/auth-01-signin-page.png', fullPage: true });

    // 2. Google OAuthでサインイン
    console.log('2. Google OAuthでサインイン試行中...');

    try {
      // 「Googleで始める」ボタンを探してクリック
      const googleButton = page.locator('button:has-text("Googleで始める")');
      if (await googleButton.isVisible({ timeout: 3000 })) {
        console.log('「Googleで始める」ボタンが見つかりました');
        await googleButton.click();
        console.log('Googleサインインボタンをクリックしました');

        // Google認証ページの読み込み待機
        await page.waitForTimeout(5000);
        await page.screenshot({ path: '.playwright-mcp/auth-02-google-auth.png', fullPage: true });

        // Google認証が完了してリダイレクトされるまで待機
        await page.waitForURL('**/dashboard**', { timeout: 30000 });
        console.log('ダッシュボードにリダイレクトされました');

      } else {
        console.log('「Googleで始める」ボタンが見つかりません');

        // 他のGoogle認証ボタンを探す
        const altSelectors = [
          'button:has-text("Googleで")',
          '[data-provider="google"]',
          'button[type="button"]:has-text("Google")'
        ];

        for (const selector of altSelectors) {
          try {
            const button = page.locator(selector);
            if (await button.isVisible({ timeout: 2000 })) {
              console.log(`代替Googleボタンが見つかりました: ${selector}`);
              await button.click();
              await page.waitForTimeout(5000);
              break;
            }
          } catch (e) {
            // 次を試す
          }
        }
      }
    } catch (authError) {
      console.log('Google認証エラー:', authError.message);
      console.log('認証なしでダッシュボードに直接アクセスを試行します');
      await page.goto('http://172.17.161.101:9090/dashboard', { waitUntil: 'networkidle' });
    }

    await page.waitForTimeout(3000);
    console.log('現在のURL:', page.url());
    await page.screenshot({ path: '.playwright-mcp/auth-03-after-signin.png', fullPage: true });

    // 3. ダッシュボードでサイドバーの確認
    console.log('3. ダッシュボードでサイドバーの確認...');

    // サイドバーの存在確認
    const sidebarSelectors = [
      '[data-testid="sidebar"]',
      '.sidebar',
      'aside',
      'nav[aria-label*="サイドバー"]',
      'nav[aria-label*="sidebar"]',
      '.fixed.left-0', // Tailwind CSSでよく使われるサイドバーのクラス
      '.w-64' // サイドバーの幅を指定するクラス
    ];

    let sidebarElement = null;
    for (const selector of sidebarSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          console.log(`サイドバーが見つかりました: ${selector}`);
          sidebarElement = element;

          // サイドバーの境界ボックスを取得
          const boundingBox = await element.boundingBox();
          console.log('サイドバーの位置とサイズ:', boundingBox);
          break;
        }
      } catch (e) {
        // 次を試す
      }
    }

    if (!sidebarElement) {
      console.log('⚠️ サイドバーが見つかりません');
    }

    // 4. 「←サイドバーを閉じる」ボタンの確認
    console.log('4. 「←サイドバーを閉じる」ボタンの確認...');

    const closeSidebarSelectors = [
      'button:has-text("←サイドバーを閉じる")',
      'button:has-text("サイドバーを閉じる")',
      'button:has-text("←")',
      'button:has-text("×")',
      '[data-testid="close-sidebar"]',
      '[aria-label*="閉じる"]',
      '[aria-label*="close"]',
      '.close-sidebar',
      'button[title*="閉じる"]'
    ];

    let closeSidebarButton = null;
    for (const selector of closeSidebarSelectors) {
      try {
        const button = page.locator(selector);
        if (await button.isVisible({ timeout: 2000 })) {
          console.log(`✅ 「←サイドバーを閉じる」ボタンが見つかりました: ${selector}`);
          closeSidebarButton = button;

          const boundingBox = await button.boundingBox();
          console.log('ボタンの位置:', boundingBox);

          // ボタンのテキスト内容を確認
          const textContent = await button.textContent();
          console.log('ボタンのテキスト:', textContent);
          break;
        }
      } catch (e) {
        // 次を試す
      }
    }

    if (!closeSidebarButton) {
      console.log('❌ 「←サイドバーを閉じる」ボタンが見つかりません');
    }

    // 5. 新規顧客ページ作成ボタンの確認
    console.log('5. 新規顧客ページ作成ボタンの確認...');

    const newCustomerSelectors = [
      'button:has-text("＋")',
      'button:has-text("+")',
      'button:has-text("新規")',
      'button:has-text("新規顧客")',
      '[data-testid="new-customer"]',
      '[aria-label*="新規"]',
      '.new-customer',
      'a[href*="new"]'
    ];

    let newCustomerButton = null;
    for (const selector of newCustomerSelectors) {
      try {
        const button = page.locator(selector);
        if (await button.isVisible({ timeout: 2000 })) {
          console.log(`✅ 新規顧客ページ作成ボタンが見つかりました: ${selector}`);
          newCustomerButton = button;

          const boundingBox = await button.boundingBox();
          console.log('ボタンの位置:', boundingBox);

          const textContent = await button.textContent();
          console.log('ボタンのテキスト:', textContent);
          break;
        }
      } catch (e) {
        // 次を試す
      }
    }

    if (!newCustomerButton) {
      console.log('❌ 新規顧客ページ作成ボタンが見つかりません');
    }

    // 6. ボタンの位置関係を確認
    if (closeSidebarButton && newCustomerButton) {
      console.log('6. ボタンの位置関係を確認...');

      const closeBtnBox = await closeSidebarButton.boundingBox();
      const newCustomerBtnBox = await newCustomerButton.boundingBox();

      if (closeBtnBox && newCustomerBtnBox) {
        if (closeBtnBox.y < newCustomerBtnBox.y) {
          console.log('✅ 「←サイドバーを閉じる」ボタンが新規顧客ページ作成ボタンの上に配置されています');
        } else {
          console.log('⚠️ ボタンの位置関係が期待と異なります');
        }

        console.log('閉じるボタンのY座標:', closeBtnBox.y);
        console.log('新規顧客ボタンのY座標:', newCustomerBtnBox.y);
      }
    }

    // 7. サイドバーを閉じるボタンのクリックテスト
    if (closeSidebarButton) {
      console.log('7. サイドバーを閉じるボタンのクリックテスト...');

      try {
        await closeSidebarButton.click();
        console.log('✅ 「←サイドバーを閉じる」ボタンをクリックしました');

        await page.waitForTimeout(1000);
        await page.screenshot({ path: '.playwright-mcp/auth-04-sidebar-closed.png', fullPage: true });

        // サイドバーが閉じられたかを確認
        if (sidebarElement) {
          const isVisible = await sidebarElement.isVisible();
          if (!isVisible) {
            console.log('✅ サイドバーが正常に閉じられました');
          } else {
            console.log('⚠️ サイドバーがまだ表示されています');
          }
        }
      } catch (e) {
        console.log('❌ ボタンクリック時にエラー:', e.message);
      }
    }

    // 8. モバイル表示での確認
    console.log('\n8. モバイル表示での確認...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '.playwright-mcp/auth-05-mobile-view.png', fullPage: true });

    // モバイルでのハンバーガーメニュー確認
    const hamburgerSelectors = [
      'button:has-text("☰")',
      '[data-testid="hamburger-menu"]',
      '[aria-label*="メニュー"]',
      '[aria-label*="menu"]',
      '.hamburger',
      'button.md\\:hidden' // モバイルでのみ表示されるボタン
    ];

    let hamburgerFound = false;
    for (const selector of hamburgerSelectors) {
      try {
        const button = page.locator(selector);
        if (await button.isVisible({ timeout: 2000 })) {
          console.log(`✅ モバイル: ハンバーガーメニューが見つかりました: ${selector}`);
          hamburgerFound = true;

          await button.click();
          await page.waitForTimeout(1000);
          await page.screenshot({ path: '.playwright-mcp/auth-06-mobile-sidebar-opened.png', fullPage: true });
          break;
        }
      } catch (e) {
        // 次を試す
      }
    }

    if (!hamburgerFound) {
      console.log('❌ モバイル: ハンバーガーメニューが見つかりません');
    }

    console.log('\n=== 確認作業完了 ===');

    // 結果サマリー
    console.log('\n📊 結果サマリー:');
    console.log(`サイドバー: ${sidebarElement ? '✅ 発見' : '❌ 未発見'}`);
    console.log(`「←サイドバーを閉じる」ボタン: ${closeSidebarButton ? '✅ 発見' : '❌ 未発見'}`);
    console.log(`新規顧客ページ作成ボタン: ${newCustomerButton ? '✅ 発見' : '❌ 未発見'}`);
    console.log(`モバイル ハンバーガーメニュー: ${hamburgerFound ? '✅ 発見' : '❌ 未発見'}`);

    await context.close();

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    await browser.close();
    throw error;
  } finally {
    await browser.close();
  }
}

// スクリプト実行
runSidebarVerificationWithAuth().catch(console.error);