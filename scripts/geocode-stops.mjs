// Looks up each drive stop in two independent sources, OpenStreetMap (Nominatim) and Wikidata, and
// keeps a coordinate only when both agree to within 1.5 km. The result is written to
// src/content/coords.json for review, and the build turns it into one GPX file per drive.
// Stops that don't match, or that are a stretch of road rather than a place, are left out.
//   node scripts/geocode-stops.mjs            (about one request a second, as Nominatim's policy asks)
import fs from 'node:fs';
import { TRIPS } from '../src/content/trips.mjs';

// Wikimedia and Nominatim both ask for a User-Agent that says who you are and how to reach you.
const UA = 'NineRoadsOut-geocode/1.0 (https://nineroadsout.com; hello@nineroadsout.com)';
const OUT = new URL('../src/content/coords.json', import.meta.url);
const MAX_KM = 1.5;
// What to search for when the stop's display name isn't a findable place name.
/** @type {Record<string, string>} */
const QUERY = {
  'Lough Tay viewpoint': 'Lough Tay',
  'Brú na Bóinne': 'Brú na Bóinne Visitor Centre',
  'Long Woman’s Grave, Windy Gap': 'Windy Gap, Cooley',
  'Loughcrew Cairns': 'Loughcrew',
  'Metal Man, Tramore': 'Metal Man Tramore',
  'Tankardstown engine house': 'Tankardstown',
  'Fethard-on-Sea and Baginbun': 'Baginbun Head',
};

const sleep = (/** @type {number} */ ms) => new Promise((r) => setTimeout(r, ms));
const km = (/** @type {number} */ a, /** @type {number} */ b, /** @type {number} */ c, /** @type {number} */ d) => {
  const R = 6371, r = Math.PI / 180, x = (c - a) * r, y = (d - b) * r * Math.cos(((a + c) / 2) * r);
  return R * Math.sqrt(x * x + y * y);
};
async function json(/** @type {string} */ url, tries = 4) {
  const res = await fetch(url, { headers: { 'user-agent': UA, accept: 'application/json' } });
  // Back off when rate-limited, as the Wikimedia API guidelines ask.
  if (res.status === 429 && tries > 1) { await sleep(Number(res.headers.get('retry-after')) * 1000 || 30000); return json(url, tries - 1); }
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

/** OpenStreetMap: up to five candidates in Ireland (Northern Ireland included, for the Mournes side). */
async function osm(/** @type {string} */ q) {
  const r = await json('https://nominatim.openstreetmap.org/search?' + new URLSearchParams({ q, format: 'jsonv2', limit: '5', countrycodes: 'ie,gb' }));
  await sleep(1100);
  return r.map((/** @type {any} */ x) => ({ lat: +x.lat, lon: +x.lon, ref: `https://www.openstreetmap.org/${x.osm_type}/${x.osm_id}`, label: x.display_name }));
}

/** Wikidata: up to ten search results, with their coordinates (P625) fetched in one request. */
async function wikidata(/** @type {string} */ q) {
  const s = await json('https://www.wikidata.org/w/api.php?' + new URLSearchParams({ action: 'wbsearchentities', search: q, language: 'en', format: 'json', limit: '10' }));
  const ids = (s.search || []).map((/** @type {any} */ h) => h.id);
  if (!ids.length) return [];
  const e = await json('https://www.wikidata.org/w/api.php?' + new URLSearchParams({ action: 'wbgetentities', ids: ids.join('|'), props: 'claims|labels|descriptions', languages: 'en', format: 'json' }));
  await sleep(2000);
  return ids.flatMap((/** @type {string} */ id) => {
    const ent = e.entities[id], c = ent?.claims?.P625?.[0]?.mainsnak?.datavalue?.value;
    return c ? [{ lat: c.latitude, lon: c.longitude, ref: `https://www.wikidata.org/wiki/${id}`, label: (ent.labels?.en?.value || id) + (ent.descriptions?.en ? ` (${ent.descriptions.en.value})` : '') }] : [];
  });
}

/** @type {Record<string, { n: string, lat?: number, lon?: number, osm?: string, wikidata?: string, km?: number, skipped?: string }[]>} */
const out = {};
for (const t of TRIPS) {
  out[t.id] = [];
  for (const s of t.stops.filter((x) => !x.home)) {
    const name = QUERY[s.n] || s.n;
    // Only candidates within 120 km of the drive's destination count, which rules out namesakes
    // elsewhere (there is a Tintern Abbey in Wales). Then the closest OSM/Wikidata pair wins.
    const near = (/** @type {{ lat: number, lon: number }} */ c) => km(c.lat, c.lon, t.lat, t.lon) <= 120;
    const A = (await osm(name + ', Ireland').catch((e) => { console.error(String(e)); return []; })).filter(near);
    const B = (await wikidata(name).catch((e) => { console.error(String(e)); return []; })).filter(near);
    let best = null;
    for (const a of A) for (const b of B) { const d = km(a.lat, a.lon, b.lat, b.lon); if (!best || d < best.d) best = { a, b, d }; }
    if (best && best.d <= MAX_KM) out[t.id].push({ n: s.n, lat: +best.a.lat.toFixed(5), lon: +best.a.lon.toFixed(5), osm: best.a.ref, wikidata: best.b.ref, km: +best.d.toFixed(2) });
    else out[t.id].push({ n: s.n, skipped: !A.length ? 'not found in OpenStreetMap' : !B.length ? 'no Wikidata coordinate nearby' : `closest sources ${best?.d.toFixed(1)} km apart (${best?.a.label} / ${best?.b.label})` });
    const last = out[t.id].at(-1);
    console.log(t.id.padEnd(12), s.n.padEnd(34), last?.skipped || `ok, ${last?.km} km apart (${last?.wikidata})`);
  }
}
fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');
