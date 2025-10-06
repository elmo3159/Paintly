/**
 * Chrome DevTools MCP を使用した顧客ページレイアウト問題調査
 * 下部空白スペース問題の診断とCSS最適化
 */

const { chromium } = require('@playwright/test');

async function debugCustomerPageLayout() {
  console.log('🔍 顧客ページレイアウト問題調査開始...');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1200, height: 800 }
  });

  const page = await context.newPage();

  try {
    console.log('🏠 ダッシュボードにアクセス...');
    await page.goto('http://172.17.161.101:9090', {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });

    await page.waitForTimeout(3000);

    // ダッシュボードのスクリーンショット
    await page.screenshot({
      path: '.playwright-mcp/layout-debug-01-dashboard.png',
      fullPage: true
    });

    console.log('👤 新規顧客ページを作成または既存ページにアクセス...');

    // サイドバーの「＋」ボタンを探す
    const addButtonSelectors = [
      'button:has-text("＋")',
      'button:has-text("+")',
      '[aria-label*="追加"]',
      '.add-customer',
      '[data-testid*="add"]',
      '.sidebar [role="button"]:has-text("+")',
      '.sidebar button'
    ];

    let customerPageAccessed = false;

    // まず既存の顧客ページへのリンクを探す
    const customerLinks = await page.locator('a[href*="/customer/"]').count();

    if (customerLinks > 0) {
      console.log(`✅ 既存の顧客ページリンク発見: ${customerLinks}個`);
      const firstCustomerLink = page.locator('a[href*="/customer/"]').first();
      await firstCustomerLink.click();
      customerPageAccessed = true;
      console.log('✅ 既存顧客ページにアクセス');
    } else {
      // 新規作成ボタンを試す
      for (const selector of addButtonSelectors) {
        try {
          const addBtn = page.locator(selector).first();
          if (await addBtn.isVisible({ timeout: 2000 })) {
            await addBtn.click();
            await page.waitForTimeout(3000);
            customerPageAccessed = true;
            console.log('✅ 新規顧客ページ作成');
            break;
          }
        } catch (error) {
          // 次のセレクターを試す
        }
      }
    }

    if (!customerPageAccessed) {
      console.log('⚠️ 顧客ページにアクセスできません');
      return;
    }

    await page.waitForTimeout(3000);

    // 顧客ページの初期状態
    await page.screenshot({
      path: '.playwright-mcp/layout-debug-02-customer-page-initial.png',
      fullPage: true
    });

    console.log('📏 ページ高さとスクロール状況を調査...');

    // ページの詳細情報を取得
    const pageInfo = await page.evaluate(() => {
      return {
        documentHeight: document.documentElement.scrollHeight,
        viewportHeight: window.innerHeight,
        bodyHeight: document.body.scrollHeight,
        bodyOffsetHeight: document.body.offsetHeight,
        maxScrollTop: document.documentElement.scrollHeight - window.innerHeight,
        currentScrollTop: window.scrollY,
        bodyComputedHeight: window.getComputedStyle(document.body).height,
        htmlComputedHeight: window.getComputedStyle(document.documentElement).height
      };
    });

    console.log('📊 ページ情報:', pageInfo);

    // 最下部までスクロールしてテスト
    await page.evaluate(() => {
      window.scrollTo(0, document.documentElement.scrollHeight);
    });

    await page.waitForTimeout(1000);

    // 最下部のスクリーンショット
    await page.screenshot({
      path: '.playwright-mcp/layout-debug-03-customer-page-bottom.png',
      fullPage: true
    });

    console.log('🔍 CSS レイアウト問題を特定...');

    // 高さに関する要素を詳細調査
    const layoutAnalysis = await page.evaluate(() => {
      const elements = [];
      const problematicElements = [];

      // メインコンテナ要素を調査
      const mainSelectors = [
        'body',
        'html',
        '#__next',
        '.main',
        '.container',
        '.customer-page',
        '.content',
        '[data-testid*="main"]',
        'main'
      ];

      mainSelectors.forEach(selector => {
        const elem = document.querySelector(selector);
        if (elem) {
          const computed = window.getComputedStyle(elem);
          const rect = elem.getBoundingClientRect();

          const info = {
            selector,
            height: computed.height,
            minHeight: computed.minHeight,
            maxHeight: computed.maxHeight,
            paddingBottom: computed.paddingBottom,
            marginBottom: computed.marginBottom,
            overflow: computed.overflow,
            overflowY: computed.overflowY,
            position: computed.position,
            display: computed.display,
            flexGrow: computed.flexGrow,
            flexShrink: computed.flexShrink,
            offsetHeight: elem.offsetHeight,
            scrollHeight: elem.scrollHeight,
            clientHeight: elem.clientHeight,
            rectHeight: rect.height,
            bottom: rect.bottom
          };

          elements.push(info);

          // 問題のある要素を特定
          if (
            parseInt(computed.minHeight) > window.innerHeight ||
            parseInt(computed.height) > window.innerHeight * 2 ||
            parseInt(computed.paddingBottom) > 100 ||
            parseInt(computed.marginBottom) > 100 ||
            elem.scrollHeight > window.innerHeight * 3
          ) {
            problematicElements.push(info);
          }
        }
      });

      // 非表示または空の高い要素を探す
      const allElements = document.querySelectorAll('*');
      let suspiciousElements = [];

      allElements.forEach(elem => {
        const computed = window.getComputedStyle(elem);
        const rect = elem.getBoundingClientRect();

        if (
          rect.height > window.innerHeight &&
          (computed.visibility === 'hidden' ||
           computed.display === 'none' ||
           elem.offsetHeight === 0 ||
           elem.textContent.trim() === '')
        ) {
          suspiciousElements.push({
            tagName: elem.tagName,
            className: elem.className,
            id: elem.id,
            height: rect.height,
            visibility: computed.visibility,
            display: computed.display,
            offsetHeight: elem.offsetHeight,
            content: elem.textContent.substring(0, 50)
          });
        }
      });

      return {
        mainElements: elements,
        problematicElements,
        suspiciousElements: suspiciousElements.slice(0, 10), // 上位10個
        windowHeight: window.innerHeight,
        documentHeight: document.documentElement.scrollHeight
      };
    });

    console.log('🎯 レイアウト分析結果:');
    console.log('📏 基本情報:', {
      windowHeight: layoutAnalysis.windowHeight,
      documentHeight: layoutAnalysis.documentHeight,
      ratio: layoutAnalysis.documentHeight / layoutAnalysis.windowHeight
    });

    if (layoutAnalysis.problematicElements.length > 0) {
      console.log('⚠️ 問題のある要素:', layoutAnalysis.problematicElements);
    }

    if (layoutAnalysis.suspiciousElements.length > 0) {
      console.log('🔍 疑わしい要素:', layoutAnalysis.suspiciousElements);
    }

    // 特定のCSS問題をチェック
    const cssIssues = await page.evaluate(() => {
      const issues = [];

      // 1. vh/vhの誤用チェック
      const vhElements = Array.from(document.querySelectorAll('*')).filter(elem => {
        const computed = window.getComputedStyle(elem);
        return computed.height.includes('vh') ||
               computed.minHeight.includes('vh') ||
               computed.maxHeight.includes('vh');
      });

      if (vhElements.length > 0) {
        issues.push({
          type: 'vh-usage',
          count: vhElements.length,
          elements: vhElements.slice(0, 3).map(elem => ({
            tag: elem.tagName,
            class: elem.className,
            height: window.getComputedStyle(elem).height
          }))
        });
      }

      // 2. Flexbox関連問題
      const flexElements = Array.from(document.querySelectorAll('*')).filter(elem => {
        const computed = window.getComputedStyle(elem);
        return computed.display.includes('flex');
      });

      const flexIssues = flexElements.filter(elem => {
        const computed = window.getComputedStyle(elem);
        return computed.flexGrow === '1' && elem.scrollHeight > window.innerHeight * 2;
      });

      if (flexIssues.length > 0) {
        issues.push({
          type: 'flex-grow-issue',
          count: flexIssues.length,
          elements: flexIssues.slice(0, 3).map(elem => ({
            tag: elem.tagName,
            class: elem.className,
            scrollHeight: elem.scrollHeight
          }))
        });
      }

      return issues;
    });

    if (cssIssues.length > 0) {
      console.log('🐛 特定されたCSS問題:', cssIssues);
    }

    // 中央部分のスクリーンショット（問題特定用）
    await page.evaluate(() => {
      window.scrollTo(0, window.innerHeight);
    });

    await page.screenshot({
      path: '.playwright-mcp/layout-debug-04-customer-page-middle.png',
      fullPage: false
    });

    // 問題の詳細分析結果をファイルに保存
    const analysisReport = {
      timestamp: new Date().toISOString(),
      pageInfo,
      layoutAnalysis,
      cssIssues,
      url: page.url()
    };

    require('fs').writeFileSync(
      '.playwright-mcp/layout-analysis-report.json',
      JSON.stringify(analysisReport, null, 2)
    );

    console.log('📄 詳細分析レポートを保存: layout-analysis-report.json');

    console.log('\n🎯 問題分析結果:');
    if (pageInfo.documentHeight > pageInfo.viewportHeight * 2) {
      console.log('⚠️ ページ高さが異常に高い:', pageInfo.documentHeight, 'px');
    }
    if (layoutAnalysis.problematicElements.length > 0) {
      console.log('⚠️ 問題要素数:', layoutAnalysis.problematicElements.length);
    }
    if (cssIssues.length > 0) {
      console.log('⚠️ CSS問題数:', cssIssues.length);
    }

  } catch (error) {
    console.error('❌ 調査エラー:', error.message);
    await page.screenshot({
      path: '.playwright-mcp/layout-debug-error.png',
      fullPage: true
    });
  } finally {
    await browser.close();
  }
}

// 実行
debugCustomerPageLayout().catch(console.error);