/* Spring sandbox (physics/sandbox/spring-hang-*.js): the physics and the checkpoint questions. */
const test = require('node:test'), assert = require('node:assert'), path = require('path');
const M = require(path.resolve(__dirname, '../../physics/sandbox/spring-hang-model.js'));
const C = require(path.resolve(__dirname, '../../physics/sandbox/spring-hang-checkpoints.js'));
const close = (a, b, tol) => assert.ok(Math.abs(a - b) <= (tol || 1e-6), a + ' vs ' + b);
const run = (p, st, secs) => { for (let i = 0; i < secs * 600; i++) M.step(p, st, 1 / 600); return st; };

test('Day 5 notes spring: 0.60 kg on 120 N/m settles at 0.049 m', () => {
  close(M.equilibrium({ m: 0.6, k: 120, g: 9.8 }), 0.049);
});

test('let go from the natural length: it overshoots, bounces and settles at mg/k', () => {
  const p = { m: 0.6, k: 120, g: 9.8 }, st = M.fresh(); st.held = false;
  let max = 0; for (let i = 0; i < 600; i++) { M.step(p, st, 1 / 600); max = Math.max(max, st.x); }
  assert.ok(max > 0.049 * 1.25 && max < 0.049 * 1.5, 'overshoots about 1.4 times (' + max.toFixed(3) + ')');
  run(p, st, 20); close(st.x, 0.049, 2e-4); assert.ok(M.settled(p, st));
});

test('while held nothing moves; lowering gently lands at rest on the equilibrium', () => {
  const p = { m: 0.6, k: 120, g: 9.8 }, st = M.fresh(); run(p, st, 2); assert.strictEqual(st.x, 0);
  M.lower(p, st); close(st.x, 0.049); assert.ok(M.settled(p, st));
  run(p, st, 3); close(st.x, 0.049, 1e-9);
});

test('readings: the spring force at rest equals the weight; net force zero', () => {
  const p = { m: 0.6, k: 120, g: 9.8 }, st = M.lower(p, M.fresh()), r = M.readings(p, st);
  close(r.spring, 5.88); close(r.weight, 5.88); close(r.net, 0);
});

test('an elevator speeding up upward stretches it more; on the Moon it stretches less', () => {
  close(M.equilibrium({ m: 0.6, k: 120, g: 9.8, a: 2 }), 0.059);
  close(M.equilibrium({ m: 0.6, k: 120, g: 1.62 }), 0.0081);
  close(M.analyze({ m: 0.6, k: 120, g: 9.8, a: 2 }).scale, 7.08);
});

test('past the elastic limit it snaps and the mass falls to the base, then stays', () => {
  const p = { m: 3, k: 20, g: 9.8 }, st = M.fresh(); st.held = false; run(p, st, 3);
  assert.ok(st.broken && st.landed); close(st.y, M.DROP); assert.strictEqual(M.readings(p, st).spring, 0); assert.strictEqual(M.readings(p, st).net, 0);
  const g = M.lower({ m: 3, k: 20, g: 9.8 }, M.fresh()); assert.ok(g.broken);
  close(M.analyze({ m: 1, k: 20, g: 9.8 }).maxMass, 0.45 * 20 / 9.8);
});

test('let go can snap on the bounce even when it would settle inside the limit; lowered gently it does not', () => {
  const p = { m: 0.8, k: 20, g: 9.8 }; assert.ok(M.equilibrium(p) < M.LIMIT && M.equilibrium(p) * 1.3 > M.LIMIT);
  const a = M.fresh(); a.held = false; run(p, a, 3); assert.ok(a.broken);
  const b = M.lower(p, M.fresh()); run(p, b, 3); assert.ok(!b.broken); close(b.x, 0.392, 1e-3);
});

test('every preset spring has a sensible k', () => { Object.values(M.SPRINGS).forEach(s => assert.ok(s.k > 0 && s.k <= 500, s.name)); });

const IDS = ['1001', '1002', '2417', '8888', 'key'];
test('generated questions: inside the elastic limit, away from the test springs, answers from the model', () => {
  IDS.forEach(id => { for (let n = 0; n < 40; n++) {
    const a = C.gen('cp1', id, n), b = C.gen('cp2', id, n), c = C.gen('cp3', id, n);
    [a.k, b.mystery.k, c.k].forEach(k => assert.ok(C.AVOID.indexOf(k) < 0, 'avoids ' + k));
    close(a.answer, a.k * (a.L - a.L0) / 100); assert.ok(a.L - a.L0 >= 2 && a.L - a.L0 <= 20);
    close(c.answer, M.equilibrium({ m: c.m, k: c.k, g: 9.8 })); assert.ok(c.answer >= 0.02 && c.answer <= 0.40);
    assert.ok(M.analyze({ m: 0.05, k: b.mystery.k, g: 9.8 }).xe < M.LIMIT, 'the mystery spring can hold the hanger');
  } });
});

test('questions are seeded: the same student gets the same question, neighbours and retries differ', () => {
  assert.deepStrictEqual(C.gen('cp1', '1001', 3), C.gen('cp1', '1001', 3));
  assert.notDeepStrictEqual(C.gen('cp3', '1001', 3), C.gen('cp3', '1002', 3));
  assert.notDeepStrictEqual(C.gen('cp2', '1001', 3).mystery, C.gen('cp2', '1001', 4).mystery);
});

test('grading: right answers pass, the known mistakes get their own hint, no hint gives the answer', () => {
  IDS.forEach(id => { for (let n = 0; n < 15; n++) {
    ['cp1', 'cp2', 'cp3'].forEach(t => {
      const q = C.gen(t, id, n), want = C.answerOf(q);
      assert.ok(C.grade(q, want).ok, t); assert.ok(C.grade(q, String(want)).ok); assert.strictEqual(C.grade(q, '').code, 'EMPTY');
      const w = C.grade(q, want * 1.4 + 1); assert.ok(!w.ok); assert.ok(w.hint.indexOf(String(+want.toFixed(2))) < 0, 'hint leaks');
    });
    const a = C.gen('cp1', id, n); assert.strictEqual(C.grade(a, a.k * a.L / 100).code, 'TOTAL'); assert.strictEqual(C.grade(a, a.answer * 100).code, 'CM');
    const b = C.gen('cp2', id, n); assert.strictEqual(C.grade(b, b.mystery.k / 9.8).code, 'MASS');
    const c = C.gen('cp3', id, n); assert.strictEqual(C.grade(c, c.m / c.k).code, 'NOG'); assert.strictEqual(C.grade(c, c.answer * 100).code, 'CM');
  } });
});
