/* SPEC (calculus 3.1): the lesson page, the key PDFs and the unit tests all read this one file.
   Math is written the way qkit writes it: $x^2$ in prompts, and answers in mathcheck syntax. Huddle text is plain text (no $ math).
   Each typed generator also returns `src`, the function itself in mathcheck syntax, so tests/unit/chain-rule.test.js can check the answer
   against a numeric derivative that does not use the chain rule. */
(function (root) {
  'use strict';
  var INT = function (r, a, b) { return a + Math.floor(r() * (b - a + 1)); };
  var pick = function (r, arr) { return arr[Math.floor(r() * arr.length)]; };
  var shuffle = function (r, arr) { var a = arr.slice(), i, j, t; for (i = a.length - 1; i > 0; i--) { j = Math.floor(r() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  var pw = function (base, k) { return k === 1 ? base : base + '^' + k; };               // mathcheck text
  var pt = function (base, k) { return k === 1 ? base : base + '^{' + k + '}'; };         // TeX
  var co = function (c) { return c === 1 ? '' : String(c); };                             // coefficient, 1 left off

  var SPEC = {
    id: '3-1-chain-rule', course: 'calc', unit: 'Unit 3 · Composite, Implicit and Inverse', title: '3.1 The Chain Rule',
    question: 'How fast does a function of a function change?',
    targets: ['I can name the inside and the outside of a composite function.', 'I can differentiate a composite function with the chain rule.', 'I can find a slope at a point from a table.'],
    tabs: ['Warm-up', 'Predict', 'Explore', 'Huddle', 'Build', 'Practice', 'Check'],
    huddleTarget: 'I can state the chain rule and use it.',
    buildTarget: 'I can use the chain rule on a new problem.',

    concepts: [
      { title: 'Composite function', points: ['The output of the inside becomes the input of the outside.', 'The outside never sees x directly.'], eq: 'y = f(g(x))' },
      { title: 'The chain rule', points: ['Differentiate the outside and leave the inside alone.', 'Then multiply by the derivative of the inside.'], eq: 'd/dx f(g(x)) = f′(g(x)) · g′(x)' },
      { title: 'Layers', points: ['Each layer adds one factor.', 'Peel from the outside in.'], eq: 'dy/dx = dy/du · du/dx' },
      { title: 'Reading a table', points: ['Find g(a) first.', 'Read f′ at that output, not at a.'], eq: 'h′(a) = f′(g(a)) · g′(a)' }
    ],

    huddle: {
      defs: [
        { term: 'Composite function', text: 'One function fed into another. The [[inside]] runs first.' },
        { term: 'Chain rule', text: 'Differentiate the [[outside]], leave the inside, then multiply by the [[inside′]].' },
        { term: 'Reading a table', text: 'To read h′(a), find [[g(a)]] first.' }
      ],
      example: { prompt: 'Differentiate y = sin(x² − 3).',
        steps: ['Inside: u = x² − 3, so du/dx = [[2x]]', 'Outside: sin u, so dy/du = [[cos u]]', 'Multiply: dy/dx = [[2x·cos(x²−3)]]'] },
      label: { title: 'Label the assembly line',
        html: '<svg viewBox="0 0 360 120" role="img" aria-label="x goes into an inside machine, then an outside machine, and y comes out"><text x="8" y="66" font-size="18" fill="#142230">x</text><line x1="26" y1="62" x2="64" y2="62" stroke="#142230" stroke-width="2"/><rect x="64" y="38" width="90" height="48" rx="8" fill="none" stroke="#2b4fd9" stroke-width="3"/><text x="82" y="68" font-size="17" fill="#2b4fd9">x² − 3</text><line x1="154" y1="62" x2="196" y2="62" stroke="#142230" stroke-width="2"/><text x="164" y="52" font-size="16" fill="#142230">u</text><rect x="196" y="38" width="80" height="48" rx="8" fill="none" stroke="#b3412e" stroke-width="3"/><text x="216" y="68" font-size="17" fill="#b3412e">sin u</text><line x1="276" y1="62" x2="318" y2="62" stroke="#142230" stroke-width="2"/><text x="326" y="66" font-size="18" fill="#142230">y</text><circle cx="109" cy="24" r="10" fill="none" stroke="#142230"/><text x="105" y="29" font-size="13">1</text><circle cx="236" cy="24" r="10" fill="none" stroke="#142230"/><text x="232" y="29" font-size="13">2</text><circle cx="160" cy="100" r="10" fill="none" stroke="#142230"/><text x="156" y="105" font-size="13">3</text></svg>',
        tags: [{ n: 1, text: 'The first machine is the [[inside]] function.' }, { n: 2, text: 'The last machine is the [[outside]] function.' }, { n: 3, text: 'The middle value u is the [[output]] of the inside.' }] }
    },

    predicts: [
      { id: 'P1', title: 'A missing factor', prompt: 'Expand: $y=(3x)^2=9x^2$, so the slope is $18x$. The outside rule alone gives $2(3x)=6x$. What factor is missing?',
        options: ['3, the slope of the inside', '2, the power', '9, the coefficient', 'Nothing is missing'], answer: 0, why: '6x times 3 is 18x. The inside 3x changes at rate 3, and that rate multiplies in.' },
      { id: 'P2', title: 'Two gears', prompt: 'The value $y$ changes 2 units for every 1 unit of $u$. The value $u$ changes 5 units for every 1 unit of $x$. How many units does $y$ change per unit of $x$?',
        options: ['7', '10', '2.5', '3'], answer: 1, why: 'The rates multiply: 2 times 5 is 10.' }
    ],
    observe: [
      { id: 'O1', prompt: 'The slope readout equals…', options: ['dy/du times du/dx', 'dy/du plus du/dx', 'dy/du alone'], answer: 0 },
      { id: 'O2', prompt: 'At $x=0$ the inside rate $du/dx$ is 0. The tangent there is…', options: ['flat', 'steep', 'vertical'], answer: 0 }
    ],

    skills: [
      { id: 'chain', title: 'Differentiate a composite', gen: function (b, r) {
        var n, a, c, s, f, d;
        if (b <= 1) { n = INT(r, 2, 5); a = INT(r, 2, 9); f = '(x+' + a + ')^' + n;
          return { type: 'expr', src: f, prompt: 'Differentiate. Leave the inside alone.', label: '$\\dfrac{d}{dx}\\,(x+' + a + ')^{' + n + '}=$', answer: n + pw('(x+' + a + ')', n - 1), vars: ['x'],
            hints: ['The outside is "something to the power ' + n + '". The inside is $x+' + a + '$.', 'Bring the ' + n + ' down and lower the power. Keep $x+' + a + '$ as it is.', 'The inside has slope 1, so nothing more multiplies.'],
            traps: [{ expr: pw('x', n - 1) === 'x' ? String(n) + 'x' : n + pw('x', n - 1), msg: 'The $+' + a + '$ vanished. Leave the inside exactly as it was.' }],
            worked: 'Outside: bring down ' + n + ', lower the power. Inside $x+' + a + '$ stays. So $' + n + pt('(x+' + a + ')', n - 1) + '$.' }; }
        if (b === 2) { n = INT(r, 2, 4); c = INT(r, 2, 5); a = INT(r, 1, 6); f = '(' + c + 'x+' + a + ')^' + n;
          return { type: 'expr', src: f, prompt: 'Differentiate. Multiply by the slope of the inside.', label: '$\\dfrac{d}{dx}\\,(' + c + 'x+' + a + ')^{' + n + '}=$', answer: (c * n) + pw('(' + c + 'x+' + a + ')', n - 1), vars: ['x'],
            hints: ['Inside: $' + c + 'x+' + a + '$. Its slope is ' + c + '.', 'Outside: bring down ' + n + ' and lower the power.', 'Multiply the two: ' + n + ' times ' + c + '.'],
            traps: [{ expr: n + pw('(' + c + 'x+' + a + ')', n - 1), msg: 'You did the outside only. Multiply by the slope of the inside, ' + c + '.' }],
            worked: 'Outside: $' + n + pt('(' + c + 'x+' + a + ')', n - 1) + '$. Inside slope: ' + c + '. Product: $' + (c * n) + pt('(' + c + 'x+' + a + ')', n - 1) + '$.' }; }
        if (b === 3) { s = r(); c = INT(r, 2, 5);
          if (s < 0.34) return { type: 'expr', src: 'e^(' + c + 'x^2)', prompt: 'Differentiate.', label: '$\\dfrac{d}{dx}\\,e^{' + c + 'x^{2}}=$', answer: (2 * c) + 'x*e^(' + c + 'x^2)', vars: ['x'],
            hints: ['Inside: $' + c + 'x^{2}$, with slope $' + (2 * c) + 'x$.', 'Outside: $e^{u}$ stays $e^{u}$.'], traps: [{ expr: 'e^(' + c + 'x^2)', msg: 'The exponent changes too. Multiply by its slope, $' + (2 * c) + 'x$.' }],
            worked: '$e^{u}$ stays $e^{u}$; the inside $u=' + c + 'x^{2}$ has slope $' + (2 * c) + 'x$. So $' + (2 * c) + 'x\\,e^{' + c + 'x^{2}}$.' };
          if (s < 0.67) return { type: 'expr', src: 'sin(' + c + 'x^2)', prompt: 'Differentiate.', label: '$\\dfrac{d}{dx}\\,\\sin(' + c + 'x^{2})=$', answer: (2 * c) + 'x*cos(' + c + 'x^2)', vars: ['x'],
            hints: ['Inside: $' + c + 'x^{2}$, with slope $' + (2 * c) + 'x$.', 'Outside: the derivative of sine is cosine.'], traps: [{ expr: 'cos(' + c + 'x^2)', msg: 'The inside changes too. Multiply by $' + (2 * c) + 'x$.' }],
            worked: 'Outside: $\\cos(' + c + 'x^{2})$. Inside slope: $' + (2 * c) + 'x$. Product: $' + (2 * c) + 'x\\cos(' + c + 'x^{2})$.' };
          a = INT(r, 1, 6);
          return { type: 'expr', src: 'cos(' + c + 'x+' + a + ')', prompt: 'Differentiate.', label: '$\\dfrac{d}{dx}\\,\\cos(' + c + 'x+' + a + ')=$', answer: '-' + c + 'sin(' + c + 'x+' + a + ')', vars: ['x'],
            hints: ['Inside: $' + c + 'x+' + a + '$, with slope ' + c + '.', 'The derivative of cosine is negative sine.'], traps: [{ expr: c + 'sin(' + c + 'x+' + a + ')', msg: 'Check the sign: the derivative of cosine is $-\\sin$.' }, { expr: '-sin(' + c + 'x+' + a + ')', msg: 'You did the outside only. Multiply by the inside slope, ' + c + '.' }],
            worked: 'Outside: $-\\sin(' + c + 'x+' + a + ')$. Inside slope: ' + c + '. Product: $-' + c + '\\sin(' + c + 'x+' + a + ')$.' }; }
        s = r(); c = INT(r, 2, 5);
        if (s < 0.34) { n = INT(r, 2, 4);
          return { type: 'expr', src: 'sin(' + c + 'x)^' + n, prompt: 'Differentiate. Peel every layer.', label: '$\\dfrac{d}{dx}\\,\\sin^{' + n + '}(' + c + 'x)=$', answer: (n * c) + '*sin(' + c + 'x)^' + (n - 1) + '*cos(' + c + 'x)', vars: ['x'],
            hints: ['Three layers: the power ' + n + ', then sine, then $' + c + 'x$.', 'Outside in: $' + n + '\\sin^{' + (n - 1) + '}(' + c + 'x)$, then $\\cos(' + c + 'x)$, then ' + c + '.'],
            traps: [{ expr: n + '*sin(' + c + 'x)^' + (n - 1), msg: 'You peeled one layer. Sine and $' + c + 'x$ still need their factors.' }, { expr: (n) + '*sin(' + c + 'x)^' + (n - 1) + '*cos(' + c + 'x)', msg: 'One factor is missing: the slope of $' + c + 'x$, which is ' + c + '.' }],
            worked: 'Layer 1: $' + n + '\\sin^{' + (n - 1) + '}(' + c + 'x)$. Layer 2: $\\cos(' + c + 'x)$. Layer 3: ' + c + '. Product: $' + (n * c) + '\\sin^{' + (n - 1) + '}(' + c + 'x)\\cos(' + c + 'x)$.' }; }
        if (s < 0.67) { a = INT(r, 1, 9);
          return { type: 'expr', src: 'ln(x^2+' + a + ')', prompt: 'Differentiate.', label: '$\\dfrac{d}{dx}\\,\\ln(x^{2}+' + a + ')=$', answer: '2x/(x^2+' + a + ')', vars: ['x'],
            hints: ['Outside: $\\ln u$ has derivative $1/u$.', 'Inside: $x^{2}+' + a + '$ has slope $2x$.'], traps: [{ expr: '1/(x^2+' + a + ')', msg: 'The inside has slope $2x$, and it goes on top.' }],
            worked: '$\\dfrac{1}{x^{2}+' + a + '}\\cdot 2x=\\dfrac{2x}{x^{2}+' + a + '}$.' }; }
        a = INT(r, 1, 9);
        return { type: 'expr', src: 'sqrt(x^2+' + a + ')', prompt: 'Differentiate. Rewrite the root as a power if that helps.', label: '$\\dfrac{d}{dx}\\,\\sqrt{x^{2}+' + a + '}=$', answer: 'x/sqrt(x^2+' + a + ')', vars: ['x'],
          hints: ['$\\sqrt{u}=u^{1/2}$, with derivative $\\tfrac{1}{2}u^{-1/2}$.', 'Inside: $x^{2}+' + a + '$ has slope $2x$.'], traps: [{ expr: '1/(2sqrt(x^2+' + a + '))', msg: 'You did the outside only. Multiply by the inside slope $2x$.' }],
          worked: '$\\dfrac{1}{2\\sqrt{x^{2}+' + a + '}}\\cdot 2x=\\dfrac{x}{\\sqrt{x^{2}+' + a + '}}$.' };
      } },

      { id: 'inside', title: 'Name the inside', gen: function (b, r) {
        var n, a, c, opts, ans, order;
        function ask(prompt, right, wrong, hint, worked) { order = shuffle(r, [right].concat(wrong)); return { type: 'choice', prompt: prompt, options: order, answer: order.indexOf(right), hint: hint, worked: worked }; }
        if (b <= 1) { n = INT(r, 2, 5); a = INT(r, 2, 9);
          return ask('In $y=(x+' + a + ')^{' + n + '}$, the inside function is…', 'x + ' + a, ['x' + ['', '', '²', '³', '⁴', '⁵'][n], String(a), 'y'],
            'The inside is what x goes into first.', 'x goes into $x+' + a + '$ first; then the result is raised to the power ' + n + '.'); }
        if (b === 2) { c = INT(r, 2, 6);
          return ask('In $y=\\sin(' + c + 'x)$, which function is the outside?', 'sin', [c + 'x', String(c), 'x'],
            'The outside is the last function applied.', 'x is multiplied by ' + c + ' first. Sine is applied last, so sine is the outside.'); }
        if (b === 3) { a = INT(r, 2, 8);
          return ask('In $y=e^{\\sin x}$, the inside function is…', 'sin x', ['eˣ', 'e^(sin x)', 'x'],
            'What does x go into first?', 'x goes into sine first. The exponential is applied to that output.'); }
        c = INT(r, 2, 6);
        return ask('How many factors does the derivative of $y=\\sin\\left(\\sqrt{x^{2}+' + c + '}\\right)$ have?', 'Three', ['One', 'Two', 'Four'],
          'Count the layers: each layer adds one factor.', 'Three layers: sine, the square root, and $x^{2}+' + c + '$. Each gives one factor.');
      } },

      { id: 'table', title: 'Read a table', gen: function (b, r) {
        var a, s, t, m, d, v, ans;
        a = INT(r, 1, 4); s = INT(r, 1, 6); t = INT(r, 2, 5); m = INT(r, 2, 5);
        if (b <= 1) { ans = m * t;
          return { type: 'num', prompt: 'A table gives $g(' + a + ')=' + s + '$, $g\'(' + a + ')=' + t + '$ and $f\'(' + s + ')=' + m + '$. Let $h(x)=f(g(x))$. Find $h\'(' + a + ')$.', answer: ans,
            hint: 'h′(a) = f′(g(a)) · g′(a). Here g(' + a + ') = ' + s + ', so read f′ at ' + s + '.', worked: '$h\'(' + a + ')=f\'(g(' + a + '))\\cdot g\'(' + a + ')=f\'(' + s + ')\\cdot g\'(' + a + ')=' + m + '\\cdot' + t + '=' + ans + '$.' }; }
        if (b === 2) { t = -t; d = INT(r, 2, 6); ans = m * t;
          return { type: 'num', prompt: 'A table gives $f\'(' + a + ')=' + d + '$, $g(' + a + ')=' + s + '$, $g\'(' + a + ')=' + t + '$ and $f\'(' + s + ')=' + m + '$. Let $h(x)=f(g(x))$. Find $h\'(' + a + ')$.', answer: ans,
            hint: 'Find g(' + a + ') first. Then read f′ at that output, not at ' + a + '.', worked: 'g(' + a + ') = ' + s + ', so $h\'(' + a + ')=f\'(' + s + ')\\cdot g\'(' + a + ')=' + m + '\\cdot(' + t + ')=' + ans + '$. The value $f\'(' + a + ')$ is a distractor.' }; }
        if (b === 3) { d = INT(r, 2, 6); if (r() < 0.5) t = -t; ans = m * t;
          return { type: 'num', prompt: 'A table gives $f(' + a + ')=' + s + '$, $f\'(' + a + ')=' + t + '$, $g\'(' + a + ')=' + d + '$ and $g\'(' + s + ')=' + m + '$. Let $h(x)=g(f(x))$. Find $h\'(' + a + ')$.', answer: ans,
            hint: 'Now f is the inside. h′(a) = g′(f(a)) · f′(a). Find f(' + a + ') first.', worked: 'f(' + a + ') = ' + s + ', so $h\'(' + a + ')=g\'(' + s + ')\\cdot f\'(' + a + ')=' + m + '\\cdot(' + t + ')=' + ans + '$.' }; }
        v = INT(r, -4, 9); if (r() < 0.5) t = -t; ans = v + m * t;
        return { type: 'num', prompt: 'A table gives $g(' + a + ')=' + s + '$, $g\'(' + a + ')=' + t + '$, $f(' + s + ')=' + v + '$ and $f\'(' + s + ')=' + m + '$. Let $h(x)=f(g(x))$. The tangent line to $h$ at $x=' + a + '$ is used to estimate $h(' + (a + 1) + ')$. Find the estimate.', answer: ans,
          hint: 'The line starts at h(a) = f(g(a)) and rises by h′(a) for each step of 1 in x.', worked: '$h(' + a + ')=f(' + s + ')=' + v + '$ and $h\'(' + a + ')=' + m + '\\cdot(' + t + ')=' + (m * t) + '$. One step right gives $' + v + '+(' + (m * t) + ')=' + ans + '$.' };
      } },

      { id: 'point', title: 'Slope at a point', gen: function (b, r) {
        var n, a, c, pair, ans;
        if (b <= 1) { n = INT(r, 2, 3); a = INT(r, 1, 3); c = INT(r, 1, 2); ans = n * Math.pow(c + a, n - 1);
          return { type: 'num', prompt: 'Let $y=(x+' + a + ')^{' + n + '}$. Find the slope of the curve at $x=' + c + '$.', answer: ans, hint: 'Differentiate first: ' + n + '(x + ' + a + ')^' + (n - 1) + '. Then put in x = ' + c + '.',
            worked: '$y\'=' + n + pt('(x+' + a + ')', n - 1) + '$, so at $x=' + c + '$ the slope is $' + n + '\\cdot' + Math.pow(c + a, n - 1) + '=' + ans + '$.' }; }
        if (b === 2) { n = INT(r, 2, 3); c = INT(r, 2, 4); a = INT(r, 1, 3); ans = c * n * Math.pow(c + a, n - 1);
          return { type: 'num', prompt: 'Let $y=(' + c + 'x+' + a + ')^{' + n + '}$. Find the slope of the curve at $x=1$.', answer: c * n * Math.pow(c + a, n - 1), hint: 'y′ = ' + n + '(' + c + 'x + ' + a + ')^' + (n - 1) + ' · ' + c + '. Put in x = 1.',
            worked: '$y\'=' + (c * n) + pt('(' + c + 'x+' + a + ')', n - 1) + '$, so at $x=1$ the slope is $' + (c * n) + '\\cdot' + Math.pow(c + a, n - 1) + '=' + ans + '$.' }; }
        if (b === 3) { a = INT(r, 1, 8); c = INT(r, 1, 4); ans = 2 * c / (c * c + a);
          return { type: 'num', prompt: 'Let $y=\\ln(x^{2}+' + a + ')$. Find the slope of the curve at $x=' + c + '$.', answer: ans, hint: 'y′ = 2x/(x² + ' + a + '). Put in x = ' + c + '.',
            worked: '$y\'=\\dfrac{2x}{x^{2}+' + a + '}$, so at $x=' + c + '$ the slope is $\\dfrac{' + (2 * c) + '}{' + (c * c + a) + '}$.' }; }
        pair = pick(r, [[3, 16], [4, 9], [2, 5], [5, 144], [1, 3], [6, 64], [3, 7], [4, 33]]); ans = pair[0] / Math.sqrt(pair[0] * pair[0] + pair[1]);
        return { type: 'num', prompt: 'Let $y=\\sqrt{x^{2}+' + pair[1] + '}$. Find the slope of the curve at $x=' + pair[0] + '$.', answer: ans, hint: 'y′ = x/√(x² + ' + pair[1] + '). Put in x = ' + pair[0] + '.',
          worked: '$y\'=\\dfrac{x}{\\sqrt{x^{2}+' + pair[1] + '}}$, so at $x=' + pair[0] + '$ the slope is $\\dfrac{' + pair[0] + '}{\\sqrt{' + (pair[0] * pair[0] + pair[1]) + '}}=' + (Math.round(ans * 1e4) / 1e4) + '$.' };
      } }
    ],

    misconceptions: [
      { say: 'The derivative of sin(x²) is cos(x²).', fix: 'The inside also changes. Multiply by its slope, 2x.' },
      { say: 'The derivative of (3x + 1)⁴ is 4(3x + 1)³.', fix: 'That is the outside only. Multiply by the inside slope, 3.' },
      { say: 'Read h′(a) as f′(a) · g′(a).', fix: 'f′ is read at g(a), the output of the inside. Find g(a) first.' },
      { say: 'Stop after one layer of cos³(4x).', fix: 'Peel every layer: the power, then cosine, then 4x. Each gives a factor.' }
    ],

    pacing: { budgetMin: 42,
      steps: [
        { id: 'start', prio: 1, min: 2 }, { id: 'warmup', prio: 1, min: 4 }, { id: 'predict', prio: 1, min: 3 },
        { id: 'explore', prio: 3, min: 8 }, { id: 'build', prio: 2, min: 8, minItems: 2, parts: 4 },
        { id: 'practice', prio: 1, min: 8 }, { id: 'check', prio: 1, min: 4 }
      ],
      huddles: [{ key: 'h1', atMin: 10 }] }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = SPEC; else (root.SPECS = root.SPECS || {})[SPEC.id] = SPEC;
})(typeof window !== 'undefined' ? window : globalThis);
