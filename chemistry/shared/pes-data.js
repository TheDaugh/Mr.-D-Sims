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

  // CALCULATED fill-ins for the lab (slot 11 virtual lab). Hartree, magnitude of the NIST LDA orbital energy of the neutral atom
  // (NIST SRD 141, "Atomic Reference Data for Electronic Structure Calculations", Kotochigova, Levine, Shirley, Chang; source id NISTDFT-LDA).
  // These are free-atom calculations, not measurements. They fill the subshells with no gas-phase measured value, and only those.
  // The older lesson page never reads them: complete(), spectrum() and simElements() ignore this table.
  var HARTREE_EV = 27.211386245988;   // CODATA 2018
  var CALC_EH = {
    '4:1s': 3.856411,
    '5:1s': 6.564347,
    '5:2s': 0.344701,
    '6:1s': 9.947718,
    '6:2s': 0.500866,
    '7:1s': 14.011501,
    '7:2s': 0.676151,
    '8:1s': 18.758245,
    '8:2s': 0.871362,
    '9:1s': 24.189391,
    '9:2s': 1.086859,
    '11:2p': 1.060636,
    '13:1s': 55.156044,
    '13:2s': 3.934827,
    '13:2p': 2.564018,
    '13:3s': 0.286883,
    '14:1s': 65.184426,
    '14:2s': 5.075056,
    '14:2p': 3.514938,
    '14:3s': 0.398139,
    '15:1s': 76.061897,
    '15:2s': 6.329346,
    '15:2p': 4.576617,
    '15:3s': 0.512364,
    '16:1s': 87.789937,
    '16:2s': 7.699940,
    '16:2p': 5.751257,
    '16:3s': 0.630912,
    '17:1s': 100.369229,
    '17:2s': 9.187993,
    '17:2p': 7.039982,
    '17:3s': 0.754458,
    '19:1s': 128.414957,
    '19:2s': 12.839001,
    '19:2p': 10.283851,
    '19:3s': 1.281897,
    '19:3p': 0.693776,
    '20:1s': 143.935181,
    '20:2s': 15.046905,
    '20:2p': 12.285376,
    '20:3s': 1.706331,
    '20:3p': 1.030572
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

  // ---- the lab's view: every element, each value tagged measured or calculated ----
  function labEV(Z, sub) {
    var m = eVFor(Z, sub);
    if (m) return { eV: m.eV, src: m.src, kind: 'measured' };
    var c = CALC_EH[Z + ':' + sub];
    return c === undefined ? null : { eV: c * HARTREE_EV, src: 'NISTDFT-LDA', kind: 'calculated' };
  }
  function labSpectrum(Z) {
    var occ = occupied(Z), out = [];
    for (var i = 0; i < occ.length; i++) {
      var v = labEV(Z, occ[i].sub);
      if (!v) return null;
      out.push({ sub: occ[i].sub, count: occ[i].count, eV: v.eV, MJ: v.eV * EV_TO_MJ, src: v.src, kind: v.kind });
    }
    return out;
  }
  function labElements() { var o = []; for (var Z = 1; Z <= 20; Z++) if (labSpectrum(Z)) o.push(Z); return o; }
  function labCalculated() {
    var rows = [];
    for (var Z = 1; Z <= 20; Z++) occupied(Z).forEach(function (o) { var v = labEV(Z, o.sub); if (v && v.kind === 'calculated') rows.push({ Z: Z, symbol: SYMBOLS[Z - 1], sub: o.sub, eV: v.eV }); });
    return rows;
  }
  function labUnverified() {
    var rows = [];
    for (var Z = 1; Z <= 20; Z++) occupied(Z).forEach(function (o) { if (!labEV(Z, o.sub)) rows.push({ Z: Z, symbol: SYMBOLS[Z - 1], sub: o.sub }); });
    return rows;
  }

  var api = {
    HARTREE_EV: HARTREE_EV, CALC_EH: CALC_EH, labEV: labEV, labSpectrum: labSpectrum, labElements: labElements, labCalculated: labCalculated, labUnverified: labUnverified,
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
