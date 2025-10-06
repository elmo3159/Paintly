const { chromium } = require('playwright');

async function testMobileSidebar() {
    console.log('モバイルサイドバーテストを開始します...');

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 375, height: 667 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    });
    const page = await context.newPage();

    try {
        // 1. ログイン済みの状態でダッシュボードに直接アクセス
        console.log('ダッシュボードにアクセス中...');
        await page.goto('http://localhost:3000/dashboard');
        await page.waitForLoadState('networkidle');

        // もしログイン画面にリダイレクトされた場合はログイン
        if (page.url().includes('/auth/signin')) {
            console.log('ログインが必要です。ログイン処理を開始...');

            await page.fill('input[type="email"]', 'elmodayo3159@gmail.com');
            await page.fill('input[type="password"]', 'sanri3159');
            await page.click('button[type="submit"]');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(3000);
        }

        await page.screenshot({ path: '.playwright-mcp/simple-01-dashboard.png' });
        console.log('ダッシュボードのスクリーンショット撮影完了');

        // 2. 新規顧客ページを作成して移動
        console.log('新規顧客ページを作成中...');

        // 「新規顧客ページ作成」ボタンを探す
        const newCustomerButton = page.locator('text=新規顧客ページ作成');
        if (await newCustomerButton.isVisible()) {
            await newCustomerButton.click();
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(2000);
        } else {
            // プラスボタンを探す
            const plusButton = page.locator('text=＋');
            if (await plusButton.isVisible()) {
                await plusButton.click();
                await page.waitForLoadState('networkidle');
                await page.waitForTimeout(2000);
            }
        }

        await page.screenshot({ path: '.playwright-mcp/simple-02-customer-page.png' });
        console.log('顧客ページのスクリーンショット撮影完了');

        // 3. サイドバーの状態をチェック
        console.log('サイドバーの状態をチェック中...');

        // モバイル用ハンバーガーメニューボタンを探す
        const hamburgerButton = page.locator('.fixed.left-4.top-4.z-50.md\\:hidden');
        const isHamburgerVisible = await hamburgerButton.isVisible();
        console.log(`ハンバーガーメニューボタン: ${isHamburgerVisible ? '表示' : '非表示'}`);

        // モバイルサイドバーが開いているかチェック
        const mobileSidebar = page.locator('.fixed.inset-y-0.left-0.z-50');
        const isMobileSidebarOpen = await mobileSidebar.isVisible();
        console.log(`モバイルサイドバー: ${isMobileSidebarOpen ? '開いている' : '閉じている'}`);

        // 4. ハンバーガーメニューをクリックしてサイドバーを開く
        if (!isMobileSidebarOpen && isHamburgerVisible) {
            console.log('ハンバーガーメニューをクリックしてサイドバーを開きます...');
            await hamburgerButton.click();
            await page.waitForTimeout(500);

            await page.screenshot({ path: '.playwright-mcp/simple-03-sidebar-opened.png' });
            console.log('サイドバーを開いた状態のスクリーンショット撮影完了');
        }

        // 5. **Scenario A: 閉じるボタンのテスト**
        console.log('\n=== Scenario A: 閉じるボタンのテスト ===');

        // 閉じるボタンを探す
        const closeButton = page.locator('text=サイドバーを閉じる');
        const isCloseButtonVisible = await closeButton.isVisible();
        console.log(`閉じるボタン: ${isCloseButtonVisible ? '表示' : '非表示'}`);

        if (isCloseButtonVisible) {
            console.log('閉じるボタンをクリック...');
            await closeButton.click();
            await page.waitForTimeout(500);

            await page.screenshot({ path: '.playwright-mcp/simple-04-closed-by-button.png' });
            console.log('閉じるボタンで閉じた後のスクリーンショット撮影完了');

            // ハンバーガーメニューが再表示されているかチェック
            const isHamburgerVisibleAfterClose = await hamburgerButton.isVisible();
            console.log(`閉じた後のハンバーガーメニュー: ${isHamburgerVisibleAfterClose ? '表示' : '非表示'}`);

            // 再度開く
            if (isHamburgerVisibleAfterClose) {
                console.log('ハンバーガーメニューで再度開く...');
                await hamburgerButton.click();
                await page.waitForTimeout(500);
            }
        }

        // 6. **Scenario B: オーバーレイタップのテスト**
        console.log('\n=== Scenario B: オーバーレイタップのテスト ===');

        // オーバーレイを探す
        const overlay = page.locator('.fixed.inset-0.z-40.bg-black\\/50');
        const isOverlayVisible = await overlay.isVisible();
        console.log(`オーバーレイ: ${isOverlayVisible ? '表示' : '非表示'}`);

        if (isOverlayVisible) {
            console.log('オーバーレイをクリック...');
            await overlay.click();
            await page.waitForTimeout(500);

            await page.screenshot({ path: '.playwright-mcp/simple-05-closed-by-overlay.png' });
            console.log('オーバーレイクリックで閉じた後のスクリーンショット撮影完了');

            // ハンバーガーメニューが再表示されているかチェック
            const isHamburgerVisibleAfterOverlay = await hamburgerButton.isVisible();
            console.log(`オーバーレイクリック後のハンバーガーメニュー: ${isHamburgerVisibleAfterOverlay ? '表示' : '非表示'}`);

            // 再度開く
            if (isHamburgerVisibleAfterOverlay) {
                console.log('ハンバーガーメニューで再度開く...');
                await hamburgerButton.click();
                await page.waitForTimeout(500);

                await page.screenshot({ path: '.playwright-mcp/simple-06-final-reopened.png' });
                console.log('最終的に再度開いた状態のスクリーンショット撮影完了');
            }
        }

        console.log('\n=== テスト完了 ===');
        console.log('結果:');
        console.log('- 閉じるボタンでの操作:', isCloseButtonVisible ? '成功' : '失敗（ボタンが見つからない）');
        console.log('- オーバーレイでの操作:', isOverlayVisible ? '成功' : '失敗（オーバーレイが見つからない）');

    } catch (error) {
        console.error('テスト中にエラーが発生しました:', error);
        await page.screenshot({ path: '.playwright-mcp/simple-error.png' });
    } finally {
        await browser.close();
    }
}

testMobileSidebar();