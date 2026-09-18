/* Run: PLAYWRIGHT_MODULE=/path/to/playwright-core node restaurant-showcase-v2/verify-browser.cjs
   Optional CHROMIUM_PATH=/path/to/chromium. Starts a loopback-only server; writes QA here. */
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const root = __dirname;
const port = Number(process.env.PORT || 8877);
const report = { status: 'RUNNING', results: [], errors: [] };
const record = label => report.results.push(label);
let server, browser;
(async () => {
  const pw = require(process.env.PLAYWRIGHT_MODULE || '/private/tmp/restaurant-showcase-browser/node_modules/playwright-core');
  server = http.createServer((req, res) => {
    const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404).end(); return; }
      const types = {'.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.svg':'image/svg+xml', '.webp':'image/webp'};
      res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
      res.end(data);
    });
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  record(`Local HTTP server bound to 127.0.0.1:${port}`);
  const localChrome = '/Users/tusharsehwag/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
  browser = await pw.chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || (fs.existsSync(localChrome) ? localChrome : undefined) });
  const pages = ['index', 'quiet-editorial', 'night-market', 'garden-table'];
  const screenshotDir = path.join(root, 'screenshots');
  fs.mkdirSync(screenshotDir, { recursive: true });
  for (const width of [1440, 375]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    page.on('requestfailed', request => errors.push(request.failure()?.errorText));
    for (const name of pages) {
      await page.goto(`http://127.0.0.1:${port}/${name}.html`);
      await page.evaluate(() => Promise.all([...document.images].map(i => i.decode())));
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name}: overflow at ${width}`);
      // Real keyboard focus, not just a class/style existence check.
      await page.keyboard.press('Tab');
      const focus = await page.evaluate(() => ({ visible: document.activeElement.matches(':focus-visible'), style: getComputedStyle(document.activeElement).outlineStyle }));
      assert(focus.visible && focus.style !== 'none', `${name}: keyboard focus is visible`);
      await page.keyboard.press('Enter');
      for (const link of await page.locator('a[href$=".html"]').all()) {
        const href = await link.getAttribute('href');
        assert.equal((await page.request.get(`http://127.0.0.1:${port}/${href}`)).status(), 200);
      }
      if (name === 'index') {
        for (const concept of pages.slice(1)) {
          await page.locator(`.concept-card[href="${concept}.html"]`).click();
          assert(page.url().endsWith(`${concept}.html`));
          await page.goBack();
        }
      } else {
        await page.evaluate(() => scrollTo(0, 0));
        for (const link of await page.locator('.tasks a').all()) {
          const box = await link.boundingBox();
          assert(box.height >= 44 && box.width >= 44);
          if (width === 375) assert(box.y + box.height < 850, `${name}: essentials fit first viewport`);
        }
        for (const target of ['menu', 'hours', 'phone', 'address']) {
          await page.locator(`.tasks a[href="#${target}"]`).click();
          assert.equal(new URL(page.url()).hash, `#${target}`);
          await page.waitForFunction(id => {const r=document.getElementById(id).getBoundingClientRect();return r.top>=0 && r.top<innerHeight;}, target);
        }
        // All request controls: keyboard open, initial focus, focus trap, Escape,
        // explicit close, backdrop dismissal, and restoration to their own trigger.
        for (const link of await page.locator('[data-request]').all()) {
          await link.focus(); await page.keyboard.press('Enter');
          assert(await page.locator('dialog').isVisible());
          assert(await page.locator('dialog .close').evaluate(e => e === document.activeElement));
          await page.keyboard.press('Tab');
          assert(await page.evaluate(() => document.querySelector('dialog').contains(document.activeElement) || document.activeElement === document.body));
          await page.keyboard.press('Escape');
          await page.waitForFunction(() => !document.querySelector('dialog').open);
          const requestName = await link.getAttribute('data-request');
          await page.waitForFunction(name => document.activeElement?.dataset.request === name, requestName);
          assert(await link.evaluate(e => e === document.activeElement));
          await link.click(); await page.locator('dialog .close').click();
          assert(!await page.locator('dialog').isVisible());
          await link.click(); await page.mouse.click(2, 2);
          assert(!await page.locator('dialog').isVisible());
        }
        for (const details of await page.locator('details').all()) {
          const before = await details.evaluate(e => e.open);
          await details.locator('summary').press('Enter');
          assert.equal(await details.evaluate(e => e.open), !before);
          await details.locator('summary').press('Space');
          assert.equal(await details.evaluate(e => e.open), before);
        }
        if (name === 'night-market') {
          for (const [filter, count] of [['plates',3],['sips',1],['all',4]]) {
            const button=page.locator(`[data-filter="${filter}"]`);
            await button.click();
            assert.equal(await page.locator('[data-category]:visible').count(),count);
            assert.equal(await button.getAttribute('aria-pressed'),'true');
          }
        }
      }
      await page.emulateMedia({ reducedMotion: 'reduce' });
      assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
      assert(await page.evaluate(() => [...document.querySelectorAll('*')].every(e => getComputedStyle(e).animationName === 'none' && getComputedStyle(e).transitionDuration.split(',').every(t => parseFloat(t) === 0))));
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.evaluate(() => {document.activeElement.blur();scrollTo({top:0,behavior:'instant'});});
      await page.screenshot({ path: path.join(screenshotDir, `${name}-${width}.png`), fullPage: true });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      record(`${name} at ${width}px: links, keyboard focus, controls, reduced motion, image loading, overflow and screenshot PASS`);
    }
    assert.deepEqual(errors, []);
    await context.close();
  }
  const noJS = await browser.newContext({javaScriptEnabled:false,viewport:{width:375,height:900}});
  for (const name of pages.slice(1)) {
    const page = await noJS.newPage();
    await page.goto(`http://127.0.0.1:${port}/${name}.html`);
    await page.locator('[data-request]').first().click();
    assert.equal(new URL(page.url()).hash,'#requests');
    if (name==='night-market') assert.equal(await page.locator('[data-category]:visible').count(),4);
    if (name==='garden-table') {await page.locator('summary').nth(1).press('Enter');assert(await page.locator('details').nth(1).evaluate(e=>e.open));}
    await page.close();
  }
  await noJS.close(); record('JavaScript-disabled request fallback and menus PASS');
  report.status = 'PASS';
})().catch(error => { report.status = 'BLOCKED_OR_FAILED'; report.errors.push(error.stack); process.exitCode = 1; }).finally(async () => {
  if (browser) await browser.close();
  if (server?.listening) await new Promise(resolve => server.close(resolve));
  fs.writeFileSync(path.join(root, 'browser-results.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
});
