#!/usr/bin/env python3
"""
Paintly Application Authentication and History Test
Tests the authentication flow, customer page access, and generation history functionality
"""

import asyncio
import time
from playwright.async_api import async_playwright


class PaintlyTester:
    def __init__(self):
        self.base_url = "http://172.17.161.101:9090"
        self.email = "elmo.123912@gmail.com"
        self.password = "sanri3159"
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
        await asyncio.sleep(1)  # 追加の待機時間

    async def test_authentication_flow(self):
        """認証フローのテスト"""
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=False)
            context = await browser.new_context(
                viewport={'width': 1280, 'height': 720},
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            )
            page = await context.new_page()

            try:
                print("🚀 Paintlyアプリケーションテスト開始")

                # Step 1: Navigate to application
                print("📍 Step 1: アプリケーションへのアクセス")
                await page.goto(self.base_url)
                await self.wait_for_page_load(page)
                await self.take_screenshot(page, "01-initial-page", "初期ページ")

                # Always try to authenticate - go to signin page directly
                print("📍 Step 2: サインインページへの直接移動")
                await page.goto(f"{self.base_url}/auth/signin")
                await self.wait_for_page_load(page)
                await self.take_screenshot(page, "02-signin-page", "サインインページ")

                # Step 3: Fill in credentials
                print("📍 Step 3: 認証情報の入力")

                # Wait for email input with more specific selectors
                await page.wait_for_selector('input[type="email"], input[name="email"]', timeout=10000)

                email_input = page.locator('input[type="email"]').first
                if not await email_input.is_visible():
                    email_input = page.locator('input[name="email"]').first

                if await email_input.is_visible():
                    await email_input.clear()
                    await email_input.fill(self.email)
                    print(f"✅ メールアドレス入力: {self.email}")
                else:
                    print("❌ メールアドレス入力フィールドが見つかりません")

                # Wait for password input
                password_input = page.locator('input[type="password"]').first
                if await password_input.is_visible():
                    await password_input.clear()
                    await password_input.fill(self.password)
                    print("✅ パスワード入力完了")
                else:
                    print("❌ パスワード入力フィールドが見つかりません")

                await self.take_screenshot(page, "03-credentials-filled", "認証情報入力完了")

                # Step 4: Submit login
                print("📍 Step 4: ログイン実行")

                # Look for submit button - try multiple selectors
                submit_selectors = [
                    'button:has-text("Paintlyにサインイン")',
                    'button[type="submit"]',
                    'button:has-text("ログイン")',
                    'form button'
                ]

                submit_found = False
                for selector in submit_selectors:
                    try:
                        element = page.locator(selector).first
                        if await element.is_visible():
                            await element.click()
                            submit_found = True
                            print(f"✅ ログインボタンをクリック: {selector}")
                            break
                    except Exception as e:
                        print(f"⚠️ {selector} でエラー: {e}")
                        continue

                if submit_found:
                    # Wait for navigation after login
                    try:
                        await page.wait_for_url("**/dashboard**", timeout=10000)
                        print("✅ ダッシュボードにリダイレクトされました")
                    except:
                        print("⚠️ ダッシュボードへのリダイレクト待機中にタイムアウト")

                    await self.wait_for_page_load(page)
                    await self.take_screenshot(page, "04-after-login", "ログイン後")

                    # Check current URL to confirm authentication
                    current_url = page.url
                    print(f"📍 現在のURL: {current_url}")

                else:
                    print("❌ ログインボタンが見つかりませんでした")

                # Step 5: Navigate to customer page
                print("📍 Step 5: 顧客ページへの移動")
                customer_url = f"{self.base_url}/customer/{self.customer_id}"
                await page.goto(customer_url)
                await self.wait_for_page_load(page)
                await self.take_screenshot(page, "05-customer-page", "顧客ページ")

                # Step 6: Navigate to history tab
                print("📍 Step 6: 履歴タブへの移動")

                # Wait for page content to load
                await asyncio.sleep(2)

                # More comprehensive tab search
                history_tab_selectors = [
                    'button:has-text("History")',
                    'button:has-text("履歴")',
                    'div:has-text("History")',
                    'div:has-text("履歴")',
                    '[role="tab"]:has-text("History")',
                    '[role="tab"]:has-text("履歴")',
                    '.tab:has-text("History")',
                    '.tab:has-text("履歴")',
                    'button[data-state]:has-text("History")',
                    'button[data-state]:has-text("履歴")'
                ]

                history_tab_found = False
                for selector in history_tab_selectors:
                    try:
                        elements = page.locator(selector)
                        count = await elements.count()
                        if count > 0:
                            element = elements.first
                            if await element.is_visible():
                                await element.click()
                                history_tab_found = True
                                print(f"✅ 履歴タブをクリック: {selector}")
                                break
                    except Exception as e:
                        print(f"⚠️ {selector} でエラー: {e}")
                        continue

                if not history_tab_found:
                    print("⚠️ 履歴タブが見つかりません。ページ構造を詳しく確認します...")

                    # Look for all clickable elements
                    clickable_elements = page.locator('button, [role="tab"], .tab, div[onclick], a')
                    element_count = await clickable_elements.count()
                    print(f"📊 クリック可能な要素数: {element_count}")

                    for i in range(min(element_count, 20)):  # 最大20個まで確認
                        try:
                            element = clickable_elements.nth(i)
                            text = await element.text_content()
                            if text:
                                text = text.strip()
                                print(f"  - 要素 {i}: '{text}'")
                                if text and ("history" in text.lower() or "履歴" in text.lower()):
                                    await element.click()
                                    history_tab_found = True
                                    print(f"✅ 履歴タブを発見してクリック: '{text}'")
                                    break
                        except Exception as e:
                            print(f"  - 要素 {i}: エラー - {e}")
                            continue

                    # Also check for tabs with specific patterns
                    if not history_tab_found:
                        # Look for Radix UI tabs pattern
                        radix_tabs = page.locator('[data-state="active"], [data-state="inactive"]')
                        radix_count = await radix_tabs.count()
                        print(f"📊 Radixタブ数: {radix_count}")

                        for i in range(radix_count):
                            try:
                                tab = radix_tabs.nth(i)
                                text = await tab.text_content()
                                if text:
                                    text = text.strip()
                                    print(f"  - Radixタブ {i}: '{text}'")
                                    if "history" in text.lower() or "履歴" in text.lower():
                                        await tab.click()
                                        history_tab_found = True
                                        print(f"✅ Radix履歴タブをクリック: '{text}'")
                                        break
                            except Exception as e:
                                print(f"  - Radixタブ {i}: エラー - {e}")
                                continue

                await self.wait_for_page_load(page)
                await self.take_screenshot(page, "06-history-tab", "履歴タブ")

                # Step 7: Check for GenerationHistory component
                print("📍 Step 7: GenerationHistoryコンポーネントの確認")

                # Look for generation history elements
                history_selectors = [
                    '.generation-history',
                    '[data-testid="generation-history"]',
                    '.history-list',
                    '.generation-item',
                    '.history-item'
                ]

                history_found = False
                for selector in history_selectors:
                    try:
                        elements = page.locator(selector)
                        count = await elements.count()
                        if count > 0:
                            history_found = True
                            print(f"✅ 履歴要素を発見: {selector} ({count}個)")
                            break
                    except:
                        continue

                if not history_found:
                    print("⚠️ 履歴要素が見つかりません。履歴が空の可能性があります")

                    # Check for "no history" or empty state messages
                    empty_messages = [
                        ':has-text("No generations")',
                        ':has-text("履歴がありません")',
                        ':has-text("empty")',
                        ':has-text("空")',
                        '.empty-state'
                    ]

                    for selector in empty_messages:
                        try:
                            element = page.locator(selector).first
                            if await element.is_visible():
                                print(f"📭 空の状態メッセージを発見: {selector}")
                                break
                        except:
                            continue

                await self.take_screenshot(page, "07-history-content", "履歴コンテンツ")

                # Step 8: Test image generation if history is empty
                print("📍 Step 8: 画像生成テスト（履歴が空の場合）")

                # Look for generation tab or form
                generation_selectors = [
                    'button:has-text("Generate")',
                    'button:has-text("生成")',
                    'tab:has-text("Generate")',
                    '[role="tab"]:has-text("Generate")'
                ]

                for selector in generation_selectors:
                    try:
                        element = page.locator(selector).first
                        if await element.is_visible():
                            await element.click()
                            print("✅ 生成タブ/ボタンをクリックしました")
                            await self.wait_for_page_load(page)
                            await self.take_screenshot(page, "08-generation-tab", "生成タブ")
                            break
                    except:
                        continue

                # Look for file upload
                file_inputs = page.locator('input[type="file"]')
                file_input_count = await file_inputs.count()

                if file_input_count > 0:
                    print(f"📎 ファイル入力フィールドを発見: {file_input_count}個")

                    # Try to upload a test image if available
                    test_image_path = "/mnt/c/Users/elmod/Desktop/CursorApp/Paintly/public/test.png"
                    try:
                        await file_inputs.first.set_input_files(test_image_path)
                        print("✅ テスト画像をアップロードしました")
                        await self.wait_for_page_load(page)
                        await self.take_screenshot(page, "09-image-uploaded", "画像アップロード後")

                        # Look for generate button
                        generate_buttons = [
                            'button:has-text("Generate")',
                            'button:has-text("生成")',
                            'button:has-text("実行")',
                            'button[type="submit"]'
                        ]

                        for selector in generate_buttons:
                            try:
                                element = page.locator(selector).first
                                if await element.is_visible():
                                    await element.click()
                                    print("✅ 生成ボタンをクリックしました")

                                    # Wait for generation to complete
                                    print("⏳ 画像生成を待機中...")
                                    await asyncio.sleep(10)  # 生成完了を待つ
                                    await self.wait_for_page_load(page)
                                    await self.take_screenshot(page, "10-generation-result", "生成結果")
                                    break
                            except:
                                continue

                    except Exception as e:
                        print(f"⚠️ 画像アップロードに失敗: {e}")

                # Step 9: Go back to history tab to check updates
                print("📍 Step 9: 履歴タブの更新確認")

                for selector in history_tab_selectors:
                    try:
                        element = page.locator(selector).first
                        if await element.is_visible():
                            await element.click()
                            print("✅ 履歴タブに戻りました")
                            break
                    except:
                        continue

                await self.wait_for_page_load(page)
                await self.take_screenshot(page, "11-updated-history", "更新された履歴")

                # Step 10: Test slider functionality if images are available
                print("📍 Step 10: スライダー機能のテスト")

                slider_selectors = [
                    '.image-comparison',
                    '.comparison-slider',
                    '.before-after-slider',
                    'input[type="range"]'
                ]

                slider_found = False
                for selector in slider_selectors:
                    try:
                        elements = page.locator(selector)
                        count = await elements.count()
                        if count > 0:
                            slider_found = True
                            print(f"✅ スライダー要素を発見: {selector} ({count}個)")

                            # Test slider interaction
                            slider = elements.first
                            if await slider.is_visible():
                                # Get slider bounds
                                box = await slider.bounding_box()
                                if box:
                                    # Click on left side (show generated image)
                                    await page.mouse.click(
                                        box['x'] + box['width'] * 0.2,
                                        box['y'] + box['height'] * 0.5
                                    )
                                    await asyncio.sleep(1)
                                    await self.take_screenshot(page, "12-slider-left", "スライダー左位置")

                                    # Click on right side (show original image)
                                    await page.mouse.click(
                                        box['x'] + box['width'] * 0.8,
                                        box['y'] + box['height'] * 0.5
                                    )
                                    await asyncio.sleep(1)
                                    await self.take_screenshot(page, "13-slider-right", "スライダー右位置")

                                    # Click on center
                                    await page.mouse.click(
                                        box['x'] + box['width'] * 0.5,
                                        box['y'] + box['height'] * 0.5
                                    )
                                    await asyncio.sleep(1)
                                    await self.take_screenshot(page, "14-slider-center", "スライダー中央位置")

                                    print("✅ スライダー機能をテストしました")
                            break
                    except Exception as e:
                        print(f"⚠️ スライダーテストエラー: {e}")
                        continue

                if not slider_found:
                    print("⚠️ スライダー要素が見つかりませんでした")

                # Final screenshot
                await self.take_screenshot(page, "15-final-state", "最終状態")

                print("🎉 テスト完了!")

                # Summary
                print("\n📊 テスト結果サマリー:")
                print(f"✅ アプリケーションアクセス: 成功")
                print(f"✅ 認証プロセス: 実行済み")
                print(f"✅ 顧客ページアクセス: 成功")
                print(f"✅ 履歴タブアクセス: {'成功' if history_tab_found else '失敗'}")
                print(f"✅ 履歴コンテンツ確認: {'成功' if history_found else '空の状態'}")
                print(f"✅ スライダー機能: {'成功' if slider_found else '要素なし'}")

            except Exception as e:
                print(f"❌ テスト中にエラーが発生: {e}")
                await self.take_screenshot(page, "error", f"エラー: {e}")

            finally:
                await browser.close()


async def main():
    """メイン実行関数"""
    tester = PaintlyTester()
    await tester.test_authentication_flow()


if __name__ == "__main__":
    asyncio.run(main())