/* Friction sandbox (physics/sandbox/friction-push-*.js): the physics and the checkpoint questions. */
const test = require('node:test'), assert = require('node:assert'), path = require('path');
const M = require(path.resolve(__dirname, '../../physics/sandbox/friction-push-model.js'));
const C = require(path.resolve(__dirname, '../../physics/sandbox/friction-push-checkpoints.js'));
const close = (a, b, tol) => assert.ok(Math.abs(a - b) <= (tol || 1e-6), a + ' vs ' + b);
const run = (p, st, secs, F) => { for (let i = 0; i < secs * 240; i++) M.step(p, st, 1 / 240, typeof F === 'function' ? F(st.t) : F); return st; };
const DAY1 = { m: 12, mus: 0.40, muk: 0.25, g: 9.8 };      // the Day 1 notes crate

test('Day 1 crate: N 118 N, limit 47 N, sliding friction 29 N', () => {
  const q = M.forces(DAY1);
  close(q.N, 117.6); close(q.fmax, 47.04); close(q.fk, 29.4);
});

test('a push below the limit: no motion, friction matches the push', () => {
  const st = run(DAY1, M.fresh(), 3, 30);
  assert.strictEqual(st.v, 0); assert.strictEqual(st.x, 0); close(st.f, -30); assert.strictEqual(st.started, false);
});

test('a push past the limit: it slides, friction drops to mu_k N, a = (F - fk)/m', () => {
  const st = run(DAY1, M.fresh(), 2, 55);
  assert.ok(st.moving); close(st.f, -29.4); close(st.a, (55 - 29.4) / 12, 1e-9);
  close(st.v, 2 * (55 - 29.4) / 12, 0.02);
});

test('the push grows: friction follows it to mu_s N, then drops to mu_k N', () => {
  const st = M.fresh(), trace = [];
  for (let i = 0; i < 8 * 240; i++) { M.step(DAY1, st, 1 / 240, M.RATE * st.t); trace.push([st.F, -st.f]); }
  const peak = Math.max(...trace.map(t => t[1]));
  close(peak, 47.04, 0.05);
  const after = trace.filter(t => t[0] > 50).map(t => t[1]);
  assert.ok(after.length > 10 && after.every(f => Math.abs(f - 29.4) < 1e-6), 'flat at mu_k N after the break');
});

test('a sliding crate with the push removed slows and stops dead, then stays put', () => {
  const st = run(DAY1, M.fresh(), 1, 80);
  const v0 = st.v; assert.ok(v0 > 0);
  const t0 = st.t; let tStop = null;
  for (let i = 0; i < 10 * 240; i++) { M.step(DAY1, st, 1 / 240, 0); if (tStop === null && st.v === 0) tStop = st.t; }
  assert.strictEqual(st.v, 0); assert.strictEqual(st.moving, false);
  const x = st.x; run(DAY1, st, 2, 0); assert.strictEqual(st.x, x, 'never slides backwards');
  close(tStop - t0, v0 / (29.4 / 12), 0.01);   // the stop takes v0 / (fk/m) seconds
});

test('the push never pulls and is capped', () => {
  const st = M.fresh(); M.step(DAY1, st, 0.01, -50); assert.strictEqual(st.F, 0); M.step(DAY1, st, 0.01, 1e6); assert.strictEqual(st.F, M.F_MAX);
});

test('mu_k is never above mu_s; the Moon crate needs less push', () => {
  close(M.forces({ m: 10, mus: 0.3, muk: 0.6 }).muk, 0.3);
  const moon = Object.assign({}, DAY1, { g: M.PLANETS.moon });
  assert.strictEqual(M.verdict(DAY1, 20), 'rest'); assert.strictEqual(M.verdict(moon, 20), 'slides');
});

test('every surface has mu_k below mu_s', () => {
  Object.values(M.SURFACES).forEach(s => assert.ok(s.muk < s.mus && s.mus <= 1, s.name));
});

const IDS = ['1001', '1002', '2417', '8888', 'key'];
test('checkpoint answers come from the model, with margin from the edge', () => {
  IDS.forEach(id => { for (let n = 0; n < 30; n++) {
    const a = C.gen('cp1', id, n), b = C.gen('cp3', id, n);
    [a, b].forEach(q => { const f = M.forces(q.crate.p), r = q.crate.F / f.fmax; assert.ok(r <= 0.8 || r >= 1.2, 'margin ' + r); if (r <= 0.8) assert.ok(Math.abs(q.crate.F - f.fk) >= 0.15 * f.fk, 'away from mu_k N'); assert.ok(q.crate.F >= 5 && q.crate.F <= M.F_MAX); assert.ok(q.crate.p.muk < q.crate.p.mus); });
    close(a.answer, M.friction(a.crate.p, a.crate.F)); close(b.answer, M.accel(b.crate.p, b.crate.F));
    const c = C.gen('cp2', id, n); close(c.answer, c.which === 'mus' ? c.mystery.mus : c.mystery.muk); assert.ok(c.mystery.mus - c.mystery.muk >= 0.1 - 1e-9);
  } });
});

test('checkpoints mix the cases: cp1 alternates hold and slide, cp2 alternates mu_s and mu_k, cp3 holds one time in three', () => {
  IDS.forEach(id => {
    const holds = [0, 1, 2, 3, 4, 5].map(n => { const q = C.gen('cp1', id, n); return q.crate.F <= M.forces(q.crate.p).fmax; });
    assert.ok(holds.includes(true) && holds.includes(false));
    for (let n = 0; n < 4; n++) assert.notStrictEqual(C.gen('cp2', id, n).which, C.gen('cp2', id, n + 1).which);
    const zero = [0, 1, 2, 3, 4, 5].filter(n => C.gen('cp3', id, n).answer === 0).length; assert.strictEqual(zero, 2);
  });
});

test('questions are seeded: the same student gets the same question, neighbours and retries differ', () => {
  assert.deepStrictEqual(C.gen('cp1', '1001', 3), C.gen('cp1', '1001', 3));
  assert.notDeepStrictEqual(C.gen('cp1', '1001', 3).crate, C.gen('cp1', '1002', 3).crate);
  assert.notDeepStrictEqual(C.gen('cp3', '1001', 3).crate, C.gen('cp3', '1001', 4).crate);
});

test('grading: right answers pass, the known mistakes get their own hint, no hint gives the answer', () => {
  IDS.forEach(id => { for (let n = 0; n < 12; n++) {
    ['cp1', 'cp2', 'cp3'].forEach(t => {
      const q = C.gen(t, id, n); assert.ok(C.grade(q, q.answer).ok, t + ' right answer'); assert.strictEqual(C.grade(q, '').code, 'EMPTY');
      const wrong = C.grade(q, q.answer + (t === 'cp2' ? 0.2 : 37)); assert.ok(!wrong.ok);
      [wrong.hint].forEach(h => assert.ok(h.indexOf(String(+q.answer.toFixed(2))) < 0 || q.answer === 0, 'hint leaks ' + h));
    });
    const a = C.gen('cp1', id, n), f = M.forces(a.crate.p);
    if (a.crate.F <= f.fmax) { assert.strictEqual(C.grade(a, f.fmax).code, 'LIMIT'); assert.strictEqual(C.grade(a, f.fk).code, 'KIN'); }
    else { assert.strictEqual(C.grade(a, a.crate.F).code, 'MATCH'); assert.strictEqual(C.grade(a, f.fmax).code, 'STATIC'); }
    const b = C.gen('cp3', id, n), fb = M.forces(b.crate.p);
    if (b.answer > 0) { assert.strictEqual(C.grade(b, b.crate.F / b.crate.p.m).code, 'NOFRIC'); assert.strictEqual(C.grade(b, (b.crate.F - fb.fmax) / b.crate.p.m).code, 'MUS'); }
    else assert.strictEqual(C.grade(b, 1.5).code, 'HOLD');
    const c = C.gen('cp2', id, n);
    assert.strictEqual(C.grade(c, c.which === 'mus' ? c.mystery.muk : c.mystery.mus).code, 'SWAP');
    assert.strictEqual(C.grade(c, 45).code, 'FORCE');
  } });
});
