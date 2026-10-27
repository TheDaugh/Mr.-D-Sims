// Repo copy of the sheet's slot-08-content.test.js. Only the two file paths changed (the data now lives in content/). Run: node test/slot-08-content.test.cjs
// Run: node slot-08-content.test.js
// Derives every checkable answer from flame-data.json, then checks lab-content.json for correctness AND teachability.
const fs = require('fs');
const path = require('path');
const D = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'content', 'flame-data.json'), 'utf8'));
const L = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'content', 'flame-lab-content.json'), 'utf8'));

let pass = 0, fail = 0;
const t = (name, fn) => {
  try { fn(); pass++; console.log('ok   ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ' :: ' + e.message); }
};
const eq = (a, b, m) => { if (a !== b) throw new Error((m || '') + ' expected ' + JSON.stringify(b) + ' got ' + JSON.stringify(a)); };
const ok = (c, m) => { if (!c) throw new Error(m); };

const byId = Object.fromEntries(D.samples.map(s => [s.id, s]));
const knowns = D.samples.filter(s => s.role === 'known');
const groups = {};
knowns.forEach(s => (groups[s.flame.colorGroup] = groups[s.flame.colorGroup] || []).push(s.metal));

// ---------- data ----------
t('every sample has a source and a flame color group', () => {
  D.samples.forEach(s => { ok(s.source && s.source.length > 5, s.id + ' source'); ok(s.flame.colorGroup, s.id + ' group'); });
});
t('six knowns plus the NaNO3 control', () => { eq(knowns.length, 6); eq(D.samples.filter(s => s.role === 'control').length, 1); });
t('Li and Sr look alike; no other pair shares a color', () => {
  const shared = Object.entries(groups).filter(([, m]) => m.length > 1);
  eq(shared.length, 1); eq(shared[0][0], 'crimson'); eq(shared[0][1].sort().join(','), 'Li,Sr');
});
t('NaCl and NaNO3 burn the same; anions differ', () => {
  eq(byId.NaCl.flame.colorGroup, byId.NaNO3.flame.colorGroup);
  ok(byId.NaCl.anion !== byId.NaNO3.anion, 'anions must differ');
  eq(byId.NaCl.flame.swatch, byId.NaNO3.flame.swatch);
});
t('Li and Sr share one swatch exactly (ambiguity is preserved)', () => eq(byId.LiCl.flame.swatch, byId.SrCl2.flame.swatch));
t('K is masked by Na; no other sample is', () => {
  eq(byId.KCl.masking.agent, 'Na');
  D.samples.filter(s => s.id !== 'KCl').forEach(s => ok(!s.masking, s.id + ' should not mask'));
});
t('author-set fields are declared', () => D.samples.forEach(s => ok(Array.isArray(s.flame.author_set), s.id + ' author_set')));
t('unknown pools (A, B, extra) use known sample ids', () => {
  D.unknowns.A.pool.concat(D.unknowns.B.pool, D.unknowns.extra.pool).forEach(id => { ok(byId[id], id); eq(byId[id].role, 'known'); });
});
t('the extra pool covers every known, so early finishers never run dry', () => eq(D.unknowns.extra.pool.length, knowns.length));

const near = (a, b, tol = 0.5) => Math.abs(a - b) <= tol;
const hasLine = (metal, nm) => D.spectra[metal].lines.some(l => near(l.nm, nm));
const metals = Object.keys(D.spectra);
t('every spectrum has lines, wavelengths positive, and a source', () => {
  metals.forEach(m => { ok(D.spectra[m].source, m + ' source'); ok(D.spectra[m].lines.length > 0, m + ' lines');
    D.spectra[m].lines.forEach(l => ok(l.nm > 300 && l.nm < 900 && l.rel > 0, m + ' line')); });
});
t('spectroscope separates Li from Sr: Sr has a blue line, Li has none in 400-500 nm', () => {
  ok(D.spectra.Sr.lines.some(l => l.nm > 450 && l.nm < 470), 'Sr blue');
  ok(!D.spectra.Li.lines.some(l => l.nm >= 400 && l.nm <= 500), 'Li no blue');
});
t('spectroscope separates Na from K', () => {
  ok(!D.spectra.K.lines.some(l => near(l.nm, 589, 3)), 'K has no 589 line');
  ok(D.spectra.Na.lines.every(l => near(l.nm, 589.3, 1)), 'Na lines near 589');
});
t('photon energy E = 1239.84 / wavelength', () => {
  const E = nm => D.meta.photonEnergyConstant_eV_nm / nm;
  ok(near(E(589), 2.105, 0.001), 'Na 589 nm = 2.105 eV'); ok(near(E(670.8), 1.848, 0.001), 'Li 670.8 nm = 1.848 eV');
  ok(E(460.7) > E(670.8), 'blue carries more energy than red');
});

// ---------- lab content: structure ----------
t('lab day clock: huddle 1 at 3, huddle 2 after the data (later than 25)', () => {
  eq(L.clock.huddle1AtMin, 3); ok(L.clock.huddle2AtMin > 25 && L.clock.huddle2AtMin < 39, 'huddle 2 between 25 and 39');
});
t('floor statement present and nothing above the standard', () => {
  ok(/regular-level standard/.test(L.floor), 'floor names the regular standard'); ok(!/\bAP\b|\bextension\b|\bchallenge\b|\boptional\b/.test(JSON.stringify(L.prelab) + JSON.stringify(L.quests) + JSON.stringify(L.postlab)), 'no tier words on student screens');
});
t('pre-lab is at most 3 questions, each with a picture and a valid answer', () => {
  ok(L.prelab.questions.length <= 3, 'max 3');
  L.prelab.questions.forEach(q => { ok(q.picture && q.picture.length > 5, q.id + ' picture'); ok(q.correct >= 0 && q.correct < q.options.length, q.id + ' correct'); ok(q.explain, q.id + ' explain'); });
});
t('pre-lab answers are right', () => {
  const q = Object.fromEntries(L.prelab.questions.map(x => [x.id, x]));
  eq(q.w1.options[q.w1.correct], 'attract'); eq(q.w2.options[q.w2.correct], 'the shell 1 electron'); eq(q.w3.options[q.w3.correct], 'weaker');
});
t('prediction is one try and does not reveal the answer', () => {
  ok(L.prelab.prediction.oneTry === true, 'one try');
  ok(!/same|differ/i.test(L.prelab.prediction.afterTry), 'afterTry reveals nothing');
});
t('the prediction answer in the data is "same color"', () => eq(byId.NaCl.flame.colorGroup, byId.NaNO3.flame.colorGroup));
t('flame test options cover exactly the color groups in the data', () => {
  const opts = L.tests.find(x => x.key === 'flame').options.map(o => o[0]).sort().join('|');
  eq(opts, Object.keys(groups).sort().join('|'));
});
t('quests exist for gear, door, flame bench, record, identify and cer', () => {
  const ids = L.quests.map(q => q.id);
  ['gear', 'door', 'flamebench', 'record', 'identify', 'cer'].forEach(i => ok(ids.includes(i), 'quest ' + i));
  L.quests.forEach(q => ok(q.hint && q.hint.length > 10, q.id + ' hint'));
});
t('inventory limit: the seven salt bottles stay on the flame bench (carry limit is 6)', () => {
  const fb = L.quests.find(q => q.id === 'flamebench');
  ok(/do not carry/i.test(fb.hint), 'flame bench quest says you do not carry the bottles');
  const take = L.quests.find(q => q.id === 'unknowns'); ok(/A and B/.test(take.text), 'carry only A and B');
});
t('huddle 2 code gate is flagged as pending Mr. D', () => ok(/PENDING/.test(L.gates.huddle2Code), 'flagged'));

// ---------- teachability ----------
const taggedAfterLab = L.terms.filter(x => /huddle2/.test(x.introducedBy)).map(x => x.term);
const studentFacing = [
  JSON.stringify(L.prelab), JSON.stringify(L.quests), JSON.stringify(L.tests), JSON.stringify(L.postlab.prompt),
  JSON.stringify(L.postlab.starters), JSON.stringify(L.postlab.wordBank), JSON.stringify(L.postlab.checklist)
].join(' ').toLowerCase();
t('terms taught only in huddle 2 never appear before the lab ends', () => {
  taggedAfterLab.forEach(term => ok(!studentFacing.includes(term), 'student sees "' + term + '" before huddle 2'));
});
t('every lexicon word on a student screen is in the tagged term list', () => {
  const lexicon = ['flame test', 'known', 'unknown', 'salt', 'splint', 'spectroscope', 'spectrum', 'energy level', 'emission', 'claim', 'evidence', 'reasoning', 'crimson', 'lilac', 'brightness'];
  const tagged = L.terms.map(x => x.term);
  lexicon.forEach(w => { if (new RegExp('\\b' + w + '\\b').test(studentFacing)) ok(tagged.includes(w), '"' + w + '" appears but is not tagged'); });
});
t('every term has an introducer', () => L.terms.forEach(x => ok(x.introducedBy, x.term)));
t('postlab word bank holds only terms introduced before the lab', () => {
  L.postlab.wordBank.forEach(w => { const tt = L.terms.find(x => x.term === w); if (tt) ok(!/huddle2/.test(tt.introducedBy), w + ' is taught after the lab'); });
});

// ---------- home practice (derived from data) ----------
const matchMetals = lines => metals.filter(m => lines.every(nm => hasLine(m, nm)));
L.homePractice.forEach(it => {
  t('home item ' + it.id + ': 3 hints, none gives the answer', () => {
    eq(it.hints.length, 3);
    if (it.answer && it.answer.length > 3) it.hints.forEach(h => ok(!h.toLowerCase().includes(it.answer.toLowerCase()), 'hint reveals answer'));
  });
  if (!it.check) return;
  t('home item ' + it.id + ': answer derived from data (' + it.check.kind + ')', () => {
    const c = it.check;
    if (c.kind === 'match') { const m = groups[c.group]; eq(m.length, 1, 'color must pick one metal'); eq(it.answer, m[0]); }
    else if (c.kind === 'sameColorDifferentAnion') { eq(byId[c.a].flame.colorGroup, byId[c.b].flame.colorGroup); ok(byId[c.a].anion !== byId[c.b].anion, 'anions'); ok(it.answer === 'the metal' || it.answer.includes(c.b), 'answer'); }
    else if (c.kind === 'masking') { eq(byId[c.metal + 'Cl'].masking.agent, c.agent); ok(it.answer.startsWith(c.metal), 'answer starts with metal'); }
    else if (c.kind === 'ambiguousPair') ok(/Li( and | or )Sr/.test(it.answer), 'answer names Li and Sr');
    else if (c.kind === 'spectrumMatch') { const m = matchMetals(c.linesNm); eq(m.length, 1, 'lines must identify one metal, got ' + m.join(',')); eq(it.answer, m[0]); it.options.forEach(o => ok(metals.includes(o), 'option ' + o)); }
    else throw new Error('unknown check ' + c.kind);
  });
});
t('home items belong to bands 1-3 and answers sit in their option lists', () => L.homePractice.forEach(i => { ok(i.band >= 1 && i.band <= 3, i.id); if (i.options) ok(i.options.includes(i.answer), i.id); }));

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
