/* The stats course is wired in: bell entry (placeholder times flagged), registry, strands, template rules. */
const test = require('node:test'), assert = require('node:assert'), fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.resolve(__dirname, '../..'), read = f => fs.readFileSync(path.join(root, f), 'utf8');
const spec = require('../../templates/stats/spec.js');
function rng(seed) { let a = seed; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

test('bell: stats has 50-minute weekday and Friday periods, flagged TODO(Ian)', () => {
  const win = { }; win.window = win; vm.createContext(win); vm.runInContext(read('shared/bell.js'), win);
  const S = win.MrD.bell.SCHEDULE.stats; assert.ok(S);
  const mins = p => (h => h(p[1]) - h(p[0]))(s => +s.split(':')[0] * 60 + +s.split(':')[1]);
  S.weekday.concat(S.friday).forEach(p => assert.strictEqual(mins(p), 50));
  assert.ok(/TODO\(Ian\)/.test(read('shared/bell.js')));
  ['physics', 'chem', 'calc'].forEach(c => assert.ok(win.MrD.bell.SCHEDULE[c], c + ' untouched'));
});
test('registry: the template is registered under course stats', () => {
  const win = { MrD: {} }; win.window = win; vm.createContext(win); vm.runInContext(read('shared/lessons.js'), win);
  const l = win.MrD.lessons.find(x => x.id === 'tpl-stats'); assert.ok(l); assert.strictEqual(l.course, 'stats'); assert.ok(fs.existsSync(path.join(root, l.href)));
});
test('hub list: unregistered Unit 3 lessons show as coming soon, registered ones link', () => {
  const run = lessons => { const win = { MrD: { lessons } }; win.window = win; vm.createContext(win); vm.runInContext(read('stats/sims.js'), win); return win.UNITS[0].entries; };
  const none = run([]); assert.strictEqual(none.length, 9); none.forEach(e => { assert.ok(e.soon); assert.ok(!e.href); });
  const one = run([{ course: 'stats', id: '3-2-z-scores', href: 'stats/unit-3-normal/3-2-z-scores.html' }]);
  assert.strictEqual(one.filter(e => e.soon).length, 8); assert.strictEqual(one[1].href, 'unit-3-normal/3-2-z-scores.html');
});
test('standards: five stats strands, CCSS codes, all needsReview', () => {
  const std = JSON.parse(read('portal/standards.json')).standards;
  for (let i = 1; i <= 5; i++) { const s = std['STAT-NORMAL-' + i]; assert.ok(s, 'strand ' + i); assert.strictEqual(s.course, 'stats'); assert.strictEqual(s.needsReview, true); assert.ok(s.codes.some(c => c.code === 'HSS-ID.A.4')); assert.ok(Array.isArray(s.practice.gens)); }
  assert.ok(std['STAT-NORMAL-5'].codes.some(c => c.code === 'HSS-IC.B.4'));
});
test('template: KaTeX off, digit keypad on, every prompt says pretend, answers recomputed', () => {
  const html = read('templates/stats/lesson.html'); assert.ok(!/katex|qkit|mathcheck/i.test(html)); assert.ok(!spec.math);
  for (const sk of spec.skills) for (let b = 1; b <= 4; b++) for (let s = 0; s < 40; s++) {
    const q = sk.gen(b, rng(s * 13 + b)); assert.match(q.prompt, /[Pp]retend/, sk.id + ' band ' + b);
    const m = q.prompt.match(/mean (\d+), SD (\d+)\. A (?:score|value) is (\d+(?:\.\d+)?)/);
    if (sk.id === 'zscore') { assert.ok(m, q.prompt); assert.ok(Math.abs((+m[3] - +m[1]) / +m[2] - q.answer) < 1e-9, q.prompt); }
  }
  [spec.predicts.map(p => p.prompt), spec.huddle.example.prompt].flat().filter(t => /\d/.test(t)).forEach(t => assert.match(t, /[Pp]retend/, t));
});
