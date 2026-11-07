// Click events: the allow-list and cleaning, the /api/event function, and that nothing is wired up
// while analytics.events is off.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import config from '../site.config.mjs';
import { EVENTS, cleanEvent } from '../src/shared/events.mjs';
import { createRenderer } from '../src/pages.mjs';
import { trips } from '../src/data.mjs';
import { RESTAURANTS } from '../src/content/restaurants.mjs';

/** The function as the build writes it, with the event list filled in. */
async function loadFunction() {
  const src = fs.readFileSync(new URL('../src/functions/event.js', import.meta.url), 'utf8')
    .replace('/*__EVENTS__*/null', JSON.stringify(Object.fromEntries(Object.keys(EVENTS).map((k) => [k, 1]))));
  return import('data:text/javascript;base64,' + Buffer.from(src).toString('base64') + '#' + Math.random());
}
const post = (/** @type {unknown} */ body, origin = 'https://nineroadsout.com') => new Request('https://nineroadsout.com/api/event', { method: 'POST', headers: { Origin: origin, 'content-type': 'application/json' }, body: typeof body === 'string' ? body : JSON.stringify(body) });

test('events are switched off in site.config.mjs', () => {
  assert.equal(config.analytics.events, false);
});

test('only listed events are accepted, and paths and labels are cleaned', () => {
  assert.equal(cleanEvent('page_view', '/', ''), null);
  assert.equal(cleanEvent(42, '/', ''), null);
  assert.equal(cleanEvent('toString', '/', ''), null, 'inherited object keys are not events');
  assert.deepEqual(cleanEvent('gpx_download', '/hook/?utm_source=x#top', 'Hook'), { e: 'gpx_download', p: '/hook/', l: 'hook' });
  assert.deepEqual(cleanEvent('sponsored_click', 'https://evil.example/', 'Discovercars.com'), { e: 'sponsored_click', p: '/', l: 'discovercars.com' });
  const long = cleanEvent('share', '/' + 'a'.repeat(500), 'x'.repeat(500) + ' <script>');
  assert.ok(long && long.p.length <= 120 && long.l.length <= 60 && !/[<> ]/.test(long.l));
});

test('the function writes the event name, path and label, and nothing about the visitor', async () => {
  const { onRequestPost } = await loadFunction();
  const points = [];
  const env = { EVENTS: { writeDataPoint: (/** @type {unknown} */ d) => points.push(d) } };
  const res = await onRequestPost({ request: post({ e: 'maps_open', p: '/boyne/', l: 'boyne', ip: '1.2.3.4', ua: 'x' }), env });
  assert.equal(res.status, 204);
  assert.deepEqual(points, [{ indexes: ['maps_open'], blobs: ['maps_open', '/boyne/', 'boyne'] }]);
});

test('the function refuses other sites, unknown events, junk and oversized bodies', async () => {
  const { onRequestPost } = await loadFunction();
  const points = [];
  const env = { EVENTS: { writeDataPoint: (/** @type {unknown} */ d) => points.push(d) } };
  assert.equal((await onRequestPost({ request: post({ e: 'maps_open', p: '/' }, 'https://evil.example'), env })).status, 403);
  assert.equal((await onRequestPost({ request: post({ e: 'page_view', p: '/' }), env })).status, 400);
  assert.equal((await onRequestPost({ request: post('not json'), env })).status, 400);
  assert.equal((await onRequestPost({ request: post({ e: 'share', p: '/', l: 'x'.repeat(1000) }), env })).status, 413);
  assert.equal(points.length, 0);
});

test('without the Analytics Engine binding the function accepts events and drops them', async () => {
  const { onRequestPost } = await loadFunction();
  assert.equal((await onRequestPost({ request: post({ e: 'share', p: '/', l: 'copy' }), env: {} })).status, 204);
});

test('the function cleans events exactly as the browser does', async () => {
  const fn = fs.readFileSync(new URL('../src/functions/event.js', import.meta.url), 'utf8');
  const shared = fs.readFileSync(new URL('../src/shared/events.mjs', import.meta.url), 'utf8');
  const body = (/** @type {string} */ s) => s.slice(s.indexOf("const path = typeof p"), s.indexOf('return { e, p:')).trim();
  assert.equal(body(fn), body(shared), 'update src/functions/event.js to match src/shared/events.mjs');
});

test('pages tell the browser where to send events only when events are on', () => {
  const assets = { css: '/a.css', scenes: '/s.js', app: '/app.js', data: '/d.json' };
  const irelandMap = JSON.parse(fs.readFileSync(new URL('../src/content/ireland-map.json', import.meta.url), 'utf8'));
  const render = (/** @type {boolean} */ events) => createRenderer({ config: { ...config, analytics: { ...config.analytics, events } }, trips, assets, preview: false, restaurants: RESTAURANTS, irelandMap });
  const off = render(false), on = render(true);
  assert.doesNotMatch(off.home(), /data-events=/);
  assert.doesNotMatch(off.privacy(), /<strong>Clicks\.<\/strong>/);
  assert.match(on.home(), /<html lang="en-IE" data-events="\/api\/event">/);
  assert.match(on.privacy(), /<strong>Clicks\.<\/strong>/);
});
