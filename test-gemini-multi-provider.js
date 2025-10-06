/**
 * Gemini & Fal AI マルチプロバイダー画像生成テスト
 * Chrome DevTools MCP対応版
 */

const { chromium } = require('@playwright/test');
const path = require('path');

async function testMultiProviderGeneration() {
  console.log('🎨 Paintly マルチプロバイダー画像生成テスト開始...');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1200, height: 800 }
  });

  const page = await context.newPage();

  // デバッグ用コンソールログ監視
  page.on('console', msg => {
    console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
  });

  // API リクエスト監視
  page.on('request', request => {
    if (request.url().includes('/api/generate')) {
      console.log(`[API Request] ${request.method()} ${request.url()}`);
      console.log('[API Payload]', request.postData());
    }
  });

  // API レスポンス監視
  page.on('response', response => {
    if (response.url().includes('/api/generate')) {
      console.log(`[API Response] ${response.status()} ${response.url()}`);
    }
  });

  try {
    console.log('📱 Paintlyアプリケーションにアクセス...');
    await page.goto('http://172.17.161.101:9090');

    // 初期ページのスクリーンショット
    await page.screenshot({
      path: '.playwright-mcp/multi-provider-01-initial.png',
      fullPage: true
    });

    // サインインページを確認
    if (await page.locator('text=サインイン').first().isVisible()) {
      console.log('🔐 認証が必要です。ダッシュボードに直接アクセスを試行...');
      await page.goto('http://172.17.161.101:9090/dashboard');
    }

    // 認証バイパスまたは認証完了を待つ
    await page.waitForTimeout(2000);

    // 顧客ページまたはダッシュボードを確認
    const isOnCustomerPage = await page.locator('text=画像アップロード').isVisible();
    const isOnDashboard = await page.locator('text=ダッシュボード').isVisible();

    if (!isOnCustomerPage && !isOnDashboard) {
      console.log('👤 新規顧客ページを作成...');

      // サイドバーの「＋」ボタンを探す
      const addButtons = [
        'button:has-text("＋")',
        'button:has-text("+")',
        '[aria-label*="追加"]',
        '.add-customer',
        '[data-testid*="add"]'
      ];

      let customerPageCreated = false;
      for (const selector of addButtons) {
        try {
          const addBtn = page.locator(selector).first();
          if (await addBtn.isVisible()) {
            await addBtn.click();
            await page.waitForTimeout(2000);
            customerPageCreated = true;
            console.log('✅ 新規顧客ページが作成されました');
            break;
          }
        } catch (error) {
          // 次のセレクターを試す
        }
      }

      if (!customerPageCreated) {
        console.log('ℹ️ 顧客ページ作成ボタンが見つかりません。現在のページでテスト続行...');
      }
    }

    await page.waitForTimeout(2000);
    await page.screenshot({
      path: '.playwright-mcp/multi-provider-02-customer-page.png',
      fullPage: true
    });

    console.log('🖼️ テスト画像をアップロード...');
    const testImagePath = '/mnt/c/Users/elmod/Desktop/CursorApp/Paintly/Gemini_Generated_Image_yyuqo2yyuqo2yyuq.png';

    // ファイル入力を探す
    const fileInputSelectors = [
      'input[type="file"]',
      '[data-testid*="upload"] input',
      '.image-upload input'
    ];

    let imageUploaded = false;
    for (const selector of fileInputSelectors) {
      try {
        const fileInput = page.locator(selector).first();
        if (await fileInput.count() > 0) {
          await fileInput.setInputFiles(testImagePath);
          await page.waitForTimeout(3000);
          imageUploaded = true;
          console.log('✅ 画像アップロード完了');
          break;
        }
      } catch (error) {
        // 次のセレクターを試す
      }
    }

    if (!imageUploaded) {
      // ドラッグ&ドロップエリアを探す
      const dropZoneSelectors = [
        '.dropzone',
        '.image-upload-area',
        '[data-testid*="drop"]',
        '.upload-zone'
      ];

      for (const selector of dropZoneSelectors) {
        try {
          const dropZone = page.locator(selector).first();
          if (await dropZone.isVisible()) {
            await dropZone.click();
            await page.waitForTimeout(1000);

            // クリック後に表示されるファイル入力
            const fileInput = page.locator('input[type="file"]').first();
            if (await fileInput.count() > 0) {
              await fileInput.setInputFiles(testImagePath);
              imageUploaded = true;
              console.log('✅ ドロップゾーン経由でアップロード完了');
              break;
            }
          }
        } catch (error) {
          // 次のセレクターを試す
        }
      }
    }

    if (!imageUploaded) {
      console.log('⚠️ 画像アップロード機能が見つかりません');
      await page.screenshot({
        path: '.playwright-mcp/multi-provider-03-upload-failed.png',
        fullPage: true
      });
    } else {
      await page.screenshot({
        path: '.playwright-mcp/multi-provider-03-image-uploaded.png',
        fullPage: true
      });
    }

    console.log('🤖 AIプロバイダー選択を確認...');

    // AIプロバイダー選択をテスト（Gemini vs Fal AI）
    const providerSelectors = [
      'select[name*="provider"]',
      'select[name*="ai"]',
      '[role="combobox"][aria-label*="プロバイダ"]',
      '.provider-selector select',
      'input[name="aiProvider"]'
    ];

    let providerFound = false;
    for (const selector of providerSelectors) {
      try {
        const providerSelect = page.locator(selector).first();
        if (await providerSelect.isVisible()) {
          const options = await providerSelect.locator('option').allTextContents();
          console.log('✅ AIプロバイダー選択肢:', options);

          // Geminiを選択
          if (options.some(opt => opt.toLowerCase().includes('gemini'))) {
            await providerSelect.selectOption({ label: /gemini/i });
            console.log('✅ Gemini プロバイダー選択完了');
          } else if (options.some(opt => opt.toLowerCase().includes('fal'))) {
            await providerSelect.selectOption({ label: /fal/i });
            console.log('✅ Fal AI プロバイダー選択完了');
          }

          providerFound = true;
          break;
        }
      } catch (error) {
        // 次のセレクターを試す
      }
    }

    if (!providerFound) {
      console.log('ℹ️ AIプロバイダー選択UIが見つかりません。デフォルト設定でテスト続行...');
    }

    console.log('🎨 色選択設定...');

    // 壁の色選択
    const colorSelectors = [
      'select[name*="wall"]',
      'select[id*="wall"]',
      '.color-selector select',
      '[aria-label*="壁"]'
    ];

    for (const selector of colorSelectors) {
      try {
        const colorSelect = page.locator(selector).first();
        if (await colorSelect.isVisible()) {
          const options = await colorSelect.locator('option').count();
          if (options > 1) {
            await colorSelect.selectOption({ index: 1 });
            console.log('✅ 壁の色選択完了');
            break;
          }
        }
      } catch (error) {
        // 次のセレクターを試す
      }
    }

    await page.waitForTimeout(2000);
    await page.screenshot({
      path: '.playwright-mcp/multi-provider-04-settings-complete.png',
      fullPage: true
    });

    console.log('🚀 画像生成実行...');

    const generateButtonSelectors = [
      'button:has-text("生成")',
      'button:has-text("実行")',
      'button[type="submit"]',
      '.generate-button',
      '[data-testid*="generate"]'
    ];

    let generationStarted = false;
    for (const selector of generateButtonSelectors) {
      try {
        const generateBtn = page.locator(selector).first();
        if (await generateBtn.isVisible()) {
          console.log('✅ 生成ボタンが見つかりました');

          // API応答を監視
          const apiResponsePromise = page.waitForResponse(
            response => response.url().includes('/api/generate'),
            { timeout: 60000 }
          ).catch(() => null);

          await generateBtn.click();
          console.log('✅ 生成ボタンクリック完了');
          generationStarted = true;

          // 生成中のスクリーンショット
          await page.waitForTimeout(3000);
          await page.screenshot({
            path: '.playwright-mcp/multi-provider-05-generating.png',
            fullPage: true
          });

          // API応答を待つ
          const apiResponse = await apiResponsePromise;
          if (apiResponse) {
            console.log('✅ API応答受信:', apiResponse.status());
            const responseBody = await apiResponse.json();
            console.log('📊 API応答内容:', JSON.stringify(responseBody, null, 2));
          }

          // 結果を待つ
          await page.waitForTimeout(15000);
          break;
        }
      } catch (error) {
        // 次のセレクターを試す
      }
    }

    if (!generationStarted) {
      console.log('❌ 生成ボタンが見つかりません');
    }

    // 最終結果のスクリーンショット
    await page.screenshot({
      path: '.playwright-mcp/multi-provider-06-final-result.png',
      fullPage: true
    });

    console.log('🔍 結果を検証...');

    // 生成結果を確認
    const resultSelectors = [
      'img[alt*="生成"]',
      '.generated-image',
      '.result-image',
      '.comparison-slider',
      '.react-compare-slider'
    ];

    let hasResult = false;
    for (const selector of resultSelectors) {
      try {
        const resultElement = page.locator(selector).first();
        if (await resultElement.isVisible()) {
          console.log('✅ 生成結果が表示されています');
          hasResult = true;

          // ビフォーアフター比較スライダーのテスト
          if (selector.includes('slider') || selector.includes('comparison')) {
            console.log('✅ スライダー比較機能をテスト中...');

            const sliderHandle = page.locator('.react-compare-slider__handle, .slider-handle').first();
            if (await sliderHandle.isVisible()) {
              const sliderBounds = await resultElement.boundingBox();
              if (sliderBounds) {
                // スライダーを左右に動かしてテスト
                await page.mouse.move(sliderBounds.x + sliderBounds.width / 2, sliderBounds.y + sliderBounds.height / 2);
                await page.mouse.down();
                await page.mouse.move(sliderBounds.x + sliderBounds.width * 0.2, sliderBounds.y + sliderBounds.height / 2);
                await page.mouse.up();

                await page.waitForTimeout(1000);
                await page.screenshot({
                  path: '.playwright-mcp/multi-provider-07-slider-left.png',
                  fullPage: true
                });

                // 右に移動
                await page.mouse.move(sliderBounds.x + sliderBounds.width / 2, sliderBounds.y + sliderBounds.height / 2);
                await page.mouse.down();
                await page.mouse.move(sliderBounds.x + sliderBounds.width * 0.8, sliderBounds.y + sliderBounds.height / 2);
                await page.mouse.up();

                await page.waitForTimeout(1000);
                await page.screenshot({
                  path: '.playwright-mcp/multi-provider-08-slider-right.png',
                  fullPage: true
                });

                console.log('✅ スライダー操作テスト完了');
              }
            }
          }
          break;
        }
      } catch (error) {
        // 次のセレクターを試す
      }
    }

    // エラーメッセージの確認
    const errorSelectors = [
      '.error',
      '[role="alert"]',
      '.alert-destructive',
      '.error-message'
    ];

    let hasError = false;
    for (const selector of errorSelectors) {
      try {
        const errorElement = page.locator(selector).first();
        if (await errorElement.isVisible()) {
          const errorText = await errorElement.textContent();
          console.log('⚠️ エラーメッセージ:', errorText);
          hasError = true;

          if (errorText?.includes('DISABLE') || errorText?.includes('API')) {
            console.log('ℹ️ 外部API無効化設定によるテスト実行中と推測されます');
          }
        }
      } catch (error) {
        // 次のセレクターを試す
      }
    }

    if (!hasResult && !hasError) {
      console.log('ℹ️ 生成結果もエラーも見つかりませんでした');
    }

    console.log('🎉 マルチプロバイダー画像生成テスト完了！');

  } catch (error) {
    console.error('❌ テスト実行エラー:', error);
    await page.screenshot({
      path: '.playwright-mcp/multi-provider-error.png',
      fullPage: true
    });
  } finally {
    await browser.close();
  }
}

// 実行
testMultiProviderGeneration().catch(console.error);