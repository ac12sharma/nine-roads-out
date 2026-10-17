// Shared helpers for the build.
export const DUBLIN = { lat: 53.3498, lon: -6.2603 };
const RAD = Math.PI / 180;

export const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export function bearingOf(t) {
  const p1 = DUBLIN.lat * RAD, p2 = t.lat * RAD, dl = (t.lon - DUBLIN.lon) * RAD;
  const y = Math.sin(dl) * Math.cos(p2);
  const x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
  return (Math.atan2(y, x) / RAD + 360) % 360;
}
const WINDS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
export const windOf = (b) => WINDS[Math.round(b / 22.5) % 16];
const WIND_WORDS = { N: 'north', NNE: 'north-north-east', NE: 'north-east', ENE: 'east-north-east', E: 'east', ESE: 'east-south-east', SE: 'south-east', SSE: 'south-south-east', S: 'south', SSW: 'south-south-west', SW: 'south-west', WSW: 'west-south-west', W: 'west', WNW: 'west-north-west', NW: 'north-west', NNW: 'north-north-west' };
export const windWords = (w) => WIND_WORDS[w] || w;

export function fmtMins(m) {
  m = Math.round(m);
  if (m < 60) return m + ' min';
  const h = Math.floor(m / 60), r = m % 60;
  return r ? `${h} h ${String(r).padStart(2, '0')}` : `${h} h`;
}

export function mapsURL(t) {
  const p = new URLSearchParams({ api: '1', origin: 'Dublin, Ireland', destination: t.maps.dest, travelmode: 'driving' });
  if (t.maps.way.length) p.set('waypoints', t.maps.way.join('|'));
  return 'https://www.google.com/maps/dir/?' + p.toString();
}

export const fillQ = (url, q) => url.replace('{q}', encodeURIComponent(q));

// Sunrise equation (as on the live page), returns Date objects.
export function sunTimes(date, lat = DUBLIN.lat, lon = DUBLIN.lon) {
  const JD = date.getTime() / 864e5 + 2440587.5, n = Math.ceil(JD - 2451545 + 0.0008);
  const Js = n - lon / 360, M = (357.5291 + 0.98560028 * Js) % 360;
  const C = 1.9148 * Math.sin(M * RAD) + 0.02 * Math.sin(2 * M * RAD) + 0.0003 * Math.sin(3 * M * RAD);
  const L = (M + C + 180 + 102.9372) % 360;
  const Jt = 2451545 + Js + 0.0053 * Math.sin(M * RAD) - 0.0069 * Math.sin(2 * L * RAD);
  const sd = Math.sin(L * RAD) * Math.sin(23.44 * RAD), cd = Math.cos(Math.asin(sd));
  const cw = (Math.sin(-0.833 * RAD) - Math.sin(lat * RAD) * sd) / (Math.cos(lat * RAD) * cd);
  const w0 = Math.acos(Math.max(-1, Math.min(1, cw))) / RAD;
  const toD = (J) => new Date((J - 2440587.5) * 864e5);
  return { rise: toD(Jt - w0 / 360), set: toD(Jt + w0 / 360) };
}
export const fmtClock = (d) => d.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Dublin' });
