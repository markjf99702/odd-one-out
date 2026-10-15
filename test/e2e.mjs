// Reads the book in Chromium through the real page:  node test/e2e.mjs  (needs Playwright)
// tools/build.mjs already proves every page and ending can be reached; this proves the page plays them.
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright'); } catch { pw = require(join(execSync('npm root -g').toString().trim(), 'playwright')); }
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.json': 'application/json' };
const server = createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let body;
  try { body = await readFile(join(root, path === '/' ? 'index.html' : path)); } catch { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': TYPES[extname(path)] || 'text/html' });
  res.end(body);
}).listen(0);
const base = `http://localhost:${server.address().port}/`;

const browser = await pw.chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, reducedMotion: 'reduce' });
const page = await ctx.newPage();
const problems = [];
page.on('pageerror', e => problems.push(e.message));
page.on('console', m => { if (m.type() === 'error') problems.push(m.text()); });
page.on('requestfailed', r => problems.push('failed: ' + r.url()));
page.on('request', r => { if (!r.url().startsWith(base)) problems.push('left the site: ' + r.url()); });

await page.goto(base);
await page.evaluate(() => document.fonts.ready);
const story = await page.evaluate(() => ({ pages: window.STORY.length, endings: window.STORY.filter(p => p.ending).length }));

// The cover, then the first page.
assert.match(await page.textContent('.cover h1'), /Odd\s*One\s*Out/);
assert.equal(await page.isVisible('.cover .jd-foot'), true, 'the cover has no link back to the drawer');
assert.ok(await page.evaluate(() => document.fonts.check('800 1em Grandstander') && document.fonts.check('1em Literata')), 'the fonts did not load');
await page.click('[data-act=begin]');
assert.equal(await page.textContent('.ptitle'), 'The Buzzer');
assert.equal(await page.locator('.choices .choice').count(), 3);

// Back undoes a choice.
await page.click('.choices li:nth-child(1) button');
const second = await page.textContent('.ptitle');
assert.notEqual(second, 'The Buzzer');
await page.click('#backBtn');
assert.equal(await page.textContent('.ptitle'), 'The Buzzer');

// Read a few hundred random ways through. Every page needs a picture and a way on, and it never scrolls sideways.
const run = await page.evaluate(runs => {
  const q = s => document.querySelector(s), qa = s => document.querySelectorAll(s);
  const endings = new Set(), issues = new Set();
  for (let r = 0; r < runs; r++) {
    for (let i = 0; i < 150; i++) {
      const title = q('.ptitle').textContent;
      if (!q('.porthole svg')) issues.add('no picture: ' + title);
      if (document.documentElement.scrollWidth > innerWidth) issues.add('scrolls sideways: ' + title);
      const end = q('.ename');
      if (end) { endings.add(end.textContent); break; }
      const cs = qa('.choices .choice');
      if (!cs.length) { issues.add('dead end: ' + title); break; }
      cs[Math.floor(Math.random() * cs.length)].click();
    }
    q('#restartBtn').click();
  }
  return { endings: endings.size, issues: [...issues] };
}, 400);
assert.deepEqual(run.issues, []);
assert.ok(run.endings >= story.endings - 4, `only ${run.endings} of ${story.endings} endings turned up in 400 reads`);

// The Found panel lists what was found, and a reload offers to carry on.
await page.click('#lfBtn');
const claimed = await page.locator('.tag:not(.missing)').count();
assert.equal(claimed, run.endings, 'the Found panel disagrees about the endings found');
await page.click('#lfClose');
await page.click('.choices li:nth-child(1) button');
const where = await page.textContent('.ptitle');
await page.reload();
assert.equal(await page.textContent('[data-act=begin]'), 'Keep tumbling');
assert.match(await page.textContent('.cover .hint'), new RegExp(where.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
await page.click('[data-act=begin]');
assert.equal(await page.textContent('.ptitle'), where);

// Fits a phone in the dark palette too.
await page.emulateMedia({ colorScheme: 'dark' });
assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'the page scrolls sideways on a phone');

// Works offline once it has been opened.
await page.waitForFunction(() => navigator.serviceWorker?.controller, null, { timeout: 10000 }).catch(() => {});
await ctx.setOffline(true);
await page.reload();
assert.equal(await page.title(), 'Odd One Out', 'the page did not load offline');
assert.equal(await page.isVisible('[data-act=begin]'), true, 'the book did not open offline');
await ctx.setOffline(false);

// Installs to a phone's home screen: Chromium has no complaints about the manifest or the icons.
const cdp = await ctx.newCDPSession(page);
const { installabilityErrors } = await cdp.send('Page.getInstallabilityErrors');
assert.deepEqual(installabilityErrors, [], 'Chromium would not install it');
const manifest = await cdp.send('Page.getAppManifest');
assert.deepEqual(manifest.errors, [], 'the manifest has errors');

// The checks below each start a new reader with nothing saved, in a context of their own.
const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
async function reader(options = {}) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, reducedMotion: 'reduce', serviceWorkers: 'block', ...options });
  const p = await context.newPage();
  p.on('pageerror', e => problems.push(e.message));
  await p.goto(base);
  return p;
}
const turn = async (p, ...picks) => { for (const i of picks) await p.locator('.choices .choice').nth(i).click(); };

// On the cover Back is off, and Backspace leaves your place alone too.
{
  const p = await reader();
  await p.click('[data-act=begin]');
  await turn(p, 0, 0);
  const there = await p.textContent('.ptitle');
  await p.reload();
  await p.keyboard.press('Backspace');
  await p.keyboard.press('Backspace');
  assert.match(await p.textContent('.cover .hint'), new RegExp(escape(there)), 'Backspace on the cover moved your place');
  await p.click('[data-act=begin]');
  assert.equal(await p.textContent('.ptitle'), there);
  await p.context().close();
}

assert.deepEqual(problems.filter(p => !p.startsWith('failed:')), [], 'problems while reading it');
await browser.close();
server.close();
console.log(`all good: ${story.pages} pages, ${run.endings} of ${story.endings} endings reached in 400 random reads`);
