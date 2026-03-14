#!/usr/bin/env node
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });
  // Moo Medium Postcard bleed area: 7.13" × 5.13" at 300dpi = 2140×1540 (viewport ×2)
  const context = await browser.newContext({ viewport: { width: 1070, height: 770 }, deviceScaleFactor: 2 });

  // Front
  const front = await context.newPage();
  await front.goto('http://127.0.0.1:8080/postcard.html', { waitUntil: 'networkidle' });
  await front.waitForTimeout(1000);
  await front.screenshot({ path: 'public/postcard-front-print.png' });
  console.log('Saved public/postcard-front-print.png');

  // Back
  const back = await context.newPage();
  await back.goto('http://127.0.0.1:8080/postcard-back.html', { waitUntil: 'networkidle' });
  await back.waitForTimeout(1000);
  await back.screenshot({ path: 'public/postcard-back-print.png' });
  console.log('Saved public/postcard-back-print.png');

  await browser.close();
})();
