// Content validation: catches typos and missing fields in the hand-written data before they reach a page.
//   node --test tests/content.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { TRIPS, FILTERS } from '../src/content/trips.mjs';
import { RESTAURANTS, TYPES } from '../src/content/restaurants.mjs';
import { THEMES, NOCAR } from '../src/content/guides.mjs';
import { PHOTOS } from '../src/content/photos.mjs';
import { FAQS } from '../src/content/faqs.mjs';

const MAP = JSON.parse(fs.readFileSync(new URL('../src/content/ireland-map.json', import.meta.url), 'utf8'));
const COUNTIES = Object.keys(MAP.counties);
const IDS = TRIPS.map((t) => t.id);
const TAGS = FILTERS.map(([k]) => k).filter((k) => k !== 'all');
const nonEmpty = (v) => typeof v === 'string' && v.trim().length > 0;

test('the county map has the 26 counties of the Republic', () => {
  assert.equal(COUNTIES.length, 26);
  assert.ok(COUNTIES.includes('Dublin'));
});

test('there are nine drives with unique ids and slugs', () => {
  assert.equal(TRIPS.length, 9);
  assert.equal(new Set(IDS).size, 9);
  assert.equal(new Set(TRIPS.map((t) => t.slug)).size, 9);
});

for (const t of TRIPS) {
  test(`drive "${t.id}" has every required field`, () => {
    for (const k of ['ga', 'en', 'via', 'county', 'sig', 'best', 'lede', 'alt', 'desc', 'stay', 'stayLabel']) assert.ok(nonEmpty(t[k]), `${k} is missing`);
    for (const k of ['mins', 'km', 'drive']) assert.ok(Number.isFinite(t[k]) && t[k] > 0, `${k} must be a positive number`);
    assert.ok(t.lat > 51 && t.lat < 55.5 && t.lon > -10.7 && t.lon < -5.9, 'lat/lon must be in Ireland');
    assert.ok(t.desc.length <= 170, `search description is ${t.desc.length} characters; keep it under 170`);
    assert.ok(t.tour === null || nonEmpty(t.tour), 'tour is a search phrase or null');
  });

  test(`drive "${t.id}" has stops ending at home, with roads`, () => {
    assert.ok(t.stops.length >= 3);
    t.stops.forEach((s, i) => { assert.ok(nonEmpty(s.n) && nonEmpty(s.t) && nonEmpty(s.road), `stop ${i + 1} is incomplete`); });
    assert.equal(t.stops.filter((s) => s.home).length, 1, 'exactly one home leg');
    assert.ok(t.stops.at(-1).home, 'the home leg comes last');
  });

  test(`drive "${t.id}" lists valid counties, tags and planner words`, () => {
    assert.ok(t.counties.length >= 2);
    for (const c of t.counties) assert.ok(COUNTIES.includes(c), `"${c}" is not a county in ireland-map.json`);
    assert.ok(t.counties.includes('Dublin'), 'every round trip starts in Dublin');
    assert.equal(new Set(t.counties).size, t.counties.length, 'no duplicate counties');
    assert.ok(t.tags.length >= 1);
    for (const g of t.tags) assert.ok(TAGS.includes(g), `unknown tag "${g}"`);
    for (const w of t.words) assert.equal(w, w.toLowerCase(), `planner word "${w}" must be lower case`);
  });

  test(`drive "${t.id}" has official links and a maps route`, () => {
    assert.ok(t.know.length >= 2 && t.know.every(nonEmpty));
    assert.ok(t.links.length >= 1);
    for (const [label, url] of t.links) { assert.ok(nonEmpty(label)); assert.match(url, /^https:\/\//, `${label} must use https`); }
    assert.ok(nonEmpty(t.maps.dest));
    assert.ok(Array.isArray(t.maps.way));
  });
}

test('every restaurant is on a known drive with a valid type and cuisine', () => {
  for (const [id, list] of Object.entries(RESTAURANTS)) {
    assert.ok(IDS.includes(id), `restaurants listed under unknown drive "${id}"`);
    for (const r of list) {
      const where = `${r.name} (${id})`;
      for (const k of ['name', 'town', 'note', 'near']) assert.ok(nonEmpty(r[k]), `${where}: ${k} is missing`);
      assert.ok(TYPES.includes(r.type), `${where}: type "${r.type}" is not one of ${TYPES.join(', ')}`);
      assert.ok(Array.isArray(r.cuisine) && r.cuisine.length && r.cuisine.every(nonEmpty), `${where}: cuisine must be a non-empty list`);
      if (r.url) assert.match(r.url, /^https:\/\//, `${where}: url must use https`);
      if (r.featured) assert.ok(r.url, `${where}: a featured listing needs a url, which is marked rel="sponsored"`);
    }
  }
});

test('theme pages have unique slugs, every field, and at least two drives', () => {
  assert.equal(new Set(THEMES.map((th) => th.slug)).size, THEMES.length);
  for (const th of THEMES) {
    for (const k of ['key', 'slug', 'og', 'nav', 'title', 'h1', 'lede', 'desc', 'choose']) assert.ok(nonEmpty(th[k]), `${th.slug}: ${k} is missing`);
    assert.ok(IDS.includes(th.og), `${th.slug}: og image "${th.og}" is not a drive id`);
    assert.ok(TRIPS.filter(th.pick).length >= 2, `${th.slug} picks fewer than two drives`);
    for (const id of Object.keys(th.angle)) assert.ok(IDS.includes(id), `${th.slug}: angle for unknown drive "${id}"`);
    assert.ok(th.tips.length >= 1 && th.tips.every(([h, p]) => nonEmpty(h) && nonEmpty(p)));
  }
});

test('the no-car guide covers every drive with a valid level', () => {
  assert.deepEqual(Object.keys(NOCAR).sort(), [...IDS].sort());
  for (const [id, n] of Object.entries(NOCAR)) {
    assert.ok(['easy', 'part', 'car'].includes(n.level), `${id}: level "${n.level}"`);
    assert.ok(nonEmpty(n.text));
    for (const [label, url] of n.links) { assert.ok(nonEmpty(label)); assert.match(url, /^https:\/\//); }
  }
});

test('every listed photo exists and has alt text', () => {
  for (const [id, list] of Object.entries(PHOTOS)) {
    assert.ok(IDS.includes(id), `photos listed under unknown drive "${id}"`);
    for (const p of list) {
      assert.ok(fs.existsSync(new URL(`../public/photos/${p.file}`, import.meta.url)), `missing public/photos/${p.file}`);
      assert.ok(nonEmpty(p.alt), `${p.file}: alt text is missing`);
    }
  }
});

const isDate = (/** @type {unknown} */ d) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d)) && Date.parse(d) <= Date.now();

test('every drive says when its practical details were last checked', () => {
  for (const t of TRIPS) assert.ok(isDate(t.checked), `${t.id}: checked must be a past date like 2026-11-07, got ${t.checked}`);
});

test('every FAQ answer names an official https source and the date it was read', () => {
  for (const [key, list] of Object.entries(FAQS)) {
    assert.ok(list.length >= 3, `${key}: an FAQ needs at least three questions`);
    for (const f of list) {
      assert.ok(nonEmpty(f.q) && f.q.trim().endsWith('?'), `${key}: "${f.q}" must be a question`);
      assert.ok(nonEmpty(f.a) && f.a.length >= 60, `${key}: the answer to "${f.q}" is too short`);
      assert.match(f.source, /^https:\/\//, `${key}: "${f.q}" needs an https source`);
      assert.ok(isDate(f.checked), `${key}: "${f.q}" needs the date its source was read`);
    }
  }
  for (const key of Object.keys(FAQS)) assert.ok(key === 'car-hire' || IDS.includes(key), `FAQ for unknown page "${key}"`);
});

test('GPX coordinates: every stop is verified by two sources or says why it was left out', () => {
  const coords = JSON.parse(fs.readFileSync(new URL('../src/content/coords.json', import.meta.url), 'utf8'));
  assert.deepEqual(Object.keys(coords).sort(), [...IDS].sort());
  for (const t of TRIPS) {
    const names = t.stops.filter((s) => !s.home).map((s) => s.n);
    assert.deepEqual(coords[t.id].map((/** @type {{ n: string }} */ c) => c.n), names, `${t.id}: coords.json is out of step with the stops; re-run scripts/geocode-stops.mjs`);
    for (const c of coords[t.id]) {
      if (c.skipped) { assert.ok(nonEmpty(c.skipped)); assert.equal(c.lat, undefined); continue; }
      assert.ok(c.lat > 51.3 && c.lat < 55.5 && c.lon > -10.7 && c.lon < -5.9, `${t.id}: ${c.n} is not in Ireland`);
      assert.match(c.osm, /^https:\/\/www\.openstreetmap\.org\//, `${t.id}: ${c.n} needs its OpenStreetMap source`);
      assert.match(c.wikidata, /^https:\/\/www\.wikidata\.org\/wiki\/Q\d+$/, `${t.id}: ${c.n} needs its Wikidata source`);
      assert.ok(c.km <= 1.5, `${t.id}: ${c.n}: the sources are ${c.km} km apart`);
    }
  }
});
