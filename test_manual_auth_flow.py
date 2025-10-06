#!/usr/bin/env python3
"""
Paintly Application Manual Authentication Flow Test
Assumes the user is already authenticated and tests the customer page and history functionality
"""

import asyncio
import time
from playwright.async_api import async_playwright


class PaintlyManualTester:
    def __init__(self):
        self.base_url = "http://172.17.161.101:9090"
        self.customer_id = "e0b351e2-5633-4cb3-8db8-5efc217b5452"
        self.screenshots_dir = ".playwright-mcp"

    async def take_screenshot(self, page, name: str, description: str = ""):
        """Take a screenshot with descriptive filename"""
        filename = f"{self.screenshots_dir}/{name}.png"
        await page.screenshot(path=filename)
        print(f"📸 スクリーンショット保存: {filename} - {description}")

    async def wait_for_page_load(self, page):
        """ページの読み込み完了を待機"""
        await page.wait_for_load_state('networkidle')
        await asyncio.sleep(1)

    async def test_authenticated_flow(self):
        """認証済み状態での機能テスト"""
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=False)
            context = await browser.new_context(
                viewport={'width': 1280, 'height': 720},
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            )
            page = await context.new_page()

            try:
                print("🚀 Paintly手動認証後テスト開始")
                print("📋 手動でブラウザにて以下を実行してください:")
                print("   1. http://172.17.161.101:9090 にアクセス")
                print("   2. 認証を完了")
                print("   3. このスクリプトがブラウザを開いたら、手動認証が完了するまで待機")
                print("\n⏳ ブラウザが開きます。手動認証を完了してから続行してください...")

                # Step 1: Open browser and wait for manual authentication
                await page.goto(self.base_url)
                await self.wait_for_page_load(page)
                await self.take_screenshot(page, "manual-01-initial", "初期状態")

                # Wait for user to complete authentication
                print("\n🔄 手動認証完了まで30秒待機します...")
                print("   - ブラウザでGoogle認証またはメールパスワード認証を完了してください")
                print("   - 認証が完了したら自動的にテストが続行されます")

                for i in range(30):
                    current_url = page.url
                    print(f"⏱️  {30-i}秒後にテスト続行... 現在のURL: {current_url}")

                    # Check if we're authenticated (not on signin page)
                    if "/auth/signin" not in current_url and "/dashboard" in current_url or "/customer" in current_url:
                        print("✅ 認証完了を検出しました！")
                        break

                    await asyncio.sleep(1)

                await self.take_screenshot(page, "manual-02-after-auth", "認証後状態")

                # Step 2: Navigate to customer page
                print("📍 Step 2: 顧客ページへの移動")
                customer_url = f"{self.base_url}/customer/{self.customer_id}"
                await page.goto(customer_url)
                await self.wait_for_page_load(page)
                await self.take_screenshot(page, "manual-03-customer-page", "顧客ページ")

                current_url = page.url
                print(f"📍 現在のURL: {current_url}")

                if "/auth/signin" in current_url:
                    print("❌ 認証が完了していません。手動認証を実行してください")
                    await self.take_screenshot(page, "manual-auth-incomplete", "認証未完了")
                    return

                # Step 3: Analyze page structure
                print("📍 Step 3: ページ構造の詳細分析")

                # Wait for content to load
                await asyncio.sleep(3)

                # Get page title
                page_title = await page.title()
                print(f"📄 ページタイトル: {page_title}")

                # Get all text content for analysis
                page_content = await page.evaluate('document.body.innerText')
                content_lines = page_content.split('\n')[:20]  # First 20 lines
                print("📝 ページコンテンツ (最初の20行):")
                for i, line in enumerate(content_lines):
                    line = line.strip()
                    if line:
                        print(f"   {i+1}: {line}")

                # Look for specific UI elements
                print("\n🔍 UI要素の検索:")

                # Check for tabs
                tab_patterns = [
                    '[role="tab"]',
                    'button[data-state]',
                    '.tab',
                    'div[data-state]',
                    'button:has-text("History")',
                    'button:has-text("履歴")',
                    'div:has-text("History")',
                    'div:has-text("履歴")'
                ]

                for pattern in tab_patterns:
                    try:
                        elements = page.locator(pattern)
                        count = await elements.count()
                        if count > 0:
                            print(f"✅ {pattern}: {count}個発見")
                            for i in range(min(count, 5)):
                                try:
                                    element = elements.nth(i)
                                    text = await element.text_content()
                                    if text:
                                        text = text.strip()[:50]  # First 50 chars
                                        print(f"   - 要素{i}: '{text}'")
                                except:
                                    print(f"   - 要素{i}: テキスト取得エラー")
                        else:
                            print(f"❌ {pattern}: 見つからず")
                    except Exception as e:
                        print(f"⚠️ {pattern}: エラー - {e}")

                await self.take_screenshot(page, "manual-04-structure-analysis", "構造分析")

                # Step 4: Try to find and interact with tabs
                print("\n📍 Step 4: タブとの相互作用")

                # Try to find history-related elements
                history_selectors = [
                    'button:has-text("History")',
                    'button:has-text("履歴")',
                    'div:has-text("History")',
                    'div:has-text("履歴")',
                    '[role="tab"]:has-text("History")',
                    '[role="tab"]:has-text("履歴")',
                    '*:has-text("History")',
                    '*:has-text("履歴")'
                ]

                history_found = False
                for selector in history_selectors:
                    try:
                        elements = page.locator(selector)
                        count = await elements.count()

                        if count > 0:
                            print(f"✅ 履歴要素発見: {selector} ({count}個)")

                            # Try to click the first one
                            element = elements.first
                            if await element.is_visible():
                                text = await element.text_content()
                                print(f"📱 クリック試行: '{text}'")

                                try:
                                    await element.click()
                                    history_found = True
                                    print("✅ 履歴要素をクリックしました")
                                    await asyncio.sleep(2)
                                    await self.take_screenshot(page, "manual-05-history-clicked", "履歴クリック後")
                                    break
                                except Exception as e:
                                    print(f"⚠️ クリックエラー: {e}")
                    except:
                        continue

                if not history_found:
                    print("⚠️ 履歴要素が見つかりませんでした")

                # Step 5: Check for GenerationHistory component
                print("\n📍 Step 5: GenerationHistoryコンポーネントの検索")

                generation_patterns = [
                    '.generation-history',
                    '[data-testid="generation-history"]',
                    '.history-list',
                    '.generation-item',
                    '.history-item',
                    'div:has-text("generation")',
                    'div:has-text("Generation")',
                    'div:has-text("生成")',
                    '*:has-text("No generations")',
                    '*:has-text("履歴がありません")'
                ]

                generation_found = False
                for pattern in generation_patterns:
                    try:
                        elements = page.locator(pattern)
                        count = await elements.count()

                        if count > 0:
                            generation_found = True
                            print(f"✅ 生成履歴要素発見: {pattern} ({count}個)")

                            for i in range(min(count, 3)):
                                try:
                                    element = elements.nth(i)
                                    text = await element.text_content()
                                    if text:
                                        text = text.strip()[:100]
                                        print(f"   - 要素{i}: '{text}'")
                                except:
                                    print(f"   - 要素{i}: テキスト取得エラー")
                    except:
                        continue

                if not generation_found:
                    print("⚠️ GenerationHistory要素が見つかりませんでした")

                await self.take_screenshot(page, "manual-06-component-search", "コンポーネント検索後")

                # Step 6: Check for image comparison/slider functionality
                print("\n📍 Step 6: 画像比較・スライダー機能の検索")

                slider_patterns = [
                    '.image-comparison',
                    '.comparison-slider',
                    '.before-after-slider',
                    'input[type="range"]',
                    '.slider',
                    '*:has-text("Before")',
                    '*:has-text("After")',
                    '*:has-text("before")',
                    '*:has-text("after")'
                ]

                slider_found = False
                for pattern in slider_patterns:
                    try:
                        elements = page.locator(pattern)
                        count = await elements.count()

                        if count > 0:
                            slider_found = True
                            print(f"✅ スライダー要素発見: {pattern} ({count}個)")
                    except:
                        continue

                if not slider_found:
                    print("⚠️ スライダー要素が見つかりませんでした")

                # Step 7: Try to trigger generation if no history exists
                print("\n📍 Step 7: 生成機能のテスト（履歴が空の場合）")

                # Look for generation-related buttons/tabs
                generation_triggers = [
                    'button:has-text("Generate")',
                    'button:has-text("生成")',
                    'button:has-text("実行")',
                    'tab:has-text("Generate")',
                    'tab:has-text("生成")',
                    '[role="tab"]:has-text("Generate")',
                    '[role="tab"]:has-text("生成")'
                ]

                for selector in generation_triggers:
                    try:
                        elements = page.locator(selector)
                        count = await elements.count()

                        if count > 0:
                            element = elements.first
                            if await element.is_visible():
                                print(f"✅ 生成ボタン/タブ発見: {selector}")
                                await element.click()
                                await asyncio.sleep(2)
                                await self.take_screenshot(page, "manual-07-generation-tab", "生成タブ")
                                break
                    except:
                        continue

                # Final screenshot
                await self.take_screenshot(page, "manual-08-final", "最終状態")

                print("\n🎉 手動認証テスト完了!")

                # Summary
                print("\n📊 テスト結果サマリー:")
                print(f"✅ 顧客ページアクセス: 成功")
                print(f"✅ 履歴要素の検索: {'成功' if history_found else '失敗'}")
                print(f"✅ GenerationHistory要素: {'発見' if generation_found else '未発見'}")
                print(f"✅ スライダー要素: {'発見' if slider_found else '未発見'}")

                # Recommendations
                print("\n💡 推奨アクション:")
                if not history_found:
                    print("   - 履歴タブの実装を確認してください")
                if not generation_found:
                    print("   - GenerationHistoryコンポーネントの実装を確認してください")
                if not slider_found:
                    print("   - 画像比較スライダーの実装を確認してください")

            except Exception as e:
                print(f"❌ テスト中にエラーが発生: {e}")
                await self.take_screenshot(page, "manual-error", f"エラー: {e}")

            finally:
                print("\n⏹️ ブラウザを閉じる前に、必要に応じて手動でページを確認してください")
                print("   Enter キーを押すとブラウザが閉じます...")
                input()  # Wait for user input before closing
                await browser.close()


async def main():
    """メイン実行関数"""
    tester = PaintlyManualTester()
    await tester.test_authenticated_flow()


if __name__ == "__main__":
    asyncio.run(main())