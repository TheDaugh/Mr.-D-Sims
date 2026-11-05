/* Calculus 3.4: every generated answer is checked against the function itself (data.js, plain JavaScript), never against the inverse-trig rules.
   The true derivative is a central difference of the function; the answer, the marked option and the tangent line must match it.
   - deriv: the typed answer matches f′ at sample points inside the item's own domain; no trap matches the answer.
   - slope: a clean decimal equal to f′(a).
   - inside: exactly one option equals f′, and it is the marked one; the others differ somewhere.
   - tangent: the line passes through (a, f(a)) with slope f′(a); no trap is equivalent to it. */
const test = require('node:test'), assert = require('node:assert'), path = require('path');
require('../../calculus/shared/mathcheck.js'); const MC = globalThis.MC;
const spec = require(path.resolve(__dirname, '../../calculus/unit-3-composite-implicit-inverse/3-4-inverse-trig.spec.js'));
function rng(seed) { let a = seed; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const skill = id => spec.skills.find(s => s.id === id);
const fn = js => new Function('x', 'return ' + js);
const fp = (f, a) => (f(a + 1e-6) - f(a - 1e-6)) / 2e-6;
const ev = (src, x) => MC.evaluate(MC.parse(src, ['x']), { x }, ['x']);
const close = (a, b, tol) => Math.abs(a - b) <= (tol || 1e-6) * Math.max(1, Math.abs(b));
const clean = v => Math.abs(v * 1000 - Math.round(v * 1000)) < 1e-6;
const pts = q => { const d = (q.domain && q.domain.x) || [0.6, 3.2]; return [0.1, 0.3, 0.5, 0.7, 0.9].map(t => d[0] + (d[1] - d[0]) * t); };

test('3.4 spec: selfPaced, no pacing, 3 review items, every generator works at bands 1 to 4', () => {
  assert.strictEqual(spec.selfPaced, true); assert.strictEqual(spec.pacing, undefined); assert.ok(spec.review.length <= 3);
  [...spec.review, ...spec.predicts, ...spec.mid, ...spec.observe].forEach(q => { assert.ok(q.answer >= 0 && q.answer < q.options.length, q.id); assert.ok(q.why, q.id); });
  for (const s of spec.skills) for (let b = 1; b <= 4; b++) for (let i = 0; i < 20; i++) assert.ok(s.gen(b, rng(i + b * 50)), `${s.id} band ${b}`);
});

test('3.4 deriv: the typed answer is the derivative of the function; no trap equals it', () => {
  for (let b = 1; b <= 3; b++) for (let s = 0; s < 150; s++) {
    const q = skill('deriv').gen(b, rng(s * 7 + b)), f = fn(q.data.js), w = `band ${b} seed ${s}: ${q.data.js}`;
    pts(q).forEach(x => assert.ok(close(ev(q.answer, x), fp(f, x), 1e-5), `${w} at ${x}: answer ${ev(q.answer, x)}, true ${fp(f, x)}`));
    assert.doesNotThrow(() => MC.equivalent(q.answer, q.answer, { vars: ['x'], domain: q.domain }), w + ' domain');
    q.traps.forEach(t => assert.ok(!MC.equivalent(t.expr, q.answer, { vars: ['x'], domain: q.domain }).ok, `${w}: trap equals the answer: ${t.expr}`));
    assert.ok(q.hints.length >= 3, w);
  }
});

test('3.4 slope: a clean decimal equal to f\'(a)', () => {
  for (let b = 1; b <= 3; b++) for (let s = 0; s < 150; s++) {
    const q = skill('slope').gen(b, rng(s * 11 + b)), d = q.data, w = `band ${b} seed ${s}: ${d.js} at ${d.a}`;
    assert.ok(close(q.answer, fp(fn(d.js), d.a), 1e-5), `${w}: answer ${q.answer}, true ${fp(fn(d.js), d.a)}`); assert.ok(clean(q.answer), w + ' not clean: ' + q.answer);
  }
});

test('3.4 inside: one option is f\', it is the marked one, and the others differ', () => {
  for (let b = 1; b <= 3; b++) for (let s = 0; s < 150; s++) {
    const q = skill('inside').gen(b, rng(s * 5 + b)), d = q.data, f = fn(d.js), w = `band ${b} seed ${s}: ${d.js}`;
    const grid = Array.from({ length: 39 }, (_, i) => +((i - 19) * 0.05).toFixed(2)).filter(x => x !== 0), X = grid.filter(x => d.opts.every(m => isFinite(ev(m, x))));   // where every option is defined
    const rel = (a, c) => Math.abs(a - c) <= 1e-6 * Math.abs(c);
    assert.ok(X.length >= 3, w + ' too few sample points'); assert.strictEqual(q.options.length, 4, w); assert.strictEqual(new Set(q.options).size, 4, w + ' repeated option');
    d.opts.forEach((m, i) => { const same = X.every(x => rel(ev(m, x), fp(f, x))); assert.strictEqual(same, i === q.answer, `${w}: option "${q.options[i]}" ${same ? 'also equals f\'' : 'is marked right but is not f\''}`); });
  }
});

test('3.4 tangent: through (a, f(a)) with slope f\'(a); traps differ', () => {
  for (let b = 1; b <= 3; b++) for (let s = 0; s < 150; s++) {
    const q = skill('tangent').gen(b, rng(s * 3 + b)), d = q.data, f = fn(d.js), w = `band ${b} seed ${s}: ${d.js} at ${d.a}`;
    assert.ok(close(ev(q.answer, d.a), f(d.a), 1e-9), `${w}: line misses the point (${ev(q.answer, d.a)} vs ${f(d.a)})`);
    assert.ok(close(fp(x => ev(q.answer, x), 1.7), fp(f, d.a), 1e-5), w + ' wrong slope');
    q.traps.forEach(t => assert.ok(!MC.equivalent(t.expr, q.answer, { vars: ['x'] }).ok, `${w}: trap equals the answer: ${t.expr}`));
  }
});
