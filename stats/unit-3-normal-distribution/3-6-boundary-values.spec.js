/* SPEC (statistics): Unit 3, Slot 11. 3.6 Finding boundary values (T13 Core, T14 Rigor).
   The teaching is the Day Card: day-cards/stats-11.card.md (design) and day-cards/stats-11.content.js (data and generators, tested by
   tests/unit/stats-11-content.test.js). This file merges that content; it does not rewrite, shorten or re-derive any prompt, step, answer or
   misconception. What this file adds is marked "wiring". No DOM here: the page, the keys and the tests all read it. */
(function (root) {
  'use strict';
  var node = typeof module !== 'undefined' && module.exports;
  var C = node ? require('./day-cards/stats-11.content.js') : root.DAYCARDS['stats-unit3-slot11'];
  var F = node ? require('../shared/normal-figure.js') : root.NormalFigure;

  /* wiring: the card's numeric tolerance is absolute ("within tol"); the engine's `tol` is relative, so it goes in `abs` (plus a hair for float noise).
     An item that carries a `figure` descriptor gets the picture drawn (`pic`), picture first. */
  function dress(q) {
    if (q.figure && q.figure.kind === 'normal') q.pic = F.svg(q.figure);
    if (q.type === 'num' && q.tol != null) { q.abs = q.tol + 1e-9; q.tol = 0; }
    return q;
  }
  var skills = C.skills.map(function (sk) { return { id: sk.id, title: sk.title, gen: function (b, r) { return dress(sk.gen(b, r)); } }; });

  /* wiring: the board's reveal lines are also the huddle's definitions (the card gives no separate huddle text). The worked example is model M1
     verbatim; its area, its invNorm result and its closing value become write-on blanks. */
  var R = C.board.reveal, M1 = C.models[0];
  var exampleSteps = M1.steps.map(function (s, i) {
    var t = s.text; if (i === 1 || i === 2) return t.replace(/= ([\d.]+)\.$/, '= [[$1]].'); if (i === 4) return t.replace(/than ([\d.]+) minutes/, 'than [[$1]] minutes'); return t;
  });

  var SPEC = {
    id: '3-6-boundary-values', course: 'stats', unit: 'Unit 3 · The Normal Distribution', title: '3.6 Finding Boundary Values',
    question: 'How do I go from a percent to a cutoff?',   // card: EQ4, without its tag
    targets: ['I can find the value that matches a given percentile in a normal distribution.',
      'I can find a missing mean or SD of a normal distribution from the value of a percentile.'],   // card: T13, T14 (the page never says Rigor)
    tabs: ['Warm-up', 'Predict', 'Explore', 'Huddle', 'Models', 'Build', 'Practice', 'Check'],
    buildTarget: 'I can find a boundary value on a new problem.',   // wiring
    exploreTarget: 'I can find the value that has a chosen area to its left.',   // wiring: the card's "one idea" for Explore, as an I-can line
    exploreTeacher: 'The student drags one boundary on a minutes axis until the shaded area on the left matches a target (0.50, 0.90, 0.20, 0.95; the exact values are 30.0, 37.7, 25.0, 39.9). The area is hidden until Commit; a commit within 0.01 of the target counts. Each run (target, boundary, area, tries) is saved on the student’s device.',

    /* wiring: concepts come from the card's own lines (the board's writes, the warm-up patterns and the model steps) */
    concepts: [
      { title: 'Percentile', points: ['The percent of values below a value.'], eq: 'percentile = percent below' },
      { title: 'Two commands', points: ['normalcdf: a value goes in, an area comes out.', 'invNorm: an area goes in, a value comes out.'], eq: 'invNorm(area to the left, mean, SD)' },
      { title: 'Left and right', points: ['Technology gives the area to the LEFT.', 'For the top q%, use 1 − q on the left.'], eq: 'area left = 1 − area right' },
      { title: 'Missing mean or SD', points: ['Find z first, then solve for the missing piece.'], eq: 'value = mean + z × SD' }
    ],

    huddleTarget: 'I can say what a percentile and a boundary value are.',   // wiring
    huddle: {
      defs: R.slice(0, 3).map(function (x) { return { term: x.say, text: x.write }; }),
      example: { prompt: M1.problem, steps: exampleSteps },
      label: { title: 'Label the normal curve', html: F.svg({ mean: 30, sd: 6, units: 'minutes', shade: 'left', area: 0.9, boundary: '?', tags: [{ n: 1, at: 'mean' }, { n: 2, at: 'boundary' }, { n: 3, at: 'area' }] }),   // wiring: the three label lines are new text, not from the card
        tags: [{ n: 1, text: 'The center of the curve is the [[mean]].' }, { n: 2, text: 'The edge of the shaded part is the [[boundary]].' }, { n: 3, text: 'The shaded part is the area to the [[left]].' }] }
    },

    predicts: C.predicts,
    skills: skills,
    misconceptions: C.misconceptions,
    pacing: C.pacing,

    /* the card's other exports, read by the page, the board, the keys and the tests */
    warmup: C.warmup, talk: C.talk, MOVES: C.MOVES, models: C.models, board: C.board, gate: C.gate, explore: C.explore,
    exit: C.exit, scoring: C.scoring, content: C, figure: F, dress: dress
  };
  if (node) module.exports = SPEC; else (root.SPECS = root.SPECS || {})[SPEC.id] = SPEC;
})(typeof window !== 'undefined' ? window : globalThis);
