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
    
    // 初期ページの分析
    console.log('=== 初期ページの分析 ===');
    await page.screenshot({ path: './.playwright-mcp/01-current-page.png', fullPage: true });
    
    const pageTitle = await page.title();
    console.log('ページタイトル:', pageTitle);
    
    const url = page.url();
    console.log('現在のURL:', url);
    
    // ページ上の全入力フィールドを探す
    console.log('=== 全入力フィールドの分析 ===');
    const inputs = await page.locator('input').all();
    console.log(`入力フィールド数: ${inputs.length}`);
    
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const type = await input.getAttribute('type');
      const name = await input.getAttribute('name');
      const placeholder = await input.getAttribute('placeholder');
      const id = await input.getAttribute('id');
      const className = await input.getAttribute('class');
      const isVisible = await input.isVisible();
      
      console.log(`Input[${i}]:`, {
        type, name, placeholder, id, className, isVisible
      });
    }
    
    // ページ上の全ボタンを探す
    console.log('=== 全ボタンの分析 ===');
    const buttons = await page.locator('button').all();
    console.log(`ボタン数: ${buttons.length}`);
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const text = await button.textContent();
      const type = await button.getAttribute('type');
      const className = await button.getAttribute('class');
      const isVisible = await button.isVisible();
      
      console.log(`Button[${i}]:`, {
        text: text?.trim(), type, className, isVisible
      });
    }
    
    // ページ上の全リンクを探す
    console.log('=== 全リンクの分析 ===');
    const links = await page.locator('a').all();
    console.log(`リンク数: ${links.length}`);
    
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      const text = await link.textContent();
      const href = await link.getAttribute('href');
      const className = await link.getAttribute('class');
      const isVisible = await link.isVisible();
      
      console.log(`Link[${i}]:`, {
        text: text?.trim(), href, className, isVisible
      });
    }
    
    // 特定のテキストを含む要素を探す
    console.log('=== 特定テキスト要素の検索 ===');
    const searchTexts = ['Paintly', 'サインイン', 'ログイン', 'Sign in', 'メール', 'パスワード', '顧客', '新規'];
    
    for (const searchText of searchTexts) {
      const elements = await page.locator(`text="${searchText}"`).all();
      console.log(`"${searchText}"を含む要素数: ${elements.length}`);
      
      for (let i = 0; i < Math.min(elements.length, 3); i++) {
        const element = elements[i];
        const tagName = await element.evaluate(el => el.tagName);
        const className = await element.getAttribute('class');
        const isVisible = await element.isVisible();
        
        console.log(`  ${searchText}[${i}]: ${tagName}, class="${className}", visible=${isVisible}`);
      }
    }
    
    // もしサインインページなら、実際にサインインを試行
    console.log('=== サインイン試行 ===');
    
    // より柔軟なセレクターでメールアドレス入力欄を探す
    const emailInputs = await page.locator('input').all();
    let emailInput = null;
    
    for (const input of emailInputs) {
      const type = await input.getAttribute('type');
      const name = await input.getAttribute('name');
      const placeholder = await input.getAttribute('placeholder');
      const id = await input.getAttribute('id');
      
      if (type === 'email' || 
          name?.includes('email') || 
          placeholder?.toLowerCase().includes('email') ||
          placeholder?.includes('メール') ||
          id?.includes('email')) {
        emailInput = input;
        console.log('メールアドレス入力欄を発見');
        break;
      }
    }
    
    // パスワード入力欄を探す
    let passwordInput = null;
    for (const input of emailInputs) {
      const type = await input.getAttribute('type');
      const name = await input.getAttribute('name');
      const placeholder = await input.getAttribute('placeholder');
      
      if (type === 'password' || 
          name?.includes('password') || 
          placeholder?.toLowerCase().includes('password') ||
          placeholder?.includes('パスワード')) {
        passwordInput = input;
        console.log('パスワード入力欄を発見');
        break;
      }
    }
    
    if (emailInput && passwordInput) {
      console.log('サインイン情報を入力中...');
      await emailInput.fill('elmodayo3159@gmail.com');
      await passwordInput.fill('sanri3159');
      
      // サインインボタンを探してクリック
      const submitButtons = await page.locator('button[type="submit"], input[type="submit"]').all();
      if (submitButtons.length > 0) {
        console.log('サインインボタンをクリック...');
        await submitButtons[0].click();
        
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        
        console.log('サインイン後のページを分析...');
        await page.screenshot({ path: './.playwright-mcp/02-after-signin-flexible.png', fullPage: true });
        
        // サインイン後のURL確認
        const newUrl = page.url();
        console.log('サインイン後のURL:', newUrl);
      }
    } else {
      console.log('既にサインイン済みか、サインインページではない可能性があります');
    }
    
    // 最終的なページ構造分析
    console.log('=== 最終的なページ構造分析 ===');
    
    // サイドバー的な要素を広範囲に検索
    const sidebarCandidates = await page.locator('aside, nav, [class*="sidebar"], [class*="menu"], [class*="navigation"], .fixed').all();
    console.log(`サイドバー候補数: ${sidebarCandidates.length}`);
    
    for (let i = 0; i < sidebarCandidates.length; i++) {
      const candidate = sidebarCandidates[i];
      const isVisible = await candidate.isVisible();
      const className = await candidate.getAttribute('class');
      const tagName = await candidate.evaluate(el => el.tagName);
      
      if (isVisible) {
        console.log(`サイドバー候補[${i}]: ${tagName}, class="${className}"`);
        
        // 内容を分析
        const innerText = await candidate.textContent();
        console.log(`  内容（先頭200文字）: ${innerText?.substring(0, 200)}`);
        
        // この要素内のボタンを探す
        const buttonsInSidebar = await candidate.locator('button').all();
        console.log(`  内部ボタン数: ${buttonsInSidebar.length}`);
        
        for (let j = 0; j < buttonsInSidebar.length; j++) {
          const btn = buttonsInSidebar[j];
          const btnText = await btn.textContent();
          const btnClass = await btn.getAttribute('class');
          console.log(`    Button[${j}]: "${btnText?.trim()}", class="${btnClass}"`);
        }
      }
    }
    
    // 最終スクリーンショット
    await page.screenshot({ path: './.playwright-mcp/03-final-flexible-analysis.png', fullPage: true });
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
    await page.screenshot({ path: './.playwright-mcp/error-flexible.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('分析完了');
  }
})();