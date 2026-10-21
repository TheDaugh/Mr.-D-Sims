/* Slot 4 (fbd-net-force): every generated item is checkable, answers recomputed independently from the prompt, options distinct,
   per-option explanations aligned, hints and misconceptions present, and the gate/vectors/situations data are consistent. */
const test = require('node:test'), assert = require('node:assert');
const S = require('../../physics/lessons/content/fbd-net-force.spec.js');
function rng(seed) { let a = seed; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const nums = s => (String(s).replace(/g = 9\.8 N\/kg/g, '').replace(/9\.8/g, '').match(/\d+(\.\d+)?/g) || []).map(Number);
const skill = id => S.skills.find(x => x.id === id);

test('every skill item has prompt, hint, worked, misconception; choices have aligned options, why and a distinct label', () => {
  for (const sk of S.skills) for (let b = 1; b <= 4; b++) for (let k = 0; k < 150; k++) {
    const q = sk.gen(b, rng(k * 31 + b)), w = `${sk.id} b${b} #${k}`;
    assert.ok(q.prompt && q.hint && q.worked && q.misc, w + ' fields');
    if (q.type === 'choice') {
      assert.ok(Number.isInteger(q.answer) && q.options[q.answer], w + ' answer index');
      const labs = q.options.map(o => typeof o === 'string' ? o : o.alt); assert.strictEqual(new Set(labs).size, labs.length, w + ' duplicate options ' + labs.join(' | '));
      if (q.why) assert.strictEqual(q.why.length, q.options.length, w + ' why length');
      if (q.grid) q.options.forEach(o => assert.ok(o.svg && o.alt, w + ' svg option'));
    } else { assert.strictEqual(typeof q.answer, 'number'); assert.ok(isFinite(q.answer) && q.answer > 0, w + ' answer ' + q.answer); assert.ok(q.unit, w + ' unit'); }
  }
});

test('numeric answers match an independent recomputation from the numbers in the prompt', () => {
  for (let k = 0; k < 300; k++) {
    let q, n;
    q = skill('net').gen(1, rng(k)); n = nums(q.prompt); assert.strictEqual(q.answer, n[0] - n[1], 'net b1 ' + q.prompt);
    q = skill('net').gen(2, rng(k)); n = nums(q.prompt); assert.ok(Math.abs(q.answer - (n[0] - n[1])) < 1e-9, 'net b2 ' + q.prompt);
    q = skill('net').gen(3, rng(k)); n = nums(q.prompt); assert.ok(Math.abs(q.answer - (n[n.length - 2] - n[n.length - 1])) < 1e-9 && n.length >= 5, 'net b3 ' + q.prompt);   // mass, weight, weight, push, friction
    q = skill('net').gen(4, rng(k)); n = nums(q.prompt); assert.strictEqual(q.answer, n[0] + n[1] - n[2], 'net b4 ' + q.prompt);
    q = skill('pair').gen(3, rng(k)); n = nums(q.prompt); assert.ok(Math.abs(q.answer - (n[0] + n[1]) * 9.8) < 1e-9, 'pair b3 ' + q.prompt);
    q = skill('pair').gen(4, rng(k)); n = nums(q.prompt); assert.strictEqual(q.answer, n[n.length - 2] - n[n.length - 1], 'pair b4 ' + q.prompt);   // 2 kg, 3 kg, pull, friction
    for (const v of S.vp) { q = v.gen(rng(k)); if (q.type === 'num') { n = nums(q.prompt); if (v.id === 'V1') assert.strictEqual(q.answer, n[0] + n[1]); if (v.id === 'V2') assert.strictEqual(q.answer, n[0] - n[1]); if (v.id === 'V6') assert.strictEqual(q.answer, n[2] / 2); } }
  }
});

test('direction answers match the forces in the prompt (net direction skill and vectors check)', () => {
  for (let k = 0; k < 300; k++) {
    let q = skill('netdir').gen(3, rng(k)), n = nums(q.prompt);   // weight, up, push, friction
    const right = n[2] > n[3]; assert.strictEqual(q.options[q.answer], right ? 'Right' : 'It is zero', q.prompt);
    q = skill('netdir').gen(2, rng(k)); n = nums(q.prompt); assert.notStrictEqual(q.options[q.answer], 'It is zero');
    q = skill('netdir').gen(4, rng(k)); n = nums(q.prompt); const W = n[0] * 9.8; assert.strictEqual(q.options[q.answer], n[2] > W ? 'Up' : 'Down', q.prompt);
    q = S.vp[2].gen(rng(k)); n = nums(q.prompt); assert.ok(n[0] !== n[1]);
  }
});

test('free-body pictures: the correct option always obeys the rules the lesson teaches', () => {
  for (let b = 1; b <= 4; b++) for (let k = 0; k < 120; k++) {
    const q = skill('fbd').gen(b, rng(k)), good = q.options[q.answer].alt;
    assert.ok(/N up|T up/.test(good) && /W down/.test(good), 'weight and a support force: ' + good);
    assert.ok(/(N|T) equals W/.test(good), 'support equals weight: ' + good);
    assert.ok(!/ M /.test(good) && !/M (right|left)/.test(good), 'no force of motion: ' + good);
    if (b >= 2) assert.ok(/f (left|right)/.test(good), 'friction present: ' + good);
    if (b === 2) assert.ok(/F equals f/.test(good), 'constant speed: equal push and friction: ' + good);
    if (b >= 3) assert.ok(/(F|T) longer than f/.test(good), 'speeding up: push longer than friction: ' + good);
    q.options.forEach((o, i) => { if (i !== q.answer) assert.notStrictEqual(o.alt, good); });
  }
});

test('gate: three fixed items, each wrong option names its error type, the right option is index 0', () => {
  assert.strictEqual(S.gate.length, 3);
  S.gate.forEach(g => { assert.strictEqual(g.answer, 0); assert.strictEqual(g.options[0].type, 'ok'); assert.deepStrictEqual(g.options.slice(1).map(o => o.type).sort(), ['extra', 'missing', 'size']); assert.strictEqual(new Set(g.options.map(o => o.alt)).size, 4); assert.strictEqual(g.why.length, 4); });
});

test('vectors and proportions check: six items, two per part, one try is enough to place', () => {
  assert.deepStrictEqual(S.vp.map(v => v.part), ['arith', 'arith', 'dir', 'dir', 'prop', 'prop']);
  for (const v of S.vp) for (let k = 0; k < 100; k++) { const q = v.gen(rng(k)); assert.ok(q.prompt && q.hint && q.worked && q.misc, v.id); if (q.type === 'choice') { assert.ok(q.options[q.answer]); assert.strictEqual(new Set(q.options).size, q.options.length); assert.strictEqual(q.why.length, q.options.length, v.id + ' why'); } }
});

test('six projector situations: every force has a label, the net is stated, each lists errors with a fix', () => {
  assert.strictEqual(S.situations.length, 6);
  S.situations.forEach(s => { assert.ok(s.net && s.forces.length && s.errors.length >= 2); s.errors.forEach(e => assert.ok(e.say && e.fix && e.id)); assert.ok(S.fbd(s.forces).includes('<svg')); });
  const ids = S.situations.flatMap(s => s.errors.map(e => e.id)); assert.strictEqual(new Set(ids).size, ids.length);
});

test('prompt variety: no band of any skill has fewer than 8 distinct prompts in 200 draws', () => {
  for (const sk of S.skills) for (let b = 1; b <= 4; b++) { const seen = new Set(); for (let k = 0; k < 200; k++) seen.add(sk.gen(b, rng(k * 17 + b)).prompt); assert.ok(seen.size >= 8, `${sk.id} band ${b}: ${seen.size} distinct prompts`); }
});
