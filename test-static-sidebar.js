const { chromium } = require('playwright');
const path = require('path');

async function testStaticSidebar() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();

    console.log('=== 静的サイドバーテストページのテスト ===');

    // 静的HTMLファイルにアクセス
    const htmlPath = path.resolve(__dirname, 'test-sidebar-manual.html');
    await page.goto(`file://${htmlPath}`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: '.playwright-mcp/static-01-initial.png' });

    console.log('1. 初期状態の確認');
    const sidebarVisible = await page.locator('#sidebar').isVisible();
    console.log(`サイドバーの表示状態: ${sidebarVisible}`);

    // サイドバー内の各要素の確認
    console.log('2. サイドバー内要素の確認');

    const paintlyLogo = await page.locator('text="Paintly"').isVisible();
    console.log(`Paintlyロゴ: ${paintlyLogo}`);

    const closeButton = await page.locator('#closeSidebar').isVisible();
    console.log(`サイドバーを閉じるボタン: ${closeButton}`);

    const newCustomerButton = await page.locator('text="新規顧客ページ作成"').isVisible();
    console.log(`新規顧客ページ作成ボタン: ${newCustomerButton}`);

    const navigationSection = await page.locator('text="ナビゲーション"').isVisible();
    console.log(`ナビゲーションセクション: ${navigationSection}`);

    const dashboardLink = await page.locator('text="ダッシュボード"').isVisible();
    console.log(`ダッシュボードリンク: ${dashboardLink}`);

    const billingLink = await page.locator('text="料金プラン"').isVisible();
    console.log(`料金プランリンク: ${billingLink}`);

    const settingsLink = await page.locator('text="設定"').isVisible();
    console.log(`設定リンク: ${settingsLink}`);

    const customerSection = await page.locator('text="顧客ページ"').isVisible();
    console.log(`顧客ページセクション: ${customerSection}`);

    const planInfo = await page.locator('text="無料プラン"').isVisible();
    console.log(`プラン情報: ${planInfo}`);

    const signoutButton = await page.locator('text="サインアウト"').isVisible();
    console.log(`サインアウトボタン: ${signoutButton}`);

    console.log('3. サイドバーを閉じる動作のテスト');
    await page.click('#closeSidebar');
    await page.waitForTimeout(500);
    await page.screenshot({ path: '.playwright-mcp/static-02-sidebar-closed.png' });

    const sidebarHidden = await page.locator('#sidebar').isHidden();
    const openButtonVisible = await page.locator('#openSidebar').isVisible();
    console.log(`サイドバーが非表示: ${sidebarHidden}`);
    console.log(`開くボタンが表示: ${openButtonVisible}`);

    console.log('4. サイドバーを開く動作のテスト');
    await page.click('#openSidebar');
    await page.waitForTimeout(500);
    await page.screenshot({ path: '.playwright-mcp/static-03-sidebar-reopened.png' });

    const sidebarReopened = await page.locator('#sidebar').isVisible();
    const openButtonHidden = await page.locator('#openSidebar').isHidden();
    console.log(`サイドバーが再表示: ${sidebarReopened}`);
    console.log(`開くボタンが非表示: ${openButtonHidden}`);

    console.log('5. テストボタンによる動作確認');
    await page.click('#testClose');
    await page.waitForTimeout(500);
    await page.screenshot({ path: '.playwright-mcp/static-04-test-close.png' });

    await page.click('#testOpen');
    await page.waitForTimeout(500);
    await page.screenshot({ path: '.playwright-mcp/static-05-test-open.png' });

    console.log('6. レスポンシブテスト');
    // モバイルサイズに変更
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: '.playwright-mcp/static-06-mobile-view.png' });

    const sidebarInMobile = await page.locator('#sidebar').isVisible();
    console.log(`モバイルビューでのサイドバー表示: ${sidebarInMobile}`);

    // デスクトップサイズに戻す
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: '.playwright-mcp/static-07-desktop-restored.png' });

    console.log('7. 全体的な動作確認完了');

  } catch (error) {
    console.error('静的テスト中にエラーが発生:', error);
    try {
      await page.screenshot({ path: '.playwright-mcp/static-error.png' });
    } catch (e) {
      console.error('スクリーンショットエラー:', e.message);
    }
  } finally {
    await browser.close();
  }
}

testStaticSidebar().catch(console.error);