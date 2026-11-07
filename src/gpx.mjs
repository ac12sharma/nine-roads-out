// GPX files for each drive, built from src/content/coords.json. That file only holds stops whose
// position two independent sources (OpenStreetMap and Wikidata) agree on; see scripts/geocode-stops.mjs.
// Stops without a verified position are left out rather than guessed, and the file says so.
import { esc } from './shared/format.mjs';

/** @typedef {{ n: string, lat?: number, lon?: number, osm?: string, wikidata?: string, skipped?: string }} Coord */

/**
 * @param {{ en: string, slug: string, via: string }} t
 * @param {Coord[]} coords the drive's stops in route order
 * @param {string} url the drive page
 */
export function gpxFor(t, coords, url) {
  const ok = coords.filter((c) => c.lat != null && c.lon != null);
  const missing = coords.filter((c) => c.skipped).map((c) => c.n);
  const pt = (/** @type {string} */ tag, /** @type {Coord} */ c) => `<${tag} lat="${c.lat}" lon="${c.lon}"><name>${esc(c.n)}</name><link href="${esc(c.osm || '')}"><text>OpenStreetMap</text></link></${tag}>`;
  const note = `Stops on the ${t.en} drive from Nine Roads Out, in route order. Positions are from OpenStreetMap, checked against Wikidata.`
    + (missing.length ? ` Not included, because no verified position was found: ${missing.join(', ')}.` : '')
    + ' The route between stops is yours to plan: this file holds points, not roads.';
  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Nine Roads Out" xmlns="http://www.topografix.com/GPX/1/1">
<metadata><name>${esc(t.en)}: ${esc(t.via)}</name><desc>${esc(note)}</desc><copyright author="OpenStreetMap contributors"><license>https://opendatacommons.org/licenses/odbl/</license></copyright><link href="${esc(url)}"><text>${esc(t.en)} on Nine Roads Out</text></link></metadata>
${ok.map((c) => pt('wpt', c)).join('\n')}
<rte><name>${esc(t.en)}</name>
${ok.map((c) => pt('rtept', c)).join('\n')}
</rte>
</gpx>
`;
}
