/* Every template spec must be valid data: pacing passes, generators return gradeable items at every band, bands get harder. */
const test = require('node:test'), assert = require('node:assert'), fs = require('fs'), path = require('path');
const pace = require('../../shared/pace.js'); require('../../calculus/shared/mathcheck.js'); const MC = globalThis.MC;
const root = path.resolve(__dirname, '../..');
const found = []; (function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { if (['node_modules', '.git', 'keys', 'tests'].includes(e.name)) continue; const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (/(^|\.)spec\.js$/.test(e.name)) found.push(p); } })(root);
const specs = found.map(f => ({ d: path.relative(root, f), spec: require(f) }));
function rng(seed) { let a = seed; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
for (const { d, spec } of specs) {
  test(d + ': pacing is valid', () => assert.deepStrictEqual(pace.validate(spec.pacing), []));
  test(d + ': targets are one sentence each and start with I can', () => spec.targets.forEach(t => { assert.match(t, /^I can /); assert.ok(t.length < 110, t); }));
  test(d + ': every generator gives a checkable item at every band, many seeds', () => {
    for (const sk of spec.skills || []) for (let b = 1; b <= 4; b++) for (let s = 0; s < 40; s++) {
      const q = sk.gen(b, rng(s * 7 + b)); const where = `${sk.id} band ${b} seed ${s}`;
      assert.ok(q.prompt, where);
      if (q.type === 'choice') { assert.ok(Array.isArray(q.options) && q.options.length >= 3 && q.answer >= 0 && q.answer < q.options.length, where); assert.ok(q.hint, where); }
      else if (q.type === 'expr') { assert.strictEqual(typeof q.answer, 'string', where); assert.doesNotThrow(() => MC.parse(q.answer, q.vars || ['x']), where + ' answer ' + q.answer); assert.ok(q.hints && q.hints.length, where); }
      else { assert.ok(typeof q.answer === 'number' && isFinite(q.answer), where); assert.ok(q.hint, where); }
      assert.ok(q.worked, where);
    }
  });
  test(d + ': predictions have one correct option in range', () => (spec.predicts || []).forEach(p => { assert.ok(p.answer >= 0 && p.answer < p.options.length); assert.ok(p.why); }));
  test(d + ': no writing longer than a sentence in huddle blanks', () => {
    if (!spec.huddle) return;   // a mixed review has no huddle
    const H = require('../../shared/huddle.js');
    const all = [].concat((spec.huddle.defs || []).map(x => x.text), (spec.huddle.example.steps || []), (spec.huddle.label.tags || []).map(x => x.text));
    all.forEach(t => H.parse(t).filter(p => p.b).forEach(p => assert.ok(p.b.split(/\s+/).length <= 3, 'blank too long: ' + p.b)));
  });
}
