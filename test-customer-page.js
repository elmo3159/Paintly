const { chromium } = require('playwright');

async function testCustomerPage() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  try {
    console.log('=== Customer ページでのサイドバー確認 ===');
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    // コンソールエラーをキャッチ
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console Error:', msg.text());
      }
    });

    // 1. customer/new ページに直接アクセス
    console.log('1. customer/new ページに直接アクセス...');
    try {
      await page.goto('http://172.17.161.101:9090/customer/new', {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      console.log('ページロード完了');
    } catch (e) {
      console.log('直接アクセス失敗、リダイレクトされている可能性があります');
      console.log('現在のURL:', page.url());
    }

    await page.waitForTimeout(3000);
    console.log('最終URL:', page.url());
    await page.screenshot({ path: '.playwright-mcp/customer-01-page-load.png', fullPage: true });

    // 2. サイドバーの存在確認
    console.log('2. サイドバーの存在確認...');

    const sidebarSelectors = [
      '[data-testid="sidebar"]',
      '.sidebar',
      'aside',
      'nav[aria-label*="サイドバー"]',
      'nav[aria-label*="sidebar"]',
      'div.w-64', // Tailwind CSS width-64 (256px) - サイドバーのよくある幅
      'div.h-screen.w-64', // 高さフルスクリーン & 幅64のdiv
      'div:has(button:has-text("新規顧客ページ作成"))', // 新規顧客ページ作成ボタンを含むdiv
    ];

    let sidebarFound = false;
    let sidebarElement = null;

    for (const selector of sidebarSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          console.log(`✅ サイドバーが見つかりました: ${selector}`);
          sidebarElement = element;
          sidebarFound = true;

          // サイドバーの詳細情報を取得
          const boundingBox = await element.boundingBox();
          console.log('サイドバーの位置とサイズ:', boundingBox);
          break;
        }
      } catch (e) {
        // 次のセレクターを試す
      }
    }

    if (!sidebarFound) {
      console.log('❌ サイドバーが見つかりません');

      // ページ全体のHTML構造を確認
      const bodyHTML = await page.evaluate(() => {
        const body = document.body;
        const mainDivs = Array.from(body.querySelectorAll('div')).slice(0, 10);
        return mainDivs.map(div => ({
          className: div.className,
          id: div.id,
          children: div.children.length,
          text: div.textContent.slice(0, 50)
        }));
      });

      console.log('ページの主要なdiv要素:', JSON.stringify(bodyHTML, null, 2));
    }

    // 3. 「←サイドバーを閉じる」ボタンの確認
    console.log('3. 「←サイドバーを閉じる」ボタンの確認...');

    const closeSidebarSelectors = [
      'button:has-text("サイドバーを閉じる")',
      'button:has-text("←サイドバーを閉じる")',
      'button:has-text("←")',
      'button:has-text("×")',
      'button[aria-label*="閉じる"]',
      'button[aria-label*="close"]',
      'button:has(svg):has-text("サイドバー")', // SVGアイコンとテキストを含むボタン
      'button[title*="閉じる"]',
      '[data-testid="close-sidebar"]'
    ];

    let closeSidebarButton = null;
    let closeSidebarFound = false;

    for (const selector of closeSidebarSelectors) {
      try {
        const button = page.locator(selector);
        if (await button.isVisible({ timeout: 2000 })) {
          console.log(`✅ 「←サイドバーを閉じる」ボタンが見つかりました: ${selector}`);
          closeSidebarButton = button;
          closeSidebarFound = true;

          // ボタンの詳細情報
          const boundingBox = await button.boundingBox();
          const textContent = await button.textContent();
          const innerHTML = await button.innerHTML();

          console.log('ボタンの位置:', boundingBox);
          console.log('ボタンのテキスト:', textContent);
          console.log('ボタンのHTML:', innerHTML);
          break;
        }
      } catch (e) {
        // 次のセレクターを試す
      }
    }

    if (!closeSidebarFound) {
      console.log('❌ 「←サイドバーを閉じる」ボタンが見つかりません');

      // サイドバー内のすべてのボタンを確認
      if (sidebarElement) {
        console.log('サイドバー内のボタンを確認中...');
        const allButtons = await sidebarElement.locator('button').all();
        for (let i = 0; i < allButtons.length; i++) {
          try {
            const button = allButtons[i];
            const text = await button.textContent();
            const isVisible = await button.isVisible();
            if (isVisible) {
              console.log(`ボタン ${i + 1}: "${text}"`);
            }
          } catch (e) {
            console.log(`ボタン ${i + 1}: テキスト取得失敗`);
          }
        }
      }
    }

    // 4. 新規顧客ページ作成ボタンの確認
    console.log('4. 新規顧客ページ作成ボタンの確認...');

    const newCustomerSelectors = [
      'button:has-text("新規顧客ページ作成")',
      'button:has-text("＋")',
      'button:has-text("+")',
      'button:has-text("新規")',
      '[data-testid="new-customer"]',
      'button:has(svg):has-text("新規")', // SVGアイコンと新規テキストを含むボタン
    ];

    let newCustomerFound = false;
    let newCustomerButton = null;

    for (const selector of newCustomerSelectors) {
      try {
        const button = page.locator(selector);
        if (await button.isVisible({ timeout: 2000 })) {
          console.log(`✅ 新規顧客ページ作成ボタンが見つかりました: ${selector}`);
          newCustomerButton = button;
          newCustomerFound = true;

          const boundingBox = await button.boundingBox();
          const textContent = await button.textContent();

          console.log('ボタンの位置:', boundingBox);
          console.log('ボタンのテキスト:', textContent);
          break;
        }
      } catch (e) {
        // 次のセレクターを試す
      }
    }

    if (!newCustomerFound) {
      console.log('❌ 新規顧客ページ作成ボタンが見つかりません');
    }

    // 5. ボタンの位置関係確認
    if (closeSidebarButton && newCustomerButton) {
      console.log('5. ボタンの位置関係確認...');

      const closeBtnBox = await closeSidebarButton.boundingBox();
      const newCustomerBtnBox = await newCustomerButton.boundingBox();

      if (closeBtnBox && newCustomerBtnBox) {
        console.log('閉じるボタンのY座標:', closeBtnBox.y);
        console.log('新規顧客ボタンのY座標:', newCustomerBtnBox.y);

        if (closeBtnBox.y < newCustomerBtnBox.y) {
          console.log('✅ 「←サイドバーを閉じる」ボタンが新規顧客ページ作成ボタンの上に配置されています');
        } else {
          console.log('⚠️ ボタンの位置関係が期待と異なります');
        }
      }
    }

    // 6. サイドバーを閉じるボタンのクリックテスト
    if (closeSidebarButton) {
      console.log('6. サイドバーを閉じるボタンのクリックテスト...');

      try {
        await closeSidebarButton.click();
        console.log('✅ 「←サイドバーを閉じる」ボタンをクリックしました');

        await page.waitForTimeout(1000);
        await page.screenshot({ path: '.playwright-mcp/customer-02-sidebar-closed.png', fullPage: true });

        // サイドバーが閉じられたかを確認
        if (sidebarElement) {
          const isStillVisible = await sidebarElement.isVisible();
          if (!isStillVisible) {
            console.log('✅ サイドバーが正常に閉じられました');
          } else {
            console.log('⚠️ サイドバーがまだ表示されています');
          }
        }

        // サイドバーを開くボタンが表示されるかを確認
        const openSidebarButton = page.locator('button:has(svg[data-icon="menu"])');
        const isOpenButtonVisible = await openSidebarButton.isVisible({ timeout: 2000 });
        if (isOpenButtonVisible) {
          console.log('✅ サイドバーを開くボタンが表示されました');
        } else {
          console.log('⚠️ サイドバーを開くボタンが見つかりません');
        }

      } catch (e) {
        console.log('❌ ボタンクリック時にエラー:', e.message);
      }
    }

    console.log('\n=== 確認作業完了 ===');

    // 結果サマリー
    console.log('\n📊 結果サマリー:');
    console.log(`サイドバー: ${sidebarFound ? '✅ 発見' : '❌ 未発見'}`);
    console.log(`「←サイドバーを閉じる」ボタン: ${closeSidebarFound ? '✅ 発見' : '❌ 未発見'}`);
    console.log(`新規顧客ページ作成ボタン: ${newCustomerFound ? '✅ 発見' : '❌ 未発見'}`);

    await context.close();

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  } finally {
    await browser.close();
  }
}

// スクリプト実行
testCustomerPage().catch(console.error);