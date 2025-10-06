const { chromium } = require('playwright');

async function detailedInspection() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();

    // コンソールメッセージをキャプチャ
    page.on('console', msg => {
      console.log(`ブラウザコンソール [${msg.type()}]:`, msg.text());
    });

    // ネットワークエラーをキャプチャ
    page.on('response', response => {
      if (!response.ok()) {
        console.log(`ネットワークエラー: ${response.status()} ${response.url()}`);
      }
    });

    console.log('=== ページアクセス ===');
    await page.goto('http://172.17.161.101:9090');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: '.playwright-mcp/detailed-01-initial.png' });

    console.log('=== ページ情報 ===');
    const title = await page.title();
    const url = page.url();
    console.log(`タイトル: ${title}`);
    console.log(`URL: ${url}`);

    console.log('=== 全体的なレイアウト構造確認 ===');

    // 主要なレイアウト要素を確認
    const bodyContent = await page.locator('body').innerHTML();
    console.log('Body HTMLの最初の1000文字:');
    console.log(bodyContent.substring(0, 1000));

    // メインコンテナの確認
    const mainContainers = await page.locator('main, [role="main"], #__next, .app, [class*="layout"], [class*="container"]').all();
    console.log(`メインコンテナ要素数: ${mainContainers.length}`);

    for (let i = 0; i < Math.min(mainContainers.length, 3); i++) {
      const container = mainContainers[i];
      const tagName = await container.evaluate(el => el.tagName);
      const className = await container.getAttribute('class') || '';
      const id = await container.getAttribute('id') || '';
      console.log(`コンテナ ${i + 1}: <${tagName}> class="${className}" id="${id}"`);
    }

    console.log('=== 認証状況の確認 ===');

    // ログイン/ログアウト関連の要素を探す
    const authElements = await page.locator('button:has-text("サインイン"), button:has-text("ログイン"), button:has-text("Googleでサインイン"), button:has-text("サインアウト"), button:has-text("ログアウト")').all();
    console.log(`認証関連要素数: ${authElements.length}`);

    for (let i = 0; i < authElements.length; i++) {
      const element = authElements[i];
      const text = await element.textContent();
      const visible = await element.isVisible();
      console.log(`認証要素 ${i + 1}: "${text}" (表示: ${visible})`);
    }

    console.log('=== あらゆるサイドバー関連要素の検索 ===');

    // 可能性のあるすべてのサイドバー要素
    const sidebarSelectors = [
      'aside',
      'nav',
      '[role="navigation"]',
      '[class*="sidebar"]',
      '[class*="side-bar"]',
      '[class*="menu"]',
      '[class*="nav"]',
      '[data-testid*="sidebar"]',
      '[id*="sidebar"]',
      '.sidebar',
      '#sidebar'
    ];

    for (const selector of sidebarSelectors) {
      const elements = await page.locator(selector).all();
      console.log(`${selector}: ${elements.length}個の要素`);

      for (let i = 0; i < Math.min(elements.length, 2); i++) {
        const element = elements[i];
        const visible = await element.isVisible();
        const className = await element.getAttribute('class') || '';
        const id = await element.getAttribute('id') || '';
        console.log(`  要素 ${i + 1}: 表示=${visible}, class="${className}", id="${id}"`);
      }
    }

    console.log('=== 左側領域の要素確認 ===');

    // CSSで左側に配置される可能性のある要素
    const leftElements = await page.locator('[style*="left"], [class*="left"], [class*="fixed"], [class*="absolute"]').all();
    console.log(`左側配置可能要素数: ${leftElements.length}`);

    for (let i = 0; i < Math.min(leftElements.length, 5); i++) {
      const element = leftElements[i];
      const visible = await element.isVisible();
      const text = await element.textContent();
      const shortText = text ? text.substring(0, 50) : '';
      console.log(`左側要素 ${i + 1}: 表示=${visible}, テキスト="${shortText}"`);
    }

    console.log('=== Flexbox/Grid レイアウトの確認 ===');

    // フレックスまたはグリッドコンテナ
    const layoutContainers = await page.locator('[class*="flex"], [class*="grid"], [style*="display: flex"], [style*="display: grid"]').all();
    console.log(`レイアウトコンテナ数: ${layoutContainers.length}`);

    console.log('=== ナビゲーション要素の詳細確認 ===');

    // Paintlyロゴやブランド要素
    const brandElements = await page.locator('text="Paintly", [alt*="Paintly"], [title*="Paintly"], h1, h2, .logo, #logo').all();
    console.log(`ブランド関連要素数: ${brandElements.length}`);

    for (let i = 0; i < brandElements.length; i++) {
      const element = brandElements[i];
      const text = await element.textContent();
      const visible = await element.isVisible();
      const tagName = await element.evaluate(el => el.tagName);
      console.log(`ブランド要素 ${i + 1}: <${tagName}> "${text}" (表示: ${visible})`);
    }

    console.log('=== JavaScript実行状況の確認 ===');

    // React/Next.jsが正常に動作しているか
    const reactCheck = await page.evaluate(() => {
      return {
        hasReact: typeof window.React !== 'undefined',
        hasNext: typeof window.next !== 'undefined',
        hasDocument: typeof document !== 'undefined',
        documentReady: document.readyState
      };
    });
    console.log('JavaScript環境:', reactCheck);

    console.log('=== 最終スクリーンショット ===');
    await page.screenshot({ path: '.playwright-mcp/detailed-02-final.png' });

    await page.waitForTimeout(3000); // 手動で確認するための時間

  } catch (error) {
    console.error('詳細検査中にエラーが発生:', error);
    await page.screenshot({ path: '.playwright-mcp/detailed-error.png' });
  } finally {
    await browser.close();
  }
}

detailedInspection().catch(console.error);