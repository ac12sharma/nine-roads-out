// Builds the site into a temporary folder and checks the output: every internal link, image and
// script resolves, every #fragment exists on its page, the sitemap matches the pages, and the
// bundled app.js is a valid classic script.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let out = '';
/** @type {Map<string, string>} page path (e.g. "/glendalough/") -> HTML */
const pages = new Map();

before(() => {
  out = fs.mkdtempSync(path.join(os.tmpdir(), 'nro-build-'));
  execFileSync(process.execPath, [path.join(root, 'src/build.mjs'), '--out', out], { cwd: root, stdio: 'pipe' });
  const walk = (/** @type {string} */ dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const f = path.join(dir, e.name);
      if (e.isDirectory()) walk(f);
      else if (e.name.endsWith('.html')) pages.set('/' + path.relative(out, f).replace(/index\.html$/, '').split(path.sep).join('/'), fs.readFileSync(f, 'utf8'));
    }
  };
  walk(out);
});
after(() => fs.rmSync(out, { recursive: true, force: true }));

/** The file a root-relative URL serves, or null. Clean URLs: /x/ serves /x/index.html. */
function fileFor(/** @type {string} */ url) {
  const p = decodeURIComponent(url.split('#')[0].split('?')[0]);
  const f = path.join(out, p);
  if (fs.existsSync(f) && fs.statSync(f).isFile()) return f;
  if (fs.existsSync(path.join(f, 'index.html'))) return path.join(f, 'index.html');
  return null;
}
const ids = (/** @type {string} */ html) => new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const attr = (/** @type {string} */ html, /** @type {string} */ name) => [...html.matchAll(new RegExp(`\\s${name}="([^"]*)"`, 'g'))].map((m) => m[1].replace(/&amp;/g, '&'));

test('the build writes every page', () => {
  assert.ok(pages.size >= 24, `only ${pages.size} pages`);
  for (const p of ['/', '/glendalough/', '/driving-guide/', '/how-much-of-ireland/', '/privacy/', '/404.html']) assert.ok(pages.has(p), `${p} is missing`);
});

test('every internal link, image and script resolves', () => {
  const broken = [];
  for (const [page, html] of pages) {
    const urls = [...attr(html, 'href'), ...attr(html, 'src'), ...attr(html, 'srcset').flatMap((s) => s.split(',').map((x) => x.trim().split(/\s+/)[0]))];
    for (const u of urls) if (u.startsWith('/') && !u.startsWith('//') && !fileFor(u)) broken.push(`${page} -> ${u}`);
  }
  assert.deepEqual(broken, []);
});

test('every #fragment link points at an id on its page', () => {
  const missing = [];
  for (const [page, html] of pages) {
    for (const href of attr(html, 'href')) {
      if (!href.includes('#') || href === '#' || /^[a-z]+:/.test(href)) continue;
      const [p, frag] = href.split('#');
      const target = p ? (p.startsWith('/') ? p : null) : page;
      if (!target) continue;
      const f = fileFor(target);
      if (f && !ids(fs.readFileSync(f, 'utf8')).has(frag)) missing.push(`${page} -> ${href}`);
    }
  }
  assert.deepEqual(missing, []);
});

test('ids are unique on every page, and aria references point at them', () => {
  const problems = [];
  for (const [page, html] of pages) {
    const all = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    const dupes = all.filter((x, i) => all.indexOf(x) !== i);
    if (dupes.length) problems.push(`${page}: duplicate id ${[...new Set(dupes)]}`);
    const have = new Set(all);
    for (const a of ['aria-labelledby', 'aria-describedby', 'aria-controls', 'for']) for (const v of attr(html, a)) for (const id of v.split(/\s+/)) if (id && !have.has(id)) problems.push(`${page}: ${a}="${id}" has no matching id`);
  }
  assert.deepEqual(problems, []);
});

test('the sitemap lists every page except the 404, and nothing else', () => {
  const xml = fs.readFileSync(path.join(out, 'sitemap.xml'), 'utf8');
  const locs = [...xml.matchAll(/<loc>https?:\/\/[^/]+(\/[^<]*)<\/loc>/g)].map((m) => m[1]).sort();
  const expected = [...pages.keys()].filter((p) => p !== '/404.html').sort();
  assert.deepEqual(locs, expected);
  for (const m of xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)) assert.match(m[1], /^\d{4}-\d{2}-\d{2}$/);
});

test('every page has a title, a description, a canonical URL and one h1', () => {
  const problems = [];
  for (const [page, html] of pages) {
    if (!/<title>[^<]{10,}<\/title>/.test(html)) problems.push(`${page}: title`);
    if ((html.match(/<h1[\s>]/g) || []).length !== 1) problems.push(`${page}: h1 count`);
    if (page === '/404.html') continue; // served with status 404, so never indexed
    if (!/<meta name="description" content="[^"]{50,}"/.test(html)) problems.push(`${page}: description`);
    if (!/<link rel="canonical" href="https:\/\/[^"]+"/.test(html)) problems.push(`${page}: canonical`);
  }
  assert.deepEqual(problems, []);
});

test('the bundled app.js is one classic script with the shared modules inlined', () => {
  const file = fs.readdirSync(path.join(out, 'assets')).find((f) => /^app\.[0-9a-f]+\.js$/.test(f));
  assert.ok(file, 'no app.*.js in assets');
  const src = fs.readFileSync(path.join(out, 'assets', file), 'utf8');
  assert.doesNotThrow(() => new vm.Script(src, { filename: file }), 'app.js does not parse as a classic script');
  assert.doesNotMatch(src, /^\s*(import|export)\s/m);
  for (const name of ['parse', 'statsOf', 'fmtMins']) assert.match(src, new RegExp(`function ${name}\\(`), `${name} was not inlined`);
});
