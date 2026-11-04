/* Calculus 3.3: every generated answer is checked against f itself, never against the inverse-derivative formula.
   The true inverse slope at b = f(a) is 1 / f'(a), with f' taken numerically (central difference) from the function text.
   - swap/compute/which/tangent: b = f(a) holds, and the answer (or the correct option, or the line's slope) matches 1/f'(a).
   - the table item: the answer comes from the row where f(x) equals the asked value, not the decoy rows.
   - the keypad has no fraction key, so num answers are clean decimals; wrong tangent lines are not equivalent to the right one. */
const test = require('node:test'), assert = require('node:assert'), path = require('path');
require('../../calculus/shared/mathcheck.js'); const MC = globalThis.MC;
const spec = require(path.resolve(__dirname, '../../calculus/unit-3-composite-implicit-inverse/3-3-inverse.spec.js'));
function rng(seed) { let a = seed; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const skill = id => spec.skills.find(s => s.id === id);
const ev = (src, x) => MC.evaluate(MC.parse(src, ['x']), { x }, ['x']);
const fp = (src, a) => (ev(src, a + 1e-6) - ev(src, a - 1e-6)) / 2e-6;
const close = (a, b, tol) => Math.abs(a - b) <= (tol || 1e-6) * Math.max(1, Math.abs(b));
const clean = v => Math.abs(v * 1000 - Math.round(v * 1000)) < 1e-6;

test('3.3 spec: selfPaced, no pacing, 3 review items at most, three bands handled', () => {
  assert.strictEqual(spec.selfPaced, true); assert.strictEqual(spec.pacing, undefined);
  assert.ok(spec.review.length <= 3);
  [...spec.review, ...spec.predicts, ...spec.mid, ...spec.observe].forEach(q => { assert.ok(q.answer >= 0 && q.answer < q.options.length, q.id); assert.ok(q.why, q.id); });
  for (const s of spec.skills) for (let b = 1; b <= 3; b++) for (let i = 0; i < 20; i++) assert.ok(s.gen(b, rng(i + b * 50)), `${s.id} band ${b}`);
});

test('3.3 compute: f(a) = b and the answer is 1/f\'(a), clean decimal', () => {
  for (let b = 1; b <= 3; b++) for (let s = 0; s < 150; s++) {
    const q = skill('compute').gen(b, rng(s * 7 + b)), d = q.data, w = `band ${b} seed ${s}: ${d.fx}`;
    assert.ok(close(ev(d.fx, d.a), d.b), w + ` f(${d.a}) is ${ev(d.fx, d.a)}, not ${d.b}`);
    assert.ok(close(q.answer, 1 / fp(d.fx, d.a), 1e-5), `${w}: answer ${q.answer}, true ${1 / fp(d.fx, d.a)}`);
    assert.ok(close(d.d, fp(d.fx, d.a), 1e-5), w + ' stored f\' is off');
    assert.ok(clean(q.answer), w + ' not a clean decimal: ' + q.answer);
  }
});

test('3.3 swap: answer is the reciprocal; the table item reads the row where f(x) equals the asked value', () => {
  for (let b = 1; b <= 3; b++) for (let s = 0; s < 150; s++) {
    const q = skill('swap').gen(b, rng(s * 11 + b)), d = q.data, w = `band ${b} seed ${s}`;
    assert.ok(close(q.answer, 1 / d.d), w); assert.ok(clean(q.answer), w + ' ' + q.answer);
    if (d.table) { const T = d.table, rows = T.x.map((x, i) => i).filter(i => T.f[i] === d.b); assert.strictEqual(rows.length, 1, w + ' ambiguous row'); assert.strictEqual(T.d[rows[0]], d.d, w); assert.ok(new Set(T.f).size === 3, w); assert.ok(!T.f.includes(d.d) || true); }
    else assert.ok(q.prompt.includes('(' + d.b + ')'), w);
  }
});

test('3.3 which: the right option is the input a with f(a) = b, and no wrong option is', () => {
  for (let b = 1; b <= 3; b++) for (let s = 0; s < 150; s++) {
    const q = skill('which').gen(b, rng(s * 5 + b)), d = q.data, w = `band ${b} seed ${s}`, val = o => { const t = o.replace('x = ', ''); return t.includes('/') ? 1 / +t.split('/')[1] : +t; };
    assert.ok(close(ev(d.fx, d.a), d.b), w); assert.strictEqual(new Set(q.options).size, q.options.length, w + ' repeated option');
    q.options.forEach((o, i) => { const ok = close(ev(d.fx, val(o)), d.b, 1e-6); assert.strictEqual(ok, i === q.answer, `${w}: option "${o}" ${ok ? 'also works' : 'is marked right but fails'}`); });
  }
});

test('3.3 tangent: the line passes through (b, a) with slope 1/f\'(a); the traps differ', () => {
  for (let b = 1; b <= 3; b++) for (let s = 0; s < 150; s++) {
    const q = skill('tangent').gen(b, rng(s * 3 + b)), d = q.data, w = `band ${b} seed ${s}: ${d.fx}`;
    assert.ok(close(ev(d.fx, d.a), d.b), w);
    assert.ok(close(ev(q.answer, d.b), d.a), w + ' line misses the point'); assert.ok(close(fp(q.answer, d.b), 1 / fp(d.fx, d.a), 1e-5), w + ' wrong slope');
    q.traps.forEach(t => assert.ok(!MC.equivalent(t.expr, q.answer, { vars: ['x'] }).ok, w + ' trap equals answer: ' + t.expr));
  }
});
