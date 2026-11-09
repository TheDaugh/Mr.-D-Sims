/* DAY CARD CONTENT: Unit 3, Slot 15. Effective nuclear charge and shielding.
   Plain data plus pure generators, no DOM. Verified by tests/unit/slot-15-content.test.js.
   The estimate: Z_eff = Z - core electrons (core = every electron in a shell below the outermost). Valence electrons do not shield each
   other here, so Z_eff of a main-group atom equals its valence count. Real values are larger and the ranking is the same.
   The pull is Z_eff / n^2 (n = outer shell number, a stand-in for distance; slot 7: double the distance, a quarter of the pull).
   It is a classroom model number (author_set), never a measurement. Scope: neutral atoms Z = 3 to 20.
   DIP_PAIRS are the pairs where this estimate disagrees with the measured first ionization energies (NIST, chemistry/shared/pes-data.js).
   No generated item uses one, so a student never sees the model contradict the data today. Slot 17 owns the dips and the revision. */
(function (root) {
  'use strict';
  var node = typeof module !== 'undefined' && module.exports;
  var Z = node ? require('../../shared/zeff.js') : root.Zeff;
  var A = Z.atom, NAME = Z.NAME, SYM = Z.SYM;

  /* the pairs (by Z, low first) where the estimate and the measured first ionization energy order differ; the test recomputes this list */
  var DIP_PAIRS = [[3, 12], [3, 20], [4, 5], [5, 15], [5, 16], [6, 17], [6, 18], [7, 8], [7, 18], [8, 18], [12, 13], [13, 20], [15, 16]];
  function isDip(a, b) { var lo = Math.min(a, b), hi = Math.max(a, b); return DIP_PAIRS.some(function (p) { return p[0] === lo && p[1] === hi; }); }

  /* ---------- helpers ---------- */
  var INT = function (r, a, b) { return a + Math.floor(r() * (b - a + 1)); };
  var pick = function (r, arr) { return arr[Math.floor(r() * arr.length)]; };
  function shuffle(r, arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function choice(r, correct, wrongs) { var o = shuffle(r, [correct].concat(wrongs)); return { options: o, answer: o.indexOf(correct) }; }
  var cl = function (b) { return Math.max(1, Math.min(3, b || 1)); };
  var cap = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };
  var ringsText = function (a) { return a.rings.join(', '); };

  /* ---------- the pair pools, by band ---------- */
  function allPairs(zs) {
    var out = [];
    for (var i = 0; i < zs.length; i++) for (var j = i + 1; j < zs.length; j++) if (!isDip(zs[i], zs[j]) && Z.cmp(A(zs[i]), A(zs[j])) !== 0) out.push([zs[i], zs[j]]);
    return out;
  }
  var RANGE = function (lo, hi) { var o = []; for (var z = lo; z <= hi; z++) o.push(z); return o; };
  var POOLS = {
    1: allPairs([3, 11, 19]),                                                     // one group: same Z_eff, different distance
    2: allPairs([4, 12, 20]).concat(allPairs([9, 17]), allPairs(RANGE(11, 16))),   // another group, and the first six of period 3: same distance, different Z_eff
    3: allPairs(RANGE(3, 20))                                                     // everything in scope, period 3 in full, atoms that differ in both
  };
  function pairFor(r, band) {
    var p = pick(r, POOLS[cl(band)]);
    return r() < 0.5 ? [p[0], p[1]] : [p[1], p[0]];
  }
  /* the answer to "which holds its outer electron harder": 'a' or 'b' (never a tie in a pool) */
  function harder(a, b) { return Z.cmp(A(a), A(b)) > 0 ? 'a' : 'b'; }
  function reasonFor(a, b) {
    var x = A(a), y = A(b), w = Z.cmp(x, y) > 0 ? x : y, l = w === x ? y : x;
    if (x.zeff === y.zeff) return 'Both have Z_eff = ' + x.zeff + '. ' + cap(w.name) + '’s outer electron is in ring ' + w.n + ' and ' + l.name + '’s is in ring ' + l.n + ', so ' + w.name + ' pulls harder.';
    if (x.n === y.n) return 'Both outer electrons are in ring ' + x.n + '. ' + cap(w.name) + ' has Z_eff = ' + w.zeff + ' and ' + l.name + ' has ' + l.zeff + ', so ' + w.name + ' pulls harder.';
    return cap(w.name) + ': ' + w.zeff + ' ÷ ' + w.n + '² = ' + Z.frac(w) + '. ' + cap(l.name) + ': ' + l.zeff + ' ÷ ' + l.n + '² = ' + Z.frac(l) + '. The larger number pulls harder.';
  }

  /* ---------- the picture for a question ---------- */
  function onePic(z, o) { return Z.svg(z, o || {}); }
  function pairPic(a, b, o) { return '<div style="display:flex;gap:12px;flex-wrap:wrap">' + onePic(a, o) + onePic(b, o) + '</div>'; }

  /* ---------- skills: three skills, three bands (a ramp; the top band is the regular-level standard) ---------- */
  var HINT_CORE = 'Core electrons are every electron that is not in the outer ring. Add the inner rings.';
  var HINT_ZEFF = 'Z_eff = Z minus the core electrons.';
  var skills = [
    { id: 'core', title: 'Count the core electrons', gen: function (b, r) {
      b = cl(b); var z, a;
      if (b === 1) { z = pick(r, [3, 11, 19]); a = A(z);
        return { type: 'num', itemType: 'picture', prompt: 'How many core electrons does this ' + a.name + ' atom have? Core electrons are the ones not in the outer ring.', pic: onePic(z), answer: a.core, unit: '', p: { z: z },
          hint: HINT_CORE, worked: 'Rings: ' + ringsText(a) + '. The outer ring is not core, so ' + a.rings.slice(0, -1).join(' + ') + ' = ' + a.core + '.' }; }
      if (b === 2) { z = pick(r, RANGE(11, 16).concat([4, 12, 20])); a = A(z);
        return { type: 'num', itemType: 'word', prompt: 'A neutral ' + a.name + ' atom has Z = ' + z + ' and its electrons sit in rings of ' + ringsText(a) + '. How many are core electrons?', answer: a.core, unit: '', p: { z: z },
          hint: HINT_CORE, worked: 'The last ring (' + a.valence + ') is the outer ring. Core: ' + a.rings.slice(0, -1).join(' + ') + ' = ' + a.core + '.' }; }
      z = pick(r, RANGE(3, 20)); a = A(z);
      return { type: 'num', itemType: 'backward', prompt: 'A neutral atom has Z = ' + z + ' and ' + a.valence + ' electron' + (a.valence > 1 ? 's' : '') + ' in its outer ring. How many core electrons does it have?', answer: a.core, unit: '', p: { z: z },
        hint: 'Every electron is either in the outer ring or core. Take the outer ring from Z.', worked: z + ' − ' + a.valence + ' = ' + a.core + ' core electrons.' };
    } },
    { id: 'zeff', title: 'Estimate Z_eff', gen: function (b, r) {
      b = cl(b); var z, a, s, c;
      if (b === 1) { z = pick(r, [3, 11, 19]); a = A(z);
        return { type: 'num', itemType: 'picture', prompt: 'The picture shows ' + a.name + ' (Z = ' + z + '). Z_eff is Z minus the core electrons. What is Z_eff for ' + a.name + '?', pic: onePic(z), answer: a.zeff, unit: '', p: { z: z },
          hint: HINT_ZEFF, worked: z + ' − ' + a.core + ' = ' + a.zeff + '.' }; }
      if (b === 2) { z = pick(r, RANGE(11, 16)); a = A(z);
        return { type: 'num', itemType: 'word', prompt: 'Estimate Z_eff for ' + a.name + ' (Z = ' + z + ', rings of ' + ringsText(a) + ').', answer: a.zeff, unit: '', p: { z: z },
          hint: HINT_ZEFF + ' First find the core electrons.', worked: 'Core = ' + a.core + '. Z_eff = ' + z + ' − ' + a.core + ' = ' + a.zeff + '.' }; }
      if (r() < 0.5) { z = pick(r, RANGE(3, 20)); a = A(z);
        return { type: 'num', itemType: 'word', prompt: 'Estimate Z_eff for ' + a.name + ' (Z = ' + z + ').', answer: a.zeff, unit: '', p: { z: z },
          hint: HINT_ZEFF + ' Core electrons are all but the outer ring.', worked: 'Rings: ' + ringsText(a) + '. Core = ' + a.core + '. Z_eff = ' + z + ' − ' + a.core + ' = ' + a.zeff + '.' }; }
      z = pick(r, RANGE(11, 18)); a = A(z);
      s = shuffle(r, RANGE(11, 18).filter(function (q) { return q !== z; })).slice(0, 3);
      c = choice(r, cap(a.name), s.map(function (q) { return cap(NAME[q]); }));
      return { type: 'choice', itemType: 'backward', prompt: 'An atom in period 3 has Z_eff = ' + a.zeff + '. Which atom is it?', options: c.options, answer: c.answer, p: { z: z },
        hint: 'In period 3 every atom has 10 core electrons. Z_eff = Z − 10.', worked: 'Z_eff = Z − 10, so Z = ' + a.zeff + ' + 10 = ' + z + ': ' + a.name + '.' };
    } },
    { id: 'pull', title: 'Which holds its outer electron harder', gen: function (b, r) {
      b = cl(b); var pr = pairFor(r, b), x = pr[0], y = pr[1], ax = A(x), ay = A(y), w = harder(x, y), win = w === 'a' ? x : y, c;
      c = choice(r, cap(NAME[win]), [cap(NAME[win === x ? y : x]), 'They hold it equally']);
      var item = { type: 'choice', itemType: b === 1 ? 'picture' : 'word', options: c.options, answer: c.answer, p: { a: x, b: y }, hint: 'Find Z_eff and the ring number for each atom. Then compare.', worked: reasonFor(x, y) };
      if (b === 1) { item.pic = pairPic(x, y); item.prompt = 'Each atom has one outer electron. Which atom holds its outer electron harder, ' + NAME[x] + ' (left) or ' + NAME[y] + ' (right)?'; }
      else if (b === 2) item.prompt = 'Which atom holds its outer electron harder, ' + NAME[x] + ' (Z = ' + x + ') or ' + NAME[y] + ' (Z = ' + y + ')? Find Z_eff for each.';
      else item.prompt = 'Which atom holds its outer electron harder, ' + NAME[x] + ' (Z = ' + x + ') or ' + NAME[y] + ' (Z = ' + y + ')? Use Z_eff and the outer ring number.';
      return item;
    } }
  ];

  /* ---------- the Explore pair (one pull-meter run): the pair, what the meter will show, and the line that explains it ---------- */
  function pairSpec(n, band, seed) {
    var s = (Math.imul(seed | 0, 2654435761) ^ Math.imul(n + 1, 40503)) >>> 0, r = function () { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
    var pr = pairFor(r, band), a = A(pr[0]), b = A(pr[1]);
    return { a: pr[0], b: pr[1], band: cl(band), answer: harder(pr[0], pr[1]), zeffA: a.zeff, zeffB: b.zeff, coreA: a.core, coreB: b.core, nA: a.n, nB: b.n, pullA: Z.frac(a), pullB: Z.frac(b), reason: reasonFor(pr[0], pr[1]) };
  }

  /* ---------- Warm-up: three easy review items, with pictures (earlier lessons only) ---------- */
  var warmup = [
    { id: 'W1', band: 1, prompt: 'How many electrons are in the outer ring of this sodium atom?', pic: onePic(11), answer: 1, pattern: 'Valence electrons: the outer ring (slot 10)' },
    { id: 'W2', band: 1, prompt: 'How many core electrons does this sodium atom have?', pic: onePic(11), answer: 10, pattern: 'Core electrons: every electron not in the outer ring (slot 10)' },
    { id: 'W3', band: 1, prompt: 'The distance between a nucleus and an electron doubles. The pull on the electron becomes…', options: ['twice as strong', 'half as strong', 'one quarter as strong', 'the same'], answer: 2, pattern: 'Coulomb: double the distance, a quarter of the pull (slot 7)' }
  ];
  var talk = ['Sodium and lithium each have one outer electron. Why is sodium’s easier to pull off?'];   /* slot 14 Up Next; huddle talk, not a warm-up item */

  var predicts = [
    { id: 'P1', title: 'Lithium or sodium', prompt: 'Lithium and sodium each have one outer electron. Which atom holds its outer electron harder?', options: ['Lithium', 'Sodium', 'They hold it equally'], answer: 0,
      why: 'Sodium’s outer electron is in ring 3, lithium’s in ring 2. The farther electron is pulled less.' }
  ];

  /* ---------- the five moves (models) ---------- */
  var MOVES = ['Count the electrons in each ring', 'Mark the core rings', 'Z_eff = Z − core', 'Count the outer ring number, n', 'Pull = Z_eff ÷ n²'];
  function modelSteps(z) {
    var a = A(z);
    return [
      { move: 1, text: 'Rings: ' + ringsText(a) + '. Total ' + z + '.' },
      { move: 2, text: 'The outer ring (' + a.valence + ') is not core. Core = ' + a.rings.slice(0, -1).join(' + ') + ' = ' + a.core + '.' },
      { move: 3, text: 'Z_eff = ' + z + ' − ' + a.core + ' = ' + a.zeff + '.' },
      { move: 4, text: 'The outer electron is in ring ' + a.n + ', so n = ' + a.n + '.' },
      { move: 5, text: 'Pull = ' + a.zeff + ' ÷ ' + a.n + '² = ' + Z.frac(a) + '.' }
    ];
  }
  var models = [
    { id: 'M1', mode: 'watch', Z: 3, problem: 'Estimate Z_eff and the pull on the outer electron of lithium (Z = 3).', predictAnswer: 1, steps: modelSteps(3), slip: 'Counting the outer electron as core.' },
    { id: 'M2', mode: 'with-me', Z: 11, typedMoves: [2, 3], problem: 'Estimate Z_eff and the pull on the outer electron of sodium (Z = 11).', predictAnswer: 1, steps: modelSteps(11), slip: 'Using Z = 11 as the pull instead of Z − core.' },
    { id: 'M3', mode: 'you-do', Z: 17, problem: 'Estimate Z_eff and the pull on the outer electron of chlorine (Z = 17).', predictAnswer: 7, steps: modelSteps(17), slip: 'Subtracting only the 2 electrons of ring 1 and leaving out the 8 of ring 2.' }
  ];

  /* ---------- Huddle 2 crux questions: three, mirroring what Mr. D shows ---------- */
  var crux = [
    { id: 'K1', type: 'num', prompt: 'Estimate Z_eff for magnesium (Z = 12, rings of 2, 8, 2).', answer: 2, unit: '' },
    { id: 'K2', type: 'num', prompt: 'How many core electrons does potassium (Z = 19) have?', answer: 18, unit: '' },
    { id: 'K3', type: 'choice', prompt: 'Sodium and potassium each have Z_eff = 1. Which holds its outer electron harder?', options: ['Sodium', 'Potassium', 'They hold it equally'], answer: 0 }
  ];

  /* ---------- Check (exit on screen): one point each for a first-try right ---------- */
  var exit = [
    { id: 'X1', prompt: 'Estimate Z_eff for sulfur (Z = 16, rings of 2, 8, 6).', type: 'num', answer: 6 },
    { id: 'X2', prompt: 'Which atom holds its outer electron harder, magnesium or chlorine?', type: 'choice', options: ['Magnesium', 'Chlorine', 'They hold it equally'], answer: 1 },
    { id: 'X3', prompt: 'Which atom holds its outer electron harder, sodium or potassium?', type: 'choice', options: ['Sodium', 'Potassium', 'They hold it equally'], answer: 0 }
  ];
  var scoring = { perItem: 1, firstTry: true, secure: 3, developing: 2, notYet: '0-1' };

  var misconceptions = [
    { say: 'Potassium has more protons, so it holds its electron harder.', fix: 'Core electrons cancel most of the nucleus. Li, Na and K all have Z_eff = 1. Potassium’s electron is just farther away.', exposedBy: 'Explore pair Li/K: both Z_eff = 1, rings 2 and 4.' },
    { say: 'The pull is Z, the number of protons.', fix: 'The outer electron feels Z minus the core electrons, not Z.', exposedBy: 'Model M2: sodium has 11 protons and Z_eff = 1.' },
    { say: 'Atoms in the same period hold their outer electrons equally, because the electrons are in the same ring.', fix: 'Across a period the core stays the same and Z grows, so Z_eff grows by one each step.', exposedBy: 'Explore pairs in period 3 (Na/Si).' },
    { say: 'Subtract every electron except the outer one, so only ring 1 counts.', fix: 'Every inner ring is core. In sodium that is 2 + 8 = 10.', added: true, exposedBy: 'Model M3 (chlorine): 2 + 8 = 10.' }
  ];
  var background = 'This estimate lets valence electrons shield nothing, so Z_eff equals the valence count. Real Z_eff is larger and the ranking is the same. The pull number Z_eff ÷ n² is a classroom model number. Across a period it rises smoothly; measured first ionization energies dip at Al and S (B and O in period 2). That is slot 17, and no item here uses a dip pair.';

  /* ---------- Terms: who introduces each (rule 1). The test fails if a content word on a student screen is not tagged here. ---------- */
  var TERMS = [
    { term: 'ring', words: ['ring', 'rings', 'shell'], who: 'earlier lesson', slot: 7 },
    { term: 'outer electron', words: ['outer'], who: 'earlier lesson', slot: 10 },
    { term: 'core electrons', words: ['core'], who: 'earlier lesson', slot: 10 },
    { term: 'distance and pull', words: ['pull', 'pulled', 'pulls', 'distance'], who: 'earlier lesson', slot: 7 },
    { term: 'Z', words: ['z'], who: 'earlier lesson', slot: 4 },
    { term: 'effective nuclear charge (Z_eff)', words: ['z_eff', 'effective'], who: 'Mr. D', slot: 15 },
    { term: 'holds harder', words: ['harder'], who: 'Mr. D', slot: 15 },
    { term: 'pull meter', words: ['meter'], who: 'tutorial', slot: 15 }
  ];

  var pacing = { budgetMin: 42, clock: 'v3' };

  var CONTENT = { id: 'unit3-slot15', Z: Z, NAME: NAME, SYM: SYM, DIP_PAIRS: DIP_PAIRS, isDip: isDip, POOLS: POOLS, pairFor: pairFor, pairSpec: pairSpec, harder: harder, reasonFor: reasonFor,
    skills: skills, warmup: warmup, talk: talk, predicts: predicts, MOVES: MOVES, models: models, crux: crux, exit: exit, scoring: scoring, misconceptions: misconceptions,
    background: background, TERMS: TERMS, pacing: pacing, onePic: onePic, pairPic: pairPic };
  if (node) module.exports = CONTENT; else (root.DAYCARDS = root.DAYCARDS || {})[CONTENT.id] = CONTENT;
})(typeof window !== 'undefined' ? window : globalThis);
