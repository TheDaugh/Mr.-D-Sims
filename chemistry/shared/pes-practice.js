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

  function spec(n, band, seed) {
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

  var api = { spec: spec, recompute: recompute, NAME: NAME, BAND_Z: BAND_Z, CLAIMS: CLAIMS, CLAIM_OPTS: CLAIM_OPTS, rnd: rnd, hashSeed: hashSeed };
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.PESPractice = api;
})(typeof window !== 'undefined' ? window : globalThis);
