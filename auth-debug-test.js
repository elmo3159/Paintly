const puppeteer = require('puppeteer');

async function debugAuth() {
  let browser;
  let page;

  try {
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1200, height: 800 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    page = await browser.newPage();
    page.setDefaultTimeout(30000);

    // ネットワークリクエストをログ
    page.on('request', request => {
      console.log('Request:', request.method(), request.url());
    });

    page.on('response', response => {
      console.log('Response:', response.status(), response.url());
    });

    console.log('1. サインインページにアクセス...');
    await page.goto('http://172.17.161.101:9090/auth/signin', {
      waitUntil: 'domcontentloaded'
    });

    console.log('2. ページ読み込み完了');

    // フォーム要素を探す
    await page.waitForSelector('input[type="email"]');
    console.log('3. フォーム要素発見');

    // ログイン実行
    console.log('4. ログイン情報入力...');
    await page.type('input[type="email"]', 'elmodayo3159@gmail.com');
    await page.type('input[type="password"]', 'sanri3159');

    console.log('5. ログインボタンクリック前にスクリーンショット...');
    await page.screenshot({
      path: '.playwright-mcp/before-login.png',
      fullPage: true
    });

    // ログインボタンをクリック
    console.log('6. ログインボタンをクリック...');
    await page.click('button[type="submit"]');

    // 3秒待機
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('7. ログイン後のURL:', page.url());
    console.log('8. ログイン後のページタイトル:', await page.title());

    // ログイン後のスクリーンショット
    await page.screenshot({
      path: '.playwright-mcp/after-login.png',
      fullPage: true
    });

    // Cookieを確認
    const cookies = await page.cookies();
    console.log('9. Cookies:', cookies.map(c => ({ name: c.name, value: c.value.substring(0, 20) + '...' })));

    // ダッシュボードに直接アクセスしてみる
    console.log('10. ダッシュボードに直接アクセス...');
    await page.goto('http://172.17.161.101:9090/dashboard', {
      waitUntil: 'domcontentloaded'
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('11. ダッシュボードアクセス後のURL:', page.url());

    await page.screenshot({
      path: '.playwright-mcp/dashboard-direct.png',
      fullPage: true
    });

    // カスタマーページにもアクセス
    console.log('12. カスタマーページにアクセス...');
    await page.goto('http://172.17.161.101:9090/customer/new', {
      waitUntil: 'domcontentloaded'
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('13. カスタマーページアクセス後のURL:', page.url());

    // サイドバーが表示されているかチェック
    const sidebarCheck = await page.evaluate(() => {
      const paintlyLogo = Array.from(document.querySelectorAll('*')).some(el =>
        el.textContent && el.textContent.includes('Paintly')
      );
      const closeSidebarText = Array.from(document.querySelectorAll('*')).some(el =>
        el.textContent && el.textContent.includes('サイドバーを閉じる')
      );
      const newCustomerText = Array.from(document.querySelectorAll('*')).some(el =>
        el.textContent && el.textContent.includes('新規顧客ページ')
      );

      // ページ内のテキスト概要
      const pageText = document.body.innerText;

      return {
        paintlyLogo,
        closeSidebarText,
        newCustomerText,
        pageTextStart: pageText.substring(0, 200),
        hasFlexContainer: document.querySelector('div[class*="flex"]') !== null,
        hasW64Element: document.querySelector('.w-64') !== null
      };
    });

    console.log('14. サイドバーチェック結果:', sidebarCheck);

    await page.screenshot({
      path: '.playwright-mcp/customer-page-final.png',
      fullPage: true
    });

  } catch (error) {
    console.error('エラー:', error);
    if (page) {
      await page.screenshot({
        path: '.playwright-mcp/auth-debug-error.png',
        fullPage: true
      });
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

debugAuth();