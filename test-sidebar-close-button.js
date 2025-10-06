const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testSidebarCloseButton() {
  console.log('サイドバー閉じるボタンのテストを開始します...');

  // ブラウザの起動
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000,
    devtools: true
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();

  // コンソールエラーをキャッチ
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('コンソールエラー:', msg.text());
    }
  });

  try {
    // 1. サイトにアクセス
    console.log('1. http://172.17.161.101:9090 にアクセス中...');
    await page.goto('http://172.17.161.101:9090', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // 初期画面のスクリーンショット
    await page.screenshot({
      path: '.playwright-mcp/01-initial-page.png',
      fullPage: true
    });
    console.log('初期画面のスクリーンショットを保存: 01-initial-page.png');

    // 2. ログインフォームを探す
    console.log('2. ログインフォームを探しています...');

    // サインインページが表示される場合は移動
    const signinButtonCheck = page.locator('button:has-text("Paintlyにサインイン")');
    if (await signinButtonCheck.isVisible()) {
      console.log('サインインページが表示されています');
    } else {
      // サインインページに移動する必要がある場合
      const signinLink = page.locator('a[href*="signin"]');
      if (await signinLink.isVisible()) {
        await signinLink.click();
        await page.waitForTimeout(2000);
      }
    }

    await page.screenshot({
      path: '.playwright-mcp/02-signin-page.png',
      fullPage: true
    });
    console.log('サインインページのスクリーンショットを保存: 02-signin-page.png');

    // 3. メールアドレスとパスワードを入力
    console.log('3. 認証情報を入力中...');

    // メールアドレス入力欄を探す
    const emailSelectors = [
      'input[type="email"]',
      'input[name="email"]',
      'input[placeholder*="メール"]',
      'input[placeholder*="Email"]',
      'input[id*="email"]'
    ];

    let emailInput = null;
    for (const selector of emailSelectors) {
      const element = page.locator(selector);
      if (await element.isVisible()) {
        emailInput = element;
        break;
      }
    }

    if (emailInput) {
      await emailInput.fill('elmodayo3159@gmail.com');
      console.log('メールアドレスを入力しました');
    } else {
      console.log('メールアドレス入力欄が見つかりません');
    }

    // パスワード入力欄を探す
    const passwordSelectors = [
      'input[type="password"]',
      'input[name="password"]',
      'input[placeholder*="パスワード"]',
      'input[placeholder*="Password"]',
      'input[id*="password"]'
    ];

    let passwordInput = null;
    for (const selector of passwordSelectors) {
      const element = page.locator(selector);
      if (await element.isVisible()) {
        passwordInput = element;
        break;
      }
    }

    if (passwordInput) {
      await passwordInput.fill('sanri3159');
      console.log('パスワードを入力しました');
    } else {
      console.log('パスワード入力欄が見つかりません');
    }

    await page.screenshot({
      path: '.playwright-mcp/03-form-filled.png',
      fullPage: true
    });
    console.log('フォーム入力後のスクリーンショットを保存: 03-form-filled.png');

    // 4. ログインボタンをクリック
    console.log('4. ログインボタンをクリック中...');

    const loginSelectors = [
      'button[type="submit"]',
      'button:has-text("ログイン")',
      'button:has-text("サインイン")',
      'button:has-text("Sign In")',
      'input[type="submit"]',
      'form button'
    ];

    let loginButton = null;
    for (const selector of loginSelectors) {
      const element = page.locator(selector);
      if (await element.isVisible()) {
        loginButton = element;
        break;
      }
    }

    if (loginButton) {
      await loginButton.click();
      console.log('ログインボタンをクリックしました');

      // ログイン処理の完了を待つ
      await page.waitForTimeout(3000);

      // URLの変化またはダッシュボード要素の表示を待つ
      try {
        await page.waitForURL('**/dashboard**', { timeout: 10000 });
        console.log('ダッシュボードにリダイレクトされました');
      } catch {
        console.log('ダッシュボードへのリダイレクトが確認できませんが、続行します');
      }
    } else {
      console.log('ログインボタンが見つかりません');
    }

    // 5. ログイン後のスクリーンショット
    await page.screenshot({
      path: '.playwright-mcp/04-after-login.png',
      fullPage: true
    });
    console.log('ログイン後のスクリーンショットを保存: 04-after-login.png');

    // 6. サイドバーの確認
    console.log('5. サイドバーを探しています...');

    const sidebarSelectors = [
      '[data-testid="sidebar"]',
      '.sidebar',
      'aside',
      'nav[class*="sidebar"]',
      '[class*="sidebar"]'
    ];

    let sidebar = null;
    for (const selector of sidebarSelectors) {
      const element = page.locator(selector);
      if (await element.isVisible()) {
        sidebar = element;
        console.log(`サイドバーを発見: ${selector}`);
        break;
      }
    }

    // 7. サイドバーの閉じるボタンを探す
    console.log('6. サイドバーの閉じるボタンを探しています...');

    const closeButtonSelectors = [
      'button:has-text("←サイドバーを閉じる")',
      'button:has-text("サイドバーを閉じる")',
      'button:has-text("閉じる")',
      'button:has-text("×")',
      '[aria-label*="閉じる"]',
      '[aria-label*="close"]',
      '.close-button',
      'button[class*="close"]'
    ];

    let closeButton = null;
    for (const selector of closeButtonSelectors) {
      const element = page.locator(selector);
      if (await element.isVisible()) {
        closeButton = element;
        console.log(`閉じるボタンを発見: ${selector}`);
        break;
      }
    }

    // サイドバー部分の詳細スクリーンショット
    if (sidebar) {
      await sidebar.screenshot({
        path: '.playwright-mcp/05-sidebar-detail.png'
      });
      console.log('サイドバーの詳細スクリーンショットを保存: 05-sidebar-detail.png');
    }

    // 8. HTML要素の検査
    console.log('7. HTML要素を検査中...');

    const pageContent = await page.content();
    const sidebarHTML = pageContent.includes('サイドバーを閉じる') ?
      '「サイドバーを閉じる」テキストを発見' :
      '「サイドバーを閉じる」テキストが見つかりません';
    console.log(`HTML検査結果: ${sidebarHTML}`);

    // すべてのボタン要素を取得
    const allButtons = await page.locator('button').all();
    console.log(`ページ内のボタン総数: ${allButtons.length}`);

    for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
      const buttonText = await allButtons[i].textContent();
      const buttonClass = await allButtons[i].getAttribute('class');
      console.log(`ボタン ${i + 1}: "${buttonText}" (class: ${buttonClass})`);
    }

    // 9. 閉じるボタンのテスト
    if (closeButton) {
      console.log('8. 閉じるボタンをテスト中...');

      // ボタンクリック前のスクリーンショット
      await page.screenshot({
        path: '.playwright-mcp/06-before-close.png',
        fullPage: true
      });

      await closeButton.click();
      await page.waitForTimeout(2000);

      // ボタンクリック後のスクリーンショット
      await page.screenshot({
        path: '.playwright-mcp/07-after-close.png',
        fullPage: true
      });

      console.log('閉じるボタンをクリックしました');
    } else {
      console.log('閉じるボタンが見つかりませんでした');
    }

    // 10. モバイルビューポートでのテスト
    console.log('9. モバイルビューポートでテスト中...');

    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: '.playwright-mcp/08-mobile-view.png',
      fullPage: true
    });
    console.log('モバイルビューのスクリーンショットを保存: 08-mobile-view.png');

    // モバイルでの閉じるボタン確認
    for (const selector of closeButtonSelectors) {
      const element = page.locator(selector);
      if (await element.isVisible()) {
        console.log(`モバイルビューで閉じるボタンを発見: ${selector}`);
        break;
      }
    }

    console.log('テスト完了！');

  } catch (error) {
    console.error('テスト中にエラーが発生しました:', error);
    await page.screenshot({
      path: '.playwright-mcp/error-screenshot.png',
      fullPage: true
    });
  } finally {
    await browser.close();
  }
}

// テスト実行
testSidebarCloseButton().catch(console.error);