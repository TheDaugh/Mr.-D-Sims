/* Slot 7 (Coulomb's law): every answer the lesson can show is recomputed here with exact fractions, apart from the generator. */
const test = require('node:test'), assert = require('node:assert');
const C = require('../../chemistry/shared/coulomb-practice.js');
const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
const fr = x => Array.isArray(x) ? x : [x, 1];
// independent: new force = base × a × b ÷ c²  (a, b, c may be [n,d])
function newForce(p) { const [an, ad] = fr(p.a), [bn, bd] = fr(p.b), [cn, cd] = fr(p.c); return p.base * (an / ad) * (bn / bd) / ((cn / cd) * (cn / cd)); }

test('sim force: 36 × |q1 q2| / r², always positive', () => {
  assert.strictEqual(C.force(1, 1, 1), 36); assert.strictEqual(C.force(1, 1, 2), 9); assert.strictEqual(C.force(1, 1, 3), 4); assert.strictEqual(C.force(1, 1, 6), 1);
  assert.strictEqual(C.force(2, 1, 1), 72); assert.strictEqual(C.force(-2, 3, 3), 24);
});
test('factor(): double distance quarter, double a charge double, both ×4', () => {
  assert.deepStrictEqual(C.factor(1, 1, 2), { n: 1, d: 4 }); assert.deepStrictEqual(C.factor(2, 1, 1), { n: 2, d: 1 });
  assert.deepStrictEqual(C.factor(2, 2, 1), { n: 4, d: 1 }); assert.deepStrictEqual(C.factor(1, 1, [1, 2]), { n: 4, d: 1 });
  assert.deepStrictEqual(C.factor(2, 1, 2), { n: 1, d: 2 });
});
test('check: exactly one correct option per mcq, and it matches the physics', () => {
  const want = { c1: '¼ as big', c2: '1⁄9 as big', c3: '4 times as big', c4: '2 times as big', c5: '3 times as big', c6: '4 times as big' };
  C.CHECK.filter(i => i.kind === 'mcq').forEach(i => { const ok = i.opts.filter(o => o.tag === 'ok'); assert.strictEqual(ok.length, 1, i.id); assert.strictEqual(ok[0].t, want[i.id], i.id); });
  const t7 = C.CHECK.find(i => i.id === 'c7'), t8 = C.CHECK.find(i => i.id === 'c8');
  assert.deepStrictEqual(t7.cols.map(c => c.ans), [2, 3, 6].map(r => 36 / (r * r)));
  assert.deepStrictEqual(t8.cols.map(c => c.ans), [[2, 1], [1, 3], [2, 3]].map(([a, b]) => 6 * a * b));
});
test('route(): fluent, standard and scaffolded paths', () => {
  const best = {}; C.CHECK.forEach(i => { best[i.id] = i.kind === 'mcq' ? i.opts.find(o => o.tag === 'ok').t : i.cols.map(c => c.ans); });
  assert.strictEqual(C.route(best).route, 'fluent'); assert.strictEqual(C.route(best).right, 8);
  const lin = Object.assign({}, best, { c1: '2 times as big', c2: '3 times as big' }); // two linear guesses
  assert.strictEqual(C.route(lin).route, 'scaf'); assert.strictEqual(C.route(lin).tags.lin, 2);
  const inv = Object.assign({}, best, { c1: '½ as big', c2: '⅓ as big' }); // inverse guesses, 6 right
  assert.strictEqual(C.route(inv).route, 'std'); assert.strictEqual(C.route(inv).tags.inv, 2);
  const sq = Object.assign({}, best, { c4: '¼ as big', c5: '1⁄9 as big' });
  assert.strictEqual(C.route(sq).tags.invsq, 2); assert.strictEqual(C.route(sq).route, 'std');
  assert.strictEqual(C.route(Object.assign({}, best, { c7: [72, 108, 216] })).tags.lin, 1); // growing with distance
  assert.strictEqual(C.route(Object.assign({}, best, { c7: [34, 32, 26] })).tags.lin, 1);     // equal steps down
  assert.strictEqual(C.route(Object.assign({}, best, { c7: [18, 12, 6] })).tags.inv, 1);      // 36/r
  assert.strictEqual(C.route({}).route, 'scaf');
});
test('shell pull: Z / n⁴ relative to H shell 1', () => {
  assert.deepStrictEqual(C.pull(1, 2), { n: 1, d: 16 }); assert.deepStrictEqual(C.pull(1, 3), { n: 1, d: 81 });
  assert.deepStrictEqual(C.pull(3, 2), { n: 3, d: 16 }); assert.deepStrictEqual(C.pull(2, 1), { n: 2, d: 1 });
  // same thing from first principles: distance n², force ∝ Z / distance²
  for (const Z of [1, 2, 3]) for (const n of [1, 2, 3]) { const f = C.pull(Z, n); assert.ok(Math.abs(f.n / f.d - Z / ((n * n) ** 2)) < 1e-12); }
});
test('simple questions: one correct option each, numeric one is 20', () => {
  C.SIMPLE.forEach(s => { if (s.opts) assert.strictEqual(s.opts.filter(o => o[1]).length, 1, s.id); });
  assert.strictEqual(C.SIMPLE[5].num, 10 * 2);
});
test('closing ladder: every slot × band recomputed independently', () => {
  const exp = {
    '1:1': 1 / 4, '1:2': 1 / 16, '1:3': 2, '1:4': 3 * 81,
    '2:1': 12 * 2, '2:2': 36 / 9, '2:3': 48 / 4 * 3, '2:4': 40 * 2 * 10 / 25,
    '3:1': 0.4 / 4, '3:2': 0.9 / 9, '3:3': 8 / (60 / 15) ** 2, '3:4': 8 / (60 / 15) ** 2 / 2,
    '4:1': 2, '4:2': 3, '4:3': 5, '4:4': 4
  };
  for (const k in exp) { const [s, b] = k.split(':').map(Number); const it = C.closing(s, b); assert.ok(Math.abs(it.ans - exp[k]) < 1e-9, k + ' got ' + it.ans); assert.strictEqual(it.band, b); }
  assert.strictEqual(C.closing(5, 1), null);
});
test('endless practice: 400 seeds × 4 bands, answers recomputed from parameters, 2-decimal clean', () => {
  const seen = new Set();
  for (let band = 1; band <= 4; band++) for (let n = 0; n < 400; n++) {
    const it = C.spec(n, band, 'test|' + (n % 7)), p = it.p;
    assert.ok(it.q && it.why && it.hint && it.skill.startsWith('chem.coulomb.') && it.band === band, 'shape');
    const expect = p.back ? p.a : newForce(p);
    assert.ok(Math.abs(it.ans - expect) < 1e-6, `band ${band} n ${n}: ${it.q} -> ${it.ans} vs ${expect}`);
    if (p.back) assert.ok(Math.abs(p.a / (p.c * p.c) - 1) < 1e-12);
    assert.ok(Math.abs(it.ans * 100 - Math.round(it.ans * 100)) < 1e-6, 'two decimals: ' + it.ans);
    assert.ok(it.ans > 0 && it.ans < 1e5);
    seen.add(band + '|' + it.title);
  }
  assert.ok(seen.size >= 7, 'variety: ' + [...seen].join(', '));
  assert.notStrictEqual(C.spec(1, 2, 'a').q + C.spec(2, 2, 'a').q + C.spec(3, 2, 'a').q, '');
});
test('extension items and named traps', () => {
  assert.ok(Math.abs(C.extension(1).ans - (3 - 2) / 16) < 1e-4); assert.ok(Math.abs(C.extension(2).ans - (11 - 10) / 81) < 5e-5);
  const it = C.spec(4, 2, 'x'); assert.ok(Array.isArray(it.traps));
  for (let n = 0; n < 200; n++) for (const b of [1, 2, 3]) { const x = C.spec(n, b, 'trap'); x.traps.forEach(t => assert.ok(Math.abs(t.v - x.ans) > 0.011, 'a trap must not equal the answer')); }
});
test('ladder: two right climb, two misses drop, bounded 1 to 4', () => {
  const L = require('../../chemistry/shared/ladder.js'), s = L.init(2);
  L.record(s, true); assert.strictEqual(s.band, 2); L.record(s, true); assert.strictEqual(s.band, 3);
  L.record(s, true); L.record(s, true); L.record(s, true); L.record(s, true); assert.strictEqual(s.band, 4);
  L.record(s, false); assert.strictEqual(s.band, 4); L.record(s, false); assert.strictEqual(s.band, 3);
  for (let i = 0; i < 20; i++) L.record(s, false); assert.strictEqual(s.band, 1);
  assert.strictEqual(L.init(9).band, 4); assert.strictEqual(L.init(0).band, 1);
});
