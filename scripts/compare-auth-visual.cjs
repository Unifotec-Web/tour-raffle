const { chromium } = require('playwright-core');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const originalUrl = process.env.ORIGINAL_URL || 'http://127.0.0.1:3001';
const currentUrl = process.env.CURRENT_URL || 'http://127.0.0.1:3000';
const outputDir = process.env.VISUAL_OUTPUT_DIR || '/tmp/tour-raffle-visual';
fs.mkdirSync(outputDir, { recursive: true });

async function capture(browser, name, url, route, width) {
  const context = await browser.newContext({ viewport: { width, height: width === 1440 ? 900 : 844 }, deviceScaleFactor: 1 });
  try {
    const page = await context.newPage();
    const response = await page.goto(`${url}/${route}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1500);
    const screenshot = path.join(outputDir, `${name}-${route}-${width}.png`);
    await page.screenshot({ path: screenshot, fullPage: true });
    const layout = await page.evaluate(() => ({
      size: { width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight },
      elements: [...document.querySelectorAll('h1,h2,form,input,select,button')].slice(0, 25).map((element) => {
        const rect = element.getBoundingClientRect();
        return { tag: element.tagName, x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) };
      }),
    }));
    return { status: response.status(), screenshot, layout };
  } finally {
    await context.close();
  }
}

async function comparePixels(aPath, bPath) {
  const [a, b] = await Promise.all([aPath, bPath].map((file) => sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true })));
  const pixels = Math.min(a.info.width, b.info.width) * Math.min(a.info.height, b.info.height);
  let changed = 0;
  for (let i = 0; i < pixels * 4; i += 4) {
    const delta = Math.abs(a.data[i] - b.data[i]) + Math.abs(a.data[i + 1] - b.data[i + 1]) + Math.abs(a.data[i + 2] - b.data[i + 2]);
    if (delta > 24) changed++;
  }
  return +(changed / pixels * 100).toFixed(2);
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined,
    args: ['--no-sandbox'],
  });
  try {
    for (const width of [1440, 390]) {
      for (const route of ['sign-in', 'sign-up']) {
        const original = await capture(browser, 'original', originalUrl, route, width);
        const current = await capture(browser, 'current', currentUrl, route, width);
        const result = {
          route, width,
          statuses: [original.status, current.status],
          sizes: [original.layout.size, current.layout.size],
          geometryEqual: JSON.stringify(original.layout.elements) === JSON.stringify(current.layout.elements),
          changedPixelPct: await comparePixels(original.screenshot, current.screenshot),
        };
        fs.writeFileSync(path.join(outputDir, `${route}-${width}.json`), JSON.stringify(result, null, 2));
        console.log(JSON.stringify(result));
        if (original.status !== 200 || current.status !== 200 || !result.geometryEqual) process.exitCode = 1;
      }
    }
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
