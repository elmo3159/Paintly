const { chromium } = require('playwright');

async function testSidebarDetailed() {
  const browser = await chromium.launch({
    headless: false, // デバッグ用に表示
    slowMo: 1000 // 操作を見やすくするため
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();

    console.log('1. サイトにアクセス中...');
    await page.goto('http://172.17.161.101:9090');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: '.playwright-mcp/01-initial-load.png' });

    console.log('2. ページの初期状態を確認...');
    const title = await page.title();
    console.log(`ページタイトル: ${title}`);

    // Google Signインボタンの検索
    console.log('3. Google Signインボタンを探しています...');
    const googleSigninButton = await page.locator('button:has-text("Googleでサインイン"), a:has-text("Googleでサインイン"), [role="button"]:has-text("Google")').first();

    if (await googleSigninButton.isVisible()) {
      console.log('Google Signインボタンが見つかりました。クリックします...');
      await googleSigninButton.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: '.playwright-mcp/02-after-google-signin-click.png' });

      // Googleサインインページで認証情報を入力
      try {
        console.log('4. Google認証情報を入力中...');

        // メールアドレス入力
        const emailInput = await page.locator('input[type="email"]').first();
        if (await emailInput.isVisible()) {
          await emailInput.fill('test-paintly@example.com');
          await page.click('button:has-text("次へ"), #identifierNext');
          await page.waitForTimeout(2000);
        }

        // パスワード入力
        const passwordInput = await page.locator('input[type="password"]').first();
        if (await passwordInput.isVisible()) {
          await passwordInput.fill('Test123!@#');
          await page.click('button:has-text("次へ"), #passwordNext');
          await page.waitForLoadState('networkidle');
        }
      } catch (authError) {
        console.log('認証エラー:', authError.message);
        await page.screenshot({ path: '.playwright-mcp/03-auth-error.png' });
      }
    } else {
      console.log('Google Signインボタンが見つかりません。既にログイン済みかもしれません。');
    }

    // ダッシュボードまたは顧客ページに到達したか確認
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '.playwright-mcp/04-after-auth.png' });

    console.log('5. サイドバーの詳細確認を開始...');

    // サイドバーの存在確認
    const sidebar = await page.locator('[class*="sidebar"], [data-testid*="sidebar"], aside, nav').first();
    const sidebarExists = await sidebar.isVisible().catch(() => false);
    console.log(`サイドバーの存在: ${sidebarExists}`);

    if (sidebarExists) {
      await page.screenshot({ path: '.playwright-mcp/05-sidebar-visible.png' });

      // サイドバー内の要素を詳細に確認
      console.log('6. サイドバー内の要素を確認中...');

      // Paintlyロゴの確認
      const logoElements = await page.locator('text="Paintly", [alt*="Paintly"], img[src*="logo"], h1, h2').all();
      console.log(`ロゴ関連要素数: ${logoElements.length}`);

      // サイドバーを閉じるボタンの確認
      const closeButtonSelectors = [
        'button:has-text("←サイドバーを閉じる")',
        'button:has-text("サイドバーを閉じる")',
        'button:has-text("閉じる")',
        'button:has-text("←")',
        '[aria-label*="close"], [aria-label*="閉じる"]',
        '[data-testid*="close"], [data-testid*="sidebar-close"]',
        'button[class*="close"]'
      ];

      let closeButtonFound = false;
      for (const selector of closeButtonSelectors) {
        const closeButton = await page.locator(selector).first();
        const isVisible = await closeButton.isVisible().catch(() => false);
        const exists = await closeButton.count() > 0;
        console.log(`「${selector}」- 存在: ${exists}, 表示: ${isVisible}`);

        if (exists) {
          closeButtonFound = true;
          // ボタンのHTML属性を確認
          const buttonText = await closeButton.textContent().catch(() => '');
          const buttonClass = await closeButton.getAttribute('class').catch(() => '');
          console.log(`  テキスト: "${buttonText}", クラス: "${buttonClass}"`);
        }
      }

      // 新規顧客ページ作成ボタンの確認
      const newCustomerButton = await page.locator('button:has-text("新規顧客ページ作成"), button:has-text("＋"), [role="button"]:has-text("新規")').first();
      const newCustomerButtonExists = await newCustomerButton.isVisible().catch(() => false);
      console.log(`新規顧客ページ作成ボタンの存在: ${newCustomerButtonExists}`);

      // サイドバー全体のHTML構造を確認
      console.log('7. サイドバーのHTML構造を確認中...');
      const sidebarHTML = await sidebar.innerHTML().catch(() => '取得できませんでした');
      console.log('サイドバーHTML (最初の500文字):');
      console.log(sidebarHTML.substring(0, 500));

    } else {
      console.log('サイドバーが見つかりません。');
      await page.screenshot({ path: '.playwright-mcp/05-no-sidebar.png' });
    }

    // コンソールエラーの確認
    console.log('8. コンソールエラーを確認中...');
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('コンソールエラー:', msg.text());
      }
    });

    // DevTools の Network タブ相当の情報
    page.on('response', response => {
      if (!response.ok()) {
        console.log(`HTTP エラー: ${response.status()} ${response.url()}`);
      }
    });

    // 最終スクリーンショット
    await page.screenshot({ path: '.playwright-mcp/06-final-state.png' });

    console.log('9. テスト完了');

  } catch (error) {
    console.error('テスト中にエラーが発生しました:', error);
    await page.screenshot({ path: '.playwright-mcp/error-screenshot.png' });
  } finally {
    await browser.close();
  }
}

testSidebarDetailed().catch(console.error);