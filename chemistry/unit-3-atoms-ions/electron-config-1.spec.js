/* SPEC (chemistry): Unit 3, Slot 9. Electron configurations I: levels, sublevels, Aufbau.
   The teaching is the Day Card: day-cards/slot-09.card.md (design) and day-cards/slot-09.content.js (data and generators, tested by
   tests/unit/slot-09-content.test.js). This file merges that content; it does not rewrite, shorten or re-derive any prompt, step,
   answer or misconception. What this file adds is marked "wiring" below. No DOM here: the page, the keys and the tests all read it. */
(function (root) {
  'use strict';
  var node = typeof module !== 'undefined' && module.exports;
  var C = node ? require('./day-cards/slot-09.content.js') : root.DAYCARDS['unit3-slot09'];
  var L = node ? require('../shared/energy-ladder.js') : root.EnergyLadder;

  /* wiring: a skill item that carries a ladder figure gets the picture drawn (`pic`); a `config` item gets the reader and a live preview. */
  function preview(typed) {
    var p = C.parseConfig(typed); return p ? C.pretty(p.map(function (x) { return x[0] + x[1]; }).join(' ')) : '';
  }
  function dress(q) {
    if (q.figure && q.figure.kind === 'ladder') q.pic = L.svg({ occupancy: q.figure.occupancy, hideRow: q.figure.hideAnswerRow || null });
    if (q.type === 'config') { q.check = C.sameConfig; q.preview = preview; }
    return q;
  }
  var skills = C.skills.map(function (sk) { return { id: sk.id, title: sk.title, gen: function (b, r) { return dress(sk.gen(b, r)); } }; });

  /* wiring: the board's four reveal lines are also the huddle's definitions and worked example (the card gives no separate huddle text).
     The example is model M1 verbatim; its "N left" counts and its closing total become write-on blanks. */
  var R = C.board.reveal, M1 = C.models[0];
  var exampleSteps = M1.steps.map(function (s) { return s.text.replace(/(\d+) left/g, '[[$1]] left').replace(/= (\d+)\.$/, '= [[$1]].'); });

  var bgLine = C.background.split(' One line')[0];   // the card's background note, without its filing instruction

  var SPEC = {
    id: 'electron-config-1', course: 'chem', unit: 'Unit 3 · Atoms and Ions', title: 'Electron Configurations I',
    question: 'Where does each electron go, and what decides the order?',
    targets: ['I can write full ground-state electron configurations for atoms through Z = 36, and draw orbital diagrams.'],   // card T7; "(full form)" became "full" to fit the 110-character spec rule
    tabs: ['Warm-up', 'Predict', 'Explore', 'Huddle', 'Models', 'Build', 'Practice', 'Check'],
    buildTarget: 'I can write the configuration of a new atom.',   // wiring
    exploreTeacher: 'The ladder is the neutral-atom order through Z = 36, so Cr and Cu cannot come up. Background, never assessed: ' + bgLine + ' Marked in the key.',
    backgroundLine: C.pretty(bgLine),
    exploreTarget: 'I can fill the lowest open box first, one electron at a time.',   // wiring: the card's "one idea" for Explore, as an I-can line

    /* wiring: concepts come from the card's own lines (hint0 and the board's writes) */
    concepts: [
      { title: 'Subshell capacity', points: ['An s subshell holds 2, a p subshell holds 6, a d subshell holds 10.', 'Each box holds 2.'], eq: 's 2 · p 6 · d 10' },
      { title: 'Aufbau', points: ['Fill the lowest energy first.'], eq: C.ORDER.join(' → ') },
      { title: 'Hund’s rule', points: ['Fill boxes singly before pairing.'], eq: '↑ ↑ ↑ before ↑↓' }
    ],

    huddleTarget: 'I can use the energy ladder to place electrons in order.',   // wiring
    huddle: {
      defs: R.slice(0, 3).map(function (x) { return { term: x.say, text: x.write }; }),
      example: { prompt: R[3].say + ' (Z = 15)', steps: exampleSteps },
      label: { title: 'Label the energy ladder', html: L.svg({ tags: { '1s': 1, '2p': 2, '4s': 3 } }),   // wiring: three label lines are new text, not from the card
        tags: [{ n: 1, text: 'The lowest subshell is [[1s]].' }, { n: 2, text: 'A p subshell has [[3]] boxes.' }, { n: 3, text: 'The subshell after 3p is [[4s]].' }] }
    },

    predicts: C.predicts,
    skills: skills,
    misconceptions: C.misconceptions,
    pacing: C.pacing,

    /* the card's other exports, read by the page, the board, the keys and the tests */
    warmup: C.warmup, talk: C.talk, recorded: C.recorded, MOVES: C.MOVES, models: C.models, board: C.board, gate: C.gate,
    exit: C.exit, scoring: C.scoring, background: C.background, content: C, ladder: L, dress: dress
  };
  if (node) module.exports = SPEC; else (root.SPECS = root.SPECS || {})[SPEC.id] = SPEC;
})(typeof window !== 'undefined' ? window : globalThis);
