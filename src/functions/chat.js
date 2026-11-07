// Cloudflare Pages Function: POST /api/chat
// The build copies this file to functions/api/chat.js with the site's drive and restaurant data
// filled in, but only when chat.ai is true in site.config.mjs. Off by default. See docs/ai-planner.md.
//
// Needs a secret called ANTHROPIC_API_KEY in the Pages project (Settings > Variables and Secrets).
// Optional:
//   CHAT_MODEL       overrides the model set in site.config.mjs
//   RATE_SALT        a random secret string, so the hashed IP addresses can't be guessed
//   CHAT_LIMITS      a KV namespace binding, for daily per-IP limits and a site-wide daily cap that
//                    hold across Cloudflare's locations (without it, only the per-minute limit applies)
//   CHAT_DAILY_CAP   site-wide cap on AI answers per day (default below)
//
// Calls the Messages API with fetch rather than the Anthropic SDK, because the site has no runtime
// dependencies and this file is deployed on its own.

const KNOWLEDGE = /*__KNOWLEDGE__*/null;

const MAX_TURNS = 8;     // only the most recent messages are sent on
const MAX_CHARS = 600;   // per message
const MAX_TOKENS = 2000; // includes the model's thinking, which counts towards max_tokens; the prompt keeps replies short
const LIMITS = { perMinute: 5, perDay: 40, dailyCap: 500, ...(KNOWLEDGE && KNOWLEDGE.limits) };

const SYSTEM = KNOWLEDGE && `You are the trip planner on ${KNOWLEDGE.site}, an independent guide to nine day drives by car from Dublin city in the Republic of Ireland.

How to answer:
- Recommend only the drives and places to eat in the data below, and use their names exactly as written, so the site can link them.
- Keep replies short: under 120 words, plain sentences, no headings, no markdown tables.
- Drive times are from Dublin city centre. "mins" is the drive to the first big stop; "drive" is total hours at the wheel for the round trip.
- Never invent opening hours, prices, bookings or facts that are not in the data. Tell people to check opening times before they go.
- If someone asks about something unrelated to day trips, driving or food in Ireland, say you can only help with day drives from Dublin.
- Do not ask for or repeat personal details.

Data (JSON):
${JSON.stringify(KNOWLEDGE.data)}`;

const json = (body, status = 200, extra = {}) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra },
});

/* ---------- rate limiting ----------
   Keyed by a hash of the visitor's IP address, the day and RATE_SALT, so the address itself is never
   stored and the key changes every day. Cloudflare warns that one IP address can be shared by many
   people (offices, mobile networks), so the limits are generous. */
async function visitorKey(request, env, day) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const bytes = new TextEncoder().encode(`${env.RATE_SALT || 'nine-roads-out'}|${day}|${ip}`);
  const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
  return [...hash.slice(0, 12)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Per-minute counts, held in this instance's memory. Cloudflare runs many instances, so this is
// approximate, but it needs no setup and stops someone hammering the endpoint.
const recent = new Map();
function overMinuteLimit(key, now) {
  const times = (recent.get(key) || []).filter((t) => now - t < 60_000);
  times.push(now);
  recent.set(key, times);
  if (recent.size > 5000) for (const [k, v] of recent) if (now - v[v.length - 1] >= 60_000) recent.delete(k);
  return times.length > LIMITS.perMinute;
}

// Daily counts in KV, if CHAT_LIMITS is bound. KV is eventually consistent, so a burst can slip a
// little over; it's a cost brake, not a guarantee. Entries expire after two days.
async function overDailyLimits(env, key, day) {
  if (!env.CHAT_LIMITS) return null;
  const cap = Number(env.CHAT_DAILY_CAP) || LIMITS.dailyCap;
  const [mine, all] = await Promise.all([env.CHAT_LIMITS.get(`v:${day}:${key}`), env.CHAT_LIMITS.get(`all:${day}`)]);
  if (Number(mine) >= LIMITS.perDay) return 'visitor';
  if (Number(all) >= cap) return 'site';
  const ttl = { expirationTtl: 2 * 86400 };
  await Promise.all([env.CHAT_LIMITS.put(`v:${day}:${key}`, String(Number(mine) + 1), ttl), env.CHAT_LIMITS.put(`all:${day}`, String(Number(all) + 1), ttl)]);
  return null;
}

export async function onRequestPost({ request, env }) {
  if (!KNOWLEDGE || !env.ANTHROPIC_API_KEY) return json({ error: 'not_configured' }, 503);

  // Only accept requests from this site.
  const origin = request.headers.get('Origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) return json({ error: 'forbidden' }, 403);

  const now = Date.now(), day = new Date(now).toISOString().slice(0, 10);
  const key = await visitorKey(request, env, day);
  if (overMinuteLimit(key, now)) return json({ error: 'rate_limited', scope: 'minute' }, 429, { 'retry-after': '60' });
  const daily = await overDailyLimits(env, key, day);
  if (daily) return json({ error: 'rate_limited', scope: daily === 'site' ? 'site' : 'day' }, 429, { 'retry-after': '3600' });

  let body;
  try { body = await request.json(); } catch { return json({ error: 'bad_request' }, 400); }

  const messages = (Array.isArray(body?.messages) ? body.messages : [])
    .filter((m) => (m?.role === 'user' || m?.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
  while (messages.length && messages[0].role !== 'user') messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== 'user') return json({ error: 'bad_request' }, 400);

  let res;
  try {
    res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2026-10-21',
        'content-type': 'application/json',
      },
      // Low effort: these are short chat answers from data in the prompt.
      body: JSON.stringify({ model: env.CHAT_MODEL || KNOWLEDGE.model, max_tokens: MAX_TOKENS, output_config: { effort: 'low' }, system: SYSTEM, messages }),
    });
  } catch {
    return json({ error: 'upstream' }, 502);
  }
  if (res.status === 429) return json({ error: 'rate_limited', scope: 'upstream' }, 429, { 'retry-after': res.headers.get('retry-after') || '60' });
  if (!res.ok) return json({ error: 'upstream', status: res.status }, 502);

  const data = await res.json();
  // A declined request comes back as a normal response with stop_reason "refusal": check it before
  // reading the text.
  if (data.stop_reason === 'refusal') return json({ reply: 'I can only help with day drives from Dublin, places to eat on them and timing. Try asking about one of the nine drives.' });
  const reply = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
  return json({ reply: reply || "Sorry, I don't have an answer for that. Try asking about one of the nine drives." });
}

export function onRequest() {
  return json({ error: 'method_not_allowed' }, 405);
}
