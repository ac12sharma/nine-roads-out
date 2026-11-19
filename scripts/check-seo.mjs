// Checks the built site's search metadata, offline apart from one download of the schema.org vocabulary:
// - structured data: every JSON-LD block parses, every @type is a schema.org type, and every property
//   is one schema.org allows on that type (or a type it inherits from); plus the fields Google requires
//   for the rich results it supports (Article, BreadcrumbList, FAQPage, ItemList)
// - canonical URLs match the sitemap, one for one; robots.txt allows crawling and names the sitemap
// - Open Graph: title, description, url (= canonical) and an image that exists at 1200 x 630
//   npm run build && node scripts/check-seo.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const DIST = 'dist';
const VOCAB_URL = 'https://schema.org/version/latest/schemaorg-current-https.jsonld';
const VOCAB_CACHE = path.join(os.tmpdir(), 'schemaorg-current-https.jsonld');
const problems = [];
const fail = (/** @type {string} */ where, /** @type {string} */ what) => problems.push(`${where}: ${what}`);

// ---- schema.org vocabulary ----
if (!fs.existsSync(VOCAB_CACHE)) {
  const res = await fetch(VOCAB_URL);
  if (!res.ok) throw new Error(`Couldn't download the schema.org vocabulary (${res.status})`);
  fs.writeFileSync(VOCAB_CACHE, await res.text());
}
const graph = JSON.parse(fs.readFileSync(VOCAB_CACHE, 'utf8'))['@graph'];
const id = (/** @type {string} */ s) => s.replace(/^schema:/, '');
const list = (/** @type {any} */ v) => (v == null ? [] : Array.isArray(v) ? v : [v]).map((x) => id(x['@id']));
/** @type {Map<string, string[]>} type -> its direct supertypes */
const parents = new Map();
/** @type {Map<string, Set<string>>} property -> the types it may be used on */
const domains = new Map();
for (const n of graph) {
  const types = [].concat(n['@type']);
  if (types.includes('rdfs:Class')) parents.set(id(n['@id']), list(n['rdfs:subClassOf']));
  if (types.includes('rdf:Property')) domains.set(id(n['@id']), new Set(list(n['schema:domainIncludes'])));
}
/** Every type this type inherits from, including itself. */
function ancestors(/** @type {string} */ t, seen = new Set()) {
  if (seen.has(t)) return seen;
  seen.add(t);
  for (const p of parents.get(t) || []) ancestors(p, seen);
  return seen;
}

/** Walks one JSON-LD node, checking its type and properties, then its children. */
function checkNode(/** @type {any} */ node, /** @type {string} */ where) {
  if (Array.isArray(node)) { node.forEach((n, i) => checkNode(n, `${where}[${i}]`)); return; }
  if (!node || typeof node !== 'object') return;
  const type = node['@type'];
  if (type) {
    if (!parents.has(type)) { fail(where, `"${type}" is not a schema.org type`); return; }
    const up = ancestors(type);
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith('@')) continue;
      const dom = domains.get(k);
      if (!dom) fail(where, `"${k}" is not a schema.org property`);
      else if (![...up].some((t) => dom.has(t))) fail(where, `"${k}" isn't a property of ${type}`);
      checkNode(v, `${where}.${k}`);
    }
  }
}

/** The fields Google needs for the rich results it supports. */
function checkGoogle(/** @type {any} */ j, /** @type {string} */ where) {
  const t = j['@type'];
  if (t === 'Article' && !j.headline) fail(where, 'Article needs a headline');
  if (t === 'Article' && !j.image) fail(where, 'Article should have an image');
  if (t === 'BreadcrumbList') (j.itemListElement || []).forEach((/** @type {any} */ li, /** @type {number} */ i) => { if (li.position !== i + 1 || !li.name || !li.item) fail(where, `breadcrumb ${i + 1} needs position, name and item`); });
  if (t === 'FAQPage') {
    if (!j.mainEntity?.length) fail(where, 'FAQPage needs questions');
    for (const q of j.mainEntity || []) if (q['@type'] !== 'Question' || !q.name || q.acceptedAnswer?.['@type'] !== 'Answer' || !q.acceptedAnswer.text) fail(where, 'each FAQ needs a Question with a name and an Answer with text');
  }
  if (t === 'ItemList' && !(j.itemListElement || []).every((/** @type {any} */ li, /** @type {number} */ i) => li.position === i + 1)) fail(where, 'ItemList positions must count from 1');
}

// ---- pages ----
const walk = (/** @type {string} */ d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith('.html') ? [path.join(d, e.name)] : []));
const pages = walk(DIST).map((f) => ({ f, page: '/' + path.relative(DIST, f).split(path.sep).join('/').replace(/index\.html$/, ''), html: fs.readFileSync(f, 'utf8') }));
const meta = (/** @type {string} */ html, /** @type {string} */ prop) => html.match(new RegExp(`<meta (?:property|name)="${prop}" content="([^"]*)"`))?.[1];

/** Width and height of a JPEG or PNG. */
function size(/** @type {string} */ file) {
  const b = fs.readFileSync(file);
  if (b[0] === 0x89) return [b.readUInt32BE(16), b.readUInt32BE(20)];
  for (let i = 2; i < b.length;) {
    if (b[i] !== 0xff) { i++; continue; }
    const m = b[i + 1];
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
    i += 2 + b.readUInt16BE(i + 2);
  }
  return [0, 0];
}

const sitemap = fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8');
const locs = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
const site = [...locs][0].replace(/(https:\/\/[^/]+).*/, '$1');
const robots = fs.readFileSync(path.join(DIST, 'robots.txt'), 'utf8');
if (!/^User-agent: \*$/m.test(robots) || /^Disallow: \/$/m.test(robots)) fail('robots.txt', 'should allow all crawlers');
if (!robots.includes(`Sitemap: ${site}/sitemap.xml`)) fail('robots.txt', 'should name the sitemap');

let blocks = 0;
const canonicals = new Set();
for (const { page, html } of pages) {
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (page !== '/404.html') {
    if (!canonical) fail(page, 'no canonical URL');
    else { canonicals.add(canonical); if (canonical !== site + page) fail(page, `canonical ${canonical} isn't this page`); if (!locs.has(canonical)) fail(page, 'canonical URL is not in the sitemap'); }
    for (const p of ['og:title', 'og:description', 'og:url', 'og:image', 'twitter:card']) if (!meta(html, p)) fail(page, `no ${p}`);
    if (meta(html, 'og:url') !== canonical) fail(page, 'og:url differs from the canonical URL');
  }
  const img = meta(html, 'og:image');
  if (img) {
    const f = path.join(DIST, img.replace(site, ''));
    if (!fs.existsSync(f)) fail(page, `og:image ${img} doesn't exist`);
    else { const [w, h] = size(f); if (w !== 1200 || h !== 630) fail(page, `og:image is ${w} x ${h}, not 1200 x 630`); }
  }
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    blocks++;
    let j;
    try { j = JSON.parse(m[1]); } catch (e) { fail(page, `JSON-LD doesn't parse: ${e}`); continue; }
    if (j['@context'] !== 'https://schema.org') fail(page, 'JSON-LD @context should be https://schema.org');
    checkNode(j, `${page} ${j['@type']}`);
    checkGoogle(j, `${page} ${j['@type']}`);
  }
}
for (const l of locs) if (!canonicals.has(l)) fail('sitemap.xml', `${l} has no page with that canonical URL`);

console.log(`${pages.length} pages, ${blocks} structured data blocks, ${locs.size} sitemap URLs checked against schema.org (${parents.size} types, ${domains.size} properties).`);
if (problems.length) { console.log(problems.map((p) => ' - ' + p).join('\n')); process.exitCode = 1; } else console.log('No problems found.');
