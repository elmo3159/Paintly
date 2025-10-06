const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  await page.screenshot({
    path: 'neo-brutalist-landing.png',
    fullPage: true
  });

  console.log('Screenshot saved: neo-brutalist-landing.png');
  await browser.close();
})();
