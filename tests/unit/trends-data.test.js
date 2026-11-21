/* Trends Explorer data (chemistry/unit-4-bonding/trends-data.js): the trends the page teaches must hold in the numbers,
   and the three pick answers must be the corners the day's notes name. */
const test = require('node:test'), assert = require('node:assert');
const D = require('../../chemistry/unit-4-bonding/trends-data.js');
const E = D.ELEMENTS, by = (p, g) => E.find(e => e.period === p && e.group === g);

test('radius: grows down every group', () => {
  D.GROUPS.forEach(g => { const col = E.filter(e => e.group === g).sort((a, b) => a.period - b.period);
    for (let i = 1; i < col.length; i++) assert.ok(col[i].r > col[i - 1].r, `${col[i].sym} should be bigger than ${col[i - 1].sym}`); });
});
test('radius: never grows across a period', () => {
  D.PERIODS.forEach(p => { const row = E.filter(e => e.period === p).sort((a, b) => a.group - b.group);
    for (let i = 1; i < row.length; i++) assert.ok(row[i].r <= row[i - 1].r, `${row[i].sym} should not be bigger than ${row[i - 1].sym}`); });
});
test('electronegativity: rises across a period, never rises down a group (noble gases left out)', () => {
  D.PERIODS.forEach(p => { const row = E.filter(e => e.period === p && e.en != null).sort((a, b) => a.group - b.group);
    for (let i = 1; i < row.length; i++) assert.ok(row[i].en > row[i - 1].en, `${row[i].sym} > ${row[i - 1].sym}`); });
  D.GROUPS.forEach(g => { const col = E.filter(e => e.group === g && e.en != null).sort((a, b) => a.period - b.period);
    for (let i = 1; i < col.length; i++) assert.ok(col[i].en <= col[i - 1].en, `${col[i].sym} <= ${col[i - 1].sym}`); });
});
test('lets-go bar: each metal in groups 1 and 2 lets go more easily than the one above it', () => {
  [1, 2].forEach(g => { const col = E.filter(e => e.group === g).sort((a, b) => a.period - b.period);
    for (let i = 1; i < col.length; i++) assert.ok(D.letsGo(col[i]) > D.letsGo(col[i - 1])); });
});
test('pick answers are cesium, cesium, fluorine', () => {
  assert.deepStrictEqual(D.PICKS.map(p => p.ans()), ['Cs', 'Cs', 'F']);
});
test('every bar value is between 0 and 1', () => {
  E.forEach(e => { [D.size(e), D.letsGo(e), D.pulls(e)].forEach(v => { if (v != null) assert.ok(v >= 0 && v <= 1.0001, e.sym); }); });
});
test('valence dots match the group digit', () => {
  assert.strictEqual(D.BY.Na.valence, 1); assert.strictEqual(D.BY.C.valence, 4); assert.strictEqual(D.BY.Cl.valence, 7); assert.strictEqual(D.BY.Ne.valence, 8);
});
test('duel: Na vs Cl goes all the way over; C vs O stays shared; same atom is a tie; noble gas is no fight', () => {
  const d1 = D.duel(D.BY.Na, D.BY.Cl); assert.strictEqual(d1.winner, 'Cl'); assert.strictEqual(d1.share, 1);
  const d2 = D.duel(D.BY.C, D.BY.O); assert.strictEqual(d2.winner, 'O'); assert.ok(d2.share > 0 && d2.share < 1);
  assert.strictEqual(D.duel(D.BY.Cl, D.BY.Cl).winner, null);
  assert.strictEqual(D.duel(D.BY.Ne, D.BY.F).ok, false);
});
test('every tile has a distinct place in the table', () => {
  const seen = new Set(E.map(e => e.period + ':' + e.group)); assert.strictEqual(seen.size, E.length);
});
