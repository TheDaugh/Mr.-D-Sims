/* DAY CARD CONTENT: Unit 3, Slot 9. Electron configurations I: levels, sublevels, Aufbau.
   Plain data plus pure generators, no DOM. The coder wires this into the chem spec (tools/new-lesson.mjs chem);
   the coder does not rewrite, shorten or re-derive anything here. Verified by slot-09-content.test.js.
   Scope: neutral atoms, Z = 1 to 36. Cr (24) and Cu (29) are never assessed. */
(function (root) {
  'use strict';
  var ORDER = ['1s', '2s', '2p', '3s', '3p', '4s', '3d', '4p'];
  var CAP = { s: 2, p: 6, d: 10 };
  var BOXES = { s: 1, p: 3, d: 5 };
  var NAME = ['', 'hydrogen', 'helium', 'lithium', 'beryllium', 'boron', 'carbon', 'nitrogen', 'oxygen', 'fluorine', 'neon',
    'sodium', 'magnesium', 'aluminum', 'silicon', 'phosphorus', 'sulfur', 'chlorine', 'argon', 'potassium', 'calcium',
    'scandium', 'titanium', 'vanadium', 'chromium', 'manganese', 'iron', 'cobalt', 'nickel', 'copper', 'zinc',
    'gallium', 'germanium', 'arsenic', 'selenium', 'bromine', 'krypton'];
  var SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  var NOT_ASSESSED = [24, 29];

  /* ---------- core model (ground state, simple Aufbau order) ---------- */
  function fill(Z) {
    var left = Z, out = [];
    for (var i = 0; i < ORDER.length && left > 0; i++) {
      var n = Math.min(CAP[ORDER[i].charAt(1)], left);
      out.push([ORDER[i], n]); left -= n;
    }
    return out;
  }
  function cfg(Z) { return fill(Z).map(function (p) { return p[0] + p[1]; }).join(' '); }
  function pretty(s) {
    return s.replace(/([spd])(\d+)/g, function (_, l, d) { return l + d.split('').map(function (c) { return SUP.charAt(+c); }).join(''); });
  }
  function boxes(sub, n) {
    var b = BOXES[sub.charAt(1)], a = [], i;
    for (i = 0; i < b; i++) a.push(i < n ? 1 : 0);
    for (i = 0; i < n - b; i++) a[i] = 2;
    return a;
  }
  function occupancy(Z) {
    var o = {};
    fill(Z).forEach(function (p) { o[p[0]] = boxes(p[0], p[1]); });
    ORDER.forEach(function (s) { if (!o[s]) o[s] = boxes(s, 0); });
    return o;
  }
  function unpairedIn(Z, sub) { return occupancy(Z)[sub].filter(function (x) { return x === 1; }).length; }
  function totalUnpaired(Z) { var o = occupancy(Z); return ORDER.reduce(function (t, s) { return t + o[s].filter(function (x) { return x === 1; }).length; }, 0); }
  function sums(Z) { return fill(Z).map(function (p) { return p[1]; }).join(' + ') + ' = ' + Z; }

  /* ---------- student answer reading: any spacing, ^, superscripts; 3d before 4s accepted ---------- */
  function parseConfig(str) {
    var s = String(str).toLowerCase()
      .replace(/[⁰¹²³⁴-⁹]/g, function (c) { return SUP.indexOf(c); })
      .replace(/[\^{}]/g, '').replace(/[_,]/g, ' ').replace(/\s+/g, ' ').trim();
    function go(rest) {
      rest = rest.replace(/^ /, '');
      if (rest === '') return [];
      var m = /^([1-9])([a-z])/.exec(rest);
      if (!m || CAP[m[2]] === undefined) return null;
      var after = rest.slice(2);
      for (var len = 2; len >= 1; len--) {
        var d = after.slice(0, len);
        if (d.length < len || !/^\d+$/.test(d)) continue;
        var v = parseInt(d, 10);
        if (v > CAP[m[2]]) continue;
        var tail = go(after.slice(len));
        if (tail) return [[m[1] + m[2], v]].concat(tail);
      }
      return null;
    }
    return go(s);
  }
  function canon(parts) {
    return parts.slice().sort(function (a, b) { return (a[0].charAt(0) - b[0].charAt(0)) || ('spd'.indexOf(a[0].charAt(1)) - 'spd'.indexOf(b[0].charAt(1))); })
      .map(function (p) { return p.join(''); }).join(' ');
  }
  function sameConfig(a, b) { var A = parseConfig(a), B = parseConfig(b); return !!(A && B && canon(A) === canon(B)); }

  /* ---------- helpers ---------- */
  var INT = function (r, a, b) { return a + Math.floor(r() * (b - a + 1)); };
  var pick = function (r, arr) { return arr[Math.floor(r() * arr.length)]; };
  function shuffle(r, arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function choice(r, correct, wrongs) { var o = shuffle(r, [correct].concat(wrongs)); return { options: o, answer: o.indexOf(correct) }; }
  function zIn(r, lo, hi) { var z; do { z = INT(r, lo, hi); } while (NOT_ASSESSED.indexOf(z) >= 0); return z; }
  var cl = function (b) { return Math.max(1, Math.min(4, b || 1)); };
  var hint0 = 'Fill the lowest energy first. s holds 2, p holds 6, d holds 10.';

  function cfgItem(Z, hint, itemType, prompt) {
    return { type: 'config', itemType: itemType, prompt: prompt, answer: cfg(Z), unit: '', hint: hint,
      worked: 'Place ' + Z + ' electrons in energy order: ' + pretty(cfg(Z)) + '. Check: ' + sums(Z) + '.' };
  }

  /* ---------- skills: three skills, four bands, a different item type in each cell ---------- */
  var skills = [
    { id: 'write', title: 'Write a configuration', gen: function (b, r) {
      b = cl(b); var Z, n;
      if (b === 1) { Z = INT(r, 3, 10); return cfgItem(Z, hint0, 'word', 'Write the ground-state configuration of ' + NAME[Z] + ' (Z = ' + Z + ').'); }
      if (b === 2) { Z = INT(r, 11, 18); return cfgItem(Z, 'After 2p comes 3s, then 3p.', 'word', 'Write the ground-state configuration of ' + NAME[Z] + ' (Z = ' + Z + ').'); }
      if (b === 3) { Z = zIn(r, 19, 36); return cfgItem(Z, '4s fills before 3d, and 3d before 4p.', 'word', 'Write the ground-state configuration of ' + NAME[Z] + ' (Z = ' + Z + ').'); }
      n = pick(r, [1, 2, 3, 6, 7, 8]); Z = 20 + n;
      return cfgItem(Z, 'Count the electrons first: the 3d subshell fills only after 4s is full.', 'backward',
        'A neutral atom has ' + n + ' electron' + (n > 1 ? 's' : '') + ' in its 3d subshell and none in 4p. Write its ground-state configuration.');
    } },
    { id: 'read', title: 'Read the ladder', gen: function (b, r) {
      b = cl(b); var Z, N, c, names;
      if (b === 1) { Z = INT(r, 3, 10); names = [NAME[Z - 1], NAME[Z + 1], NAME[Z + 2]]; c = choice(r, NAME[Z], names);
        return { type: 'choice', itemType: 'picture', prompt: 'The diagram shows every electron in one neutral atom. Which element is it?', figure: { kind: 'ladder', occupancy: occupancy(Z) },
          options: c.options, answer: c.answer, hint: 'Count the arrows, then find that number on the periodic table.', worked: 'The diagram has ' + Z + ' electrons, so Z = ' + Z + ': ' + NAME[Z] + '.' }; }
      if (b === 2) { N = INT(r, 11, 18); var sub = fill(N)[fill(N).length - 1][0]; c = choice(r, sub, ['2p', '3s', '3p', '3d'].filter(function (x) { return x !== sub; }).slice(0, 3));
        return { type: 'choice', itemType: 'picture', prompt: 'The diagram shows ' + (N - 1) + ' electrons already placed. Which subshell gets electron number ' + N + '?', figure: { kind: 'ladder', occupancy: occupancy(N - 1) },
          options: c.options, answer: c.answer, hint: 'Find the lowest subshell that still has an empty box.', worked: 'Electron ' + N + ' goes to ' + sub + ', the lowest subshell with room.' }; }
      if (b === 3) { Z = zIn(r, 19, 36);
        return { type: 'num', itemType: 'numeric', prompt: 'A neutral atom has the configuration ' + pretty(cfg(Z)) + '. What is its atomic number?', answer: Z, unit: '', hint: 'Add the small raised numbers.', worked: sums(Z) + ', so Z = ' + Z + ' (' + NAME[Z] + ').' }; }
      Z = pick(r, [21, 22, 23, 25, 26, 27, 28]);
      return { type: 'num', itemType: 'numeric', prompt: 'How many unpaired electrons does a neutral atom of ' + NAME[Z] + ' (Z = ' + Z + ') have in its 3d subshell?', figure: { kind: 'ladder', occupancy: occupancy(Z), hideAnswerRow: '3d' },
        answer: unpairedIn(Z, '3d'), unit: '', hint: 'The five 3d boxes fill singly first, then pair.', worked: Z + ' - 20 = ' + (Z - 20) + ' electrons in 3d, over 5 boxes: ' + unpairedIn(Z, '3d') + ' unpaired.' };
    } },
    { id: 'rules', title: 'Apply the filling rules', gen: function (b, r) {
      b = cl(b); var Z, s, k, set, kind, parts, wrong, c, errs;
      if (b === 1) { s = pick(r, ['1s', '2s', '2p', '3p', '3s', '3d', '4s']);
        return { type: 'num', itemType: 'numeric', prompt: 'How many electrons fit in the ' + s + ' subshell?', answer: CAP[s.charAt(1)], unit: '', hint: 'An s subshell has 1 box, p has 3, d has 5. A box holds 2.',
          worked: s.charAt(1) + ' has ' + BOXES[s.charAt(1)] + ' box(es) of 2 electrons: ' + CAP[s.charAt(1)] + '.' }; }
      if (b === 2) { Z = INT(r, 11, 18);
        return { type: 'num', itemType: 'numeric', prompt: 'How many unpaired electrons does a neutral atom of ' + NAME[Z] + ' (Z = ' + Z + ') have?', figure: { kind: 'ladder', occupancy: occupancy(Z), hideAnswerRow: '3p' },
          answer: totalUnpaired(Z), unit: '', hint: 'Boxes in the same subshell fill singly before any pair up.', worked: pretty(cfg(Z)) + '. Boxes fill singly first, so ' + totalUnpaired(Z) + ' unpaired.' }; }
      if (b === 3) {
        errs = { cap: 'A subshell holds too many electrons', skip: 'A subshell was skipped', order: '3d took electrons before 4s was full' };
        kind = pick(r, ['cap', 'skip', 'order']);
        if (kind === 'order') { Z = pick(r, [21, 22, 23, 25, 26, 27, 28]); } else { Z = zIn(r, 19, 36); }
        parts = fill(Z).map(function (p) { return [p[0], p[1]]; });
        function bump(sub, d) { parts.forEach(function (p) { if (p[0] === sub) p[1] += d; }); }
        if (kind === 'cap') { bump('2p', 1); var last = parts[parts.length - 1]; last[1] -= 1; if (last[1] === 0) parts.pop(); }
        if (kind === 'skip') { parts = parts.filter(function (p) { return p[0] !== '2s'; }); }
        if (kind === 'order') { bump('4s', -1); bump('3d', 1); }
        var shown = pretty(parts.map(function (p) { return p[0] + p[1]; }).join(' '));
        wrong = Object.keys(errs).filter(function (x) { return x !== kind; }).map(function (x) { return errs[x]; }).concat(['Nothing is wrong']);
        c = choice(r, errs[kind], wrong.slice(0, 3));
        return { type: 'choice', itemType: 'error-find', prompt: 'A student writes ' + NAME[Z] + ' (Z = ' + Z + ') as ' + shown + '. What is the mistake?', options: c.options, answer: c.answer,
          hint: 'Check each capacity, then the order, then the total.', worked: 'Correct: ' + pretty(cfg(Z)) + '. ' + errs[kind] + '.' }; }
      k = pick(r, [1, 2, 3]); set = k === 1 ? [13, 17] : k === 2 ? [14, 16] : [15];
      return { type: 'num', itemType: 'backward', prompt: 'A neutral atom has ' + k + ' unpaired electron' + (k > 1 ? 's' : '') + ', and all of them are in its 3p subshell. What atomic number could it have?' + (set.length > 1 ? ' Give both.' : ''),
        answer: set[0], answer2: set.length > 1 ? set[1] : null, unit: '', hint: 'Fill the three 3p boxes one at a time, then pair. Which counts leave ' + k + ' unpaired?',
        worked: set.map(function (z) { return NAME[z] + ' (Z = ' + z + ', ' + pretty(cfg(z)) + ')'; }).join(' and ') + '.' };
    } }
  ];

  /* ---------- Warm-up (from the six Foundations questions; bands 1 and 2 only) ---------- */
  var warmup = [
    { id: 'W1', band: 1, prompt: 'How many electrons can the first shell hold?', answer: 2, pattern: '2' },
    { id: 'W2', band: 1, prompt: 'The second shell has one s box and three p boxes. Each box holds 2. How many electrons fit in the second shell?', answer: 8, pattern: 'One s box (2) and three p boxes (6)' },
    { id: 'W3', band: 1, prompt: 'Which subshell fills first, 2s or 2p?', options: ['2s', '2p'], answer: 0, pattern: 'Lower energy first' },
    { id: 'W4', band: 1, prompt: 'How many electrons can one box hold?', answer: 2, pattern: 'Two, with opposite spins' },
    { id: 'W5', band: 2, prompt: 'Three electrons enter an empty p subshell. How many of its boxes hold an electron?', answer: 3, pattern: 'Singly first (Hund)' },
    { id: 'W6', band: 2, prompt: 'Which has more energy, an electron in 1s or an electron in 2s?', options: ['1s', '2s'], answer: 1, pattern: 'Higher shell, more energy' }
  ];
  var talk = ['After 3p, where does the next electron go? Look at the energy ladder.'];  /* UBD Foundations Q6: huddle talk, not a warm-up item, so it does not give away the prediction */

  var predicts = [
    { id: 'P1', title: 'The 19th electron', prompt: 'The 19th electron: where does it go, 3d or 4s?', options: ['3d', '4s'], answer: 1, why: '4s sits lower on the energy ladder than 3d, so it fills first.' },
    { id: 'P2', added: true, title: 'Three electrons, three boxes', prompt: 'Three electrons enter an empty 2p subshell. Which is lower in energy?', options: ['All three in one box', 'Two in one box, one alone', 'One in each box'], answer: 2, why: 'Electrons repel. One in each box keeps them apart (Hund\'s rule).' }
  ];

  var recorded = { configs: [3, 7, 11, 15, 19].map(function (Z) { return { Z: Z, answer: cfg(Z) }; }), capacities: { s: 2, p: 6, d: 10 } };

  /* ---------- Model problems: M1 watch, M2 with me, M3 you do ---------- */
  var MOVES = ['Count the electrons', 'Fill the lowest energy first', 'Track electrons left', 'Write the configuration', 'Draw the boxes', 'Check the sum'];
  function boxLine(sub, n) {
    var b = BOXES[sub.charAt(1)];
    if (n <= b) return sub + ' has ' + b + ' box' + (b > 1 ? 'es' : '') + ' and ' + n + ' electron' + (n > 1 ? 's' : '') + ': one in each of ' + n + ' box' + (n > 1 ? 'es' : '') + ', same direction.';
    var paired = n - b;
    return sub + ' has ' + b + ' boxes and ' + n + ' electrons: ' + (b - paired) + ' box' + (b - paired > 1 ? 'es' : '') + ' with one, ' + paired + ' box' + (paired > 1 ? 'es' : '') + ' with a pair.';
  }
  function modelSteps(Z) {
    var f = fill(Z), left = Z, track = f.map(function (p) { left -= p[1]; return p[0] + ' takes ' + p[1] + ', ' + left + ' left.'; });
    var lastP = f[f.length - 1];
    return [
      { move: 1, text: 'Z = ' + Z + ', so ' + Z + ' electrons to place.' },
      { move: 2, text: 'Order: ' + f.map(function (p) { return p[0]; }).join(', ') + '.' },
      { move: 3, text: track.join(' ') },
      { move: 4, text: 'Write: ' + pretty(cfg(Z)) + '.' },
      { move: 5, text: boxLine(lastP[0], lastP[1]) },
      { move: 6, text: 'Check: ' + sums(Z) + '.' }
    ];
  }
  var models = [
    { id: 'M1', mode: 'watch', Z: 15, problem: 'Write the ground-state configuration and orbital diagram of phosphorus (Z = 15).', predictAnswer: cfg(15), steps: modelSteps(15), slip: 'Pairing the 3p electrons.' },
    { id: 'M2', mode: 'with-me', Z: 16, typedMoves: [4, 5], problem: 'Write the ground-state configuration and orbital diagram of sulfur (Z = 16).', predictAnswer: cfg(16), steps: modelSteps(16), slip: 'Putting the fourth 3p electron in a new subshell instead of pairing in the first 3p box.' },
    { id: 'M3', mode: 'you-do', Z: 26, problem: 'Write the ground-state configuration and orbital diagram of iron (Z = 26).', predictAnswer: cfg(26), steps: modelSteps(26), slip: 'Filling 3d before 4s.' }
  ];

  /* ---------- Board (projector) : same figure, not interactive; Ian writes, blanks fill ---------- */
  var board = {
    figure: { kind: 'ladder', order: ORDER, interactive: false },
    reveal: [
      { say: 'Subshell capacities', write: 's [[2]], p [[6]], d [[10]]' },
      { say: 'Aufbau', write: 'Fill the [[lowest]] energy first.' },
      { say: 'Hund\'s rule', write: 'Fill boxes [[singly]] before pairing.' },
      { say: 'Worked example: phosphorus', write: 'Walk M1 move by move; the electrons-left counter runs 15, 13, 11, 5, 3, 0.' }
    ]
  };

  /* ---------- Gate: items that count. The clear/hold rule is PENDING (see decision 1) ---------- */
  var gate = { items: ['P1', 'rec3', 'rec7', 'rec11', 'rec15', 'rec19'], rule: 'PENDING', until: 'Use the standard huddle (rule 17) until Ian decides.' };

  var exit = [
    { id: 'X1', prompt: 'Configuration of oxygen (Z = 8)?', type: 'config', answer: cfg(8) },
    { id: 'X2', prompt: 'How many electrons fit in the 3d subshell?', type: 'num', answer: 10 },
    { id: 'X3', prompt: 'Which fills first, 4s or 3d?', type: 'choice', options: ['4s', '3d'], answer: 0 }
  ];
  var scoring = { perItem: 1, firstTry: true, secure: 3, developing: 2, notYet: '0-1' };

  var misconceptions = [
    { say: '3d fills before 4s because 3 is lower than 4.', fix: '4s sits lower on the ladder. Shell number is not the energy order.', exposedBy: 'The Orbital Filler rejects a 3d electron while 4s has room, and says why.' },
    { say: 'Electrons pair up first.', fix: 'Boxes fill singly first (Hund). Pairing costs repulsion.', exposedBy: 'Z = 7: three electrons, three boxes, no pair.' },
    { say: 'A p subshell holds 2.', fix: 'Each box holds 2. p has 3 boxes, so 6.', added: true, exposedBy: 'The capacity table in Recorded.' }
  ];
  var background = 'Cr and Cu break the pattern (4s1 3d5 and 4s1 3d10). One line in the notes, never assessed, marked in the key.';

  var pacing = { budgetMin: 42, steps: [
    { id: 'start', prio: 1, min: 2 }, { id: 'warmup', prio: 1, min: 4 }, { id: 'predict', prio: 1, min: 4 },
    { id: 'explore', prio: 3, min: 8 }, { id: 'build', prio: 2, min: 8, minItems: 2, parts: 4 },
    { id: 'practice', prio: 1, min: 8 }, { id: 'check', prio: 1, min: 4 }], huddles: [{ key: 'h1', atMin: 10 }] };

  var CONTENT = { id: 'unit3-slot09', ORDER: ORDER, NAME: NAME, fill: fill, cfg: cfg, pretty: pretty, occupancy: occupancy, unpairedIn: unpairedIn, totalUnpaired: totalUnpaired,
    parseConfig: parseConfig, sameConfig: sameConfig, skills: skills, warmup: warmup, talk: talk, predicts: predicts, recorded: recorded, MOVES: MOVES, models: models,
    board: board, gate: gate, exit: exit, scoring: scoring, misconceptions: misconceptions, background: background, pacing: pacing, NOT_ASSESSED: NOT_ASSESSED };
  if (typeof module !== 'undefined' && module.exports) module.exports = CONTENT; else (root.DAYCARDS = root.DAYCARDS || {})[CONTENT.id] = CONTENT;
})(typeof window !== 'undefined' ? window : globalThis);
