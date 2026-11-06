// Traveller level maths: the thresholds, the boundaries between levels, and counting counties once.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TOTAL, LEVELS, normalise, fromDrives, levelFor, statsOf, levelLine, nextLine, shareText, levelBands } from '../src/shared/levels.mjs';
import { TRIPS } from '../src/content/trips.mjs';

/** @param {number} n a progress record with n counties added by hand */
const withCounties = (n) => normalise({ manual: Array.from({ length: n }, (_, i) => 'County ' + i) });

test('levels start at zero, rise in order and fit within the 26 counties', () => {
  assert.equal(TOTAL, 26);
  assert.equal(LEVELS[0].min, 0);
  LEVELS.forEach((l, i) => { assert.equal(l.n, i); if (i) assert.ok(l.min > LEVELS[i - 1].min); });
  assert.ok(LEVELS.at(-1).min <= TOTAL);
});

test('each level begins exactly at its threshold', () => {
  const cases = [[0, 0], [1, 1], [8, 1], [9, 2], [17, 2], [18, 3], [26, 3]];
  for (const [n, level] of cases) assert.equal(levelFor(n).n, level, `${n} counties`);
});

test('the next level and how far away it is', () => {
  assert.equal(statsOf(withCounties(0)).N?.n, 1);
  assert.equal(statsOf(withCounties(8)).N?.n, 2);
  assert.equal(statsOf(withCounties(18)).N, null);
  assert.equal(nextLine(statsOf(withCounties(0))), 'Tick off a drive or tap a county to start.');
  assert.equal(nextLine(statsOf(withCounties(8))), '1 more county to Level 2, road-tripper.');
  assert.equal(nextLine(statsOf(withCounties(5))), '4 more counties to Level 2, road-tripper.');
  assert.equal(nextLine(statsOf(withCounties(26))), 'Top level. You\'ve driven most of Ireland.');
});

test('percentages are of 26 counties, rounded', () => {
  assert.equal(statsOf(withCounties(1)).pct, 4);
  assert.equal(statsOf(withCounties(9)).pct, 35);
  assert.equal(statsOf(withCounties(13)).pct, 50);
  assert.equal(statsOf(withCounties(26)).pct, 100);
});

test('a county on two drives, or on a drive and added by hand, counts once', () => {
  const p = normalise({ drives: ['a', 'b'], dc: { a: ['Dublin', 'Wicklow'], b: ['Dublin', 'Meath'] }, manual: ['Wicklow', 'Kerry'] });
  assert.deepEqual([...fromDrives(p)].sort(), ['Dublin', 'Meath', 'Wicklow']);
  const st = statsOf(p);
  assert.equal(st.n, 4);
  assert.deepEqual([...st.all].sort(), ['Dublin', 'Kerry', 'Meath', 'Wicklow']);
});

test('counties from a drive no longer ticked off are not counted', () => {
  const p = normalise({ drives: [], dc: { a: ['Dublin', 'Wicklow'] }, manual: [] });
  assert.equal(statsOf(p).n, 0);
});

test('corrupt or old saved progress is read as empty, never as an error', () => {
  for (const v of [null, undefined, 42, 'text', [], { drives: 'x', manual: null, dc: 7 }, { drives: [1, 'a'], dc: { a: 'Dublin' } }]) {
    const p = normalise(v);
    assert.ok(Array.isArray(p.drives) && Array.isArray(p.manual) && typeof p.dc === 'object');
    assert.ok(p.drives.every((x) => typeof x === 'string'));
    assert.doesNotThrow(() => statsOf(p));
  }
});

test('the level table on the map page matches the thresholds', () => {
  assert.deepEqual(levelBands().map((b) => [b.level.n, b.from, b.to, b.pctFrom, b.pctTo]), [
    [1, 1, 8, 4, 31],
    [2, 9, 17, 35, 65],
    [3, 18, 26, 69, 100],
  ]);
});

test('all nine drives together reach Level 2, and Level 3 needs the west', () => {
  const p = normalise({ drives: TRIPS.map((t) => t.id), dc: Object.fromEntries(TRIPS.map((t) => [t.id, t.counties])) });
  const st = statsOf(p);
  assert.equal(st.L.n, 2, `the nine drives cover ${st.n} counties`);
});

test('the text people see and share', () => {
  const st = statsOf(withCounties(9));
  assert.equal(levelLine(st), 'Level 2 road-tripper, with 35% of Ireland\'s counties');
  assert.match(shareText(st), /^I'm a Level 2 road-tripper on Nine Roads Out: I've driven 9 of Ireland's 26 counties \(35%\)\./);
  assert.equal(shareText(statsOf(withCounties(0))), 'How much of Ireland have you driven?');
});
