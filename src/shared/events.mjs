// The analytics events the site can record, and the only ones the /api/event function accepts.
// Each event carries its name, the page path and one short label. Never a person: no cookies, no IDs,
// no IP address, and never text someone typed. See docs/analytics.md.

/** @type {Record<string, { label: string, what: string }>} name -> what the label holds, and what it measures */
export const EVENTS = {
  sponsored_click: { label: 'host of the link, e.g. discovercars.com', what: 'A click on an affiliate or featured-listing link (any link marked rel="sponsored")' },
  maps_open: { label: 'drive id', what: 'Opened the route in Google Maps' },
  gpx_download: { label: 'drive id', what: 'Downloaded the GPX file' },
  print_route: { label: 'drive id', what: 'Printed the route card' },
  share: { label: 'copy, whatsapp or native', what: 'Shared a page' },
  drive_done: { label: 'drive id', what: 'Ticked "I\'ve done this drive"' },
  planner_open: { label: 'empty', what: 'Opened the trip planner' },
  planner_answer: { label: 'kind of answer, e.g. drives, food, fallback', what: 'The planner answered a question (which kind of answer, not the question)' },
  newsletter_submit: { label: 'home, trip or theme', what: 'Submitted the newsletter sign-up form' },
};

/**
 * Cleans an event before it is sent or stored, or returns null if it isn't one the site records.
 * @param {unknown} e event name
 * @param {unknown} p page path
 * @param {unknown} l label
 * @returns {{ e: string, p: string, l: string } | null}
 */
export function cleanEvent(e, p, l) {
  if (typeof e !== 'string' || !Object.prototype.hasOwnProperty.call(EVENTS, e)) return null;
  const path = typeof p === 'string' && p.startsWith('/') ? p.split(/[?#]/)[0].slice(0, 120) : '/';
  const label = typeof l === 'string' ? l.toLowerCase().replace(/[^a-z0-9._:-]+/g, '-').slice(0, 60) : '';
  return { e, p: path.replace(/[^\w\-./]/g, ''), l: label };
}
