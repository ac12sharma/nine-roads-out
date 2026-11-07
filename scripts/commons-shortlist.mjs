// Searches Wikimedia Commons for photos of each drive and lists the ones that meet the site's rules:
// - licence CC0, public domain or CC BY (no NonCommercial, NoDerivatives or ShareAlike)
// - no restrictions noted (personality rights, trademarks, "not free in all countries")
// - landscape, at least 2000 px wide
// It downloads nothing into the repo. It prints a shortlist with the Commons page, author, licence
// and a thumbnail link, for a person to check that each photo shows what it should and has no
// recognisable people, and to approve before anything is used.
//   node scripts/commons-shortlist.mjs [--json file]
import fs from 'node:fs';

const UA = 'NineRoadsOut-photo-shortlist/1.0 (https://nineroadsout.com; hello@nineroadsout.com)';
const API = 'https://commons.wikimedia.org/w/api.php';
/** Searches per drive: the sights a photo should show. */
const SEARCH = {
  glendalough: ['Glendalough Upper Lake', 'Glendalough round tower', 'Lough Tay'],
  boyne: ['Newgrange', 'Hill of Tara', 'Monasterboice'],
  cooley: ['Carlingford Lough', 'Carlingford County Louth', 'Cooley Mountains'],
  loughcrew: ['Loughcrew', 'Fore Abbey'],
  slievebloom: ['Slieve Bloom Mountains', 'Birr Castle', 'Clonmacnoise'],
  leinster: ['Mount Leinster', 'Brownshill Dolmen'],
  cashel: ['Rock of Cashel', 'Cahir Castle', 'Knockmealdown Mountains'],
  copper: ['Copper Coast Waterford', 'Tankardstown engine house', 'Bunmahon'],
  hook: ['Hook Lighthouse', 'Hook Head', 'Tintern Abbey Wexford'],
};
const OK_LICENCE = /^(cc0|public domain|pd|cc by \d(\.\d)?( [a-z]+)?)$/i;
const BAD = /\b(sa|nc|nd)\b|share ?alike|non-?commercial|no ?deriv/i;

const sleep = (/** @type {number} */ ms) => new Promise((r) => setTimeout(r, ms));
const strip = (/** @type {string} */ html = '') => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

async function search(/** @type {string} */ q) {
  const p = new URLSearchParams({ action: 'query', format: 'json', generator: 'search', gsrnamespace: '6', gsrsearch: `${q} filetype:bitmap`, gsrlimit: '40', prop: 'imageinfo|categories', iiprop: 'url|size|extmetadata', iiurlwidth: '480', clshow: '!hidden', cllimit: 'max' });
  for (let i = 0; i < 4; i++) {
    const res = await fetch(`${API}?${p}`, { headers: { 'user-agent': UA } });
    if (res.status === 429) { await sleep(30000); continue; }
    if (!res.ok) throw new Error(`${res.status} for "${q}"`);
    await sleep(1500);
    return Object.values((await res.json()).query?.pages || {});
  }
  throw new Error(`rate-limited on "${q}"`);
}

const out = {};
for (const [drive, queries] of Object.entries(SEARCH)) {
  const seen = new Set(), keep = [];
  for (const q of queries) {
    for (const pg of await search(q)) {
      const ii = pg.imageinfo?.[0], m = ii?.extmetadata || {};
      if (!ii || seen.has(pg.title)) continue;
      seen.add(pg.title);
      const licence = strip(m.LicenseShortName?.value);
      const restrictions = strip(m.Restrictions?.value);
      if (!OK_LICENCE.test(licence) || BAD.test(licence)) continue;
      if (restrictions) continue;
      if (ii.width < 2000 || ii.width <= ii.height) continue;
      keep.push({
        file: pg.title, page: ii.descriptionurl, thumb: ii.thumburl, width: ii.width, height: ii.height,
        licence, licenceUrl: strip(m.LicenseUrl?.value) || null, author: strip(m.Artist?.value), credit: strip(m.Credit?.value),
        date: strip(m.DateTimeOriginal?.value || m.DateTime?.value).slice(0, 10), description: strip(m.ImageDescription?.value).slice(0, 200),
        categories: (pg.categories || []).map((c) => c.title.replace(/^Category:/, '')), query: q,
      });
    }
  }
  keep.sort((a, b) => b.width - a.width);
  out[drive] = keep;
  console.log(`\n## ${drive}: ${keep.length} candidates`);
  for (const k of keep.slice(0, 8)) console.log(`- ${k.file.replace('File:', '')} | ${k.width}x${k.height} | ${k.licence} | ${k.author.slice(0, 40)} | ${k.date} | ${k.page}`);
}
const at = process.argv.indexOf('--json');
if (at > -1) fs.writeFileSync(process.argv[at + 1], JSON.stringify(out, null, 2));
