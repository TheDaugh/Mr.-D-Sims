// Source and consistency tests for chemistry/shared/pes-data.js (slot 11, photoelectron spectroscopy).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const D = require('../../chemistry/shared/pes-data.js');

const SOURCES = fs.readFileSync(path.join(__dirname, '../../chemistry/shared/pes-data-sources.md'), 'utf8');
const ORDER = ['1s', '2s', '2p', '3s', '3p', '4s'];

test('electron counts come from the Aufbau order and sum to Z', () => {
  for (let Z = 1; Z <= 20; Z++) {
    const occ = D.occupied(Z);
    assert.equal(occ.reduce((a, o) => a + o.count, 0), Z, 'Z=' + Z);
    occ.forEach(o => assert.ok(o.count <= D.CAPACITY[o.sub], 'overfilled ' + o.sub + ' at Z=' + Z));
  }
  assert.deepEqual(D.occupied(18).map(o => o.sub + o.count),
    ['1s2', '2s2', '2p6', '3s2', '3p6'], 'argon configuration');
  assert.equal(D.outerSub(19), '4s');
});

test('outermost subshell value is within 10% of the NIST first ionization energy, Z = 1 to 20', () => {
  for (let Z = 1; Z <= 20; Z++) {
    const outer = D.outerSub(Z);
    const v = D.eVFor(Z, outer);
    assert.ok(v, 'no outermost value for Z=' + Z);
    const nist = D.OUTER_IE_NIST[Z];
    assert.ok(nist > 0, 'no NIST IE for Z=' + Z);
    assert.ok(Math.abs(v.eV - nist) / nist <= 0.10, 'Z=' + Z + ' outer ' + v.eV + ' vs NIST ' + nist);
  }
});

test('binding energies fall in the order 1s > 2s > 2p > 3s > 3p > 4s for every element (where sourced)', () => {
  for (let Z = 1; Z <= 20; Z++) {
    let prev = Infinity, prevSub = null;
    for (const sub of ORDER) {
      if (!D.occupied(Z).some(o => o.sub === sub)) continue;
      const v = D.eVFor(Z, sub);
      if (!v) continue;                       // unsourced: checked again once sourced
      assert.ok(v.eV < prev, 'Z=' + Z + ': ' + sub + ' (' + v.eV + ') is not below ' + prevSub + ' (' + prev + ')');
      prev = v.eV; prevSub = sub;
    }
  }
});

test('every value has a citation id that appears in pes-data-sources.md', () => {
  for (const key of Object.keys(D.SOURCED)) {
    const src = D.SOURCED[key].src;
    assert.ok(SOURCES.includes(src), key + ' cites ' + src + ' which is not in the sources file');
  }
  assert.ok(SOURCES.includes('NIST-IE'), 'NIST table missing from sources');
});

test('MJ/mol conversion uses 1 eV = 0.0964853 MJ/mol (Li 2s check)', () => {
  const li = D.spectrum(3);
  const li2s = li.find(o => o.sub === '2s');
  assert.ok(Math.abs(li2s.eV - 5.391719) < 1e-9);
  assert.ok(Math.abs(li2s.MJ - 5.391719 * 0.0964853) < 1e-12);
  assert.ok(Math.abs(li2s.MJ - 0.520) < 0.001);
});

test('the sim scope is exactly the elements with every subshell sourced', () => {
  // Locks what the page may show. Changing it means sourcing more values, not editing this list by hand.
  assert.deepEqual(D.simElements(), [1, 2, 3, 10, 12, 18]);
  assert.equal(D.complete(11), false, 'Na needs a gas-phase 2p value');
  for (const Z of D.simElements()) assert.ok(D.spectrum(Z).every(o => o.eV > 0));
});
