// Trip planner evaluation: runs every question in planner-cases.mjs through the same code the browser
// uses (src/shared/planner.mjs) and fails if fewer than THRESHOLD of them get the right answer.
// One wrong answer doesn't fail the build on its own; a drop in accuracy does.
//   node --test tests/planner-eval.test.mjs          (failures are listed in the test output)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { plannerData } from '../src/data.mjs';
import { newContext, greeting, reply } from '../src/shared/planner.mjs';
import { statsOf, normalise } from '../src/shared/levels.mjs';
import { CASES } from './planner-cases.mjs';

export const THRESHOLD = 0.9;

const D = plannerData();
/** @type {import('../src/shared/planner.mjs').Env} */
const env = {
  url: { guide: (a) => '/driving-guide/' + (a ? '#' + a : ''), map: '/how-much-of-ireland/', hire: '/car-hire-dublin/', noCar: '/day-trips-from-dublin-without-a-car/' },
  stats: () => statsOf(normalise(null)),
  now: new Date('2026-06-21T12:00:00Z'),
  random: () => 0.5,
};

/**
 * Asks one case's question (after any earlier questions) and lists what's wrong with the answer.
 * @param {typeof CASES[number]} c
 */
export function evaluate(c) {
  const ctx = newContext();
  greeting(D, ctx, c.page);
  for (const b of c.before || []) reply(b, D, ctx, env);
  const r = reply(c.q, D, ctx, env);
  const cards = (r.cards || []).map((t) => t.id), eats = (r.eats || []).map((e) => e.r.name);
  const eatTrip = (/** @type {string} */ name) => Object.keys(D.eat).find((id) => D.eat[id].some((x) => x.name === name));
  const problems = [];
  if (r.kind !== c.kind) problems.push(`answered as ${r.kind}, expected ${c.kind}`);
  if (c.cards && cards.join() !== c.cards.join()) problems.push(`showed [${cards}], expected [${c.cards}]`);
  if (c.first && cards[0] !== c.first) problems.push(`first drive ${cards[0]}, expected ${c.first}`);
  if (c.tag && !cards.every((id) => D.trips.find((t) => t.id === id)?.tags.includes(c.tag))) problems.push(`not every drive shown is tagged ${c.tag}`);
  if (c.eats && [...eats].sort().join('|') !== [...c.eats].sort().join('|')) problems.push(`listed [${eats}], expected [${c.eats}]`);
  if (c.eatType && !(eats.length && (r.eats || []).every((e) => e.r.type === c.eatType))) problems.push(`places shown aren't all ${c.eatType}`);
  if (c.eatOn && !(eats.length && eats.every((n) => c.eatOn.includes(eatTrip(n) || '')))) problems.push(`places shown aren't all on ${c.eatOn}`);
  if (c.says && !r.text.includes(c.says)) problems.push(`answer doesn't mention "${c.says}"`);
  return { case: c, reply: r, problems };
}

test(`trip planner answers at least ${THRESHOLD * 100}% of the evaluation set correctly`, (t) => {
  assert.ok(CASES.length >= 60, 'the evaluation set needs at least 60 questions');
  const results = CASES.map(evaluate);
  const wrong = results.filter((x) => x.problems.length);
  const accuracy = (results.length - wrong.length) / results.length;
  t.diagnostic(`${results.length - wrong.length} of ${results.length} correct (${(accuracy * 100).toFixed(1)}%)`);
  for (const w of wrong) t.diagnostic(`✗ ${w.case.before ? w.case.before.join(' → ') + ' → ' : ''}"${w.case.q}"${w.case.page ? ` on ${w.case.page}` : ''}: ${w.problems.join('; ')}`);
  assert.ok(accuracy >= THRESHOLD, `accuracy ${(accuracy * 100).toFixed(1)}% is below ${THRESHOLD * 100}%`);
});
