const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testMobileSidebar() {
    console.log('モバイルサイドバーテストを開始します...');

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 375, height: 667 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    });
    const page = await context.newPage();

    try {
        // 1. サイトにアクセス
        console.log('サイトにアクセス中...');
        await page.goto('http://localhost:3000');
        await page.waitForLoadState('networkidle');

        // 初期画面のスクリーンショット
        await page.screenshot({ path: '.playwright-mcp/01-initial-page.png' });
        console.log('初期画面のスクリーンショット撮影完了');

        // 2. ログイン
        console.log('ログイン処理開始...');

        // ログインページに移動（もしリダイレクトされていない場合）
        const currentUrl = page.url();
        if (!currentUrl.includes('/auth/signin')) {
            await page.goto('http://localhost:3000/auth/signin');
            await page.waitForLoadState('networkidle');
        }

        // ログインフォームに入力
        console.log('メールアドレス入力中...');
        await page.waitForSelector('input[type="email"], input[name="email"], input[placeholder*="email" i], input[placeholder*="メール" i]', { timeout: 10000 });
        await page.fill('input[type="email"], input[name="email"], input[placeholder*="email" i], input[placeholder*="メール" i]', 'elmodayo3159@gmail.com');

        console.log('パスワード入力中...');
        await page.fill('input[type="password"], input[name="password"], input[placeholder*="password" i], input[placeholder*="パスワード" i]', 'sanri3159');

        // ログインボタンをクリック
        console.log('ログインボタンをクリック中...');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        // ログイン後のリダイレクトを待つ
        await page.waitForURL('**/dashboard', { timeout: 15000 });

        await page.screenshot({ path: '.playwright-mcp/02-after-login.png' });
        console.log('ログイン後のスクリーンショット撮影完了');

        // 3. 顧客ページに移動
        console.log('顧客ページに移動中...');

        // サイドバーの顧客リンクを探す
        const customerLinks = await page.locator('a[href*="/customer/"]').all();
        if (customerLinks.length > 0) {
            await customerLinks[0].click();
        } else {
            // 新規顧客ページを作成
            const newCustomerButton = await page.locator('text=＋').first();
            if (await newCustomerButton.isVisible()) {
                await newCustomerButton.click();
            }
        }

        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        await page.screenshot({ path: '.playwright-mcp/03-customer-page.png' });
        console.log('顧客ページのスクリーンショット撮影完了');

        // 4. サイドバーの状態を確認
        console.log('サイドバーの初期状態を確認中...');

        // 実際のDOM構造に合わせたセレクター
        const mobileSidebar = page.locator('.fixed.inset-y-0.left-0.z-50'); // モバイル用サイドバー
        const desktopSidebar = page.locator('.hidden.md\\:flex.h-screen.w-64'); // デスクトップ用サイドバー
        const overlay = page.locator('.fixed.inset-0.z-40.bg-black\\/50'); // オーバーレイ
        const hamburgerMenu = page.locator('button').filter({ hasText: '' }).first(); // ハンバーガーメニューアイコン
        const closeButton = page.locator('text=サイドバーを閉じる');

        // モバイルサイドバーが開いているかチェック
        const isMobileSidebarOpen = await mobileSidebar.isVisible();
        console.log(`モバイルサイドバーの状態: ${isMobileSidebarOpen ? '開' : '閉'}`);

        // ハンバーガーメニューが表示されているかチェック
        const hamburgerButtons = page.locator('button:has(svg)').filter({ hasText: '' });
        const isHamburgerVisible = await hamburgerButtons.count() > 0;
        console.log(`ハンバーガーメニューの状態: ${isHamburgerVisible ? '表示' : '非表示'}`);

        // サイドバーが閉じている場合は開く
        if (!isMobileSidebarOpen && isHamburgerVisible) {
            console.log('ハンバーガーメニューをクリックしてサイドバーを開きます...');
            await hamburgerButtons.first().click();
            await page.waitForTimeout(500);
        }

        // **Scenario A: 閉じるボタンのテスト**
        console.log('\n=== Scenario A: 閉じるボタンのテスト ===');

        // サイドバーが開いている状態のスクリーンショット
        await page.screenshot({ path: '.playwright-mcp/scenario-a-01-sidebar-open.png' });
        console.log('Scenario A: サイドバー開状態のスクリーンショット撮影完了');

        // 閉じるボタンが表示されているかチェック
        const isCloseButtonVisible = await closeButton.isVisible();
        console.log(`閉じるボタンの状態: ${isCloseButtonVisible ? '表示' : '非表示'}`);

        if (isCloseButtonVisible) {
            console.log('閉じるボタンをクリック...');
            await closeButton.click();
            await page.waitForTimeout(500);

            // 閉じた後のスクリーンショット
            await page.screenshot({ path: '.playwright-mcp/scenario-a-02-after-close.png' });
            console.log('Scenario A: 閉じた後のスクリーンショット撮影完了');

            // ハンバーガーメニューが表示されているかチェック
            const isHamburgerVisibleAfterClose = await hamburgerMenu.isVisible();
            console.log(`閉じた後のハンバーガーメニュー: ${isHamburgerVisibleAfterClose ? '表示' : '非表示'}`);

            if (isHamburgerVisibleAfterClose) {
                console.log('ハンバーガーメニューをクリックして再度開く...');
                await hamburgerMenu.click();
                await page.waitForTimeout(500);

                await page.screenshot({ path: '.playwright-mcp/scenario-a-03-reopened.png' });
                console.log('Scenario A: 再度開いた状態のスクリーンショット撮影完了');
            }
        } else {
            console.log('閉じるボタンが見つかりません');
        }

        // **Scenario B: オーバーレイタップのテスト**
        console.log('\n=== Scenario B: オーバーレイタップのテスト ===');

        // サイドバーが開いていることを確認
        if (!(await sidebar.isVisible())) {
            if (await hamburgerMenu.isVisible()) {
                await hamburgerMenu.click();
                await page.waitForTimeout(500);
            }
        }

        // サイドバー開状態のスクリーンショット
        await page.screenshot({ path: '.playwright-mcp/scenario-b-01-sidebar-open.png' });
        console.log('Scenario B: サイドバー開状態のスクリーンショット撮影完了');

        // オーバーレイが表示されているかチェック
        const isOverlayVisible = await overlay.isVisible();
        console.log(`オーバーレイの状態: ${isOverlayVisible ? '表示' : '非表示'}`);

        if (isOverlayVisible) {
            console.log('オーバーレイをクリック...');
            await overlay.click();
            await page.waitForTimeout(500);

            // 閉じた後のスクリーンショット
            await page.screenshot({ path: '.playwright-mcp/scenario-b-02-after-overlay-click.png' });
            console.log('Scenario B: オーバーレイクリック後のスクリーンショット撮影完了');

            // ハンバーガーメニューが表示されているかチェック
            const isHamburgerVisibleAfterOverlay = await hamburgerMenu.isVisible();
            console.log(`オーバーレイクリック後のハンバーガーメニュー: ${isHamburgerVisibleAfterOverlay ? '表示' : '非表示'}`);

            if (isHamburgerVisibleAfterOverlay) {
                console.log('ハンバーガーメニューをクリックして再度開く...');
                await hamburgerMenu.click();
                await page.waitForTimeout(500);

                await page.screenshot({ path: '.playwright-mcp/scenario-b-03-reopened.png' });
                console.log('Scenario B: 再度開いた状態のスクリーンショット撮影完了');
            }
        } else {
            console.log('オーバーレイが見つかりません');
        }

        console.log('\n=== テスト完了 ===');
        console.log('すべてのスクリーンショットが .playwright-mcp/ ディレクトリに保存されました');

    } catch (error) {
        console.error('テスト中にエラーが発生しました:', error);
        await page.screenshot({ path: '.playwright-mcp/error-screenshot.png' });
    } finally {
        await browser.close();
    }
}

testMobileSidebar();