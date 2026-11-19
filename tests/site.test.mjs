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

test('every page links to at least three other pages from its main content', () => {
  const thin = [];
  for (const [page, html] of pages) {
    const main = (html.match(/<main[^>]*>([\s\S]*?)<\/main>/) || ['', ''])[1].replace(/<nav class="wrap crumbs"[\s\S]*?<\/nav>/, '');
    const links = new Set([...main.matchAll(/href="(\/[^"#?]*)/g)].map((m) => m[1]).filter((p) => p !== page && p !== '/' && !/\.(gpx|jpg|webp|png|svg)$/.test(p)));
    if (links.size < 3) thin.push(`${page} (${links.size})`);
  }
  assert.deepEqual(thin, []);
});

test('every long-form guide has at least 800 words, its sources and related pages', async () => {
  const { ARTICLES } = await import('../src/content/articles.mjs');
  assert.ok(ARTICLES.length >= 5);
  for (const ar of ARTICLES) {
    const html = pages.get(`/${ar.slug}/`);
    assert.ok(html, `/${ar.slug}/ was not built`);
    const body = (html.match(/<div class="prose">([\s\S]*?)<h2 id="related">/) || ['', ''])[1];
    const words = body.replace(/<table[\s\S]*?<\/table>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ').split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;
    assert.ok(words >= 800, `/${ar.slug}/ has ${words} words, not counting tables`);
    assert.ok(ar.sources.length >= 2 && ar.sources.every(([, u]) => u.startsWith('https://')), `/${ar.slug}/ needs at least two https sources`);
    assert.ok(html.includes('<h2 id="sources">Sources</h2>'), `/${ar.slug}/ doesn't show its sources`);
    assert.ok(ar.related.length >= 3, `/${ar.slug}/ needs three related pages`);
  }
});

test('every affiliate and featured link is marked rel="sponsored", and its page says so', async () => {
  const { default: config } = await import('../site.config.mjs');
  const { RESTAURANTS } = await import('../src/content/restaurants.mjs');
  const paid = new Set(Object.values(RESTAURANTS).flat().filter((r) => r.featured && r.url).map((r) => r.url));
  const hosts = Object.values(config.affiliates).map((a) => new URL(a.url.replace('{q}', 'x')).hostname);
  const problems = [];
  for (const [page, html] of pages) {
    let any = false;
    for (const m of html.matchAll(/<a [^>]*href="([^"]+)"[^>]*>/g)) {
      const href = m[1].replace(/&amp;/g, '&');
      if (!/^https?:/.test(href)) continue;
      const isPaid = hosts.includes(new URL(href).hostname) || paid.has(href);
      if (!isPaid) continue;
      any = true;
      if (!/rel="[^"]*\bsponsored\b/.test(m[0])) problems.push(`${page}: ${href} is missing rel="sponsored"`);
    }
    if (any && !/Affiliate links?:|paid placements?|Featured partner/i.test(html)) problems.push(`${page}: has paid links but no disclosure`);
  }
  assert.deepEqual(problems, []);
});

test('every drive has a GPX file with its verified stops', () => {
  for (const [page, html] of pages) {
    const m = html.match(/href="(\/gpx\/[a-z-]+\.gpx)"/);
    if (!m) continue;
    const gpx = fs.readFileSync(path.join(out, m[1]), 'utf8');
    assert.match(gpx, /^<\?xml version="1\.0" encoding="UTF-8"\?>\n<gpx version="1\.1"/, `${m[1]} is not a GPX 1.1 file`);
    assert.ok((gpx.match(/<wpt /g) || []).length >= 1, `${m[1]} has no waypoints`);
    assert.equal((gpx.match(/<wpt /g) || []).length, (gpx.match(/<rtept /g) || []).length);
  }
  assert.equal(fs.readdirSync(path.join(out, 'gpx')).length, 9);
});

test('the bundled app.js is one classic script with the shared modules inlined', () => {
  const file = fs.readdirSync(path.join(out, 'assets')).find((f) => /^app\.[0-9a-f]+\.js$/.test(f));
  assert.ok(file, 'no app.*.js in assets');
  const src = fs.readFileSync(path.join(out, 'assets', file), 'utf8');
  assert.doesNotThrow(() => new vm.Script(src, { filename: file }), 'app.js does not parse as a classic script');
  assert.doesNotMatch(src, /^\s*(import|export)\s/m);
  for (const name of ['parse', 'statsOf', 'fmtMins']) assert.match(src, new RegExp(`function ${name}\\(`), `${name} was not inlined`);
});
