/* TEMPLATE SPEC (calculus). Plain data, no DOM: the lesson page, the key PDFs and the unit tests all read this one file.
   Math is written the way qkit writes it: $x^2$ in prompts, and answers in mathcheck syntax (5x^4, 1/(2sqrt(x)), e^x, sin(x), ln(x)).
   Typed answers are graded by numeric equivalence, so 4x^3+2x and 2x+4x^3 both pass.
   Huddle text is plain text (no $ math): use unicode such as xⁿ, f′ and ² there. */
(function (root) {
  'use strict';
  var INT = function (r, a, b) { return a + Math.floor(r() * (b - a + 1)); };
  var pick = function (r, arr) { return arr[Math.floor(r() * arr.length)]; };
  var px = function (k) { return k === 1 ? 'x' : 'x^' + k; };            // mathcheck text
  var pt = function (k) { return k === 1 ? 'x' : 'x^{' + k + '}'; };      // TeX

  var SPEC = {
    id: 'tpl-calc', course: 'calc', unit: 'Template', title: 'The Power Rule (template)',
    question: 'How fast does xⁿ change, for any n?',
    targets: ['I can state the power rule in words.', 'I can differentiate a polynomial term by term.', 'I can find the slope at a point.'],
    tabs: ['Warm-up', 'Predict', 'Explore', 'Huddle', 'Build', 'Practice', 'Check'],

    concepts: [
      { title: 'Derivative', points: ['The slope of the curve at a point.', 'The rate of change of the output.'], eq: "f′(x)" },
      { title: 'Power rule', points: ['Bring the power down in front.', 'Then lower the power by 1.'], eq: 'd/dx xⁿ = n xⁿ⁻¹' }
    ],

    huddle: {
      defs: [
        { term: 'Derivative', text: 'The [[slope]] of the tangent line at a point.' },
        { term: 'Power rule', text: 'Bring the [[power]] down, then [[subtract 1]] from it.' }
      ],
      example: { prompt: 'Differentiate f(x) = 4x³.',
        steps: ['Bring down the power: 3 · 4x', 'Lower the power by 1: 12x[[2]]', 'So f′(x) = [[12x²]]'] },
      label: { title: 'Label the slope',
        html: '<svg viewBox="0 0 320 150" role="img" aria-label="A curve with a tangent line at a point"><path d="M20 130 Q 120 120 180 70 T 300 15" fill="none" stroke="#2b4fd9" stroke-width="3"/><line x1="110" y1="125" x2="250" y2="45" stroke="#b3412e" stroke-width="2.5"/><circle cx="170" cy="85" r="5" fill="#142230"/><text x="176" y="102" font-size="14">1</text><text x="255" y="42" font-size="14">2</text></svg>',
        tags: [{ n: 1, text: 'The [[point]] where we measure the slope.' }, { n: 2, text: 'The [[tangent line]]; its slope is f′.' }] }
    },

    predicts: [
      { id: 'P1', title: 'Guess the pattern', prompt: 'The derivative of $x^2$ is $2x$. What do you expect for $x^3$?',
        options: ['$3x^2$', '$2x^3$', '$x^2$', '$3x$'], answer: 0, why: 'Bring the 3 down and lower the power: $3x^2$.' },
      { id: 'P2', title: 'A constant', prompt: 'What is the slope of the flat line $y=7$?',
        options: ['7', '0', '1', 'It has no slope'], answer: 1, why: 'A flat line does not rise: the derivative is 0.' }
    ],
    observe: [
      { id: 'O1', prompt: 'Zoom in on a smooth curve. It starts to look…', options: ['like a straight line', 'more curved', 'like a circle'], answer: 0 }
    ],

    /* type 'expr' = typed expression (qkit + keypad); type 'num' = a number. Level 1 = most support, 4 = least. */
    skills: [
      { id: 'diff', title: 'Differentiate', gen: function (b, r) {
        var n, a, c, d, k;
        if (b <= 1) { n = INT(r, 2, 6);
          return { type: 'expr', prompt: 'Differentiate.', label: '$\\dfrac{d}{dx}\\,x^{' + n + '}=$', answer: n + px(n - 1), vars: ['x'], hints: ['Bring the power down in front.', 'Then lower the power by 1.'],
            traps: [{ expr: 'x^' + (n - 1), msg: 'You lowered the power but forgot to bring ' + n + ' down.' }], worked: 'Bring down ' + n + ' and lower the power: $' + n + '' + pt(n - 1) + '$.' }; }
        if (b === 2) { n = INT(r, 2, 5); a = INT(r, 2, 6);
          return { type: 'expr', prompt: 'Differentiate.', label: '$\\dfrac{d}{dx}\\,' + a + 'x^{' + n + '}=$', answer: (a * n) + px(n - 1), vars: ['x'], hints: ['The ' + a + ' stays; multiply it by the power.', 'Then lower the power by 1.'],
            worked: 'Multiply ' + a + ' by ' + n + ' to get ' + (a * n) + ', then lower the power: $' + (a * n) + '' + pt(n - 1) + '$.' }; }
        if (b === 3) { n = INT(r, 3, 5); a = INT(r, 2, 5); c = INT(r, 2, 6); d = INT(r, 1, 9);
          return { type: 'expr', prompt: 'Differentiate term by term.', label: '$\\dfrac{d}{dx}\\,(' + a + 'x^{' + n + '}+' + c + 'x+' + d + ')=$', answer: (a * n) + px(n - 1) + '+' + c, vars: ['x'],
            hints: ['Do each term on its own.', 'The slope of ' + c + 'x is ' + c + '. A constant has slope 0.'], worked: '$' + (a * n) + '' + pt(n - 1) + '+' + c + '+0$. The constant ' + d + ' disappears.' }; }
        k = INT(r, 2, 6);
        return { type: 'expr', prompt: 'Differentiate. Rewrite the root as a power if that helps.', label: '$\\dfrac{d}{dx}\\,' + k + '\\sqrt{x}=$', answer: k + '/(2sqrt(x))', vars: ['x'],
          hints: ['$\\sqrt{x}=x^{1/2}$.', 'Bring down 1/2, then lower the power to $-1/2$.'], worked: '$' + k + 'x^{1/2}$ becomes $\\tfrac{' + k + '}{2}x^{-1/2}=\\dfrac{' + k + '}{2\\sqrt{x}}$.' };
      } },
      { id: 'slope', title: 'Slope at a point', gen: function (b, r) {
        var n = INT(r, 2, b >= 3 ? 4 : 3), a = b >= 2 ? INT(r, 2, 4) : 1, c = INT(r, 1, 3), ans = a * n * Math.pow(c, n - 1);
        return { type: 'num', prompt: 'Let $f(x)=' + (a === 1 ? '' : a) + 'x^{' + n + '}$. Find the slope of the curve at $x=' + c + '$.', answer: ans, hint: 'Find f′(x) first, then put in x = ' + c + '.',
          worked: '$f\'(x)=' + (a * n) + '' + pt(n - 1) + '$, so $f\'(' + c + ')=' + ans + '$.' };
      } }
    ],

    misconceptions: [
      { say: 'Differentiate x³ and get 3x³.', fix: 'The power drops by 1 as well as coming down.' },
      { say: 'The derivative of 7 is 7.', fix: 'A constant does not change, so its slope is 0.' },
      { say: 'Differentiate 5x² and get 5·2x·...', fix: 'Multiply the 5 by the power once: 10x.' }
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
