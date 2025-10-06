const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('サイトにアクセス中...');
    await page.goto('http://172.17.161.101:9090');
    await page.waitForLoadState('networkidle');
    
    // 現在のURLを確認
    console.log('初期URL:', page.url());
    
    // サインインページかダッシュボードかを判定
    const isSigninPage = page.url().includes('/auth/signin');
    
    if (isSigninPage) {
      console.log('サインインページです。認証を実行します...');
      
      // メールアドレス入力
      await page.fill('#email', 'elmodayo3159@gmail.com');
      console.log('メールアドレスを入力しました');
      
      // パスワード入力
      await page.fill('#password', 'sanri3159');
      console.log('パスワードを入力しました');
      
      // サインインボタンをクリック
      await page.click('button[type="submit"]');
      console.log('サインインボタンをクリックしました');
      
      // リダイレクトを待機
      await page.waitForURL('**/*', { timeout: 10000 });
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      console.log('サインイン後のURL:', page.url());
    } else {
      console.log('既にサインイン済みまたは別のページです');
    }
    
    // 現在のページのスクリーンショット
    await page.screenshot({ path: './.playwright-mcp/current-page-state.png', fullPage: true });
    
    // ダッシュボードに移動を試行
    const currentUrl = page.url();
    if (!currentUrl.includes('/dashboard') && !currentUrl.includes('/customer')) {
      console.log('ダッシュボードに直接移動を試行...');
      try {
        await page.goto('http://172.17.161.101:9090/dashboard');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        console.log('ダッシュボードに移動しました:', page.url());
      } catch (error) {
        console.log('ダッシュボードへの移動に失敗:', error.message);
      }
    }
    
    // 最新のページ状態をスクリーンショット
    await page.screenshot({ path: './.playwright-mcp/dashboard-attempt.png', fullPage: true });
    
    console.log('=== サイドバー詳細分析開始 ===');
    
    // サイドバーを複数の方法で検索
    const sidebarSelectors = [
      'aside',
      'nav',
      '[class*="sidebar"]',
      '[class*="navigation"]',
      '[class*="menu"]',
      '.fixed.left-0',
      '.fixed.inset-y-0',
      '[style*="left"]',
      '[data-testid*="sidebar"]'
    ];
    
    let sidebarFound = false;
    let sidebarElement = null;
    
    for (const selector of sidebarSelectors) {
      try {
        const elements = await page.locator(selector).all();
        for (const element of elements) {
          const isVisible = await element.isVisible();
          if (isVisible) {
            const boundingBox = await element.boundingBox();
            console.log(`サイドバー候補発見: ${selector}`);
            console.log(`位置:`, boundingBox);
            
            sidebarElement = element;
            sidebarFound = true;
            break;
          }
        }
        if (sidebarFound) break;
      } catch (error) {
        // セレクターが無効な場合はスキップ
      }
    }
    
    if (sidebarFound && sidebarElement) {
      console.log('=== サイドバー内容の詳細分析 ===');
      
      // サイドバーのHTML構造を取得
      const sidebarHTML = await sidebarElement.innerHTML();
      console.log('サイドバーHTML (最初の1000文字):');
      console.log(sidebarHTML.substring(0, 1000));
      
      // 1. Paintlyロゴの確認
      console.log('\n=== 1. Paintlyロゴの確認 ===');
      const logoElements = await sidebarElement.locator('h1, h2, h3, img, [class*="logo"]').all();
      for (let i = 0; i < logoElements.length; i++) {
        const element = logoElements[i];
        const text = await element.textContent();
        const tagName = await element.evaluate(el => el.tagName);
        const src = await element.getAttribute('src');
        const alt = await element.getAttribute('alt');
        console.log(`Logo候補[${i}]: ${tagName}, text="${text}", src="${src}", alt="${alt}"`);
      }
      
      // 2. ロゴの下に何があるかを確認
      console.log('\n=== 2. ロゴ下の要素確認 ===');
      const allElements = await sidebarElement.locator('*').all();
      for (let i = 0; i < Math.min(allElements.length, 10); i++) {
        const element = allElements[i];
        const text = await element.textContent();
        const tagName = await element.evaluate(el => el.tagName);
        const className = await element.getAttribute('class');
        if (text && text.trim()) {
          console.log(`Element[${i}]: ${tagName}, class="${className}", text="${text.trim().substring(0, 50)}"`);
        }
      }
      
      // 3. 新規顧客ページ作成ボタンの確認
      console.log('\n=== 3. 新規顧客ページ作成ボタンの確認 ===');
      const buttonTexts = ['新規', '顧客', '＋', '+', 'new', 'create', 'add'];
      
      for (const searchText of buttonTexts) {
        const buttons = await sidebarElement.locator(`button:has-text("${searchText}"), a:has-text("${searchText}")`).all();
        for (let i = 0; i < buttons.length; i++) {
          const button = buttons[i];
          const text = await button.textContent();
          const className = await button.getAttribute('class');
          const href = await button.getAttribute('href');
          console.log(`"${searchText}"ボタン[${i}]: text="${text}", class="${className}", href="${href}"`);
        }
      }
      
      // 4. サイドバーを閉じるボタンの確認
      console.log('\n=== 4. サイドバーを閉じるボタンの確認 ===');
      const closeTexts = ['←', '→', '×', '✕', 'close', '閉じる', 'toggle'];
      
      for (const searchText of closeTexts) {
        const closeButtons = await sidebarElement.locator(`button:has-text("${searchText}"), *:has-text("${searchText}")`).all();
        for (let i = 0; i < closeButtons.length; i++) {
          const button = closeButtons[i];
          const text = await button.textContent();
          const className = await button.getAttribute('class');
          const tagName = await button.evaluate(el => el.tagName);
          console.log(`"${searchText}"要素[${i}]: ${tagName}, text="${text}", class="${className}"`);
        }
      }
      
      // 5. 全てのボタン要素の一覧
      console.log('\n=== 5. サイドバー内全ボタン一覧 ===');
      const allButtons = await sidebarElement.locator('button').all();
      for (let i = 0; i < allButtons.length; i++) {
        const button = allButtons[i];
        const text = await button.textContent();
        const className = await button.getAttribute('class');
        const onclick = await button.getAttribute('onclick');
        console.log(`Button[${i}]: text="${text}", class="${className}", onclick="${onclick}"`);
      }
      
      // 6. 顧客ページリストの確認
      console.log('\n=== 6. 顧客ページリストの確認 ===');
      const listElements = await sidebarElement.locator('ul, ol, [class*="list"], [class*="nav"]').all();
      for (let i = 0; i < listElements.length; i++) {
        const list = listElements[i];
        const items = await list.locator('li, a, [class*="item"]').all();
        console.log(`List[${i}]: ${items.length}個のアイテム`);
        
        for (let j = 0; j < Math.min(items.length, 5); j++) {
          const item = items[j];
          const text = await item.textContent();
          const href = await item.getAttribute('href');
          console.log(`  Item[${j}]: text="${text}", href="${href}"`);
        }
      }
      
      // 7. プラン情報の確認（サイドバー最下部）
      console.log('\n=== 7. プラン情報の確認 ===');
      const planTexts = ['プラン', 'plan', '生成', '残り', 'remaining', 'ゲージ', 'gauge'];
      
      for (const searchText of planTexts) {
        const planElements = await sidebarElement.locator(`*:has-text("${searchText}")`).all();
        for (let i = 0; i < planElements.length; i++) {
          const element = planElements[i];
          const text = await element.textContent();
          const className = await element.getAttribute('class');
          const tagName = await element.evaluate(el => el.tagName);
          console.log(`"${searchText}"要素[${i}]: ${tagName}, text="${text}", class="${className}"`);
        }
      }
      
    } else {
      console.log('サイドバーが見つかりませんでした');
      
      // ページ全体でサイドバー的な要素を探す
      console.log('\n=== ページ全体でのサイドバー検索 ===');
      const bodyHTML = await page.locator('body').innerHTML();
      console.log('Body HTML (最初の2000文字):');
      console.log(bodyHTML.substring(0, 2000));
      
      // 左側に固定されている要素を探す
      const fixedElements = await page.locator('.fixed, [style*="position: fixed"]').all();
      console.log(`固定要素数: ${fixedElements.length}`);
      
      for (let i = 0; i < fixedElements.length; i++) {
        const element = fixedElements[i];
        const isVisible = await element.isVisible();
        const boundingBox = await element.boundingBox();
        const className = await element.getAttribute('class');
        
        if (isVisible && boundingBox) {
          console.log(`固定要素[${i}]: class="${className}"`);
          console.log(`位置: x=${boundingBox.x}, y=${boundingBox.y}, width=${boundingBox.width}, height=${boundingBox.height}`);
        }
      }
    }
    
    // 最終スクリーンショット
    await page.screenshot({ path: './.playwright-mcp/sidebar-analysis-final.png', fullPage: true });
    
    console.log('\n=== 分析完了 ===');
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
    await page.screenshot({ path: './.playwright-mcp/error-signin-sidebar.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();