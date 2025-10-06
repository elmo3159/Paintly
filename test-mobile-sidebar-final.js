const { chromium } = require('playwright');

async function testMobileSidebar() {
    console.log('モバイルサイドバーテスト（最終版）を開始します...');

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 375, height: 667 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    });
    const page = await context.newPage();

    try {
        // 1. ログインページにアクセス
        console.log('ログインページにアクセス中...');
        await page.goto('http://localhost:3000/auth/signin');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        await page.screenshot({ path: '.playwright-mcp/final-01-signin-page.png' });
        console.log('ログインページのスクリーンショット撮影完了');

        // 2. ログイン処理
        console.log('ログイン処理開始...');

        // メールアドレス入力
        const emailInput = page.locator('input[type="email"]');
        await emailInput.waitFor({ timeout: 10000 });
        await emailInput.fill('elmodayo3159@gmail.com');

        // パスワード入力
        const passwordInput = page.locator('input[type="password"]');
        await passwordInput.fill('sanri3159');

        // ログインボタンクリック
        const submitButton = page.locator('button[type="submit"]');
        await submitButton.click();

        console.log('ログイン処理完了。リダイレクトを待機中...');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        // ダッシュボードにリダイレクトされるまで待機
        await page.waitForURL('**/dashboard', { timeout: 15000 });

        await page.screenshot({ path: '.playwright-mcp/final-02-dashboard.png' });
        console.log('ダッシュボードのスクリーンショット撮影完了');

        // 3. 新規顧客ページ作成
        console.log('新規顧客ページを作成中...');

        // サイドバーが存在するかチェック
        await page.waitForTimeout(2000);

        // 新規顧客ページ作成ボタンを探す
        const createButtons = [
            page.locator('text=新規顧客ページ作成'),
            page.locator('text=＋'),
            page.locator('button:has-text("新規顧客")')
        ];

        let buttonClicked = false;
        for (const button of createButtons) {
            if (await button.isVisible()) {
                console.log('新規顧客ページ作成ボタンをクリック...');
                await button.click();
                buttonClicked = true;
                break;
            }
        }

        if (buttonClicked) {
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(2000);
        }

        await page.screenshot({ path: '.playwright-mcp/final-03-customer-page.png' });
        console.log('顧客ページのスクリーンショット撮影完了');

        // 4. サイドバー要素の確認
        console.log('サイドバー要素の確認中...');

        // 複数のセレクターパターンでサイドバー関連要素を探す
        const sidebarPatterns = [
            '.fixed.inset-y-0.left-0.z-50',  // モバイルサイドバー
            '[class*="fixed"][class*="left-0"]', // より柔軟なセレクター
            'div:has-text("Paintly")'  // Paintlyロゴを含む要素
        ];

        const hamburgerPatterns = [
            '.fixed.left-4.top-4.z-50',
            'button:has(svg[data-lucide="menu"])',
            'button[class*="fixed"][class*="left-4"]'
        ];

        let mobileSidebar = null;
        let hamburgerButton = null;

        // サイドバーを探す
        for (const pattern of sidebarPatterns) {
            const element = page.locator(pattern);
            if (await element.count() > 0) {
                mobileSidebar = element.first();
                console.log(`モバイルサイドバーが見つかりました: ${pattern}`);
                break;
            }
        }

        // ハンバーガーメニューを探す
        for (const pattern of hamburgerPatterns) {
            const element = page.locator(pattern);
            if (await element.count() > 0) {
                hamburgerButton = element.first();
                console.log(`ハンバーガーメニューが見つかりました: ${pattern}`);
                break;
            }
        }

        if (!hamburgerButton && !mobileSidebar) {
            console.log('ページのHTML構造をデバッグのため出力します...');
            const bodyHTML = await page.locator('body').innerHTML();
            console.log('現在のページのHTML（一部）:', bodyHTML.substring(0, 1000));
        }

        // 5. サイドバーの状態チェック
        const isMobileSidebarVisible = mobileSidebar ? await mobileSidebar.isVisible() : false;
        const isHamburgerVisible = hamburgerButton ? await hamburgerButton.isVisible() : false;

        console.log(`モバイルサイドバー: ${isMobileSidebarVisible ? '表示' : '非表示'}`);
        console.log(`ハンバーガーメニュー: ${isHamburgerVisible ? '表示' : '非表示'}`);

        // 6. ハンバーガーメニューでサイドバーを開く
        if (hamburgerButton && isHamburgerVisible && !isMobileSidebarVisible) {
            console.log('ハンバーガーメニューをクリックしてサイドバーを開きます...');
            await hamburgerButton.click();
            await page.waitForTimeout(1000);

            await page.screenshot({ path: '.playwright-mcp/final-04-sidebar-opened.png' });
            console.log('サイドバーを開いた状態のスクリーンショット撮影完了');
        }

        // 7. **Scenario A: 閉じるボタンのテスト**
        console.log('\n=== Scenario A: 閉じるボタンのテスト ===');

        const closeButton = page.locator('text=サイドバーを閉じる').or(page.locator('button:has-text("閉じる")'));
        const isCloseButtonVisible = await closeButton.isVisible();
        console.log(`閉じるボタン: ${isCloseButtonVisible ? '表示' : '非表示'}`);

        if (isCloseButtonVisible) {
            console.log('閉じるボタンをクリック...');
            await closeButton.click();
            await page.waitForTimeout(1000);

            await page.screenshot({ path: '.playwright-mcp/final-05-closed-by-button.png' });
            console.log('閉じるボタンで閉じた後のスクリーンショット撮影完了');

            // ハンバーガーメニューが再表示されているかチェック
            const isHamburgerVisibleAfterClose = hamburgerButton ? await hamburgerButton.isVisible() : false;
            console.log(`閉じた後のハンバーガーメニュー: ${isHamburgerVisibleAfterClose ? '表示' : '非表示'}`);

            // 再度開く
            if (isHamburgerVisibleAfterClose) {
                console.log('ハンバーガーメニューで再度開く...');
                await hamburgerButton.click();
                await page.waitForTimeout(1000);
            }
        }

        // 8. **Scenario B: オーバーレイタップのテスト**
        console.log('\n=== Scenario B: オーバーレイタップのテスト ===');

        const overlayPatterns = [
            '.fixed.inset-0.z-40.bg-black\\/50',
            '[class*="fixed"][class*="inset-0"][class*="bg-black"]',
            'div[class*="overlay"]'
        ];

        let overlay = null;
        for (const pattern of overlayPatterns) {
            const element = page.locator(pattern);
            if (await element.count() > 0 && await element.isVisible()) {
                overlay = element.first();
                console.log(`オーバーレイが見つかりました: ${pattern}`);
                break;
            }
        }

        const isOverlayVisible = overlay ? await overlay.isVisible() : false;
        console.log(`オーバーレイ: ${isOverlayVisible ? '表示' : '非表示'}`);

        if (overlay && isOverlayVisible) {
            console.log('オーバーレイをクリック...');
            await overlay.click();
            await page.waitForTimeout(1000);

            await page.screenshot({ path: '.playwright-mcp/final-06-closed-by-overlay.png' });
            console.log('オーバーレイクリックで閉じた後のスクリーンショット撮影完了');

            // ハンバーガーメニューが再表示されているかチェック
            const isHamburgerVisibleAfterOverlay = hamburgerButton ? await hamburgerButton.isVisible() : false;
            console.log(`オーバーレイクリック後のハンバーガーメニュー: ${isHamburgerVisibleAfterOverlay ? '表示' : '非表示'}`);
        }

        // 9. 最終スクリーンショット
        await page.screenshot({ path: '.playwright-mcp/final-07-test-complete.png' });
        console.log('テスト完了時のスクリーンショット撮影完了');

        console.log('\n=== テスト完了 ===');
        console.log('結果:');
        console.log('- 閉じるボタンでの操作:', isCloseButtonVisible ? '成功' : '失敗（ボタンが見つからない）');
        console.log('- オーバーレイでの操作:', isOverlayVisible ? '成功' : '失敗（オーバーレイが見つからない）');
        console.log('- ハンバーガーメニューの表示:', isHamburgerVisible ? '成功' : '失敗（メニューが見つからない）');

    } catch (error) {
        console.error('テスト中にエラーが発生しました:', error);
        await page.screenshot({ path: '.playwright-mcp/final-error.png' });
    } finally {
        await browser.close();
    }
}

testMobileSidebar();