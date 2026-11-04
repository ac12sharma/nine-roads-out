// Opens every built page in Chromium at phone and desktop widths and reports real problems:
// console errors, failed requests, horizontal overflow, images without alt, broken internal links,
// axe-core WCAG 2.2 AA violations and keyboard focus traps.
//   npm run build && node scripts/audit-pages.mjs [--shots dir] [--json file]
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';
import { serve } from './serve.mjs';

const require = createRequire(import.meta.url);
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const arg = (k) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : null; };
const shots = arg('--shots'), jsonOut = arg('--json');
const DIST = 'dist', PORT = 4173, BASE = `http://127.0.0.1:${PORT}`;
const WIDTHS = [{ name: 'mobile', width: 390, height: 844 }, { name: 'desktop', width: 1280, height: 800 }];

const pages = [...fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8').matchAll(/<loc>[^<]*?\.com(\/[^<]*)<\/loc>/g)].map((m) => m[1]);
pages.push('/404.html');

/** Does a root-relative href resolve to a file in dist? */
function resolves(href) {
  const p = href.split('#')[0].split('?')[0];
  if (!p) return true;
  const f = path.join(DIST, decodeURIComponent(p));
  return fs.existsSync(f) && (fs.statSync(f).isFile() || fs.existsSync(path.join(f, 'index.html')));
}

const server = await serve(DIST, PORT);
const browser = await chromium.launch();
const report = [];
if (shots) fs.mkdirSync(shots, { recursive: true });

for (const vp of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  for (const p of pages) {
    const page = await ctx.newPage();
    const issues = [];
    page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') issues.push({ kind: 'console-' + m.type(), detail: m.text() }); });
    page.on('pageerror', (e) => issues.push({ kind: 'page-error', detail: e.message }));
    page.on('requestfailed', (r) => { if (r.url().startsWith(BASE)) issues.push({ kind: 'request-failed', detail: r.url() }); });
    page.on('response', (r) => { if (r.url().startsWith(BASE) && r.status() >= 400 && !r.url().endsWith('/404.html')) issues.push({ kind: 'http-' + r.status(), detail: r.url() }); });
    await page.goto(BASE + p, { waitUntil: 'networkidle' });

    const dom = await page.evaluate(() => {
      const de = document.documentElement;
      const wide = [...document.querySelectorAll('body *')].filter((el) => { const r = el.getBoundingClientRect(); return r.width && r.right > de.clientWidth + 1 && getComputedStyle(el).position !== 'fixed'; })
        .slice(0, 5).map((el) => el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ').join('.') : ''));
      return {
        overflow: de.scrollWidth > de.clientWidth ? { scrollWidth: de.scrollWidth, clientWidth: de.clientWidth, wide } : null,
        noAlt: [...document.images].filter((i) => !i.hasAttribute('alt')).map((i) => i.src),
        links: [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')),
        title: document.title, h1: document.querySelectorAll('h1').length,
      };
    });
    if (dom.overflow) issues.push({ kind: 'horizontal-overflow', detail: dom.overflow });
    dom.noAlt.forEach((src) => issues.push({ kind: 'img-no-alt', detail: src }));
    if (dom.h1 !== 1) issues.push({ kind: 'h1-count', detail: dom.h1 });
    for (const href of new Set(dom.links)) if (href.startsWith('/') && !resolves(href)) issues.push({ kind: 'broken-internal-link', detail: href });

    await page.addScriptTag({ content: AXE });
    const axe = await page.evaluate(async () => {
      // @ts-ignore axe is injected above
      const r = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } });
      return r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length, targets: v.nodes.slice(0, 4).map((n) => n.target.join(' ')), why: v.nodes[0] && v.nodes[0].failureSummary }));
    });
    axe.forEach((v) => issues.push({ kind: 'axe', detail: v }));

    // Keyboard: tab 60 times from the top. Report if focus stops moving (trap) or lands on something invisible.
    await page.evaluate(() => { window.scrollTo(0, 0); /** @type {HTMLElement} */ (document.activeElement)?.blur?.(); });
    const seen = [];
    let stuck = 0, last = '';
    for (let i = 0; i < 60; i++) {
      await page.keyboard.press('Tab');
      const f = await page.evaluate(() => {
        const a = document.activeElement; if (!a || a === document.body) return { id: 'body', visible: true };
        const r = a.getBoundingClientRect(), cs = getComputedStyle(a);
        const id = a.tagName.toLowerCase() + (a.id ? '#' + a.id : '') + (a.getAttribute('href') ? '@' + a.getAttribute('href') : '') + (a.getAttribute('class') ? '.' + String(a.getAttribute('class')).split(' ')[0] : '') + '|' + (a.textContent || a.getAttribute('aria-label') || '').trim().slice(0, 30);
        return { id, visible: r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.opacity !== '0', outline: cs.outlineStyle !== 'none' || cs.boxShadow !== 'none' };
      });
      if (f.id === last) stuck++; else stuck = 0;
      last = f.id; seen.push(f);
      if (stuck >= 3) { issues.push({ kind: 'keyboard-trap', detail: f.id }); break; }
    }
    const hiddenFocus = [...new Set(seen.filter((f) => !f.visible).map((f) => f.id))];
    if (hiddenFocus.length) issues.push({ kind: 'focus-on-invisible', detail: hiddenFocus });

    if (shots) await page.screenshot({ path: path.join(shots, `${vp.name}${p.replace(/\//g, '_') || '_home'}.png`), fullPage: true });
    report.push({ page: p, viewport: vp.name, title: dom.title, issues });
    await page.close();
  }
  await ctx.close();
}

// Planner focus management, checked once per width on the home page.
for (const vp of WIDTHS) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.click('.pl-launch');
  await page.waitForTimeout(200);
  const afterOpen = await page.evaluate(() => document.activeElement?.id);
  await page.keyboard.press('Escape');
  const afterClose = await page.evaluate(() => document.activeElement?.className);
  const issues = [];
  if (afterOpen !== 'pl-input') issues.push({ kind: 'planner-focus-open', detail: afterOpen });
  if (afterClose !== 'pl-launch') issues.push({ kind: 'planner-focus-close', detail: afterClose });
  report.push({ page: '/ (planner)', viewport: vp.name, issues });
  await page.close();
}

await browser.close();
server.close();

if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify(report, null, 2));
let total = 0;
for (const r of report) {
  if (!r.issues.length) continue;
  console.log(`\n${r.page} @ ${r.viewport}`);
  for (const i of r.issues) { total++; console.log('  - ' + i.kind + ': ' + (typeof i.detail === 'string' ? i.detail : JSON.stringify(i.detail))); }
}
console.log(`\n${report.length} page views checked, ${total} issues.`);
process.exitCode = total ? 1 : 0;
