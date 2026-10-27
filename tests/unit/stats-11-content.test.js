const test = require('node:test'), assert = require('node:assert');
const C = require('../../stats/unit-3-normal-distribution/day-cards/stats-11.content.js');
const SCI = require('../fixtures/ppf-scipy.json');            // scipy.stats.norm.ppf, the independent reference
const sp = p => { const k = String(p); if (!(k in SCI)) throw new Error('no scipy value for ' + p); return SCI[k]; };
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const r1 = x => Math.round(x * 10 + 1e-9) / 10, r2 = x => Math.round(x * 100 + 1e-9) / 100;
const SEEDS = 300, BANDS = [1, 2, 3, 4], items = [];
for (const sk of C.skills) for (const b of BANDS) for (let s = 1; s <= SEEDS; s++) items.push({ sk: sk.id, b, it: sk.gen(b, rng(s * 104729 + b)) });

test('own inverse-normal matches scipy on a 0.001 grid', () => { for (const k of Object.keys(SCI)) assert.ok(Math.abs(C.ppf(+k) - SCI[k]) < 1e-9, k); });
test('model answers match scipy', () => {
  const by = Object.fromEntries(C.models.map(m => [m.id, m]));
  assert.strictEqual(by.M1.answer, r1(30 + 6 * sp(0.9)));   // 37.7
  assert.strictEqual(by.M2.answer, r1(30 + 6 * sp(0.2)));   // 25.0
  assert.strictEqual(by.M3.answer, r1(30 + 6 * sp(0.95)));  // 39.9
  assert.strictEqual(by.M4.answer, r1(40 - 6 * sp(0.9)));   // 32.3
  assert.strictEqual(by.M5.answer, r1(10 / sp(0.9)));       // 7.8
  assert.deepStrictEqual([by.M1.answer, by.M2.answer, by.M3.answer, by.M4.answer, by.M5.answer], [37.7, 25, 39.9, 32.3, 7.8]);
  assert.deepStrictEqual(C.models.map(m => m.mode), ['watch', 'with-me', 'you-do', 'watch', 'with-me']);
  for (const m of C.models) { assert.strictEqual(m.steps.length, 5); assert.ok(m.steps.every((s, i) => s.move === i + 1)); }
  assert.ok(C.models[0].steps[2].text.includes('37.69') && C.models[1].steps[2].text.includes('24.95') && C.models[2].steps[2].text.includes('39.87'));
});
test('model sense-check ranges are true', () => {
  const v = id => C.models.find(m => m.id === id).answer;
  assert.ok(v('M1') > 36 && v('M1') < 42 && v('M3') > 36 && v('M3') < 42 && v('M2') > 24 && v('M2') < 30);
  assert.ok(Math.abs(C.cdf(1) - 0.8413447) < 1e-6 && Math.abs(C.cdf(2) - 0.9772499) < 1e-6);   // 84th and ~97.5th percentile claims
});
test('boundary answers match scipy and sit on the right side of the mean', () => {
  for (const { sk, it } of items.filter(x => x.sk === 'boundary' && x.it.type === 'num')) {
    const { mean, sd, leftAreas } = it.meta;
    const want = leftAreas.map(a => mean + sd * sp(a));
    assert.ok(Math.abs(it.answer - want[0]) <= 0.0501, it.prompt);
    if (want.length > 1) { assert.ok(Math.abs(it.answer2 - want[1]) <= 0.0501); assert.ok(it.answer < it.answer2); }
    if (leftAreas.length === 1) assert.strictEqual(it.answer > mean, leftAreas[0] > 0.5, it.prompt);
  }
});
test('boundary band 2: tail wording maps to the right left-area', () => {
  for (const { it } of items.filter(x => x.sk === 'boundary' && x.b === 2)) {
    const q = +/(\d+)% of/.exec(it.prompt)[1] / 100, hi = /slowest|highest|tallest/.test(it.prompt);
    assert.ok(Math.abs(it.meta.leftAreas[0] - (hi ? 1 - q : q)) < 1e-9, it.prompt);
  }
});
test('boundary band 4: screen-read and error-find items are true', () => {
  const b4 = items.filter(x => x.sk === 'boundary' && x.b === 4);
  assert.ok(b4.some(x => x.it.itemType === 'screen-read') && b4.some(x => x.it.itemType === 'error-find'));
  for (const { it } of b4) {
    const { mean, sd, leftAreas } = it.meta;
    if (it.itemType === 'screen-read') { assert.ok(it.options[it.answer].includes('are below')); const shown = +/= (-?[\d.]+)\./.exec(it.prompt)[1]; assert.ok(Math.abs(shown - (mean + sd * sp(leftAreas[0]))) < 0.0051); }
    else { const shown = +/gets (-?[\d.]+)\./.exec(it.prompt)[1]; assert.ok(shown < mean); assert.ok(/needs 0\.\d+ on the left|She used the area below/.test(it.options[it.answer])); }
  }
});
test('missing mean or SD: answers recomputed from meta with scipy', () => {
  for (const { b, it } of items.filter(x => x.sk === 'missing')) {
    const m = it.meta, z = m.zGiven != null ? m.zGiven : sp(m.area);
    const want = m.kind === 'mean' ? m.X - z * m.sd : (m.X - m.mean) / z;
    assert.ok(Math.abs(it.answer - want) <= 0.0501, it.prompt);
    assert.ok(it.answer > 0 && it.answer < 120);
    if (m.kind === 'sd') { assert.ok(it.answer > 1 && it.answer < 16, it.prompt); assert.ok(m.area <= 0.5 ? m.X < m.mean : m.X > m.mean); }
    if (m.kind === 'mean') assert.ok(m.area <= 0.5 ? m.X < it.answer : m.X > it.answer, it.prompt);
  }
});
test('a student who rounds z to 2 decimals is still marked right (tolerance)', () => {
  for (const { sk, it } of items.filter(x => x.it.type === 'num')) {
    if (sk === 'boundary') { const { mean, sd, leftAreas } = it.meta; const a = r1(mean + sd * r2(sp(leftAreas[0]))); assert.ok(Math.abs(a - it.answer) <= it.tol + 1e-9, it.prompt);
      if (it.answer2 != null) assert.ok(Math.abs(r1(mean + sd * r2(sp(leftAreas[1]))) - it.answer2) <= it.tol + 1e-9, it.prompt); }
    if (sk === 'missing') { const m = it.meta, z = r2(m.zGiven != null ? m.zGiven : sp(m.area)); const a = r1(m.kind === 'mean' ? m.X - z * m.sd : (m.X - m.mean) / z); assert.ok(Math.abs(a - it.answer) <= it.tol + 1e-9, it.prompt + ' ' + a + ' vs ' + it.answer); }
  }
});
test('direction items: label matches the rule (a value asked is a boundary, a percent asked is an area)', () => {
  const d = items.filter(x => x.sk === 'direction');
  const kinds = new Set(d.map(x => x.it.kind)); assert.ok(kinds.has('area') && kinds.has('boundary'));
  for (const { b, it } of d) {
    const askedPercent = /What (percent|fraction) of|how many .* are late/.test(it.prompt);
    const askedValue = /(Find the|What) [a-z0-9 ]*(that \d+%|marks|percentile|cutoff)|where the refund starts/.test(it.prompt);
    assert.strictEqual(askedPercent, it.kind === 'area', it.prompt); assert.strictEqual(askedValue, it.kind === 'boundary', it.prompt);
    const right = it.options[it.answer];
    if (it.itemType === 'sort') assert.ok(right.startsWith(it.kind === 'area' ? 'Area' : 'Boundary'));
    else assert.ok(right.startsWith(it.kind === 'area' ? 'normalcdf' : 'invNorm'));
    assert.strictEqual(new Set(it.options).size, it.options.length);
  }
});
test('every item is complete and says pretend; no z-table, no banned words', () => {
  const bad = /extension|challenge|optional|\bstars?\b|★|z-table|z table|\btable\b/i;
  for (const { it } of items) { assert.ok(it.prompt && it.hint && it.nudge && it.worked && it.itemType && it.tag, it.prompt); assert.ok(/Pretend/.test(it.prompt), it.prompt); assert.ok(!bad.test(it.prompt + it.hint + it.nudge + it.worked + (it.options || []).join(' ')), it.prompt); }
  const text = JSON.stringify([C.warmup, C.predicts, C.models.map(m => [m.problem, m.steps, m.slip]), C.board, C.exit]);
  assert.ok(!bad.test(text), (text.match(bad) || [])[0]);
});
test('predict, warm-up and exit answers are true', () => {
  assert.strictEqual(C.predicts[0].options[C.predicts[0].answer], 'Above 30'); assert.strictEqual(C.predicts[1].options[C.predicts[1].answer], 'Between 36 and 42');
  assert.ok(30 + 6 * sp(0.9) > 36 && 30 + 6 * sp(0.9) < 42); assert.strictEqual(C.predicts[2].options[C.predicts[2].answer], 'Below 30'); assert.ok(30 + 6 * sp(0.2) < 30);
  const W = Object.fromEntries(C.warmup.map(w => [w.id, w.answer])); assert.deepStrictEqual([W.W1, W.W2, W.W3, W.W4, W.W6], [0.18, 50, 1, 90, 65]); assert.ok(Math.abs(C.cdf(1) * 100 - W.W5) < 0.2);
  assert.strictEqual(C.exit[1].answer, r1(70 + 8 * sp(0.75))); assert.strictEqual(C.exit[2].answer, r1(70 + 8 * sp(0.1)));
  assert.strictEqual(C.exit.length * C.scoring.perItem, 3);
  C.explore.answers.forEach(a => assert.strictEqual(a.value, r1(30 + 6 * sp(a.area))));
});
test('pacing: priority 1 is at most 60% of the budget; build parts end with T14', () => {
  const p1 = C.pacing.steps.filter(s => s.prio === 1).reduce((a, s) => a + s.min, 0); assert.ok(p1 <= 0.6 * C.pacing.budgetMin, p1);
  assert.strictEqual(C.pacing.buildParts[C.pacing.buildParts.length - 1], 'missing-mean-or-sd');
});
test('variety: each band shows more than one item type; the full set of types appears', () => {
  for (const b of BANDS) assert.ok(new Set(items.filter(x => x.b === b).map(x => x.it.itemType)).size >= 2, 'band ' + b);
  const all = new Set(items.map(x => x.it.itemType)); ['sort', 'tool-choice', 'picture', 'word', 'two-answer', 'screen-read', 'error-find', 'backward', 'solve'].forEach(t => assert.ok(all.has(t), t));
});
