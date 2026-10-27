/* What the wiring adds around the Day Card for 3.6 (stats slot 11): the normal-curve figure, the engine's tolerance, the Models tab checkers,
   the card's constants the models rely on, and the hub id. The card's own content is tested by stats-11-content.test.js. */
const test = require('node:test'), assert = require('node:assert'), fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.resolve(__dirname, '../..'), D = root + '/stats/unit-3-normal-distribution';
const SP = require(D + '/3-6-boundary-values.spec.js'), F = require(root + '/stats/shared/normal-figure.js'), SCI = require('../fixtures/ppf-scipy.json'), C = SP.content;
const rng = seed => { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
const r1 = x => Math.round(x * 10 + 1e-9) / 10, r2 = x => Math.round(x * 100 + 1e-9) / 100;
/* the engine's own formula (physics/lessons/engine/lesson.js LE.numOK) */
const numOK = (val, ans, tol, abs) => Math.abs(val - ans) <= Math.max(Math.abs(ans) * (tol == null ? 0.02 : tol), abs || 0);

test('figure: own inverse matches scipy on the 0.001 grid; the boundary is placed by the area, not the label', () => {
  for (const k of Object.keys(SCI)) assert.ok(Math.abs(F.ppf(+k) - SCI[k]) < 1e-9, k);
  assert.ok(Math.abs(F.edges({ shade: 'left', area: 0.9 }).marks[0] - SCI['0.9']) < 1e-9);
  assert.ok(Math.abs(F.edges({ shade: 'right', area: 0.05 }).marks[0] - SCI['0.95']) < 1e-9);
  const b = F.edges({ shade: 'between', area: 0.8 }).marks; assert.ok(Math.abs(b[1] - SCI['0.9']) < 1e-9 && Math.abs(b[0] + SCI['0.9']) < 1e-9);
  const a = F.svg({ mean: 30, sd: 6, units: 'minutes', shade: 'left', area: 0.9, boundary: '?' }), b2 = F.svg({ mean: 30, sd: 6, units: 'minutes', shade: 'left', area: 0.9, boundary: 37.7 });
  assert.ok(!/37\.7/.test(a) && /37\.7/.test(b2), 'a ? picture does not print the value'); assert.ok(a.includes('?'));
});
test('figure: every item descriptor draws; unknown mean or SD shows ? and no SD ticks; areaLabel false hides the percent', () => {
  let n = 0;
  for (const sk of SP.skills) for (let b = 1; b <= 4; b++) for (let s = 1; s <= 60; s++) {
    const q = sk.gen(b, rng(s * 31 + b)); if (!q.figure) continue; n++;
    assert.ok(q.pic.startsWith('<svg') && q.pic.endsWith('</svg>'), q.prompt); assert.ok(/\bnfig\b/.test(q.pic));
    if (q.figure.mean === '?') assert.ok(q.pic.includes('mean = ?') && q.pic.includes('>?<'), q.prompt);
    if (q.figure.mean === '?' || q.figure.sd === '?') assert.strictEqual((q.pic.match(/font-size="13"/g) || []).length, 1, 'only the mean tick is labeled: ' + q.prompt);
    if (q.figure.sd === '?') assert.ok(q.pic.includes('SD = ?'), q.prompt);
  }
  assert.ok(n > 300, 'many items carry a figure: ' + n);
  assert.ok(!/%<\/text>/.test(F.svg({ mean: 30, sd: 6, shade: 'left', area: 0.2, areaLabel: false })));
  assert.ok(/20%<\/text>/.test(F.svg({ mean: 30, sd: 6, shade: 'left', area: 0.2 })));
  assert.ok(!/<path d="[^"]*" fill="#cfe0ff"/.test(F.svg({ mean: 30, sd: 6, units: 'minutes' })), 'bare curve: nothing shaded');
});
test('dress: the card tolerance becomes the engine absolute tolerance; a student who rounds z to 2 decimals is marked right', () => {
  for (const sk of SP.skills) for (let b = 1; b <= 4; b++) for (let s = 1; s <= 200; s++) {
    const q = sk.gen(b, rng(s * 104729 + b)); if (q.type !== 'num') continue;
    assert.strictEqual(q.tol, 0); assert.ok(q.abs >= 0.1);
    assert.ok(numOK(q.answer, q.answer, q.tol, q.abs));
    assert.ok(!numOK(q.answer + q.abs + 0.01, q.answer, q.tol, q.abs), 'a clearly wrong answer is not accepted: ' + q.prompt);
    if (sk.id === 'boundary') { const m = q.meta, z = r2(SCI[String(m.leftAreas[0])]); assert.ok(numOK(r1(m.mean + m.sd * z), q.answer, q.tol, q.abs), q.prompt); }
    if (sk.id === 'missing') { const m = q.meta, z = r2(m.zGiven != null ? m.zGiven : SCI[String(m.area)]); assert.ok(numOK(r1(m.kind === 'mean' ? m.X - z * m.sd : (m.X - m.mean) / z), q.answer, q.tol, q.abs), q.prompt); }
  }
  for (const x of C.exit.filter(e => e.type === 'num')) { assert.ok(numOK(x.answer + 0.1, x.answer, 0, x.tol + 1e-9)); assert.ok(!numOK(x.answer + 0.2, x.answer, 0, x.tol + 1e-9)); }
});
test('spec: card text is merged untouched; targets, question and warm-up are the card\'s', () => {
  assert.strictEqual(SP.predicts, C.predicts); assert.strictEqual(SP.misconceptions, C.misconceptions); assert.strictEqual(SP.pacing, C.pacing); assert.strictEqual(SP.models, C.models);
  assert.deepStrictEqual(SP.targets, ['I can find the value that matches a given percentile in a normal distribution.', 'I can find a missing mean or SD of a normal distribution from the value of a percentile.']);
  assert.deepStrictEqual(SP.huddle.defs.map(d => d.text), C.board.reveal.slice(0, 3).map(r => r.write));
  assert.strictEqual(SP.huddle.example.prompt, C.models[0].problem);
  assert.deepStrictEqual(SP.huddle.example.steps.map(s => s.replace(/\[\[|\]\]/g, '')), C.models[0].steps.map(s => s.text), 'the huddle example is M1 verbatim, blanks aside');
  assert.strictEqual(C.warmup.length, 6);
});
test('student-facing text the wiring adds has no tier words, no table, no Rigor', () => {
  const bad = /extension|challenge|optional|\bstars?\b|★|z-table|z table|\btable\b|rigor/i;
  const text = JSON.stringify([SP.question, SP.targets, SP.buildTarget, SP.exploreTarget, SP.concepts, SP.huddleTarget, SP.huddle.label.tags, SP.tabs]);
  assert.ok(!bad.test(text), (text.match(bad) || [])[0]);
  for (const f of ['3-6-boundary-values.models.js', '3-6-boundary-values.content.js', '3-6-boundary-values-board.html']) {
    const src = fs.readFileSync(D + '/' + f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    assert.ok(!/extension|challenge|\boptional\b|\bstars?\b|★|z-table|NK\.routine/i.test(src.replace(/optional: true/g, '')), f + ': ' + (src.match(/extension|challenge|\boptional\b|\bstars?\b|★|z-table|NK\.routine/i) || [])[0]);
  }
});
test('hub: the stats plan lists this lesson under its registered id', () => {
  const reg = { window: {} }; vm.runInNewContext(fs.readFileSync(root + '/shared/lessons.js', 'utf8'), reg);
  const L = reg.window.MrD.lessons.filter(l => l.id === SP.id); assert.strictEqual(L.length, 1); assert.strictEqual(L[0].course, 'stats');
  assert.ok(fs.readFileSync(root + '/stats/sims.js', 'utf8').includes('id: "' + SP.id + '"'));
});
test('portal: every skill the lesson reports maps to a standard', () => {
  const std = require(root + '/portal/standards.json').skills || require(root + '/portal/standards.json').map; const m = std || {};
  const all = JSON.stringify(require(root + '/portal/standards.json'));
  for (const sk of SP.skills) assert.ok(all.includes('"stats/' + SP.id + '/' + sk.id + '"'), sk.id);
});

/* ---- the Models tab: load models.js against stubs and test its pure checkers and constants ---- */
function loadModels() {
  const win = { SPECS: { [SP.id]: SP }, LE: { el: () => ({}), esc: String, S: () => ({}), qs: () => null }, LK: { qdone: () => false }, scrollTo() {} }, doc = { createElement: () => ({}), head: { appendChild() {} } };
  const ctx = vm.createContext({ window: win, document: doc, LE: win.LE, LK: win.LK });
  vm.runInContext(fs.readFileSync(D + '/3-6-boundary-values.models.js', 'utf8'), ctx); return win.BV_UI;
}
const UI = loadModels(), M = Object.fromEntries(C.models.map(m => [m.id, m]));
test('models: which moves are typed comes from the card, and every typed move has a question', () => {
  const T = m => [...UI.typed(m)]; assert.deepStrictEqual(T(M.M2), [2, 3]); assert.deepStrictEqual(T(M.M5), [3, 4]); assert.deepStrictEqual(T(M.M3), [1, 2, 3, 4, 5]);
  assert.deepStrictEqual(T(M.M1), []); assert.deepStrictEqual(T(M.M4), []);
  for (const m of C.models) for (const j of UI.typed(m)) { const b = UI.BUILD[m.id] && UI.BUILD[m.id][j]; assert.strictEqual(typeof b, 'function', m.id + ' move ' + j); const q = b(m, j - 1); assert.ok(q.prompt && q.worked && q.id === 'mod.' + m.id + '.' + (j - 1)); }
  for (const id of Object.keys(UI.BUILD)) for (const j of Object.keys(UI.BUILD[id])) assert.ok(UI.typed(M[id]).includes(+j), id + ' builds move ' + j + ' but the card does not type it');
});
test('models: constants read from the card agree with the card (M4, M5, sides, the two numbers every T13 model uses)', () => {
  for (const m of C.models.filter(x => x.tag === 'T13')) assert.ok(m.problem.includes('mean 30 minutes, SD 6'), m.id);
  assert.ok(M.M4.problem.includes('SD 6') && M.M4.problem.includes('90th percentile is 40'));
  assert.ok(M.M5.problem.includes('mean 30') && M.M5.problem.includes('90th percentile is 40'));
  assert.strictEqual(M.M4.answer, r1(40 - 6 * SCI['0.9'])); assert.strictEqual(M.M5.answer, r1(10 / SCI['0.9']));
  assert.ok(/Shade the left/.test(M.M1.steps[0].text) && /Shade the left/.test(M.M2.steps[0].text) && /Shade the right/.test(M.M3.steps[0].text));
  assert.ok(M.M4.steps[3].text.startsWith('mean =') && M.M5.steps[3].text.startsWith('SD ='));
});
test('models: the invNorm entry is checked for order, tail and format, with the card\'s own words', () => {
  const w = [0.2, 30, 6];
  assert.strictEqual(UI.diagnoseCall(M.M2, 'invNorm(0.2, 30, 6)', w).ok, true);
  assert.strictEqual(UI.diagnoseCall(M.M2, ' InvNorm( .2 ,30,6 ) = 24.95', w).ok, true, 'spacing, case, a leading dot and a trailing result are fine');
  assert.strictEqual(UI.diagnoseCall(M.M2, 'invNorm(30, 6, 0.2)', w).msg, C.misconceptions[3].fix);
  assert.strictEqual(UI.diagnoseCall(M.M2, 'invNorm(0.8, 30, 6)', w).msg, M.M2.slip);
  assert.strictEqual(UI.diagnoseCall(M.M3, 'invNorm(0.05, 30, 6)', [0.95, 30, 6]).msg, C.misconceptions[1].fix);
  assert.strictEqual(UI.diagnoseCall(M.M2, 'invNorm(0.2, 30, 7)', w).ok, false);
  assert.match(UI.diagnoseCall(M.M2, 'normalcdf(0.2, 30, 6)', w).msg, /three numbers/); assert.match(UI.diagnoseCall(M.M2, 'invNorm(0.2, 30)', w).msg, /three numbers/);
});
test('models: the missing-SD equation accepts the usual ways to write it and names a wrong z', () => {
  const z = SCI['0.9'];
  for (const t of ['40 = 30 + (1.28)(SD)', '40=30+1.28*SD', '40 = 30 + 1.28 × SD', '40 = 30 + SD*1.28', '40 = 1.28(SD) + 30', '40 = 30 + 1.2816 sd', '40 = 30 + (1.28)(sd)'])
    assert.strictEqual(UI.diagnoseEq(t, 40, 30, z).ok, true, t);
  for (const t of ['40 = 30 + (1.64)(SD)', '40 = 30 + (0.9)(SD)']) { const r = UI.diagnoseEq(t, 40, 30, z); assert.strictEqual(r.ok, false); assert.match(r.msg, /z/); }
  for (const t of ['40 = 30 * 1.28 + SD', 'SD = 7.8', '30 = 40 + 1.28 SD', '']) assert.strictEqual(UI.diagnoseEq(t, 40, 30, z).ok, false, t);
});
