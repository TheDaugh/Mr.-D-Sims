// The virtual lab's generator: spec(n, type, seed) for read, draw and match. Every answer is recomputed from pes-data.js here,
// with code that does not share the generator's helpers.
const test = require('node:test');
const assert = require('node:assert/strict');
const D = require('../../chemistry/shared/pes-data.js');
const P = require('../../chemistry/shared/pes-practice.js');

const fillOrder = ['1s', '2s', '2p', '3s', '3p', '4s'], cap = { '1s': 2, '2s': 2, '2p': 6, '3s': 2, '3p': 6, '4s': 2 };
function config(Z) { let left = Z; const o = []; for (const s of fillOrder) { if (left <= 0) break; const n = Math.min(left, cap[s]); o.push([s, n]); left -= n; } return o; }
// Group from the table's layout, not from the generator's valence rule: Z -> group
const GROUP = { 1: 1, 2: 18, 3: 1, 4: 2, 5: 13, 6: 14, 7: 15, 8: 16, 9: 17, 10: 18, 11: 1, 12: 2, 13: 13, 14: 14, 15: 15, 16: 16, 17: 17, 18: 18, 19: 1, 20: 2 };
const PERIOD = (Z) => (Z <= 2 ? 1 : Z <= 10 ? 2 : Z <= 18 ? 3 : 4);

test('the variant pools cover every element, and every type has the pool the key says', () => {
  assert.equal(P.variants('draw').length, 20); assert.equal(P.variants('match').length, 20);
  assert.deepEqual([...new Set(P.variants('read').map((v) => v.Z))].sort((a, b) => a - b), Array.from({ length: 20 }, (_, i) => i + 1));
});

test('read: each answer recomputed from the data for every variant', () => {
  for (const p of P.variants('read')) {
    const cfg = config(p.Z), sp = D.labSpectrum(p.Z);
    const want = p.kind === 'tall' ? Math.max(...cfg.map((c) => c[1])) : p.kind === 'count' ? cfg.length
      : p.kind === 'hardest' ? sp.slice().sort((a, b) => b.eV - a.eV)[0].sub : sp.slice().sort((a, b) => a.eV - b.eV)[0].sub;
    assert.equal(P.labRecompute(p), want, JSON.stringify(p));
    if (p.kind === 'tall') assert.equal(cfg.filter((c) => c[1] === want).length, 1, 'tallest must be unique, Z=' + p.Z);
  }
});

test('draw: the expected bars recomputed, with energies strictly decreasing left to right', () => {
  for (const p of P.variants('draw')) {
    const ans = P.labRecompute(p), cfg = config(p.Z);
    assert.deepEqual(ans.map((b) => [b.sub, b.count]), cfg);
    const e = ans.map((b) => D.labEV(p.Z, b.sub).eV);
    for (let i = 1; i < e.length; i++) assert.ok(e[i] < e[i - 1], 'Z=' + p.Z);
    assert.equal(ans.reduce((a, b) => a + b.count, 0), p.Z);
  }
});

test('match: element, period and group recomputed; no two elements share a spectrum shape', () => {
  const shapes = new Set();
  for (const p of P.variants('match')) {
    const a = P.labRecompute(p);
    assert.deepEqual(a, { Z: p.Z, period: PERIOD(p.Z), group: GROUP[p.Z] }, 'Z=' + p.Z);
    shapes.add(config(p.Z).map((c) => c.join(':')).join(','));
  }
  assert.equal(shapes.size, 20);
});

test('spec(): shape, answers, and no repeats inside a pool for any seed', () => {
  for (const type of P.TYPES) {
    const pool = P.variants(type).length;
    for (const seed of [1, 7, 12345, 987654321]) {
      const seen = new Set();
      for (let n = 0; n < pool; n++) {
        const it = P.spec(n, type, seed);
        for (const k of ['type', 'q', 'ans', 'tol', 'unit', 'why', 'hint', 'skill', 'title']) assert.ok(k in it, k + ' missing in ' + type);
        assert.equal(it.type, type); assert.deepEqual(it.ans, P.labRecompute(it.p));
        seen.add(JSON.stringify(it.p));
      }
      assert.equal(seen.size, pool, type + ' repeated a variant before the pool ran out, seed ' + seed);
    }
  }
  assert.notDeepEqual(P.spec(0, 'draw', 1).p, P.spec(0, 'draw', 2).p, 'different students start on different items (usually)');
});

test('grading: the right attempt passes and a wrong one fails, for every variant', () => {
  for (const type of P.TYPES) for (let n = 0; n < P.variants(type).length; n++) {
    const it = P.spec(n, type, 42);
    const right = type === 'read' ? String(it.ans) : type === 'draw' ? it.ans.map((b) => ({ ...b })) : { ...it.ans };
    assert.equal(P.grade(it, right), true, type + ' ' + JSON.stringify(it.p));
    const wrong = type === 'read' ? (typeof it.ans === 'number' ? String(it.ans + 1) : (it.ans === '1s' ? '2s' : '1s')) : type === 'draw' ? it.ans.slice().reverse().map((b) => ({ ...b })).concat([{ sub: '4s', count: 1 }]) : { ...it.ans, period: it.ans.period + 1 };
    assert.equal(P.grade(it, wrong), false, type + ' wrong accepted ' + JSON.stringify(it.p));
  }
});

test('hints name the misread and never contain the answer', () => {
  const o = P.spec(0, 'draw', 5); const p8 = P.variants('draw').find((v) => v.Z === 8); const item = { ...o, p: p8, ans: P.labRecompute(p8) };
  const per = Array.from({ length: 8 }, () => ({ sub: '1s', count: 1 }));
  assert.equal(P.diagnose(item, per).code, 'perElectron');
  assert.equal(P.diagnose(item, [{ sub: '2p', count: 4 }, { sub: '2s', count: 2 }, { sub: '1s', count: 2 }]).code, 'axisUp');
  assert.equal(P.diagnose(item, [{ sub: '1s', count: 2 }, { sub: '2p', count: 4 }, { sub: '2s', count: 2 }]).code, 'p2Left');
  assert.equal(P.diagnose({ ...item, ans: P.labRecompute(P.variants('draw').find((v) => v.Z === 16)), p: { kind: 'draw', Z: 16 } }, [{ sub: '3p', count: 4 }, { sub: '1s', count: 2 }, { sub: '2s', count: 2 }]).code, 'tallEnergy');
  for (const type of P.TYPES) for (let n = 0; n < 20; n++) {
    const it = P.spec(n, type, 3);
    const attempts = type === 'read' ? ['2p', '1s', '9', '', '4'] : type === 'draw' ? [[], [{ sub: '2s', count: 1 }], per, [{ sub: '3s', count: 2 }, { sub: '1s', count: 2 }]] : [{}, { Z: 7, period: 2, group: 15 }, { Z: it.ans.Z, period: 1, group: it.ans.group }, { Z: it.ans.Z, period: it.ans.period, group: 1 }];
    for (const a of attempts) {
      const d = P.diagnose(it, a); assert.ok(d.hint && d.code);
      if (type === 'draw') assert.ok(!d.hint.includes(P.configText(it.p.Z)), 'hint leaks the configuration');
      if (type === 'match') { assert.ok(!d.hint.includes(D.SYMBOLS[it.p.Z - 1] + ' '), 'hint names the element'); assert.ok(!new RegExp('period ' + it.ans.period + '\\b').test(d.hint) || it.ans.period === 0); }
      if (type === 'read' && typeof it.ans === 'string') assert.ok(!d.hint.includes('is ' + it.ans), 'read hint leaks the label');
    }
  }
});
