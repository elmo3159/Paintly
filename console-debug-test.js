const puppeteer = require('puppeteer');

async function checkConsoleLog() {
  let browser;
  let page;

  try {
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1200, height: 800 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    page = await browser.newPage();

    // コンソールメッセージをキャプチャ
    page.on('console', msg => {
      console.log(`Console ${msg.type()}: ${msg.text()}`);
    });

    // エラーメッセージをキャプチャ
    page.on('pageerror', error => {
      console.log(`Page error: ${error.message}`);
    });

    console.log('1. サインインページにアクセス...');
    await page.goto('http://172.17.161.101:9090/auth/signin', {
      waitUntil: 'domcontentloaded'
    });

    // 5秒待機してコンソールログを確認
    console.log('2. コンソールログを確認中...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('3. ページタイトル:', await page.title());

    // サインインページのフォームが表示されているか確認
    const hasForm = await page.evaluate(() => {
      return document.querySelector('input[type="email"]') !== null;
    });
    console.log('4. ログインフォームが存在:', hasForm);

    console.log('テスト完了');

  } catch (error) {
    console.error('エラー:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

checkConsoleLog();