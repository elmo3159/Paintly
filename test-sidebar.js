const puppeteer = require('puppeteer');

async function testSidebar() {
  let browser;
  let page;

  try {
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1200, height: 800 }
    });

    page = await browser.newPage();

    // ログイン処理
    console.log('1. ログインページに移動...');
    await page.goto('http://172.17.161.101:9090/auth/signin');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });

    console.log('2. ログイン情報を入力...');
    await page.type('input[type="email"]', 'elmodayo3159@gmail.com');
    await page.type('input[type="password"]', 'sanri3159');

    console.log('3. ログインボタンをクリック...');
    await page.click('button[type="submit"]');

    // ダッシュボードまたはカスタマーページに移動するまで待機
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    console.log('4. 現在のURL:', page.url());

    // サイドバーが表示されているかチェック
    console.log('5. サイドバーの存在確認...');
    const sidebarExists = await page.$('.sidebar, [data-testid="sidebar"], nav');
    console.log('サイドバー要素が見つかりました:', !!sidebarExists);

    // 閉じるボタンの確認
    console.log('6. サイドバー閉じるボタンの確認...');
    const closeButton = await page.$('button:has-text("サイドバーを閉じる"), button:has-text("←"), [aria-label*="閉じる"]');
    console.log('閉じるボタンが見つかりました:', !!closeButton);

    // サイドバー内のテキストを確認
    console.log('7. サイドバーのテキスト内容を確認...');
    const sidebarText = await page.evaluate(() => {
      const sidebar = document.querySelector('aside, nav, [class*="sidebar"], .w-64');
      return sidebar ? sidebar.innerText : 'サイドバーが見つかりません';
    });
    console.log('サイドバーのテキスト:', sidebarText);

    // スクリーンショットを撮影
    console.log('8. スクリーンショット撮影...');
    await page.screenshot({
      path: '.playwright-mcp/sidebar-test-result.png',
      fullPage: true
    });

    // モバイルビューでもテスト
    console.log('9. モバイルビューでテスト...');
    await page.setViewport({ width: 375, height: 667 });
    await page.screenshot({
      path: '.playwright-mcp/sidebar-mobile-test.png',
      fullPage: true
    });

    console.log('テスト完了');

  } catch (error) {
    console.error('エラーが発生しました:', error);
    if (page) {
      await page.screenshot({
        path: '.playwright-mcp/sidebar-test-error.png',
        fullPage: true
      });
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testSidebar();