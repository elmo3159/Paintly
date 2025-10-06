const { chromium } = require('playwright');

async function testSliderIssue() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  // Console logをキャプチャ
  page.on('console', msg => {
    console.log(`[CONSOLE ${msg.type()}]:`, msg.text());
  });

  // Network requestsをキャプチャ
  page.on('request', request => {
    if (request.url().includes('supabase') || request.url().includes('image')) {
      console.log(`[REQUEST]: ${request.method()} ${request.url()}`);
    }
  });

  page.on('response', response => {
    if (response.url().includes('supabase') || response.url().includes('image')) {
      console.log(`[RESPONSE]: ${response.status()} ${response.url()}`);
    }
  });

  try {
    console.log('1. ログインページに移動中...');
    await page.goto('http://172.17.161.101:9090/auth/signin');
    await page.screenshot({ path: '.playwright-mcp/signin-page.png' });

    console.log('2. ログイン情報を入力中...');
    await page.fill('input[type="email"]', 'elmodayo3159@gmail.com');
    await page.fill('input[type="password"]', 'sanri3159');

    console.log('3. ログインボタンをクリック...');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ timeout: 10000 });

    await page.screenshot({ path: '.playwright-mcp/after-login.png' });
    console.log('4. ログイン成功、ダッシュボードページ');

    // サイドバーの顧客ページリンクを探す
    console.log('5. サイドバーの顧客ページを探しています...');

    // スクリーンショットで見えた「新規顧客 2025/9/15」のリンクを探す
    const customerLink = page.locator('text=新規顧客 2025/9/15').or(page.locator('text=新規顧客')).first();

    if (await customerLink.count() > 0) {
      console.log('6. サイドバーの顧客ページリンクが見つかりました');
      await customerLink.click();
      await page.waitForTimeout(3000);
    } else {
      console.log('6. サイドバーに顧客ページが見つからないため、直接URLでアクセスします');
      // 可能性のある顧客IDでアクセスを試行
      const possibleIds = [1, 2, 3, '1', '2', '3'];
      for (const id of possibleIds) {
        try {
          await page.goto(`http://172.17.161.101:9090/customer/${id}`);
          await page.waitForTimeout(2000);
          // ページが正しく読み込まれたかチェック
          const pageTitle = await page.title();
          if (!pageTitle.includes('404') && !pageTitle.includes('Error')) {
            console.log(`顧客ID ${id} でアクセス成功`);
            break;
          }
        } catch (error) {
          console.log(`顧客ID ${id} でのアクセスに失敗: ${error.message}`);
        }
      }
    }

    await page.screenshot({ path: '.playwright-mcp/customer-page.png' });

    // 生成履歴タブまたは既存の画像を探す
    console.log('7. 生成履歴または既存の画像を探しています...');

    // まず生成履歴タブを探す
    const historyTab = page.locator('text=生成履歴').or(page.locator('text=History')).or(page.locator('[role="tab"]:has-text("履歴")'));

    // 既存の画像や詳細ボタンも同時に探す
    const existingImages = page.locator('img[src*="supabase"]').or(page.locator('img[alt*="生成"]')).or(page.locator('img[alt*="元画像"]'));
    const detailButtons = page.locator('text=詳細').or(page.locator('button:has-text("詳細")'));

    console.log(`履歴タブ数: ${await historyTab.count()}`);
    console.log(`既存画像数: ${await existingImages.count()}`);
    console.log(`詳細ボタン数: ${await detailButtons.count()}`);

    // 生成履歴タブがある場合はクリック
    if (await historyTab.count() > 0) {
      console.log('8. 生成履歴タブをクリック...');
      await historyTab.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: '.playwright-mcp/history-tab.png' });
    }

    // 詳細ボタンを再度確認
    console.log('9. 詳細ボタンを探しています...');
    const updatedDetailButtons = await page.locator('text=詳細').or(page.locator('button:has-text("詳細")')).all();

    if (updatedDetailButtons.length > 0) {
      console.log(`10. ${updatedDetailButtons.length}個の詳細ボタンが見つかりました`);
      await updatedDetailButtons[0].click();
      await page.waitForTimeout(3000);

      await page.screenshot({ path: '.playwright-mcp/detail-modal.png' });

      // ReactCompareSliderを詳しく調査
      console.log('11. ReactCompareSliderコンポーネントを調査中...');

      // 画像要素を探す
      const images = await page.locator('img').all();
      console.log(`12. 画像要素が${images.length}個見つかりました`);

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const src = await img.getAttribute('src');
        const alt = await img.getAttribute('alt');
        const naturalWidth = await img.evaluate(el => el.naturalWidth);
        const naturalHeight = await img.evaluate(el => el.naturalHeight);
        const complete = await img.evaluate(el => el.complete);

        console.log(`画像 ${i + 1}:`);
        console.log(`  src: ${src}`);
        console.log(`  alt: ${alt}`);
        console.log(`  naturalWidth: ${naturalWidth}`);
        console.log(`  naturalHeight: ${naturalHeight}`);
        console.log(`  complete: ${complete}`);
      }

      // react-compare-slider特有の要素を探す
      const sliderContainer = page.locator('[class*="react-compare-slider"]').or(page.locator('[data-rcs]'));

      if (await sliderContainer.count() > 0) {
        console.log('13. ReactCompareSliderコンテナが見つかりました');

        // スライダーのHTML構造を取得
        const sliderHTML = await sliderContainer.innerHTML();
        console.log('Slider HTML:', sliderHTML);

        // スライダー内の画像を特定
        const sliderImages = await sliderContainer.locator('img').all();
        console.log(`14. スライダー内に${sliderImages.length}個の画像があります`);

        for (let i = 0; i < sliderImages.length; i++) {
          const img = sliderImages[i];
          const src = await img.getAttribute('src');
          const style = await img.getAttribute('style');
          const className = await img.getAttribute('class');

          console.log(`スライダー画像 ${i + 1}:`);
          console.log(`  src: ${src}`);
          console.log(`  style: ${style}`);
          console.log(`  class: ${className}`);

          // 画像が実際に読み込まれているかチェック
          const isLoaded = await img.evaluate(el => {
            return el.complete && el.naturalHeight !== 0;
          });
          console.log(`  読み込み完了: ${isLoaded}`);
        }

        // スライダーを操作してみる
        console.log('15. スライダーを操作してテスト...');
        const sliderHandle = page.locator('[class*="handle"]').or(page.locator('[role="slider"]'));

        if (await sliderHandle.count() > 0) {
          console.log('スライダーハンドルが見つかりました');
          await page.screenshot({ path: '.playwright-mcp/before-slider-test.png' });

          // スライダーを動かしてみる
          const handleBox = await sliderHandle.boundingBox();
          if (handleBox) {
            await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2);
            await page.mouse.down();
            await page.mouse.move(handleBox.x + 100, handleBox.y + handleBox.height / 2);
            await page.mouse.up();

            await page.waitForTimeout(1000);
            await page.screenshot({ path: '.playwright-mcp/after-slider-test.png' });
            console.log('スライダー操作完了');
          }
        } else {
          console.log('スライダーハンドルが見つかりませんでした');
        }
      } else {
        console.log('13. ReactCompareSliderコンテナが見つかりませんでした');
      }

      // 最終スクリーンショット
      await page.screenshot({ path: '.playwright-mcp/final-slider-analysis.png' });

    } else {
      console.log('10. 詳細ボタンが見つかりませんでした');
    }

  } catch (error) {
    console.error('エラーが発生しました:', error);
    await page.screenshot({ path: '.playwright-mcp/error-screenshot.png' });
  } finally {
    await browser.close();
  }
}

testSliderIssue().catch(console.error);