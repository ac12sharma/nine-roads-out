// Builds the static site into ./dist (or ./preview with --preview). No dependencies: Node 18+ only.
//   npm run build     -> dist/   (deploy this folder)
//   npm run preview   -> preview/ (relative links, ad spaces shown as placeholders)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import config from '../site.config.mjs';
import { TRIPS } from './content/trips.mjs';
import { bearingOf, windOf } from './lib.mjs';
import { createRenderer } from './pages.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const preview = process.argv.includes('--preview');
const out = path.join(root, preview ? 'preview' : 'dist');

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

// 1. Static files (fonts, images, icons) copied as they are.
fs.cpSync(path.join(root, 'public'), out, { recursive: true });

// 2. CSS and JS get a content hash in the filename so they can be cached forever.
const assets = {};
fs.mkdirSync(path.join(out, 'assets'), { recursive: true });
for (const [key, file] of [['css', 'site.css'], ['scenes', 'scenes.js'], ['app', 'app.js']]) {
  const src = fs.readFileSync(path.join(root, 'src/assets', file));
  const hash = crypto.createHash('sha1').update(src).digest('hex').slice(0, 10);
  const name = file.replace(/\.(\w+)$/, `.${hash}.$1`);
  fs.writeFileSync(path.join(out, 'assets', name), src);
  assets[key] = '/assets/' + name;
}

// 3. Pages.
const trips = TRIPS.map((t) => { const b = bearingOf(t); return { ...t, b, wind: windOf(b) }; });
const r = createRenderer({ config, trips, assets, preview });
const write = (rel, html) => { const f = path.join(out, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, html); };

write('index.html', r.home({ fragment: preview }));
trips.forEach((t, i) => write(`${t.slug}/index.html`, r.trip(t, i)));
write('driving-guide/index.html', r.guide());
write('about/index.html', r.about());
write('contact/index.html', r.contact());
write('privacy/index.html', r.privacy());
write('terms/index.html', r.terms());
write('404.html', r.notFound());

// 4. Search, ads and hosting files.
const urls = ['/', ...trips.map((t) => `/${t.slug}/`), '/driving-guide/', '/about/', '/contact/', '/privacy/', '/terms/'];
const today = new Date().toISOString().slice(0, 10);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${config.siteUrl}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt', preview ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\n\nSitemap: ${config.siteUrl}/sitemap.xml\n`);
if (config.adsense.client) write('ads.txt', `google.com, ${config.adsense.client.replace(/^ca-/, '')}, DIRECT, f08c47fec0942fa0\n`);
write('site.webmanifest', JSON.stringify({ name: config.name, short_name: config.name, start_url: '/', display: 'browser', background_color: '#ECEFE8', theme_color: '#0B6A47', icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }] }, null, 2));

// 5. Launch checklist in the terminal.
const todo = [];
if (!config.contactEmail) todo.push('Add contactEmail in site.config.mjs (AdSense reviewers look for a working contact route).');
if (!config.adsense.client) todo.push('Add your AdSense publisher ID (adsense.client) once your account is approved.');
if (Object.values(config.affiliates).some((a) => !/[?&](aid|a_aid|partner_id|affiliate|ref)=/i.test(a.url))) todo.push('Swap the affiliate URLs for your tracked partner links.');
console.log(`Built ${urls.length + 1} pages into ${path.relative(root, out)}/${preview ? ' (preview)' : ''}`);
if (!preview && todo.length) console.log('\nBefore launch:\n' + todo.map((t) => ' - ' + t).join('\n'));
