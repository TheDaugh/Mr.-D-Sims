const test = require('node:test'), assert = require('node:assert');
const pace = require('../../shared/pace.js');

// shared/codes.js is browser-only (window.MrD, MrD.bell); load it in a tiny sandbox.
function loadCodes() {
  const sandbox = { window: { MrD: { bell: { dayKey: d => d || '2026-10-27' } } } };
  const src = require('node:fs').readFileSync(require('node:path').join(__dirname, '../../shared/codes.js'), 'utf8');
  new Function('window', src)(sandbox.window);
  return sandbox.window.MrD.codes;
}

const V3 = { budgetMin: 42, clock: 'v3' };
const V2 = { budgetMin: 42, steps: [{ id: 'warm', prio: 1, min: 5 }, { id: 'practice', prio: 1, min: 8 }], huddles: [{ key: 'h1', atMin: 18 }] };

test('v3 default clock: huddle 1 at minute 3, huddle 2 at minute 25', () => {
  const h = pace.huddlesOf(V3);
  assert.deepStrictEqual(h.map(x => [x.key, x.atMin]), [['h1', 3], ['h2', 25]]);
  assert.strictEqual(pace.huddleDue(V3, 2, []), null);
  assert.strictEqual(pace.huddleDue(V3, 3, []).key, 'h1');
  assert.strictEqual(pace.huddleDue(V3, 24, ['h1']), null);
  assert.strictEqual(pace.huddleDue(V3, 25, ['h1']).key, 'h2');
  assert.strictEqual(pace.huddleDue(V3, 40, ['h1', 'h2']), null);
});

test('v3 lab day overrides huddle 2 later', () => {
  const lab = { ...V3, huddles: [{ key: 'h1', atMin: 3 }, { key: 'h2', atMin: 33 }] };
  assert.strictEqual(pace.huddleDue(lab, 30, ['h1']), null);
  assert.strictEqual(pace.huddleDue(lab, 33, ['h1']).key, 'h2');
  assert.deepStrictEqual(pace.validate(lab), []);
});

test('v3 validates without steps and skips the 60% rule, but still checks the huddles', () => {
  assert.deepStrictEqual(pace.validate(V3), []);
  assert.ok(pace.validate({ clock: 'v3' }).length);
  assert.ok(pace.validate({ ...V3, huddles: [{ key: 'h1', atMin: 50 }] }).some(e => /outside the budget/.test(e)));
  assert.ok(pace.validate({ ...V3, huddles: [{ key: 'h1', atMin: 25 }, { key: 'h2', atMin: 10 }] }).some(e => /time order/.test(e)));
});

test('v3 never trims or skips, however far behind', () => {
  const d = pace.decide(V3, { minutesIn: 40, stepId: 'explore' });
  assert.strictEqual(d.trigger, false); assert.deepStrictEqual(d.skip, []); assert.deepStrictEqual(d.items, {});
});

test('huddle 1 is a hold screen in v3 and a writable tab everywhere else', () => {
  assert.strictEqual(pace.huddleMode(V3, 'h1'), 'hold');
  assert.strictEqual(pace.huddleMode(V3, 'h2'), 'write');
  assert.strictEqual(pace.huddleMode(V2, 'h1'), 'write');
  assert.strictEqual(pace.huddleMode(undefined, 'h1'), 'write');
});

test('legacy lessons are untouched: v2 plans still validate, trim and fire at their own time', () => {
  assert.deepStrictEqual(pace.validate(V2), []);
  assert.strictEqual(pace.isV3(V2), false);
  assert.deepStrictEqual(pace.huddlesOf(V2), V2.huddles);
  assert.deepStrictEqual(pace.huddlesOf({ budgetMin: 42, steps: V2.steps }), []);
  assert.strictEqual(pace.huddleDue(V2, 17, []), null);
  assert.strictEqual(pace.huddleDue(V2, 18, []).key, 'h1');
  const tooMuchCore = { ...V2, steps: [{ id: 'a', prio: 1, min: 30 }] };
  assert.ok(pace.validate(tooMuchCore).some(e => /60%/.test(e)));
});

test('codes: legacy gate() is unchanged for every key; v3 huddle 1 matches it; huddle 2 differs', () => {
  const C = loadCodes();
  assert.strictEqual(C.gate('x', 'h1'), C.huddle()); assert.strictEqual(C.gate('x', 'h2'), C.huddle());   // regression guard: legacy h2 is the same code
  assert.strictEqual(C.gateV3('x', 'h1'), C.huddle());
  assert.strictEqual(C.gateV3('x', 'h2'), C.huddle2());
  assert.notStrictEqual(C.huddle2(), C.huddle());
  assert.match(C.huddle2(), /^\d{4}$/);
  assert.strictEqual(C.gateV3('anything', 'h2'), C.gateV3('other', 'h2'));   // one code per day for every class, as before
});
