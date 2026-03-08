---
name: screenshot
description: Take screenshots of the site using a headless browser. Use when you need to see what the page looks like — checking layout, verifying changes, testing responsive design, or any time visual feedback would help.
---

# Screenshot Tool

Take screenshots of the local dev server using Playwright's headless Chromium.

## Usage

Write and run a Node.js script using Playwright to capture screenshots, then view them with the Read tool.

### Quick Single Screenshot

```javascript
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1536, height: 960 } });
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/tmp/screenshot.png', fullPage: false });
  await browser.close();
  console.log('Done');
})();
```

### Multiple Viewports

```javascript
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const viewports = [
    { name: 'desktop-wide', width: 1536, height: 960 },
    { name: 'desktop-narrow', width: 1100, height: 900 },
    { name: 'desktop-short', width: 1536, height: 500 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 375, height: 812 },
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `/tmp/screenshot-${vp.name}.png`, fullPage: false });
    await page.close();
    console.log(`Captured ${vp.name} (${vp.width}x${vp.height})`);
  }
  await browser.close();
})();
```

### Steps

1. Check which port the dev server is running on: `lsof -iTCP -sTCP:LISTEN -P | grep -E '(5173|8080)'`
2. For default viewports, run: `node scripts/take-screenshots.js`
3. For custom viewports: `node scripts/take-screenshots.js name1:1536:500 name2:375:812`
4. View screenshots using the Read tool: `Read /tmp/screenshot-desktop-wide.png`

For more complex scenarios (interactions, waiting for elements), write a custom script to `/tmp/take-screenshots.js` and run from the project directory.

### Waiting for Content

- `await page.waitForTimeout(ms)` — wait a fixed time (e.g. for animations)
- `await page.waitForSelector('.testimonial-card')` — wait for an element
- `await page.keyboard.press('Space')` — trigger interactions
- `await page.click('.robot-wrap.red')` — click elements

### Full Page Screenshots

Use `fullPage: true` to capture content below the fold (testimonials, etc.):
```javascript
await page.screenshot({ path: '/tmp/screenshot-full.png', fullPage: true });
```
