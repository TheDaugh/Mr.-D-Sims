/* Calculus 4.1: every generated answer is checked against the context and the numbers, never against the lesson's rules.
   meaning: the right option has the sign, size, units and direction from the data; the others fail one of those.
   units: the right option is rebuilt from the units. estimate: f(a) + h f′(a) with f′ a numeric derivative. rate: a numeric derivative. */
const test = require('node:test'), assert = require('node:assert'), path = require('path');
const spec = require(path.resolve(__dirname, '../../calculus/unit-4-contextual-applications/4-1-derivative-context.spec.js'));
function rng(seed) { let a = seed; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const skill = id => spec.skills.find(s => s.id === id);
const fn = js => new Function('x', 'return ' + js);
const h = 1e-5, d1 = (f, a) => (f(a + h) - f(a - h)) / (2 * h);

test('4.1 spec: selfPaced, no pacing, 3 review items, every generator works at bands 1 to 4', () => {
  assert.strictEqual(spec.selfPaced, true); assert.strictEqual(spec.pacing, undefined); assert.ok(spec.review.length <= 3);
  [...spec.review, ...spec.predicts, ...spec.mid, ...spec.observe].forEach(q => { assert.ok(q.answer >= 0 && q.answer < q.options.length, q.id); assert.ok(q.why, q.id); });
  for (const s of spec.skills) for (let b = 1; b <= 4; b++) for (let i = 0; i < 20; i++) { const q = s.gen(b, rng(i + b * 50)); assert.ok(q && q.worked, `${s.id} band ${b}`); }
});

test('4.1 meaning: right sentence carries the sign, the size and the units; the wrong ones fail one of them', () => {
  for (let b = 1; b <= 3; b++) for (let s = 0; s < 200; s++) {
    const q = skill('meaning').gen(b, rng(s * 7 + b)), right = q.options[q.answer], w = `band ${b} seed ${s}`;
    assert.strictEqual(new Set(q.options).size, q.options.length, w + ': options are distinct');
    if (q.data.say) {
      const d = q.data.say; assert.strictEqual(right, d.right, w);
      assert.ok(right.includes(String(d.v)) && right.includes(d.rate) && right.includes(d.dir) && right.includes('= ' + d.a), w + ': right option has size, units, direction, point');
      assert.ok(d.sign === d.v || d.sign === -d.v); if (b === 1) assert.ok(d.sign > 0, w + ': band 1 is positive only');
      q.options.forEach((o, i) => { if (i !== q.answer) assert.ok(!(o.includes(d.rate) && o.includes(d.dir)), w + ': a wrong option is also right: ' + o); });
    } else {
      const d = q.data.write; assert.strictEqual(right, d.right, w);
      assert.ok(right.includes("'(" + d.a + ')=' + d.v), w + ': right equation has the prime, the input and the rate');
      q.options.forEach((o, i) => { if (i !== q.answer) assert.ok(!o.includes("'(" + d.a + ')=' + d.v), w + ': wrong option has the right equation'); });
    }
  }
});

test('4.1 units: the right option is output units per input unit (twice for the second derivative)', () => {
  for (let b = 1; b <= 3; b++) for (let s = 0; s < 200; s++) {
    const q = skill('units').gen(b, rng(s * 5 + b)), d = q.data, right = q.options[q.answer], w = `band ${b} seed ${s}`;
    assert.strictEqual(right, d.kind === 'second' ? `${d.y} per ${d.xs} per ${d.xs}` : `${d.y} per ${d.xs}`, w); assert.strictEqual(new Set(q.options).size, q.options.length, w);
    assert.ok(d.kind === 'second' ? b === 2 : true, w);
  }
});

test('4.1 estimate: f(a) + h f′(a), and not the exact value of f(a + h)', () => {
  let inexact = 0;
  for (let b = 1; b <= 3; b++) for (let s = 0; s < 200; s++) {
    const q = skill('estimate').gen(b, rng(s * 3 + b)), d = q.data, w = `band ${b} seed ${s}`; assert.strictEqual(q.tol, 0, w);
    if (d.js) { const f = fn(d.js); assert.ok(Math.abs(q.answer - (f(d.a) + d.h * d1(f, d.a))) < 1e-3, `${w}: answer ${q.answer}`); if (Math.abs(q.answer - f(d.a + d.h)) > 0.5) inexact++; }
    else { assert.strictEqual(q.answer, d.f0 + d.rate * d.h, w); assert.ok(d.a + d.h > 0, w + ': the new input is positive'); }
  }
  assert.ok(inexact > 50, 'band 3 estimates differ from the exact value, so the tolerance has to be strict');
});

test('4.1 rate: matches a numeric derivative of the function in the prompt', () => {
  for (let b = 1; b <= 3; b++) for (let s = 0; s < 200; s++) {
    const q = skill('rate').gen(b, rng(s * 11 + b)), d = q.data, f = fn(d.js);
    assert.ok(Math.abs(q.answer - d1(f, d.a)) < 1e-3 * Math.max(1, Math.abs(q.answer)), `band ${b} seed ${s}: answer ${q.answer}, true ${d1(f, d.a)}`);
  }
});
