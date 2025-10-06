const { chromium } = require('playwright');

async function testAuthAndSidebar() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();

    // コンソールメッセージをキャプチャ
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`コンソールエラー:`, msg.text());
      }
    });

    console.log('=== 1. サインインページにアクセス ===');
    await page.goto('http://172.17.161.101:9090');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: '.playwright-mcp/auth-01-signin-page.png' });

    const currentUrl = page.url();
    console.log(`現在のURL: ${currentUrl}`);

    if (currentUrl.includes('/auth/signin')) {
      console.log('=== 2. Google認証を試行 ===');

      // Googleサインインボタンを探す
      const googleButton = await page.locator('button:has-text("Google"), [role="button"]:has-text("Google")').first();
      const googleButtonExists = await googleButton.isVisible();

      console.log(`Googleボタンの存在: ${googleButtonExists}`);

      if (googleButtonExists) {
        console.log('Googleサインインボタンをクリック...');
        await googleButton.click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: '.playwright-mcp/auth-02-after-google-click.png' });

        // 新しいタブまたはポップアップが開かれた場合の処理
        const pages = context.pages();
        console.log(`現在のページ数: ${pages.length}`);

        if (pages.length > 1) {
          console.log('新しいページが開かれました');
          const authPage = pages[pages.length - 1];
          await authPage.waitForLoadState('networkidle');
          await authPage.screenshot({ path: '.playwright-mcp/auth-03-google-auth-page.png' });
        }

        // 元のページに戻ってチェック
        await page.waitForTimeout(5000);
        const afterAuthUrl = page.url();
        console.log(`認証後のURL: ${afterAuthUrl}`);
        await page.screenshot({ path: '.playwright-mcp/auth-04-after-auth.png' });
      }
    }

    console.log('=== 3. ダッシュボードまたは認証後のページを確認 ===');

    // ダッシュボードに直接アクセスしてみる
    try {
      await page.goto('http://172.17.161.101:9090/dashboard');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: '.playwright-mcp/auth-05-dashboard.png' });
      console.log(`ダッシュボードURL: ${page.url()}`);
    } catch (err) {
      console.log('ダッシュボードアクセスエラー:', err.message);
    }

    console.log('=== 4. サイドバー要素の詳細検索 ===');

    // サイドバー関連要素を再度確認
    const sidebarElements = await page.locator('aside, nav, [class*="sidebar"], [class*="side"], [role="navigation"]').all();
    console.log(`サイドバー候補要素数: ${sidebarElements.length}`);

    for (let i = 0; i < sidebarElements.length; i++) {
      const element = sidebarElements[i];
      const visible = await element.isVisible();
      const tagName = await element.evaluate(el => el.tagName);
      const className = await element.getAttribute('class') || '';
      const innerHTML = await element.innerHTML().catch(() => '取得失敗');
      console.log(`サイドバー候補 ${i + 1}: <${tagName}> class="${className}" 表示=${visible}`);
      console.log(`  内容: ${innerHTML.substring(0, 200)}`);
    }

    console.log('=== 5. 具体的なサイドバーボタンの検索 ===');

    // 「サイドバーを閉じる」ボタンの詳細検索
    const closeButtonSelectors = [
      'button:has-text("←サイドバーを閉じる")',
      'button:has-text("サイドバーを閉じる")',
      'button:has-text("←")',
      'button:has-text("閉じる")',
      '[aria-label*="close"]',
      '[aria-label*="閉じる"]'
    ];

    for (const selector of closeButtonSelectors) {
      const elements = await page.locator(selector).all();
      console.log(`「${selector}」: ${elements.length}個の要素`);

      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const visible = await element.isVisible();
        const text = await element.textContent();
        const className = await element.getAttribute('class') || '';
        console.log(`  要素 ${i + 1}: 表示=${visible}, テキスト="${text}", クラス="${className}"`);
      }
    }

    // 「新規顧客ページ作成」ボタンの検索
    const newCustomerSelectors = [
      'button:has-text("新規顧客ページ作成")',
      'button:has-text("＋")',
      'button:has-text("+")',
      'button:has-text("新規")',
      '[role="button"]:has-text("＋")'
    ];

    for (const selector of newCustomerSelectors) {
      const elements = await page.locator(selector).all();
      console.log(`「${selector}」: ${elements.length}個の要素`);
    }

    console.log('=== 6. ページ全体のレイアウト構造確認 ===');

    // ページ全体の構造を確認
    const bodyHTML = await page.locator('body').innerHTML();
    console.log('=== Body HTMLの構造（最初の2000文字）===');
    console.log(bodyHTML.substring(0, 2000));

    await page.screenshot({ path: '.playwright-mcp/auth-06-final-state.png' });

    console.log('=== テスト完了 ===');

  } catch (error) {
    console.error('テスト中にエラーが発生:', error);
    await page.screenshot({ path: '.playwright-mcp/auth-error.png' });
  } finally {
    await browser.close();
  }
}

testAuthAndSidebar().catch(console.error);