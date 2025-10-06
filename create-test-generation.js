const { chromium } = require('playwright');

async function createTestGeneration() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1500,
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
    if (request.url().includes('supabase') || request.url().includes('generate') || request.url().includes('gemini')) {
      console.log(`[REQUEST]: ${request.method()} ${request.url()}`);
    }
  });

  page.on('response', response => {
    if (response.url().includes('supabase') || response.url().includes('generate') || response.url().includes('gemini')) {
      console.log(`[RESPONSE]: ${response.status()} ${response.url()}`);
    }
  });

  try {
    console.log('1. ログインページに移動中...');
    await page.goto('http://172.17.161.101:9090/auth/signin');
    await page.waitForTimeout(2000);

    console.log('2. ログイン情報を入力中...');
    await page.fill('input[type="email"]', 'elmodayo3159@gmail.com');
    await page.fill('input[type="password"]', 'sanri3159');

    console.log('3. ログインボタンをクリック...');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ timeout: 10000 });

    console.log('4. 顧客ページに移動...');
    const customerLink = page.locator('text=新規顧客 2025/9/15').first();
    if (await customerLink.count() > 0) {
      await customerLink.click();
      await page.waitForTimeout(3000);
    } else {
      // 先ほどのログから正しい顧客UUIDを使用
      await page.goto('http://172.17.161.101:9090/customer/009e75c8-b18d-4583-8b77-ec2623c575ee');
      await page.waitForTimeout(3000);
    }

    console.log('5. シミュレーションタブをクリック...');
    const simulationTab = page.locator('text=シミュレーション').first();
    await simulationTab.click();
    await page.waitForTimeout(2000);

    await page.screenshot({ path: '.playwright-mcp/simulation-tab.png' });

    console.log('6. テスト画像をアップロード...');
    // テスト用の画像ファイルがあるかチェック
    const testImageExists = await page.evaluate(() => {
      return fetch('/api/test-image').then(res => res.ok).catch(() => false);
    });

    // 画像アップロード要素を探す
    const fileInput = page.locator('input[type="file"]').first();

    if (await fileInput.count() > 0) {
      // サンプル画像があるかもしれない場所を確認
      console.log('画像ファイル入力欄が見つかりました');

      // Webから建物のサンプル画像をダウンロードして使用
      const sampleImageUrl = 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop';

      // 画像をダウンロードして一時ファイルとして保存
      await page.evaluate(async (imageUrl) => {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const dataTransfer = new DataTransfer();
        const file = new File([blob], 'test-house.jpg', { type: 'image/jpeg' });
        dataTransfer.items.add(file);

        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) {
          fileInput.files = dataTransfer.files;
          fileInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, sampleImageUrl);

      await page.waitForTimeout(3000);
      await page.screenshot({ path: '.playwright-mcp/image-uploaded.png' });

      console.log('7. 色を選択...');
      // 壁の色を変更
      const wallColorSelect = page.locator('select').filter({ hasText: /壁の色/ }).or(page.locator('text=壁の色').locator('..').locator('select')).first();
      if (await wallColorSelect.count() > 0) {
        await wallColorSelect.selectOption({ index: 1 }); // 最初のオプション以外を選択
        await page.waitForTimeout(1000);
      }

      console.log('8. 生成ボタンをクリック...');
      const generateButton = page.locator('button:has-text("生成")').or(page.locator('text=シミュレーション生成')).or(page.locator('text=開始')).first();

      if (await generateButton.count() > 0) {
        await generateButton.click();
        console.log('生成ボタンがクリックされました');

        // 生成完了まで待機（最大30秒）
        console.log('9. 生成完了を待機中...');
        await page.waitForTimeout(5000); // 初期の待機

        // 生成結果のモーダルまたは結果表示を待つ
        let attempts = 0;
        const maxAttempts = 25; // 25回 × 1秒 = 25秒

        while (attempts < maxAttempts) {
          const resultModal = page.locator('[class*="modal"]').or(page.locator('text=生成完了')).or(page.locator('img[alt*="生成"]'));
          if (await resultModal.count() > 0) {
            console.log('10. 生成結果が表示されました！');
            await page.screenshot({ path: '.playwright-mcp/generation-result.png' });
            break;
          }

          await page.waitForTimeout(1000);
          attempts++;
          console.log(`生成待機中... ${attempts}/${maxAttempts}`);
        }

        if (attempts >= maxAttempts) {
          console.log('生成がタイムアウトしました');
        }

        // 少し待ってから履歴タブをチェック
        await page.waitForTimeout(3000);

        console.log('11. 履歴タブで結果を確認...');
        const historyTab = page.locator('text=履歴').or(page.locator('text=生成履歴')).first();
        await historyTab.click();
        await page.waitForTimeout(2000);

        await page.screenshot({ path: '.playwright-mcp/history-with-data.png' });

        // 詳細ボタンを探す
        const detailButton = page.locator('text=詳細').first();
        if (await detailButton.count() > 0) {
          console.log('12. 詳細ボタンをクリック...');
          await detailButton.click();
          await page.waitForTimeout(3000);

          await page.screenshot({ path: '.playwright-mcp/detail-modal-with-data.png' });

          // ReactCompareSliderの詳細分析
          console.log('13. ReactCompareSliderの分析開始...');

          const sliderContainer = page.locator('[class*="react-compare-slider"]');
          const images = page.locator('img');

          console.log(`スライダーコンテナ数: ${await sliderContainer.count()}`);
          console.log(`全画像数: ${await images.count()}`);

          // 各画像の状態をチェック
          const allImages = await images.all();
          for (let i = 0; i < allImages.length; i++) {
            const img = allImages[i];
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

          // スライダーを操作してテスト
          if (await sliderContainer.count() > 0) {
            console.log('14. スライダー操作テスト...');
            const handle = page.locator('[class*="handle"]').or(page.locator('[role="slider"]')).first();

            if (await handle.count() > 0) {
              const handleBox = await handle.boundingBox();
              if (handleBox) {
                // スライダーを左に移動
                await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2);
                await page.mouse.down();
                await page.mouse.move(handleBox.x - 100, handleBox.y + handleBox.height / 2);
                await page.mouse.up();
                await page.waitForTimeout(1000);
                await page.screenshot({ path: '.playwright-mcp/slider-left.png' });

                // スライダーを右に移動
                await page.mouse.move(handleBox.x - 100 + handleBox.width / 2, handleBox.y + handleBox.height / 2);
                await page.mouse.down();
                await page.mouse.move(handleBox.x + 100, handleBox.y + handleBox.height / 2);
                await page.mouse.up();
                await page.waitForTimeout(1000);
                await page.screenshot({ path: '.playwright-mcp/slider-right.png' });

                console.log('15. スライダー操作完了！');
              }
            }
          }
        } else {
          console.log('詳細ボタンが見つかりませんでした');
        }

      } else {
        console.log('生成ボタンが見つかりませんでした');
      }
    } else {
      console.log('ファイル入力欄が見つかりませんでした');
    }

  } catch (error) {
    console.error('エラーが発生しました:', error);
    await page.screenshot({ path: '.playwright-mcp/generation-error.png' });
  } finally {
    await page.waitForTimeout(5000); // 最終確認のための待機
    await browser.close();
  }
}

createTestGeneration().catch(console.error);