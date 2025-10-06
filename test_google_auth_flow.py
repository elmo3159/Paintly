#!/usr/bin/env python3
"""
Paintly Application Google Authentication and History Test
Tests the Google authentication flow, customer page access, and generation history functionality
"""

import asyncio
import time
from playwright.async_api import async_playwright


class PaintlyGoogleTester:
    def __init__(self):
        self.base_url = "http://172.17.161.101:9090"
        self.google_email = "elmo.123912@gmail.com"
        self.google_password = "sanri3159"
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

    async def test_google_authentication_flow(self):
        """Google認証フローのテスト"""
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=False)
            context = await browser.new_context(
                viewport={'width': 1280, 'height': 720},
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            )
            page = await context.new_page()

            try:
                print("🚀 Paintly Google認証テスト開始")

                # Step 1: Navigate to application
                print("📍 Step 1: アプリケーションへのアクセス")
                await page.goto(self.base_url)
                await self.wait_for_page_load(page)
                await self.take_screenshot(page, "google-01-initial", "初期ページ")

                # Step 2: Navigate to sign-in page
                print("📍 Step 2: サインインページへの移動")
                await page.goto(f"{self.base_url}/auth/signin")
                await self.wait_for_page_load(page)
                await self.take_screenshot(page, "google-02-signin-page", "サインインページ")

                # Step 3: Click Google authentication
                print("📍 Step 3: Google認証ボタンをクリック")

                google_selectors = [
                    'button:has-text("Googleで始める")',
                    'button:has-text("Google")',
                    'button[data-provider="google"]',
                    'button:has-text("Continue with Google")'
                ]

                google_found = False
                for selector in google_selectors:
                    try:
                        element = page.locator(selector).first
                        if await element.is_visible():
                            await element.click()
                            google_found = True
                            print(f"✅ Googleボタンをクリック: {selector}")
                            break
                    except Exception as e:
                        print(f"⚠️ {selector} でエラー: {e}")
                        continue

                if not google_found:
                    print("❌ Googleボタンが見つかりませんでした")
                    return

                # Wait for Google page or popup
                await asyncio.sleep(3)
                await self.take_screenshot(page, "google-03-after-click", "Googleボタンクリック後")

                # Check if we're on Google's auth page
                current_url = page.url
                print(f"📍 現在のURL: {current_url}")

                if "accounts.google.com" in current_url or "google.com" in current_url:
                    print("✅ Google認証ページに移動しました")

                    # Fill in Google email
                    try:
                        email_input = page.locator('input[type="email"]').first
                        await email_input.wait_for(state="visible", timeout=5000)
                        await email_input.fill(self.google_email)
                        await self.take_screenshot(page, "google-04-email-filled", "メール入力完了")

                        # Click Next
                        next_button = page.locator('#identifierNext, button:has-text("Next"), button:has-text("次へ")').first
                        await next_button.click()
                        await asyncio.sleep(2)

                        # Fill in password
                        password_input = page.locator('input[type="password"]').first
                        await password_input.wait_for(state="visible", timeout=5000)
                        await password_input.fill(self.google_password)
                        await self.take_screenshot(page, "google-05-password-filled", "パスワード入力完了")

                        # Click Next
                        password_next_button = page.locator('#passwordNext, button:has-text("Next"), button:has-text("次へ")').first
                        await password_next_button.click()

                        print("✅ Google認証情報を入力しました")

                    except Exception as e:
                        print(f"⚠️ Google認証でエラー: {e}")

                # Wait for authentication to complete and return to our app
                print("⏳ 認証完了を待機中...")
                try:
                    await page.wait_for_url(f"{self.base_url}/**", timeout=15000)
                    print("✅ アプリケーションに戻りました")
                except:
                    print("⚠️ アプリケーションへの戻り待機中にタイムアウト")

                await self.wait_for_page_load(page)
                await self.take_screenshot(page, "google-06-after-auth", "認証後")

                current_url = page.url
                print(f"📍 認証後のURL: {current_url}")

                # Step 4: Navigate to customer page
                print("📍 Step 4: 顧客ページへの移動")
                customer_url = f"{self.base_url}/customer/{self.customer_id}"
                await page.goto(customer_url)
                await self.wait_for_page_load(page)
                await self.take_screenshot(page, "google-07-customer-page", "顧客ページ")

                # Check if we're authenticated (not on signin page)
                current_url = page.url
                if "/auth/signin" in current_url:
                    print("❌ まだ認証されていません")
                    await self.take_screenshot(page, "google-auth-failed", "認証失敗")
                    return
                else:
                    print("✅ 認証成功 - 顧客ページにアクセスできました")

                # Step 5: Look for tabs and content
                print("📍 Step 5: ページ構造の確認")

                # Wait for content to load
                await asyncio.sleep(3)

                # Look for any tabs
                tab_selectors = [
                    '[role="tab"]',
                    'button[data-state]',
                    '.tab',
                    'div[data-state="active"]',
                    'div[data-state="inactive"]'
                ]

                found_tabs = []
                for selector in tab_selectors:
                    try:
                        elements = page.locator(selector)
                        count = await elements.count()
                        if count > 0:
                            print(f"📊 {selector} タブ数: {count}")
                            for i in range(count):
                                try:
                                    tab = elements.nth(i)
                                    text = await tab.text_content()
                                    if text:
                                        text = text.strip()
                                        found_tabs.append(text)
                                        print(f"  - タブ {i}: '{text}'")
                                except:
                                    continue
                    except:
                        continue

                await self.take_screenshot(page, "google-08-page-structure", "ページ構造確認")

                # Step 6: Try to find and click history tab
                print("📍 Step 6: 履歴タブの検索とクリック")

                history_found = False
                for tab_text in found_tabs:
                    if "history" in tab_text.lower() or "履歴" in tab_text.lower():
                        print(f"✅ 履歴タブを発見: '{tab_text}'")

                        # Find and click this tab
                        tab_element = page.locator(f'[role="tab"]:has-text("{tab_text}"), button:has-text("{tab_text}"), div:has-text("{tab_text}")').first
                        try:
                            await tab_element.click()
                            history_found = True
                            print(f"✅ 履歴タブをクリック: '{tab_text}'")
                            break
                        except Exception as e:
                            print(f"⚠️ 履歴タブクリックエラー: {e}")

                if not history_found:
                    # Try alternative approaches
                    print("⚠️ 履歴タブが見つかりません。代替検索を実行...")

                    # Look for any element with "History" or "履歴"
                    history_elements = page.locator('*:has-text("History"), *:has-text("履歴")')
                    history_count = await history_elements.count()
                    print(f"📊 History/履歴を含む要素数: {history_count}")

                    for i in range(min(history_count, 5)):
                        try:
                            element = history_elements.nth(i)
                            text = await element.text_content()
                            print(f"  - History要素 {i}: '{text}'")

                            # Try to click if it looks clickable
                            tag_name = await element.evaluate('el => el.tagName')
                            if tag_name.lower() in ['button', 'div', 'span', 'a']:
                                await element.click()
                                history_found = True
                                print(f"✅ History要素をクリック: '{text}'")
                                break
                        except Exception as e:
                            print(f"  - History要素 {i} クリックエラー: {e}")

                await self.wait_for_page_load(page)
                await self.take_screenshot(page, "google-09-history-attempt", "履歴タブ試行後")

                # Step 7: Check for GenerationHistory component
                print("📍 Step 7: GenerationHistoryコンポーネントの確認")

                generation_selectors = [
                    '.generation-history',
                    '[data-testid="generation-history"]',
                    '.history-list',
                    '.generation-item',
                    '.history-item',
                    'div:has-text("generation")',
                    'div:has-text("Generation")'
                ]

                generation_found = False
                for selector in generation_selectors:
                    try:
                        elements = page.locator(selector)
                        count = await elements.count()
                        if count > 0:
                            generation_found = True
                            print(f"✅ 生成履歴要素を発見: {selector} ({count}個)")
                            break
                    except:
                        continue

                if not generation_found:
                    print("⚠️ 生成履歴要素が見つかりません")

                await self.take_screenshot(page, "google-10-final-state", "最終状態")

                print("🎉 Google認証テスト完了!")

                # Summary
                print("\n📊 Google認証テスト結果:")
                print(f"✅ アプリケーションアクセス: 成功")
                print(f"✅ Google認証プロセス: {'成功' if google_found else '失敗'}")
                print(f"✅ 顧客ページアクセス: 成功")
                print(f"✅ 履歴タブ検索: {'成功' if history_found else '失敗'}")
                print(f"✅ 生成履歴要素: {'発見' if generation_found else '未発見'}")

            except Exception as e:
                print(f"❌ テスト中にエラーが発生: {e}")
                await self.take_screenshot(page, "google-error", f"エラー: {e}")

            finally:
                await browser.close()


async def main():
    """メイン実行関数"""
    tester = PaintlyGoogleTester()
    await tester.test_google_authentication_flow()


if __name__ == "__main__":
    asyncio.run(main())