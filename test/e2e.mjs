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
// The installed app opens in the page's own light colour, so its bars don't flash from navy to light as it loads.
const light = (await readFile(join(root, 'index.html'), 'utf8')).match(/name="theme-color" content="([^"]+)" media="\(prefers-color-scheme: light\)"/)[1];
const webmanifest = JSON.parse(await readFile(join(root, 'manifest.webmanifest'), 'utf8'));
assert.deepEqual([webmanifest.theme_color, webmanifest.background_color], [light, light], 'the manifest colours differ from the page');

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

// A tumble that loops back to The Buzzer is still a tumble: after a reload the cover offers to keep tumbling or start
// over, and only starting over gives a fresh cover.
{
  const p = await reader();
  await p.click('[data-act=begin]');
  await turn(p, 1, 0, 0, 2); // the lint, the Lint Trap, through it, and back through the soft fold to The Buzzer
  assert.equal(await p.textContent('.ptitle'), 'The Buzzer');
  await p.reload();
  assert.equal(await p.textContent('[data-act=begin]'), 'Keep tumbling', 'a reader who looped back to The Buzzer was offered Begin');
  assert.match(await p.textContent('.cover .hint'), /The Buzzer/);
  await p.click('[data-act=begin]');
  assert.match(await p.textContent('.where'), /Cycle 5(?!\d)/, 'Keep tumbling lost the tumble');
  await p.reload();
  await p.click('[data-act=fresh]');
  assert.match(await p.textContent('.where'), /Cycle 1(?!\d)/, 'Start over did not start over');
  assert.equal(await p.isDisabled('#backBtn'), true, 'Start over left Back on');
  await p.reload();
  assert.equal(await p.textContent('[data-act=begin]'), 'Begin', 'a reader who started over was offered their old tumble');
  await p.context().close();
}

// A save whose fields have the wrong types (a damaged or hand-edited copy) still opens, and keeps what makes sense:
// each field falls back on its own, and only endings in the book count.
{
  const good = { at: 'd_vernon', flags: [], hist: [{ at: 'start', flags: [] }, { at: 'd_call_out', flags: [] }], cycles: 2, found: ['h_end_rag'], seen: ['start', 'd_call_out', 'd_vernon'] };
  const damaged = [
    { seen: null }, { seen: {} }, { hist: null }, { flags: null }, { hist: [null, 7, { at: 'start' }, { at: 'no_such_page', flags: [] }] },
    { found: 'h_end_rag' }, { found: ['h_end_rag', 'no_such_page', 'd_vernon', 'h_end_rag'] }, { cycles: 'two' },
  ];
  for (const bad of damaged) {
    const p = await reader();
    const errors = [];
    p.on('pageerror', e => errors.push(e.message));
    await p.evaluate(v => localStorage.setItem('odd-one-out.v1', JSON.stringify(v)), { ...good, ...bad });
    await p.reload();
    const what = JSON.stringify(bad);
    const found = Array.isArray(bad.found) || !('found' in bad) ? 1 : 0;
    assert.match(await p.textContent('#foot'), new RegExp(`^${found} of ${story.endings} endings found`), `${what}: wrong count`);
    await p.click('[data-act=begin]');
    assert.equal(await p.textContent('.ptitle', { timeout: 5000 }).catch(() => null), 'The Gossip', `${what}: Keep tumbling did not open the page`);
    if (!('hist' in bad)) assert.match(await p.textContent('.where'), /Cycle 3(?!\d)/, `${what}: wrong cycle`);
    await turn(p, 0);
    assert.notEqual(await p.textContent('.ptitle'), 'The Gossip', `${what}: a choice did nothing`);
    await p.click('#backBtn');
    assert.equal(await p.textContent('.ptitle'), 'The Gossip', `${what}: Back did nothing`);
    await p.click('#lfBtn');
    assert.equal(await p.locator('.tag:not(.missing)').count(), found, `${what}: the Found panel did not open or miscounted`);
    assert.deepEqual(errors, [], `${what}: errors`);
    await p.context().close();
  }
}

// "Forget my endings" asks twice, and closing the panel takes the question back. After a wipe the counts under the
// page and on the care label say so straight away.
const saved = p => p.evaluate(() => JSON.parse(localStorage.getItem('odd-one-out.v1')));
{
  const p = await reader();
  await p.click('[data-act=begin]');
  await turn(p, 0, 1, 0, 0); // Lady-in-Waiting, an ending
  assert.match(await p.textContent('#foot'), new RegExp(`^1 of ${story.endings} endings found`));
  await p.click('#lfBtn');
  await p.click('#wipeBtn');
  await p.click('#lfClose');
  await p.click('#lfBtn');
  assert.equal(await p.textContent('#wipeBtn'), 'Forget my endings', 'Forget my endings was still armed after the panel closed');
  await p.click('#wipeBtn');
  assert.deepEqual((await saved(p)).found, ['d_end_lady'], 'one tap forgot the endings');
  await p.click('#wipeBtn');
  assert.deepEqual((await saved(p)).found, [], 'two taps did not forget the endings');
  await p.click('#lfClose');
  assert.match(await p.textContent('#foot'), new RegExp(`^0 of ${story.endings} endings found`), 'the line under the page still counts the forgotten endings');
  assert.equal(await p.textContent('.label .kicker span:last-child'), '0 found', 'the care label still counts the forgotten endings');
  assert.match(await p.textContent('.label .fine'), new RegExp(`Visited 1 of ${story.pages} `), 'the care label still counts the forgotten pages');
  await p.context().close();
}

// Two copies open at once (two tabs, or the installed app and a tab) share one save: a page turn in one keeps the
// endings the other found, and Forget my endings in one sticks in the other.
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, reducedMotion: 'reduce', serviceWorkers: 'block' });
  const a = await context.newPage(), b = await context.newPage();
  for (const p of [a, b]) p.on('pageerror', e => problems.push(e.message));
  // b can be made to miss the news from a, like a copy asleep in the background.
  await b.addInitScript(() => {
    const listen = window.addEventListener;
    window.addEventListener = function (type, fn, options) {
      return listen.call(this || window, type, type === 'storage' ? e => { if (!window.asleep) fn(e); } : fn, options);
    };
  });
  await a.goto(base); await b.goto(base);
  await a.click('[data-act=begin]'); await b.click('[data-act=begin]');
  const shows = (p, n) => p.waitForFunction(n => document.getElementById('foot').textContent.startsWith(n + ' of'), n, { timeout: 5000 }).then(() => true, () => false);
  const forget = async p => { await p.click('#lfBtn'); await p.click('#wipeBtn'); await p.click('#wipeBtn'); await p.click('#lfClose'); };

  await turn(a, 0, 1, 0, 0); // Lady-in-Waiting
  await turn(b, 0);
  assert.deepEqual((await saved(b)).found, ['d_end_lady'], 'a page turn in one copy wiped the ending found in the other');
  assert.ok(await shows(b, 1), 'the other copy does not count the ending');

  await forget(a);
  assert.ok(await shows(b, 0), 'the other copy still counts the forgotten ending');
  await turn(b, 0);
  assert.deepEqual((await saved(b)).found, [], 'a page turn in the other copy brought the forgotten ending back');

  await b.evaluate(() => { window.asleep = true; });
  await a.click('[data-act=restart]');
  await turn(a, 0, 1, 0, 0);
  await turn(b, 2);
  assert.deepEqual((await saved(b)).found, ['d_end_lady'], 'a copy that was asleep wiped the ending found in the other');
  await forget(a);
  await turn(b, 0);
  assert.deepEqual((await saved(b)).found, [], 'a copy that was asleep brought the forgotten ending back');
  await context.close();
}

// The Found panel keeps the keyboard inside it, and closing it puts focus back on Found.
{
  const p = await reader({ hasTouch: false });
  await p.click('[data-act=begin]');
  await p.focus('#lfBtn');
  await p.keyboard.press('Enter');
  const inside = () => p.evaluate(() => document.activeElement === document.body || document.getElementById('lf').contains(document.activeElement));
  for (let i = 0; i < 8; i++) {
    await p.keyboard.press('Tab');
    assert.ok(await inside(), 'Tab left the Found panel for the page behind it');
  }
  await p.focus('#lfClose');
  await p.keyboard.press('Enter');
  assert.equal(await p.evaluate(() => document.activeElement.id), 'lfBtn', 'closing Found did not put focus back on Found');
  await p.keyboard.press('Enter');
  await p.keyboard.press('Escape');
  assert.equal(await p.evaluate(() => document.activeElement.id), 'lfBtn', 'Escape did not put focus back on Found');
  await p.context().close();
}

// On a wide screen the cover for a returning reader is as wide as the bar, like the first one.
{
  const p = await reader({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1, hasTouch: false });
  await p.click('[data-act=begin]');
  await turn(p, 0);
  await p.reload();
  const [main, bar] = await p.evaluate(() => [document.getElementById('page'), document.querySelector('.bar')].map(e => e.getBoundingClientRect().width));
  assert.equal(main, bar, 'the returning cover is narrower than the bar');
  assert.equal(await p.innerText('[data-act=size]'), 'Aa', 'the text size button does not read Aa');
  const offCentre = await p.evaluate(() => {
    const b = document.querySelector('[data-act=fresh]'), r = document.createRange();
    r.selectNodeContents(b);
    const text = r.getBoundingClientRect(), box = b.getBoundingClientRect();
    return Math.abs((text.left - box.left) - (box.right - text.right));
  });
  assert.ok(offCentre < 2, 'Start over from the buzzer is not centred under Keep tumbling');
  await p.context().close();
}

// On the narrowest phones (280 wide, a Galaxy Fold's cover screen) Start over from the buzzer wraps, and each line
// stays centred.
{
  const p = await reader({ viewport: { width: 280, height: 653 } });
  await p.click('[data-act=begin]');
  await turn(p, 0);
  await p.reload();
  const lines = await p.evaluate(() => {
    const b = document.querySelector('[data-act=fresh]'), r = document.createRange();
    r.selectNodeContents(b);
    const box = b.getBoundingClientRect();
    return [...r.getClientRects()].map(t => Math.abs((t.left - box.left) - (box.right - t.right)));
  });
  assert.ok(lines.every(d => d < 2), `Start over from the buzzer is off centre by ${lines.map(Math.round).join(' and ')}px when it wraps`);
  await p.context().close();
}

// Holding a number key down turns one page, not one for every repeat.
{
  const p = await reader({ hasTouch: false });
  await p.click('[data-act=begin]');
  for (let i = 0; i < 6; i++) await p.keyboard.down('1');
  await p.keyboard.up('1');
  assert.match(await p.textContent('.where'), /Cycle 2(?!\d)/, 'a held number key turned more than one page');
  await p.context().close();
}

// Sound plays a different ambience in each place, as the cover says: turned on in each of the seven, it sets up
// seven different sets of sounds (the filters and tones it makes at once, by their frequencies).
{
  const p = await reader();
  const places = await p.evaluate(() => [...new Set(window.STORY.map(s => s.id[0]))].filter(k => k !== 's').map(k => window.STORY.find(s => s.id[0] === k).id));
  assert.equal(places.length, 7, 'the book no longer has seven places');
  const heard = {};
  for (const at of places) {
    await p.evaluate(at => localStorage.setItem('odd-one-out.v1', JSON.stringify({ at, hist: [{ at: 'start', flags: [] }] })), at);
    await p.reload();
    await p.click('[data-act=begin]');
    heard[at] = await p.evaluate(() => {
      const made = [];
      for (const name of ['createBiquadFilter', 'createOscillator']) {
        const make = AudioContext.prototype[name];
        AudioContext.prototype[name] = function () { const n = make.apply(this, arguments); made.push(n); return n; };
      }
      document.querySelector('[data-act=sound]').click();
      return made.map(n => n.type + ' ' + Math.round(n.frequency.value * 100) / 100).join(', ');
    });
    assert.ok(heard[at], `Sound set up nothing on ${at}`);
  }
  assert.equal(new Set(Object.values(heard)).size, places.length, 'two places share an ambience: ' + JSON.stringify(heard));
  await p.context().close();
}

// Scrolled to the end, the Found panel's last line clears a phone's home indicator.
{
  const p = await reader();
  const cdp = await p.context().newCDPSession(p);
  const inset = 34; // an iPhone's home indicator
  if (await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: { top: 47, bottom: inset } }).then(() => true, () => false)) {
    await p.click('[data-act=begin]');
    await p.click('#lfBtn');
    const gap = await p.evaluate(() => { const lf = document.getElementById('lf'); lf.scrollTop = lf.scrollHeight; return innerHeight - lf.querySelector('.jd-foot').getBoundingClientRect().bottom; });
    assert.ok(gap > inset, `the Found panel's last line ends ${gap}px from the bottom, behind the home indicator`);
  } else console.log('note: this Chromium cannot pretend to be a phone with a home indicator, so the Found panel went unchecked');
  await p.context().close();
}

// The small coloured words, an ending's kind (on its care label and in Found) and the place's name above a page, read
// at 4.5:1 against what's behind them, in both palettes.
for (const colorScheme of ['light', 'dark']) {
  const p = await reader({ colorScheme });
  await p.evaluate(() => {
    const first = {}; // the first ending of each kind
    for (const s of window.STORY) if (s.ending && !first[s.ending.kind]) first[s.ending.kind] = s.id;
    localStorage.setItem('odd-one-out.v1', JSON.stringify({ at: first.weird, hist: [{ at: 'start', flags: [] }], found: Object.values(first) }));
  });
  await p.reload();
  await p.click('[data-act=begin]');
  await p.click('#lfBtn');
  const words = await p.evaluate(() => {
    const rgb = s => s.match(/[\d.]+/g).map(Number);
    const lum = c => c.slice(0, 3).map(v => ((v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)).reduce((n, v, i) => n + v * [0.2126, 0.7152, 0.0722][i], 0);
    const behind = el => { for (; el; el = el.parentElement) { const c = rgb(getComputedStyle(el).backgroundColor); if (c.length === 3 || c[3] === 1) return c; } return [255, 255, 255]; };
    const ratio = el => { const [a, b] = [lum(rgb(getComputedStyle(el).color)), lum(behind(el))].sort((x, y) => y - x); return (a + 0.05) / (b + 0.05); };
    return [...document.querySelectorAll('.where b, .label .kind, .tag .k[class*="kind-"]')].map(el => [el.textContent, Math.round(ratio(el) * 100) / 100]);
  });
  assert.equal(words.length, 6, `${colorScheme}: expected the place, the care label's kind and four kinds in Found, got ${JSON.stringify(words)}`);
  for (const [text, ratio] of words) assert.ok(ratio >= 4.5, `${colorScheme}: "${text}" reads at only ${ratio}:1`);
  await p.context().close();
}

// The pills (Sound, Narrate, Aa) and the small buttons (Back, Found, Close, Copy my ending, and Found's two at the
// bottom, which wrap onto two lines once Forget my endings asks again) take a tap at least 44px tall, though they look
// as they did, and no two of those taps overlap.
{
  const taps = p => p.evaluate(() => {
    const area = b => { // the box a tap lands in: the button's own, or the invisible margin round it
      const r = b.getBoundingClientRect(), s = getComputedStyle(b), m = getComputedStyle(b, '::after'), n = parseFloat;
      return m.position !== 'absolute' ? r : { top: r.top + n(s.borderTopWidth) + n(m.top), bottom: r.bottom - n(s.borderBottomWidth) - n(m.bottom), left: r.left + n(s.borderLeftWidth) + n(m.left), right: r.right - n(s.borderRightWidth) - n(m.right) };
    };
    scrollTo(0, 0); document.getElementById('lf').scrollTop = 0; // so nothing on the page sits under the bar
    const shown = [...document.querySelectorAll('.pill, .tbtn')].filter(b => b.getClientRects().length && !b.closest('[inert]'));
    const areas = shown.map(area), overlaps = [];
    areas.forEach((a, i) => areas.slice(i + 1).forEach((o, j) => { if (a.left < o.right && o.left < a.right && a.top < o.bottom && o.top < a.bottom) overlaps.push(shown[i].textContent + ' and ' + shown[i + 1 + j].textContent); }));
    return { overlaps, taps: shown.map(b => { // and the page agrees: a tap just inside the top or the bottom of that box finds the button
      b.scrollIntoView({ block: 'center' });
      const a = area(b);
      return { name: b.textContent, height: Math.round((a.bottom - a.top) * 10) / 10, lands: [a.top + 0.5, a.bottom - 0.5].every(y => document.elementFromPoint((a.left + a.right) / 2, y)?.closest('button') === b) };
    }) };
  });
  const check = async (p, where, expect) => {
    const { overlaps, taps: found } = await taps(p);
    assert.deepEqual(found.map(t => t.name).sort(), expect.sort(), `${where}: not the buttons expected`);
    for (const t of found) {
      assert.ok(t.height >= 44, `${where}: ${t.name} takes a tap only ${t.height}px tall`);
      assert.ok(t.lands, `${where}: a tap at the edge of ${t.name}'s area misses it`);
    }
    assert.deepEqual(overlaps, [], `${where}: taps overlap`);
  };
  const p = await reader();
  await p.click('[data-act=begin]');
  await turn(p, 0);
  await check(p, 'a page', ['Back', 'Found', 'Sound', 'Narrate', 'Aa']);
  await turn(p, 1, 0, 0); // Lady-in-Waiting, an ending
  await check(p, 'an ending', ['Back', 'Found', 'Sound', 'Narrate', 'Aa', 'Copy my ending']);
  await p.click('#lfBtn');
  await p.click('#wipeBtn');
  assert.ok(await p.evaluate(() => document.getElementById('wipeBtn').offsetTop > document.getElementById('restartBtn').offsetTop), "Found's buttons no longer wrap, so this checks less than it says");
  await check(p, 'Found', ['Close', 'Start a new tumble', 'Tap again to forget']);
  await p.context().close();
}

assert.deepEqual(problems.filter(p => !p.startsWith('failed:')), [], 'problems while reading it');
await browser.close();
server.close();
console.log(`all good: ${story.pages} pages, ${run.endings} of ${story.endings} endings reached in 400 random reads`);
