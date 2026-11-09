/* Calculus 4.3: every generated answer is recomputed from the numbers in the item, never from the lesson's rules.
   avg: (f(b) − f(a)) / (b − a) from the table, two values or formula. inst: a numeric derivative. shape: the two signs. say: the right sentence or equation. */
const test = require('node:test'), assert = require('node:assert'), path = require('path');
const spec = require(path.resolve(__dirname, '../../calculus/unit-4-contextual-applications/4-3-rates-other.spec.js'));
function rng(seed) { let a = seed; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const skill = id => spec.skills.find(s => s.id === id);
const fn = js => new Function('x', 'return ' + js);
const h = 1e-5, d1 = (f, a) => (f(a + h) - f(a - h)) / (2 * h), hh = 1e-3, d2 = (f, a) => (f(a + hh) - 2 * f(a) + f(a - hh)) / (hh * hh);
const sg = v => v > 0 ? 1 : v < 0 ? -1 : 0;
const SHAPE = ['increasing, and the rate is getting bigger', 'increasing, but the rate is getting smaller', 'decreasing, and it is falling faster and faster', 'decreasing, but it is falling more and more slowly'];
const shapeOf = (fp, fpp) => fp > 0 ? (fpp > 0 ? 0 : 1) : (fpp < 0 ? 2 : 3);

test('4.3 spec: selfPaced, no pacing, 3 review items, every generator works at bands 1 to 4', () => {
  assert.strictEqual(spec.selfPaced, true); assert.strictEqual(spec.pacing, undefined); assert.ok(spec.review.length <= 3);
  [...spec.review, ...spec.predicts, ...spec.mid, ...spec.observe].forEach(q => { assert.ok(q.answer >= 0 && q.answer < q.options.length, q.id); assert.ok(q.why, q.id); });
  for (const s of spec.skills) for (let b = 1; b <= 4; b++) for (let i = 0; i < 20; i++) { const q = s.gen(b, rng(i + b * 50)); assert.ok(q && q.worked, `${s.id} band ${b}`); }
});

test('4.3 avg: matches (f(b) − f(a)) / (b − a) from the table, the two values or the formula; values stay positive', () => {
  for (let b = 1; b <= 3; b++) for (let s = 0; s < 250; s++) {
    const q = skill('avg').gen(b, rng(s * 7 + b)), d = q.data, w = `band ${b} seed ${s}`; assert.strictEqual(q.tol, 0, w);
    if (d.js) { const f = fn(d.js); assert.ok(Math.abs(q.answer - (f(d.b) - f(d.a)) / (d.b - d.a)) < 1e-9, `${w}: answer ${q.answer}`); assert.ok(f(d.a) > 0 && f(d.b) > 0, w + ': positive values'); }
    else if (d.x) { assert.ok(Math.abs(q.answer - (d.y[d.j] - d.y[d.i]) / (d.x[d.j] - d.x[d.i])) < 1e-9, w); assert.ok(d.y.every(v => v > 0), w + ': positive table values'); assert.strictEqual(d.j, d.i + 2, w); }
    else { assert.strictEqual(q.answer, (d.y2 - d.y1) / (d.x2 - d.x1), w); assert.ok(d.y1 > 0 && d.y2 > 0, w); }
  }
});

test('4.3 inst: matches a numeric derivative of the function in the item', () => {
  for (let b = 1; b <= 3; b++) for (let s = 0; s < 250; s++) {
    const q = skill('inst').gen(b, rng(s * 11 + b)), d = q.data, f = fn(d.js), true_ = d1(f, d.a);
    assert.ok(Math.abs(q.answer - true_) <= Math.max(0.006, 1e-4 * Math.abs(true_)), `band ${b} seed ${s}: answer ${q.answer}, true ${true_}`);
    assert.ok(typeof q.tol === 'number', 'a tolerance is set');
  }
});

test('4.3 shape: the right option follows the signs of f′ and f″', () => {
  const seen = new Set();
  for (let b = 1; b <= 3; b++) for (let s = 0; s < 250; s++) {
    const q = skill('shape').gen(b, rng(s * 3 + b)), d = q.data, w = `band ${b} seed ${s}`; let fp, fpp;
    if (d.fp !== undefined) { fp = d.fp; fpp = d.fpp; } else if (d.js) { const f = fn(d.js); fp = d1(f, d.a); fpp = d2(f, d.a); } else { fp = d.v1; fpp = d.v2 - d.v1; }
    assert.notStrictEqual(sg(Math.round(fp * 1e3) / 1e3), 0, w + ': f′ is not 0'); assert.notStrictEqual(sg(Math.round(fpp * 1e2) / 1e2), 0, w + ': f″ is not 0');
    assert.strictEqual(q.options[q.answer], SHAPE[shapeOf(fp, fpp)], `${w}: fp ${fp}, fpp ${fpp}`); seen.add(shapeOf(fp, fpp)); assert.strictEqual(new Set(q.options).size, 4, w);
  }
  assert.strictEqual(seen.size, 4, 'all four shapes occur');
});

test('4.3 say: the right sentence names the interval, "on average", the size and the units; the right equation divides by b − a', () => {
  for (let b = 1; b <= 3; b++) for (let s = 0; s < 250; s++) {
    const q = skill('say').gen(b, rng(s * 5 + b)), right = q.options[q.answer], w = `band ${b} seed ${s}`; assert.strictEqual(new Set(q.options).size, 4, w);
    if (q.data.say) { const d = q.data.say; assert.strictEqual(right, d.right, w); assert.ok(right.startsWith('On average') && right.includes(String(d.v)) && right.includes('= ' + d.a) && right.includes('= ' + d.b), w); assert.ok(d.b > d.a, w);
      q.options.forEach((o, i) => { if (i !== q.answer) assert.ok(!o.startsWith('On average'), w + ': a wrong option also says on average'); }); }
    else { const d = q.data.write; assert.strictEqual(right, d.right, w); assert.ok(right.includes('\\dfrac') && right.includes('{' + d.b + '-' + d.a + '}=' + d.v), w);
      q.options.forEach((o, i) => { if (i !== q.answer) assert.ok(!o.includes('{' + d.b + '-' + d.a + '}=' + d.v), w + ': wrong option has the right fraction'); }); }
  }
});
