/* Calculus 3.5: every generated answer is checked against the function itself (data), never against the lesson's rules.
   second: typed f″ vs a second difference of data.js; traps differ. nth: closed forms (k^n, sin(nπ/2), falling factorial).
   read: sign or estimate recomputed from the table / f′ polynomial. implicit: second difference of the curve's branch y(x). */
const test = require('node:test'), assert = require('node:assert'), path = require('path');
require('../../calculus/shared/mathcheck.js'); const MC = globalThis.MC;
const spec = require(path.resolve(__dirname, '../../calculus/unit-3-composite-implicit-inverse/3-5-higher-order.spec.js'));
function rng(seed) { let a = seed; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const skill = id => spec.skills.find(s => s.id === id);
const fn = js => new Function('x', 'return ' + js);
const h = 1e-3, f2 = (f, a) => (f(a + h) - 2 * f(a) + f(a - h)) / (h * h);
const ev = (src, x) => MC.evaluate(MC.parse(src, ['x']), { x }, ['x']);
const close = (a, b, tol) => Math.abs(a - b) <= (tol || 1e-6) * Math.max(1, Math.abs(b));

test('3.5 spec: selfPaced, no pacing, 3 review items, every generator works at bands 1 to 4', () => {
  assert.strictEqual(spec.selfPaced, true); assert.strictEqual(spec.pacing, undefined); assert.ok(spec.review.length <= 3);
  [...spec.review, ...spec.predicts, ...spec.mid, ...spec.observe].forEach(q => { assert.ok(q.answer >= 0 && q.answer < q.options.length, q.id); assert.ok(q.why, q.id); });
  for (const s of spec.skills) for (let b = 1; b <= 4; b++) for (let i = 0; i < 20; i++) { const q = s.gen(b, rng(i + b * 50)); assert.ok(q && q.worked, `${s.id} band ${b}`); }
});

test('3.5 second: the typed answer is f″; traps are not equal to it', () => {
  for (let b = 1; b <= 3; b++) for (let s = 0; s < 150; s++) {
    const q = skill('second').gen(b, rng(s * 7 + b)), f = fn(q.data.js), w = `band ${b} seed ${s}: ${q.data.js}`;
    [0.8, 1.3, 1.9, 2.6].forEach(x => assert.ok(close(ev(q.answer, x), f2(f, x), 1e-4), `${w} at ${x}: answer ${ev(q.answer, x)}, true ${f2(f, x)}`));
    q.traps.forEach(t => assert.ok(!MC.equivalent(t.expr, q.answer, { vars: ['x'] }).ok, `${w}: trap equals the answer: ${t.expr}`));
    assert.ok(q.hints.length >= 3, w);
  }
});

test('3.5 nth: matches the closed form', () => {
  for (let b = 1; b <= 3; b++) for (let s = 0; s < 150; s++) {
    const q = skill('nth').gen(b, rng(s * 11 + b)), d = q.data, w = `band ${b} seed ${s}: ${JSON.stringify(d)}`;
    let v;
    if (d.kind === 'exp') v = Math.pow(d.k, d.n);
    else if (d.kind === 'mono') { v = 1; for (let i = 0; i < d.n; i++) v *= d.m - i; v *= Math.pow(d.a, d.m - d.n); }
    else { v = Math.pow(d.k, d.n) * (d.kind === 'sin' ? Math.round(Math.sin(d.n * Math.PI / 2)) : Math.round(Math.cos(d.n * Math.PI / 2))); }
    assert.ok(Math.abs(q.answer - v) < 1e-9, `${w}: answer ${q.answer}, closed form ${v}`);
  }
});

test('3.5 read: sign or estimate follows from the numbers', () => {
  for (let b = 1; b <= 3; b++) for (let s = 0; s < 150; s++) {
    const q = skill('read').gen(b, rng(s * 5 + b)), d = q.data, w = `band ${b} seed ${s}`;
    if (d.table && q.type === 'choice') { const [a, , c] = d.table.fp, sg = Math.sign(c - a); assert.strictEqual(q.answer, sg > 0 ? 0 : sg < 0 ? 1 : 2, w); }
    else if (d.table) { const [x1, x2] = d.table.x, [A, B] = d.table.fp; assert.ok(close(q.answer, (B - A) / (x2 - x1), 1e-9), w); }
    else if (d.fpjs) { const sg = Math.sign(Math.round((fn(d.fpjs)(d.a + h) - fn(d.fpjs)(d.a - h)) / (2 * h) * 1e4) / 1e4); assert.strictEqual(q.answer, sg > 0 ? 0 : sg < 0 ? 1 : 2, w); }
    else assert.ok(d.stmt >= 0 && d.stmt <= 2 && q.answer === d.stmt, w);
  }
});

test('3.5 implicit: matches a second difference of the branch through the point', () => {
  for (let b = 1; b <= 3; b++) for (let s = 0; s < 150; s++) {
    const q = skill('implicit').gen(b, rng(s * 3 + b)), d = q.data, w = `band ${b} seed ${s}: ${d.js} at ${d.a}`;
    assert.ok(close(q.answer, f2(fn(d.js), d.a), 1e-3), `${w}: answer ${q.answer}, true ${f2(fn(d.js), d.a)}`);
  }
});
