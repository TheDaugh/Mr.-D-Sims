const test = require('node:test'), assert = require('node:assert');
const C = require('../../chemistry/unit-3-atoms-ions/day-cards/slot-09.content.js');
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/* independent solver: Madelung rule (sort by n+l, then n), real exceptions for Cr and Cu */
function truth(Z) {
  const subs = []; for (let n = 1; n <= 4; n++) for (let l = 0; l <= Math.min(n - 1, 2); l++) subs.push({ n, l });
  subs.sort((a, b) => (a.n + a.l) - (b.n + b.l) || a.n - b.n);
  const occ = {}; let left = Z;
  for (const s of subs) { const k = Math.min(2 * (2 * s.l + 1), left); if (k) occ[s.n + 'spd'[s.l]] = k; left -= k; if (!left) break; }
  if (Z === 24) { occ['4s'] = 1; occ['3d'] = 5; }
  if (Z === 29) { occ['4s'] = 1; occ['3d'] = 10; }
  return occ;
}
function truthStr(Z) { const o = truth(Z); return Object.keys(o).sort((a, b) => a[0] - b[0] || 'spd'.indexOf(a[1]) - 'spd'.indexOf(b[1])).map(k => k + o[k]).join(' '); }
function unpaired(Z, sub) { const o = truth(Z), n = o[sub] || 0, b = { s: 1, p: 3, d: 5 }[sub[1]]; return n <= b ? n : 2 * b - n; }
function allUnpaired(Z) { return Object.keys(truth(Z)).reduce((t, s) => t + unpaired(Z, s), 0); }
const SEEDS = 300, BANDS = [1, 2, 3, 4];
const items = [];
for (const sk of C.skills) for (const b of BANDS) for (let s = 1; s <= SEEDS; s++) items.push({ sk: sk.id, b, it: sk.gen(b, rng(s * 7919 + b)) });

test('the engine model matches the independent solver for Z = 1..36 (except Cr, Cu)', () => {
  for (let Z = 1; Z <= 36; Z++) { if (Z === 24 || Z === 29) continue; assert.strictEqual(C.sameConfig(C.cfg(Z), truthStr(Z)), true, 'Z=' + Z); }
  assert.strictEqual(C.NAME.length, 37);
});
test('known anchors from the UBD', () => {
  assert.strictEqual(C.cfg(7), '1s2 2s2 2p3'); assert.strictEqual(C.cfg(15), '1s2 2s2 2p6 3s2 3p3');
  assert.strictEqual(C.cfg(16), '1s2 2s2 2p6 3s2 3p4'); assert.strictEqual(C.cfg(26), '1s2 2s2 2p6 3s2 3p6 4s2 3d6');
  assert.strictEqual(C.cfg(8), '1s2 2s2 2p4'); assert.strictEqual(C.cfg(36).endsWith('4p6'), true);
  [2, 10, 18, 36].forEach(Z => assert.ok(/(s2|p6)$/.test(C.cfg(Z))));
});
test('answer reading accepts spacing, caret, superscripts, shell order; rejects wrong', () => {
  const want = C.cfg(26);
  ['1s2 2s2 2p6 3s2 3p6 4s2 3d6', '1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d⁶', '1s^2 2s^2 2p^6 3s^2 3p^6 3d^6 4s^2', '1s22s22p63s23p64s23d6', '1S2,2S2,2P6,3S2,3P6,4S2,3D6'].forEach(a => assert.ok(C.sameConfig(a, want), a));
  ['1s2 2s2 2p6 3s2 3p6 4s2 3d5', '1s2 2s2 2p6 3s2 3p6 3d8', '1s3 2s2', ''].forEach(a => assert.ok(!C.sameConfig(a, want), a));
});
test('every generated item is checkable and correct against the independent solver', () => {
  for (const { sk, b, it } of items) {
    assert.ok(it.prompt && it.hint && it.worked && it.itemType, sk + b);
    if (it.type === 'config') {
      const parts = C.parseConfig(it.answer); assert.ok(parts);
      assert.ok(parts.every(([s, n]) => n <= { s: 2, p: 6, d: 10 }[s[1]]));
    }
    if (it.type === 'choice') { assert.ok(it.options.length >= 3 && new Set(it.options).size === it.options.length); assert.ok(it.answer >= 0 && it.answer < it.options.length); }
  }
});
test('no assessed item uses Cr or Cu or goes past Z = 36', () => {
  for (const { it } of items) { const t = it.prompt + (it.worked || ''); assert.ok(!/chromium|copper|Z = 24\b|Z = 29\b/.test(t), t); }
});
test('write skill: answer is the true configuration of the Z named or implied', () => {
  for (const { sk, b, it } of items.filter(x => x.sk === 'write')) {
    let Z;
    if (b < 4) Z = +/Z = (\d+)/.exec(it.prompt)[1]; else { const n = +/has (\d+) electron/.exec(it.prompt)[1]; Z = [0, 21, 22, 23, 0, 0, 26, 27, 28][n]; assert.ok(Z, it.prompt); }
    assert.ok(C.sameConfig(it.answer, truthStr(Z)), it.prompt);
    assert.ok(Z !== 24 && Z !== 29);
    if (b === 4) { /* clue must be unique among Z = 1..36 including the real Cr and Cu */
      const n = +/has (\d+) electron/.exec(it.prompt)[1];
      const hits = []; for (let z = 1; z <= 36; z++) if ((truth(z)['3d'] || 0) === n && !(truth(z)['4p'])) hits.push(z);
      assert.deepStrictEqual(hits, [Z], it.prompt);
    }
  }
});
test('read skill answers match the independent solver', () => {
  for (const { b, it } of items.filter(x => x.sk === 'read')) {
    if (b === 1) { assert.strictEqual(it.options[it.answer], C.NAME[Object.values(it.figure.occupancy).flat().reduce((a, x) => a + x, 0)]); }
    if (b === 2) { const N = +/number (\d+)\?/.exec(it.prompt)[1]; const o = truth(N), prev = truth(N - 1); const changed = Object.keys(o).find(k => o[k] !== prev[k]); assert.strictEqual(it.options[it.answer], changed); }
    if (b === 3) { const z = it.answer; assert.ok(C.sameConfig(/configuration (.*)\. What/.exec(it.prompt)[1], truthStr(z))); }
    if (b === 4) { const z = +/Z = (\d+)/.exec(it.prompt)[1]; assert.strictEqual(it.answer, unpaired(z, '3d')); }
  }
});
test('rules skill answers match the independent solver', () => {
  const errKinds = {};
  for (const { b, it } of items.filter(x => x.sk === 'rules')) {
    if (b === 1) { const s = /the (\w+) subshell/.exec(it.prompt)[1]; assert.strictEqual(it.answer, { s: 2, p: 6, d: 10 }[s[1]]); }
    if (b === 2) { const z = +/Z = (\d+)/.exec(it.prompt)[1]; assert.strictEqual(it.answer, allUnpaired(z)); }
    if (b === 3) {
      const z = +/Z = (\d+)/.exec(it.prompt)[1]; const shown = it.prompt.replace(/^.*\) as /, '').replace(/\. What is the mistake\?$/, '');
      const parts = C.parseConfig(shown.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, c => '⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c))) ;
      const correct = it.options[it.answer]; errKinds[correct] = 1;
      assert.notStrictEqual(correct, 'Nothing is wrong');
      assert.ok(!C.sameConfig(shown, truthStr(z)), 'shown config must differ from truth: ' + it.prompt);
    }
    if (b === 4) {
      const k = +/has (\d) unpaired/.exec(it.prompt)[1]; const hits = [];
      for (let z = 1; z <= 36; z++) { const o = truth(z); const inOther = Object.keys(o).some(s => s !== '3p' && unpaired(z, s) > 0); if (!inOther && unpaired(z, '3p') === k) hits.push(z); }
      assert.deepStrictEqual([it.answer, it.answer2].filter(x => x !== null).sort((a, b) => a - b), hits, it.prompt);
    }
  }
  assert.strictEqual(Object.keys(errKinds).length, 3, 'all three error kinds appear');
});
test('the error-find "order" error and "cap" error really are errors by rule', () => {
  for (const { b, it } of items.filter(x => x.sk === 'rules' && x.b === 3)) {
    const shown = it.prompt.replace(/^.*\) as /, '').replace(/\. What is the mistake\?$/, '');
    const raw = shown.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, c => '⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c));
    const parts = C.parseConfig(raw);
    if (it.options[it.answer].startsWith('3d took')) { const o = Object.fromEntries(parts); assert.ok(o['3d'] > 0 && o['4s'] < 2); }
    if (it.options[it.answer].includes('too many')) assert.ok(raw.includes('2p7'));
    if (it.options[it.answer].includes('skipped')) assert.ok(!raw.includes('2s'));
  }
});
test('difficulty moves: each band of "write" adds a larger Z range', () => {
  const mx = b => Math.max(...items.filter(x => x.sk === 'write' && x.b === b).map(x => +(/Z = (\d+)/.exec(x.it.prompt) || [0, 0])[1]));
  assert.ok(mx(1) <= 10 && mx(2) <= 18 && mx(3) <= 36 && mx(3) > 18);
});
test('models: steps agree with the solver and the sums close', () => {
  for (const m of C.models) {
    assert.strictEqual(m.steps.length, 6); assert.ok(C.sameConfig(m.predictAnswer, truthStr(m.Z)));
    assert.ok(m.steps[3].text.includes(C.pretty(C.cfg(m.Z)))); assert.ok(m.steps[5].text.endsWith('= ' + m.Z + '.'));
    assert.ok(m.steps.every(s => s.text.split(/[.!?]\s/).length <= 8));
  }
  assert.ok(/one in each of 3 boxes/.test(C.models[0].steps[4].text));
  assert.ok(/3 boxes with one, 1 box with a pair|2 boxes with one, 1 box with a pair/.test(C.models[1].steps[4].text), C.models[1].steps[4].text);
  assert.deepStrictEqual(C.models.map(m => m.mode), ['watch', 'with-me', 'you-do']);
});
test('recorded, exit and prediction answers', () => {
  C.recorded.configs.forEach(r => assert.ok(C.sameConfig(r.answer, truthStr(r.Z))));
  assert.strictEqual(C.predicts[0].options[C.predicts[0].answer], '4s');
  assert.strictEqual(C.exit[0].answer, '1s2 2s2 2p4'); assert.strictEqual(C.exit[1].answer, 10);
  assert.strictEqual(C.exit[2].options[C.exit[2].answer], '4s');
  assert.strictEqual(C.exit.length * C.scoring.perItem, 3);
});
test('pacing: priority 1 minutes are at most 60% of the budget', () => {
  const p1 = C.pacing.steps.filter(s => s.prio === 1).reduce((a, s) => a + s.min, 0);
  assert.ok(p1 <= 0.6 * C.pacing.budgetMin, p1);
});
test('no banned words in student-facing text', () => {
  const bad = /extension|challenge|optional|\bstars?\b|★|minutes?\b/i;
  const text = JSON.stringify([C.warmup, C.predicts, C.models.map(m => [m.problem, m.steps, m.slip]), C.board, C.exit, items.map(x => [x.it.prompt, x.it.hint, x.it.worked, x.it.options])]);
  assert.ok(!bad.test(text), (text.match(bad) || [])[0]);
});
test('variety: every band shows more than one item type across the three skills', () => {
  for (const b of BANDS) assert.ok(new Set(items.filter(x => x.b === b).map(x => x.it.itemType)).size >= 2);
  const all = new Set(items.map(x => x.it.itemType)); ['word', 'picture', 'numeric', 'error-find', 'backward'].forEach(t => assert.ok(all.has(t), t));
});
