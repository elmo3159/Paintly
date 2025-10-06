const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 800
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('=== Paintlyサイドバー構造の最終検証 ===');
    
    // サイトにアクセス
    await page.goto('http://172.17.161.101:9090');
    await page.waitForLoadState('networkidle');
    
    console.log('現在のURL:', page.url());
    
    // サインインが必要かチェック
    if (page.url().includes('/auth/signin')) {
      console.log('Step 1: サインイン実行...');
      
      await page.fill('#email', 'elmodayo3159@gmail.com');
      await page.fill('#password', 'sanri3159');
      await page.click('button[type="submit"]');
      
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      console.log('サインイン後のURL:', page.url());
    }
    
    // ダッシュボードに移動
    try {
      await page.goto('http://172.17.161.101:9090/dashboard');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      console.log('ダッシュボードに移動: ', page.url());
    } catch (error) {
      console.log('ダッシュボードに移動できませんでした:', error.message);
    }
    
    await page.screenshot({ path: './.playwright-mcp/final-01-current-state.png', fullPage: true });
    
    console.log('Step 2: サイドバー要素の詳細検証...');
    
    // 1. Paintlyロゴの確認
    console.log('\n=== 1. Paintlyロゴの確認 ===');
    const paintlyElements = await page.locator('*:has-text("Paintly")').all();
    console.log(`"Paintly"を含む要素数: ${paintlyElements.length}`);
    
    for (let i = 0; i < paintlyElements.length; i++) {
      const element = paintlyElements[i];
      const isVisible = await element.isVisible();
      const text = await element.textContent();
      const tagName = await element.evaluate(el => el.tagName);
      const className = await element.getAttribute('class');
      
      if (isVisible) {
        console.log(`Paintly[${i}]: ${tagName}, text="${text}", class="${className}"`);
        console.log(`  visible: ${isVisible}`);
      }
    }
    
    // 2. サイドバーを閉じるボタンの確認
    console.log('\n=== 2. サイドバーを閉じるボタンの確認 ===');
    const closeSidebarButtons = await page.locator('button:has-text("サイドバーを閉じる")').all();
    console.log(`"サイドバーを閉じる"ボタン数: ${closeSidebarButtons.length}`);
    
    for (let i = 0; i < closeSidebarButtons.length; i++) {
      const button = closeSidebarButtons[i];
      const isVisible = await button.isVisible();
      const text = await button.textContent();
      const className = await button.getAttribute('class');
      
      console.log(`閉じるボタン[${i}]: visible=${isVisible}, text="${text}"`);
      console.log(`  class="${className}"`);
      
      if (isVisible) {
        // ボタンをクリックしてサイドバーを閉じるテスト
        console.log('  → サイドバーを閉じるボタンをクリックしてテスト...');
        await button.click();
        await page.waitForTimeout(1000);
        
        await page.screenshot({ path: './.playwright-mcp/final-02-sidebar-closed.png', fullPage: true });
        
        // サイドバーを再び開くボタンを探す
        const openButtons = await page.locator('button').all();
        let openButtonFound = false;
        
        for (const openBtn of openButtons) {
          const isOpenBtnVisible = await openBtn.isVisible();
          const openBtnIcon = await openBtn.locator('svg').count();
          
          if (isOpenBtnVisible && openBtnIcon > 0) {
            console.log('  → サイドバーを開くボタンを発見してクリック...');
            await openBtn.click();
            await page.waitForTimeout(1000);
            openButtonFound = true;
            break;
          }
        }
        
        if (!openButtonFound) {
          console.log('  → サイドバーを開くボタンが見つかりませんでした');
        }
        
        await page.screenshot({ path: './.playwright-mcp/final-03-sidebar-reopened.png', fullPage: true });
        break;
      }
    }
    
    // 3. 新規顧客ページ作成ボタンの確認
    console.log('\n=== 3. 新規顧客ページ作成ボタンの確認 ===');
    const newCustomerButtons = await page.locator('button:has-text("新規顧客ページ作成")').all();
    console.log(`"新規顧客ページ作成"ボタン数: ${newCustomerButtons.length}`);
    
    for (let i = 0; i < newCustomerButtons.length; i++) {
      const button = newCustomerButtons[i];
      const isVisible = await button.isVisible();
      const text = await button.textContent();
      const className = await button.getAttribute('class');
      const bgColor = await button.evaluate(el => getComputedStyle(el).backgroundColor);
      
      console.log(`新規ボタン[${i}]: visible=${isVisible}, text="${text}"`);
      console.log(`  class="${className}"`);
      console.log(`  backgroundColor="${bgColor}"`);
    }
    
    // 4. ナビゲーション項目の確認
    console.log('\n=== 4. ナビゲーション項目の確認 ===');
    const navigationItems = ['ダッシュボード', '料金プラン', '設定'];
    
    for (const navItem of navigationItems) {
      const navElements = await page.locator(`a:has-text("${navItem}")`).all();
      console.log(`"${navItem}"リンク数: ${navElements.length}`);
      
      for (let i = 0; i < navElements.length; i++) {
        const element = navElements[i];
        const isVisible = await element.isVisible();
        const href = await element.getAttribute('href');
        const className = await element.getAttribute('class');
        
        if (isVisible) {
          console.log(`  ${navItem}[${i}]: href="${href}", class="${className}"`);
        }
      }
    }
    
    // 5. 顧客ページリストの確認
    console.log('\n=== 5. 顧客ページリストの確認 ===');
    const customerSectionHeading = await page.locator('h4:has-text("顧客ページ")').all();
    console.log(`"顧客ページ"見出し数: ${customerSectionHeading.length}`);
    
    if (customerSectionHeading.length > 0) {
      // 顧客ページリスト内のリンクを探す
      const customerLinks = await page.locator('a[href^="/customer/"]').all();
      console.log(`顧客ページリンク数: ${customerLinks.length}`);
      
      for (let i = 0; i < Math.min(customerLinks.length, 5); i++) {
        const link = customerLinks[i];
        const isVisible = await link.isVisible();
        const text = await link.textContent();
        const href = await link.getAttribute('href');
        
        if (isVisible) {
          console.log(`  顧客リンク[${i}]: text="${text}", href="${href}"`);
        }
      }
    }
    
    // 6. プラン情報の確認（サイドバー最下部）
    console.log('\n=== 6. プラン情報の確認 ===');
    
    // プラン名を探す
    const planElements = await page.locator('[class*="font-medium"]:not(a):not(button)').all();
    console.log(`プラン情報候補数: ${planElements.length}`);
    
    for (let i = 0; i < planElements.length; i++) {
      const element = planElements[i];
      const isVisible = await element.isVisible();
      const text = await element.textContent();
      
      if (isVisible && text && (text.includes('プラン') || text.includes('回') || text.includes('残り'))) {
        console.log(`プラン情報[${i}]: "${text}"`);
      }
    }
    
    // プログレスバーを探す
    const progressBars = await page.locator('[role="progressbar"], [class*="progress"]').all();
    console.log(`プログレスバー数: ${progressBars.length}`);
    
    for (let i = 0; i < progressBars.length; i++) {
      const progress = progressBars[i];
      const isVisible = await progress.isVisible();
      const ariaValue = await progress.getAttribute('aria-valuenow');
      const className = await progress.getAttribute('class');
      
      if (isVisible) {
        console.log(`プログレスバー[${i}]: value="${ariaValue}", class="${className}"`);
      }
    }
    
    // 7. サインアウトボタンの確認
    console.log('\n=== 7. サインアウトボタンの確認 ===');
    const signOutButtons = await page.locator('button:has-text("サインアウト")').all();
    console.log(`"サインアウト"ボタン数: ${signOutButtons.length}`);
    
    for (let i = 0; i < signOutButtons.length; i++) {
      const button = signOutButtons[i];
      const isVisible = await button.isVisible();
      const text = await button.textContent();
      const className = await button.getAttribute('class');
      
      if (isVisible) {
        console.log(`サインアウト[${i}]: text="${text}", class="${className}"`);
      }
    }
    
    // 最終スクリーンショット
    await page.screenshot({ path: './.playwright-mcp/final-04-complete-verification.png', fullPage: true });
    
    console.log('\n=== サイドバー構造検証完了 ===');
    console.log('詳細な分析結果がコンソールに出力されました。');
    console.log('スクリーンショットが.playwright-mcpディレクトリに保存されました。');
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
    await page.screenshot({ path: './.playwright-mcp/final-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();