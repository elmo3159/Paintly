/**
 * 実用的なマルチプロバイダーテスト
 * サインインからプロバイダー選択まで実際のユーザーフローをテスト
 */

const { chromium } = require('@playwright/test');

async function testMultiProviderFunctionality() {
  console.log('🎨 Paintly マルチプロバイダー機能テスト開始...');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1500,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1200, height: 800 }
  });

  const page = await context.newPage();

  // エラー監視の設定
  let errorOccurred = false;
  page.on('pageerror', (error) => {
    console.log(`❌ [Page Error] ${error.message}`);
    errorOccurred = true;
  });

  try {
    console.log('🔗 サインインページに直接アクセス...');

    // サインインページに直接アクセス（networkidleなし）
    await page.goto('http://172.17.161.101:9090/auth/signin', {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });

    // 初期状態を記録
    await page.screenshot({
      path: '.playwright-mcp/multi-provider-01-signin-page.png',
      fullPage: true
    });

    console.log('🔍 ページ要素の確認...');

    // Paintlyロゴの確認
    const logoElement = page.locator('img[alt*="Paintly"], img[src*="logo"], .logo');
    await logoElement.first().waitFor({ timeout: 5000 }).catch(() => {});

    // Google認証ボタンの確認と実行
    const googleAuthSelectors = [
      'button:has-text("Google")',
      'button:has-text("Googleで")',
      '[data-provider="google"]',
      '.google-auth',
      'button[type="button"]:has-text("Google")'
    ];

    let authButtonFound = false;
    for (const selector of googleAuthSelectors) {
      try {
        const googleButton = page.locator(selector).first();
        if (await googleButton.isVisible({ timeout: 3000 })) {
          console.log('✅ Google認証ボタンを発見:', selector);

          // クリック前のスクリーンショット
          await page.screenshot({
            path: '.playwright-mcp/multi-provider-02-before-google-click.png',
            fullPage: true
          });

          await googleButton.click();
          console.log('✅ Google認証ボタンをクリック');
          authButtonFound = true;

          // 認証処理を少し待つ
          await page.waitForTimeout(3000);
          break;
        }
      } catch (error) {
        // 次のセレクターを試す
      }
    }

    if (!authButtonFound) {
      console.log('⚠️ Google認証ボタンが見つかりません。手動認証をスキップ...');

      // 直接ダッシュボードにアクセスを試行
      await page.goto('http://172.17.161.101:9090', {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });
    }

    // 認証後の状態を確認
    await page.waitForTimeout(3000);
    await page.screenshot({
      path: '.playwright-mcp/multi-provider-03-after-auth-attempt.png',
      fullPage: true
    });

    console.log('🏠 メインページ/ダッシュボードの機能確認...');

    // 顧客管理や画像生成の要素を探す
    const dashboardElements = [
      'text=画像アップロード',
      'text=カラー選択',
      'text=AIプロバイダー',
      'text=プロバイダー',
      'text=Gemini',
      'text=Fal',
      'select[name*="provider"]',
      'select[name*="ai"]',
      '.provider-selector',
      'input[type="file"]',
      '.dropzone',
      'button:has-text("生成")',
      'button:has-text("＋")',
      '[data-testid*="provider"]'
    ];

    let foundElements = [];
    for (const selector of dashboardElements) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          foundElements.push(selector);
          console.log(`✅ UI要素発見: ${selector}`);
        }
      } catch (error) {
        // 要素が見つからない場合は継続
      }
    }

    // プロバイダー選択の詳細確認
    const providerSelectors = [
      'select[name*="provider"]',
      'select[name*="ai"]',
      '.provider-selector select',
      '[data-testid*="provider"] select'
    ];

    let providerOptions = [];
    for (const selector of providerSelectors) {
      try {
        const providerSelect = page.locator(selector).first();
        if (await providerSelect.isVisible({ timeout: 2000 })) {
          const options = await providerSelect.locator('option').allTextContents();
          providerOptions = options.filter(opt => opt.trim());

          console.log('🤖 プロバイダー選択肢:', providerOptions);

          // Gemini & Fal AI の存在確認
          const hasGemini = providerOptions.some(opt =>
            opt.toLowerCase().includes('gemini')
          );
          const hasFalAI = providerOptions.some(opt =>
            opt.toLowerCase().includes('fal')
          );

          console.log('🔍 マルチプロバイダー確認:');
          console.log(`   ├─ Gemini支援: ${hasGemini ? '✅ あり' : '❌ なし'}`);
          console.log(`   └─ Fal AI支援: ${hasFalAI ? '✅ あり' : '❌ なし'}`);

          if (hasGemini && hasFalAI) {
            console.log('🎉 マルチプロバイダー機能が正常に実装されています！');

            // プロバイダーを実際に切り替えテスト
            if (hasGemini) {
              await providerSelect.selectOption({ label: /gemini/i });
              console.log('✅ Geminiプロバイダーに切り替え');
              await page.waitForTimeout(1000);

              await page.screenshot({
                path: '.playwright-mcp/multi-provider-04-gemini-selected.png',
                fullPage: true
              });
            }

            if (hasFalAI) {
              await providerSelect.selectOption({ label: /fal/i });
              console.log('✅ Fal AIプロバイダーに切り替え');
              await page.waitForTimeout(1000);

              await page.screenshot({
                path: '.playwright-mcp/multi-provider-05-fal-selected.png',
                fullPage: true
              });
            }
          }
          break;
        }
      } catch (error) {
        // 次のセレクターを試す
      }
    }

    // 最終状態の記録
    await page.screenshot({
      path: '.playwright-mcp/multi-provider-06-final-state.png',
      fullPage: true
    });

    // テスト結果のまとめ
    console.log('\n📋 マルチプロバイダー機能テスト結果:');
    console.log(`   ├─ 現在のURL: ${page.url()}`);
    console.log(`   ├─ Google認証: ${authButtonFound ? '✅ ボタン発見' : '⚠️ 未発見'}`);
    console.log(`   ├─ UI要素数: ${foundElements.length}個`);
    console.log(`   ├─ プロバイダー選択: ${providerOptions.length > 0 ? '✅ 実装済み' : '❌ 未発見'}`);
    console.log(`   ├─ 利用可能プロバイダー: [${providerOptions.join(', ')}]`);
    console.log(`   ├─ ページエラー: ${errorOccurred ? '⚠️ あり' : '✅ なし'}`);

    const hasMultiProvider = providerOptions.some(opt => opt.toLowerCase().includes('gemini')) &&
                            providerOptions.some(opt => opt.toLowerCase().includes('fal'));
    console.log(`   └─ マルチプロバイダー: ${hasMultiProvider ? '🎉 正常動作' : '⚠️ 要確認'}`);

    console.log('\n🎉 マルチプロバイダー機能テスト完了！');

  } catch (error) {
    console.error('❌ テスト実行エラー:', error.message);

    await page.screenshot({
      path: '.playwright-mcp/multi-provider-error.png',
      fullPage: true
    });

    console.log('🔍 エラー分析:');
    console.log(`   ├─ エラータイプ: ${error.name}`);
    console.log(`   ├─ 現在のURL: ${page.url()}`);
    console.log(`   └─ タイムアウト: ${error.message.includes('timeout') ? 'Yes' : 'No'}`);
  } finally {
    await browser.close();
  }
}

// 実行
testMultiProviderFunctionality().catch(console.error);