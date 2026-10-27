/* Calculus 3.1: every generated chain-rule answer must match a numeric derivative of the function itself (central difference),
   so the answers are checked without using the chain rule. Table items are checked against their stated values. */
const test = require('node:test'), assert = require('node:assert'), path = require('path');
require('../../calculus/shared/mathcheck.js'); const MC = globalThis.MC;
const spec = require(path.resolve(__dirname, '../../calculus/unit-3-composite-implicit-inverse/3-1-chain-rule.spec.js'));
function rng(seed) { let a = seed; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const skill = id => spec.skills.find(s => s.id === id);
const val = (src, x) => MC.evaluate(MC.parse(src, ['x']), { x });

test('3.1 chain: answer equals the numeric derivative of src at several points, every band', () => {
  for (let b = 1; b <= 4; b++) for (let s = 0; s < 60; s++) {
    const q = skill('chain').gen(b, rng(s * 11 + b)), where = `band ${b} seed ${s}: ${q.src}`;
    assert.ok(q.src, where);
    for (const x of [0.6, 1.1, 1.7]) {
      const h = 1e-5, num = (val(q.src, x + h) - val(q.src, x - h)) / (2 * h), got = val(q.answer, x);
      assert.ok(Math.abs(num - got) < 1e-4 * Math.max(1, Math.abs(num)), `${where} at x=${x}: numeric ${num}, answer ${q.answer} = ${got}`);
    }
    (q.traps || []).forEach(t => assert.ok(!MC.equivalent(t.expr, q.answer, { vars: ['x'] }).ok, where + ' trap equals the answer: ' + t.expr));
  }
});

test('3.1 point: slope answer equals the numeric derivative of the curve in its prompt', () => {
  const fns = [
    [/^Let \$y=\(x\+(\d+)\)\^\{(\d+)\}\$.*\$x=(\d+)\$/, m => [x => Math.pow(x + +m[1], +m[2]), +m[3]]],
    [/^Let \$y=\((\d+)x\+(\d+)\)\^\{(\d+)\}\$/, m => [x => Math.pow(+m[1] * x + +m[2], +m[3]), 1]],
    [/^Let \$y=\\ln\(x\^\{2\}\+(\d+)\)\$.*\$x=(\d+)\$/, m => [x => Math.log(x * x + +m[1]), +m[2]]],
    [/^Let \$y=\\sqrt\{x\^\{2\}\+(\d+)\}\$.*\$x=(\d+)\$/, m => [x => Math.sqrt(x * x + +m[1]), +m[2]]]
  ];
  for (let b = 1; b <= 4; b++) for (let s = 0; s < 60; s++) {
    const q = skill('point').gen(b, rng(s * 5 + b));
    let hit = false;
    for (const [re, mk] of fns) { const m = re.exec(q.prompt); if (!m) continue; hit = true; const [f, x0] = mk(m), h = 1e-6, num = (f(x0 + h) - f(x0 - h)) / (2 * h);
      assert.ok(Math.abs(num - q.answer) < 1e-4, `band ${b} seed ${s}: ${q.prompt} numeric ${num}, answer ${q.answer}`); break; }
    assert.ok(hit, 'unrecognised prompt: ' + q.prompt);
  }
});

test('3.1 table: the stated values multiply the way the prompt says', () => {
  for (let b = 1; b <= 4; b++) for (let s = 0; s < 60; s++) {
    const q = skill('table').gen(b, rng(s * 3 + b)), nums = [...q.prompt.matchAll(/=(-?\d+)\$/g)].map(m => +m[1]);
    if (b === 1) assert.strictEqual(q.answer, nums[1] * nums[2], q.prompt);                 // g(a), g′(a), f′(g(a))
    else if (b === 2) assert.strictEqual(q.answer, nums[2] * nums[3], q.prompt);            // f′(a) distractor, g(a), g′(a), f′(g(a))
    else if (b === 3) assert.strictEqual(q.answer, nums[1] * nums[3], q.prompt);            // f(a), f′(a), g′(a) distractor, g′(f(a))
    else assert.strictEqual(q.answer, nums[2] + nums[3] * nums[1], q.prompt);               // g(a), g′(a), f(g(a)), f′(g(a))
  }
});

test('3.1 inside: the marked option is a real option', () => {
  for (let b = 1; b <= 4; b++) for (let s = 0; s < 40; s++) { const q = skill('inside').gen(b, rng(s + b)); assert.strictEqual(new Set(q.options).size, q.options.length); assert.ok(q.options[q.answer]); }
});
