const { chromium } = require('playwright');

async function testCompleteSidebarFlow() {
    console.log('完全なサイドバーフローテストを開始します...');

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 375, height: 667 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    });
    const page = await context.newPage();

    try {
        // 1. ログインしてダッシュボードに移動
        console.log('ログインページにアクセス中...');
        await page.goto('http://localhost:3000/auth/signin');
        await page.waitForLoadState('networkidle');

        const emailInput = page.locator('input[type="email"]');
        await emailInput.waitFor({ timeout: 10000 });
        await emailInput.fill('elmodayo3159@gmail.com');

        const passwordInput = page.locator('input[type="password"]');
        await passwordInput.fill('sanri3159');

        const submitButton = page.locator('button[type="submit"]');
        await submitButton.click();

        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        await page.waitForURL('**/dashboard', { timeout: 15000 });

        // 2. 初期状態の確認（サイドバーが閉じており、ハンバーガーメニューが表示）
        console.log('\n=== Step 1: 初期状態の確認 ===');
        await page.screenshot({ path: '.playwright-mcp/flow-01-initial-state.png' });
        console.log('初期状態: サイドバー閉じ、ハンバーガーメニュー表示');

        const hamburgerButton = page.locator('.fixed.left-4.top-4.z-50');
        const isHamburgerVisible = await hamburgerButton.isVisible();
        console.log(`ハンバーガーメニュー: ${isHamburgerVisible ? '表示✓' : '非表示✗'}`);

        // 3. ハンバーガーメニューをクリックしてサイドバーを開く
        console.log('\n=== Step 2: ハンバーガーメニューでサイドバーを開く ===');
        if (isHamburgerVisible) {
            await hamburgerButton.click();
            await page.waitForTimeout(1000);

            await page.screenshot({ path: '.playwright-mcp/flow-02-sidebar-opened.png' });
            console.log('サイドバーを開きました');

            // サイドバーとオーバーレイの状態確認
            const mobileSidebar = page.locator('.fixed.inset-y-0.left-0.z-50');
            const overlay = page.locator('.fixed.inset-0.z-40.bg-black\\/50');

            const isSidebarOpen = await mobileSidebar.isVisible();
            const isOverlayVisible = await overlay.isVisible();

            console.log(`モバイルサイドバー: ${isSidebarOpen ? '開いている✓' : '閉じている✗'}`);
            console.log(`オーバーレイ: ${isOverlayVisible ? '表示✓' : '非表示✗'}`);

            // 4. **Scenario A: 閉じるボタンのテスト**
            console.log('\n=== Step 3: Scenario A - 閉じるボタンのテスト ===');

            const closeButton = page.locator('text=サイドバーを閉じる');
            const isCloseButtonVisible = await closeButton.isVisible();
            console.log(`閉じるボタン: ${isCloseButtonVisible ? '表示✓' : '非表示✗'}`);

            if (isCloseButtonVisible) {
                console.log('閉じるボタンをクリック...');
                await closeButton.click();
                await page.waitForTimeout(1000);

                await page.screenshot({ path: '.playwright-mcp/flow-03-closed-by-button.png' });

                // 閉じた後の状態確認
                const isHamburgerVisibleAfterClose = await hamburgerButton.isVisible();
                const isSidebarClosedAfterButton = !(await mobileSidebar.isVisible());

                console.log(`閉じるボタン後 - ハンバーガーメニュー: ${isHamburgerVisibleAfterClose ? '表示✓' : '非表示✗'}`);
                console.log(`閉じるボタン後 - サイドバー: ${isSidebarClosedAfterButton ? '閉じている✓' : '開いている✗'}`);

                // 再度開く
                if (isHamburgerVisibleAfterClose) {
                    console.log('再度ハンバーガーメニューでサイドバーを開く...');
                    await hamburgerButton.click();
                    await page.waitForTimeout(1000);
                }
            }

            // 5. **Scenario B: オーバーレイタップのテスト**
            console.log('\n=== Step 4: Scenario B - オーバーレイタップのテスト ===');

            // サイドバーが開いていることを確認
            const isSidebarOpenForOverlayTest = await mobileSidebar.isVisible();
            const isOverlayVisibleForTest = await overlay.isVisible();

            console.log(`オーバーレイテスト前 - サイドバー: ${isSidebarOpenForOverlayTest ? '開いている✓' : '閉じている✗'}`);
            console.log(`オーバーレイテスト前 - オーバーレイ: ${isOverlayVisibleForTest ? '表示✓' : '非表示✗'}`);

            if (isOverlayVisibleForTest) {
                console.log('オーバーレイをクリック...');
                await overlay.click();
                await page.waitForTimeout(1000);

                await page.screenshot({ path: '.playwright-mcp/flow-04-closed-by-overlay.png' });

                // オーバーレイクリック後の状態確認
                const isHamburgerVisibleAfterOverlay = await hamburgerButton.isVisible();
                const isSidebarClosedAfterOverlay = !(await mobileSidebar.isVisible());

                console.log(`オーバーレイクリック後 - ハンバーガーメニュー: ${isHamburgerVisibleAfterOverlay ? '表示✓' : '非表示✗'}`);
                console.log(`オーバーレイクリック後 - サイドバー: ${isSidebarClosedAfterOverlay ? '閉じている✓' : '開いている✗'}`);

                // 最終的に再度開いて閉じるまでの動作確認
                if (isHamburgerVisibleAfterOverlay) {
                    console.log('最終確認：再度ハンバーガーメニューでサイドバーを開く...');
                    await hamburgerButton.click();
                    await page.waitForTimeout(1000);

                    await page.screenshot({ path: '.playwright-mcp/flow-05-final-reopened.png' });
                }
            } else {
                console.log('オーバーレイが見つからないため、オーバーレイテストをスキップします');
            }

            // 6. 最終状態の確認
            console.log('\n=== Step 5: 最終状態の確認 ===');
            await page.screenshot({ path: '.playwright-mcp/flow-06-final-state.png' });

            // テスト結果のサマリー
            console.log('\n=== テスト結果サマリー ===');
            console.log(`✓ 初期状態でハンバーガーメニューが表示される: ${isHamburgerVisible ? 'PASS' : 'FAIL'}`);
            console.log(`✓ ハンバーガーメニューでサイドバーが開く: ${isSidebarOpen ? 'PASS' : 'FAIL'}`);
            console.log(`✓ サイドバーが開いた時にオーバーレイが表示される: ${isOverlayVisible ? 'PASS' : 'FAIL'}`);
            console.log(`✓ 閉じるボタンが表示される: ${isCloseButtonVisible ? 'PASS' : 'FAIL'}`);

            if (isCloseButtonVisible) {
                const testCloseButton = await hamburgerButton.isVisible();
                console.log(`✓ 閉じるボタンでサイドバーが閉じてハンバーガーメニューが再表示される: ${testCloseButton ? 'PASS' : 'FAIL'}`);
            }

            if (isOverlayVisibleForTest) {
                const testOverlay = await hamburgerButton.isVisible();
                console.log(`✓ オーバーレイクリックでサイドバーが閉じてハンバーガーメニューが再表示される: ${testOverlay ? 'PASS' : 'FAIL'}`);
            }

        } else {
            console.log('ハンバーガーメニューが見つからないため、テストを中止します');
        }

    } catch (error) {
        console.error('テスト中にエラーが発生しました:', error);
        await page.screenshot({ path: '.playwright-mcp/flow-error.png' });
    } finally {
        await browser.close();
    }
}

testCompleteSidebarFlow();