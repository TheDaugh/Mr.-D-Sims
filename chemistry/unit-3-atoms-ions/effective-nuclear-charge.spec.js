/* SPEC (chemistry): Unit 3, Slot 15. Effective nuclear charge and shielding.
   The teaching is day-cards/slot-15.card.md (design) and day-cards/slot-15.content.js (data and generators, tested by tests/unit/slot-15-content.test.js).
   This file merges that content; it does not rewrite any prompt, step, answer or misconception. What it adds is marked "wiring". No DOM here. */
(function (root) {
  'use strict';
  var node = typeof module !== 'undefined' && module.exports;
  var C = node ? require('./day-cards/slot-15.content.js') : root.DAYCARDS['unit3-slot15'];
  var Z = C.Z, A = Z.atom;

  /* wiring: the huddle example is model M2 (sodium) with its numbers as write-on blanks */
  var na = A(11);
  var exampleSteps = [
    'Rings: ' + na.rings.join(', ') + '. Total [[' + na.Z + ']].',
    'Core = ' + na.rings.slice(0, -1).join(' + ') + ' = [[' + na.core + ']].',
    'Z_eff = ' + na.Z + ' − ' + na.core + ' = [[' + na.zeff + ']].',
    'Pull = ' + na.zeff + ' ÷ ' + na.n + '² = [[' + Z.frac(na) + ']].'
  ];

  var SPEC = {
    id: 'effective-nuclear-charge', course: 'chem', unit: 'Unit 3 · Atoms and Ions', title: 'Effective Nuclear Charge and Shielding',
    question: 'How hard does the nucleus really pull on an outer electron?',
    targets: ['I can estimate Z_eff as Z minus core electrons and use it to compare how hard atoms hold electrons.'],   // T12
    tabs: ['Warm-up', 'Predict', 'Explore', 'Huddle', 'Models', 'Build', 'Practice', 'Check'],
    buildTarget: 'I can estimate Z_eff for a new atom.',   // wiring
    exploreTarget: 'I can mark the core rings and compare how hard two atoms hold an outer electron.',   // wiring
    exploreTeacher: 'The pull meter shows Z_eff ÷ n² as a classroom model number, not a measurement. ' + C.background,
    backgroundLine: C.background,

    concepts: [
      { title: 'Core electrons', points: ['Every electron that is not in the outer ring.'], eq: 'core = Z − outer electrons' },
      { title: 'Shielding', points: ['Core electrons cancel part of the nucleus’s pull.'], eq: 'a core electron cancels one proton' },
      { title: 'Z_eff', points: ['The pull an outer electron really feels.', 'Estimate: Z minus the core electrons.'], eq: 'Z_eff = Z − core' },
      { title: 'Distance', points: ['The farther the ring, the weaker the pull (slot 7).'], eq: 'pull = Z_eff ÷ n²' }
    ],

    huddleTarget: 'I can find the core electrons and Z_eff of an atom.',   // wiring
    huddle: {
      defs: [
        { term: 'Core electrons', text: 'The electrons [[inside]] the outer ring.' },
        { term: 'Shielding', text: 'Core electrons [[cancel]] part of the nucleus’s pull.' },
        { term: 'Z_eff', text: 'Z_eff = Z minus the [[core]] electrons.' }
      ],
      example: { prompt: 'Sodium (Z = 11): how hard is its outer electron held?', steps: exampleSteps },
      label: { title: 'Label the sodium atom', html: Z.svg(11, { showCore: true, tags: { nucleus: 1, core: 2, outer: 3 } }),
        tags: [{ n: 1, text: 'The nucleus has charge +[[11]].' }, { n: 2, text: 'The [[core]] rings hold [[10]] electrons.' }, { n: 3, text: 'The [[outer]] ring holds [[1]] electron.' }] }
    },

    predicts: C.predicts,
    skills: C.skills,
    misconceptions: C.misconceptions,
    pacing: C.pacing,

    /* the card's other exports, read by the page, the keys and the tests */
    warmup: C.warmup, talk: C.talk, MOVES: C.MOVES, models: C.models, crux: C.crux, exit: C.exit, scoring: C.scoring, background: C.background, terms: C.TERMS, content: C, zeff: Z
  };
  if (node) module.exports = SPEC; else (root.SPECS = root.SPECS || {})[SPEC.id] = SPEC;
})(typeof window !== 'undefined' ? window : globalThis);
