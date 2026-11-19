// The optional AI back end for the trip planner (src/functions/chat.js): off by default, the request it
// sends to the Claude API, per-visitor and site-wide rate limits, and that IP addresses aren't stored.
import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import config from '../site.config.mjs';

const LIMITS = { perMinute: 3, perDay: 5, dailyCap: 8 };
async function load() {
  const src = fs.readFileSync(new URL('../src/functions/chat.js', import.meta.url), 'utf8')
    .replace('/*__KNOWLEDGE__*/null', JSON.stringify({ model: 'claude-haiku-5-5', site: 'Nine Roads Out', limits: LIMITS, data: { trips: [] } }));
  return import('data:text/javascript;base64,' + Buffer.from(src).toString('base64') + '#' + Math.random());
}
const ask = (ip = '203.0.113.7', origin = 'https://nineroadsout.com', q = 'Is the Sally Gap open in snow?') => new Request('https://nineroadsout.com/api/chat', {
  method: 'POST', headers: { Origin: origin, 'CF-Connecting-IP': ip, 'content-type': 'application/json' },
  body: JSON.stringify({ messages: [{ role: 'user', content: q }] }),
});
/** A KV namespace in memory. */
const kv = () => { const m = new Map(); return { m, get: async (k) => m.get(k) ?? null, put: async (k, v) => { m.set(k, v); } }; };

let sent = [], answer = { stop_reason: 'end_turn', content: [{ type: 'text', text: 'Try Glendalough.' }] };
const realFetch = globalThis.fetch;
beforeEach(() => {
  sent = [];
  globalThis.fetch = async (url, init) => { sent.push({ url, init }); return new Response(JSON.stringify(answer), { status: 200 }); };
});
afterEach(() => { globalThis.fetch = realFetch; answer = { stop_reason: 'end_turn', content: [{ type: 'text', text: 'Try Glendalough.' }] }; });

test('the AI planner is switched off in site.config.mjs', () => {
  assert.equal(config.chat.ai, false);
  assert.deepEqual(Object.keys(config.chat.limits).sort(), ['dailyCap', 'perDay', 'perMinute']);
});

test('without an API key the function refuses and calls nothing', async () => {
  const { onRequestPost } = await load();
  assert.equal((await onRequestPost({ request: ask(), env: {} })).status, 503);
  assert.equal(sent.length, 0);
});

test('it sends a well-formed Messages request and returns the text', async () => {
  const { onRequestPost } = await load();
  const res = await onRequestPost({ request: ask(), env: { ANTHROPIC_API_KEY: 'test-key' } });
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { reply: 'Try Glendalough.' });
  const { url, init } = sent[0];
  assert.equal(url, 'https://api.anthropic.com/v1/messages');
  assert.equal(init.headers['anthropic-version'], '2026-10-21');
  assert.equal(init.headers['x-api-key'], 'test-key');
  const body = JSON.parse(init.body);
  assert.equal(body.model, 'claude-haiku-5-5');
  assert.deepEqual(body.output_config, { effort: 'low' });
  assert.ok(body.max_tokens >= 1000, 'thinking counts towards max_tokens, so leave room');
  for (const k of ['temperature', 'top_p', 'top_k', 'thinking']) assert.ok(!(k in body), `${k} should not be sent`);
  assert.deepEqual(body.messages, [{ role: 'user', content: 'Is the Sally Gap open in snow?' }]);
});

test('a refusal gets a polite answer, not an empty one', async () => {
  answer = { stop_reason: 'refusal', content: [] };
  const { onRequestPost } = await load();
  const { reply } = await (await onRequestPost({ request: ask(), env: { ANTHROPIC_API_KEY: 'k' } })).json();
  assert.match(reply, /day drives from Dublin/);
});

test('requests from other sites are refused', async () => {
  const { onRequestPost } = await load();
  assert.equal((await onRequestPost({ request: ask('203.0.113.7', 'https://evil.example'), env: { ANTHROPIC_API_KEY: 'k' } })).status, 403);
  assert.equal(sent.length, 0);
});

test('each visitor is limited per minute, without affecting others', async () => {
  const { onRequestPost } = await load();
  const env = { ANTHROPIC_API_KEY: 'k' };
  for (let i = 0; i < LIMITS.perMinute; i++) assert.equal((await onRequestPost({ request: ask(), env })).status, 200);
  const blocked = await onRequestPost({ request: ask(), env });
  assert.equal(blocked.status, 429);
  assert.equal(blocked.headers.get('retry-after'), '60');
  assert.equal((await onRequestPost({ request: ask('198.51.100.9'), env })).status, 200, 'another visitor is not blocked');
  assert.equal(sent.length, LIMITS.perMinute + 1);
});

test('with KV, each visitor is limited per day and the site has a daily cap', async () => {
  const store = kv();
  const env = { ANTHROPIC_API_KEY: 'k', CHAT_LIMITS: store, RATE_SALT: 'test-salt' };
  // Different "minutes" aren't simulated, so use a fresh function instance per batch of requests.
  let statuses = [];
  for (let i = 0; i < LIMITS.perDay + 1; i++) statuses.push((await (await load()).onRequestPost({ request: ask(), env })).status);
  assert.deepEqual(statuses, [200, 200, 200, 200, 200, 429]);
  statuses = [];
  for (let i = 0; i < 4; i++) statuses.push((await (await load()).onRequestPost({ request: ask(`198.51.100.${i}`), env })).status);
  assert.deepEqual(statuses, [200, 200, 200, 429], 'the site-wide cap of 8 is reached');
  const keys = [...store.m.keys()].join(' ');
  assert.doesNotMatch(keys, /203\.0\.113|198\.51\.100/, 'IP addresses must not be stored');
});
