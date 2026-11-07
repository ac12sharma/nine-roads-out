// The newsletter sign-up: hidden while newsletter.action is empty, and matching Buttondown's embed form
// once it is set. Renders pages directly with a modified config rather than editing site.config.mjs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import config from '../site.config.mjs';
import { createRenderer } from '../src/pages.mjs';
import { trips } from '../src/data.mjs';
import { RESTAURANTS } from '../src/content/restaurants.mjs';
import { THEMES } from '../src/content/guides.mjs';

const irelandMap = JSON.parse(fs.readFileSync(new URL('../src/content/ireland-map.json', import.meta.url), 'utf8'));
const assets = { css: '/assets/site.css', scenes: '/assets/scenes.js', app: '/assets/app.js', data: '/assets/data.json' };
const ACTION = 'https://buttondown.com/api/emails/embed-subscribe/nineroadsout';
const render = (/** @type {object} */ newsletter, preview = false) => createRenderer({ config: { ...config, newsletter: { ...config.newsletter, ...newsletter } }, trips, assets, preview, restaurants: RESTAURANTS, irelandMap });
const pagesOf = (/** @type {ReturnType<typeof createRenderer>} */ r) => [r.home(), r.trip(trips[0], 0), r.theme(THEMES[0])];

test('site.config.mjs ships with the newsletter switched off', () => {
  assert.equal(config.newsletter.action, '', 'leave newsletter.action empty until the Buttondown account exists');
  assert.equal(config.newsletter.field, 'email');
  assert.deepEqual(config.newsletter.hidden, { embed: '1' });
});

test('with no form address, production pages have no sign-up box and Privacy has no newsletter section', () => {
  const r = render({ action: '' });
  for (const html of pagesOf(r)) assert.doesNotMatch(html, /class="news-form"/);
  assert.doesNotMatch(r.privacy(), /<h2>Newsletter<\/h2>/);
});

test('the preview build shows a demo box that submits nowhere', () => {
  const html = render({ action: '' }, true).home();
  assert.match(html, /<form class="news-form" action="#" method="post" data-where="home" data-demo>/);
});

test('with a Buttondown address, the form matches Buttondown’s embed code', () => {
  const r = render({ action: ACTION });
  for (const html of pagesOf(r)) {
    const form = html.match(/<form class="news-form"[\s\S]*?<\/form>/)?.[0];
    assert.ok(form, 'no sign-up form');
    assert.match(form, new RegExp(`action="${ACTION}" method="post" data-where="\\w+">`));
    assert.match(form, /<input id="news-email-\w+" type="email" name="email" required/);
    assert.match(form, /<input type="hidden" name="embed" value="1">/);
    assert.doesNotMatch(form, /target=/, 'Buttondown’s form opens its confirmation page in the same tab');
  }
  assert.match(r.privacy(), /<h2>Newsletter<\/h2>/);
  assert.match(r.privacy(), /Buttondown/);
});
