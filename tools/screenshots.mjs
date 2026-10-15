// Renders the README screenshots (docs/*.png) and the link preview (og.png):  node tools/screenshots.mjs
// Math.random is seeded, so the same pictures come out every time.
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

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
const SEED = 4;
const browser = await pw.chromium.launch();
await mkdir(join(root, 'docs'), { recursive: true });

async function open(viewport, deviceScaleFactor, colorScheme = 'light') {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor, hasTouch: true, serviceWorkers: 'block', colorScheme, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.addInitScript(seed => {
    let a = seed; // mulberry32
    Math.random = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }, SEED);
  await page.goto(base);
  await page.evaluate(() => document.fonts.ready);
  return page;
}

// Saves a reader who walked the shortest way from the buzzer to `to`, with a few endings already found,
// then reopens the book there.
async function arrive(page, to, found) {
  await page.evaluate(({ to, found }) => {
    const byId = Object.fromEntries(window.STORY.map(p => [p.id, p]));
    const prev = { start: null }, queue = ['start'];
    while (queue.length) {
      const at = queue.shift();
      if (at === to) break;
      for (const c of byId[at].choices || []) if (!(c.to in prev)) { prev[c.to] = at; queue.push(c.to); }
    }
    const path = [];
    for (let at = to; at; at = prev[at]) path.unshift(at);
    const hist = path.slice(0, -1).map(at => ({ at, flags: [] }));
    localStorage.setItem('odd-one-out.v1', JSON.stringify({ at: to, flags: [], hist, cycles: hist.length, found, seen: path, begun: true }));
  }, { to, found });
  await page.reload();
  await page.evaluate(() => document.fonts.ready);
  await page.click('[data-act=begin]');
  await page.mouse.move(0, 0); // or the pointer stays over whatever button lands under it, tinted and nudged by :hover
  await page.evaluate(() => scrollTo(0, 0));
}

// Phone screenshots for the README: the cover, a page of the story at night, and the true ending's care label.
{
  const page = await open({ width: 390, height: 844 }, 2);
  await page.screenshot({ path: join(root, 'docs/phone-cover.png') });
  await page.context().close();
}
{
  const page = await open({ width: 390, height: 844 }, 2, 'dark');
  await arrive(page, 'u_king', []);
  await page.screenshot({ path: join(root, 'docs/phone-page.png') });
  await page.context().close();
}
{
  const page = await open({ width: 390, height: 844 }, 2);
  await arrive(page, 'h_matched', ['d_end_doll', 'x_wedding', 'o_sea', 'h_end_rag']);
  await page.evaluate(() => document.querySelector('.story p:last-child').scrollIntoView({ block: 'start' }));
  await page.evaluate(() => scrollBy(0, -90));
  await page.screenshot({ path: join(root, 'docs/phone-ending.png') });
  await page.context().close();
}

// Link preview, 1200 x 630: a card with the name and one line on the left and the cover picture on the right,
// in the book's own palette and fonts.
{
  const page = await open({ width: 1200, height: 630 }, 1);
  const { cover, pages, endings } = await page.evaluate(() => ({ cover: window.SOCK_ART.title, pages: window.STORY.length, endings: window.STORY.filter(p => p.ending).length }));
  const font = async f => `data:font/woff2;base64,${(await readFile(join(root, 'fonts', f))).toString('base64')}`;
  await page.setContent(`<!doctype html><html><head><style>
    @font-face { font-family: Grandstander; src: url(${await font('grandstander.woff2')}); font-weight: 100 900; }
    @font-face { font-family: Literata; src: url(${await font('literata.woff2')}); font-weight: 200 900; }
    @font-face { font-family: "DM Mono"; src: url(${await font('dm-mono-500.woff2')}); font-weight: 500; }
    :root { --a-ink: #232637; --a-paper: #F4F1EA; --a-shade: #D6DCE2; --a-teal: #1F8E90; --a-mustard: #E6A92A;
      --a-red: #D4473A; --a-pim: #A797DA; --a-warm: #F6D58A; --a-cool: #8FB3CF; }
    html, body { margin: 0; width: 1200px; height: 630px; background: #E9EEF1; color: #232637; overflow: hidden; }
    .card { display: grid; grid-template-columns: 1fr 560px; align-items: center; gap: 56px; height: 100%; padding: 0 64px 0 72px; box-sizing: border-box; }
    .stripes { width: 92px; height: 34px; border-radius: 17px; border: 4px solid #232637; margin-bottom: 30px;
      background: repeating-linear-gradient(90deg, #177E80 0 15px, #D99A1B 15px 30px); }
    h1 { font: 800 112px/.92 Grandstander; margin: 0 0 30px; letter-spacing: -.01em; }
    h1 span { color: #177E80; }
    p { font: 400 33px/1.35 Literata; margin: 0 0 30px; max-width: 470px; }
    .specs { font: 500 21px/1 "DM Mono"; letter-spacing: .12em; text-transform: uppercase; color: #5C6274; }
    .porthole { border-radius: 52px; border: 7px solid #232637; background: #F4F1EA; overflow: hidden;
      box-shadow: 0 0 0 14px #F7F9FA, 0 0 0 18px #C9D1D8; }
    .porthole svg { display: block; width: 100%; height: auto; }
  </style></head><body><div class="card">
    <div><div class="stripes"></div><h1>Odd<br><span>One</span> Out</h1>
      <p>You are a sock lost in the dryer. Find your way back to your pair.</p>
      <div class="specs">${pages} pages · ${endings} endings</div></div>
    <div class="porthole">${cover}</div>
  </div></body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(root, 'og.png') });
  await page.context().close();
}

await browser.close();
server.close();
console.log('screenshots written');
