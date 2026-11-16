/* The ramp-and-pulley sandbox physics (physics/sandbox/ramp-pulley-model.js): every number the sim shows or the key prints
   is checked here against the textbook answer. */
const test = require('node:test'), assert = require('node:assert'), path = require('path');
const M = require(path.resolve(__dirname, '../../physics/sandbox/ramp-pulley-model.js'));
const P = (o) => Object.assign({ theta: 0, m1: 10, m2: 0, mus: 0.5, muk: 0.3, g: 9.8, aE: 0, rain: false }, o);
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, (msg || '') + ' got ' + a + ' want ' + b);
function run(p, st, secs) { const n = Math.round(secs * 240); for (let i = 0; i < n; i++) M.step(p, st, 1 / 240); return st; }

test('the static criterion: a bare crate holds below atan(mu_s) and slips above it', () => {
  assert.strictEqual(M.verdict(P({ theta: 20, mus: 0.5 })), 'rest');      // tan 20 = 0.364
  assert.strictEqual(M.verdict(P({ theta: 26, mus: 0.5 })), 'rest');
  assert.strictEqual(M.verdict(P({ theta: 27, mus: 0.5 })), 'down');
  near(M.analyze(P({ mus: 0.5 })).slipNoCounter, 26.6, 0.05, 'slip angle');
});

test('sliding down with no counterweight: a = g (sin t - mu_k cos t)', () => {
  const p = P({ theta: 30, mus: 0.5, muk: 0.3 }), st = run(p, M.fresh(), 0.5);
  const want = 9.8 * (Math.sin(Math.PI / 6) - 0.3 * Math.cos(Math.PI / 6));
  near(st.a, -want, 1e-6, 'a is negative: down the ramp'); near(st.v, -want * 0.5, 0.02, 'v'); assert.strictEqual(st.T, 0);
});

test('Atwood on a flat ramp with no friction: a = m2 g / (m1 + m2), T = m1 a', () => {
  const p = P({ theta: 0, m1: 2, m2: 3, mus: 0, muk: 0 }), st = run(p, M.fresh(), 0.3);
  near(st.a, 3 * 9.8 / 5, 1e-6, 'a'); near(st.T, 2 * 9.8 * 3 / 5, 1e-6, 'T = m1 a'); near(st.T, 3 * (9.8 - st.a), 1e-6, 'T = m2 (g - a)');
});

test('ramp with a counterweight: a = (m2 g - m1 g sin t - mu_k m1 g cos t) / (m1 + m2)', () => {
  const p = P({ theta: 25, m1: 8, m2: 12, mus: 0.4, muk: 0.25 }), st = run(p, M.fresh(), 0.4), t = 25 * Math.PI / 180;
  near(st.a, (12 * 9.8 - 8 * 9.8 * Math.sin(t) - 0.25 * 8 * 9.8 * Math.cos(t)) / 20, 1e-6, 'a');
  near(st.T, 12 * (9.8 - st.a), 1e-6, 'T');
});

test('crate held by static friction: friction equals the unbalanced push, tension equals the counterweight', () => {
  const p = P({ theta: 20, m1: 10, m2: 3, mus: 0.6, muk: 0.4 }), st = run(p, M.fresh(), 0.2), t = 20 * Math.PI / 180;
  assert.strictEqual(st.moving, false); near(st.T, 3 * 9.8, 1e-9, 'T');
  near(st.f, -(3 * 9.8 - 10 * 9.8 * Math.sin(t)), 1e-9, 'static friction');
});

test('g does not change who slips, only how fast: Moon and Earth give the same verdict and a scales with g', () => {
  const e = P({ theta: 40, m1: 6, m2: 1, mus: 0.5, muk: 0.3, g: 9.8 }), m = Object.assign({}, e, { g: 1.62 });
  assert.strictEqual(M.verdict(e), M.verdict(m));
  near(M.analyze(m).a / M.analyze(e).a, 1.62 / 9.8, 1e-9, 'a ratio');
});

test('rain halves mu: a crate that held now slides', () => {
  const dry = P({ theta: 22, mus: 0.5, muk: 0.3 }), wet = Object.assign({}, dry, { rain: true });
  assert.strictEqual(M.verdict(dry), 'rest'); assert.strictEqual(M.verdict(wet), 'down');
  near(M.forces(wet).mus, 0.25, 1e-12); near(M.forces(wet).muk, 0.15, 1e-12);
});

test('an elevator speeding up scales every force: same verdict, a multiplied by (g + aE)/g', () => {
  const base = P({ theta: 30, m1: 5, m2: 0, mus: 0.4, muk: 0.2 }), lift = Object.assign({}, base, { aE: 2.5 });
  assert.strictEqual(M.verdict(base), M.verdict(lift));
  near(M.analyze(lift).a / M.analyze(base).a, (9.8 + 2.5) / 9.8, 1e-9, 'a ratio');
});

test('kinetic mu above static is not allowed: mu_k is capped at mu_s', () => {
  near(M.forces(P({ mus: 0.2, muk: 0.6 })).muk, 0.2, 1e-12);
});

test('friction stops a crate sent up the ramp, and it stays stopped when static friction can hold it', () => {
  const p = P({ theta: 10, m1: 5, mus: 0.6, muk: 0.4 }), st = M.fresh(); st.v = 1.0;
  run(p, st, 1.5); assert.strictEqual(st.v, 0); assert.strictEqual(st.moving, false);
  const s1 = st.s; run(p, st, 1); assert.strictEqual(st.s, s1);
});

test('a crate that slides up reaches the top bumper, stops there, and never passes it', () => {
  const p = P({ theta: 5, m1: 2, m2: 10, mus: 0.1, muk: 0.05 }), st = run(p, M.fresh(), 6), lim = M.limits(5, true);
  assert.ok(st.s <= lim.hi + 1e-9); near(st.s, lim.hi, 1e-9, 'rests at the limit'); assert.strictEqual(st.v, 0); assert.strictEqual(st.stop, 'top');
});

test('the counterweight cannot pass through the floor, at any angle', () => {
  for (const th of [0, 15, 40, 75]) {
    const lim = M.limits(th, true), cy = M.L * Math.sin(th * Math.PI / 180) + (M.RISE - M.PULLEY_R) * Math.cos(th * Math.PI / 180);
    const h = M.H0 + (lim.hi - M.S0), bottom = cy - h - M.CW_H;
    assert.ok(bottom >= M.FLOOR - 1e-9, 'theta ' + th + ' bottom ' + bottom);
    assert.ok(lim.hi > M.S0 + 1, 'there is room to move at ' + th);
    assert.ok(lim.lo < M.S0, 'room to rise');
  }
});

test('the key lists the angles where the crate stays put, and each edge really flips the verdict', () => {
  const p = P({ m1: 10, m2: 4, mus: 0.5, muk: 0.3 }), a = M.analyze(p);
  assert.ok(a.restRanges.length >= 1);
  for (const [lo, hi] of a.restRanges) {
    assert.strictEqual(M.verdict(Object.assign({}, p, { theta: (lo + hi) / 2 })), 'rest');
    if (hi < 85) assert.notStrictEqual(M.verdict(Object.assign({}, p, { theta: hi + 0.2 })), 'rest');
    if (lo > 0) assert.notStrictEqual(M.verdict(Object.assign({}, p, { theta: lo - 0.2 })), 'rest');
  }
});

test('settle keeps the crate in range when the angle drops under it', () => {
  const st = M.fresh(); st.s = 8; const p = P({ theta: 0, m2: 5 }); M.settle(p, st);
  assert.ok(st.s <= M.limits(0, true).hi + 1e-12);
});
