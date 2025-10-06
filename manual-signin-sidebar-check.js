const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // より遅くして確実に操作
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('Step 1: サイトにアクセス...');
    await page.goto('http://172.17.161.101:9090');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('現在のURL:', page.url());
    await page.screenshot({ path: './.playwright-mcp/01-initial-state.png', fullPage: true });
    
    console.log('Step 2: 手動サインイン実行...');
    
    // より確実な方法でフィールドをクリアして入力
    const emailField = page.locator('#email');
    await emailField.click();
    await emailField.fill(''); // クリア
    await emailField.type('elmodayo3159@gmail.com', { delay: 100 });
    
    const passwordField = page.locator('#password');
    await passwordField.click();
    await passwordField.fill(''); // クリア
    await passwordField.type('sanri3159', { delay: 100 });
    
    console.log('入力完了、確認用スクリーンショット撮影...');
    await page.screenshot({ path: './.playwright-mcp/02-fields-filled.png', fullPage: true });
    
    // サインインボタンをクリック
    console.log('サインインボタンをクリック...');
    await page.click('button[type="submit"]');
    
    // サインイン処理の完了を待機
    console.log('サインイン処理を待機...');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const afterSigninUrl = page.url();
    console.log('サインイン後のURL:', afterSigninUrl);
    
    await page.screenshot({ path: './.playwright-mcp/03-after-signin.png', fullPage: true });
    
    // サインインが成功したかチェック
    if (afterSigninUrl.includes('/auth/signin')) {
      console.log('サインインページにまだいます。エラーメッセージを確認...');
      
      const errorElements = await page.locator('[class*="error"], [class*="alert"], [role="alert"]').all();
      for (let i = 0; i < errorElements.length; i++) {
        const error = errorElements[i];
        const text = await error.textContent();
        const isVisible = await error.isVisible();
        if (isVisible && text) {
          console.log(`エラーメッセージ[${i}]: ${text}`);
        }
      }
      
      // 直接ダッシュボードに移動を試行
      console.log('直接ダッシュボードに移動を試行...');
      await page.goto('http://172.17.161.101:9090/dashboard');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }
    
    console.log('最終URL:', page.url());
    await page.screenshot({ path: './.playwright-mcp/04-final-page.png', fullPage: true });
    
    console.log('Step 3: サイドバー構造の詳細分析...');
    
    // ページ全体のHTMLを取得して分析
    const pageHTML = await page.content();
    
    // サイドバー関連の要素を検索
    const sidebarKeywords = ['sidebar', 'navigation', 'nav', 'menu', 'aside'];
    
    console.log('=== HTMLでのサイドバー検索 ===');
    for (const keyword of sidebarKeywords) {
      const found = pageHTML.toLowerCase().includes(keyword);
      console.log(`"${keyword}"がHTMLに含まれる: ${found}`);
    }
    
    // サイドバー候補要素の詳細検索
    const sidebarSelectors = [
      'aside',
      'nav', 
      '[class*="sidebar"]',
      '[class*="side-bar"]',
      '[class*="navigation"]',
      '[class*="nav-"]',
      '[class*="menu"]',
      '.fixed',
      '[class*="fixed"]',
      '[style*="position: fixed"]',
      '[data-testid*="sidebar"]',
      '[id*="sidebar"]'
    ];
    
    console.log('=== サイドバー要素の詳細検索 ===');
    for (const selector of sidebarSelectors) {
      try {
        const elements = await page.locator(selector).all();
        console.log(`${selector}: ${elements.length}個の要素`);
        
        for (let i = 0; i < Math.min(elements.length, 3); i++) {
          const element = elements[i];
          const isVisible = await element.isVisible();
          const boundingBox = await element.boundingBox();
          const className = await element.getAttribute('class');
          const innerHTML = await element.innerHTML();
          
          console.log(`  [${i}] visible: ${isVisible}, class: "${className}"`);
          if (boundingBox) {
            console.log(`      位置: x=${boundingBox.x}, y=${boundingBox.y}, w=${boundingBox.width}, h=${boundingBox.height}`);
          }
          if (isVisible) {
            console.log(`      HTML(先頭500文字): ${innerHTML.substring(0, 500)}`);
          }
        }
      } catch (error) {
        console.log(`${selector}: エラー - ${error.message}`);
      }
    }
    
    // Paintlyロゴの検索
    console.log('\n=== Paintlyロゴの検索 ===');
    const logoSelectors = [
      'h1', 'h2', 'h3', 
      'img[alt*="Paintly"]', 
      'img[alt*="paintly"]',
      '*:has-text("Paintly")',
      '[class*="logo"]'
    ];
    
    for (const selector of logoSelectors) {
      try {
        const elements = await page.locator(selector).all();
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          const isVisible = await element.isVisible();
          const text = await element.textContent();
          const src = await element.getAttribute('src');
          const alt = await element.getAttribute('alt');
          
          if (isVisible) {
            console.log(`Logo候補[${i}]: ${selector}`);
            console.log(`  text: "${text}", src: "${src}", alt: "${alt}"`);
          }
        }
      } catch (error) {
        // セレクターエラーはスキップ
      }
    }
    
    // 新規作成ボタンの検索
    console.log('\n=== 新規作成ボタンの検索 ===');
    const newButtonTexts = ['新規', '顧客', '＋', '+', 'New', 'Create', 'Add'];
    
    for (const buttonText of newButtonTexts) {
      try {
        const buttons = await page.locator(`button:has-text("${buttonText}"), a:has-text("${buttonText}")`).all();
        for (let i = 0; i < buttons.length; i++) {
          const button = buttons[i];
          const isVisible = await button.isVisible();
          const fullText = await button.textContent();
          const className = await button.getAttribute('class');
          
          if (isVisible) {
            console.log(`"${buttonText}"ボタン[${i}]: "${fullText}", class: "${className}"`);
          }
        }
      } catch (error) {
        // セレクターエラーはスキップ
      }
    }
    
    // サイドバーを閉じるボタンの検索
    console.log('\n=== サイドバーを閉じるボタンの検索 ===');
    const closeButtonTexts = ['←', '→', '×', '✕', 'close', '閉じる', 'toggle', 'collapse'];
    
    for (const closeText of closeButtonTexts) {
      try {
        const buttons = await page.locator(`button:has-text("${closeText}"), *:has-text("${closeText}")`).all();
        for (let i = 0; i < buttons.length; i++) {
          const button = buttons[i];
          const isVisible = await button.isVisible();
          const fullText = await button.textContent();
          const className = await button.getAttribute('class');
          const tagName = await button.evaluate(el => el.tagName);
          
          if (isVisible) {
            console.log(`"${closeText}"要素[${i}]: ${tagName}, "${fullText}", class: "${className}"`);
          }
        }
      } catch (error) {
        // セレクターエラーはスキップ
      }
    }
    
    // 顧客ページリストの検索
    console.log('\n=== 顧客ページリストの検索 ===');
    const listSelectors = ['ul', 'ol', '[class*="list"]', '[class*="customer"]', '[class*="project"]'];
    
    for (const selector of listSelectors) {
      try {
        const lists = await page.locator(selector).all();
        for (let i = 0; i < lists.length; i++) {
          const list = lists[i];
          const isVisible = await list.isVisible();
          const className = await list.getAttribute('class');
          
          if (isVisible) {
            const items = await list.locator('li, a, div').all();
            console.log(`List[${i}]: ${selector}, class: "${className}", アイテム数: ${items.length}`);
            
            for (let j = 0; j < Math.min(items.length, 3); j++) {
              const item = items[j];
              const itemText = await item.textContent();
              const itemHref = await item.getAttribute('href');
              console.log(`  Item[${j}]: "${itemText?.trim()}", href: "${itemHref}"`);
            }
          }
        }
      } catch (error) {
        // セレクターエラーはスキップ
      }
    }
    
    // プラン情報の検索
    console.log('\n=== プラン情報の検索 ===');
    const planTexts = ['プラン', 'plan', '生成', '残り', 'remaining', 'ゲージ', 'gauge', '回数', 'count'];
    
    for (const planText of planTexts) {
      try {
        const elements = await page.locator(`*:has-text("${planText}")`).all();
        for (let i = 0; i < Math.min(elements.length, 3); i++) {
          const element = elements[i];
          const isVisible = await element.isVisible();
          const fullText = await element.textContent();
          const className = await element.getAttribute('class');
          
          if (isVisible) {
            console.log(`"${planText}"要素[${i}]: "${fullText}", class: "${className}"`);
          }
        }
      } catch (error) {
        // セレクターエラーはスキップ
      }
    }
    
    console.log('\n=== 分析完了 ===');
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
    await page.screenshot({ path: './.playwright-mcp/error-manual-signin.png', fullPage: true });
  } finally {
    // ブラウザは開いたままにして手動確認できるようにする
    console.log('ブラウザは開いたままにします。手動で確認してください。');
    console.log('5分後に自動で閉じます...');
    
    setTimeout(async () => {
      await browser.close();
      console.log('ブラウザを閉じました');
    }, 300000); // 5分後
  }
})();