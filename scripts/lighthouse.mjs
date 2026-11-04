// Runs Lighthouse (mobile and desktop) on key pages of the built site and prints a Markdown table
// for docs/metrics.md. Uses Playwright's Chromium so no separate Chrome install is needed.
//   npm run build && node scripts/lighthouse.mjs [/path/ ...] [--runs 3] [--out dir]
// With --runs N, each page is measured N times and the run with the median performance score is
// reported, because single simulated-throttling runs vary by several points.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { chromium } from 'playwright';
import { serve } from './serve.mjs';

const LH = 'lighthouse@12.8.2', PORT = 4180;
const argv = process.argv.slice(2);
const outIdx = argv.indexOf('--out');
const out = outIdx > -1 ? argv.splice(outIdx, 2)[1] : fs.mkdtempSync(path.join(os.tmpdir(), 'nro-lh-'));
const runsIdx = argv.indexOf('--runs');
const RUNS = runsIdx > -1 ? Number(argv.splice(runsIdx, 2)[1]) : 1;
const pages = argv.length ? argv : ['/', '/glendalough/', '/driving-guide/', '/car-hire-dublin/', '/day-trips-from-dublin-without-a-car/', '/coastal-drives-from-dublin/'];
fs.mkdirSync(out, { recursive: true });

const server = await serve('dist', PORT);
const rows = [];
try {
  for (const p of pages) {
    for (const mode of ['mobile', 'desktop']) {
      const results = [];
      for (let run = 1; run <= RUNS; run++) {
        const file = path.join(out, `${p.replace(/\W+/g, '_') || 'home'}-${mode}${RUNS > 1 ? '-' + run : ''}.json`);
        // Async, so the in-process server can keep answering Lighthouse's requests.
        await promisify(execFile)('npx', ['--yes', LH, `http://127.0.0.1:${PORT}${p}`, ...(mode === 'desktop' ? ['--preset=desktop'] : []),
          '--quiet', '--chrome-flags=--headless=new --no-sandbox', '--only-categories=performance,accessibility,best-practices,seo',
          '--output=json', `--output-path=${file}`], { env: { ...process.env, CHROME_PATH: chromium.executablePath() } });
        results.push(JSON.parse(fs.readFileSync(file, 'utf8')));
      }
      results.sort((x, y) => x.categories.performance.score - y.categories.performance.score);
      const r = results[Math.floor(results.length / 2)], c = r.categories, a = r.audits;
      const s = (k) => Math.round(c[k].score * 100);
      rows.push(`| \`${p}\` | ${mode} | ${s('performance')} | ${s('accessibility')} | ${s('best-practices')} | ${s('seo')} | ${a['largest-contentful-paint'].displayValue} | ${a['total-blocking-time'].displayValue} | ${a['cumulative-layout-shift'].displayValue} | ${Math.round(a['total-byte-weight'].numericValue / 1024).toLocaleString('en-IE')} KiB |`);
      console.error(rows.at(-1));
    }
  }
} finally { server.close(); }
console.log('| Page | Form factor | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS | Page weight |\n| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |\n' + rows.join('\n'));
console.error(`\nJSON reports in ${out}`);
