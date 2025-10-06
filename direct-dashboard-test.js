const puppeteer = require('puppeteer');

async function testDashboardDirectly() {
  let browser;
  let page;

  try {
    console.log('ブラウザを起動中...');
    browser = await puppeteer.launch({
      headless: true,
      defaultViewport: { width: 1200, height: 800 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    page = await browser.newPage();
    page.setDefaultTimeout(30000);

    console.log('1. サインインページに移動してログイン...');
    await page.goto('http://172.17.161.101:9090/auth/signin', {
      waitUntil: 'domcontentloaded'
    });

    // ログイン
    await page.waitForSelector('input[type="email"]');
    await page.type('input[type="email"]', 'elmodayo3159@gmail.com');
    await page.type('input[type="password"]', 'sanri3159');
    await page.click('button[type="submit"]');

    // 少し待機
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('2. ダッシュボードページに直接移動...');
    await page.goto('http://172.17.161.101:9090/dashboard', {
      waitUntil: 'domcontentloaded'
    });

    console.log('3. 現在のURL:', page.url());

    // ページタイトルを確認
    const title = await page.title();
    console.log('ページタイトル:', title);

    // ページの基本構造を確認
    console.log('4. ページ構造を確認...');
    const bodyHTML = await page.evaluate(() => {
      return document.body.innerHTML.length;
    });
    console.log('ページのHTMLサイズ:', bodyHTML, 'characters');

    // サイドバー関連の要素を探す
    console.log('5. サイドバー関連要素を検索...');

    const sidebarChecks = await page.evaluate(() => {
      const results = {};

      // 様々なセレクターでサイドバーを探す
      const selectors = [
        '.sidebar',
        'aside',
        'nav',
        '.w-64',
        '[class*="sidebar"]',
        'div[class*="flex"] div[class*="w-64"]'
      ];

      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        results[selector] = elements.length;
      });

      // Paintlyロゴを探す
      results.paintlyLogo = document.querySelectorAll('*').length > 0 ?
        Array.from(document.querySelectorAll('*')).some(el =>
          el.textContent && el.textContent.includes('Paintly')
        ) : false;

      // 「サイドバーを閉じる」テキストを探す
      results.closeSidebarText = Array.from(document.querySelectorAll('*')).some(el =>
        el.textContent && el.textContent.includes('サイドバーを閉じる')
      );

      // 「新規顧客ページ」テキストを探す
      results.newCustomerText = Array.from(document.querySelectorAll('*')).some(el =>
        el.textContent && el.textContent.includes('新規顧客ページ')
      );

      return results;
    });

    console.log('サイドバー検索結果:', sidebarChecks);

    // もしサイドバーが見つからない場合、エラーメッセージを確認
    if (!sidebarChecks.paintlyLogo) {
      console.log('6. エラーメッセージを確認...');
      const pageText = await page.evaluate(() => document.body.innerText);
      console.log('ページの内容（最初の500文字）:', pageText.substring(0, 500));

      // エラー要素を探す
      const errorElements = await page.$$('[class*="error"], .alert, [role="alert"]');
      if (errorElements.length > 0) {
        console.log('エラー要素が見つかりました:', errorElements.length);
        for (let i = 0; i < errorElements.length; i++) {
          const errorText = await page.evaluate(el => el.textContent, errorElements[i]);
          console.log(`エラー ${i + 1}:`, errorText);
        }
      }
    }

    // スクリーンショット撮影
    console.log('7. スクリーンショット撮影...');
    await page.screenshot({
      path: '.playwright-mcp/direct-dashboard-test.png',
      fullPage: true
    });

    // カスタマーページもテスト
    console.log('8. カスタマーページをテスト...');
    await page.goto('http://172.17.161.101:9090/customer/new', {
      waitUntil: 'domcontentloaded'
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    const customerPageChecks = await page.evaluate(() => {
      const results = {};
      results.paintlyLogo = Array.from(document.querySelectorAll('*')).some(el =>
        el.textContent && el.textContent.includes('Paintly')
      );
      results.closeSidebarText = Array.from(document.querySelectorAll('*')).some(el =>
        el.textContent && el.textContent.includes('サイドバーを閉じる')
      );
      return results;
    });

    console.log('カスタマーページの検索結果:', customerPageChecks);

    await page.screenshot({
      path: '.playwright-mcp/customer-page-test.png',
      fullPage: true
    });

    console.log('テスト完了');

  } catch (error) {
    console.error('エラーが発生しました:', error);
    if (page) {
      await page.screenshot({
        path: '.playwright-mcp/direct-dashboard-error.png',
        fullPage: true
      });
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testDashboardDirectly();