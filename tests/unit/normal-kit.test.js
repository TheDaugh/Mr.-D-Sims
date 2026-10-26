/* NK math and diagnosis, no browser. The z-table is checked cell by cell against scipy.stats.norm.cdf (tests/fixtures/z-table-scipy.json). */
const test = require('node:test'), assert = require('node:assert'), NK = require('../../stats/shared/normal-kit.js'), fx = require('../fixtures/z-table-scipy.json');

test('table: 69 rows (-3.4 to 3.4) x 10 columns match scipy exactly, plus the -0.0 row', () => {
  const core = NK.table.core; assert.strictEqual(core.length, 69);
  let n = 0;
  for (const r of NK.table.rows) for (let c = 0; c < 10; c++) { assert.strictEqual(NK.table.cell(r, c), fx.rows[r.id][c], r.id + ' col ' + c); if (r.id !== 'n0') n++; }
  assert.strictEqual(n, 690);
});
test('row and column of a z: whole number and first decimal pick the row, second decimal the column', () => {
  assert.deepStrictEqual(NK.table.locate(1.23), { id: 'p12', col: 3 });
  assert.deepStrictEqual(NK.table.locate(-1.23), { id: 'n12', col: 3 });
  assert.deepStrictEqual(NK.table.locate(-0.05), { id: 'n0', col: 5 });
  assert.deepStrictEqual(NK.table.locate(0), { id: 'p0', col: 0 });
  for (let h = -349; h <= 349; h++) { const z = h / 100, l = NK.table.locate(z); if (h === 0) continue; assert.strictEqual(NK.table.cell(NK.table.rowBy[l.id], l.col), NK.cdf4(z), 'z=' + z); }
});
test('invCdf inverts cdf', () => { for (const p of [0.01, 0.1, 0.5, 0.9, 0.975]) assert.ok(Math.abs(NK.cdf(NK.invCdf(p)) - p) < 1e-12); assert.ok(Math.abs(NK.invCdf(0.975) - 1.959964) < 1e-6); });

const row = (z) => NK.table.locate(z);
test('lookup diagnosis: right cell, wrong row, wrong column, both, sign', () => {
  const t = { z: 1.23, want: 'left' };
  assert.strictEqual(NK.diagnoseLookup(t, row(1.23)).kind, 'ok');
  const r = NK.diagnoseLookup(t, { id: 'p13', col: 3 }); assert.strictEqual(r.kind, 'row'); assert.match(r.msg, /Wrong row.*1\.2.*1\.3/);
  const c = NK.diagnoseLookup(t, { id: 'p12', col: 2 }); assert.strictEqual(c.kind, 'col'); assert.match(c.msg, /Wrong column.*\.03.*\.02/);
  assert.strictEqual(NK.diagnoseLookup(t, { id: 'p11', col: 8 }).kind, 'both');
  const s = NK.diagnoseLookup(t, { id: 'n12', col: 3 }); assert.strictEqual(s.kind, 'row'); assert.match(s.msg, /sign/);
});
test('right-tail lookup: z cell then subtract, or the mirror cell; area read from the wrong side is named', () => {
  const t = { z: 1.23, want: 'right' }, a = NK.cdf4(1.23);
  const s1 = NK.diagnoseLookup(t, row(1.23)); assert.strictEqual(s1.kind, 'subtract'); assert.strictEqual(s1.value, a);
  assert.strictEqual(NK.diagnoseFinal(a, 0.1093, 'right').ok, true);
  const side = NK.diagnoseFinal(a, a, 'right'); assert.strictEqual(side.kind, 'side'); assert.match(side.msg, /LEFT/);
  assert.strictEqual(NK.diagnoseFinal(a, 0.2, 'right').kind, 'arith');
  assert.strictEqual(NK.diagnoseLookup(t, row(-1.23)).ok, true);
});
test('inverse: closest cell wins; a right-tail p looked up directly is named as the wrong side', () => {
  const t = { p: 0.9, want: 'left' }, best = NK.bestCell(0.9); assert.strictEqual(NK.table.cell(NK.table.rowBy[best.id], best.col), 0.8997);
  assert.strictEqual(NK.diagnoseInverse(t, best).ok, true);
  assert.ok(Math.abs(NK.diagnoseInverse(t, best).z - 1.28) < 1e-9);
  assert.strictEqual(NK.diagnoseInverse(t, { id: 'p12', col: 9 }).kind, 'col');
  assert.strictEqual(NK.diagnoseInverse(t, { id: 'p13', col: 8 }).kind, 'row');
  const r = { p: 0.05, want: 'right' }, rb = NK.bestCell(0.95); assert.strictEqual(NK.diagnoseInverse(r, rb).ok, true);
  const wrong = NK.bestCell(0.05); const d = NK.diagnoseInverse(r, wrong); assert.strictEqual(d.kind, 'side'); assert.match(d.msg, /LEFT/);
});
test('worked example is computed, not typed', () => { const w = NK.workedExample(); assert.strictEqual(w.area, 0.9332); assert.strictEqual(w.right, 0.0668); assert.strictEqual(w.row, '1.5'); });
