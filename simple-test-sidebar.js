const puppeteer = require('puppeteer');

async function testSidebar() {
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

    // タイムアウト設定を長くする
    page.setDefaultNavigationTimeout(60000);
    page.setDefaultTimeout(60000);

    console.log('1. サインインページに移動...');
    await page.goto('http://172.17.161.101:9090/auth/signin', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    console.log('2. ページが読み込まれました');

    // ページタイトルを確認
    const title = await page.title();
    console.log('ページタイトル:', title);

    // フォームの存在確認
    console.log('3. ログインフォームを探しています...');
    await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });

    console.log('4. ログイン情報を入力...');
    await page.type('input[type="email"], input[name="email"]', 'elmodayo3159@gmail.com');
    await page.type('input[type="password"], input[name="password"]', 'sanri3159');

    console.log('5. ログインボタンをクリック...');
    await page.click('button[type="submit"]');

    // ナビゲーション完了まで待機
    console.log('6. ログイン処理完了まで待機...');
    await page.waitForNavigation({
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    console.log('7. 現在のURL:', page.url());

    // サイドバーの確認
    console.log('8. サイドバーを探しています...');

    // 複数のセレクターでサイドバーを探す
    const sidebarSelectors = [
      '.sidebar',
      '[data-testid="sidebar"]',
      'aside',
      'nav',
      '.w-64',
      '[class*="sidebar"]'
    ];

    let sidebarFound = false;
    let sidebarSelector = null;

    for (const selector of sidebarSelectors) {
      const element = await page.$(selector);
      if (element) {
        console.log(`サイドバーが見つかりました: ${selector}`);
        sidebarFound = true;
        sidebarSelector = selector;
        break;
      }
    }

    if (!sidebarFound) {
      console.log('サイドバーが見つかりませんでした');
      // すべての要素を表示してデバッグ
      const bodyText = await page.evaluate(() => document.body.innerText);
      console.log('ページの内容（最初の500文字）:', bodyText.substring(0, 500));
    } else {
      // サイドバーのテキスト内容を確認
      const sidebarText = await page.evaluate((selector) => {
        const sidebar = document.querySelector(selector);
        return sidebar ? sidebar.innerText : null;
      }, sidebarSelector);

      console.log('サイドバーのテキスト:', sidebarText);

      // 閉じるボタンの確認
      const closeButtonTexts = ['サイドバーを閉じる', '←', '×', 'Close'];
      let closeButtonFound = false;

      for (const text of closeButtonTexts) {
        const button = await page.evaluateHandle((text) => {
          return Array.from(document.querySelectorAll('button')).find(
            btn => btn.textContent.includes(text)
          );
        }, text);

        const element = button.asElement();
        if (element) {
          console.log(`閉じるボタンが見つかりました: "${text}"`);
          closeButtonFound = true;
          break;
        }
      }

      if (!closeButtonFound) {
        console.log('閉じるボタンが見つかりませんでした');
        // すべてのボタンを表示
        const buttons = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('button')).map(btn => btn.textContent);
        });
        console.log('ページ内のすべてのボタン:', buttons);
      }
    }

    // スクリーンショットを撮影
    console.log('9. スクリーンショット撮影...');
    await page.screenshot({
      path: '.playwright-mcp/simple-sidebar-test.png',
      fullPage: true
    });

    console.log('テスト完了');

  } catch (error) {
    console.error('エラーが発生しました:', error);
    if (page) {
      await page.screenshot({
        path: '.playwright-mcp/simple-sidebar-error.png',
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