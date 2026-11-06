// Shared helpers for the build.
import { DUBLIN } from './shared/format.mjs';
export { DUBLIN, esc, fmtMins, sunTimes, fmtClock } from './shared/format.mjs';
const RAD = Math.PI / 180;

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

export function mapsURL(t) {
  const p = new URLSearchParams({ api: '1', origin: 'Dublin, Ireland', destination: t.maps.dest, travelmode: 'driving' });
  if (t.maps.way.length) p.set('waypoints', t.maps.way.join('|'));
  return 'https://www.google.com/maps/dir/?' + p.toString();
}

export const fillQ = (url, q) => url.replace('{q}', encodeURIComponent(q));
