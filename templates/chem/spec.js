/* TEMPLATE SPEC (chemistry). Plain data, no DOM: the lesson page, the key PDFs and the unit tests all read this one file.
   Numbers are answered as plain numbers on the keypad; say the unit in the prompt ("in units of 10²³"). Keep every sentence short. */
(function (root) {
  'use strict';
  var INT = function (r, a, b) { return a + Math.floor(r() * (b - a + 1)); };
  var pick = function (r, arr) { return arr[Math.floor(r() * arr.length)]; };
  var r2 = function (x) { return Math.round(x * 100) / 100; };
  var NA = 6.02;

  var SPEC = {
    id: 'tpl-chem', course: 'chem', unit: 'Template', title: 'Counting Particles (template)',
    question: 'How do we count things too small to see?',
    targets: ['I can say what a mole is.', 'I can turn grams into moles with molar mass.', 'I can turn moles into a count of particles.'],
    tabs: ['Warm-up', 'Predict', 'Explore', 'Huddle', 'Build', 'Practice', 'Check'],
    huddleTarget: 'I can define a mole and molar mass.',

    concepts: [
      { title: 'Mole', points: ['A counting unit, like a dozen.', 'One mole is 6.02 × 10²³ particles.'], eq: '1 mol = 6.02 × 10²³' },
      { title: 'Molar mass', points: ['Grams in one mole.', 'Add the atomic masses in the formula.'], eq: 'n = m / M' }
    ],

    huddle: {
      defs: [
        { term: 'Mole', text: 'The amount that holds [[6.02 × 10²³]] particles.' },
        { term: 'Molar mass', text: 'The [[mass]] of one mole, in grams per mole.' }
      ],
      example: { prompt: 'How many moles are in 36 g of water? (M = 18 g/mol)',
        steps: ['n = m / M', 'n = 36 / 18 = [[2]] mol', 'Particles: 2 × 6.02 × 10²³ = [[12.04]] × 10²³'] },
      label: { title: 'Label the water molecule',
        html: '<svg viewBox="0 0 320 140" role="img" aria-label="A water molecule: one oxygen atom bonded to two hydrogen atoms"><line x1="160" y1="60" x2="95" y2="105" stroke="#7a8a99" stroke-width="5"/><line x1="160" y1="60" x2="225" y2="105" stroke="#7a8a99" stroke-width="5"/><circle cx="160" cy="55" r="30" fill="#e5533d" stroke="#142230"/><circle cx="90" cy="108" r="18" fill="#e8eef5" stroke="#142230"/><circle cx="230" cy="108" r="18" fill="#e8eef5" stroke="#142230"/><text x="150" y="61" font-size="16" fill="#fff">O</text><text x="84" y="114" font-size="14">H</text><text x="224" y="114" font-size="14">H</text><text x="196" y="40" font-size="14">1</text><text x="116" y="150" font-size="14">2</text><text x="150" y="96" font-size="14">3</text></svg>',
        tags: [{ n: 1, text: 'The [[oxygen]] atom.' }, { n: 2, text: 'A [[hydrogen]] atom.' }, { n: 3, text: 'The [[bond]] that holds them.' }] }
    },

    predicts: [
      { id: 'P1', title: 'Which has more particles?', prompt: 'One mole of water and one mole of iron. Which holds more particles?',
        options: ['Iron', 'Water', 'The same number', 'Cannot tell'], answer: 2, why: 'A mole is a count. One mole of anything is 6.02 × 10²³ particles.' },
      { id: 'P2', title: 'Which weighs more?', prompt: 'Same two samples: one mole of water and one mole of iron. Which has more mass?',
        options: ['Water', 'Iron', 'The same mass', 'Cannot tell'], answer: 1, why: 'Same count, but each iron atom is heavier than a water molecule (56 g/mol vs 18 g/mol).' }
    ],
    observe: [
      { id: 'O1', prompt: 'You double the grams of water. The number of molecules…', options: ['doubles', 'stays the same', 'halves'], answer: 0 }
    ],

    skills: [
      { id: 'moles', title: 'Grams to moles', gen: function (b, r) {
        var M, n, m, name;
        if (b <= 1) { n = INT(r, 2, 5); M = 18; m = n * M;
          return { prompt: 'A sample of water has a mass of ' + m + ' g. Water has a molar mass of 18 g/mol. How many moles is that?', answer: n, unit: 'mol', hint: 'Divide the mass by the molar mass.', worked: 'n = m / M = ' + m + ' / 18 = ' + n + ' mol.' }; }
        if (b === 2) { var e = pick(r, [['carbon', 12], ['sodium', 23], ['magnesium', 24]]); n = pick(r, [0.5, 1.5, 2.5, 3]); M = e[1]; m = n * M;
          return { prompt: 'A sample of ' + e[0] + ' has a mass of ' + r2(m) + ' g. Its molar mass is ' + M + ' g/mol. How many moles is that?', answer: n, unit: 'mol', hint: 'n = m / M.', worked: 'n = ' + r2(m) + ' / ' + M + ' = ' + n + ' mol.' }; }
        if (b === 3) { var f = pick(r, [['CO₂', 44], ['NaCl', 58], ['CH₄', 16]]); n = pick(r, [0.25, 0.5, 2, 3]); M = f[1]; m = n * M;
          return { prompt: 'A sample of ' + f[0] + ' has a mass of ' + r2(m) + ' g. The molar mass of ' + f[0] + ' is ' + M + ' g/mol. How many moles is the sample?', answer: n, unit: 'mol', hint: 'n = m / M.', worked: 'n = ' + r2(m) + ' / ' + M + ' = ' + n + ' mol.' }; }
        M = pick(r, [18, 44, 58]); n = pick(r, [0.5, 1.5, 2]); m = n * M;
        return { prompt: 'You weigh out ' + r2(m) + ' g of a compound with M = ' + M + ' g/mol. How many moles do you have? Answer in mol.', answer: n, unit: 'mol', hint: 'Divide mass by molar mass.', worked: 'n = ' + r2(m) + ' / ' + M + ' = ' + n + ' mol.' };
      } },
      { id: 'particles', title: 'Moles to particles', gen: function (b, r) {
        var n;
        if (b <= 1) { n = pick(r, [1, 2, 3]);
          return { prompt: 'How many particles are in ' + n + ' mol? Give the answer in units of 10²³ (so 6.02 × 10²³ is written 6.02).', answer: r2(n * NA), unit: '× 10²³', hint: 'Multiply the moles by 6.02.', worked: n + ' × 6.02 = ' + r2(n * NA) + ', so ' + r2(n * NA) + ' × 10²³ particles.' }; }
        if (b === 2) { n = pick(r, [0.5, 1.5, 2.5]);
          return { prompt: 'How many particles are in ' + n + ' mol? Answer in units of 10²³.', answer: r2(n * NA), unit: '× 10²³', hint: 'n × 6.02.', worked: n + ' × 6.02 = ' + r2(n * NA) + ' × 10²³.' }; }
        if (b === 3) { n = pick(r, [0.25, 0.1, 4]);
          return { prompt: 'How many particles are in ' + n + ' mol? Answer in units of 10²³.', answer: r2(n * NA), unit: '× 10²³', hint: 'n × 6.02.', worked: n + ' × 6.02 = ' + r2(n * NA) + ' × 10²³.' }; }
        var M = 18, g = pick(r, [9, 27, 54]); n = g / M;
        return { prompt: 'How many water molecules are in ' + g + ' g of water (M = 18 g/mol)? Answer in units of 10²³.', answer: r2(n * NA), unit: '× 10²³', hint: 'Grams to moles first, then moles to particles.', worked: 'n = ' + g + ' / 18 = ' + n + ' mol. Particles = ' + n + ' × 6.02 = ' + r2(n * NA) + ' × 10²³.' };
      } }
    ],

    misconceptions: [
      { say: 'A mole is a mass.', fix: 'A mole is a count: 6.02 × 10²³ things.' },
      { say: 'Multiply the mass by the molar mass.', fix: 'Divide. Grams ÷ (grams per mole) leaves moles.' },
      { say: 'More mass always means more particles.', fix: 'Compare moles, not grams: heavier particles weigh more for the same count.' }
    ],

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
