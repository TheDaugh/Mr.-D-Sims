/* Calculus 4.2: every generated answer is checked against the position function itself (data.js), never against the lesson's rules.
   vel: typed v vs a numeric derivative. accel: typed a vs a second difference. dir and speed: signs recomputed from the function. */
const test = require('node:test'), assert = require('node:assert'), path = require('path');
require('../../calculus/shared/mathcheck.js'); const MC = globalThis.MC;
const spec = require(path.resolve(__dirname, '../../calculus/unit-4-contextual-applications/4-2-motion.spec.js'));
function rng(seed) { let a = seed; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const skill = id => spec.skills.find(s => s.id === id);
const fn = js => new Function('x', 'return ' + js);
const h = 1e-3, D1 = (f, a) => (f(a + h) - f(a - h)) / (2 * h), D2 = (f, a) => (f(a + h) - 2 * f(a) + f(a - h)) / (h * h);
const ev = (src, t) => MC.evaluate(MC.parse(src, ['t']), { t }, ['t']);
const close = (a, b, tol) => Math.abs(a - b) <= (tol || 1e-6) * Math.max(1, Math.abs(b));
const sgn = (v, e) => Math.abs(v) < (e || 1e-3) ? 0 : v > 0 ? 1 : -1;

test('4.2 spec: selfPaced, no pacing, 3 review items, every generator works at bands 1 to 4', () => {
  assert.strictEqual(spec.selfPaced, true); assert.strictEqual(spec.pacing, undefined); assert.ok(spec.review.length <= 3);
  [...spec.review, ...spec.predicts, ...spec.mid, ...spec.observe].forEach(q => { assert.ok(q.answer >= 0 && q.answer < q.options.length, q.id); assert.ok(q.why, q.id); });
  for (const s of spec.skills) for (let b = 1; b <= 4; b++) for (let i = 0; i < 20; i++) { const q = s.gen(b, rng(i + b * 50)); assert.ok(q && q.worked, `${s.id} band ${b}`); }
});

test('4.2 vel: the typed answer is s′; traps are not equal to it', () => {
  for (let b = 1; b <= 3; b++) for (let s = 0; s < 200; s++) {
    const q = skill('vel').gen(b, rng(s * 7 + b)), f = fn(q.data.js), w = `band ${b} seed ${s}: ${q.data.js}`;
    [0.7, 1.3, 1.9, 2.6].forEach(t => assert.ok(close(ev(q.answer, t), D1(f, t), 1e-4), `${w} at ${t}: answer ${ev(q.answer, t)}, true ${D1(f, t)}`));
    q.traps.forEach(t => assert.ok(!MC.equivalent(t.expr, q.answer, { vars: ['t'] }).ok, `${w}: trap equals the answer: ${t.expr}`)); assert.ok(q.hints.length >= 3, w);
  }
});

test('4.2 accel: the typed answer is s″; traps are not equal to it', () => {
  for (let b = 1; b <= 3; b++) for (let s = 0; s < 200; s++) {
    const q = skill('accel').gen(b, rng(s * 13 + b)), f = fn(q.data.js), w = `band ${b} seed ${s}: ${q.data.js}`;
    [0.7, 1.3, 1.9, 2.6].forEach(t => assert.ok(close(ev(q.answer, t), D2(f, t), 1e-4), `${w} at ${t}: answer ${ev(q.answer, t)}, true ${D2(f, t)}`));
    q.traps.forEach(t => assert.ok(!MC.equivalent(t.expr, q.answer, { vars: ['t'] }).ok, `${w}: trap equals the answer: ${t.expr}`));
  }
});

test('4.2 dir: right, left or at rest follows the sign of v', () => {
  for (let b = 1; b <= 3; b++) for (let s = 0; s < 250; s++) {
    const q = skill('dir').gen(b, rng(s * 3 + b)), d = q.data, w = `band ${b} seed ${s}`;
    const v = d.v !== undefined ? d.v : (d.kind === 'v' ? fn(d.js)(d.a) : D1(fn(d.js), d.a)), sg = sgn(v);
    assert.strictEqual(d.ans, sg > 0 ? 0 : sg < 0 ? 1 : 2, `${w}: v = ${v}`); assert.strictEqual(q.options[q.answer], ['to the right', 'to the left', 'at rest for an instant'][d.ans], w); assert.strictEqual(new Set(q.options).size, 4, w);
  }
});

test('4.2 speed: speeding up when v and a share a sign, slowing down when they do not, neither when a is 0', () => {
  const seen = new Set();
  for (let b = 1; b <= 3; b++) for (let s = 0; s < 250; s++) {
    const q = skill('speed').gen(b, rng(s * 5 + b)), d = q.data, w = `band ${b} seed ${s}`; let v, a;
    if (d.v !== undefined) { v = d.v; a = d.acc; } else if (d.kind === 'v') { v = fn(d.js)(d.a); a = D1(fn(d.js), d.a); } else { v = D1(fn(d.js), d.a); a = D2(fn(d.js), d.a); }
    assert.notStrictEqual(sgn(v), 0, `${w}: v must not be 0`);
    const want = sgn(a) === 0 ? 2 : (sgn(v) * sgn(a) > 0 ? 0 : 1); assert.strictEqual(d.ans, want, `${w}: v ${v}, a ${a}`);
    assert.ok(q.options[q.answer].startsWith(['speeding up', 'slowing down', 'neither'][want]), w); seen.add(want);
  }
  assert.ok(seen.has(0) && seen.has(1) && seen.has(2), 'all three outcomes occur');
});
