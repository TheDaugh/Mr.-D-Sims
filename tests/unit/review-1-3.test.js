/* Review 3.1 to 3.3: every answer is recomputed here from the picture and the prompt, not from the generator's own variables. */
const test = require('node:test'), assert = require('node:assert'), SP = require('../../stats/unit-3-normal-distribution/unit-3-review-1-3.spec.js'), H = SP.helpers, pace = require('../../shared/pace.js');
function rng(seed) { let a = seed; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const each = (fn) => { for (const sk of SP.skills) for (let b = 1; b <= 4; b++) for (let s = 0; s < 150; s++) fn(sk, b, SP.skills.length && sk.gen(b, rng(s * 11 + b)), 'seed ' + s + ' ' + sk.id + ' band ' + b); };
const M = '−', unminus = s => parseFloat(String(s).replace(M, '-'));
const tx = h => h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

test('nine targets, T1 to T9, one skill each, pacing valid, no huddle', () => {
  assert.deepStrictEqual(SP.skills.map(s => s.id), ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9']); assert.strictEqual(SP.targets.length, 9);
  SP.targets.forEach(t => assert.match(t, /^I can /)); assert.deepStrictEqual(pace.validate(SP.pacing), []); assert.strictEqual((SP.pacing.huddles || []).length, 0);
  assert.strictEqual(SP.warm.length, 6); assert.strictEqual(SP.warm.filter(t => SP.blocks.A.includes(t)).length, 3); assert.strictEqual(SP.warm.filter(t => SP.blocks.B.includes(t)).length, 3);
});
test('every item: a picture first, a prompt that says pretend, hint, nudge, worked; no z-table or empirical-rule talk', () => {
  each((sk, b, q, w) => {
    assert.match(q.pic, /^<svg/, w); assert.match(q.prompt, /[Pp]retend/, w); assert.ok(q.hint && q.nudge && q.worked, w); assert.strictEqual(q.tag, sk.id, w);
    const all = [q.prompt, q.hint, q.nudge, q.worked, q.remember, tx(q.pic)].concat((q.options || []).filter(o => typeof o === 'string')).join(' ');
    assert.ok(!/z-table|\btable\b|empirical|68-95|99\.7/i.test(all), w + ' mentions ' + all.match(/z-table|\btable\b|empirical|68-95|99\.7/i));
  });
});
test('T1: percentile = dots below the red dot / n * 100, counted from the picture', () => {
  each((sk, b, q, w) => { if (sk.id !== 'T1' || q.type === 'choice') return;
    const c = [...q.pic.matchAll(/<circle cx="([\d.]+)"[^>]*fill="([^"]+)"/g)].map(m => ({ x: +m[1], red: m[2] === '#b3412e' })), red = c.find(x => x.red), n = +q.prompt.match(/for (\d+) students/)[1];
    assert.strictEqual(c.length, n, w); assert.strictEqual(q.answer, 100 * c.filter(x => x.x < red.x).length / n, w); assert.strictEqual(q.unit, '%'); });
});
test('T1 (band 4 meaning): the right option states the percentile that the prompt gives', () => {
  each((sk, b, q, w) => { if (sk.id !== 'T1' || q.type !== 'choice') return; const p = +q.prompt.match(/the (\d+)th percentile/)[1]; assert.match(q.options[q.answer], new RegExp('^' + p + '% of the scores were below'), w); assert.strictEqual(q.options.filter(o => /were below/.test(o)).length, 1, w); });
});
test('T2: z = (x - mean) / SD from the prompt; choice items name the right size and direction', () => {
  each((sk, b, q, w) => { if (sk.id !== 'T2') return;
    if (q.type !== 'choice') { const m = q.prompt.match(/mean (\d+), SD (\d+)\. \w+ scored ([\d.]+)\./); assert.ok(m, w + q.prompt); assert.ok(Math.abs((+m[3] - +m[1]) / +m[2] - q.answer) < 1e-9, w); }
    else { const z = unminus(q.prompt.match(/z = ([−\-]?[\d.]+)/)[1]), o = q.options[q.answer]; assert.match(o, new RegExp('^It is ' + Math.abs(z) + ' standard deviations ' + (z < 0 ? 'below' : 'above'))); } });
});
test('T3: the more unusual score has the larger |z|', () => {
  each((sk, b, q, w) => { if (sk.id !== 'T3') return;
    const m = [...q.prompt.matchAll(/scored ([\d.]+) on the ([\w ]+?) \(mean (\d+), SD (\d+)\)|and ([\d.]+) on the ([\w ]+?) \(mean (\d+), SD (\d+)\)/g)];
    const nums = q.prompt.match(/scored ([\d.]+) on the .*?\(mean (\d+), SD (\d+)\) and ([\d.]+) on the .*?\(mean (\d+), SD (\d+)\)/); assert.ok(nums, w + q.prompt);
    const za = (+nums[1] - +nums[2]) / +nums[3], zb = (+nums[4] - +nums[5]) / +nums[6]; assert.ok(Math.abs(Math.abs(za) - Math.abs(zb)) >= 0.4 - 1e-9, w); assert.strictEqual(q.answer, Math.abs(za) > Math.abs(zb) ? 0 : 1, w); });
});
test('T4 and T5: new mean, new SD and the rule for shape, center, spread', () => {
  each((sk, b, q, w) => {
    if (sk.id === 'T4') { const m = q.prompt.match(/mean (\d+) and SD (\d+)\. A teacher (adds|subtracts) (\d+)/);
      if (m && /new mean/.test(q.prompt)) assert.strictEqual(q.answer, +m[1] + (m[3] === 'adds' ? 1 : -1) * +m[4], w);
      if (m && /new SD/.test(q.prompt)) assert.strictEqual(q.answer, +m[2], w);
      if (q.type === 'choice' && b === 3) assert.match(q.options[q.answer], /^Only the center changes/, w);
      if (q.type === 'choice' && b === 4) { const med = +q.prompt.match(/median (\d+)/)[1], c = +q.prompt.match(/(?:up|down) by (\d+)/)[1] * (/goes up/.test(q.prompt) ? 1 : -1); assert.match(q.options[q.answer], new RegExp('still skewed right, and the median is ' + (med + c) + '\\.')); } }
    if (sk.id === 'T5') { const m = q.prompt.match(/mean (\d+) and SD (\d+)\. Every value is multiplied by (\d+)/); assert.ok(m, w);
      if (/new mean/.test(q.prompt)) assert.strictEqual(q.answer, +m[1] * +m[3], w); if (/new SD/.test(q.prompt)) assert.strictEqual(q.answer, +m[2] * +m[3], w);
      if (q.type === 'choice') assert.match(q.options[q.answer], /^Center and spread both get multiplied/, w); }
  });
});
test('T6: mean of z-scores is 0, SD is 1, checked on the actual numbers', () => {
  each((sk, b, q, w) => { if (sk.id !== 'T6') return; const m = q.prompt.match(/mean (\d+) and SD (\d+)/), data = [1, 3, 6, 9, 11, 9, 6, 3, 1].flatMap((c, i) => Array(c).fill(+m[1] + (i - 4) * 0.7 * +m[2])), mu = data.reduce((a, x) => a + x) / data.length, sd = Math.sqrt(data.reduce((a, x) => a + (x - mu) ** 2, 0) / data.length), z = data.map(x => (x - mu) / sd);
    const zm = z.reduce((a, x) => a + x) / z.length, zs = Math.sqrt(z.reduce((a, x) => a + (x - zm) ** 2, 0) / z.length); assert.ok(Math.abs(zm) < 1e-9 && Math.abs(zs - 1) < 1e-9);
    if (q.type !== 'choice') assert.strictEqual(q.answer, /mean of the z/.test(q.prompt) ? 0 : 1, w); });
});
test('T7: the proportion equals the numerical area under the density curve', () => {
  each((sk, b, q, w) => { if (sk.id !== 'T7') return;
    if (q.type === 'choice') { assert.strictEqual(q.answer, 0); const g = H.DENS.rect(4), tri = x => x >= 0 && x <= 4 ? x / 8 : 0; const ar = [g, tri].map(f => H.area(f, 0, 4)); assert.ok(ar.some(a => Math.abs(a - 1) < 1e-3)); return; }
    const m = q.prompt.match(/from (\d+(?:\.\d+)?) to (\d+(?:\.\d+)?)\?$/), a = +m[1], c = +m[2], flat = q.prompt.match(/flat density curve from 0 to (\d+)/);
    const f = flat ? H.DENS.rect(+flat[1]) : H.DENS.tri; assert.ok(Math.abs(H.area(f, a, c) - q.answer) < 1e-4, w + ' ' + q.prompt + ' -> ' + q.answer);
    assert.ok(Math.abs(H.area(f, 0, flat ? +flat[1] : 2) - 1) < 1e-3, 'total area 1'); });
});
test('T7 validity options: only the first is a density curve (non-negative, area 1)', () => {
  const fs = { good: H.DENS.rect(4), tall: x => x >= 0 && x <= 4 ? 0.5 : 0, short: x => x >= 0 && x <= 4 ? 0.125 : 0, neg: x => x >= 0 && x <= 4 ? 0.5 * Math.sin(Math.PI * x / 2) * 0.785 : 0 };
  const ok = f => { let min = 0; for (let x = 0; x <= 4; x += 0.01) min = Math.min(min, f(x)); return min >= 0 && Math.abs(H.area(f, 0, 4) - 1) < 1e-3; };
  assert.deepStrictEqual(Object.keys(fs).filter(k => ok(fs[k])), ['good']);
});
test('T8: mean versus median from the numerical mean and median of the drawn shape', () => {
  each((sk, b, q, w) => { if (sk.id !== 'T8') return; const kind = /right/.test(q.pic) ? 'right' : /left/.test(q.pic) ? 'left' : 'sym', mm = H.meanMedian(H.T8SHAPES[kind]), d = mm.mean - mm.median;
    assert.strictEqual(q.answer, Math.abs(d) < 0.01 ? 1 : d < 0 ? 0 : 2, w); if (kind === 'right') assert.ok(d > 0.3); if (kind === 'left') assert.ok(d < -0.3); if (kind === 'sym') assert.ok(Math.abs(d) < 0.01); });
});
test('T9: the right option matches what the bars show (peaks, skew, a lonely bar)', () => {
  for (const [k, list] of Object.entries(H.T9SHAPES)) list.forEach(h => assert.strictEqual(H.classify(h), k, k));
  const NAME = { 'Reasonable': 'normal', 'Shaky: skewed right': 'right', 'Shaky: skewed left': 'left', 'Shaky: two': 'bimodal', 'Shaky: an outlier': 'outlier' };
  each((sk, b, q, w) => { if (sk.id !== 'T9') return;
    const hs = [...q.pic.matchAll(/<rect [^>]*height="([\d.]+)"/g)].map(m => +m[1]), full = Math.max(...hs), tmpl = Object.values(H.T9SHAPES).flat().filter(t => t.filter(x => x > 0).length === hs.length);
    const got = tmpl.map(t => { const mx = Math.max(...t), nz = t.filter(x => x > 0); return nz.every((x, i) => Math.abs(x / mx * full - hs[i]) < 0.01) ? H.classify(t) : null; }).find(Boolean); assert.ok(got, w);
    const o = q.options[q.answer], key = Object.keys(NAME).find(n => o.startsWith(n)) || (b >= 4 ? ({ 'Skewed right.': 'Shaky: skewed right', 'Skewed left.': 'Shaky: skewed left', 'Two peaks.': 'Shaky: two', 'An outlier far from the rest.': 'Shaky: an outlier' })[o] : null);
    assert.strictEqual(NAME[key], got, w + ' ' + o); });
});
test('fade: Remember at band 1 only; nudge then hint at band 3; hint only after the second miss at band 4', () => {
  const num = SP.skills[0].gen(1, rng(3)), ch = SP.skills[1].gen(4, rng(9)); assert.ok(!ch.type || ch.type); const mk = (b) => SP.fade(Object.assign({}, SP.skills.find(s => s.id === 'T4').gen(1, rng(2)), { id: 'x' + b }), b);
  global.window = { LE: { qs: id => ({ misses: global.__m }) } }; try {
    const q1 = mk(1), q2 = mk(2); assert.ok(q1.remember); assert.strictEqual(q2.remember, ''); assert.strictEqual(q2.hint, q2.fullHint);
    const q3 = mk(3), q4 = mk(4); assert.strictEqual(q3.hint, ''); global.__m = 1; assert.strictEqual(q3.near(), q3.nudge); global.__m = 2; assert.strictEqual(q3.near(), q3.fullHint);
    global.__m = 1; assert.strictEqual(q4.near(), ''); global.__m = 2; assert.strictEqual(q4.near(), q4.fullHint);
    const c3 = SP.fade({ type: 'choice', hint: 'full', nudge: 'push', id: 'c' }, 3), c4 = SP.fade({ type: 'choice', hint: 'full', nudge: 'push', id: 'c' }, 4); assert.strictEqual(c3.hint, 'push'); assert.strictEqual(c4.noHint, true);
  } finally { delete global.window; }
});
