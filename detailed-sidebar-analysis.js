const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // 1秒間隔で操作を実行
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('Step 1: サイトにアクセス中...');
    await page.goto('http://172.17.161.101:9090');
    await page.waitForLoadState('networkidle');
    
    // 初期ページのスクリーンショット
    await page.screenshot({ path: './.playwright-mcp/01-initial-page.png', fullPage: true });
    console.log('初期ページのスクリーンショットを撮影');
    
    console.log('Step 2: サインインページを確認中...');
    
    // メールアドレス入力
    console.log('メールアドレスを入力中...');
    const emailSelector = 'input[type="email"], input[name="email"], input[placeholder*="メール"], input[placeholder*="email"]';
    await page.waitForSelector(emailSelector, { timeout: 10000 });
    await page.fill(emailSelector, 'elmodayo3159@gmail.com');
    
    // パスワード入力
    console.log('パスワードを入力中...');
    const passwordSelector = 'input[type="password"], input[name="password"]';
    await page.waitForSelector(passwordSelector, { timeout: 10000 });
    await page.fill(passwordSelector, 'sanri3159');
    
    // サインインボタンをクリック
    console.log('サインインボタンをクリック中...');
    const signInButton = page.locator('button[type="submit"], button:has-text("サインイン"), button:has-text("ログイン"), button:has-text("Sign in")').first();
    await signInButton.click();
    
    // ログイン処理の完了を待機
    console.log('ログイン処理の完了を待機中...');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // ログイン後のスクリーンショット
    await page.screenshot({ path: './.playwright-mcp/02-after-signin.png', fullPage: true });
    console.log('ログイン後のスクリーンショットを撮影');
    
    console.log('Step 3: サイドバーの詳細構造を分析中...');
    
    // サイドバーが存在するかチェック
    const sidebarSelectors = [
      'aside',
      '[class*="sidebar"]',
      '[class*="nav"]',
      '[class*="menu"]',
      '.fixed.left-0',
      '.fixed.inset-y-0'
    ];
    
    let sidebarElement = null;
    for (const selector of sidebarSelectors) {
      try {
        const elements = await page.locator(selector).all();
        for (const element of elements) {
          const isVisible = await element.isVisible();
          if (isVisible) {
            console.log(`サイドバー要素が見つかりました: ${selector}`);
            sidebarElement = element;
            break;
          }
        }
        if (sidebarElement) break;
      } catch (error) {
        console.log(`セレクター ${selector} では要素が見つかりませんでした`);
      }
    }
    
    if (sidebarElement) {
      console.log('Step 4: サイドバー内容の詳細分析...');
      
      // サイドバーのHTML構造を取得
      const sidebarHTML = await sidebarElement.innerHTML();
      console.log('=== サイドバーのHTML構造 ===');
      console.log(sidebarHTML);
      
      // Paintlyロゴを探す
      const logoSelectors = [
        'img[alt*="Paintly"]',
        'img[alt*="paintly"]',
        'h1:has-text("Paintly")',
        'div:has-text("Paintly")',
        '[class*="logo"]'
      ];
      
      console.log('=== ロゴ検索結果 ===');
      for (const logoSelector of logoSelectors) {
        const logoElements = await page.locator(logoSelector).all();
        for (let i = 0; i < logoElements.length; i++) {
          const element = logoElements[i];
          const isVisible = await element.isVisible();
          const text = await element.textContent();
          const outerHTML = await element.evaluate(el => el.outerHTML);
          console.log(`${logoSelector}[${i}]: visible=${isVisible}, text="${text}"`);
          console.log(`HTML: ${outerHTML}`);
        }
      }
      
      // 新規顧客ページ作成ボタンを探す
      const newCustomerSelectors = [
        'button:has-text("新規")',
        'button:has-text("顧客")',
        'button:has-text("＋")',
        'button:has-text("+")',
        '[class*="add"]',
        '[class*="new"]',
        '[class*="create"]'
      ];
      
      console.log('=== 新規顧客ページ作成ボタン検索結果 ===');
      for (const buttonSelector of newCustomerSelectors) {
        const buttonElements = await page.locator(buttonSelector).all();
        for (let i = 0; i < buttonElements.length; i++) {
          const element = buttonElements[i];
          const isVisible = await element.isVisible();
          const text = await element.textContent();
          const outerHTML = await element.evaluate(el => el.outerHTML);
          console.log(`${buttonSelector}[${i}]: visible=${isVisible}, text="${text}"`);
          console.log(`HTML: ${outerHTML}`);
        }
      }
      
      // サイドバーを閉じるボタンを探す
      const closeSelectors = [
        'button:has-text("←")',
        'button:has-text("閉じる")',
        'button:has-text("close")',
        '[class*="close"]',
        '[class*="toggle"]'
      ];
      
      console.log('=== サイドバーを閉じるボタン検索結果 ===');
      for (const closeSelector of closeSelectors) {
        const closeElements = await page.locator(closeSelector).all();
        for (let i = 0; i < closeElements.length; i++) {
          const element = closeElements[i];
          const isVisible = await element.isVisible();
          const text = await element.textContent();
          const outerHTML = await element.evaluate(el => el.outerHTML);
          console.log(`${closeSelector}[${i}]: visible=${isVisible}, text="${text}"`);
          console.log(`HTML: ${outerHTML}`);
        }
      }
      
      // サイドバー内の全てのボタンを列挙
      console.log('=== サイドバー内の全ボタン ===');
      const allButtons = await sidebarElement.locator('button').all();
      for (let i = 0; i < allButtons.length; i++) {
        const button = allButtons[i];
        const isVisible = await button.isVisible();
        const text = await button.textContent();
        const className = await button.getAttribute('class');
        const outerHTML = await button.evaluate(el => el.outerHTML);
        console.log(`Button[${i}]: visible=${isVisible}, text="${text}", class="${className}"`);
        console.log(`HTML: ${outerHTML}`);
      }
      
      // サイドバー内の全てのテキスト要素を列挙
      console.log('=== サイドバー内の全テキスト要素 ===');
      const allTextElements = await sidebarElement.locator('*').all();
      for (let i = 0; i < allTextElements.length; i++) {
        const element = allTextElements[i];
        const text = await element.textContent();
        const tagName = await element.evaluate(el => el.tagName);
        const className = await element.getAttribute('class');
        if (text && text.trim()) {
          console.log(`${tagName}[${i}]: text="${text.trim()}", class="${className}"`);
        }
      }
      
    } else {
      console.log('サイドバー要素が見つかりませんでした');
      
      // ページ全体の構造を確認
      console.log('=== ページ全体の構造確認 ===');
      const bodyHTML = await page.locator('body').innerHTML();
      console.log('Body HTML:', bodyHTML.substring(0, 2000) + '...');
    }
    
    console.log('Step 5: 最終的なスクリーンショット撮影...');
    await page.screenshot({ path: './.playwright-mcp/03-final-analysis.png', fullPage: true });
    
    // デベロッパーツールでDOM検証も試行
    console.log('Step 6: DOM構造の詳細分析...');
    const domStructure = await page.evaluate(() => {
      function analyzeElement(element, depth = 0) {
        if (depth > 3) return '...'; // 深さ制限
        
        const indent = '  '.repeat(depth);
        const tagName = element.tagName.toLowerCase();
        const className = element.className || '';
        const id = element.id || '';
        const text = element.childNodes.length === 1 && element.childNodes[0].nodeType === 3 
          ? element.textContent.trim().substring(0, 50) 
          : '';
        
        let result = `${indent}<${tagName}`;
        if (id) result += ` id="${id}"`;
        if (className) result += ` class="${className}"`;
        if (text) result += `>${text}`;
        result += '>\n';
        
        // 子要素の分析（最大3階層まで）
        if (depth < 3) {
          for (let child of element.children) {
            result += analyzeElement(child, depth + 1);
          }
        }
        
        return result;
      }
      
      return analyzeElement(document.body);
    });
    
    console.log('=== DOM構造詳細 ===');
    console.log(domStructure);
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
    await page.screenshot({ path: './.playwright-mcp/error-detailed-analysis.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('ブラウザを閉じました');
  }
})();