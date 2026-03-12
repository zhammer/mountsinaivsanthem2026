#!/usr/bin/env node
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: false,
  });
  const context = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2 });
  const page = await context.newPage();

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

  // Wait for robot images to actually load
  await page.waitForSelector('.robot-part', { state: 'attached' });
  await page.evaluate(() => {
    return Promise.all(
      Array.from(document.querySelectorAll('img')).map(img =>
        img.complete ? Promise.resolve() : new Promise(resolve => { img.onload = resolve; img.onerror = resolve; })
      )
    );
  });
  await page.waitForTimeout(2000);

  // Hide scrollbars
  await page.addStyleTag({ content: `
    html, body { overflow: hidden !important; }
    ::-webkit-scrollbar { display: none !important; }
  `});

  // Debug: check what's visible
  const hasRobots = await page.evaluate(() => {
    const parts = document.querySelectorAll('.robot-part');
    return { count: parts.length, firstSrc: parts[0]?.src || 'none' };
  });
  console.log('Robot parts:', hasRobots);

  // Set day counter to current day
  await page.evaluate(() => {
    const dc = document.querySelector('.day-counter');
    if (dc) {
      const day = Math.floor((Date.now() - new Date('2026-01-01').getTime()) / 86400000) + 1;
      dc.textContent = 'Day ' + day;
    }
  });

  // Hide "what is this website"
  await page.evaluate(() => {
    const el = document.querySelector('.what-is-this');
    if (el) el.style.display = 'none';
  });

  // Trigger a punch (right arrow = blue punches)
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(300);

  // Add testimonial cards below the arena
  await page.evaluate(() => {
    let container = document.querySelector('.testimonials');
    if (!container) {
      container = document.createElement('div');
      container.className = 'testimonials';
      // Insert after .arena
      const arena = document.querySelector('.arena');
      arena.parentNode.insertBefore(container, arena.nextSibling);
    }

    const testimonials = [
      "im sad I may lose my doctor who saved my life",
      "Same. I have a very complex illness that requires specialized care and Mount Sinai is the only hospital in the country that offers a treatment I need. I'm not even sure what I am going to do, not like I can just go somewhere else",
    ];

    container.innerHTML = '';
    testimonials.forEach(msg => {
      const card = document.createElement('div');
      card.className = 'testimonial-card';
      card.innerHTML = `<p><span class="quote-mark">\u201C</span>${msg}<span class="quote-mark">\u201D</span></p>`;
      container.appendChild(card);
    });
  });

  await page.waitForTimeout(500);

  await page.screenshot({ path: 'public/og-image-2x.png' });
  console.log('Retina screenshot saved to public/og-image-2x.png');

  await browser.close();

  // Downscale 2x retina image to 1200x630 using macOS sips
  const { execSync } = require('child_process');
  execSync('sips --resampleWidth 1200 public/og-image-2x.png --out public/og-image.png');
  execSync('rm public/og-image-2x.png');
  console.log('Downscaled to 1200x630 → public/og-image.png');
})();
