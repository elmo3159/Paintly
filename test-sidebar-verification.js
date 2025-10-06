const { chromium } = require('playwright');
const fs = require('fs');

async function runSidebarVerification() {
  const browser = await chromium.launch({
    headless: false, // ヘッドレスモードを無効にして視覚的に確認
    slowMo: 1000 // 操作を見やすくするために遅延
  });

  try {
    // デスクトップ表示でのテスト
    console.log('=== デスクトップ表示での確認開始 ===');
    const desktopContext = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    const desktopPage = await desktopContext.newPage();

    // コンソールエラーをキャッチ
    desktopPage.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Desktop Console Error:', msg.text());
      }
    });

    // 1. サイトにアクセス
    console.log('1. サイトにアクセス中...');
    await desktopPage.goto('http://172.17.161.101:9090', { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(2000);

    // 初期ページのスクリーンショット
    await desktopPage.screenshot({ path: '.playwright-mcp/01-initial-page-desktop.png', fullPage: true });
    console.log('初期ページのスクリーンショットを保存しました');

    // 2. Google OAuthでサインイン
    console.log('2. Google OAuthでサインイン試行中...');

    // サインインボタンを探してクリック
    const signInSelectors = [
      'button:has-text("Sign in with Google")',
      'button:has-text("Googleでサインイン")',
      'button:has-text("Sign in")',
      'a:has-text("Sign in")',
      '[data-testid="google-signin"]',
      '.google-signin-button'
    ];

    let signInClicked = false;
    for (const selector of signInSelectors) {
      try {
        const element = await desktopPage.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          await element.click();
          signInClicked = true;
          console.log(`サインインボタンをクリックしました: ${selector}`);
          break;
        }
      } catch (e) {
        // 次のセレクターを試す
      }
    }

    if (!signInClicked) {
      console.log('サインインボタンが見つかりません。現在のページを確認します。');
      await desktopPage.screenshot({ path: '.playwright-mcp/02-signin-not-found-desktop.png', fullPage: true });
    }

    await desktopPage.waitForTimeout(3000);

    // 3. ダッシュボードページの確認
    console.log('3. ダッシュボードページの確認...');
    const currentUrl = desktopPage.url();
    console.log('現在のURL:', currentUrl);

    // ダッシュボードにいるかどうか判断
    if (currentUrl.includes('dashboard') || currentUrl.includes('auth') || await desktopPage.locator('[data-testid="dashboard"]').isVisible({ timeout: 2000 })) {
      console.log('ダッシュボードページに到達しました');
    } else {
      console.log('ダッシュボードページに到達していない可能性があります');
    }

    await desktopPage.screenshot({ path: '.playwright-mcp/03-dashboard-desktop.png', fullPage: true });

    // 4. サイドバーの表示確認
    console.log('4. サイドバーの表示確認...');

    const sidebarSelectors = [
      '[data-testid="sidebar"]',
      '.sidebar',
      'aside',
      'nav[role="navigation"]'
    ];

    let sidebarFound = false;
    for (const selector of sidebarSelectors) {
      try {
        const sidebar = await desktopPage.locator(selector).first();
        if (await sidebar.isVisible({ timeout: 2000 })) {
          console.log(`サイドバーが見つかりました: ${selector}`);
          sidebarFound = true;
          break;
        }
      } catch (e) {
        // 次のセレクターを試す
      }
    }

    if (!sidebarFound) {
      console.log('サイドバーが見つかりません');
    }

    // 5. 「←サイドバーを閉じる」ボタンの確認
    console.log('5. 「←サイドバーを閉じる」ボタンの確認...');

    const closeSidebarSelectors = [
      'button:has-text("←サイドバーを閉じる")',
      'button:has-text("サイドバーを閉じる")',
      'button:has-text("←")',
      '[data-testid="close-sidebar"]',
      '.close-sidebar-button',
      'button[aria-label*="close"]',
      'button[aria-label*="閉じる"]'
    ];

    let closeSidebarButtonFound = false;
    for (const selector of closeSidebarSelectors) {
      try {
        const button = await desktopPage.locator(selector).first();
        if (await button.isVisible({ timeout: 2000 })) {
          console.log(`「←サイドバーを閉じる」ボタンが見つかりました: ${selector}`);
          const boundingBox = await button.boundingBox();
          console.log('ボタンの位置:', boundingBox);
          closeSidebarButtonFound = true;

          // ボタンをクリックしてテスト
          try {
            await button.click();
            console.log('「←サイドバーを閉じる」ボタンをクリックしました');
            await desktopPage.waitForTimeout(1000);
            await desktopPage.screenshot({ path: '.playwright-mcp/04-sidebar-closed-desktop.png', fullPage: true });
          } catch (e) {
            console.log('ボタンクリック時にエラー:', e.message);
          }
          break;
        }
      } catch (e) {
        // 次のセレクターを試す
      }
    }

    if (!closeSidebarButtonFound) {
      console.log('「←サイドバーを閉じる」ボタンが見つかりません');
    }

    // 6. 新規顧客ページ作成ボタンの確認
    console.log('6. 新規顧客ページ作成ボタンの確認...');

    const newCustomerSelectors = [
      'button:has-text("＋")',
      'button:has-text("新規")',
      'button:has-text("新規顧客")',
      '[data-testid="new-customer"]',
      '.new-customer-button'
    ];

    let newCustomerButtonFound = false;
    for (const selector of newCustomerSelectors) {
      try {
        const button = await desktopPage.locator(selector).first();
        if (await button.isVisible({ timeout: 2000 })) {
          console.log(`新規顧客ページ作成ボタンが見つかりました: ${selector}`);
          const boundingBox = await button.boundingBox();
          console.log('ボタンの位置:', boundingBox);
          newCustomerButtonFound = true;
          break;
        }
      } catch (e) {
        // 次のセレクターを試す
      }
    }

    if (!newCustomerButtonFound) {
      console.log('新規顧客ページ作成ボタンが見つかりません');
    }

    await desktopContext.close();

    // モバイル表示でのテスト
    console.log('\n=== モバイル表示での確認開始 ===');
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 667 } // iPhone 8サイズ
    });
    const mobilePage = await mobileContext.newPage();

    // コンソールエラーをキャッチ
    mobilePage.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Mobile Console Error:', msg.text());
      }
    });

    // 同様の確認作業をモバイルで実行
    await mobilePage.goto('http://172.17.161.101:9090', { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(2000);

    await mobilePage.screenshot({ path: '.playwright-mcp/05-initial-page-mobile.png', fullPage: true });
    console.log('モバイル表示の初期ページのスクリーンショットを保存しました');

    // サインイン試行（モバイル）
    signInClicked = false;
    for (const selector of signInSelectors) {
      try {
        const element = await mobilePage.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          await element.click();
          signInClicked = true;
          console.log(`モバイル: サインインボタンをクリックしました: ${selector}`);
          break;
        }
      } catch (e) {
        // 次のセレクターを試す
      }
    }

    await mobilePage.waitForTimeout(3000);
    await mobilePage.screenshot({ path: '.playwright-mcp/06-dashboard-mobile.png', fullPage: true });

    // モバイルでのサイドバー確認
    console.log('モバイル: サイドバーの表示確認...');

    // ハンバーガーメニューボタンを探す
    const hamburgerSelectors = [
      'button:has-text("☰")',
      'button[aria-label*="menu"]',
      'button[aria-label*="メニュー"]',
      '[data-testid="hamburger-menu"]',
      '.hamburger-menu'
    ];

    let hamburgerFound = false;
    for (const selector of hamburgerSelectors) {
      try {
        const button = await mobilePage.locator(selector).first();
        if (await button.isVisible({ timeout: 2000 })) {
          console.log(`モバイル: ハンバーガーメニューが見つかりました: ${selector}`);
          await button.click();
          hamburgerFound = true;
          await mobilePage.waitForTimeout(1000);
          await mobilePage.screenshot({ path: '.playwright-mcp/07-sidebar-opened-mobile.png', fullPage: true });
          break;
        }
      } catch (e) {
        // 次のセレクターを試す
      }
    }

    if (!hamburgerFound) {
      console.log('モバイル: ハンバーガーメニューが見つかりません');
    }

    await mobileContext.close();

    console.log('\n=== 確認作業完了 ===');
    console.log('スクリーンショットが.playwright-mcpディレクトリに保存されました');

  } catch (error) {
    console.error('エラーが発生しました:', error);
  } finally {
    await browser.close();
  }
}

// スクリプト実行
runSidebarVerification().catch(console.error);