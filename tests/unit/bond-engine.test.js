/* Bond engine (chemistry/unit-4-bonding/bond-engine.js): the ratios, the gives/takes/shares calls, and conservation of atoms. */
const test = require('node:test'), assert = require('node:assert');
const D = require('../../chemistry/unit-4-bonding/trends-data.js');
const B = require('../../chemistry/unit-4-bonding/bond-engine.js');
const one = (counts) => { const r = B.react(counts); return r.units.map(u => u.count + ' ' + u.formula).join(', '); };

test('pairs: one of each', () => {
  const p = B.pair('Na', 'Cl'); assert.strictEqual(p.mode, 'gives'); assert.strictEqual(p.donor, 'Na'); assert.strictEqual(p.taker, 'Cl'); assert.strictEqual(p.moved, 1); assert.strictEqual(p.leftDonor, 0); assert.strictEqual(p.leftTaker, 0);
  const q = B.pair('Na', 'O'); assert.strictEqual(q.moved, 1); assert.strictEqual(q.leftTaker, 1);
  const m = B.pair('Mg', 'Cl'); assert.strictEqual(m.moved, 1); assert.strictEqual(m.leftDonor, 1);
  const h = B.pair('H', 'Cl'); assert.strictEqual(h.mode, 'shares'); assert.strictEqual(h.winner, 'Cl'); assert.strictEqual(h.pairs, 1); assert.strictEqual(h.even, false);
  const c2 = B.pair('Cl', 'Cl'); assert.strictEqual(c2.mode, 'shares'); assert.strictEqual(c2.winner, null); assert.strictEqual(c2.even, true);
  assert.strictEqual(B.pair('Ne', 'F').mode, 'none'); assert.strictEqual(B.pair('Na', 'Mg').mode, 'none'); assert.strictEqual(B.pair('C', 'C').mode, 'none');
  const co = B.pair('C', 'O'); assert.strictEqual(co.mode, 'shares'); assert.strictEqual(co.pairs, 2); assert.strictEqual(co.winner, 'O'); assert.strictEqual(co.leftA, 2);
});
test('every metal gives to every nonmetal it differs from by 1.0 or more, and the taker is the nonmetal', () => {
  D.ELEMENTS.forEach(a => D.ELEMENTS.forEach(b => {
    if (B.role(a.sym).kind !== 'metal' || B.role(b.sym).kind !== 'nonmetal') return;
    const p = B.pair(a.sym, b.sym); if (Math.abs(a.en - b.en) >= 1.0) { assert.strictEqual(p.mode, 'gives', a.sym + b.sym); assert.strictEqual(p.donor, a.sym); }
  }));
});
test('dishes: the formulas the course expects', () => {
  assert.strictEqual(one({ Na: 1, Cl: 1 }), '1 NaCl'); assert.strictEqual(one({ Mg: 1, Cl: 2 }), '1 MgCl₂'); assert.strictEqual(one({ Na: 2, O: 1 }), '1 Na₂O');
  assert.strictEqual(one({ Mg: 1, O: 1 }), '1 MgO'); assert.strictEqual(one({ Al: 2, O: 3 }), '1 Al₂O₃'); assert.strictEqual(one({ Mg: 3, N: 2 }), '1 Mg₃N₂');
  assert.strictEqual(one({ H: 2, O: 1 }), '1 H₂O'); assert.strictEqual(one({ C: 1, O: 2 }), '1 CO₂'); assert.strictEqual(one({ N: 1, H: 3 }), '1 NH₃'); assert.strictEqual(one({ C: 1, H: 4 }), '1 CH₄');
  assert.strictEqual(one({ H: 1, Cl: 1 }), '1 HCl'); assert.strictEqual(one({ Li: 1, F: 1 }), '1 LiF'); assert.strictEqual(one({ Cl: 2 }), '1 Cl₂'); assert.strictEqual(one({ O: 2 }), '1 O₂');
  assert.strictEqual(one({ Na: 4, O: 2 }), '2 Na₂O'); assert.strictEqual(one({ Ca: 1, Cl: 2 }), '1 CaCl₂'); assert.strictEqual(one({ Na: 1, H: 1 }), '1 NaH');
});
test('a short dish makes nothing and says what would finish it', () => {
  const r = B.react({ Mg: 1, Cl: 1 }); assert.strictEqual(r.units.length, 0); assert.strictEqual(r.near.formula, 'MgCl₂'); assert.deepStrictEqual(r.near.add, { Cl: 1 });
  const s = B.react({ Na: 1, O: 1 }); assert.strictEqual(s.near.formula, 'Na₂O'); assert.deepStrictEqual(s.near.add, { Na: 1 });
});
test('competing pulls: the biggest gap goes first, the rest is left over', () => {
  const r = B.react({ H: 2, O: 1, C: 1, }); assert.strictEqual(r.units.map(u => u.formula).join(), 'H₂O'); assert.deepStrictEqual(r.left, { C: 1 });
  const t = B.react({ Na: 1, Cl: 1, H: 2, O: 1 }); assert.deepStrictEqual(t.units.map(u => u.formula).sort(), ['H₂O', 'NaCl']);
});
test('noble gases and two metals do nothing', () => {
  const r = B.react({ Ne: 2, Na: 1, Mg: 1 }); assert.strictEqual(r.units.length, 0); assert.deepStrictEqual(r.left, { Ne: 2, Na: 1, Mg: 1 });
});
test('hydrogen is written first with oxygen and chlorine, last with nitrogen and carbon', () => {
  assert.strictEqual(B.formula({ H: 2, O: 1 }), 'H₂O'); assert.strictEqual(B.formula({ H: 1, Cl: 1 }), 'HCl'); assert.strictEqual(B.formula({ N: 1, H: 3 }), 'NH₃'); assert.strictEqual(B.formula({ C: 1, H: 4 }), 'CH₄');
  assert.strictEqual(B.formula({ Cl: 1, Na: 1 }), 'NaCl');
});
test('no atoms appear or vanish: every random dish balances', () => {
  const syms = D.ELEMENTS.map(e => e.sym); let seed = 42; const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  for (let n = 0; n < 600; n++) {
    const dish = {}, k = 1 + Math.floor(rnd() * 12); for (let i = 0; i < k; i++) { const s = syms[Math.floor(rnd() * syms.length)]; dish[s] = (dish[s] || 0) + 1; }
    const r = B.react(dish), got = Object.assign({}, r.left);
    r.units.forEach(u => Object.keys(u.members).forEach(s => { got[s] = (got[s] || 0) + u.members[s] * u.count; }));
    assert.deepStrictEqual(got, dish, JSON.stringify(dish));
  }
});
