const test = require('node:test'), assert = require('node:assert');
const pace = require('../../shared/pace.js'), place = require('../../shared/place.js');
const P = { budgetMin: 42, steps: [
  { id: 'warm', prio: 1, min: 5 }, { id: 'predict', prio: 1, min: 4 }, { id: 'explore', prio: 3, min: 10 },
  { id: 'build', prio: 2, min: 8, minItems: 2, parts: 4 }, { id: 'practice', prio: 1, min: 8 }, { id: 'check', prio: 1, min: 4 }],
  huddles: [{ key: 'h1', atMin: 18 }, { key: 'h2', atMin: 32 }] };

test('validate accepts a good plan and rejects bad ones', () => {
  assert.deepStrictEqual(pace.validate(P), []);
  assert.ok(pace.validate({ ...P, steps: P.steps.map(s => ({ ...s, prio: 1 })) }).some(e => /60%/.test(e)));
  assert.ok(pace.validate({ ...P, huddles: [{ key: 'x', atMin: 50 }] }).length);
});
test('on pace: nothing trimmed', () => {
  const d = pace.decide(P, { minutesIn: 9, stepId: 'explore' });
  assert.strictEqual(d.trigger, false); assert.deepStrictEqual(d.skip, []);
});
test('far behind: prio 3 goes first, then prio 2 shrinks, prio 1 never', () => {
  const d = pace.decide(P, { minutesIn: 22, stepId: 'explore' });
  assert.ok(d.trigger); assert.ok(d.skip.includes('explore'));
  assert.ok(!d.skip.includes('practice') && !d.skip.includes('check'));
  const d2 = pace.decide(P, { minutesIn: 30, stepId: 'predict' });
  assert.ok(d2.skip.includes('explore')); assert.ok(d2.skip.includes('build'));
  assert.ok(!d2.skip.includes('warm'));
});
test('huddles fire by the clock, once, in order', () => {
  assert.strictEqual(pace.huddleDue(P, 10, []), null);
  assert.strictEqual(pace.huddleDue(P, 20, []).key, 'h1');
  assert.strictEqual(pace.huddleDue(P, 40, ['h1']).key, 'h2');
  assert.strictEqual(pace.huddleDue(P, 40, ['h1', 'h2']), null);
});
test('placement climbs, stops at two misses, caps at 8', () => {
  let s = place.start({ maxBand: 4 });
  for (const ok of [true, true, true, true]) s = place.next(s, ok);
  assert.ok(s.done); assert.strictEqual(s.placed, 4);
  s = place.start({ maxBand: 4 }); s = place.next(s, true); s = place.next(s, false); s = place.next(s, false);
  assert.ok(s.done); assert.strictEqual(s.placed, 1 + 0 || 1);
  s = place.start({ maxBand: 4 }); s = place.next(s, true); s = place.next(s, true); s = place.next(s, false); s = place.next(s, true);
  assert.strictEqual(s.placed, 3);
  assert.strictEqual(place.start({ maxBand: 4, seedBand: 3 }).band, 2);
  assert.strictEqual(place.start({ maxBand: 4 }).band, 1);
});
