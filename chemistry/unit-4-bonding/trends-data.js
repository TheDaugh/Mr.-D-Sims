/* Trends Explorer: the data behind the Unit 4 Day 1 Explore (trends-explorer.html).
   Every element here is a main-group atom from period 2 to 6, plus hydrogen (period 1, so water and the hydrogen compounds can form). Helium is left out: its radius is not on the same table. Shown only as bars, never as numbers.
   Sources (standard reference tables; the bars are relative, so only the order and the gaps matter):
     r   atomic radius in pm, the calculated values from the usual reference table (Clementi et al., as tabulated in the CRC Handbook)
     ie  first ionization energy in kJ/mol, NIST Atomic Spectra Database
     en  Pauling electronegativity; null for the noble gases, which the unit leaves out because they rarely bond
   Left out on purpose: Ga, Ge, In, Sn. Electronegativity goes UP between Al and Ga and between Si and Ge, which is a real exception
   that the day's notes ("decreases down a group") do not teach. Periods 2 and 3 of groups 13 and 14 stay in because the practice items use C.
   Works in the browser (window.TrendsData) and in node tests (require). */
(function (root) {
  "use strict";
  // sym, name, Z, period, group, r, ie, en
  var RAW = [
    ["H", "Hydrogen", 1, 1, 1, 25, 1312.0, 2.20],
    ["Li", "Lithium", 3, 2, 1, 145, 520.2, 0.98], ["Be", "Beryllium", 4, 2, 2, 105, 899.5, 1.57], ["B", "Boron", 5, 2, 13, 85, 800.6, 2.04],
    ["C", "Carbon", 6, 2, 14, 70, 1086.5, 2.55], ["N", "Nitrogen", 7, 2, 15, 65, 1402.3, 3.04], ["O", "Oxygen", 8, 2, 16, 60, 1313.9, 3.44],
    ["F", "Fluorine", 9, 2, 17, 50, 1681.0, 3.98], ["Ne", "Neon", 10, 2, 18, 38, 2080.7, null],
    ["Na", "Sodium", 11, 3, 1, 180, 495.8, 0.93], ["Mg", "Magnesium", 12, 3, 2, 150, 737.7, 1.31], ["Al", "Aluminum", 13, 3, 13, 125, 577.5, 1.61],
    ["Si", "Silicon", 14, 3, 14, 110, 786.5, 1.90], ["P", "Phosphorus", 15, 3, 15, 100, 1011.8, 2.19], ["S", "Sulfur", 16, 3, 16, 100, 999.6, 2.58],
    ["Cl", "Chlorine", 17, 3, 17, 100, 1251.2, 3.16], ["Ar", "Argon", 18, 3, 18, 71, 1520.6, null],
    ["K", "Potassium", 19, 4, 1, 220, 418.8, 0.82], ["Ca", "Calcium", 20, 4, 2, 180, 589.8, 1.00], ["As", "Arsenic", 33, 4, 15, 115, 947.0, 2.18],
    ["Se", "Selenium", 34, 4, 16, 115, 941.0, 2.55], ["Br", "Bromine", 35, 4, 17, 115, 1139.9, 2.96], ["Kr", "Krypton", 36, 4, 18, 88, 1350.8, null],
    ["Rb", "Rubidium", 37, 5, 1, 235, 403.0, 0.82], ["Sr", "Strontium", 38, 5, 2, 200, 549.5, 0.95], ["Sb", "Antimony", 51, 5, 15, 145, 834.0, 2.05],
    ["Te", "Tellurium", 52, 5, 16, 140, 869.3, 2.10], ["I", "Iodine", 53, 5, 17, 140, 1008.4, 2.66], ["Xe", "Xenon", 54, 5, 18, 108, 1170.4, null],
    ["Cs", "Cesium", 55, 6, 1, 260, 375.7, 0.79], ["Ba", "Barium", 56, 6, 2, 215, 502.9, 0.89]
  ];
  var ELEMENTS = RAW.map(function (a) {
    return { sym: a[0], name: a[1], Z: a[2], period: a[3], group: a[4], r: a[5], ie: a[6], en: a[7], valence: a[4] === 1 || a[4] === 2 ? a[4] : a[4] - 10 };
  });
  var BY = {}; ELEMENTS.forEach(function (e) { BY[e.sym] = e; });
  var R_MAX = 260, IE_MIN = 375.7, IE_MAX = 2080.7, EN_MAX = 3.98;
  // 0..1 for the bars
  function size(e) { return e.r / R_MAX; }
  function letsGo(e) { return 1 - (e.ie - IE_MIN) / (IE_MAX - IE_MIN); }
  function pulls(e) { return e.en == null ? null : e.en / EN_MAX; }
  /* The tug-of-war over one shared electron. diff of 1.7 or more and the electron goes all the way over.
     Returns { winner: sym|null, share: 0..1 }: share is how far toward the winner the electron ends up. */
  function duel(a, b) {
    if (a.en == null || b.en == null) return { ok: false, winner: null, share: 0, diff: 0 };
    var d = Math.abs(a.en - b.en);
    if (d < 0.005) return { ok: true, winner: null, share: 0, diff: 0 };
    return { ok: true, winner: (a.en > b.en ? a : b).sym, share: Math.min(1, d / 1.7), diff: d };
  }
  // the three picks and their answers (the key reads these)
  var PICKS = [
    { id: "big", ask: "Biggest atom", ans: function () { return best(function (e) { return e.r; }); } },
    { id: "letgo", ask: "Lets go of an outer electron easiest", ans: function () { return best(function (e) { return letsGo(e); }); } },
    { id: "pull", ask: "Pulls hardest on a shared electron", ans: function () { return best(function (e) { return e.en == null ? -1 : e.en; }); } }
  ];
  function best(f) { var b = ELEMENTS[0]; ELEMENTS.forEach(function (e) { if (f(e) > f(b)) b = e; }); return b.sym; }

  root.TrendsData = { ELEMENTS: ELEMENTS, BY: BY, size: size, letsGo: letsGo, pulls: pulls, duel: duel, PICKS: PICKS, GROUPS: [1, 2, 13, 14, 15, 16, 17, 18], PERIODS: [2, 3, 4, 5, 6], ROWS: [1, 2, 3, 4, 5, 6] };
  if (typeof module !== "undefined" && module.exports) module.exports = root.TrendsData;
})(typeof window !== "undefined" ? window : globalThis);
