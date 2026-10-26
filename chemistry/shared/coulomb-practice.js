/* CoulombPractice: every number in the Coulomb's law lesson (Unit 3, Slot 7) comes from this file, so one test can recompute them all.
     CoulombPractice.force(q1, q2, r)        sim force in "units": 36 × |q1·q2| / r²   (1 unit-charge pair at distance 1 = 36 units)
     CoulombPractice.factor(a, b, c)         exact fraction {n,d}: how the force scales when q1 × a, q2 × b, distance × c (each a number or [n,d])
     CoulombPractice.pull(Z, n)              fraction {n,d}: pull on a one-electron ion's electron in shell n, relative to H shell 1.
                                             Model: shell n sits n² times as far out as shell 1 (Bohr spacing), same shell-1 distance for every ion.
     CoulombPractice.CHECK                   the 8 Push and Pull check items, each option tagged ok | lin | inv | invsq | other
     CoulombPractice.route(answers)          { right, tags:{lin,inv,invsq,other}, route:'scaf'|'std'|'fluent' }
     CoulombPractice.SIMPLE                  the six simple questions (placeholders until the approved spec is supplied)
     CoulombPractice.closing(slot, band)     the closing ladder: 4 slots of numbers, bands 1 to 4
     CoulombPractice.spec(n, band, seed)     endless practice { type:'num', q, ans, tol, unit, why, hint, skill, title, band }
   Proportions only: nothing here uses Coulomb's constant k. */
(function (root) {
  'use strict';
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a || 1; }
  function F(n, d) { if (d === undefined) d = 1; if (d < 0) { n = -n; d = -d; } var g = gcd(n, d); return { n: n / g, d: d / g }; }
  function toF(x) { return Array.isArray(x) ? F(x[0], x[1]) : F(x, 1); }
  function factor(a, b, c) { a = toF(a); b = toF(b); c = toF(c); return F(a.n * b.n * c.d * c.d, a.d * b.d * c.n * c.n); }
  function val(f) { return f.n / f.d; }
  function force(q1, q2, r) { return 36 * Math.abs(q1 * q2) / (r * r); }
  function pull(Z, n) { return F(Z, Math.pow(n, 4)); }
  var fmt = function (f) { return f.d === 1 ? String(f.n) : f.n + "/" + f.d; };

  /* ---------- the Push and Pull check ---------- */
  var mc = function (id, skill, q, opts) { return { id: id, kind: 'mcq', skill: skill, q: q, opts: opts }; };
  var o = function (t, tag) { return { t: t, tag: tag }; };
  var CHECK = [
    mc('c1', 'chem.coulomb.distance', 'Two charged particles sit 1 cm apart and pull on each other. Move them to <b>2 cm</b> apart. The force becomes:',
      [o('4 times as big', 'other'), o('2 times as big', 'lin'), o('the same', 'other'), o('½ as big', 'inv'), o('¼ as big', 'ok')]),
    mc('c2', 'chem.coulomb.distance', 'Same pair, now moved from 1 cm to <b>3 cm</b> apart. The force becomes:',
      [o('3 times as big', 'lin'), o('⅓ as big', 'inv'), o('1⁄9 as big', 'ok'), o('1⁄6 as big', 'other'), o('9 times as big', 'other')]),
    mc('c3', 'chem.coulomb.distance', 'Two charges are 4 cm apart. Move them to <b>2 cm</b> apart (half the distance). The force becomes:',
      [o('½ as big', 'lin'), o('2 times as big', 'inv'), o('4 times as big', 'ok'), o('¼ as big', 'other'), o('the same', 'other')]),
    mc('c4', 'chem.coulomb.charge', 'Same distance. The charge on <b>one</b> particle is doubled. The force becomes:',
      [o('4 times as big', 'other'), o('2 times as big', 'ok'), o('½ as big', 'inv'), o('¼ as big', 'invsq'), o('the same', 'other')]),
    mc('c5', 'chem.coulomb.charge', 'Same distance. The charge on <b>one</b> particle is tripled. The force becomes:',
      [o('9 times as big', 'other'), o('3 times as big', 'ok'), o('⅓ as big', 'inv'), o('1⁄9 as big', 'invsq'), o('6 times as big', 'other')]),
    mc('c6', 'chem.coulomb.combined', 'Same distance. The charge on <b>both</b> particles is doubled. The force becomes:',
      [o('8 times as big', 'other'), o('4 times as big', 'ok'), o('2 times as big', 'lin'), o('½ as big', 'inv'), o('the same', 'other')]),
    { id: 'c7', kind: 'table', skill: 'chem.coulomb.distance', q: 'The force is <b>36</b> units when the distance is 1. Fill in the force at each new distance. Charges stay the same.',
      cols: [{ lab: 'distance 2', ans: 9 }, { lab: 'distance 3', ans: 4 }, { lab: 'distance 6', ans: 1 }], base: 36 },
    { id: 'c8', kind: 'table', skill: 'chem.coulomb.charge', q: 'Charges +1 and +1 give a force of <b>6</b> units at a fixed distance. Fill in the force for each new pair at that same distance.',
      cols: [{ lab: '+2 and +1', ans: 12 }, { lab: '+1 and +3', ans: 18 }, { lab: '+2 and +3', ans: 36 }], base: 6 }
  ];

  /* A table answer is tagged by the guess it reveals. Linear: the force grows with distance, or steps down by equal amounts. */
  function tagTable(item, vals) {
    var a = item.cols.map(function (c) { return c.ans; });
    var ok = vals.every(function (v, i) { return Math.abs(v - a[i]) < 0.011; });
    if (ok) return 'ok';
    if (item.id === 'c7') {
      if (vals[0] > item.base) return 'lin';
      if (vals[0] < item.base && Math.abs((item.base - vals[0]) - (vals[0] - vals[1])) < 1e-9 && vals[0] !== a[0] && vals[0] !== 18) return 'lin';
      if (Math.abs(vals[0] - 18) < 0.011 || Math.abs(vals[1] - 12) < 0.011) return 'inv';
      return 'other';
    }
    if (Math.abs(vals[0] - item.base / 2) < 0.011 || Math.abs(vals[0] - item.base / 4) < 0.011) return 'invsq';
    return 'other';
  }

  /* answers: { c1: "<option text>", ..., c7: [9,4,1], c8: [...] } -> right, tags, route */
  function route(answers) {
    var right = 0, tags = { lin: 0, inv: 0, invsq: 0, other: 0 };
    CHECK.forEach(function (it) {
      var a = answers[it.id], tag;
      if (a == null) { tag = 'other'; }
      else if (it.kind === 'mcq') { var op = it.opts.find(function (x) { return x.t === a; }); tag = op ? op.tag : 'other'; }
      else tag = tagTable(it, a);
      if (tag === 'ok') right++; else tags[tag]++;
    });
    var r = (tags.lin >= 2 || right <= 3) ? 'scaf' : (right >= 7 && tags.lin === 0) ? 'fluent' : 'std';
    return { right: right, tags: tags, route: r };
  }

  /* ---------- the six simple questions (one idea each, before the sim) ---------- */
  var SIMPLE = [
    { id: 's1', q: 'Which pair of particles <b>attracts</b>?', opts: [['two protons', 0], ['two electrons', 0], ['a proton and an electron', 1], ['two neutrons', 0]], why: 'Opposite charges attract. A proton is +, an electron is −.', hint: 'Opposite signs pull together.' },
    { id: 's2', q: 'The nucleus holds the protons and the neutrons. What is its overall charge?', opts: [['positive', 1], ['negative', 0], ['zero', 0]], why: 'Protons are + and neutrons have no charge, so the nucleus is +.', hint: 'Neutrons add no charge. What do the protons add?' },
    { id: 's3', q: 'Two electrons are close together. They…', opts: [['attract each other', 0], ['repel each other', 1], ['do nothing to each other', 0]], why: 'Like charges repel. Both electrons are −.', hint: 'Same sign on both.' },
    { id: 's4', q: 'Coulomb’s law: when two charges are pulled <b>farther apart</b>, the force between them gets…', opts: [['stronger', 0], ['weaker', 1], ['no different', 0]], why: 'More distance, less force. The sim will show how much less.', hint: 'Think of two magnets pulled apart.' },
    { id: 's5', q: 'Coulomb’s law: when the charge on one particle gets <b>bigger</b>, the force between them gets…', opts: [['stronger', 1], ['weaker', 0], ['no different', 0]], why: 'More charge, more force.', hint: 'A bigger charge pulls or pushes harder.' },
    { id: 's6', q: '“Double” means ×2. A force of 10 units doubles. What is the new force?', num: 20, unit: 'units', why: '10 × 2 = 20.', hint: 'Multiply by 2.' }
  ];

  /* ---------- the closing ladder: 4 numeric slots, 4 bands each ---------- */
  function closing(slot, band) {
    var B = Math.max(1, Math.min(4, band | 0)), s, f;
    var mk = function (q, f, unit, why, hint, skill, title) { return { type: 'num', q: q, ans: Math.round(val(f) * 1e4) / 1e4, tol: 0.001, unit: unit, why: why, hint: hint, skill: skill, title: title, band: B }; };
    if (slot === 1) { // shells
      s = ['chem.coulomb.shell', 'The shell model'];
      if (B === 1) { f = factor(1, 1, 2); return mk('Electron A is <b>2 times as far</b> from the nucleus as electron B, in the same atom. A is pulled with what fraction of B’s pull?', f, 'of B’s pull', 'Distance × 2 means force × 1⁄4, so A is pulled with ¼ of B’s pull.', 'Double the distance, quarter the force.', s[0], s[1]); }
      if (B === 2) { f = pull(1, 2); return mk('In a one-electron ion, shell 2 sits <b>4 times as far</b> out as shell 1. The shell 2 electron is pulled with what fraction of the shell 1 electron’s pull? (A decimal is fine.)', f, 'of the shell 1 pull', 'Distance × 4 means force × 1⁄16 = 0.0625.', 'Quadruple the distance: divide the force by 4 × 4.', s[0], s[1]); }
      if (B === 3) { f = F(2, 1); return mk('He⁺ (nucleus +2) and H (nucleus +1) both have one electron in shell 1, at the same distance. The He⁺ electron is pulled how many times as hard as the H electron?', f, '×', 'Charge × 2 at the same distance means force × 2.', 'Same distance, so only the nuclear charge changes.', s[0], s[1]); }
      f = F(3 * 81, 1); return mk('Compare the Li²⁺ electron in shell 1 (nucleus +3) with the H electron in shell 3 (nucleus +1). Shell 3 is <b>9 times as far</b> out as shell 1. The Li²⁺ electron is pulled how many times as hard?', f, '×', 'Charge: × 3. Distance: 9 times closer means × 81. Together 3 × 81 = 243.', 'Two changes multiply: one for charge, one for distance.', s[0], s[1]);
    }
    if (slot === 2) { // combined changes on a base force
      s = ['chem.coulomb.combined', 'Two changes at once'];
      if (B === 1) { f = F(24, 1); return mk('The force between two charges is 12 units. One charge doubles. What is the new force?', f, 'units', '12 × 2 = 24.', 'Double a charge, double the force.', s[0], s[1]); }
      if (B === 2) { f = F(4, 1); return mk('The force is 36 units. The distance triples. What is the new force?', f, 'units', 'Distance × 3 means force ÷ 9. 36 ÷ 9 = 4.', 'Triple the distance: divide by 3 × 3.', s[0], s[1]); }
      if (B === 3) { f = F(36, 1); return mk('The force is 48 units. The distance doubles <b>and</b> one charge triples. What is the new force?', f, 'units', 'Distance × 2: ÷ 4. Charge × 3: × 3. 48 ÷ 4 × 3 = 36.', 'Find the factor for each change, then multiply them.', s[0], s[1]); }
      f = F(32, 1); return mk('The force is 40 units. The distance becomes 5 times as big, one charge doubles, and the other charge becomes 10 times as big. What is the new force?', f, 'units', 'Distance × 5: ÷ 25. Charges: × 2 × 10 = × 20. 40 × 20 ÷ 25 = 32.', 'Charges multiply, distance divides by its square.', s[0], s[1]);
    }
    if (slot === 3) { // transfer with units
      s = ['chem.coulomb.combined', 'Using the proportion on a real pair'];
      if (B === 1) { f = F(1, 10); return mk('Two charged balloons 30 cm apart push on each other with 0.4 N. Moved to 60 cm apart, what is the push?', f, 'N', 'Distance × 2 gives ÷ 4. 0.4 ÷ 4 = 0.1 N.', 'Double the distance, quarter the force.', s[0], s[1]); }
      if (B === 2) { f = F(1, 10); return mk('A rubbed rod pulls a bit of tape with 0.9 N at 2 cm. Moved to 6 cm away, what is the pull?', f, 'N', 'Distance × 3 gives ÷ 9. 0.9 ÷ 9 = 0.1 N.', 'Triple the distance: divide by 9.', s[0], s[1]); }
      if (B === 3) { f = F(1, 2); return mk('Two charged spheres 15 cm apart push on each other with 8.0 N. They are moved to <b>0.60 m</b> apart. What is the force?', f, 'N', '0.60 m is 60 cm, which is 4 times 15 cm. Force ÷ 16: 8.0 ÷ 16 = 0.50 N.', 'Put both distances in the same unit first.', s[0], s[1]); }
      f = F(1, 4); return mk('Two charged spheres 15 cm apart push on each other with 8.0 N. They are moved to <b>0.60 m</b> apart and the charge on one sphere is cut to <b>half</b>. What is the force?', f, 'N', 'Distance × 4: ÷ 16 gives 0.50 N. Half a charge: ÷ 2 gives 0.25 N.', 'Same unit first, then one factor for distance and one for charge.', s[0], s[1]);
    }
    if (slot === 4) { // reverse: find the factor
      s = ['chem.coulomb.combined', 'Working backward'];
      if (B === 1) { f = F(2, 1); return mk('The force fell to ¼ of its old value because the distance changed. The distance became how many times as big?', f, '×', '¼ = 1 ÷ (2 × 2), so the distance doubled.', 'What number times itself is 4?', s[0], s[1]); }
      if (B === 2) { f = F(3, 1); return mk('The force fell to 1⁄9 of its old value because the distance changed. The distance became how many times as big?', f, '×', '9 = 3 × 3, so the distance tripled.', 'What number times itself is 9?', s[0], s[1]); }
      if (B === 3) { f = F(5, 1); return mk('The force fell to 1⁄25 of its old value because the distance changed. The distance became how many times as big?', f, '×', '25 = 5 × 5, so the distance became 5 times as big.', 'What number times itself is 25?', s[0], s[1]); }
      f = F(4, 1); return mk('The distance between two charges is doubled, yet the force does not change. One charge is multiplied by what number to make that happen?', f, '×', 'Doubling the distance divides the force by 4. A charge × 4 multiplies it by 4. Net: no change.', 'Distance ×2 costs a factor of 4. What factor of charge pays it back?', s[0], s[1]);
    }
    return null;
  }

  /* Named wrong answers for new = base × a × b ÷ c²: the inverse guess, the linear guess, and "forgot to square". */
  function trapsFor(p) {
    if (!p || p.back) return [];
    var a = p.a, b = p.b, c = p.c, N = function (x) { return Array.isArray(x) ? x[0] / x[1] : x; }, k = N(p.a) * N(p.b), cc = N(c), t = [];
    if (cc !== 1) {
      t.push({ v: p.base * k / cc, msg: 'That divides by the distance factor itself. Distance works squared.' });
      t.push({ v: p.base * k * cc, msg: 'That makes the force grow with distance. A bigger distance means a weaker force.' });
      t.push({ v: p.base * k * cc * cc, msg: 'That goes the wrong way. A bigger distance divides the force.' });
    }
    return t.filter(function (x) { return Math.abs(x.v - p.base * k / (cc * cc)) > 0.011; });
  }

  /* Extension items (for students who sail through): a lithium-style outer electron, with the inner electrons shielding fully.
     The "net charge" is Z minus the inner electrons. Real Z_eff values come in slot 15. */
  function extension(k) {
    if (k === 1) { var f = F(1, 16); return { type: 'num', q: 'A lithium atom has a +3 nucleus and 2 inner electrons. Treat the 2 inner electrons as cancelling 2 of the 3 protons for the outer electron. The outer electron is in shell 2, which is 4 times as far out as shell 1. Its pull is what fraction of an H atom’s shell 1 electron? (A decimal is fine.)', ans: val(f), tol: 0.001, unit: 'of the H shell 1 pull', why: 'Net charge 3 − 2 = +1, same as H. Distance 4 times as far: ÷ 16. So 1⁄16 = 0.0625.', hint: 'First find the charge the outer electron feels. Then apply the distance.', skill: 'chem.coulomb.shell', title: 'Shielding preview', band: 4 }; }
    var g = F(1, 81); return { type: 'num', q: 'A sodium atom has a +11 nucleus and 10 inner electrons. Treat them as cancelling 10 protons for the outer electron, which sits in shell 3, 9 times as far out as shell 1. Its pull is what fraction of an H atom’s shell 1 electron? (A decimal is fine.)', ans: Math.round(val(g) * 1e4) / 1e4, tol: 0.001, unit: 'of the H shell 1 pull', why: 'Net charge 11 − 10 = +1. Distance 9 times as far: ÷ 81. So 1⁄81 ≈ 0.0123.', hint: 'Net charge first, then distance.', skill: 'chem.coulomb.shell', title: 'Shielding preview', band: 4 };
  }

  /* ---------- endless practice ---------- */
  function seeded(seed) { var x = 2166136261; seed = String(seed); for (var i = 0; i < seed.length; i++) { x ^= seed.charCodeAt(i); x = Math.imul(x, 16777619); } var a = x >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function spec(n, band, seed) {
    var r = seeded(seed + '|' + n + '|' + band), pick = function (a) { return a[Math.floor(r() * a.length)]; }, B = Math.max(1, Math.min(4, band | 0));
    var q, f, base, unit, why, hint, title, skill;
    if (B === 1) {
      var kind = pick(['charge', 'dist']);
      if (kind === 'charge') { var m = pick([2, 3, 4]); base = pick([5, 6, 8, 10, 12, 15]); f = F(m, 1); title = 'One charge changes'; skill = 'chem.coulomb.charge'; unit = 'units'; q = 'The force between two charges is ' + base + ' units. One charge is multiplied by ' + m + '. What is the new force?'; why = 'Force × ' + m + ': ' + base + ' × ' + m + ' = ' + base * m + '.'; hint = 'A bigger charge means a proportionally bigger force.'; return pack(base * m, { base: base, a: m, b: 1, c: 1 }); }
      var c = pick([2, 3]); base = c * c * pick([2, 3, 4, 5]); f = F(1, c * c); title = 'Distance changes'; skill = 'chem.coulomb.distance'; unit = 'units';
      q = 'The force between two charges is ' + base + ' units. The distance becomes ' + (c === 2 ? 'double' : 'triple') + '. What is the new force?'; why = 'Distance × ' + c + ' means force ÷ ' + c * c + '. ' + base + ' ÷ ' + c * c + ' = ' + base / (c * c) + '.'; hint = 'Divide by the distance factor squared.'; return pack(base / (c * c), { base: base, a: 1, b: 1, c: c });
    }
    if (B === 2) {
      var c2 = pick([2, 3, 4, 5]), toward = r() < .35; base = pick([1, 2, 3]) * (toward ? 1 : c2 * c2) * pick([1, 2, 3, 4]); title = 'Distance changes'; skill = 'chem.coulomb.distance'; unit = 'units';
      if (toward) { var d0 = c2 * pick([1, 2]); q = 'Two charges ' + d0 + ' cm apart pull with ' + base + ' units of force. Moved to ' + d0 / c2 + ' cm apart, what is the force?'; var ans = base * c2 * c2; why = 'Distance ÷ ' + c2 + ' means force × ' + c2 * c2 + '. ' + base + ' × ' + c2 * c2 + ' = ' + ans + '.'; hint = 'Closer means stronger: multiply by the factor squared.'; f = F(c2 * c2, 1); return pack(ans, { base: base, a: 1, b: 1, c: 1 / c2 }); }
      var d1 = pick([1, 2, 3]); q = 'Two charges ' + d1 + ' cm apart push with ' + base + ' units of force. Moved to ' + d1 * c2 + ' cm apart, what is the force?'; why = 'Distance × ' + c2 + ' means force ÷ ' + c2 * c2 + '. ' + base + ' ÷ ' + c2 * c2 + ' = ' + base / (c2 * c2) + '.'; hint = 'Divide by the distance factor squared.'; f = F(1, c2 * c2); return pack(base / (c2 * c2), { base: base, a: 1, b: 1, c: c2 });
    }
    if (B === 3) {
      var cd = pick([2, 3, 4]), a = pick([2, 3, 4]), b = pick([1, 2, 3]); f = factor(a, b, cd); base = f.d * pick([1, 2, 3, 4, 5]) * (r() < .5 ? 1 : 2); title = 'Two or three changes'; skill = 'chem.coulomb.combined'; unit = 'units';
      q = 'The force is ' + base + ' units. The distance becomes ' + cd + ' times as big, one charge is × ' + a + (b > 1 ? ', and the other charge is × ' + b : '') + '. What is the new force?';
      var ans3 = base * f.n / f.d; why = 'Factors: charges × ' + a * b + ', distance ÷ ' + cd * cd + '. ' + base + ' × ' + a * b + ' ÷ ' + cd * cd + ' = ' + ans3 + '.'; hint = 'Charges multiply the force. Distance divides it by its square.'; return pack(ans3, { base: base, a: a, b: b, c: cd });
    }
    var t4 = pick(['shell', 'units', 'back']);
    if (t4 === 'shell') {
      var Z1 = pick([2, 3]), n1 = 1, n2 = pick([2, 3]); f = F(Z1 * Math.pow(n2, 4), 1); title = 'Shells and charge'; skill = 'chem.coulomb.shell'; unit = '×';
      q = 'One-electron ions: an electron in shell 1 of an ion with nucleus +' + Z1 + ', and an electron in shell ' + n2 + ' of H (nucleus +1). Shell ' + n2 + ' is ' + n2 * n2 + ' times as far out as shell 1. The first electron is pulled how many times as hard?';
      why = 'Charge: × ' + Z1 + '. Distance ' + n2 * n2 + ' times closer: × ' + Math.pow(n2, 4) + '. Together ' + Z1 + ' × ' + Math.pow(n2, 4) + ' = ' + Z1 * Math.pow(n2, 4) + '.'; hint = 'One factor for the charge, one for the distance. Multiply.'; return pack(Z1 * Math.pow(n2, 4), { base: 1, a: Z1, b: 1, c: 1 / (n2 * n2) });
    }
    if (t4 === 'units') {
      var k = pick([2, 3, 4, 5]), cm = pick([10, 15, 20, 25]), mm = cm * k, half = r() < .5, div = k * k * (half ? 2 : 1);
      base = pick([1, 2, 3]) * pick([2, 4, 5]); f = F(1, div); title = 'Unit change'; skill = 'chem.coulomb.combined'; unit = 'N';
      q = 'Two spheres ' + cm + ' cm apart push on each other with ' + base * div + ' N. They are moved to ' + (mm / 100).toFixed(2) + ' m apart' + (half ? ' and one charge is cut to half' : '') + '. What is the force?';
      why = (mm / 100).toFixed(2) + ' m = ' + mm + ' cm, which is ' + k + ' times ' + cm + ' cm. Force ÷ ' + k * k + (half ? ', then ÷ 2' : '') + ' = ' + base + ' N.'; hint = 'Same unit first. Then one factor for each change.'; return pack(base, { base: base * div, a: 1, b: half ? [1, 2] : 1, c: k });
    }
    var kb = pick([2, 3, 4, 5]); f = F(kb, 1); title = 'Working backward'; skill = 'chem.coulomb.combined'; unit = '×';
    q = 'The distance between two charges is multiplied by ' + kb + '. By what number must one charge be multiplied so the force stays exactly the same? (Distance ×' + kb + ' divides the force by ' + kb * kb + '.)'; why = 'Distance × ' + kb + ' divides the force by ' + kb * kb + '. A charge × ' + kb * kb + ' multiplies it by ' + kb * kb + '. Net: no change.'; hint = 'The charge factor must cancel the distance factor squared.'; return pack(kb * kb, { back: true, a: kb * kb, c: kb });
    function pack(ans, p) { return { type: 'num', q: q, ans: Math.round(ans * 1e4) / 1e4, tol: 0.01, unit: unit, why: why, hint: hint, skill: skill, title: title, band: B, p: p, traps: trapsFor(p) }; }
  }

  root.CoulombPractice = { force: force, factor: factor, pull: pull, val: val, frac: F, fmt: fmt, CHECK: CHECK, route: route, tagTable: tagTable, SIMPLE: SIMPLE, closing: closing, extension: extension, spec: spec };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.CoulombPractice;
})(typeof window !== 'undefined' ? window : globalThis);
