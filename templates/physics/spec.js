/* TEMPLATE SPEC (physics). Everything a lesson teaches lives here as plain data, so three things read the SAME file:
     1. the lesson page (content.js builds the tabs from it),
     2. tools/build-keys.mjs (the make-up PDF for absent students and the teacher key PDF),
     3. the node tests (pacing is valid, every generator returns a checkable item at every band).
   No DOM in this file. Copy it to physics/lessons/content/<id>.spec.js with tools/new-lesson.mjs, then edit the data. */
(function (root) {
  'use strict';
  var INT = function (r, a, b) { return a + Math.floor(r() * (b - a + 1)); };
  var pick = function (r, arr) { return arr[Math.floor(r() * arr.length)]; };

  var SPEC = {
    id: 'tpl-physics', course: 'physics', unit: 'Template', title: 'Net Force and Acceleration (template)',
    question: 'What decides how quickly something speeds up?',
    /* one sentence each, "I can ..." */
    targets: ['I can say what net force means.', 'I can predict how force and mass change acceleration.', 'I can calculate acceleration with a = F / m.'],
    tabs: ['Warm-up', 'Predict', 'Explore', 'Huddle', 'Build', 'Practice', 'Check'],

    concepts: [
      { title: 'Net force', points: ['Add every force on the object.', 'A push the other way counts as negative.'], eq: 'F_net = F1 + F2' },
      { title: 'Acceleration', points: ['How fast the speed changes.', 'Bigger net force: bigger acceleration.', 'Bigger mass: smaller acceleration.'], eq: 'a = F_net / m' }
    ],

    /* [[blank]] = a write-on blank. Short answers only. */
    huddle: {
      defs: [
        { term: 'Net force', text: 'The [[sum]] of all the forces on an object.' },
        { term: 'Acceleration', text: 'How fast the [[velocity]] changes.' }
      ],
      example: { prompt: 'A 2 kg cart is pushed with a net force of 6 N. Find its acceleration.',
        steps: ['a = F / m', 'a = 6 / 2 = [[3]] m/s²', 'In 1 s its speed rises by [[3]] m/s.'] },
      label: { title: 'Label the cart',
        html: '<svg viewBox="0 0 320 120" role="img" aria-label="A cart with a force arrow pointing right and friction pointing left"><rect x="110" y="40" width="100" height="44" rx="6" fill="#dbe6ff" stroke="#2b4fd9" stroke-width="2"/><circle cx="130" cy="92" r="8" fill="#142230"/><circle cx="190" cy="92" r="8" fill="#142230"/><line x1="20" y1="100" x2="300" y2="100" stroke="#7a8a99"/><line x1="210" y1="62" x2="290" y2="62" stroke="#1c7d4a" stroke-width="4"/><polygon points="290,62 278,55 278,69" fill="#1c7d4a"/><line x1="110" y1="62" x2="70" y2="62" stroke="#b3412e" stroke-width="4"/><polygon points="70,62 82,55 82,69" fill="#b3412e"/><text x="228" y="52" font-size="14" fill="#1c7d4a">1</text><text x="74" y="52" font-size="14" fill="#b3412e">2</text></svg>',
        tags: [{ n: 1, text: 'The [[applied force]] pushes to the right.' }, { n: 2, text: '[[Friction]] pushes to the left.' }] }
    },

    predicts: [
      { id: 'P1', title: 'Push harder', prompt: 'A cart is pushed with a steady force. Now the force doubles. What happens to its acceleration?',
        options: ['It stays the same', 'It doubles', 'It halves', 'It quadruples'], answer: 1, why: 'a = F / m: double F, double a (mass is unchanged).' },
      { id: 'P2', title: 'Heavier cart', prompt: 'The same force pushes a cart. Now the cart carries twice the mass. What happens to its acceleration?',
        options: ['It doubles', 'It stays the same', 'It halves', 'It becomes zero'], answer: 2, why: 'a = F / m: double m, half a (force is unchanged).' }
    ],

    /* the Explore tab asks these after the student has played with the sim */
    observe: [
      { id: 'O1', prompt: 'Force goes up, mass stays put. The cart…', options: ['speeds up faster', 'speeds up more slowly', 'does not change'], answer: 0 },
      { id: 'O2', prompt: 'Mass goes up, force stays put. The cart…', options: ['speeds up faster', 'speeds up more slowly', 'does not change'], answer: 1 }
    ],

    /* Skills climb in bands 1-4. A generator returns { prompt, answer, unit, worked, hint }. Plain numbers, no tricks at band 1. */
    skills: [
      { id: 'accel', title: 'Find the acceleration', gen: function (b, r) {
        var m, a, F, f, F1, F2;
        if (b <= 1) { m = pick(r, [2, 3, 4, 5]); a = INT(r, 2, 5); F = m * a;
          return { prompt: 'A ' + m + ' kg cart is pushed with a net force of ' + F + ' N. What is its acceleration?', answer: a, unit: 'm/s²', hint: 'Divide the force by the mass.', worked: 'a = F / m = ' + F + ' / ' + m + ' = ' + a + ' m/s².' }; }
        if (b === 2) { m = pick(r, [0.5, 1.5, 2.5, 4]); a = pick(r, [2, 4, 6]); F = m * a;
          return { prompt: 'A ' + m + ' kg cart feels a net force of ' + F + ' N. What is its acceleration?', answer: a, unit: 'm/s²', hint: 'a = F / m.', worked: 'a = ' + F + ' / ' + m + ' = ' + a + ' m/s².' }; }
        if (b === 3) { m = pick(r, [2, 3, 4, 5]); a = INT(r, 2, 4); F2 = INT(r, 2, 6); F1 = m * a + F2;
          return { prompt: 'A ' + m + ' kg cart is pushed right with ' + F1 + ' N while ' + F2 + ' N pushes left. What is its acceleration?', answer: a, unit: 'm/s²', hint: 'Subtract first to get the net force.', worked: 'Net force = ' + F1 + ' − ' + F2 + ' = ' + (F1 - F2) + ' N. a = ' + (F1 - F2) + ' / ' + m + ' = ' + a + ' m/s².' }; }
        m = pick(r, [1.5, 2.5, 4, 6]); a = pick(r, [1, 2, 3]); f = pick(r, [3, 4, 5]); F = m * a + f;
        return { prompt: 'A rope pulls a ' + m + ' kg crate with ' + F + ' N. Friction is ' + f + ' N. What is the acceleration?', answer: a, unit: 'm/s²', hint: 'Friction opposes the pull. Find the net force first.', worked: 'Net = ' + F + ' − ' + f + ' = ' + (F - f) + ' N. a = ' + (F - f) + ' / ' + m + ' = ' + a + ' m/s².' };
      } },
      { id: 'force', title: 'Find the force', gen: function (b, r) {
        var m, a, g, v, t;
        if (b <= 1) { m = pick(r, [2, 3, 4, 5]); a = INT(r, 2, 5);
          return { prompt: 'A ' + m + ' kg cart accelerates at ' + a + ' m/s². What net force acts on it?', answer: m * a, unit: 'N', hint: 'Multiply mass by acceleration.', worked: 'F = m a = ' + m + ' × ' + a + ' = ' + (m * a) + ' N.' }; }
        if (b === 2) { m = pick(r, [0.5, 1.5, 2.5]); a = pick(r, [2, 4]);
          return { prompt: 'A ' + m + ' kg cart accelerates at ' + a + ' m/s². What net force acts on it?', answer: m * a, unit: 'N', hint: 'F = m a.', worked: 'F = ' + m + ' × ' + a + ' = ' + (m * a) + ' N.' }; }
        if (b === 3) { g = pick(r, [500, 1500, 2500]); a = pick(r, [2, 4]);
          return { prompt: 'A ' + g + ' g cart accelerates at ' + a + ' m/s². What net force acts on it, in newtons?', answer: g / 1000 * a, unit: 'N', hint: 'Change grams to kilograms first.', worked: g + ' g = ' + (g / 1000) + ' kg. F = ' + (g / 1000) + ' × ' + a + ' = ' + (g / 1000 * a) + ' N.' }; }
        m = pick(r, [2, 3, 4]); a = pick(r, [2, 3]); t = pick(r, [2, 4]); v = a * t;
        return { prompt: 'A ' + m + ' kg cart starts from rest and reaches ' + v + ' m/s in ' + t + ' s. What net force acted on it?', answer: m * a, unit: 'N', hint: 'Find the acceleration first: speed change divided by time.', worked: 'a = ' + v + ' / ' + t + ' = ' + a + ' m/s². F = ' + m + ' × ' + a + ' = ' + (m * a) + ' N.' };
      } }
    ],

    /* Teacher key: what students get wrong, and the one-line fix. */
    misconceptions: [
      { say: 'A bigger force means a bigger speed.', fix: 'Force sets how fast the speed changes, not the speed itself.' },
      { say: 'The heavier cart falls or moves faster.', fix: 'More mass means less acceleration for the same force.' },
      { say: 'Subtract mass from force.', fix: 'Divide. Check the units: N / kg = m/s².' }
    ],

    /* Pacing: core (prio 1) is at most 60% of the budget. Huddles come from the clock, not from progress. */
    pacing: { budgetMin: 42,
      steps: [
        { id: 'start', prio: 1, min: 2 }, { id: 'warmup', prio: 1, min: 4 }, { id: 'predict', prio: 1, min: 4 },
        { id: 'explore', prio: 3, min: 8 }, { id: 'build', prio: 2, min: 8, minItems: 2, parts: 4 },
        { id: 'practice', prio: 1, min: 8 }, { id: 'check', prio: 1, min: 4 }
      ],
      huddles: [{ key: 'h1', atMin: 18 }] }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = SPEC; else (root.SPECS = root.SPECS || {})[SPEC.id] = SPEC;
})(typeof window !== 'undefined' ? window : globalThis);
