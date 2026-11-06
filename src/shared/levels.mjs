// Traveller levels: how many of the Republic's 26 counties someone has driven, and what level that is.
// Used by the map page at build time (the level table) and in the browser (the live map, the level
// pill and the trip planner), so the thresholds live in one place.

export const TOTAL = 26;

/** @typedef {{ n: number, name: string, min: number }} Level */

/** @type {Level[]} Lowest first. `min` is the number of counties needed. */
export const LEVELS = [
  { n: 0, name: 'Not on the road yet', min: 0 },
  { n: 1, name: 'Day-tripper', min: 1 },
  { n: 2, name: 'Road-tripper', min: 9 },
  { n: 3, name: 'Grand tourer', min: 18 },
];

/**
 * What the browser stores: drives ticked off (with the counties each covers) and counties added by hand.
 * @typedef {{ drives: string[], manual: string[], dc: Record<string, string[]> }} Progress
 */

/**
 * @typedef {object} Stats
 * @property {Set<string>} all every county counted, from drives and added by hand
 * @property {number} n how many counties
 * @property {number} pct share of the 26, rounded to a whole percent
 * @property {Level} L current level
 * @property {Level | null} N next level, or null at the top
 */

/**
 * Turns whatever was in localStorage into valid progress, so a corrupted or old value can't break the page.
 * @param {unknown} v
 * @returns {Progress}
 */
export function normalise(v) {
  const o = v && typeof v === 'object' ? /** @type {Record<string, unknown>} */ (v) : {};
  const strings = (/** @type {unknown} */ a) => (Array.isArray(a) ? a.filter((x) => typeof x === 'string') : []);
  /** @type {Record<string, string[]>} */
  const dc = {};
  if (o.dc && typeof o.dc === 'object') for (const [k, list] of Object.entries(o.dc)) dc[k] = strings(list);
  return { drives: strings(o.drives), manual: strings(o.manual), dc };
}

/**
 * Counties covered by the drives ticked off.
 * @param {Progress} p
 * @returns {Set<string>}
 */
export function fromDrives(p) {
  const s = new Set();
  p.drives.forEach((id) => (p.dc[id] || []).forEach((c) => s.add(c)));
  return s;
}

/**
 * The level for a number of counties.
 * @param {number} n
 * @returns {Level}
 */
export function levelFor(n) {
  let L = LEVELS[0];
  LEVELS.forEach((l) => { if (n >= l.min) L = l; });
  return L;
}

/**
 * @param {Progress} p
 * @returns {Stats}
 */
export function statsOf(p) {
  const all = new Set(p.manual);
  fromDrives(p).forEach((c) => all.add(c));
  const n = all.size;
  return { all, n, pct: Math.round(n / TOTAL * 100), L: levelFor(n), N: LEVELS.find((l) => l.min > n) || null };
}

/** @param {Stats} st e.g. "Level 2 road-tripper, with 35% of Ireland's counties" */
export const levelLine = (st) => 'Level ' + st.L.n + ' ' + st.L.name.toLowerCase() + ', with ' + st.pct + '% of Ireland\'s counties';

/**
 * How far to the next level, e.g. "1 more county to Level 2, road-tripper."
 * @param {Stats} st
 * @returns {string}
 */
export function nextLine(st) {
  if (!st.n) return 'Tick off a drive or tap a county to start.';
  if (!st.N) return 'Top level. You\'ve driven most of Ireland.';
  const k = st.N.min - st.n;
  return k + ' more ' + (k === 1 ? 'county' : 'counties') + ' to Level ' + st.N.n + ', ' + st.N.name.toLowerCase() + '.';
}

/** @param {Stats} st the text people share from the map page */
export function shareText(st) {
  return st.n
    ? 'I\'m a Level ' + st.L.n + ' ' + st.L.name.toLowerCase() + ' on Nine Roads Out: I\'ve driven ' + st.n + ' of Ireland\'s ' + TOTAL + ' counties (' + st.pct + '%). How much of Ireland have you driven?'
    : 'How much of Ireland have you driven?';
}

/**
 * The rows of the "How the levels work" table, e.g. { level, from: 9, to: 17, pctFrom: 35, pctTo: 65 }.
 * @returns {{ level: Level, from: number, to: number, pctFrom: number, pctTo: number }[]}
 */
export function levelBands() {
  return LEVELS.slice(1).map((level, i, list) => {
    const from = level.min, to = (list[i + 1] ? list[i + 1].min : TOTAL + 1) - 1;
    return { level, from, to, pctFrom: Math.round(from / TOTAL * 100), pctTo: Math.round(to / TOTAL * 100) };
  });
}
