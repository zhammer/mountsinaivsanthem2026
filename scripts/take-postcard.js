#!/usr/bin/env node
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: false,
  });
  // Moo Medium Postcard bleed area: 7.13" × 5.13" at 300dpi = 2140×1540 (viewport ×2)
  const context = await browser.newContext({ viewport: { width: 1070, height: 770 }, deviceScaleFactor: 2 });
  const page = await context.newPage();

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

  await page.waitForSelector('.robot-part', { state: 'attached' });
  await page.evaluate(() => {
    return Promise.all(
      Array.from(document.querySelectorAll('img')).map(img =>
        img.complete ? Promise.resolve() : new Promise(resolve => { img.onload = resolve; img.onerror = resolve; })
      )
    );
  });
  await page.waitForTimeout(2000);

  // Hide scrollbars + postcard style overrides
  await page.addStyleTag({ content: `
    html, body { overflow: hidden !important; }
    ::-webkit-scrollbar { display: none !important; }
    .title-card .fighter-name { font-size: 32px !important; }
  `});

  // Trigger blue punch, wait for it to land, then freeze everything
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(250);
  await page.addStyleTag({ content: `
    * { animation-play-state: paused !important; transition-duration: 0s !important; }
  `});

  // Set day counter
  await page.evaluate(() => {
    const dc = document.querySelector('.day-counter');
    if (dc) dc.textContent = 'Day ??';
  });

  // Hide elements
  await page.evaluate(() => {
    const el = document.querySelector('.what-is-this');
    if (el) el.style.display = 'none';
    // Hide title card, day counter, testimonials — just robots
    document.querySelector('.day-counter')?.setAttribute('style', 'display:none');
    document.querySelector('.title-card')?.setAttribute('style', 'display:none');
    const test = document.querySelector('.testimonials');
    if (test) test.style.display = 'none';
  });

  await page.waitForTimeout(200);

  await page.screenshot({ path: 'public/postcard.png' });
  console.log('Screenshot saved to public/postcard.png (2140x1540 — Moo medium bleed)');

  await browser.close();
})();
