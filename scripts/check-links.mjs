// Crawls the built site in dist/ and requests every external link once, reporting anything that
// isn't a plain 200. No dependencies: Node 18+ only.
//   npm run build && node scripts/check-links.mjs [--json file] [--include-maps]
//
// Results are grouped as:
//   broken   4xx (except 401/403/429), 5xx, DNS or network failure: fix these
//   blocked  401/403/429: usually bot protection, so check these by hand in a browser
//   moved    a redirect to a different page (not just http->https or a trailing slash): update the link
//   ok       200, directly or after a trivial redirect
// Exit code is 1 if anything is broken, so CI can fail on it.
import fs from 'node:fs';
import path from 'node:path';

const DIST = 'dist';
const TIMEOUT = 15000, CONCURRENCY = 6;
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 NineRoadsOut-linkcheck';
const arg = (k) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : null; };
const includeMaps = process.argv.includes('--include-maps');

/** @param {string} dir @returns {string[]} */
const htmlFiles = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(dir, e.name);
  return e.isDirectory() ? htmlFiles(p) : e.name.endsWith('.html') ? [p] : [];
});

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

/** @type {Map<string, Set<string>>} url -> pages it appears on */
const links = new Map();
for (const file of htmlFiles(DIST)) {
  const page = '/' + path.relative(DIST, file).replace(/index\.html$/, '');
  for (const m of fs.readFileSync(file, 'utf8').matchAll(/<a\b[^>]*\bhref="(https?:\/\/[^"]+)"/g)) {
    const url = decode(m[1]);
    // Google Maps search and directions links are generated from names, not hand-written, and
    // Google answers automated requests with consent pages. Skip unless asked.
    if (!includeMaps && /^https:\/\/www\.google\.com\/maps\//.test(url)) continue;
    // Share links are templates, not destinations.
    if (/^https:\/\/wa\.me\//.test(url)) continue;
    if (!links.has(url)) links.set(url, new Set());
    links.get(url).add(page);
  }
}

/** Is a redirect only cosmetic (scheme, www, trailing slash)? */
function trivial(a, b) {
  const norm = (u) => { const x = new URL(u); return (x.host.replace(/^www\./, '') + x.pathname.replace(/\/$/, '') + x.search).toLowerCase(); };
  try { return norm(a) === norm(b); } catch { return false; }
}

/** @param {string} url */
async function check(url) {
  const attempt = async (method) => {
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), TIMEOUT);
    try {
      const res = await fetch(url, { method, redirect: 'follow', signal: ctl.signal, headers: { 'user-agent': UA, accept: 'text/html,*/*;q=0.8', 'accept-language': 'en-IE,en;q=0.9' } });
      if (method === 'GET') res.body?.cancel().catch(() => {});
      return { status: res.status, final: res.url };
    } finally { clearTimeout(t); }
  };
  try {
    let r = await attempt('HEAD');
    if (r.status >= 400 || r.status === 0) r = await attempt('GET'); // many servers mishandle HEAD
    return r;
  } catch (e) {
    try { return await attempt('GET'); } catch (e2) { return { status: 0, final: url, error: String(e2.cause?.code || e2.name || e2) }; }
  }
}

const urls = [...links.keys()].sort();
const results = [];
let next = 0;
await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
  while (next < urls.length) {
    const url = urls[next++];
    const r = await check(url);
    const kind = r.status === 0 ? 'broken'
      : [401, 403, 429].includes(r.status) ? 'blocked'
      : r.status >= 400 ? 'broken'
      : r.final && !trivial(url, r.final) ? 'moved' : 'ok';
    results.push({ url, kind, status: r.status, final: r.final !== url ? r.final : undefined, error: r.error, pages: [...links.get(url)].sort() });
  }
}));

const order = ['broken', 'blocked', 'moved', 'ok'];
results.sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind) || a.url.localeCompare(b.url));
for (const k of order) {
  const list = results.filter((r) => r.kind === k);
  if (!list.length) continue;
  console.log(`\n${k.toUpperCase()} (${list.length})`);
  for (const r of list) {
    console.log(`  ${r.status || r.error}  ${r.url}${r.final ? `\n        -> ${r.final}` : ''}`);
    if (k !== 'ok') console.log(`        on ${r.pages.slice(0, 4).join(', ')}${r.pages.length > 4 ? ` and ${r.pages.length - 4} more` : ''}`);
  }
}
const n = (k) => results.filter((r) => r.kind === k).length;
console.log(`\n${results.length} external links: ${n('ok')} ok, ${n('moved')} moved, ${n('blocked')} blocked (check by hand), ${n('broken')} broken.`);
const out = arg('--json');
if (out) fs.writeFileSync(out, JSON.stringify({ checked: new Date().toISOString(), results }, null, 2));
process.exitCode = n('broken') ? 1 : 0;
