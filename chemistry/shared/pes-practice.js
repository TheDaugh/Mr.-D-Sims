/* PES practice: an endless generator, spec(n, band, seed), for the photoelectron spectroscopy lesson (slot 11).
   Every answer is computed from pes-data.js. Each item stores its parameters in p, and recompute(p) returns the
   answer again from the data, so tests can check every item without trusting the generator.
   Bands: 1 = Z 1, 2, 3, 10 with subshell tags shown; 2 = Z 1, 2, 3, 10, 12, 18 with tags removed;
          3 = the same elements, cross-element reasoning and a flawed claim to correct.
   Item shape: { n, band, type:'num'|'mcq', q, ans, unit?, opts?, hint, why, skill, p, tags }
   num: ans is a number. mcq: ans is the index of the correct option in opts. */
(function (root) {
  'use strict';

  var D = (typeof module === 'object' && module.exports) ? require('./pes-data.js') : root.PESData;

  var NAME = { 1: 'hydrogen', 2: 'helium', 3: 'lithium', 10: 'neon', 12: 'magnesium', 18: 'argon' };
  var BAND_Z = { 1: [1, 2, 3, 10], 2: [1, 2, 3, 10, 12, 18], 3: [1, 2, 3, 10, 12, 18] };
  var CLAIMS = [
    { text: 'A taller peak means the electron is held harder.', fix: 'Taller means more electrons in that subshell. Held harder means farther left, at higher binding energy.' },
    { text: 'A peak further right means the electron is held harder.', fix: 'Further right means lower binding energy: the electron is easier to knock loose.' }
  ];
  var CLAIM_OPTS = [
    'Taller means more electrons in that subshell, not held harder',
    'Taller means held harder',
    'Taller means higher photon energy',
    'Taller means fewer electrons'
  ];

  function rnd(seed) {           // mulberry32
    var t = seed >>> 0;
    return function () {
      t += 0x6D2B79F5;
      var r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }
  function pick(r, arr) { return arr[Math.floor(r() * arr.length)]; }
  function hashSeed(seed, n) { return ((Math.imul(seed | 0, 2654435761) ^ Math.imul(n + 1, 40503)) >>> 0) || 1; }
  function subsOf(Z) { return D.occupied(Z).map(function (o) { return o.sub; }); }
  function countOf(Z, sub) { var o = D.occupied(Z).filter(function (x) { return x.sub === sub; })[0]; return o ? o.count : 0; }
  function tallestSub(Z) {
    var occ = D.occupied(Z), best = -1, sub = null, tie = false;
    occ.forEach(function (o) { if (o.count > best) { best = o.count; sub = o.sub; tie = false; } else if (o.count === best) tie = true; });
    return tie ? null : sub;
  }

  /* recompute(p): the answer from the data alone. p.kind selects the question. */
  function recompute(p) {
    switch (p.kind) {
      case 'peaks':   return D.occupied(p.Z).length;
      case 'height':  return countOf(p.Z, p.sub);
      case 'tallest': return tallestSub(p.Z);
      case 'leftmost': return D.spectrum(p.Z)[0].sub;
      case 'total':   return D.occupied(p.Z).reduce(function (a, o) { return a + o.count; }, 0);
      case 'why':     return 0;                 // option 0 is the correct one (see opts)
      case 'claim':   return 0;
      default: throw new Error('unknown kind ' + p.kind);
    }
  }


  /* ================= The virtual lab's generator: spec(n, type, seed), type = 'read' | 'draw' | 'match' =================
     Item: { type, n, q, ans, tol, unit, why, hint, skill, title, p }.  p holds the parameters; labRecompute(p) returns the answer
     again from pes-data.js (the lab view: all 20 elements). Answers are typed (read), drawn (draw) or clicked on the 20-element table (match).
     read  ans: number (peak height, number of subshells) or a subshell label ('1s').  tol: absolute, 0 here.
     draw  ans: [{sub,count}] left to right (highest binding energy first).
     match ans: { Z, period, group }.
     Seeded by the student's identity + attempt number n: a seeded shuffle of every variant, then n walks it, so no variant repeats
     before the pool is used up (read 68 variants, draw 20, match 20).  hint here is general; diagnose(item, attempt) gives the specific
     one, built from the student's own answer and never from the answer itself. */
  var LAB_Z = [];
  for (var zz = 1; zz <= 20; zz++) LAB_Z.push(zz);
  var SYMBOL = D.SYMBOLS;
  var SUP = { 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶' };
  var TITLES = { read: 'Read a spectrum', draw: 'Draw the spectrum', match: 'Match a spectrum to an element' };

  function labOcc(Z) { return D.occupied(Z); }
  function configText(Z) { return labOcc(Z).map(function (o) { return o.sub + SUP[o.count]; }).join(' '); }
  function periodOf(Z) { return Math.max.apply(null, labOcc(Z).map(function (o) { return +o.sub.charAt(0); })); }
  function valenceOf(Z) {     // electrons in the last s and the last p subshell of the highest shell
    var n = periodOf(Z);
    return labOcc(Z).filter(function (o) { return +o.sub.charAt(0) === n; }).reduce(function (a, o) { return a + o.count; }, 0);
  }
  function groupOf(Z) { if (Z === 2) return 18; var v = valenceOf(Z); return v <= 2 ? v : 10 + v; }   // He is group 18 although it has 2 valence electrons
  function uniqueTallest(Z) { var occ = labOcc(Z), m = Math.max.apply(null, occ.map(function (o) { return o.count; })); return occ.filter(function (o) { return o.count === m; }).length === 1 && occ.length > 1; }

  function variants(type) {
    var out = [], Z;
    if (type === 'read') {
      for (var i = 0; i < LAB_Z.length; i++) { Z = LAB_Z[i];
        if (uniqueTallest(Z)) out.push({ kind: 'tall', Z: Z });
        if (Z > 2) out.push({ kind: 'hardest', Z: Z }, { kind: 'easiest', Z: Z });
        out.push({ kind: 'count', Z: Z }); }
    } else if (type === 'draw' || type === 'match') {
      for (var j = 0; j < LAB_Z.length; j++) out.push({ kind: type, Z: LAB_Z[j] });
    } else throw new Error('unknown type ' + type);
    return out;
  }

  function labRecompute(p) {
    var occ = labOcc(p.Z);
    switch (p.kind) {
      case 'tall': return Math.max.apply(null, occ.map(function (o) { return o.count; }));
      case 'count': return occ.length;
      case 'hardest': return D.labSpectrum(p.Z)[0].sub;
      case 'easiest': return D.labSpectrum(p.Z)[occ.length - 1].sub;
      case 'draw': return D.labSpectrum(p.Z).map(function (o) { return { sub: o.sub, count: o.count }; });
      case 'match': return { Z: p.Z, period: periodOf(p.Z), group: groupOf(p.Z) };
      default: throw new Error('unknown kind ' + p.kind);
    }
  }

  function shuffled(arr, seed, salt) {
    var r = rnd(hashSeed(seed, salt)), a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) { var k = Math.floor(r() * (i + 1)), x = a[i]; a[i] = a[k]; a[k] = x; }
    return a;
  }
  var TYPE_SALT = { read: 101, draw: 202, match: 303 };

  function labSpec(n, type, seed) {
    var pool = variants(type), perm = shuffled(pool, seed, TYPE_SALT[type]);
    // never the same Z twice in a row inside a type (same element, different question is allowed)
    var p = perm[((n % perm.length) + perm.length) % perm.length];
    var Z = p.Z, item = { type: type, n: n, p: p, skill: 'chem.pes.' + type, title: TITLES[type], tol: 0 };
    item.ans = labRecompute(p);
    if (type === 'read') {
      item.unit = p.kind === 'tall' ? 'electrons' : p.kind === 'count' ? 'subshells' : '';
      item.q = p.kind === 'tall' ? 'How many electrons are in the tallest peak of this spectrum?'
        : p.kind === 'count' ? 'How many different subshells give peaks in this spectrum?'
        : p.kind === 'hardest' ? 'Which subshell is hardest to knock loose? Type its label, such as 1s.'
        : 'Which subshell is easiest to knock loose? Type its label, such as 2p.';
      item.hint = p.kind === 'tall' ? 'Peak height counts electrons. Find the tallest bar and read its height on the left axis.'
        : p.kind === 'count' ? 'Each subshell that holds electrons gives one peak. Count the peaks, not the electrons.'
        : 'Hardest to knock loose is the highest binding energy: the left end of the axis.';
      item.why = p.kind === 'tall' ? 'The tallest peak holds ' + item.ans + ' electrons.' : p.kind === 'count' ? 'There are ' + item.ans + ' peaks.' : 'It is the ' + item.ans + ' subshell.';
    } else if (type === 'draw') {
      item.unit = '';
      item.q = 'Draw the spectrum for ' + SYMBOL[Z - 1] + ' (Z = ' + Z + '), configuration ' + configText(Z) + '. Place one bar for each subshell: order, height and label.';
      item.hint = 'One bar for each subshell, not for each electron. The bar height is how many electrons that subshell holds. Leftmost is held hardest.';
      item.why = 'The bars, left to right: ' + labOcc(Z).map(function (o) { return o.sub + ' (' + o.count + ')'; }).join(', ') + '.';
      item.config = configText(Z); item.symbol = SYMBOL[Z - 1];
    } else {
      item.unit = '';
      item.q = 'Click the element on the table that gave this spectrum, then type its period and its group.';
      item.hint = 'The heights add up to the number of electrons, which is the atomic number. The number of peaks and the last s and p heights give period and group.';
      item.why = SYMBOL[Z - 1] + ': period ' + item.ans.period + ', group ' + item.ans.group + '.';
    }
    return item;
  }

  // ---- grading ----
  function norm(s) { return String(s == null ? '' : s).trim().toLowerCase().replace(/\s+/g, ''); }
  function gradeRead(item, typed) {
    if (typeof item.ans === 'number') { var v = parseFloat(String(typed).replace(/[^0-9.\-]/g, '')); return isFinite(v) && Math.abs(v - item.ans) <= item.tol; }
    return norm(typed) === norm(item.ans);
  }
  // bars: [{sub, count}] left to right as the student placed them (empty slots already removed)
  function gradeDraw(item, bars) {
    var exp = item.ans, rows = [], ok = bars.length === exp.length;
    for (var i = 0; i < Math.max(bars.length, exp.length); i++) {
      var b = bars[i] || null, e = exp[i] || null;
      var r = { i: i, label: !!(b && e && b.sub === e.sub), height: !!(b && e && b.count === e.count) };
      r.ok = r.label && r.height; rows.push(r); if (!r.ok) ok = false;
    }
    return { ok: ok, rows: rows };
  }
  function gradeMatch(item, a) { return !!a && +a.Z === item.ans.Z && +a.period === item.ans.period && +a.group === item.ans.group; }
  function grade(item, attempt) {
    return item.type === 'read' ? gradeRead(item, attempt) : item.type === 'draw' ? gradeDraw(item, attempt).ok : gradeMatch(item, attempt);
  }

  // ---- the hint after a miss: points at the student's own data, never the answer ----
  var ORDER = ['1s', '2s', '2p', '3s', '3p', '4s'];
  function diagnose(item, attempt) {
    var exp = item.ans, Z = item.p.Z;
    if (item.type === 'draw') {
      var bars = attempt || [];
      if (!bars.length) return { code: 'empty', hint: 'You have no bars yet. Look at your Ne run: each peak was one subshell.' };
      var total = bars.reduce(function (a, b) { return a + b.count; }, 0);
      if (bars.length > exp.length && bars.every(function (b) { return b.count === 1; })) return { code: 'perElectron', hint: 'You drew ' + bars.length + ' bars of height 1. Check your Ne run: it had 3 peaks for 10 electrons. A bar is a subshell, and its height is the electron count.' };
      var subs = bars.map(function (b) { return b.sub; });
      var want = exp.map(function (e) { return e.sub; });
      var want = exp.map(function (e) { return e.sub; });
      if (bars.length > 1 && subs.join() === want.slice().reverse().join()) return { code: 'axisUp', hint: 'Your bars run the other way. On the AP axis binding energy gets smaller to the right, as on your Li run. The 1s peak was at the left edge.' };
      var ia = subs.indexOf('2p'), ib = subs.indexOf('2s');
      if (ia >= 0 && ib >= 0 && ia < ib) return { code: 'p2Left', hint: 'Your 2p bar sits left of your 2s bar. Look at the real Ne run: which of 2s and 2p was held harder, and so sat further left?' };
      var byHeight = bars.slice().sort(function (a, b) { return b.count - a.count; }).map(function (b) { return b.sub; });
      if (bars.length > 1 && subs.join() === byHeight.join() && subs.join() !== exp.map(function (e) { return e.sub; }).join()) return { code: 'tallEnergy', hint: 'Your bars are in order of height. Height counts electrons; it does not say how hard they are held. Order them by binding energy instead: look at your Mg run.' };
      if (total !== Z) return { code: 'total', hint: 'Your heights add up to ' + total + ' electrons. This atom has ' + Z + '. Check the configuration: each exponent is a bar height.' };
      if (bars.length !== exp.length) return { code: 'count', hint: 'You placed ' + bars.length + ' bars. Count the subshells in the configuration: each one is a bar.' };
      return { code: 'label', hint: 'The heights and the order can be right while a label is wrong. Read your bars against the configuration, left to right.' };
    }
    if (item.type === 'read') {
      var s = String(attempt == null ? '' : attempt).trim();
      if (item.p.kind === 'hardest' && /^(2s|2p|3s|3p|4s)$/i.test(s)) return { code: 'notLeft', hint: 'You typed ' + s + '. Binding energy runs high to low from left to right. Which peak is at the left end, and which subshell was at the left end in your Ne run?' };
      if (item.p.kind === 'easiest' && s.toLowerCase() === '1s') return { code: 'notRight', hint: 'You typed 1s. That is the peak held hardest. Look at the other end of the axis, where the electrons are easiest to knock loose.' };
      if (item.p.kind === 'hardest' && /^\d+$/.test(s)) return { code: 'tallEnergy', hint: 'You typed a number. Name a subshell. Height counts electrons; position on the axis shows how hard they are held.' };
      if (item.p.kind === 'tall') return { code: 'height', hint: 'Read the height of the tallest bar on the left axis. One electron is one unit of height; check it against the Ne run, where 2p stood 6 tall.' };
      if (item.p.kind === 'count') return { code: 'peaks', hint: 'You counted ' + s + '. Count the bars, not the electrons: Ne gave 3 bars for its 10 electrons.' };
      return { code: 'generic', hint: item.hint };
    }
    var a = attempt || {};
    if (!a.Z) return { code: 'noPick', hint: 'Click an element on the table first.' };
    if (+a.Z !== item.ans.Z) {
      var pickN = D.occupied(+a.Z).length, sumH = Z;
      if (pickN !== labOcc(Z).length) return { code: 'peakCount', hint: 'The element you clicked gives ' + pickN + ' peaks. Count the peaks in this spectrum and compare.' };
      return { code: 'heights', hint: 'The element you clicked has ' + (+a.Z) + ' electrons. Add up the peak heights in this spectrum and compare.' };
    }
    if (+a.period !== item.ans.period) return { code: 'period', hint: 'Your element is right. Period is the number of shells in use: the highest first number among the peaks.' };
    return { code: 'group', hint: 'Your element is right. Group comes from the valence electrons: add the last s height and the last p height. Groups 13 to 18 add 10.' };
  }

  // the three misreads the lab teaches against, for the teacher key: code -> what the hint targets
  var MISREADS = [
    { code: 'perElectron', wrong: 'One bar per electron', targets: 'Counts the Ne run: three peaks for ten electrons; a bar is a subshell and its height is the count.' },
    { code: 'p2Left', wrong: '2p drawn left of 2s', targets: 'Sends the student to the real Ne run to compare the positions of 2s and 2p.' },
    { code: 'tallEnergy', wrong: 'Taller means higher energy', targets: 'Height counts electrons; order the bars by binding energy; points at the Mg run.' },
    { code: 'axisUp', wrong: 'Axis read as increasing', targets: 'The AP axis falls to the right; points at the Li run where 1s sits at the left edge.' },
    { code: 'sameOneS', wrong: 'Same 1s energy for every element', targets: 'Part C and the match type: 1s moves left as protons are added; compare the 1s positions in the runs.' }
  ];

  function spec(n, band, seed) {
    if (typeof band === 'string') return labSpec(n, band, seed);
    var b = band <= 1 ? 1 : (band >= 3 ? 3 : 2);
    var r = rnd(hashSeed(seed, n));
    var zs = BAND_Z[b];
    var kinds = b === 1 ? ['peaks', 'height', 'tallest'] :
                b === 2 ? ['peaks', 'height', 'leftmost', 'tallest', 'total'] :
                          ['why', 'claim', 'total', 'height'];
    var kind = pick(r, kinds), Z, item = { n: n, band: b, skill: 'chem.pes.' + kind, tags: b === 1 };

    if (kind === 'peaks' || kind === 'total') {
      Z = pick(r, zs);
      item.p = { kind: kind, Z: Z };
      item.type = 'num';
      item.unit = kind === 'peaks' ? 'peaks' : 'electrons';
      item.q = kind === 'peaks'
        ? 'How many peaks does ' + NAME[Z] + ' give in its spectrum? One peak for each subshell that has electrons.'
        : 'How many electrons does ' + NAME[Z] + ' have in all of its peaks together?';
      item.hint = kind === 'peaks' ? 'Count the subshells that have electrons: 1s, then 2s, 2p, 3s, 3p.' : 'Add the peak heights, or use the atomic number.';
      item.why = kind === 'peaks' ? NAME[Z] + ' has ' + D.occupied(Z).length + ' occupied subshells, so ' + D.occupied(Z).length + ' peaks.' : 'Neutral atoms have as many electrons as protons: ' + Z + '.';
      item.ans = recompute(item.p);
      if (b === 1) item.tagList = subsOf(Z).join(', ');
      return item;
    }
    if (kind === 'height') {
      Z = pick(r, zs);
      var sub = pick(r, subsOf(Z));
      item.p = { kind: kind, Z: Z, sub: sub };
      item.type = 'num';
      item.unit = 'electrons';
      item.q = 'How many electrons are in the ' + sub + ' peak of ' + NAME[Z] + '?';
      item.hint = 'Peak height is the number of electrons in that subshell.';
      item.why = 'The ' + sub + ' peak of ' + NAME[Z] + ' is ' + countOf(Z, sub) + ' electrons tall.';
      item.ans = recompute(item.p);
      if (b === 1) item.tagList = subsOf(Z).join(', ');
      return item;
    }
    if (kind === 'tallest') {
      Z = pick(r, zs.filter(function (z) { return z !== 18 && z > 2; }));   // one-peak atoms have no choice; argon's 2p and 3p tie
      var opts = subsOf(Z);
      item.p = { kind: kind, Z: Z };
      item.type = 'mcq';
      item.q = 'Which peak of ' + NAME[Z] + ' is the tallest?';
      item.opts = opts.map(function (s) { return s + ' (' + countOf(Z, s) + ' electrons)'; });
      item.ans = opts.indexOf(recompute(item.p));
      item.hint = 'Tallest means the most electrons. Compare the subshell counts.';
      item.why = 'The ' + recompute(item.p) + ' peak is tallest: ' + countOf(Z, recompute(item.p)) + ' electrons.';
      if (b === 1) item.tagList = subsOf(Z).join(', ');
      return item;
    }
    if (kind === 'leftmost') {
      Z = pick(r, zs.filter(function (z) { return z > 2; }));   // needs at least two peaks to choose between
      var ops = subsOf(Z);
      item.p = { kind: kind, Z: Z };
      item.type = 'mcq';
      item.q = 'On the page, which peak of ' + NAME[Z] + ' sits furthest left?';
      item.opts = ops.slice();
      item.ans = ops.indexOf(recompute(item.p));
      item.hint = 'Left means higher binding energy: the electron that is hardest to knock loose.';
      item.why = 'The 1s electrons of every atom are held hardest, so the 1s peak is furthest left.';
      return item;
    }
    if (kind === 'why') {
      var pair = [pick(r, [3, 10, 12, 18, 2]), 0];
      var lo = pick(r, [1, 2, 3, 10, 12].filter(function (z) { return z < pair[0]; }));
      item.p = { kind: 'why', hi: pair[0], lo: lo };
      item.type = 'mcq';
      item.q = 'Why is the 1s peak of ' + NAME[pair[0]] + ' further left (held harder) than the 1s peak of ' + NAME[lo] + '?';
      item.opts = [
        'More protons pull the 1s electrons harder',
        'Lighter atoms have more electrons per peak',
        'The 1s peak is taller in ' + NAME[pair[0]],
        'The electrons are farther from the nucleus in ' + NAME[pair[0]]
      ];
      item.ans = 0;
      item.hint = 'Compare the nuclear charge of the two atoms.';
      item.why = NAME[pair[0]] + ' has ' + pair[0] + ' protons and ' + NAME[lo] + ' has ' + lo + '. More positive charge pulls the 1s electrons harder.';
      return item;
    }
    // kind === 'claim': a flawed claim to correct
    var c = pick(r, CLAIMS);
    item.p = { kind: 'claim', text: c.text };
    item.type = 'mcq';
    item.q = 'A classmate says: "' + c.text + '" Which correction is right?';
    item.opts = CLAIM_OPTS.slice();
    item.ans = 0;
    item.hint = 'Height is a count of electrons. Position is how hard the electron is held.';
    item.why = c.fix;
    return item;
  }

  var api = { labSpec: labSpec, labRecompute: labRecompute, variants: variants, grade: grade, gradeRead: gradeRead, gradeDraw: gradeDraw, gradeMatch: gradeMatch, diagnose: diagnose, MISREADS: MISREADS, configText: configText, periodOf: periodOf, groupOf: groupOf, valenceOf: valenceOf, LAB_Z: LAB_Z, TYPES: ['read', 'draw', 'match'], spec: spec, recompute: recompute, NAME: NAME, BAND_Z: BAND_Z, CLAIMS: CLAIMS, CLAIM_OPTS: CLAIM_OPTS, rnd: rnd, hashSeed: hashSeed };
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.PESPractice = api;
})(typeof window !== 'undefined' ? window : globalThis);
