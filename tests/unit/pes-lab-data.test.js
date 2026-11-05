// The lab's view of pes-data.js (virtual lab, slot 11): every element complete, calculated values tagged and cited.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const D = require('../../chemistry/shared/pes-data.js');
const SOURCES = fs.readFileSync(path.join(__dirname, '../../chemistry/shared/pes-data-sources.md'), 'utf8');
const ORDER = ['1s', '2s', '2p', '3s', '3p', '4s'];

test('lab data: all 20 elements are complete, nothing unverified', () => {
  assert.equal(D.labElements().length, 20);
  assert.deepEqual(D.labUnverified(), []);
});

test('lab data: outermost value of every element is within 10% of NIST first ionization energy', () => {
  for (let Z = 1; Z <= 20; Z++) {
    const v = D.labEV(Z, D.outerSub(Z));
    assert.equal(v.kind, 'measured');
    assert.ok(Math.abs(v.eV - D.OUTER_IE_NIST[Z]) / D.OUTER_IE_NIST[Z] <= 0.10, 'Z=' + Z);
  }
});

test('lab data: energies fall in the order 1s > 2s > 2p > 3s > 3p > 4s for every element, all subshells', () => {
  for (let Z = 1; Z <= 20; Z++) {
    let prev = Infinity, prevSub = null;
    for (const sub of ORDER) {
      if (!D.occupied(Z).some(o => o.sub === sub)) continue;
      const v = D.labEV(Z, sub);
      assert.ok(v.eV < prev, 'Z=' + Z + ': ' + sub + ' (' + v.eV + ') not below ' + prevSub + ' (' + prev + ')');
      prev = v.eV; prevSub = sub;
    }
  }
});

test('lab data: every calculated value is tagged, converted from hartree and listed in the sources file', () => {
  const calc = D.labCalculated();
  assert.equal(calc.length, 42);
  for (const r of calc) {
    const v = D.labEV(r.Z, r.sub);
    assert.equal(v.src, 'NISTDFT-LDA');
    assert.ok(Math.abs(v.eV - D.CALC_EH[r.Z + ':' + r.sub] * 27.211386245988) < 1e-9);
    const row = new RegExp('\\| NISTDFT-LDA \\| ' + r.Z + ' ' + r.symbol + ' \\| ' + r.sub + ' \\| ' + D.CALC_EH[r.Z + ':' + r.sub].toFixed(6));
    assert.ok(row.test(SOURCES), 'sources file has no row for ' + r.symbol + ' ' + r.sub);
  }
  // a calculated value never replaces a measured one
  for (let Z = 1; Z <= 20; Z++) D.occupied(Z).forEach(o => { if (D.eVFor(Z, o.sub)) assert.equal(D.labEV(Z, o.sub).kind, 'measured'); });
});

test('lab data: the older lesson page is unchanged (simElements stays at the measured six)', () => {
  assert.deepEqual(D.simElements(), [1, 2, 3, 10, 12, 18]);
});
