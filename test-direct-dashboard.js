const { chromium } = require('playwright');

async function testDirectDashboard() {
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
      if (msg.type() === 'error' || msg.type() === 'warning') {
        console.log(`[${msg.type().toUpperCase()}]:`, msg.text());
      }
    });

    console.log('=== 直接ダッシュボードにアクセステスト ===');

    await page.goto('http://172.17.161.101:9090/dashboard');
    await page.waitForLoadState('networkidle');

    console.log(`最終URL: ${page.url()}`);
    await page.screenshot({ path: '.playwright-mcp/direct-dashboard-01.png' });

    // 認証が必要でリダイレクトされた場合
    if (page.url().includes('/auth/signin')) {
      console.log('認証が必要でサインインページにリダイレクトされました');
      console.log('この状態では手動でGoogle認証を行ってください');

      // 20秒待機（手動認証用）
      console.log('手動認証のため20秒待機します...');
      await page.waitForTimeout(20000);

      console.log('20秒経過、現在のURL:', page.url());
      await page.screenshot({ path: '.playwright-mcp/direct-dashboard-02-after-wait.png' });

      // ダッシュボードにアクセスを再試行
      if (!page.url().includes('/dashboard')) {
        console.log('ダッシュボードへ再度アクセス...');
        await page.goto('http://172.17.161.101:9090/dashboard');
        await page.waitForLoadState('networkidle');
      }
    }

    console.log('=== サイドバー要素の詳細確認 ===');
    console.log(`現在のURL: ${page.url()}`);
    await page.screenshot({ path: '.playwright-mcp/direct-dashboard-03-final-state.png' });

    // サイドバー検索
    const sidebarElements = await page.locator('aside, nav, [class*="sidebar"], [class*="side"], [role="navigation"]').all();
    console.log(`サイドバー候補要素数: ${sidebarElements.length}`);

    // より詳細なサイドバー検索
    const detailedSearch = [
      '[class*="w-64"]',  // 幅が256px（w-64）のクラス
      '[style*="width: 256px"]',
      '[class*="flex"]',
      '[class*="fixed"]',
      '[class*="h-screen"]'
    ];

    for (const selector of detailedSearch) {
      const elements = await page.locator(selector).all();
      console.log(`「${selector}」: ${elements.length}個の要素`);

      for (let i = 0; i < Math.min(elements.length, 3); i++) {
        const element = elements[i];
        const visible = await element.isVisible();
        const text = await element.textContent();
        const className = await element.getAttribute('class') || '';
        const shortText = text ? text.substring(0, 100).replace(/\n/g, ' ') : '';
        console.log(`  要素 ${i + 1}: 表示=${visible}, クラス="${className}"`);
        console.log(`           テキスト="${shortText}"`);
      }
    }

    // Paintlyロゴの検索
    const paintlyElements = await page.locator('text="Paintly", [alt*="Paintly"], [title*="Paintly"]').all();
    console.log(`Paintlyロゴ要素数: ${paintlyElements.length}`);

    for (let i = 0; i < paintlyElements.length; i++) {
      const element = paintlyElements[i];
      const visible = await element.isVisible();
      const text = await element.textContent();
      console.log(`Paintlyロゴ ${i + 1}: 表示=${visible}, テキスト="${text}"`);
    }

    // サイドバーボタンの検索
    const sidebarButtons = await page.locator('button:has-text("サイドバーを閉じる"), button:has-text("←"), button:has-text("新規顧客ページ作成"), button:has-text("＋")').all();
    console.log(`サイドバーボタン数: ${sidebarButtons.length}`);

    for (let i = 0; i < sidebarButtons.length; i++) {
      const button = sidebarButtons[i];
      const visible = await button.isVisible();
      const text = await button.textContent();
      console.log(`ボタン ${i + 1}: 表示=${visible}, テキスト="${text}"`);
    }

    // レイアウト構造の確認
    console.log('=== レイアウト構造確認 ===');
    const bodyHTML = await page.locator('body').innerHTML();
    console.log('Body HTML（最初の3000文字）:');
    console.log(bodyHTML.substring(0, 3000));

    // DevToolsの情報
    console.log('=== ページの詳細情報 ===');
    const title = await page.title();
    console.log(`タイトル: ${title}`);

    // React/Next.jsの確認
    const reactStatus = await page.evaluate(() => {
      return {
        hasReact: typeof window.React !== 'undefined',
        hasNext: typeof window.next !== 'undefined',
        hydrated: document.querySelector('[data-reactroot], #__next') !== null
      };
    });
    console.log('React状態:', reactStatus);

    await page.waitForTimeout(10000); // 最終確認のための待機

  } catch (error) {
    console.error('テスト中にエラーが発生:', error);
    await page.screenshot({ path: '.playwright-mcp/direct-dashboard-error.png' });
  } finally {
    await browser.close();
  }
}

testDirectDashboard().catch(console.error);