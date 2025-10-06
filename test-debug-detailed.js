const { chromium, devices } = require('@playwright/test');

(async () => {
  console.log('詳細デバッグテストを開始します...');

  const iPhone14 = devices['iPhone 14'];
  const browser = await chromium.launch({
    headless: false, // ヘッドレスモードをオフにしてブラウザを表示
    slowMo: 2000 // 操作を遅くしてデバッグしやすくする
  });

  const context = await browser.newContext({
    ...iPhone14,
    hasTouch: true,
    isMobile: true
  });

  const page = await context.newPage();

  try {
    // コンソールログを監視
    page.on('console', msg => console.log('ブラウザコンソール:', msg.text()));
    page.on('pageerror', error => console.error('ページエラー:', error.message));

    console.log('1. サイトに直接アクセス');
    await page.goto('http://172.17.161.101:9090');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: '.playwright-mcp/debug-01-homepage.png' });

    // ページの内容を確認
    const bodyText = await page.locator('body').textContent();
    console.log('ページの内容（最初の500文字）:', bodyText.substring(0, 500));

    console.log('2. ダッシュボードに直接アクセスを試行');
    await page.goto('http://172.17.161.101:9090/dashboard');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: '.playwright-mcp/debug-02-dashboard.png' });

    const currentUrl = page.url();
    console.log('ダッシュボードアクセス後のURL:', currentUrl);

    // 認証が必要でリダイレクトされた場合
    if (currentUrl.includes('signin') || currentUrl.includes('auth')) {
      console.log('認証が必要です - Google認証を試行');

      // Googleボタンを探してクリック
      const googleButton = await page.locator('button:has-text("Google"), [data-provider="google"]').first();
      if (await googleButton.isVisible()) {
        console.log('Googleボタンが見つかりました');
        await googleButton.click();

        // 少し待機
        await page.waitForTimeout(5000);
        await page.screenshot({ path: '.playwright-mcp/debug-03-after-google-click.png' });

        const newUrl = page.url();
        console.log('Google認証後のURL:', newUrl);
      } else {
        console.log('Googleボタンが見つかりません');

        // 利用可能なボタンを全て確認
        const buttons = await page.locator('button').all();
        console.log(`利用可能なボタン数: ${buttons.length}`);

        for (let i = 0; i < Math.min(buttons.length, 10); i++) {
          const buttonText = await buttons[i].textContent();
          const buttonClass = await buttons[i].getAttribute('class');
          console.log(`ボタン ${i+1}: "${buttonText}" (class: ${buttonClass})`);
        }
      }
    }

    // 最終的に認証できた場合のテスト
    if (!page.url().includes('signin')) {
      console.log('3. 認証済み - 顧客ページを探す');

      // 顧客ページのリンクを探す
      const links = await page.locator('a').all();
      console.log(`利用可能なリンク数: ${links.length}`);

      for (let i = 0; i < Math.min(links.length, 20); i++) {
        const linkText = await links[i].textContent();
        const href = await links[i].getAttribute('href');
        if (linkText && linkText.trim()) {
          console.log(`リンク ${i+1}: "${linkText.trim()}" (href: ${href})`);
        }
      }

      // 顧客ページに直接アクセス
      const customerUrls = [
        'http://172.17.161.101:9090/customer/1',
        'http://172.17.161.101:9090/customer/new'
      ];

      for (const url of customerUrls) {
        try {
          console.log(`${url} にアクセス中...`);
          await page.goto(url);
          await page.waitForLoadState('networkidle');

          const title = await page.title();
          const currentUrl = page.url();
          console.log(`${url} - タイトル: ${title}, 実際のURL: ${currentUrl}`);

          await page.screenshot({ path: `.playwright-mcp/debug-customer-${url.split('/').pop()}.png` });

          // 履歴タブを探す
          const tabButtons = await page.locator('button, [role="tab"]').all();
          console.log(`タブ数: ${tabButtons.length}`);

          for (let i = 0; i < tabButtons.length; i++) {
            const tabText = await tabButtons[i].textContent();
            if (tabText && tabText.trim()) {
              console.log(`タブ ${i+1}: "${tabText.trim()}"`);

              // 履歴タブを見つけた場合
              if (tabText.includes('履歴') || tabText.toLowerCase().includes('history')) {
                console.log('履歴タブを発見 - クリックします');
                await tabButtons[i].click();
                await page.waitForTimeout(2000);
                await page.screenshot({ path: '.playwright-mcp/debug-history-tab.png' });

                // 履歴の中身を確認
                const historyItems = await page.locator('.history-item, .generation-result, [data-testid*="history"]').all();
                console.log(`履歴アイテム数: ${historyItems.length}`);

                if (historyItems.length > 0) {
                  console.log('履歴アイテムをクリックします');
                  await historyItems[0].click();
                  await page.waitForTimeout(2000);
                  await page.screenshot({ path: '.playwright-mcp/debug-history-detail.png' });

                  // スライダーを探す
                  const sliders = await page.locator('[class*="slider"], [class*="compare"]').all();
                  console.log(`スライダー要素数: ${sliders.length}`);

                  for (let j = 0; j < sliders.length; j++) {
                    const sliderClass = await sliders[j].getAttribute('class');
                    const isVisible = await sliders[j].isVisible();
                    console.log(`スライダー ${j+1}: class="${sliderClass}", visible=${isVisible}`);
                  }
                }

                break;
              }
            }
          }

          break; // 最初に成功したURLで止める
        } catch (e) {
          console.log(`${url} へのアクセスに失敗:`, e.message);
        }
      }
    } else {
      console.log('認証に失敗しました');
    }

    // 最終スクリーンショット
    await page.screenshot({ path: '.playwright-mcp/debug-final.png' });

  } catch (error) {
    console.error('テスト中にエラーが発生:', error);
    await page.screenshot({ path: '.playwright-mcp/debug-error.png' });
  } finally {
    // ブラウザを閉じずに待機（手動で確認できるように）
    console.log('ブラウザは開いたままにします。手動で確認後、Ctrl+Cで終了してください。');
    await page.waitForTimeout(60000); // 60秒待機
    await browser.close();
  }
})();