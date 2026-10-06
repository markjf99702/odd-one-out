// Checks the story and writes js/story.js and the single-file Artifact copy:  node tools/build.mjs
// The story lives in story/*.json, one file per place. This merges them, then refuses to write anything if a
// choice points nowhere, a picture is missing, or some page or ending can't be reached with the flags as played.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const REGIONS = ['drum', 'under', 'house', 'outside', 'odd', 'washer', 'junk'];
const read = f => readFile(join(root, f), 'utf8');

const story = [];
for (const r of REGIONS) story.push(...JSON.parse(await read(`story/${r}.json`)));

const sandbox = { window: {} };
vm.runInNewContext(await read('js/art.js'), sandbox);
const art = new Set(Object.keys(sandbox.window.SOCK_ART || {}));

const problems = [], notes = [];
const byId = new Map();
for (const p of story) {
  if (byId.has(p.id)) problems.push(`two pages are called ${p.id}`);
  byId.set(p.id, p);
}
const list = v => (v == null ? [] : [].concat(v));
const endingNames = new Map();
for (const p of story) {
  if (!art.has(p.art)) problems.push(`${p.id}: no picture called ${p.art}`);
  for (const c of p.choices || []) if (!byId.has(c.to)) problems.push(`${p.id}: "${c.label}" goes to ${c.to}, which doesn't exist`);
  if (p.ending) {
    if (endingNames.has(p.ending.name)) problems.push(`two endings are called ${p.ending.name}`);
    endingNames.set(p.ending.name, p.id);
    if (!['good', 'bittersweet', 'bad', 'weird'].includes(p.ending.kind)) problems.push(`${p.id}: unknown ending kind ${p.ending.kind}`);
  } else {
    if (!(p.choices || []).length) problems.push(`${p.id}: a dead end that isn't an ending`);
    else if (!p.choices.some(c => !list(c.requires).length)) problems.push(`${p.id}: every choice needs a flag`);
  }
  const words = p.text.split(/\s+/).filter(Boolean).length;
  if (words < 60 || words > 230) notes.push(`${p.id}: ${words} words`);
  if (/[–—]/.test(p.text + (p.choices || []).map(c => c.label).join(''))) notes.push(`${p.id}: has a dash`);
  for (const c of p.choices || []) if (c.label.length > 45) notes.push(`${p.id}: long label "${c.label}"`);
}

// Play every way through at once: a state is a page plus the flags picked up on the way there.
const seen = new Set(), reached = new Map();
const queue = [['start', []]];
while (queue.length) {
  const [at, had] = queue.shift();
  const p = byId.get(at);
  if (!p) continue;
  if (!reached.has(at)) reached.set(at, had.length);
  const flags = p.flag && !had.includes(p.flag) ? [...had, p.flag].sort() : had;
  for (const c of p.choices || []) {
    if (!list(c.requires).every(f => flags.includes(f)) || list(c.unless).some(f => flags.includes(f))) continue;
    const key = c.to + '|' + flags.join(',');
    if (!seen.has(key)) { seen.add(key); queue.push([c.to, flags]); }
  }
}
for (const p of story) if (!reached.has(p.id)) problems.push(`${p.id} can't be reached from the start`);

const endings = story.filter(p => p.ending);
const words = story.reduce((n, p) => n + p.text.split(/\s+/).filter(Boolean).length, 0);
console.log(`${story.length} pages, ${endings.length} endings, ${words} words, ${art.size} pictures`);
for (const n of notes) console.log('note:', n);
if (problems.length) {
  for (const p of problems) console.log('PROBLEM:', p);
  process.exit(1);
}

// js/story.js: one page per line, so a change to the story shows up as a small diff.
await writeFile(join(root, 'js/story.js'),
  '// Built by tools/build.mjs from story/*.json. Edit those files, then run: node tools/build.mjs\n' +
  'window.STORY = [\n' + story.map(p => JSON.stringify(p)).join(',\n') + '\n];\n');

// dist/artifact.html: the playable single-file copy for the Artifact viewer. The viewer wraps it in its own
// document and page reset, so it drops the <head>, the site-only CSS and the font files (inlined instead).
const css = (await read('css/app.css')).replace(/\/\* site-only:[\s\S]*?\/\* end site-only \*\/\n?/, '');
let inlined = css;
for (const [, file] of css.matchAll(/url\(\.\.\/fonts\/([\w-]+\.woff2)\)/g)) {
  const b64 = (await readFile(join(root, 'fonts', file))).toString('base64');
  inlined = inlined.replace(`url(../fonts/${file})`, `url(data:font/woff2;base64,${b64})`);
}
const html = await read('index.html');
const body = html.split('<body>')[1].split('<noscript>')[0].trim();
const script = async f => '<script>\n' + (await read(f)).replace(/<\/script/gi, '<\\/script') + '\n</script>';
const scripts = (await Promise.all(['js/sound.js', 'js/art.js', 'js/story.js', 'js/app.js'].map(script))).join('\n');
await mkdir(join(root, 'dist'), { recursive: true });
await writeFile(join(root, 'dist/artifact.html'), `<title>Odd One Out</title>\n<style>\n${inlined}</style>\n\n${body}\n\n${scripts}\n`);
console.log('wrote js/story.js and dist/artifact.html');
