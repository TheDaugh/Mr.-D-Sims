/* SPEC (calculus 2.6): the lesson page, the key PDFs and the unit tests all read this one file.
   Math is written the way qkit writes it: $x^2$ in prompts, and answers in mathcheck syntax (5x^4, 1/x, e^x, ln(x)).
   Typed answers are graded by numeric equivalence. Huddle text is plain text (no $ math). */
(function (root) {
  'use strict';
  var INT = function (r, a, b) { return a + Math.floor(r() * (b - a + 1)); };
  var pick = function (r, arr) { return arr[Math.floor(r() * arr.length)]; };
  var co = function (a, s) { return a === 1 ? s : a + s; };                 // 1 -> s, 3 -> 3s (mathcheck text)
  var tc = function (a, s) { return a === 1 ? s : a + s; };                 // same for TeX
  var DDX = '\\dfrac{d}{dx}\\,';

  var SPEC = {
    id: '2-6-exp-log', course: 'calc', unit: 'Unit 2 · Differentiation', title: '2.6 Derivatives of eˣ and ln x',
    question: 'What is the slope of eˣ at every point, and of ln x?',
    targets: ['I can state the derivatives of eˣ and ln x.', 'I can differentiate sums that use both rules.', 'I can find slopes, tangent lines and normal lines.'],
    tabs: ['Warm-up', 'Predict', 'Explore', 'Huddle', 'Build', 'Practice', 'Check'],
    huddleTarget: 'I can state both rules and use them.',

    concepts: [
      { title: 'The curve eˣ', points: ['Its slope at a point equals its height there.', 'It never has a horizontal tangent.'], eq: 'd/dx eˣ = eˣ' },
      { title: 'The curve ln x', points: ['Its slope at x is the reciprocal of x.', 'The slopes shrink as x grows: it flattens out.'], eq: 'd/dx ln x = 1/x' },
      { title: 'Tangent and normal', points: ['Tangent: y − y₀ = m(x − x₀).', 'Normal: slope is the negative reciprocal, −1/m.'], eq: 'normal slope = −1/m' }
    ],

    huddle: {
      defs: [
        { term: 'eˣ', text: 'Its slope at any point equals its [[height]]: d/dx eˣ = [[eˣ]].' },
        { term: 'ln x', text: 'Its slope at x is the [[reciprocal]] of x: d/dx ln x = [[1/x]].' },
        { term: 'Horizontal tangent', text: 'The slope is [[zero]]. The curve eˣ never has one.' }
      ],
      example: { prompt: 'Find the slope of f(x) = ln x + 3x² at x = 1.',
        steps: ['f′(x) = 1/x + [[6x]]', 'f′(1) = 1 + [[6]]', 'So the slope is [[7]].'] },
      label: { title: 'Label the curve eˣ',
        html: '<svg viewBox="0 0 320 160" role="img" aria-label="The curve y = e to the x with a tangent line at a point"><line x1="20" y1="140" x2="310" y2="140" stroke="#7a8a99"/><line x1="60" y1="10" x2="60" y2="145" stroke="#7a8a99"/><path d="M20 138 C 90 136 150 128 195 100 S 262 40 292 8" fill="none" stroke="#2b4fd9" stroke-width="3"/><line x1="150" y1="130" x2="260" y2="62" stroke="#b3412e" stroke-width="2.5"/><circle cx="215" cy="90" r="5" fill="#142230"/><text x="222" y="108" font-size="14">1</text><text x="262" y="60" font-size="14">2</text><text x="30" y="125" font-size="14">3</text></svg>',
        tags: [{ n: 1, text: 'The [[point]] where we measure.' }, { n: 2, text: 'The [[tangent line]]: its slope equals the height.' }, { n: 3, text: 'The curve is [[y = eˣ]].' }] }
    },

    predicts: [
      { id: 'P1', title: 'The curve eˣ', prompt: 'The curve $y=e^x$ climbs faster and faster. As $x$ increases, its slopes will…',
        options: ['stay the same', 'keep growing', 'shrink toward 0', 'turn negative'], answer: 1, why: 'The curve gets steeper, so its slopes keep growing.' },
      { id: 'P2', title: 'The curve ln x', prompt: 'The curve $y=\\ln x$ rises but flattens out. As $x$ increases, its slopes will…',
        options: ['stay the same', 'keep growing', 'shrink toward 0', 'turn negative'], answer: 2, why: 'A flattening curve has slopes that shrink toward 0 (they are $1/x$).' }
    ],
    observe: [
      { id: 'O1', prompt: 'On $y=e^x$, the slope compared with the height $y$ is…', options: ['always equal', 'half of it', 'the square of it'], answer: 0 },
      { id: 'O2', prompt: 'On $y=\\ln x$ at $x=4$, the slope is…', options: ['4', '$\\tfrac14$', '$\\ln 4$'], answer: 1 }
    ],

    skills: [
      { id: 'diff', title: 'Differentiate', gen: function (b, r) {
        var a, p, q, s, k, c;
        if (b <= 1) {
          if (r() < 0.5) return { type: 'expr', prompt: 'Differentiate.', label: '$' + DDX + 'e^{x}=$', answer: 'e^x', vars: ['x'], hints: ['This curve is special: the slope equals the height.', 'The derivative is the same function.'],
            traps: [{ expr: 'x e^(x-1)', msg: 'The power rule is for xⁿ. In eˣ the variable is in the exponent, and eˣ is its own derivative.' }], worked: '$\\dfrac{d}{dx}e^{x}=e^{x}$.' };
          return { type: 'expr', prompt: 'Differentiate.', label: '$' + DDX + '\\ln x=$', answer: '1/x', vars: ['x'], hints: ['The slope of ln x at x is the reciprocal of x.'],
            traps: [{ expr: 'ln(x)', msg: 'The derivative of ln x is not ln x. Use the reciprocal rule.' }, { expr: 'e^x', msg: 'That is the derivative of eˣ. For ln x the slope is 1/x.' }], worked: '$\\dfrac{d}{dx}\\ln x=\\dfrac{1}{x}$.' };
        }
        if (b === 2) { a = INT(r, 2, 7);
          if (r() < 0.5) return { type: 'expr', prompt: 'Differentiate.', label: '$' + DDX + a + 'e^{x}=$', answer: a + 'e^x', vars: ['x'], hints: ['The ' + a + ' stays in front.', 'eˣ differentiates to eˣ.'], worked: 'The ' + a + ' stays: $' + a + 'e^{x}$.' };
          return { type: 'expr', prompt: 'Differentiate.', label: '$' + DDX + a + '\\ln x=$', answer: a + '/x', vars: ['x'], hints: ['The ' + a + ' stays in front.', 'ln x differentiates to 1/x.'],
            traps: [{ expr: '1/(' + a + 'x)', msg: 'The ' + a + ' multiplies the derivative: ' + a + ' · (1/x).' }], worked: '$' + a + '\\cdot\\dfrac{1}{x}=\\dfrac{' + a + '}{x}$.' };
        }
        if (b === 3) { p = INT(r, 2, 5); q = INT(r, 2, 5); s = INT(r, 2, 6);
          return { type: 'expr', prompt: 'Differentiate term by term.', label: '$' + DDX + '(' + p + 'x^{2}+' + tc(q, 'e^{x}') + '-' + tc(s, '\\ln x') + ')=$', answer: (2 * p) + 'x+' + q + 'e^x-' + s + '/x', vars: ['x'],
            hints: ['Do each term on its own.', 'Power rule, then eˣ, then 1/x. Keep the minus sign.'], traps: [{ expr: (2 * p) + 'x+' + q + 'e^x+' + s + '/x', msg: 'The sign in front of the ln term stays a minus.' }],
            worked: '$' + (2 * p) + 'x+' + tc(q, 'e^{x}') + '-\\dfrac{' + s + '}{x}$.' }; }
        k = INT(r, 2, 6); c = INT(r, 2, 6);
        if (r() < 0.5) return { type: 'expr', prompt: 'Differentiate. Rewrite the root as a power if that helps.', label: '$' + DDX + '(' + k + '\\sqrt{x}-' + c + '\\ln x+e^{x})=$', answer: k + '/(2sqrt(x))-' + c + '/x+e^x', vars: ['x'],
          hints: ['$\\sqrt{x}=x^{1/2}$.', 'Differentiate the three terms separately.'], worked: '$\\dfrac{' + k + '}{2\\sqrt{x}}-\\dfrac{' + c + '}{x}+e^{x}$.' };
        return { type: 'expr', prompt: 'Differentiate. Write $1/x$ as $x^{-1}$ if that helps.', label: '$' + DDX + '(\\ln x+\\dfrac{' + c + '}{x})=$', answer: '1/x-' + c + '/x^2', vars: ['x'],
          hints: ['$\\dfrac{' + c + '}{x}=' + c + 'x^{-1}$.', 'Power rule on that term; the ln term gives 1/x.'], worked: '$\\dfrac{1}{x}-\\dfrac{' + c + '}{x^{2}}$.' };
      } },
      { id: 'slope', title: 'Slope at a point', gen: function (b, r) {
        var a, c, bb, cs = [1, 2, 4, 5];
        if (b <= 1) { if (r() < 0.5) return { type: 'num', prompt: 'Find the slope of $y=e^{x}$ at $x=0$.', answer: 1, hint: 'The slope of eˣ equals its height. What is e⁰?', worked: 'The slope equals the height, $e^{0}=1$.' };
          c = pick(r, cs); return { type: 'num', prompt: 'Find the slope of $y=\\ln x$ at $x=' + c + '$.', answer: 1 / c, hint: 'The slope of ln x at x is 1/x.', worked: '$\\dfrac{1}{' + c + '}=' + (1 / c) + '$.' }; }
        if (b === 2) { if (r() < 0.5) { a = INT(r, 2, 6); bb = INT(r, 2, 5); return { type: 'num', prompt: 'Let $f(x)=' + a + 'e^{x}+' + bb + 'x$. Find $f\'(0)$.', answer: a + bb, hint: 'f′(x) = a·eˣ + b. Put in x = 0.', worked: '$f\'(x)=' + a + 'e^{x}+' + bb + '$, so $f\'(0)=' + a + '+' + bb + '=' + (a + bb) + '$.' }; }
          a = INT(r, 2, 9); c = pick(r, [2, 4, 5]); return { type: 'num', prompt: 'Let $f(x)=' + a + '\\ln x$. Find $f\'(' + c + ')$.', answer: a / c, hint: 'f′(x) = a/x.', worked: '$f\'(x)=\\dfrac{' + a + '}{x}$, so $f\'(' + c + ')=' + (a / c) + '$.' }; }
        if (b === 3) { a = INT(r, 2, 6); bb = INT(r, 1, 3); c = pick(r, [1, 2, 4]); return { type: 'num', prompt: 'Let $f(x)=' + a + '\\ln x+' + tc(bb, 'x^{2}') + '$. Find $f\'(' + c + ')$.', answer: a / c + 2 * bb * c,
          hint: 'f′(x) = a/x + 2bx. Put in x = ' + c + '.', worked: '$f\'(x)=\\dfrac{' + a + '}{x}+' + (2 * bb) + 'x$, so $f\'(' + c + ')=' + (a / c + 2 * bb * c) + '$.' }; }
        a = INT(r, 2, 6); bb = INT(r, 1, 6); c = pick(r, [2, 4, 5]); return { type: 'num', prompt: 'Let $f(x)=' + a + '\\ln x-\\dfrac{' + bb + '}{x}$. Find $f\'(' + c + ')$.', answer: a / c + bb / (c * c),
          hint: 'Write the second term as −b·x⁻¹; its derivative is +b/x².', worked: '$f\'(x)=\\dfrac{' + a + '}{x}+\\dfrac{' + bb + '}{x^{2}}$, so $f\'(' + c + ')=' + (a / c + bb / (c * c)) + '$.' };
      } },
      { id: 'tangent', title: 'Tangent and normal lines', gen: function (b, r) {
        var k, m, a;
        if (b <= 1) { if (r() < 0.5) return { type: 'expr', prompt: 'Find the tangent line to $y=\\ln x$ at $x=1$.', label: '$y=$', answer: 'x-1', vars: ['x'], hints: ['Point: (1, ln 1) = (1, 0). Slope: 1/1 = 1.', 'Point-slope form: y − 0 = 1(x − 1).'], worked: 'Point $(1,0)$, slope 1, so $y=x-1$.' };
          return { type: 'expr', prompt: 'Find the tangent line to $y=e^{x}$ at $x=0$.', label: '$y=$', answer: 'x+1', vars: ['x'], hints: ['Point: (0, e⁰) = (0, 1). Slope = height = 1.', 'y − 1 = 1(x − 0).'], worked: 'Point $(0,1)$, slope 1, so $y=x+1$.' }; }
        if (b === 2) { a = INT(r, 2, 6); if (r() < 0.5) return { type: 'expr', prompt: 'Find the tangent line to $y=' + a + '\\ln x$ at $x=1$.', label: '$y=$', answer: a + '(x-1)', vars: ['x'], hints: ['Point: (1, 0). Slope: ' + a + '/1.'], worked: 'Point $(1,0)$, slope ' + a + ', so $y=' + a + '(x-1)$.' };
          return { type: 'expr', prompt: 'Find the tangent line to $y=' + a + 'e^{x}$ at $x=0$.', label: '$y=$', answer: a + '+' + a + 'x', vars: ['x'], hints: ['Point: (0, ' + a + '). Slope = height = ' + a + '.'], worked: 'Point $(0,' + a + ')$, slope ' + a + ', so $y=' + a + '+' + a + 'x$.' }; }
        if (b === 3) { if (r() < 0.5) { k = INT(r, 2, 4); m = 1 + 2 * k; return { type: 'expr', prompt: 'Find the tangent line to $y=\\ln x+' + k + 'x^{2}$ at $x=1$.', label: '$y=$', answer: k + '+' + m + '(x-1)', vars: ['x'], hints: ['Point: (1, 0 + ' + k + ') = (1, ' + k + ').', 'f′(x) = 1/x + ' + (2 * k) + 'x, so the slope is ' + m + '.'], worked: 'Point $(1,' + k + ')$, slope $' + m + '$: $y=' + k + '+' + m + '(x-1)$.' }; }
          k = INT(r, 2, 4); return { type: 'expr', prompt: 'Find the tangent line to $y=e^{x}-' + k + 'x$ at $x=0$.', label: '$y=$', answer: '1+' + (1 - k) + 'x', vars: ['x'], hints: ['Point: (0, 1).', 'f′(x) = eˣ − ' + k + ', so the slope is 1 − ' + k + '.'], worked: 'Point $(0,1)$, slope $' + (1 - k) + '$: $y=1+(' + (1 - k) + ')x$.' }; }
        k = INT(r, 2, 4); m = 1 + 2 * k;
        return { type: 'expr', prompt: 'Find the <b>normal</b> line to $y=\\ln x+' + k + 'x^{2}$ at $x=1$.', label: '$y=$', answer: k + '-(x-1)/' + m, vars: ['x'], hints: ['The tangent slope is ' + m + '.', 'The normal slope is the negative reciprocal: −1/' + m + '. The point is (1, ' + k + ').'],
          traps: [{ expr: k + '+' + m + '(x-1)', msg: 'That is the tangent line. The normal has slope −1/' + m + '.' }], worked: 'Tangent slope ' + m + ', so the normal slope is $-\\tfrac{1}{' + m + '}$: $y=' + k + '-\\dfrac{x-1}{' + m + '}$.' };
      } },
      { id: 'limit', title: 'Limits that are derivatives', gen: function (b, r) {
        var c, k;
        if (b <= 1) { c = pick(r, [1, 2, 4]); return { type: 'num', prompt: 'Evaluate $\\displaystyle\\lim_{h\\to0}\\dfrac{\\ln(' + c + '+h)-\\ln ' + c + '}{h}$.', answer: 1 / c, hint: 'This is f′(' + c + ') for f(x) = ln x.', worked: 'It is $f\'(' + c + ')$ for $f=\\ln x$: $\\dfrac{1}{' + c + '}$.' }; }
        if (b === 2) { if (r() < 0.5) return { type: 'num', prompt: 'Evaluate $\\displaystyle\\lim_{h\\to0}\\dfrac{e^{h}-1}{h}$.', answer: 1, hint: 'Write 1 as e⁰. It is f′(0) for f(x) = eˣ.', worked: 'It is $f\'(0)$ for $f=e^{x}$: $e^{0}=1$.' };
          c = pick(r, [2, 4, 5]); return { type: 'num', prompt: 'Evaluate $\\displaystyle\\lim_{h\\to0}\\dfrac{\\ln(' + c + '+h)-\\ln ' + c + '}{h}$.', answer: 1 / c, hint: 'It is f′(' + c + ') for f(x) = ln x.', worked: '$\\dfrac{1}{' + c + '}$.' }; }
        if (b === 3) { c = pick(r, [2, 4, 5]); return { type: 'num', prompt: 'Evaluate $\\displaystyle\\lim_{x\\to' + c + '}\\dfrac{\\ln x-\\ln ' + c + '}{x-' + c + '}$.', answer: 1 / c, hint: 'This has the form (f(x) − f(a))/(x − a). Name f and a.', worked: 'It is $f\'(' + c + ')$ for $f=\\ln x$: $\\dfrac{1}{' + c + '}$.' }; }
        k = INT(r, 2, 6);
        if (r() < 0.5) return { type: 'num', prompt: 'Evaluate $\\displaystyle\\lim_{x\\to1}\\dfrac{' + k + '\\ln x}{x-1}$.', answer: k, hint: 'Since ln 1 = 0, the top is f(x) − f(1) for f = ' + k + ' ln x.', worked: '$f(x)=' + k + '\\ln x$, $f(1)=0$, so the limit is $f\'(1)=' + k + '$.' };
        return { type: 'num', prompt: 'Evaluate $\\displaystyle\\lim_{x\\to0}\\dfrac{' + k + '(e^{x}-1)}{x}$.', answer: k, hint: 'Since e⁰ = 1, the top is f(x) − f(0) for f = ' + k + 'eˣ.', worked: '$f(x)=' + k + 'e^{x}$, $f(0)=' + k + '$, so the limit is $f\'(0)=' + k + '$.' };
      } },
      { id: 'flat', title: 'Horizontal tangents', gen: function (b, r) {
        var a, bb, c, k;
        if (b <= 1) { a = INT(r, 1, 4); return { type: 'num', prompt: 'Let $f(x)=' + tc(a, '\\ln x') + '-x$ for $x>0$. At which $x$ is the tangent horizontal?', answer: a, hint: 'Set f′(x) = 0.', worked: '$f\'(x)=\\dfrac{' + a + '}{x}-1=0$ gives $x=' + a + '$.' }; }
        if (b === 2) { bb = INT(r, 2, 4); c = INT(r, 2, 5); return { type: 'num', prompt: 'Let $f(x)=' + (bb * c) + '\\ln x-' + bb + 'x$ for $x>0$. At which $x$ is the tangent horizontal?', answer: c, hint: 'Set f′(x) = 0 and solve for x.', worked: '$\\dfrac{' + (bb * c) + '}{x}-' + bb + '=0$ gives $x=' + c + '$.' }; }
        if (b === 3) { bb = INT(r, 1, 3); c = INT(r, 2, 6); k = INT(r, 2, 9); return { type: 'num', prompt: 'Let $f(x)=' + (bb * c) + '\\ln x-' + tc(bb, 'x') + '+' + k + '$ for $x>0$. At which $x$ is the tangent horizontal?', answer: c, hint: 'The constant ' + k + ' disappears. Set f′(x) = 0.', worked: '$f\'(x)=\\dfrac{' + (bb * c) + '}{x}-' + bb + '=0$ gives $x=' + c + '$.' }; }
        c = INT(r, 2, 7); return { type: 'num', prompt: 'Let $f(x)=\\ln x+\\dfrac{' + c + '}{x}$ for $x>0$. At which $x$ is the tangent horizontal?', answer: c, hint: 'f′(x) = 1/x − c/x². Set it to 0 and multiply through by x².', worked: '$f\'(x)=\\dfrac{1}{x}-\\dfrac{' + c + '}{x^{2}}=0$ gives $x=' + c + '$.' };
      } }
    ],

    misconceptions: [
      { say: 'The derivative of eˣ is x·eˣ⁻¹.', fix: 'The power rule is for xⁿ. In eˣ the variable is the exponent, and eˣ is its own derivative.' },
      { say: 'The derivative of ln x is ln x, or 1/ln x.', fix: 'The slope of ln x at x is the reciprocal of x: 1/x.' },
      { say: 'The normal line has the same slope as the tangent.', fix: 'The normal is perpendicular: its slope is −1/m.' },
      { say: 'y = eˣ − 4 has a horizontal tangent somewhere.', fix: 'The slope is eˣ, which is always positive. There is no x where it is 0.' }
    ],

    pacing: { budgetMin: 42,
      steps: [
        { id: 'start', prio: 1, min: 2 }, { id: 'warmup', prio: 1, min: 4 }, { id: 'predict', prio: 1, min: 3 },
        { id: 'explore', prio: 3, min: 8 }, { id: 'build', prio: 2, min: 8, minItems: 2, parts: 4 },
        { id: 'practice', prio: 1, min: 8 }, { id: 'check', prio: 1, min: 4 }
      ],
      huddles: [{ key: 'h1', atMin: 18 }] }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = SPEC; else (root.SPECS = root.SPECS || {})[SPEC.id] = SPEC;
})(typeof window !== 'undefined' ? window : globalThis);
