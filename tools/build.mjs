// Checks the story and writes js/story.js and the single-file Artifact copy:  node tools/build.mjs
// The story lives in story/*.json, one file per place. This merges them, then refuses to write anything if a
// choice points nowhere, a picture is missing, some page or ending can't be reached with the flags as played, some way
// through can never reach an ending, or a page that talks about an earlier meeting can be reached without it.
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

// Play every way through at once: a state is a page plus the flags picked up on the way there, and `ways` lists the
// states each one leads to. Pages in `avoid` are never turned to, which shows what can be reached without passing them.
function play(avoid = new Set()) {
  const reached = new Set(), ways = new Map([['start|', []]]);
  const queue = [['start', []]];
  while (queue.length) {
    const [at, had] = queue.shift();
    const p = byId.get(at);
    if (!p) continue;
    reached.add(at);
    const flags = p.flag && !had.includes(p.flag) ? [...had, p.flag].sort() : had;
    const out = ways.get(at + '|' + had.join(','));
    for (const c of p.choices || []) {
      if (avoid.has(c.to) || !list(c.requires).every(f => flags.includes(f)) || list(c.unless).some(f => flags.includes(f))) continue;
      const key = c.to + '|' + flags.join(',');
      out.push(key);
      if (!ways.has(key)) { ways.set(key, []); queue.push([c.to, flags]); }
    }
  }
  return { reached, ways };
}
const { reached, ways } = play();
for (const p of story) if (!reached.has(p.id)) problems.push(`${p.id} can't be reached from the start`);

// Nobody gets stuck: from every state the book can be in, with whatever has been picked up, some ending can still be
// reached. (A loop whose only ways out need something you can't be holding there would be a trap.)
const page = k => k.slice(0, k.indexOf('|'));
const canEnd = new Set([...ways.keys()].filter(k => byId.get(page(k))?.ending));
for (let grew = true; grew;) {
  grew = false;
  for (const [k, out] of ways) if (!canEnd.has(k) && out.some(o => canEnd.has(o))) { canEnd.add(k); grew = true; }
}
const stuck = [...ways.keys()].filter(k => byId.has(page(k)) && !canEnd.has(k));
if (stuck.length) problems.push(`${stuck.length} ways through can never reach an ending, on ${[...new Set(stuck.map(page))].slice(0, 6).join(', ')}`);

// Pages that talk as if you have already been somewhere: no way through may reach them without passing there first.
const AFTER = {
  x_count: ['x_quiz'], // Counting: Madame Purl offers "once more, from the top", and the choice is "Face her questions again"
};
for (const [id, before] of Object.entries(AFTER)) {
  if (play(new Set(before)).reached.has(id)) problems.push(`${id} can be reached without passing ${before.join(' or ')} first`);
}

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
