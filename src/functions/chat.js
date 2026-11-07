// Cloudflare Pages Function: POST /api/chat
// The build copies this file to functions/api/chat.js with the site's drive and restaurant data
// filled in, but only when chat.ai is true in site.config.mjs.
// Needs a secret called ANTHROPIC_API_KEY in the Pages project (Settings > Variables and Secrets).
// Optional: CHAT_MODEL to override the model set in site.config.mjs.

const KNOWLEDGE = /*__KNOWLEDGE__*/null;

const MAX_TURNS = 8;     // only the most recent messages are sent on
const MAX_CHARS = 600;   // per message
const MAX_TOKENS = 400;  // length of each reply

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

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});

export async function onRequestPost({ request, env }) {
  if (!KNOWLEDGE || !env.ANTHROPIC_API_KEY) return json({ error: 'not_configured' }, 503);

  // Only accept requests from this site.
  const origin = request.headers.get('Origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) return json({ error: 'forbidden' }, 403);

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
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({ model: env.CHAT_MODEL || KNOWLEDGE.model, max_tokens: MAX_TOKENS, system: SYSTEM, messages }),
    });
  } catch {
    return json({ error: 'upstream' }, 502);
  }
  if (!res.ok) return json({ error: 'upstream', status: res.status }, 502);

  const data = await res.json();
  const reply = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
  return json({ reply: reply || "Sorry, I don't have an answer for that. Try asking about one of the nine drives." });
}

export function onRequest() {
  return json({ error: 'method_not_allowed' }, 405);
}
