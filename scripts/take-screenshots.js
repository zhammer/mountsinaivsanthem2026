const { chromium } = require('playwright');

const viewports = process.argv.length > 2
  ? process.argv.slice(2).map(arg => {
      const [name, w, h] = arg.split(':');
      return { name, width: parseInt(w), height: parseInt(h) };
    })
  : [
      { name: 'desktop-wide', width: 1536, height: 960 },
      { name: 'desktop-short', width: 1536, height: 500 },
      { name: 'desktop-narrow', width: 1100, height: 900 },
    ];

(async () => {
  const browser = await chromium.launch();

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `/tmp/screenshot-${vp.name}.png`, fullPage: false });
    await page.close();
    console.log(`Captured ${vp.name} (${vp.width}x${vp.height}) -> /tmp/screenshot-${vp.name}.png`);
  }

  await browser.close();
})();
