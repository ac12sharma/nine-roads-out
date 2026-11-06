// Page weight of every page in the sitemap, as a phone loads it: bytes transferred (compressed, as
// Cloudflare serves them) and number of requests, until the network goes quiet. Images below the
// fold that load lazily are only counted if the browser fetches them at load.
//   npm run build && node scripts/page-weight.mjs [--json file]
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { serve } from './serve.mjs';

const DIST = 'dist', PORT = 4174, BASE = `http://127.0.0.1:${PORT}`;
const jsonAt = process.argv.indexOf('--json');
const pages = [...fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8').matchAll(/<loc>[^<]*?\.com(\/[^<]*)<\/loc>/g)].map((m) => m[1]);

const server = await serve(DIST, PORT);
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true });
const rows = [];
for (const p of pages) {
  const page = await ctx.newPage();
  /** @type {import('playwright').Response[]} */
  const responses = [];
  page.on('response', (r) => responses.push(r));
  await page.goto(BASE + p, { waitUntil: 'networkidle' });
  const by = { html: 0, css: 0, js: 0, font: 0, image: 0, other: 0 };
  let total = 0;
  for (const r of responses) {
    const s = await r.request().sizes().catch(() => null);
    if (!s) continue;
    const bytes = s.responseBodySize + s.responseHeadersSize;
    const type = r.request().resourceType();
    const k = type === 'document' ? 'html' : type === 'stylesheet' ? 'css' : type === 'script' ? 'js' : type === 'font' ? 'font' : type === 'image' ? 'image' : 'other';
    by[k] += bytes; total += bytes;
  }
  rows.push({ page: p, requests: responses.length, total, ...by });
  await page.close();
}
await browser.close();
server.close();

const kb = (/** @type {number} */ b) => (b / 1024).toFixed(0);
console.log('| Page | Requests | Total KiB | HTML | CSS | JS | Fonts | Images |\n| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |');
for (const r of rows) console.log(`| \`${r.page}\` | ${r.requests} | ${kb(r.total)} | ${kb(r.html)} | ${kb(r.css)} | ${kb(r.js)} | ${kb(r.font)} | ${kb(r.image)} |`);
if (jsonAt > -1) fs.writeFileSync(process.argv[jsonAt + 1], JSON.stringify(rows, null, 2));
