// Cloudflare Pages Function: POST /api/event
// The build copies this file to functions/api/event.js, with the event list filled in, but only when
// analytics.events is true in site.config.mjs. It needs an Analytics Engine binding called EVENTS
// (Settings > Bindings > Add > Analytics engine). Without the binding it accepts events and drops them.
//
// Each data point is the event name, the page path and a short label. Nothing about the visitor is
// read or stored: no IP address, user agent, cookie or identifier. See docs/analytics.md.

const EVENTS = /*__EVENTS__*/null;
const MAX_BYTES = 400;

/** The same cleaning as src/shared/events.mjs, repeated here because functions are deployed on their own. */
function cleanEvent(e, p, l) {
  if (!EVENTS || typeof e !== 'string' || !Object.prototype.hasOwnProperty.call(EVENTS, e)) return null;
  const path = typeof p === 'string' && p.startsWith('/') ? p.split(/[?#]/)[0].slice(0, 120) : '/';
  const label = typeof l === 'string' ? l.toLowerCase().replace(/[^a-z0-9._:-]+/g, '-').slice(0, 60) : '';
  return { e, p: path.replace(/[^\w\-./]/g, ''), l: label };
}

const done = (status = 204) => new Response(null, { status, headers: { 'cache-control': 'no-store' } });

export async function onRequestPost({ request, env }) {
  // Only this site's own pages send events.
  const origin = request.headers.get('Origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) return done(403);
  const text = await request.text();
  if (text.length > MAX_BYTES) return done(413);
  let body;
  try { body = JSON.parse(text); } catch { return done(400); }
  const ev = cleanEvent(body && body.e, body && body.p, body && body.l);
  if (!ev) return done(400);
  if (env.EVENTS) env.EVENTS.writeDataPoint({ indexes: [ev.e], blobs: [ev.e, ev.p, ev.l] });
  return done();
}

export const onRequest = () => done(405);
