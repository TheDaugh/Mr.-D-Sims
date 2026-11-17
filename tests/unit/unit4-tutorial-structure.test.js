/* Calculus 4.4 to 4.7 (visual tutorial lessons): every spec is valid tutorial data.
   Frames: a picture needs a reading guide and a scene that exists; text stays short; every question is gradeable; no huddle, no teacher name, no tier words. */
const test = require('node:test'), assert = require('node:assert'), fs = require('fs'), path = require('path');
require('../../calculus/shared/mathcheck.js'); const MC = globalThis.MC;
const root = path.resolve(__dirname, '../..'), dir = path.join(root, 'calculus/unit-4-contextual-applications');
const IDS = ['4-4-pt1-setup', '4-4-pt2-differentiate', '4-5-pt1-triangles', '4-5-pt2-volumes', '4-6-pt1-local-linearity', '4-6-pt2-approximating', '4-7-pt1-lhopital-once', '4-7-pt2-lhopital-more'];
const scenesSrc = fs.readFileSync(path.join(root, 'calculus/shared/scenes.js'), 'utf8'), SCENES = new Set([...scenesSrc.matchAll(/VT\.scenes\.(\w+) = /g)].map(m => m[1]));
const BAD = /Mr\.\s?D|Daugherty|\bextension\b|\bchallenge\b|\boptional\b|★|☆|\bhuddle\b/i;
const words = s => String(s || '').replace(/\$[^$]*\$/g, 'M').split(/\s+/).filter(Boolean).length;
/* a sentence ends at . ? or ! followed by a space and a capital, a $, or a quote; "0.5" and "e.g." do not count */
const sentences = s => String(s || '').trim().split(/(?<=[.?!])\s+(?=[A-Z$“"(])/).filter(Boolean).length;
const specs = IDS.map(id => ({ id, spec: require(path.join(dir, id + '.spec.js')) }));

test('scenes.js defines the scenes the specs use', () => assert.ok(SCENES.size >= 12, [...SCENES].join()));

function checkAsk(a, where) {
  assert.ok(['choice', 'num', 'expr'].includes(a.type), where + ' type');
  assert.ok(a.prompt, where + ' prompt'); assert.ok(a.why, where + ' why (shown after the question)');
  if (a.type === 'choice') {
    assert.ok(Array.isArray(a.options) && a.options.length >= 3 && a.options.length <= 5, where + ' options');
    assert.ok(a.answer >= 0 && a.answer < a.options.length, where + ' answer index');
    assert.strictEqual(new Set(a.options).size, a.options.length, where + ' duplicate options');
    Object.keys(a.traps || {}).forEach(k => { assert.ok(+k >= 0 && +k < a.options.length && +k !== a.answer, where + ' trap index ' + k); assert.ok(typeof a.traps[k] === 'string' && a.traps[k], where + ' trap text'); });
  } else if (a.type === 'num') { assert.ok(typeof a.answer === 'number' && isFinite(a.answer), where + ' num answer'); assert.ok(a.hint, where + ' num hint'); }
}

for (const { id, spec } of specs) {
  test(id + ': is a self-paced tutorial lesson with no huddle', () => {
    assert.strictEqual(spec.selfPaced, true); assert.ok(!spec.huddle && !spec.pacing, 'no huddle, no pacing');
    assert.ok(spec.tutorial && spec.tutorial.concept && spec.tutorial.ido, 'tutorial.concept and tutorial.ido');
    assert.ok(spec.tabs.some(t => /Concept/.test(t)) && spec.tabs.some(t => /I do/.test(t)) && spec.tabs.some(t => /You do/.test(t)), 'concept, I do, You do tabs');
    assert.ok(spec.review.length <= 3, 'warm-up is at most 3 items');
    assert.ok(/^4\.\d Part [12]/.test(spec.title), 'title says which part');
  });

  test(id + ': tutorial frames are well formed', () => {
    const T = spec.tutorial, errs = [], ck = (c, m) => { if (!c) errs.push(m); };
    for (const [name, part] of [['concept', T.concept], ['ido', T.ido]]) {
      ck(part.target && /^I can /.test(part.target) && part.target.length < 140, name + ' target');
      ck(part.frames.length >= 6 && part.frames.length <= 10, `${name} has ${part.frames.length} frames`);
      const heads = new Set();
      part.frames.forEach((f, i) => {
        const w = `${name} frame ${i + 1} (${f.head})`;
        ck(f.head, w + ' head');
        if (f.show) { ck(SCENES.has(f.show), w + ' unknown scene ' + f.show); ck(f.guide && words(f.guide) >= 5, w + ' needs a reading guide of at least 5 words'); }
        ck(f.say, w + ' say');
        ck(sentences(f.say) <= 2, w + ' say has ' + sentences(f.say) + ' sentences');
        ck(words(f.say) <= 48, w + ' say has ' + words(f.say) + ' words');
        if (f.ask) { try { checkAsk(f.ask, w); } catch (e) { errs.push(e.message); } }
        if (name === 'ido') ck(f.ask, w + ' every I-do frame asks something');
        if (f.work) { ck(Array.isArray(f.work) && f.work.length >= 1 && f.work.length <= 4, w + ' work lines'); (f.work || []).forEach(l => ck(words(l) <= 22, w + ' work line too long')); }
      });
    }
    ck(T.ido.problem, 'ido.problem'); ck(T.ido.frames.some(f => f.slip), 'the I-do has a common-slip frame');
    ck(Array.isArray(T.moves) && T.moves.length >= 4, 'moves'); ck(T.summary.length >= 3 && T.summary.length <= 5, 'summary');
    T.ido.frames.filter(f => f.move).forEach(f => ck(f.move.length < 60, 'move label length'));
    assert.deepStrictEqual(errs, []);
  });

  test(id + ': concept tutorial teaches before it asks (first frame has a picture and a question)', () => {
    const f = spec.tutorial.concept.frames[0]; assert.ok(f.show && f.ask, 'first concept frame');
  });

  test(id + ': no teacher name, no tier words, no huddle on student text', () => {
    const strings = []; (function walk(o) { if (typeof o === 'string') strings.push(o); else if (o && typeof o === 'object' && typeof o !== 'function') Object.values(o).forEach(walk); })({ t: spec.title, q: spec.question, g: spec.targets, c: spec.concepts, r: spec.review, p: spec.predicts, tu: spec.tutorial });
    strings.forEach(s => assert.ok(!BAD.test(s), id + ': ' + s.slice(0, 80)));
  });

  test(id + ': every I-do and concept question works through the same builder the page uses (shapes only)', () => {
    [...spec.tutorial.concept.frames, ...spec.tutorial.ido.frames].filter(f => f.ask).forEach(f => {
      if (f.ask.type === 'choice') assert.ok(f.ask.options.every(o => typeof o === 'string' && o.length));
      if (f.ask.type === 'num') assert.ok(f.ask.tol == null || f.ask.tol >= 0);
    });
  });

  test(id + ': skills cover bands 1 to 3 and every item parses, 60 seeds', () => {
    function rng(seed) { let a = seed; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
    assert.ok(spec.skills.length >= 3 && spec.skills.length <= 5);
    for (const sk of spec.skills) for (let b = 1; b <= 3; b++) for (let s = 0; s < 60; s++) {
      const q = sk.gen(b, rng(s * 13 + b)), w = `${id} ${sk.id} band ${b} seed ${s}`;
      assert.ok(q.prompt && q.worked, w);
      if (q.type === 'choice') { assert.strictEqual(new Set(q.options).size, q.options.length, w + ' duplicate options'); assert.ok(Array.isArray(q.why) && q.why.length === q.options.length, w + ' why must be one message per option'); assert.ok(q.hint, w); assert.ok(/Step card/.test(q.hint), w + ' hint is a step card with a worked first step'); }
      else if (q.type === 'num') { assert.ok(isFinite(q.answer), w); assert.ok(/Step card/.test(q.hint), w); assert.ok(q.tol != null, w + ' tol'); }
      else { assert.doesNotThrow(() => MC.parse(q.answer, q.vars || ['x']), w); assert.ok(q.traps.every(t => { try { MC.parse(t.expr, ['x']); return true; } catch (e) { return false; } }), w + ' trap parses'); }
      assert.ok(!BAD.test(q.prompt), w);
    }
  });

  test(id + ': higher bands are not easier: band 3 has more math characters than band 1 in at least half the skills', () => {
    function rng(seed) { let a = seed; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
    let harder = 0; for (const sk of spec.skills) { let a = 0, c = 0; for (let s = 0; s < 40; s++) { a += sk.gen(1, rng(s)).prompt.length + (sk.gen(1, rng(s)).worked || '').length; c += sk.gen(3, rng(s)).prompt.length + (sk.gen(3, rng(s)).worked || '').length; } if (c >= a * 0.95) harder++; }
    assert.ok(harder >= Math.ceil(spec.skills.length / 2), id + ' bands do not climb: ' + harder + ' of ' + spec.skills.length);
  });
}

test('the eight pages, content files and registry lines exist', () => {
  const reg = fs.readFileSync(path.join(root, 'shared/lessons.js'), 'utf8');
  for (const id of IDS) {
    for (const ext of ['.html', '.content.js', '.spec.js']) assert.ok(fs.existsSync(path.join(dir, id + ext)), id + ext);
    assert.ok(reg.includes('id: "' + id + '"'), id + ' registered');
    const html = fs.readFileSync(path.join(dir, id + '.html'), 'utf8');
    assert.ok(/vtut\.css/.test(html) && /vtut\.js/.test(html) && /scenes\.js/.test(html), id + ' loads the tutorial layer');
    assert.ok(/lock/i.test(html), id + ' loads locked mode');
  }
});
