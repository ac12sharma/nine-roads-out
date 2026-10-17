// Builds the static site into ./dist (or ./preview with --preview). No dependencies: Node 18+ only.
//   npm run build     -> dist/   (deploy this folder)
//   npm run preview   -> preview/ (relative links, ad spaces shown as placeholders)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import config from '../site.config.mjs';
import { TRIPS } from './content/trips.mjs';
import { RESTAURANTS, mapsSearch } from './content/restaurants.mjs';
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

// 3. Data for the trip planner and traveller levels, also content-hashed.
const trips = TRIPS.map((t) => { const b = bearingOf(t); return { ...t, b, wind: windOf(b) }; });
const chatData = {
  trips: trips.map((t) => ({ id: t.id, slug: t.slug, en: t.en, ga: t.ga, via: t.via, county: t.county, mins: t.mins, drive: t.drive, km: t.km, wind: t.wind, tags: t.tags, best: t.best, desc: t.desc, blurb: (t.lede.match(/^.*?[.!?](\s|$)/) || [t.desc])[0].trim(), counties: t.counties, words: t.words, stops: t.stops.filter((x) => !x.home).map((x) => x.n) })),
  eat: Object.fromEntries(Object.entries(RESTAURANTS).map(([k, v]) => [k, v.map((x) => ({ name: x.name, town: x.town, type: x.type, cuisine: x.cuisine, near: x.near, note: x.note, map: mapsSearch(x), url: x.url || '' }))])),
};
{
  const json = JSON.stringify(chatData);
  const hash = crypto.createHash('sha1').update(json).digest('hex').slice(0, 10);
  fs.writeFileSync(path.join(out, 'assets', `data.${hash}.json`), json);
  assets.data = `/assets/data.${hash}.json`;
}
const irelandMap = JSON.parse(fs.readFileSync(path.join(root, 'src/content/ireland-map.json'), 'utf8'));

// 4. Pages.
const r = createRenderer({ config, trips, assets, preview, restaurants: RESTAURANTS, irelandMap });
const write = (rel, html) => { const f = path.join(out, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, html); };

write('index.html', r.home({ fragment: preview }));
trips.forEach((t, i) => write(`${t.slug}/index.html`, r.trip(t, i)));
write('driving-guide/index.html', r.guide());
write('how-much-of-ireland/index.html', r.ireland());
write('about/index.html', r.about());
write('contact/index.html', r.contact());
write('privacy/index.html', r.privacy());
write('terms/index.html', r.terms());
write('404.html', r.notFound());

// 5. Search, ads and hosting files.
const urls = ['/', ...trips.map((t) => `/${t.slug}/`), '/how-much-of-ireland/', '/driving-guide/', '/about/', '/contact/', '/privacy/', '/terms/'];
const today = new Date().toISOString().slice(0, 10);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${config.siteUrl}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt', preview ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\n\nSitemap: ${config.siteUrl}/sitemap.xml\n`);
if (config.adsense.client) write('ads.txt', `google.com, ${config.adsense.client.replace(/^ca-/, '')}, DIRECT, f08c47fec0942fa0\n`);
write('site.webmanifest', JSON.stringify({ name: config.name, short_name: config.name, start_url: '/', display: 'browser', background_color: '#ECEFE8', theme_color: '#0B6A47', icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }] }, null, 2));

// 6. Optional AI back end for the trip planner (Cloudflare Pages Function).
const fnFile = path.join(root, 'functions/api/chat.js');
if (config.chat.ai && !preview) {
  const tpl = fs.readFileSync(path.join(root, 'src/functions/chat.js'), 'utf8');
  fs.mkdirSync(path.dirname(fnFile), { recursive: true });
  fs.writeFileSync(fnFile, tpl.replace('/*__KNOWLEDGE__*/null', JSON.stringify({ model: config.chat.model, site: config.name, data: chatData })));
} else if (!preview && fs.existsSync(fnFile)) {
  fs.rmSync(fnFile);
}

// 7. Launch checklist in the terminal.
const todo = [];
if (!config.contactEmail) todo.push('Add contactEmail in site.config.mjs (AdSense reviewers look for a working contact route).');
if (!config.adsense.client) todo.push('Add your AdSense publisher ID (adsense.client) once your account is approved.');
if (Object.values(config.affiliates).some((a) => !/[?&](aid|a_aid|partner_id|affiliate|ref)=/i.test(a.url))) todo.push('Swap the affiliate URLs for your tracked partner links.');
console.log(`Built ${urls.length + 1} pages into ${path.relative(root, out)}/${preview ? ' (preview)' : ''}`);
if (!preview && todo.length) console.log('\nBefore launch:\n' + todo.map((t) => ' - ' + t).join('\n'));
