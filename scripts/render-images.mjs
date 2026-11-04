// Renders still frames of every scene (WebP) plus share cards and icons, using the same scenes.js the site runs.
// Needs Playwright: `npm i -D playwright && npx playwright install chromium`, then `npm run images`.
// `npm run images -- --only card-sm` re-renders only the scene stills whose file name contains that text.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { TRIPS } from '../src/content/trips.mjs';
import { bearingOf, windOf, fmtMins } from '../src/lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = path.join(root, 'public');
const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null;
// The full variable fonts from fonts-src/: share cards use widths and weights the site's slimmed copies drop.
const fontUrl = (f) => pathToFileURL(path.join(root, 'fonts-src', f)).href;
const harness = path.join(os.tmpdir(), 'nro-harness.html');
fs.writeFileSync(harness, `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:"Archivo";src:url(${fontUrl('archivo.woff2')}) format("woff2");font-weight:100 900;font-stretch:62% 125%}
@font-face{font-family:"Newsreader";src:url(${fontUrl('newsreader-italic.woff2')}) format("woff2");font-weight:200 800;font-style:italic}
html,body{margin:0;background:#111}
.og{position:relative;width:1200px;height:630px;overflow:hidden;font-family:Archivo,Arial,sans-serif}
.og canvas{position:absolute;inset:0}
.og::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(14,12,20,0) 30%,rgba(14,12,20,.62) 72%,rgba(14,12,20,.9) 100%)}
.og .txt{position:absolute;left:64px;right:64px;bottom:54px;z-index:1;color:#FFF8EF}
.og .ga{font:italic 400 34px/1.1 Newsreader,Georgia,serif;color:#F3DCC8}
.og .en{margin-top:6px;font:800 96px/.9 Archivo;font-stretch:125%;text-transform:uppercase;letter-spacing:-.01em}
.og .meta{margin-top:18px;font:600 26px/1.2 Archivo;color:#EADFD2}
.og .brand{position:absolute;top:44px;left:64px;z-index:1;display:flex;align-items:center;gap:14px;font:800 24px/1 Archivo;font-stretch:125%;letter-spacing:.01em;color:#FFF8EF;text-transform:uppercase}
.plate{display:inline-grid;place-items:center;width:44px;height:44px;border-radius:8px;background:#00693E;color:#FFD200;font:800 28px/1 Archivo;box-shadow:inset 0 0 0 3px #00693E,inset 0 0 0 5px rgba(255,255,255,.9)}
.icon{display:grid;place-items:center;background:#00693E}
.icon span{display:grid;place-items:center;width:84%;height:84%;border:solid #fff;border-radius:14%;color:#FFD200;font:800 1px/1 Archivo;font-stretch:110%}
</style></head><body><script>window.NRO_NO_BOOT=true</script><script src="${pathToFileURL(path.join(root, 'src/assets/scenes.js')).href}"></script></body></html>`);

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });
await page.goto(pathToFileURL(harness).href);
await page.evaluate(() => document.fonts.ready);

async function still(scene, w, h, file, q = 0.78) {
  if (only && !file.includes(only)) return;
  const b64 = await page.evaluate(([s, W, H, Q]) => {
    const c = document.createElement('canvas');
    window.NRO_SCENES.renderStill(c, s, W, H, 1, 0);
    return c.toDataURL('image/webp', Q).split(',')[1];
  }, [scene, w, h, q]);
  fs.writeFileSync(path.join(pub, 'images/scenes', file), Buffer.from(b64, 'base64'));
}
fs.mkdirSync(path.join(pub, 'images/scenes'), { recursive: true });
fs.mkdirSync(path.join(pub, 'og'), { recursive: true });

await still('hero', 1600, 900, 'hero-wide.webp');
await still('hero', 800, 1100, 'hero-tall.webp');
for (const t of TRIPS) {
  await still(t.scene, 1600, 700, `${t.id}-plate.webp`);
  await still(t.scene, 900, 675, `${t.id}-plate-sm.webp`, 0.72);
  await still(t.scene, 960, 640, `${t.id}-card.webp`, 0.7);
  await still(t.scene, 640, 427, `${t.id}-card-sm.webp`, 0.7); // phones: srcset picks this below about 640 device pixels
}
if (only) { await browser.close(); console.log(`Rendered scene stills matching "${only}".`); process.exit(0); }

async function og(scene, ga, en, meta, file) {
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.evaluate(([s, ga, en, meta]) => {
    document.querySelectorAll('.og,.icon').forEach((n) => n.remove());
    const d = document.createElement('div'); d.className = 'og';
    const c = document.createElement('canvas'); d.appendChild(c);
    window.NRO_SCENES.renderStill(c, s, 1200, 630, 1, 0);
    d.insertAdjacentHTML('beforeend', `<div class="brand"><span class="plate">9</span>Nine Roads Out</div><div class="txt">${ga ? `<div class="ga">${ga}</div>` : ''}<div class="en">${en}</div><div class="meta">${meta}</div></div>`);
    document.body.prepend(d);
  }, [scene, ga, en, meta]);
  await page.locator('.og').screenshot({ path: path.join(pub, 'og', file), type: 'jpeg', quality: 86 });
}
await og('hero', 'Naoi mBóthar Amach', 'Nine day drives', 'The most beautiful road trips from Dublin city', 'home.jpg');
for (const t of TRIPS) {
  const w = windOf(bearingOf(t));
  await og(t.scene, t.ga, t.en, `Day drive from Dublin · ${fmtMins(t.mins)} ${w} · ${t.via.replace(/^And /, 'and ')}`, `${t.id}.jpg`);
}

// Share card for /how-much-of-ireland/: the county map with the nine drives' counties filled in.
{
  const M = JSON.parse(fs.readFileSync(path.join(root, 'src/content/ireland-map.json'), 'utf8'));
  const done = new Set(TRIPS.flatMap((t) => t.counties));
  const svg = `<svg viewBox="0 0 ${M.w} ${M.h}" width="${Math.round(M.w * 1.12)}" height="${Math.round(M.h * 1.12)}" xmlns="http://www.w3.org/2000/svg"><path d="${M.ni}" fill="#33473C"/>${Object.entries(M.counties).map(([c, d]) => `<path d="${d}" fill="${done.has(c) ? '#FFD200' : '#4C6B59'}" stroke="#00693E" stroke-width="1.2" stroke-linejoin="round"/>`).join('')}</svg>`;
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.evaluate((svg) => {
    document.querySelectorAll('.og,.icon').forEach((n) => n.remove());
    document.body.insertAdjacentHTML('afterbegin', `<div class="og" style="background:#00693E;box-shadow:inset 0 0 0 14px #00693E,inset 0 0 0 18px rgba(255,255,255,.9)"><div style="position:absolute;right:70px;top:24px">${svg}</div><div class="brand"><span class="plate">9</span>Nine Roads Out</div><div class="txt" style="right:560px"><div class="en" style="font-size:66px;line-height:.95">How much of Ireland have you driven?</div><div class="meta" style="color:#FFD200">Find your traveller level: 1, 2 or 3</div></div></div>`);
  }, svg);
  await page.evaluate(() => { const o = document.querySelector('.og'); o.classList.add('flat'); });
  await page.addStyleTag({ content: '.og.flat::after{display:none}' });
  await page.locator('.og').screenshot({ path: path.join(pub, 'og', 'ireland.jpg'), type: 'jpeg', quality: 88 });
}

for (const [size, file] of [[180, 'apple-touch-icon.png'], [192, 'icon-192.png'], [512, 'icon-512.png']]) {
  await page.setViewportSize({ width: size, height: size });
  await page.evaluate((s) => {
    document.querySelectorAll('.og,.icon').forEach((n) => n.remove());
    document.body.insertAdjacentHTML('afterbegin', `<div class="icon" style="width:${s}px;height:${s}px"><span style="font-size:${Math.round(s * 0.62)}px;border-width:${Math.max(3, Math.round(s * 0.035))}px">9</span></div>`);
  }, size);
  await page.locator('.icon').screenshot({ path: path.join(pub, file) });
}
await browser.close();
console.log('Rendered scenes, share cards and icons into public/.');
