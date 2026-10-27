/* TEMPLATE SPEC (statistics). Plain data, no DOM: the lesson page, the key PDFs and the unit tests all read this one file.
   Numbers are answered on the digit keypad; no math typesetting (KaTeX is off unless a spec sets  math: true ).
   Every number here is invented, so every prompt says "pretend". Keep every sentence short. */
(function (root) {
  'use strict';
  var INT = function (r, a, b) { return a + Math.floor(r() * (b - a + 1)); };
  var pick = function (r, arr) { return arr[Math.floor(r() * arr.length)]; };
  var r2 = function (x) { return Math.round(x * 100) / 100; };

  var SPEC = {
    id: 'tpl-stats', course: 'stats', unit: 'Template', title: 'z-Scores (template)',
    question: 'How do we compare a score to a whole group?',
    targets: ['I can say what a z-score measures.', 'I can find a z-score from a value, a mean and a standard deviation.', 'I can use the 68-95-99.7 rule.'],
    tabs: ['Warm-up', 'Predict', 'Explore', 'Huddle', 'Build', 'Practice', 'Check'],
    huddleTarget: 'I can define z-score and standard deviation.',

    concepts: [
      { title: 'Standard deviation', points: ['How far values usually sit from the mean.', 'A big one means spread out.'], eq: 'SD = typical distance from the mean' },
      { title: 'z-score', points: ['Counts standard deviations from the mean.', 'Positive is above the mean. Negative is below.'], eq: 'z = (x − mean) / SD' },
      { title: '68-95-99.7 rule', points: ['About 68% of values are within 1 SD.', 'About 95% are within 2 SD. About 99.7% are within 3 SD.'], eq: '68 · 95 · 99.7' }
    ],

    huddle: {
      defs: [
        { term: 'Standard deviation', text: 'The typical [[distance]] from the mean.' },
        { term: 'z-score', text: 'The number of [[standard deviations]] a value is from the [[mean]].' }
      ],
      example: { prompt: 'Pretend quiz: mean 70, SD 10. Find z for a score of 85.',
        steps: ['Distance from the mean: 85 − 70 = [[15]]', 'Divide by the SD: 15 / 10 = [[1.5]]', 'So z = [[1.5]]. The score is above the mean.'] },
      label: { title: 'Label the bell curve',
        html: '<svg viewBox="0 0 320 150" role="img" aria-label="A bell curve with the mean at the center and one standard deviation marked on the right"><path d="M20 130 C 90 130 110 20 160 20 C 210 20 230 130 300 130" fill="#cfe0ff" stroke="#2b4fd9" stroke-width="3"/><line x1="160" y1="15" x2="160" y2="135" stroke="#142230" stroke-width="2"/><line x1="225" y1="95" x2="225" y2="135" stroke="#b3412e" stroke-width="2"/><line x1="20" y1="135" x2="300" y2="135" stroke="#7a8a99"/><text x="150" y="12" font-size="14">1</text><text x="215" y="90" font-size="14">2</text><text x="150" y="150" font-size="14">3</text></svg>',
        tags: [{ n: 1, text: 'The [[mean]], at the center.' }, { n: 2, text: 'One [[standard deviation]] above the mean.' }, { n: 3, text: 'The curve is [[symmetric]] about the mean.' }] }
    },

    predicts: [
      { id: 'P1', title: 'Above or below?', prompt: 'Pretend test: mean 60. Your score is 52. Is your z-score positive or negative?',
        options: ['Positive', 'Negative', 'Zero', 'Cannot tell'], answer: 1, why: 'The score is below the mean, so z is negative.' },
      { id: 'P2', title: 'Which is more unusual?', prompt: 'Pretend values: one has z = 0.5. Another has z = 2.5. Which is farther from typical?',
        options: ['z = 0.5', 'z = 2.5', 'Same', 'Cannot tell'], answer: 1, why: 'A bigger z (ignoring the sign) means farther from the mean.' }
    ],
    observe: [
      { id: 'O1', prompt: 'You slide the value up and keep the mean and SD fixed. The z-score…', options: ['goes up', 'stays the same', 'goes down'], answer: 0 }
    ],

    skills: [
      { id: 'zscore', title: 'Find a z-score', gen: function (b, r) {
        var mean, sd, z, x;
        if (b <= 1) { mean = 50; sd = pick(r, [5, 10]); z = INT(r, 1, 3); x = mean + z * sd;
          return { prompt: 'Pretend test: mean ' + mean + ', SD ' + sd + '. A score is ' + x + '. What is its z-score?', answer: z, unit: '', hint: 'Subtract the mean, then divide by the SD.', worked: '(' + x + ' − ' + mean + ') / ' + sd + ' = ' + z + '.' }; }
        if (b === 2) { mean = pick(r, [60, 70, 80]); sd = pick(r, [4, 10]); z = pick(r, [0.5, 1.5, 2.5]); x = mean + z * sd;
          return { prompt: 'Pretend test: mean ' + mean + ', SD ' + sd + '. A score is ' + r2(x) + '. What is its z-score?', answer: z, unit: '', hint: '(score − mean) / SD.', worked: '(' + r2(x) + ' − ' + mean + ') / ' + sd + ' = ' + z + '.' }; }
        if (b === 3) { mean = pick(r, [60, 70, 80]); sd = pick(r, [5, 8, 10]); z = -pick(r, [1, 1.5, 2]); x = mean + z * sd;
          return { prompt: 'Pretend test: mean ' + mean + ', SD ' + sd + '. A score is ' + r2(x) + '. What is its z-score? A score below the mean gives a negative z.', answer: z, unit: '', hint: '(score − mean) / SD. The top is negative.', worked: '(' + r2(x) + ' − ' + mean + ') / ' + sd + ' = ' + z + '.' }; }
        mean = pick(r, [12, 25, 100]); sd = pick(r, [2, 4, 15]); z = pick(r, [-2.5, -0.5, 1.25, 1.75, 2.25]); x = mean + z * sd;
        return { prompt: 'Pretend data: mean ' + mean + ', SD ' + sd + '. A value is ' + r2(x) + '. What is its z-score?', answer: z, unit: '', hint: 'Subtract the mean first. Then divide by the SD.', worked: '(' + r2(x) + ' − ' + mean + ') / ' + sd + ' = ' + z + '.' };
      } },
      { id: 'rule', title: 'The 68-95-99.7 rule', gen: function (b, r) {
        var thing = pick(r, ['bean pod lengths', 'quiz scores', 'bike trip times']), mean = pick(r, [40, 60, 80]), sd = pick(r, [5, 10]), k;
        if (b <= 1) { k = pick(r, [[1, 68], [2, 95]]);
          return { prompt: 'Pretend ' + thing + ' follow a normal curve: mean ' + mean + ', SD ' + sd + '. About what percent are within ' + k[0] + ' SD of the mean (between ' + (mean - k[0] * sd) + ' and ' + (mean + k[0] * sd) + ')?', answer: k[1], unit: '%', hint: 'Within 1 SD is 68%. Within 2 SD is 95%.', worked: 'Within ' + k[0] + ' SD is ' + k[1] + '%.' }; }
        if (b === 2) {
          return { prompt: 'Pretend ' + thing + ' follow a normal curve: mean ' + mean + ', SD ' + sd + '. About what percent are within 3 SD of the mean?', answer: 99.7, unit: '%', hint: 'Use the 68-95-99.7 rule.', worked: 'Within 3 SD is 99.7%.' }; }
        if (b === 3) {
          return { prompt: 'Pretend ' + thing + ' follow a normal curve: mean ' + mean + ', SD ' + sd + '. About what percent are above ' + (mean + sd) + ' (more than 1 SD above the mean)?', answer: 16, unit: '%', hint: '68% is in the middle. Split the rest into two equal tails.', worked: '100 − 68 = 32. Half of 32 is 16.' }; }
        return { prompt: 'Pretend ' + thing + ' follow a normal curve: mean ' + mean + ', SD ' + sd + '. About what percent are below ' + (mean - 2 * sd) + ' (more than 2 SD below the mean)?', answer: 2.5, unit: '%', hint: '95% is in the middle. Split the rest into two equal tails.', worked: '100 − 95 = 5. Half of 5 is 2.5.' };
      } }
    ],

    misconceptions: [
      { say: 'A negative z-score means a mistake.', fix: 'Negative means below the mean. It is a normal result.' },
      { say: 'Divide first, then subtract.', fix: 'Subtract the mean first, then divide by the SD.' },
      { say: '68% of the values are within 1 SD, so 32% are above.', fix: 'The other 32% splits into two tails: 16% above and 16% below.' }
    ],

    pacing: { budgetMin: 42,
      steps: [
        { id: 'start', prio: 1, min: 2 }, { id: 'warmup', prio: 1, min: 4 }, { id: 'predict', prio: 1, min: 4 },
        { id: 'explore', prio: 3, min: 8 }, { id: 'build', prio: 2, min: 8, minItems: 2, parts: 4 },
        { id: 'practice', prio: 1, min: 8 }, { id: 'check', prio: 1, min: 4 }
      ],
      huddles: [{ key: 'h1', atMin: 10 }] }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = SPEC; else (root.SPECS = root.SPECS || {})[SPEC.id] = SPEC;
})(typeof window !== 'undefined' ? window : globalThis);
