/* Slot 15 (effective nuclear charge): the model, the pools and every generated item, recomputed independently of the generators. */
const test = require('node:test'), assert = require('node:assert');
const Z = require('../../chemistry/shared/zeff.js');
const C = require('../../chemistry/unit-3-atoms-ions/day-cards/slot-15.content.js');
const P = require('../../chemistry/shared/pes-data.js');

function rng(seed) { let s = seed >>> 0; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }

/* an independent count: electrons per shell from the Aufbau order, no shortcut for valence */
function shells(z) {
  const order = [[1, 2], [2, 2], [2, 6], [3, 2], [3, 6], [4, 2], [3, 10], [4, 6]], out = {};
  let left = z; for (const [n, cap] of order) { const k = Math.min(cap, left); if (k) out[n] = (out[n] || 0) + k; left -= k; if (!left) break; }
  return out;
}
const coreOf = z => { const s = shells(z), top = Math.max(...Object.keys(s).map(Number)); return z - s[top]; };

test('model: rings, core, Z_eff and n agree with an independent shell count for Z = 3..20', () => {
  for (let z = 3; z <= 20; z++) {
    const a = Z.atom(z), s = shells(z), top = Math.max(...Object.keys(s).map(Number));
    assert.strictEqual(a.rings.reduce((x, y) => x + y, 0), z, 'rings sum to Z ' + z);
    assert.strictEqual(a.core, coreOf(z), 'core ' + z);
    assert.strictEqual(a.zeff, z - coreOf(z));
    assert.strictEqual(a.n, top);
    assert.strictEqual(a.zeff, a.valence, 'valence electrons do not shield each other here');
    assert.deepStrictEqual(a.pull, [a.zeff, top * top]);
  }
  assert.throws(() => Z.atom(21)); assert.throws(() => Z.atom(2));
});

test('model: Z_eff is 1..8 across period 3 and 1 down group 1', () => {
  assert.deepStrictEqual([11, 12, 13, 14, 15, 16, 17, 18].map(z => Z.atom(z).zeff), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepStrictEqual([3, 11, 19].map(z => Z.atom(z).zeff), [1, 1, 1]);
  assert.deepStrictEqual([3, 11, 19].map(z => Z.atom(z).core), [2, 10, 18]);
});

test('pull comparison is exact (cross-multiplied) and antisymmetric', () => {
  for (let a = 3; a <= 20; a++) for (let b = 3; b <= 20; b++) {
    const A = Z.atom(a), B = Z.atom(b);
    assert.ok(Z.cmp(A, B) === -Z.cmp(B, A));
    assert.ok(Z.cmp(A, B) === (Math.sign(A.zeff / (A.n ** 2) - B.zeff / (B.n ** 2)) || 0));
  }
});

test('DIP_PAIRS is exactly the set of pairs where the estimate disagrees with the measured first ionization energy (NIST, pes-data.js)', () => {
  const found = [];
  for (let a = 3; a <= 20; a++) for (let b = a + 1; b <= 20; b++) {
    const m = Z.cmp(Z.atom(a), Z.atom(b)), r = Math.sign(P.OUTER_IE_NIST[a] - P.OUTER_IE_NIST[b]);
    if (m !== 0 && m !== r) found.push([a, b]);
  }
  assert.deepStrictEqual(C.DIP_PAIRS.map(p => p.join('-')).sort(), found.map(p => p.join('-')).sort());
});

test('pools: no dip pair, no tie, and every pair agrees with the measured ordering', () => {
  [1, 2, 3].forEach(b => {
    assert.ok(C.POOLS[b].length >= 3, 'band ' + b + ' pool is not empty');
    C.POOLS[b].forEach(([x, y]) => {
      assert.ok(!C.isDip(x, y)); assert.notStrictEqual(Z.cmp(Z.atom(x), Z.atom(y)), 0);
      assert.strictEqual(Z.cmp(Z.atom(x), Z.atom(y)), Math.sign(P.OUTER_IE_NIST[x] - P.OUTER_IE_NIST[y]), 'pair ' + x + '/' + y);
    });
  });
  // band 1 is one group (same Z_eff); band 2 is one group or one period (one thing differs); band 3 holds pairs that differ in both
  C.POOLS[1].forEach(([x, y]) => assert.strictEqual(Z.atom(x).zeff, Z.atom(y).zeff));
  C.POOLS[2].forEach(([x, y]) => { const a = Z.atom(x), b = Z.atom(y); assert.ok(a.zeff === b.zeff || a.n === b.n); });
  assert.ok(C.POOLS[3].some(([x, y]) => Z.atom(x).zeff !== Z.atom(y).zeff && Z.atom(x).n !== Z.atom(y).n));
  assert.ok([11, 12, 13, 14, 15, 16, 17, 18].every(z => C.POOLS[3].some(p => p.includes(z))), 'band 3 reaches the whole of period 3');
});

test('skills: 3 skills x 3 bands x 300 seeds, answers recomputed, options unique, hints present', () => {
  assert.strictEqual(C.skills.length, 3);
  C.skills.forEach(sk => [1, 2, 3, 4, 0].forEach(b => { for (let seed = 1; seed <= 300; seed++) {
    const q = sk.gen(b, rng(seed * 7919 + b)); assert.ok(q.prompt && q.hint && q.worked, sk.id + ' has prompt, hint, worked');
    if (q.type === 'choice') { assert.strictEqual(new Set(q.options).size, q.options.length); assert.ok(q.answer >= 0 && q.answer < q.options.length); }
    if (sk.id === 'core') assert.strictEqual(q.answer, coreOf(q.p.z));
    if (sk.id === 'zeff' && q.type === 'num') assert.strictEqual(q.answer, q.p.z - coreOf(q.p.z));
    if (sk.id === 'zeff' && q.type === 'choice') assert.strictEqual(q.options[q.answer].toLowerCase(), Z.NAME[q.p.z]);
    if (sk.id === 'pull') {
      const want = Z.cmp(Z.atom(q.p.a), Z.atom(q.p.b)) > 0 ? Z.NAME[q.p.a] : Z.NAME[q.p.b];
      assert.strictEqual(q.options[q.answer].toLowerCase(), want); assert.ok(!C.isDip(q.p.a, q.p.b));
    }
  } }));
});

test('top band reaches period 3 in full: core, Z_eff and pull items all land on period 3 atoms', () => {
  const seen = { core: new Set(), zeff: new Set(), pull: new Set() };
  C.skills.forEach(sk => { for (let seed = 1; seed <= 600; seed++) { const q = sk.gen(3, rng(seed * 7919 + 13)); const zs = q.p.z ? [q.p.z] : [q.p.a, q.p.b]; zs.forEach(z => seen[sk.id].add(z)); } });
  [11, 12, 13, 14, 15, 16, 17, 18].forEach(z => { assert.ok(seen.zeff.has(z), 'zeff reaches ' + z); assert.ok(seen.pull.has(z), 'pull reaches ' + z); assert.ok(seen.core.has(z), 'core reaches ' + z); });
});

test('pairSpec: deterministic, matches the model, and carries the reason line', () => {
  for (let n = 0; n < 60; n++) [1, 2, 3].forEach(b => {
    const s = C.pairSpec(n, b, 42), t = C.pairSpec(n, b, 42); assert.deepStrictEqual(s, t);
    const A = Z.atom(s.a), B = Z.atom(s.b);
    assert.strictEqual(s.zeffA, A.zeff); assert.strictEqual(s.coreB, B.core);
    assert.strictEqual(s.answer, Z.cmp(A, B) > 0 ? 'a' : 'b'); assert.ok(s.reason.length > 10);
  });
  assert.notDeepStrictEqual(C.pairSpec(1, 3, 1), C.pairSpec(2, 3, 1));
});

test('models, crux, exit and warm-up: every stored answer is recomputed', () => {
  C.models.forEach(M => { const a = Z.atom(M.Z); assert.strictEqual(M.steps.length, C.MOVES.length); assert.ok(M.steps[2].text.includes('= ' + a.zeff)); assert.strictEqual(M.predictAnswer, a.zeff); });
  assert.strictEqual(C.crux[0].answer, Z.atom(12).zeff); assert.strictEqual(C.crux[1].answer, Z.atom(19).core);
  assert.strictEqual(C.crux[2].options[C.crux[2].answer], 'Sodium'); assert.strictEqual(C.crux.length, 3);
  assert.strictEqual(C.exit[0].answer, Z.atom(16).zeff);
  assert.strictEqual(C.exit[1].options[C.exit[1].answer], 'Chlorine'); assert.strictEqual(Z.cmp(Z.atom(17), Z.atom(12)), 1);
  assert.strictEqual(C.exit[2].options[C.exit[2].answer], 'Sodium'); assert.strictEqual(Z.cmp(Z.atom(11), Z.atom(19)), 1);
  assert.strictEqual(C.warmup.length, 3, 'warm-up is at most 3 items');
  assert.strictEqual(C.warmup[0].answer, Z.atom(11).valence); assert.strictEqual(C.warmup[1].answer, Z.atom(11).core);
  assert.strictEqual(C.warmup[2].options[C.warmup[2].answer], 'one quarter as strong');
  assert.strictEqual(C.predicts[0].options[C.predicts[0].answer], 'Lithium');
  // a live-use check: the three Explore pairs a teacher is likely to start with are not dip pairs
  assert.ok(!C.isDip(3, 11) && !C.isDip(11, 19) && !C.isDip(11, 14));
});

test('v3 clock: no steps, huddles at minutes 3 and 25', () => {
  const pace = require('../../shared/pace.js');
  assert.deepStrictEqual(pace.validate(C.pacing), []); assert.strictEqual(pace.isV3(C.pacing), true);
  assert.deepStrictEqual(pace.huddlesOf(C.pacing).map(h => [h.key, h.atMin]), [['h1', 3], ['h2', 25]]);
});

test('teachability: every content word a student sees is tagged to Mr. D, a tutorial or an earlier lesson, and nothing from slot 17 or later appears', () => {
  const tagged = new Set(); C.TERMS.forEach(t => t.words.forEach(w => tagged.add(w)));
  // words that need a tag; plain words (atom, electron, which, ...) are not in this list
  const TECH = ['core', 'ring', 'rings', 'shell', 'subshell', 'valence', 'outer', 'pull', 'pulled', 'pulls', 'distance', 'harder', 'shield', 'shielding', 'shields', 'effective', 'z_eff', 'meter', 'nucleus', 'nuclear', 'coulomb', 'proton', 'protons'];
  const LATER = ['ionization', 'radius', 'electronegativity', 'affinity', 'photoelectron', 'orbital'];
  const strs = [];
  const push = q => { ['prompt', 'hint', 'worked', 'why', 'head'].forEach(k => q[k] && strs.push(String(q[k]))); (q.options || []).forEach(o => strs.push(String(o))); };
  C.skills.forEach(sk => [1, 2, 3].forEach(b => { for (let s = 1; s <= 60; s++) push(sk.gen(b, rng(s))); }));
  C.warmup.forEach(push); C.predicts.forEach(push); C.crux.forEach(push); C.exit.forEach(push);
  C.models.forEach(M => { strs.push(M.problem); M.steps.forEach(s => strs.push(s.text)); strs.push(M.slip); });
  C.MOVES.forEach(m => strs.push(m));
  const missing = new Set(), later = new Set();
  strs.forEach(s => { (s.toLowerCase().match(/[a-z_]+/g) || []).forEach(w => { if (TECH.includes(w) && !tagged.has(w)) missing.add(w); if (LATER.includes(w)) later.add(w); }); });
  // nucleus/nuclear/proton(s)/shield-family words: allowed only if tagged; the huddle (Mr. D) introduces shielding, so it is allowed in the Mr. D list
  assert.deepStrictEqual([...later], [], 'words that belong to a later slot: ' + [...later]);
  const allowedUntagged = new Set(['nucleus', 'nuclear', 'proton', 'protons']);   // slot 2 to 4 vocabulary
  [...missing].filter(w => !allowedUntagged.has(w)).forEach(w => assert.fail('untagged content word on a student screen: ' + w));
});

test('no banned tier words in anything a student sees', () => {
  const blob = JSON.stringify([C.warmup, C.predicts, C.crux, C.exit, C.models, C.MOVES]).toLowerCase();
  ['extension', 'challenge', 'optional', 'stars', '★', '☆'].forEach(w => assert.ok(!blob.includes(w), w));
});
