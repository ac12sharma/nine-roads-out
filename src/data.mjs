// The data the trip planner reads in the browser (assets/data.*.json), built from the content files.
// Also used by the optional AI back end and by tests/planner-eval.test.mjs.
import { TRIPS } from './content/trips.mjs';
import { RESTAURANTS, mapsSearch } from './content/restaurants.mjs';
import { bearingOf, windOf } from './lib.mjs';

/** Drives with their compass bearing and heading from Dublin added. */
export const trips = TRIPS.map((t) => { const b = bearingOf(t); return { ...t, b, wind: windOf(b) }; });

/** @returns {import('./shared/planner.mjs').PlannerData} */
export function plannerData() {
  return {
    trips: trips.map((t) => ({ id: t.id, slug: t.slug, en: t.en, ga: t.ga, via: t.via, county: t.county, mins: t.mins, drive: t.drive, km: t.km, wind: t.wind, tags: t.tags, best: t.best, desc: t.desc, blurb: (t.lede.match(/^.*?[.!?](\s|$)/) || [t.desc])[0].trim(), counties: t.counties, words: t.words, stops: t.stops.filter((x) => !x.home).map((x) => x.n) })),
    eat: Object.fromEntries(Object.entries(RESTAURANTS).map(([k, v]) => [k, v.map((x) => ({ name: x.name, town: x.town, type: x.type, cuisine: x.cuisine, near: x.near, note: x.note, map: mapsSearch(x), url: x.url || '', featured: !!x.featured }))])),
  };
}
