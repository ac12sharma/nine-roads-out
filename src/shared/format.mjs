// Formatting helpers used both at build time (src/pages.mjs) and in the browser (src/assets/app.js,
// where src/bundle.mjs inlines this file). Keep it free of Node and DOM APIs.

export const DUBLIN = { lat: 53.3498, lon: -6.2603 };
const RAD = Math.PI / 180;

/**
 * Escapes text for use in HTML content and attribute values.
 * @param {unknown} s
 * @returns {string}
 */
export const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/**
 * Formats a duration: 50 -> "50 min", 75 -> "1 h 15", 120 -> "2 h".
 * @param {number} m minutes
 * @returns {string}
 */
export function fmtMins(m) {
  m = Math.round(m);
  if (m < 60) return m + ' min';
  const h = Math.floor(m / 60), r = m % 60;
  return r ? `${h} h ${String(r).padStart(2, '0')}` : `${h} h`;
}

/**
 * Sunrise and sunset from the sunrise equation, accurate to a minute or two.
 * @param {Date} date
 * @param {number} [lat]
 * @param {number} [lon]
 * @returns {{ rise: Date, set: Date }}
 */
export function sunTimes(date, lat = DUBLIN.lat, lon = DUBLIN.lon) {
  const JD = date.getTime() / 864e5 + 2440587.5, n = Math.ceil(JD - 2451545 + 0.0008);
  const Js = n - lon / 360, M = (357.5291 + 0.98560028 * Js) % 360;
  const C = 1.9148 * Math.sin(M * RAD) + 0.02 * Math.sin(2 * M * RAD) + 0.0003 * Math.sin(3 * M * RAD);
  const L = (M + C + 180 + 102.9372) % 360;
  const Jt = 2451545 + Js + 0.0053 * Math.sin(M * RAD) - 0.0069 * Math.sin(2 * L * RAD);
  const sd = Math.sin(L * RAD) * Math.sin(23.44 * RAD), cd = Math.cos(Math.asin(sd));
  const cw = (Math.sin(-0.833 * RAD) - Math.sin(lat * RAD) * sd) / (Math.cos(lat * RAD) * cd);
  const w0 = Math.acos(Math.max(-1, Math.min(1, cw))) / RAD;
  const toD = (/** @type {number} */ J) => new Date((J - 2440587.5) * 864e5);
  return { rise: toD(Jt - w0 / 360), set: toD(Jt + w0 / 360) };
}

/**
 * 24-hour clock time in Irish time, e.g. "07:42".
 * @param {Date} d
 * @returns {string}
 */
export const fmtClock = (d) => d.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Dublin' });
