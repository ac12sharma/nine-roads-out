// The Privacy and Terms pages describe what the built site does: each feature is mentioned when it's
// switched on in site.config.mjs, and not when it's off.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import config from '../site.config.mjs';
import { createRenderer } from '../src/pages.mjs';
import { trips } from '../src/data.mjs';
import { RESTAURANTS } from '../src/content/restaurants.mjs';
import { PHOTOS } from '../src/content/photos.mjs';

const irelandMap = JSON.parse(fs.readFileSync(new URL('../src/content/ireland-map.json', import.meta.url), 'utf8'));
const assets = { css: '/a.css', scenes: '/s.js', app: '/app.js', data: '/d.json' };
const photos = Object.fromEntries(Object.entries(PHOTOS).map(([k, list]) => [k, list.map((p) => ({ ...p, w: 1600, h: 1067 }))]));
const text = (/** @type {string} */ html) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const render = (/** @type {object} */ over = {}) => {
  const c = { ...config, ...over };
  const r = createRenderer({ config: c, trips, assets, preview: false, restaurants: RESTAURANTS, irelandMap, photos });
  return { privacy: text(r.privacy()), terms: text(r.terms()) };
};

const OFF = render();
const ON = render({
  adsense: { ...config.adsense, client: 'ca-pub-0000000000000000' },
  analytics: { cloudflareToken: 'token', cloudflareDashboard: false, events: true },
  newsletter: { ...config.newsletter, action: 'https://buttondown.com/api/emails/embed-subscribe/test' },
  chat: { ...config.chat, ai: true },
});

test('with everything off, Privacy mentions none of the optional services', () => {
  for (const s of ['Google AdSense', 'Cloudflare Web Analytics', 'Buttondown', 'Anthropic', 'Cookie settings', 'Clicks.']) assert.ok(!OFF.privacy.includes(s), `Privacy mentions "${s}" while it is off`);
  assert.match(OFF.privacy, /does not show ads at the moment/);
  assert.match(OFF.privacy, /What you type is not sent anywhere/);
  assert.match(OFF.privacy, /does not set any cookies of its own/);
  assert.doesNotMatch(OFF.privacy, /consent for/, 'nothing relies on consent while everything is off');
});

test('with everything on, Privacy describes each service', () => {
  for (const s of ['Google AdSense', 'Cookie settings', 'Cloudflare Web Analytics', 'Clicks.', 'Buttondown', 'United States', 'Anthropic', 'deleted after two days']) assert.ok(ON.privacy.includes(s), `Privacy doesn't mention "${s}" while it is on`);
  assert.match(ON.privacy, /We rely on your consent for advertising cookies and the newsletter/);
});

test('Privacy makes no claims the site can’t back up', () => {
  for (const p of [OFF.privacy, ON.privacy]) {
    assert.doesNotMatch(p, /kept for a short period/, 'the host’s log retention isn’t ours to state');
    assert.doesNotMatch(p, /track you across other sites/, 'not stated by Cloudflare');
    assert.doesNotMatch(p, /removed from the list/, 'Buttondown keeps unsubscribed addresses');
  }
});

test('Terms credit the photographers, OpenStreetMap and Natural Earth, and mention paid placements', () => {
  assert.match(OFF.terms, /Photos credited to other photographers belong to them/);
  assert.match(OFF.terms, /© OpenStreetMap contributors/);
  assert.match(OFF.terms, /Natural Earth/);
  assert.match(OFF.terms, /featured listings are paid placements/);
});

test('both pages show when they were last updated', () => {
  assert.match(config.policiesUpdated, /^(January|February|March|April|May|June|July|August|September|October|November|December) \d{4}$/);
  const html = createRenderer({ config, trips, assets, preview: false, restaurants: RESTAURANTS, irelandMap, photos });
  assert.ok(html.privacy().includes(`Last updated ${config.policiesUpdated}`));
  assert.ok(html.terms().includes(`Last updated ${config.policiesUpdated}`));
});
