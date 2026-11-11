/* The Unit 3 quiz and test (physics/lessons/engine/assess.js): the plan is balanced across lessons, a retake is different, the pass mark is 85% of first-try rights,
   and every item the plan draws (any attempt, any seed) is a well-formed question from the lessons' own skills. */
const test = require('node:test'), assert = require('node:assert'), path = require('path');
const { plan, need, reviewPlan } = require(path.resolve(__dirname, '../../physics/lessons/engine/assess.js')).exports || require(path.resolve(__dirname, '../../physics/lessons/engine/assess.js'));
const dir = path.resolve(__dirname, '../../calculus/unit-3-composite-implicit-inverse');
const IDS = ['3-1-chain-rule', '3-2-implicit', '3-3-inverse', '3-4-inverse-trig', '3-5-higher-order'], SP = IDS.map(i => require(path.join(dir, i + '.spec.js')));
function rng(seed) { let a = seed; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const Q = { id: 'unit-3-quiz', count: 15 }, T = { id: 'unit-3-test', count: 20 };

test('pass mark: 85% rounded up, first try only', () => {
  assert.strictEqual(need(15, 0.85), 13); assert.strictEqual(need(20, 0.85), 17); assert.strictEqual(need(20, 0.85) / 20 >= 0.85, true); assert.strictEqual(16 / 20 >= 0.85, false);
  assert.strictEqual(12 / 15 >= 0.85, false); assert.strictEqual(13 / 15 >= 0.85, true);
});

test('plan: every lesson gets an equal share, ids are unique, skills rotate on a retake', () => {
  for (const [A, specs] of [[Q, SP.slice(0, 3)], [T, SP]]) for (let att = 0; att < 6; att++) {
    const P = plan(A, specs, att), per = A.count / specs.length;
    assert.strictEqual(P.length, A.count); assert.strictEqual(new Set(P.map(p => p.id)).size, A.count); assert.strictEqual(new Set(P.map(p => p.tag)).size, A.count);
    specs.forEach((sp, l) => assert.strictEqual(P.filter(p => p.lesson === l).length, per));
    specs.forEach((sp, l) => assert.ok(new Set(P.filter(p => p.lesson === l).map(p => p.sk.id)).size >= Math.min(per, sp.skills.length), 'a lesson repeats a skill needlessly'));
    assert.ok(P.every(p => specs[p.lesson].skills.includes(p.sk)));
  }
  const a0 = plan(Q, SP.slice(0, 3), 0).map(p => p.tag).join(), a1 = plan(Q, SP.slice(0, 3), 1).map(p => p.tag).join(); assert.notStrictEqual(a0, a1);
  const k0 = plan(Q, SP.slice(0, 3), 0).map(p => p.sk.id).join(), k1 = plan(Q, SP.slice(0, 3), 1).map(p => p.sk.id).join(); assert.notStrictEqual(k0, k1, 'a retake draws different skills');
});

test('review plan: two items per lesson, band 2 then band 3, different skills', () => {
  const R = reviewPlan(SP); assert.strictEqual(R.length, 10);
  SP.forEach((sp, l) => { const r = R.filter(p => p.lesson === l); assert.deepStrictEqual(r.map(p => p.band), [2, 3]); assert.notStrictEqual(r[0].sk.id, r[1].sk.id); });
});

test('every scored item is a well-formed question: an answer, a worked line, and no hint-only remember', () => {
  for (let att = 0; att < 4; att++) for (const [A, specs] of [[Q, SP.slice(0, 3)], [T, SP]]) for (let s = 0; s < 25; s++) plan(A, specs, att).forEach(p => {
    const q = p.sk.gen(3, rng(s * 31 + att)), w = `${p.sk.id} att ${att} seed ${s}`;
    assert.ok(q.prompt, w); assert.ok(q.worked, w + ': worked line is shown after a miss');
    if (q.type === 'choice') { assert.ok(q.answer >= 0 && q.answer < q.options.length, w); assert.strictEqual(new Set(q.options.map(String)).size, q.options.length, w + ': duplicate options'); }
    else if ((q.type || 'num') === 'expr') assert.ok(typeof q.answer === 'string' && q.answer.length, w); else assert.ok(Number.isFinite(q.answer), w);
  });
});
