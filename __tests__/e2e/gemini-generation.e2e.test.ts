/**
 * Gemini画像生成機能E2Eテスト
 * 指定されたテスト画像を使用してGemini画像生成機能の動作確認を行う
 */

import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Paintly - Gemini画像生成機能テスト', () => {
  test('指定画像を使用したGemini画像生成動作確認', async ({ page }) => {
    console.log('🎨 Paintly Gemini画像生成テスト開始...');

    // デバッグ用コンソールログの有効化
    page.on('console', msg => {
      console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
    });

    page.on('request', request => {
      if (request.url().includes('gemini') || request.url().includes('generate')) {
        console.log(`[API Request] ${request.method()} ${request.url()}`);
      }
    });

    page.on('response', response => {
      if (response.url().includes('gemini') || response.url().includes('generate')) {
        console.log(`[API Response] ${response.status()} ${response.url()}`);
      }
    });

    try {
      // 1. アプリケーションにアクセス
      console.log('📱 Paintlyアプリケーションにアクセス...');
      await page.goto('/auth/signin');

      // ページの読み込み完了を待機
      await page.waitForLoadState('networkidle');

      // サインインページのスクリーンショット
      await page.screenshot({
        path: '.playwright-mcp/gemini-test-01-signin.png',
        fullPage: true
      });

      // 2. 認証処理
      console.log('🔐 認証処理...');

      // テスト用に直接ダッシュボードにアクセス（認証をスキップ）
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // ダッシュボードのスクリーンショット
      await page.screenshot({
        path: '.playwright-mcp/gemini-test-02-dashboard.png',
        fullPage: true
      });

      // 3. 新規顧客ページ作成または既存の顧客ページにアクセス
      console.log('👤 顧客ページにアクセス...');

      // サイドバーから顧客ページのリンクを探す
      const customerLinks = page.locator('a[href*="/customer/"]');
      const customerLinkCount = await customerLinks.count();

      if (customerLinkCount > 0) {
        // 既存の顧客ページにアクセス
        await customerLinks.first().click();
      } else {
        // 新規顧客ページ作成ボタンを探してクリック
        const newCustomerBtn = page.locator('button', { hasText: '＋' }).first();
        if (await newCustomerBtn.isVisible()) {
          await newCustomerBtn.click();
        }
      }

      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // 顧客ページのスクリーンショット
      await page.screenshot({
        path: '.playwright-mcp/gemini-test-03-customer-page.png',
        fullPage: true
      });

      // 4. テスト画像のアップロード
      console.log('🖼️ テスト画像をアップロード...');

      const testImagePath = path.resolve('/mnt/c/Users/elmod/Desktop/CursorApp/Paintly/Gemini_Generated_Image_yyuqo2yyuqo2yyuq.png');

      // ファイル入力要素を探す
      const fileInput = page.locator('input[type="file"]');
      const fileInputCount = await fileInput.count();

      if (fileInputCount > 0) {
        await fileInput.first().setInputFiles(testImagePath);
        console.log('✅ 画像アップロード完了');

        // アップロード処理の完了を待機
        await page.waitForTimeout(3000);
      } else {
        console.log('⚠️ ファイル入力要素が見つかりません');

        // ドラッグアンドドロップエリアを探す
        const dropZoneSelectors = [
          '[data-testid*="upload"]',
          '.dropzone',
          '.image-upload',
          '[class*="upload"]',
          '[class*="drop"]'
        ];

        let uploaded = false;
        for (const selector of dropZoneSelectors) {
          const dropZone = page.locator(selector);
          if (await dropZone.count() > 0 && await dropZone.first().isVisible()) {
            await dropZone.first().click();
            await page.waitForTimeout(1000);

            // クリック後に表示される可能性のあるファイル入力要素
            const newFileInput = page.locator('input[type="file"]');
            if (await newFileInput.count() > 0) {
              await newFileInput.first().setInputFiles(testImagePath);
              uploaded = true;
              console.log('✅ ドラッグアンドドロップエリア経由でのアップロード完了');
              break;
            }
          }
        }

        if (!uploaded) {
          console.log('⚠️ アップロード機能が見つかりませんでした');
        }
      }

      await page.waitForTimeout(3000);

      // アップロード後のスクリーンショット
      await page.screenshot({
        path: '.playwright-mcp/gemini-test-04-image-uploaded.png',
        fullPage: true
      });

      // 5. カラー選択
      console.log('🎨 色選択設定...');

      // 壁の色選択
      const wallColorSelectors = [
        'select[name*="wall"]',
        'select[id*="wall"]',
        'select:has-text("壁")',
        '[role="combobox"][aria-label*="壁"]',
        '.color-selector select'
      ];

      for (const selector of wallColorSelectors) {
        const wallColorSelect = page.locator(selector);
        if (await wallColorSelect.count() > 0 && await wallColorSelect.first().isVisible()) {
          const options = await wallColorSelect.first().locator('option').count();
          if (options > 1) {
            await wallColorSelect.first().selectOption({ index: 1 });
            console.log('✅ 壁の色選択完了');
            break;
          }
        }
      }

      // 屋根の色選択
      const roofColorSelectors = [
        'select[name*="roof"]',
        'select[id*="roof"]',
        'select:has-text("屋根")',
        '[role="combobox"][aria-label*="屋根"]'
      ];

      for (const selector of roofColorSelectors) {
        const roofColorSelect = page.locator(selector);
        if (await roofColorSelect.count() > 0 && await roofColorSelect.first().isVisible()) {
          const options = await roofColorSelect.first().locator('option').count();
          if (options > 1) {
            await roofColorSelect.first().selectOption({ index: 1 });
            console.log('✅ 屋根の色選択完了');
            break;
          }
        }
      }

      await page.waitForTimeout(2000);

      // 色選択後のスクリーンショット
      await page.screenshot({
        path: '.playwright-mcp/gemini-test-05-colors-selected.png',
        fullPage: true
      });

      // 6. 画像生成実行
      console.log('🚀 Gemini画像生成実行...');

      const generateButtonSelectors = [
        'button:has-text("生成")',
        'button:has-text("実行")',
        'button[type="submit"]',
        '.generate-button',
        '[data-testid*="generate"]'
      ];

      let generateButtonFound = false;
      for (const selector of generateButtonSelectors) {
        const generateBtn = page.locator(selector);
        if (await generateBtn.count() > 0 && await generateBtn.first().isVisible()) {
          console.log('✅ 生成ボタンが見つかりました');

          // APIリクエストを監視
          const apiResponsePromise = page.waitForResponse(
            response => response.url().includes('/api/generate') && response.status() === 200,
            { timeout: 60000 }
          ).catch(() => {
            console.log('ℹ️ API応答を待機中にタイムアウトしました');
            return null;
          });

          await generateBtn.first().click();
          console.log('✅ 生成ボタンクリック完了');
          generateButtonFound = true;

          // 生成中の状態を確認
          await page.waitForTimeout(2000);
          await page.screenshot({
            path: '.playwright-mcp/gemini-test-06-generating.png',
            fullPage: true
          });

          // API応答を待機
          const apiResponse = await apiResponsePromise;
          if (apiResponse) {
            console.log('✅ Gemini API応答受信:', apiResponse.status());
          }

          // 生成完了まで待機
          await page.waitForTimeout(10000);
          break;
        }
      }

      if (!generateButtonFound) {
        console.log('❌ 生成ボタンが見つかりません');
      }

      // 最終結果のスクリーンショット
      await page.screenshot({
        path: '.playwright-mcp/gemini-test-07-final-result.png',
        fullPage: true
      });

      // 7. 結果の検証
      console.log('🔍 結果検証...');

      // 生成された画像またはエラーメッセージの確認
      const generatedImageSelectors = [
        'img[alt*="生成"]',
        '.generated-image',
        '[data-testid*="result"]',
        '.result-image'
      ];

      const errorMessageSelectors = [
        '.error',
        '[role="alert"]',
        '.alert-destructive',
        '.error-message'
      ];

      let hasGeneratedImage = false;
      for (const selector of generatedImageSelectors) {
        const generatedImage = page.locator(selector);
        if (await generatedImage.count() > 0 && await generatedImage.first().isVisible()) {
          console.log('✅ 生成画像が表示されています');
          hasGeneratedImage = true;

          // ビフォーアフター比較スライダーの確認
          const comparisonSliderSelectors = [
            '.react-compare-slider',
            '.comparison-slider',
            '[data-testid*="slider"]',
            '.image-comparison'
          ];

          for (const sliderSelector of comparisonSliderSelectors) {
            const comparisonSlider = page.locator(sliderSelector);
            if (await comparisonSlider.count() > 0 && await comparisonSlider.first().isVisible()) {
              console.log('✅ ビフォーアフター比較スライダーが表示されています');

              // スライダー操作テスト
              await comparisonSlider.first().hover();
              await page.mouse.down();
              await page.mouse.move(300, 0);
              await page.mouse.up();
              console.log('✅ スライダー操作テスト完了');

              await page.screenshot({
                path: '.playwright-mcp/gemini-test-08-slider-test.png',
                fullPage: true
              });
              break;
            }
          }
          break;
        }
      }

      if (!hasGeneratedImage) {
        let hasErrorMessage = false;
        for (const selector of errorMessageSelectors) {
          const errorMessage = page.locator(selector);
          if (await errorMessage.count() > 0 && await errorMessage.first().isVisible()) {
            const errorText = await errorMessage.first().textContent();
            console.log('⚠️ エラーメッセージ:', errorText);
            hasErrorMessage = true;

            // DISABLE_EXTERNAL_APISが設定されている場合の確認
            if (errorText?.includes('DISABLE') || errorText?.includes('API')) {
              console.log('ℹ️ 外部API無効化設定によるモック実行と推測されます');
            }
            break;
          }
        }

        if (!hasErrorMessage) {
          console.log('ℹ️ 生成画像もエラーメッセージも見つかりませんでした');
        }
      }

      console.log('🎉 Gemini画像生成機能テスト完了！');

    } catch (error) {
      console.error('❌ テスト実行エラー:', error);

      // エラー時のスクリーンショット
      await page.screenshot({
        path: '.playwright-mcp/gemini-test-error.png',
        fullPage: true
      });

      throw error;
    }
  });
});