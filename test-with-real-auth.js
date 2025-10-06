const { chromium } = require('playwright');

async function testWithRealAuth() {
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
        console.log(`[コンソールエラー]:`, msg.text());
      }
    });

    console.log('=== 認証データを注入してサイドバー確認テスト ===');

    // 最初にサイトにアクセス
    await page.goto('http://172.17.161.101:9090');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: '.playwright-mcp/auth-real-01-initial.png' });

    console.log('1. 認証データをlocalStorageに注入中...');

    // Supabaseの認証データを手動で注入
    const authData = {
      access_token: 'fake-access-token',
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      refresh_token: 'fake-refresh-token',
      user: {
        id: 'ef6f589f-6d8c-4e02-a3f6-32eb854ba5fd',
        email: 'elmo.123912@gmail.com',
        email_confirmed_at: new Date().toISOString(),
        confirmed_at: new Date().toISOString(),
        user_metadata: {
          full_name: 'エル'
        }
      }
    };

    // Supabaseのセッションデータを注入
    await page.evaluate((authData) => {
      const sessionKey = `sb-mockfjcakfzbzccabcgm-auth-token`;
      localStorage.setItem(sessionKey, JSON.stringify(authData));
    }, authData);

    console.log('2. 認証データ注入後、ダッシュボードにアクセス...');

    await page.goto('http://172.17.161.101:9090/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // React レンダリング待機
    await page.screenshot({ path: '.playwright-mcp/auth-real-02-dashboard-after-injection.png' });

    console.log(`現在のURL: ${page.url()}`);

    // サイドバー要素の詳細検索
    console.log('3. サイドバー要素の詳細検索...');

    const sidebarSelectors = [
      'aside',
      'nav',
      '[class*="sidebar"]',
      '[class*="w-64"]',
      '[class*="h-screen"]',
      '[class*="flex-col"]'
    ];

    let sidebarFound = false;
    for (const selector of sidebarSelectors) {
      const elements = await page.locator(selector).all();
      console.log(`${selector}: ${elements.length}個の要素`);

      for (let i = 0; i < Math.min(elements.length, 2); i++) {
        const element = elements[i];
        const visible = await element.isVisible();
        const className = await element.getAttribute('class') || '';
        const innerHTML = await element.innerHTML().catch(() => '取得不可');

        console.log(`  要素 ${i + 1}: 表示=${visible}`);
        console.log(`    クラス: ${className}`);

        if (innerHTML.includes('Paintly') || innerHTML.includes('サイドバー') || innerHTML.includes('新規顧客')) {
          console.log(`    サイドバー関連コンテンツを発見!`);
          console.log(`    HTML内容（最初の200文字）: ${innerHTML.substring(0, 200)}`);
          sidebarFound = true;
        }
      }
    }

    // 特定のサイドバーコンテンツを検索
    console.log('4. 特定のサイドバーコンテンツを検索...');

    const contentSelectors = [
      'text="Paintly"',
      'text="サイドバーを閉じる"',
      'text="新規顧客ページ作成"',
      'text="ダッシュボード"',
      'text="料金プラン"',
      'text="設定"',
      'button:has-text("＋")'
    ];

    for (const selector of contentSelectors) {
      const elements = await page.locator(selector).all();
      console.log(`${selector}: ${elements.length}個の要素`);

      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const visible = await element.isVisible();
        const text = await element.textContent();
        console.log(`  要素 ${i + 1}: 表示=${visible}, テキスト="${text}"`);
      }
    }

    // レイアウト構造の詳細確認
    console.log('5. レイアウト構造の詳細確認...');

    const flexContainers = await page.locator('[class*="flex"]').all();
    console.log(`Flexコンテナ数: ${flexContainers.length}`);

    for (let i = 0; i < Math.min(flexContainers.length, 5); i++) {
      const container = flexContainers[i];
      const visible = await container.isVisible();
      const className = await container.getAttribute('class') || '';
      const innerHTML = await container.innerHTML().catch(() => '');

      if (className.includes('h-screen') || innerHTML.includes('Paintly')) {
        console.log(`  重要なFlexコンテナ ${i + 1}:`);
        console.log(`    表示: ${visible}`);
        console.log(`    クラス: ${className}`);
        console.log(`    HTMLサンプル: ${innerHTML.substring(0, 100)}`);
      }
    }

    // ページの完全なHTML構造（サイドバー関連部分のみ）
    console.log('6. ページのHTML構造サンプル...');
    const bodyHTML = await page.locator('body').innerHTML();
    const relevantHTML = bodyHTML.split('').slice(0, 5000).join('');
    console.log('Body HTML（最初の5000文字）:');
    console.log(relevantHTML);

    await page.screenshot({ path: '.playwright-mcp/auth-real-03-final-analysis.png' });

    console.log('7. JavaScript環境とReact状態の確認...');
    const reactStatus = await page.evaluate(() => {
      return {
        hasReact: typeof window.React !== 'undefined',
        hasNext: typeof window.next !== 'undefined',
        hasSupabase: typeof window.supabase !== 'undefined',
        documentReady: document.readyState,
        bodyChildren: document.body.children.length,
        hasDataReactRoot: !!document.querySelector('[data-reactroot]'),
        hasNextApp: !!document.querySelector('#__next')
      };
    });
    console.log('React/Next.js状態:', reactStatus);

    console.log('=== テスト完了 ===');
    if (sidebarFound) {
      console.log('✅ サイドバー関連要素が発見されました');
    } else {
      console.log('❌ サイドバー関連要素が見つかりませんでした');
    }

  } catch (error) {
    console.error('認証テスト中にエラー:', error);
    await page.screenshot({ path: '.playwright-mcp/auth-real-error.png' });
  } finally {
    await browser.close();
  }
}

testWithRealAuth().catch(console.error);