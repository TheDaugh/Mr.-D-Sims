/* Calculus 3.2: every generated answer is checked against the curve itself, never against implicit differentiation.
   For F(x,y) = 0 the true slope is -Fx/Fy, with the partials taken numerically (central differences).
   - dydx:    the typed answer equals -Fx/Fy at several (x, y) pairs (the formula holds off the curve too, as a formula in x and y).
   - point:   the point is on the curve and the numeric answer equals -Fx/Fy there.
   - tangent: the point is on the curve, the line passes through it, and the line's slope equals -Fx/Fy there.
   - term:    the correct option, read as math with p = dy/dx, equals Tx + Ty*p; every wrong option differs. */
const test = require('node:test'), assert = require('node:assert'), path = require('path');
require('../../calculus/shared/mathcheck.js'); const MC = globalThis.MC;
const spec = require(path.resolve(__dirname, '../../calculus/unit-3-composite-implicit-inverse/3-2-implicit.spec.js'));
function rng(seed) { let a = seed; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const skill = id => spec.skills.find(s => s.id === id);
const ev = (src, env, vars) => MC.evaluate(MC.parse(src, vars), env);
const XY = ['x', 'y'], H = 1e-6;
const partials = (F, x, y) => ({ fx: (ev(F, { x: x + H, y }, XY) - ev(F, { x: x - H, y }, XY)) / (2 * H), fy: (ev(F, { x, y: y + H }, XY) - ev(F, { x, y: y - H }, XY)) / (2 * H) });
const slope = (F, x, y) => { const p = partials(F, x, y); return -p.fx / p.fy; };
const close = (a, b, tol) => Math.abs(a - b) <= (tol || 1e-4) * Math.max(1, Math.abs(b));

test('3.2 dydx: the typed answer equals -Fx/Fy at several points, every band', () => {
  for (let b = 1; b <= 4; b++) for (let s = 0; s < 80; s++) {
    const q = skill('dydx').gen(b, rng(s * 13 + b)), where = `band ${b} seed ${s}: ${q.F} -> ${q.answer}`;
    assert.deepStrictEqual(q.vars, ['x', 'y'], where);
    for (const [x, y] of [[0.7, 1.3], [1.4, 0.8], [2.1, 1.7], [1.1, 2.6]]) {
      const want = slope(q.F, x, y), got = ev(q.answer, { x, y }, XY);
      assert.ok(close(got, want, 1e-4), `${where} at (${x},${y}): -Fx/Fy ${want}, answer ${got}`);
    }
    (q.traps || []).forEach(t => assert.ok(!MC.equivalent(t.expr, q.answer, { vars: XY }).ok, where + ' trap equals the answer: ' + t.expr));
  }
});

test('3.2 point: the point is on the curve and the numeric answer equals the true slope', () => {
  for (let b = 1; b <= 4; b++) for (let s = 0; s < 120; s++) {
    const q = skill('point').gen(b, rng(s * 7 + b)), [x0, y0] = q.pt, where = `band ${b} seed ${s}: ${q.F} at (${x0},${y0})`;
    assert.ok(Math.abs(ev(q.F, { x: x0, y: y0 }, XY)) < 1e-9, where + ' point is not on the curve');
    assert.ok(close(q.answer, slope(q.F, x0, y0), 1e-4), `${where}: answer ${q.answer}, true ${slope(q.F, x0, y0)}`);
    assert.ok(isFinite(q.answer), where);
    assert.ok(Math.abs(q.answer * 1000 - Math.round(q.answer * 1000)) < 1e-6, where + ' answer is not a clean decimal (the keypad has no fraction key): ' + q.answer);
  }
});

test('3.2 tangent: line passes through the point with the true slope; wrong lines are not equivalent', () => {
  for (let b = 1; b <= 4; b++) for (let s = 0; s < 120; s++) {
    const q = skill('tangent').gen(b, rng(s * 5 + b)), [x0, y0] = q.pt, where = `band ${b} seed ${s}: ${q.F} at (${x0},${y0}) -> ${q.answer}`;
    assert.ok(Math.abs(ev(q.F, { x: x0, y: y0 }, XY)) < 1e-9, where + ' point is not on the curve');
    const f = x => ev(q.answer, { x }, ['x']);
    assert.ok(close(f(x0), y0, 1e-9), where + ' line misses the point');
    const m = (f(x0 + 1) - f(x0 - 1)) / 2;
    assert.ok(close(m, slope(q.F, x0, y0), 1e-6), where + ` slope ${m} vs ${slope(q.F, x0, y0)}`);
    (q.traps || []).forEach(t => assert.ok(!MC.equivalent(t.expr, q.answer, { vars: ['x'] }).ok, where + ' trap equals the answer: ' + t.expr));
  }
});

/* read an option such as "2x · e^y + x² · e^y · dy/dx" as math in x, y and p (= dy/dx) */
const asMath = t => t.replace(/ · /g, '*').replace(/−/g, '-').replace(/dx\/dy/g, '(1/p)').replace(/dy\/dx/g, 'p').replace(/²/g, '^2').replace(/³/g, '^3').replace(/⁴/g, '^4').replace(/⁵/g, '^5')
  .replace(/(sin|cos|ln) y/g, '$1(y)').replace(/ /g, '');
test('3.2 term: the marked option equals Tx + Ty*p, and each wrong option differs', () => {
  const V = ['x', 'y', 'p'], pts = [{ x: 1.3, y: 0.9, p: 0.7 }, { x: 0.8, y: 1.6, p: -0.4 }, { x: 1.9, y: 1.2, p: 1.1 }];
  for (let b = 1; b <= 4; b++) for (let s = 0; s < 80; s++) {
    const q = skill('term').gen(b, rng(s * 3 + b)), where = `band ${b} seed ${s}: T=${q.T} options ${JSON.stringify(q.options)}`;
    assert.strictEqual(new Set(q.options).size, q.options.length, where);
    const truth = e => { const h = 1e-6, tx = (ev(q.T, { x: e.x + h, y: e.y }, XY) - ev(q.T, { x: e.x - h, y: e.y }, XY)) / (2 * h), ty = (ev(q.T, { x: e.x, y: e.y + h }, XY) - ev(q.T, { x: e.x, y: e.y - h }, XY)) / (2 * h); return tx + ty * e.p; };
    q.options.forEach((o, i) => {
      const same = pts.every(e => close(ev(asMath(o), e, V), truth(e), 1e-5));
      assert.strictEqual(same, i === q.answer, `${where}: option "${o}" (${asMath(o)}) ${same ? 'matches' : 'differs'} but index ${q.answer} is marked`);
    });
  }
});
