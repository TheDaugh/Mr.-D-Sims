/* PES data, Z = 1 to 20. Every number here is cited in chemistry/shared/pes-data-sources.md.
   Electron counts are computed from the Aufbau order (code, not typed in).
   Energies are gas-phase binding energies in eV as sourced, converted to MJ/mol with 1 eV = 0.0964853 MJ/mol.
   An element is in the sim only when EVERY occupied subshell has a sourced value (complete()).
   Anything else is listed by unverified() and left out. Never add a number here without a source id. */
(function (root) {
  'use strict';

  var EV_TO_MJ = 0.0964853;
  var SUBSHELLS = ['1s', '2s', '2p', '3s', '3p', '4s'];
  var CAPACITY = { '1s': 2, '2s': 2, '2p': 6, '3s': 2, '3p': 6, '4s': 2 };
  var SYMBOLS = ['H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne',
    'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca'];

  // Source ids: NIST = NIST Handbook of Basic Atomic Spectroscopic Data (ionization energies, one page per element).
  // XDB = X-ray Data Booklet, Table 1-1a. TARTU = Tartu gas-phase core-level database, digitized entry (see sources file).
  var OUTER_IE_NIST = {   // first ionization energy, eV (NIST); each is the outermost subshell of the neutral atom
    1: 13.598433, 2: 24.587387, 3: 5.391719, 4: 9.32270, 5: 8.29802, 6: 11.26030, 7: 14.5341, 8: 13.61805,
    9: 17.4228, 10: 21.56454, 11: 5.139076, 12: 7.646235, 13: 5.985768, 14: 8.15168, 15: 10.48669,
    16: 10.36001, 17: 12.96763, 18: 15.759610, 19: 4.3406633, 20: 6.11316
  };

  // Inner and non-outermost sourced values, eV. Outermost values come from OUTER_IE_NIST.
  var SOURCED = {
    '3:1s':  { eV: 64.39,     src: 'TARTU-1587' },
    '11:1s': { eV: 1078.1,    src: 'TARTU-1943' },
    '11:2s': { eV: 70.86,     src: 'TARTU-1945' },
    '10:1s': { eV: 870.37,    src: 'TARTU-1947' },
    '10:2s': { eV: 48.47,     src: 'TARTU-1949' },
    '12:1s': { eV: 1311.3,    src: 'TARTU-1590' },
    '12:2s': { eV: 96.5,      src: 'TARTU-1592' },
    '12:2p': { eV: 57.57,     src: 'TARTU-1595' },
    '18:1s': { eV: 3205.9,    src: 'XDB-K' },
    '18:2s': { eV: 326.37,    src: 'TARTU-6' },
    '18:2p': { eV: 248.60,    src: 'TARTU-7' },
    '18:3s': { eV: 29.3,      src: 'XDB-M1' }
  };

  function occupied(Z) {          // Aufbau fill, Z = 1..20 (no d-block, no exceptions)
    var left = Z, out = [];
    for (var i = 0; i < SUBSHELLS.length && left > 0; i++) {
      var n = Math.min(left, CAPACITY[SUBSHELLS[i]]);
      out.push({ sub: SUBSHELLS[i], count: n });
      left -= n;
    }
    return out;
  }

  function outerSub(Z) { var o = occupied(Z); return o[o.length - 1].sub; }

  function eVFor(Z, sub) {
    if (sub === outerSub(Z)) return { eV: OUTER_IE_NIST[Z], src: 'NIST-IE' };
    return SOURCED[Z + ':' + sub] || null;
  }

  function complete(Z) {
    return occupied(Z).every(function (o) { return eVFor(Z, o.sub) !== null; });
  }

  // The spectrum for an element: one entry per occupied subshell, in binding-energy order (highest eV first).
  function spectrum(Z) {
    if (!complete(Z)) return null;
    return occupied(Z).map(function (o) {
      var v = eVFor(Z, o.sub);
      return { sub: o.sub, count: o.count, eV: v.eV, MJ: v.eV * EV_TO_MJ, src: v.src };
    });
  }

  // Every occupied subshell with no sourced value, so the key can list them.
  function unverified() {
    var rows = [];
    for (var Z = 1; Z <= 20; Z++) {
      occupied(Z).forEach(function (o) {
        if (eVFor(Z, o.sub) === null) rows.push({ Z: Z, symbol: SYMBOLS[Z - 1], sub: o.sub });
      });
    }
    return rows;
  }

  var api = {
    EV_TO_MJ: EV_TO_MJ, SUBSHELLS: SUBSHELLS, CAPACITY: CAPACITY, SYMBOLS: SYMBOLS,
    OUTER_IE_NIST: OUTER_IE_NIST, SOURCED: SOURCED,
    occupied: occupied, outerSub: outerSub, eVFor: eVFor,
    complete: complete, spectrum: spectrum, unverified: unverified,
    simElements: function () {
      var out = [];
      for (var Z = 1; Z <= 20; Z++) if (complete(Z)) out.push(Z);
      return out;
    }
  };

  if (typeof module === 'object' && module.exports) module.exports = api;
  root.PESData = api;
})(typeof window !== 'undefined' ? window : globalThis);
