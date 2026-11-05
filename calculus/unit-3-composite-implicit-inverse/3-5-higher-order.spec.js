/* SPEC (calculus 3.5): the lesson page, the key PDFs and the unit tests all read this one file.
   Self-paced (selfPaced: true), the same shape as 3.3 and 3.4: no clock, no trimming, no skipping, no end mark, no stamp. Progress saves on the device.
   Math is written the way qkit writes it: $x^2$ in prompts, and typed answers in mathcheck syntax. Huddle text is plain text (no $ math).
   Every skill item carries the data its test needs, so tests/unit/higher-order.test.js can check it without using the rules:
     second   data.js, the function in plain JavaScript; the answer is checked against a second difference of it.
     nth      data.kind and its numbers; the answer is checked against a closed form (k^n, sin(nπ/2)) and the falling factorial.
     read     a table or f′ in JavaScript; the sign or the estimate is recomputed from the numbers.
     implicit data.js, the branch of the curve through the point as y(x); the answer is a second difference of it. */
(function (root) {
  'use strict';
  var INT = function (r, a, b) { return a + Math.floor(r() * (b - a + 1)); };
  var pick = function (r, arr) { return arr[Math.floor(r() * arr.length)]; };
  var shuffle = function (r, arr) { var a = arr.slice(), i, j, t; for (i = a.length - 1; i > 0; i--) { j = Math.floor(r() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  var rnd = function (v) { return +v.toFixed(6); };

  /* polynomials as coefficient arrays, c[i] is the coefficient of x^i */
  function polyText(c, tex) {
    var out = '', i, k, a, t;
    for (i = c.length - 1; i >= 0; i--) { k = c[i]; if (!k) continue; a = Math.abs(k);
      t = i === 0 ? String(a) : (a === 1 ? '' : String(a)) + (i === 1 ? 'x' : (tex ? 'x^{' + i + '}' : 'x^' + i));
      out += (out ? (k < 0 ? '-' : '+') : (k < 0 ? '-' : '')) + t; }
    return out || '0';
  }
  var dpoly = function (c) { return c.slice(1).map(function (k, i) { return k * (i + 1); }); };
  var jsPoly = function (c) { return c.map(function (k, i) { return k ? k + '*Math.pow(x,' + i + ')' : null; }).filter(Boolean).join('+') || '0'; };

  /* Items for the "second" skill. Each has: tex (the function), js, d1 (f′ as TeX, shown in the first hint), ans (f″ in mathcheck),
     traps (named wrong answers), ex (a different example, as TeX, for the third hint). */
  var FAM = {
    exp: function (k) { return { tex: 'e^{' + k + 'x}', js: 'Math.exp(' + k + '*x)', d1: k + 'e^{' + k + 'x}', ans: '(' + (k * k) + ')*e^(' + k + '*x)',
      traps: [{ expr: k + '*e^(' + k + '*x)', msg: 'That is $f\'$. Differentiate once more.' }, { expr: 'e^(' + k + '*x)', msg: 'Each derivative brings down a factor of ' + k + ' (chain rule).' }], ex: 'for $e^{5x}$: $f\'=5e^{5x}$, so $f\'\'=25e^{5x}$.' }; },
    sin: function (k) { return { tex: '\\sin(' + k + 'x)', js: 'Math.sin(' + k + '*x)', d1: k + '\\cos(' + k + 'x)', ans: '-(' + (k * k) + ')*sin(' + k + '*x)',
      traps: [{ expr: (k * k) + '*sin(' + k + '*x)', msg: 'Check the sign: sin goes to cos, then to $-\\sin$.' }, { expr: '-(' + k + ')*sin(' + k + '*x)', msg: 'The chain rule brings down a factor of ' + k + ' TWICE: $' + k + '\\cdot' + k + '$.' }, { expr: k + '*cos(' + k + '*x)', msg: 'That is $f\'$. Differentiate once more.' }], ex: 'for $\\sin(5x)$: $f\'=5\\cos(5x)$, so $f\'\'=-25\\sin(5x)$.' }; },
    cos: function (k) { return { tex: '\\cos(' + k + 'x)', js: 'Math.cos(' + k + '*x)', d1: '-' + k + '\\sin(' + k + 'x)', ans: '-(' + (k * k) + ')*cos(' + k + '*x)',
      traps: [{ expr: (k * k) + '*cos(' + k + '*x)', msg: 'Check the sign: cos goes to $-\\sin$, then to $-\\cos$.' }, { expr: '-(' + k + ')*cos(' + k + '*x)', msg: 'The chain rule brings down a factor of ' + k + ' TWICE: $' + k + '\\cdot' + k + '$.' }, { expr: '-' + k + '*sin(' + k + '*x)', msg: 'That is $f\'$. Differentiate once more.' }], ex: 'for $\\cos(5x)$: $f\'=-5\\sin(5x)$, so $f\'\'=-25\\cos(5x)$.' }; },
    ln: function () { return { tex: '\\ln x', js: 'Math.log(x)', d1: '\\dfrac1x', ans: '-1/x^2', traps: [{ expr: '1/x^2', msg: 'Check the sign: $\\tfrac1x=x^{-1}$ has derivative $-x^{-2}$.' }, { expr: '1/x', msg: 'That is $f\'$. Differentiate once more.' }], ex: 'for $\\tfrac1{x^2}=x^{-2}$: $f\'=-2x^{-3}$, so $f\'\'=6x^{-4}$.' }; },
    inv: function () { return { tex: '\\dfrac1x', js: '1/x', d1: '-\\dfrac1{x^2}', ans: '2/x^3', traps: [{ expr: '-1/x^2', msg: 'That is $f\'$. Differentiate once more.' }, { expr: '-2/x^3', msg: 'Check the sign: $-x^{-2}$ has derivative $+2x^{-3}$.' }], ex: 'for $\\tfrac1{x^2}=x^{-2}$: $f\'=-2x^{-3}$, so $f\'\'=6x^{-4}$.' }; },
    xexp: function (k) { return { tex: 'x\\,e^{' + k + 'x}', js: 'x*Math.exp(' + k + '*x)', d1: '(1+' + k + 'x)\\,e^{' + k + 'x}', ans: '(' + (k * k) + '*x+' + (2 * k) + ')*e^(' + k + '*x)',
      traps: [{ expr: (k * k) + '*x*e^(' + k + '*x)', msg: 'The product rule gives two terms each time. You dropped one.' }, { expr: '(1+' + k + '*x)*e^(' + k + '*x)', msg: 'That is $f\'$. Differentiate once more.' }], ex: 'for $x\\,e^{5x}$: $f\'=(1+5x)e^{5x}$, so $f\'\'=(25x+10)e^{5x}$.' }; },
    x2exp: function () { return { tex: 'x^{2}e^{x}', js: 'x*x*Math.exp(x)', d1: '(x^{2}+2x)\\,e^{x}', ans: '(x^2+4*x+2)*e^x', traps: [{ expr: '(x^2+2*x)*e^x', msg: 'That is $f\'$. Differentiate once more.' }, { expr: '(x^2+2*x+2)*e^x', msg: 'Use the product rule on BOTH terms of $f\'$.' }], ex: 'for $x\\,e^{x}$: $f\'=(1+x)e^{x}$, so $f\'\'=(2+x)e^{x}$.' }; },
    xsin: function () { return { tex: 'x\\sin x', js: 'x*Math.sin(x)', d1: '\\sin x+x\\cos x', ans: '2*cos(x)-x*sin(x)', traps: [{ expr: 'sin(x)+x*cos(x)', msg: 'That is $f\'$. Differentiate once more.' }, { expr: 'cos(x)-x*sin(x)', msg: 'The product rule gives $\\cos x$ twice: once from each term of $f\'$.' }], ex: 'for $x\\cos x$: $f\'=\\cos x-x\\sin x$, so $f\'\'=-2\\sin x-x\\cos x$.' }; },
    xcos: function () { return { tex: 'x\\cos x', js: 'x*Math.cos(x)', d1: '\\cos x-x\\sin x', ans: '-2*sin(x)-x*cos(x)', traps: [{ expr: 'cos(x)-x*sin(x)', msg: 'That is $f\'$. Differentiate once more.' }, { expr: '-sin(x)-x*cos(x)', msg: 'The product rule gives $-\\sin x$ twice: once from each term of $f\'$.' }], ex: 'for $x\\sin x$: $f\'=\\sin x+x\\cos x$, so $f\'\'=2\\cos x-x\\sin x$.' }; },
    x2ln: function () { return { tex: 'x^{2}\\ln x', js: 'x*x*Math.log(x)', d1: '2x\\ln x+x', ans: '2*ln(x)+3', traps: [{ expr: '2*x*ln(x)+x', msg: 'That is $f\'$. Differentiate once more.' }, { expr: '2*ln(x)+2', msg: 'The term $x$ in $f\'$ also has a derivative: 1.' }], ex: 'for $x\\ln x$: $f\'=\\ln x+1$, so $f\'\'=\\tfrac1x$.' }; },
    ex2: function () { return { tex: 'e^{x^{2}}', js: 'Math.exp(x*x)', d1: '2x\\,e^{x^{2}}', ans: '(2+4*x^2)*e^(x^2)', traps: [{ expr: '2*x*e^(x^2)', msg: 'That is $f\'$. Differentiate once more.' }, { expr: '2*e^(x^2)', msg: 'Differentiate BOTH factors of $2x\\,e^{x^2}$: the product rule.' }], ex: 'for $e^{3x^2}$: $f\'=6x\\,e^{3x^2}$, so $f\'\'=(6+36x^2)e^{3x^2}$.' }; },
    sinx2: function () { return { tex: '\\sin(x^{2})', js: 'Math.sin(x*x)', d1: '2x\\cos(x^{2})', ans: '2*cos(x^2)-4*x^2*sin(x^2)', traps: [{ expr: '2*x*cos(x^2)', msg: 'That is $f\'$. Differentiate once more.' }, { expr: '2*cos(x^2)-2*x*sin(x^2)', msg: 'The chain rule on $\\cos(x^2)$ brings a factor $2x$, so the second term has $2x\\cdot2x$.' }], ex: 'for $\\cos(x^2)$: $f\'=-2x\\sin(x^2)$, so $f\'\'=-2\\sin(x^2)-4x^2\\cos(x^2)$.' }; },
    atan: function (k) { return { tex: '\\arctan(' + (k === 1 ? '' : k) + 'x)', js: 'Math.atan(' + k + '*x)', d1: '\\dfrac{' + k + '}{1+' + (k * k === 1 ? '' : k * k) + 'x^{2}}', ans: '-2*' + (k * k * k) + '*x/(1+' + (k * k) + '*x^2)^2', traps: [{ expr: k + '/(1+' + (k * k) + '*x^2)', msg: 'That is $f\'$. Differentiate once more.' }, { expr: '-' + (k * k * k) + '*x/(1+' + (k * k) + '*x^2)^2', msg: 'The chain rule on the bottom brings a factor 2: $\\left(1+' + (k * k) + 'x^2\\right)^{-1}$ has derivative $-2\\cdots$.' }], ex: 'for $\\arctan x$: $f\'=(1+x^2)^{-1}$, so $f\'\'=-2x(1+x^2)^{-2}$.' }; }
  };
  /* the third hint of the polynomial band */
  var POLYEX = 'for $5x^3$: $f\'=15x^2$, so $f\'\'=30x$.';

  var SPEC = {
    id: '3-5-higher-order', course: 'calc', unit: 'Unit 3 · Composite, Implicit and Inverse', title: '3.5 Higher-Order Derivatives',
    selfPaced: true,
    question: 'What does it mean to take the derivative of a derivative?',
    targets: ['I can name f′, f″ and f‴ and say what each one tells me.', 'I can find a second or higher derivative with the usual rules.', 'I can find d²y/dx² at a point on an implicit curve.'],
    tabs: ['Warm-up', 'Predict', 'Explore', 'Notes', 'Build', 'Practice', 'Check'],
    exploreTarget: 'I can see how f, f′ and f″ are linked.',
    huddleTarget: 'I can write higher derivatives and say what f″ tells me.',
    buildTarget: 'I can find higher derivatives and read what they say.',

    concepts: [
      { title: 'Notation', points: ['f′, f″, f‴ are the first, second and third derivatives.', 'd²y/dx² is the same as f″ (or y″).'], eq: 'f⁽ⁿ⁾(x) = dⁿy/dxⁿ' },
      { title: 'The second derivative', points: ['f″ is the derivative of f′.', 'It is the slope of f′: how the slope of f is changing.'], eq: 'f″ = (f′)′' },
      { title: 'Reading the sign', points: ['f″ > 0 means f′ is increasing.', 'f″ < 0 means f′ is decreasing.'], eq: 'f″(x) = slope of f′' },
      { title: 'Patterns save work', points: ['A polynomial loses one degree each time.', 'sin and cos repeat every 4 derivatives.', 'Each derivative of e^(kx) multiplies by k.'], eq: 'dⁿ/dxⁿ e^(kx) = kⁿ e^(kx)' },
      { title: 'Implicit curves', points: ['Differentiate dy/dx again. Each y term brings a new dy/dx.', 'Then put in the dy/dx you already found.'], eq: 'y″ = d/dx (dy/dx)' }
    ],

    huddle: {
      defs: [
        { term: 'Higher derivative', text: 'Differentiate [[again]]. The second derivative is f″(x) or d²y/dx². The third is f‴(x).' },
        { term: 'What f″ means', text: 'f″ is the [[slope]] of f′. It tells how the slope of f is [[changing]].' },
        { term: 'Reading the sign', text: 'If f″ > 0, the slope of f is [[increasing]]. If f″ < 0, it is [[decreasing]].' },
        { term: 'Patterns', text: 'A polynomial loses [[one]] degree each time. sin x repeats every [[4]] derivatives.' }
      ],
      example: { prompt: 'Let f(x) = x⁴ − 3x² + 2x. Find f″ and f‴.',
        steps: ['First derivative: f′(x) = 4x³ − 6x + 2', 'Second derivative: f″(x) = [[12]]x² − 6', 'Third derivative: f‴(x) = [[24]]x', 'The fourth derivative is the constant [[24]]'] },
      label: { title: 'Label the three graphs', html: null,
        tags: [{ n: 1, text: 'The cubic is the graph of [[f]].' }, { n: 2, text: 'The parabola is the graph of [[f′]].' }, { n: 3, text: 'The straight line is the graph of [[f″]].' }] }
    },

    /* three easy review items from earlier lessons */
    review: [
      { id: 'R1', title: 'Review 1', prompt: 'The derivative of $x^3$ is…', options: ['3x²', 'x²', '3x³', '3x'], answer: 0, why: 'Power rule: bring the 3 down and lower the power by 1.' },
      { id: 'R2', title: 'Review 2', prompt: 'The derivative of $\\sin x$ is…', options: ['cos x', '−cos x', '−sin x', 'sin x'], answer: 0, why: 'The derivative of sine is cosine.' },
      { id: 'R3', title: 'Review 3', prompt: 'If $f\'(x)>0$ on an interval, then $f$ is…', options: ['increasing', 'decreasing', 'constant', 'undefined'], answer: 0, why: 'A positive slope means the graph of $f$ rises.' }
    ],

    predicts: [
      { id: 'P1', title: 'A derivative of a derivative', prompt: 'The derivative of $x^2$ is $2x$. The derivative of $2x$ is…', options: ['2', '2x', 'x', '0'], answer: 0, why: 'The line $2x$ has slope 2, so differentiating again gives 2.' },
      { id: 'P2', title: 'A pattern', prompt: 'Keep differentiating $\\sin x$: $\\sin x$, $\\cos x$, $-\\sin x$, $-\\cos x$, and then…', options: ['sin x', 'cos x', '−sin x', '0'], answer: 0, why: 'The next derivative of $-\\cos x$ is $\\sin x$. The pattern repeats every 4 derivatives.' }
    ],
    observe: [
      { id: 'O1', prompt: 'In Station 1, where the red tangent on $f$ was flat, the graph of $f\'$…', options: ['was at 0, on the x-axis', 'was at its highest point', 'was also flat', 'was at 1'], answer: 0, why: 'A flat tangent has slope 0, and $f\'$ is the slope. So $f\'$ equals 0 there.' },
      { id: 'O2', prompt: 'In Station 1, at the lowest point of $f\'$, the value of $f\'\'$ was…', options: ['0', '1', '−1', '2'], answer: 0, why: 'The tangent on $f\'$ is flat at its lowest point, and $f\'\'$ is the slope of $f\'$. So $f\'\'=0$.' }
    ],
    exploreIds: ['X1', 'X2', 'X3', 'X4'],

    /* the mid-lesson check: after the notes, before the problems */
    mid: [
      { id: 'M1', title: 'Check 1', prompt: 'If $f$ is a cubic polynomial, then $f\'\'\'$ is…', options: ['a constant', 'a line', 'a parabola', 'a cubic'], answer: 0, why: 'Each derivative lowers the degree by one: cubic, parabola, line, constant.' },
      { id: 'M2', title: 'Check 2', prompt: 'The slope of the graph of $f\'$ at $x=3$ equals…', options: ['f″(3)', 'f′(3)', 'f(3)', 'f‴(3)'], answer: 0, why: '$f\'\'$ is the derivative of $f\'$, so it is the slope of the graph of $f\'$.' }
    ],

    skills: [
      /* second: typed f″. Band 1 polynomials, band 2 e^(kx), sin(kx), cos(kx), ln x, 1/x, band 3 products and chains. */
      { id: 'second', title: 'Second derivative', gen: function (b, r) {
        b = Math.min(b, 3);
        var c, d, e, n;
        if (b <= 1) {
          n = pick(r, [3, 3, 4]); c = []; for (var i = 0; i <= n; i++) c.push(i === n ? INT(r, 2, 5) : (i === n - 1 && n === 4 ? 0 : INT(r, -6, 6)));
          d = dpoly(c);
          return { type: 'expr', data: { js: jsPoly(c) }, prompt: 'Find the second derivative.', label: '$f(x)=' + polyText(c, true) + '\\quad f\'\'(x)=$', answer: polyText(dpoly(d), false), vars: ['x'],
            traps: [{ expr: polyText(d, false), msg: 'That is $f\'$. Differentiate once more.' }],
            hints: ['Step card: differentiate once, write $f\'$ in full, then differentiate $f\'$.', 'First step: $f\'(x)=' + polyText(d, true) + '$.', 'Same move on another example: ' + POLYEX],
            worked: '$f\'(x)=' + polyText(d, true) + '$, so $f\'\'(x)=' + polyText(dpoly(d), true) + '$.' };
        }
        if (b === 2) e = pick(r, [FAM.exp(INT(r, 2, 4)), FAM.sin(INT(r, 2, 4)), FAM.cos(INT(r, 2, 4)), FAM.ln(), FAM.inv()]);
        else e = pick(r, [FAM.xexp(INT(r, 2, 3)), FAM.x2exp(), FAM.xsin(), FAM.xcos(), FAM.x2ln(), FAM.ex2(), FAM.sinx2(), FAM.atan(pick(r, [1, 2]))]);
        return { type: 'expr', data: { js: e.js }, prompt: 'Find the second derivative.', label: '$f(x)=' + e.tex + '\\quad f\'\'(x)=$', answer: e.ans, vars: ['x'], traps: e.traps,
          hints: ['Step card: differentiate once, write $f\'$ in full, then differentiate $f\'$ with the rule it needs.', 'First step: $f\'(x)=' + e.d1 + '$.', 'Same move on another example: ' + e.ex],
          worked: '$f\'(x)=' + e.d1 + '$. Differentiating that again gives the answer.' };
      } },

      /* nth: the nth derivative at a point, a whole number */
      { id: 'nth', title: 'Higher derivative at a point', gen: function (b, r) {
        b = Math.min(b, 3);
        var k, n, m, a, kind, nm, ans, tx, pat;
        if (b <= 1) {
          if (r() < 0.5) { k = INT(r, 2, 3); n = INT(r, 3, 4); ans = Math.pow(k, n);
            return { type: 'num', data: { kind: 'exp', k: k, n: n, a: 0 }, prompt: '$f(x)=e^{' + k + 'x}$. Find $f^{(' + n + ')}(0)$.', answer: ans,
              hint: 'Step card: each derivative multiplies by ' + k + '. Write $f\'$, $f\'\'$, and so on, then put in $x=0$. First step: $f\'(x)=' + k + 'e^{' + k + 'x}$. Same move: for $e^{5x}$, $f\'\'(0)=5\\cdot5=25$.',
              worked: 'Each derivative multiplies by ' + k + '. After ' + n + ' derivatives: $' + k + '^{' + n + '}e^{' + k + 'x}$. At $x=0$ that is $' + ans + '$.' }; }
          m = INT(r, 4, 6); n = INT(r, 2, 3); a = INT(r, 1, 3); ans = 1; for (var i = 0; i < n; i++) ans *= (m - i); ans *= Math.pow(a, m - n);
          return { type: 'num', data: { kind: 'mono', m: m, n: n, a: a }, prompt: '$f(x)=x^{' + m + '}$. Find $f^{(' + n + ')}(' + a + ')$.', answer: ans,
            hint: 'Step card: differentiate ' + n + ' times, writing each one, then put in $x=' + a + '$. First step: $f\'(x)=' + m + 'x^{' + (m - 1) + '}$. Same move: for $x^4$, $f\'\'(x)=12x^2$, so $f\'\'(2)=48$.',
            worked: 'The ' + n + ' derivatives bring down ' + Array.from({ length: n }, function (_, i) { return m - i; }).join(' · ') + ', leaving $x^{' + (m - n) + '}$. At $x=' + a + '$ the answer is $' + ans + '$.' };
        }
        if (b === 2) { kind = pick(r, ['sin', 'cos']); n = pick(r, [6, 7, 9, 10, 13, 14, 15, 18, 22, 27, 30, 31, 50, 99]); nm = n % 4;
          ans = kind === 'sin' ? [0, 1, 0, -1][nm] : [1, 0, -1, 0][nm];
          return { type: 'num', data: { kind: kind, k: 1, n: n, a: 0 }, prompt: '$f(x)=\\' + kind + ' x$. Find $f^{(' + n + ')}(0)$.', answer: ans,
            hint: 'Step card: sin and cos repeat every 4 derivatives. Divide ' + n + ' by 4 and use the remainder. First step: the remainder is ' + nm + '. Same move: for $\\sin x$ and $n=5$, the remainder is 1, which is the first derivative $\\cos x$, so $f^{(5)}(0)=1$.',
            worked: 'The pattern repeats every 4. ' + n + ' leaves remainder ' + nm + ', so $f^{(' + n + ')}$ is the same as $f^{(' + nm + ')}$. At $x=0$ the value is $' + ans + '$.' }; }
        kind = pick(r, ['sin', 'cos']); k = INT(r, 2, 3); n = kind === 'sin' ? pick(r, [5, 7]) : pick(r, [4, 6]);
        pat = kind === 'sin' ? (n % 4 === 1 ? 1 : -1) : (n % 4 === 0 ? 1 : -1); ans = pat * Math.pow(k, n);
        return { type: 'num', data: { kind: kind, k: k, n: n, a: 0 }, prompt: '$f(x)=\\' + kind + '(' + k + 'x)$. Find $f^{(' + n + ')}(0)$.', answer: ans,
          hint: 'Step card: two things happen. The sign follows the sin or cos pattern, and each derivative multiplies by ' + k + '. First step: the size is $' + k + '^{' + n + '}$. Same move: for $\\sin(2x)$ and $n=5$, the size is $2^5=32$ and the sign is $+$, so $32$.',
          worked: 'Each derivative multiplies by ' + k + ', so the size is $' + k + '^{' + n + '}=' + Math.pow(k, n) + '$. The sign follows the ' + kind + ' pattern: $' + (pat > 0 ? '+' : '-') + '$. The answer is $' + ans + '$.' };
      } },

      /* read: what f″ says about f′. Band 1 a table of f′, or a sentence; band 2 f′ as a formula; band 3 estimate f″ from two values of f′. */
      { id: 'read', title: 'Read the second derivative', gen: function (b, r) {
        b = Math.min(b, 3);
        var SIGNS = ['positive', 'negative', 'zero', 'cannot tell'], t, fp, s, p, q, a, x1, x2, sp, m, A, B, mid, tab, st;
        if (b <= 1) {
          if (r() < 0.5) {
            st = pick(r, [['$f\'\'(x)>0$ on an interval means the slope of $f$ is…', 0], ['$f\'\'(x)<0$ on an interval means the slope of $f$ is…', 1], ['$f\'\'(x)=0$ on an interval means the slope of $f$ is…', 2]]);
            return { type: 'choice', data: { stmt: st[1] }, prompt: st[0], options: ['increasing', 'decreasing', 'constant', 'undefined'], answer: st[1],
              hint: 'Step card: $f\'\'$ is the slope of $f\'$, and $f\'$ is the slope of $f$. Positive means going up. Example: $f\'\'>0$ and $f\'=2x$ has slope 2, so the slope of $f$ grows.',
              worked: '$f\'\'$ is the slope of $f\'$. Positive: $f\'$ goes up. Negative: $f\'$ goes down. Zero: $f\'$ stays level.' };
          }
          s = pick(r, [1, -1, 0]); p = INT(r, -3, 3); fp = [p, p + s * INT(r, 1, 4)]; fp.push(fp[1] + s * INT(r, 1, 4)); if (s === 0) fp = [p, p, p];
          if (s === 0 || fp[1] - fp[0] === fp[2] - fp[1] || true) { /* the three values change in one direction, so the sign of f'' is clear */ }
          tab = '<table class="qtab"><tr><th>x</th><th>1</th><th>2</th><th>3</th></tr><tr><th>f′(x)</th><td>' + fp.join('</td><td>') + '</td></tr></table>';
          return { type: 'choice', pic: tab, data: { table: { x: [1, 2, 3], fp: fp } }, prompt: 'The table gives values of $f\'$. Near $x=2$, is $f\'\'$ positive, negative or zero?', options: SIGNS, answer: s > 0 ? 0 : s < 0 ? 1 : 2,
            hint: 'Step card: $f\'\'$ is the slope of $f\'$. Read the row of $f\'$ values left to right: going up, going down, or level. Example: $1, 3, 6$ is going up, so $f\'\'$ is positive.',
            worked: 'The $f\'$ values ' + (s > 0 ? 'go up' : s < 0 ? 'go down' : 'stay the same') + ', so the slope of $f\'$ is ' + SIGNS[s > 0 ? 0 : s < 0 ? 1 : 2] + '.' };
        }
        if (b === 2) {
          p = pick(r, [1, 2, 3, -1, -2]); a = INT(r, -2, 4); s = pick(r, [-4, 0, 4]); q = s - 2 * p * a; var c0 = INT(r, -5, 5), cf = [c0, q, p];
          return { type: 'choice', data: { fpjs: jsPoly(cf), a: a }, prompt: '$f\'(x)=' + polyText(cf, true) + '$. At $x=' + a + '$, is $f\'\'$ positive, negative or zero?', options: SIGNS, answer: s > 0 ? 0 : s < 0 ? 1 : 2,
            hint: 'Step card: differentiate $f\'$ to get $f\'\'$, then put in $x=' + a + '$. First step: $f\'\'(x)=' + polyText(dpoly(cf), true) + '$. Same move: if $f\'=x^2-3x$, then $f\'\'=2x-3$, and at $x=1$ that is $-1$, which is negative.',
            worked: '$f\'\'(x)=' + polyText(dpoly(cf), true) + '$. At $x=' + a + '$ it equals $' + s + '$, which is ' + SIGNS[s > 0 ? 0 : s < 0 ? 1 : 2] + '.' };
        }
        sp = pick(r, [2, 4, 5]); m = pick(r, [-5, -4, -3, -2, -1, 1, 2, 3, 4, 6, 8]); x1 = INT(r, 0, 3); x2 = x1 + sp; mid = x1 + sp / 2; A = INT(r, -9, 9); B = A + sp * m;
        var dec = INT(r, 0, 3) - 2 + x1 * 0; tab = '<table class="qtab"><tr><th>x</th><th>' + x1 + '</th><th>' + x2 + '</th></tr><tr><th>f′(x)</th><td>' + A + '</td><td>' + B + '</td></tr></table>';
        return { type: 'num', pic: tab, data: { table: { x: [x1, x2], fp: [A, B] }, mid: mid }, prompt: 'The table gives two values of $f\'$. Estimate $f\'\'(' + mid + ')$ with the slope between them.', answer: m,
          hint: 'Step card: $f\'\'$ is the slope of $f\'$, so use rise over run on the table: change in $f\'$ divided by change in $x$. First step: the change in $x$ is ' + sp + '. Same move: $f\'(1)=2$ and $f\'(5)=10$ give $\\dfrac{10-2}{5-1}=2$.',
          worked: 'Rise over run: $\\dfrac{' + B + '-(' + A + ')}{' + x2 + '-' + x1 + '}=\\dfrac{' + (B - A) + '}{' + sp + '}=' + m + '$.' };
      } },

      /* implicit: d²y/dx² at a point of a curve, a clean decimal */
      { id: 'implicit', title: 'Second derivative of a curve', gen: function (b, r) {
        b = Math.min(b, 3);
        var e, ans, ex = 'for $y^2=x$: $y\'=\\dfrac1{2y}$. Differentiate again: $y\'\'=-\\dfrac{y\'}{2y^2}$. Then put in $y\'$.', exxy = 'for $xy=3$: $y\'=-\\dfrac yx$. Differentiate again with the quotient rule: $y\'\'=-\\dfrac{y\'x-y}{x^2}$. Then put in $y\'$.', p, k, a, y, sgn, rr;
        if (b <= 1) { rr = pick(r, [2, 4, 5, 10]); sgn = pick(r, [1, -1]); y = sgn * rr; ans = rnd(-rr * rr / Math.pow(y, 3));
          e = { tex: 'x^2+y^2=' + rr * rr, pt: '(0,' + y + ')', js: sgn + '*Math.sqrt(' + rr * rr + '-x*x)', a: 0, d1: '-\\dfrac{x}{y}', ex: ex, w: '$y\'=-\\dfrac xy=0$ at the point. Then $y\'\'=-\\dfrac{y-xy\'}{y^2}=-\\dfrac{y}{y^2}=-\\dfrac1y$ there, which is $' + ans + '$.' }; }
        else if (b === 2) { var KA = pick(r, [[4, 2], [4, 1], [6, 2], [2, 2], [8, 2], [12, 2], [4, 4], [10, 5], [5, 5]]); k = KA[0]; a = KA[1]; ans = rnd(2 * k / Math.pow(a, 3));
          e = { tex: 'xy=' + k, pt: '(' + a + ',' + rnd(k / a) + ')', js: k + '/x', a: a, d1: '-\\dfrac{y}{x}', ex: ex, w: '$y\'=-\\dfrac yx=-' + rnd(k / (a * a)) + '$ at the point. Differentiating again: $y\'\'=-\\dfrac{y\'x-y}{x^2}=' + ans + '$.' }; }
        else { e = pick(r, [{ tex: 'y^2=4x', pt: '(1,2)', js: '2*Math.sqrt(x)', a: 1, d1: '\\dfrac{2}{y}', f: -0.5 }, { tex: 'y^2=4x', pt: '(4,4)', js: '2*Math.sqrt(x)', a: 4, d1: '\\dfrac{2}{y}', f: -0.0625 }, { tex: 'y^2=4x', pt: '(1,-2)', js: '-2*Math.sqrt(x)', a: 1, d1: '\\dfrac{2}{y}', f: 0.5 }, { tex: 'y^2=8x', pt: '(2,4)', js: '2*Math.sqrt(2*x)', a: 2, d1: '\\dfrac{4}{y}', f: -0.25 }, { tex: 'y^2=2x', pt: '(0.5,1)', js: 'Math.sqrt(2*x)', a: 0.5, d1: '\\dfrac{1}{y}', f: -1 }, { tex: 'x^3+y^3=9', pt: '(1,2)', js: 'Math.cbrt(9-x*x*x)', a: 1, d1: '-\\dfrac{x^2}{y^2}', f: -0.5625 }, { tex: 'x^3+y^3=9', pt: '(2,1)', js: 'Math.cbrt(9-x*x*x)', a: 2, d1: '-\\dfrac{x^2}{y^2}', f: -36 }]);
          ans = e.f; e.ex = /^x\^3/.test(e.tex) ? exxy : ex; e.w = 'Find $y\'$ first, differentiate it again (each $y$ brings a new $y\'$), then put in $y\'$ and the point. The answer is $' + ans + '$.'; }
        e.ex = e.ex || ex;
        return { type: 'num', data: { js: e.js, a: e.a }, prompt: 'The curve $' + e.tex + '$ passes through $' + e.pt + '$. Find $\\dfrac{d^2y}{dx^2}$ at that point.', answer: ans,
          hint: 'Step card: (1) find $\\dfrac{dy}{dx}$, (2) differentiate it again, and each $y$ brings a new $\\dfrac{dy}{dx}$, (3) put in the $\\dfrac{dy}{dx}$ you found and the point. First step: $\\dfrac{dy}{dx}=' + e.d1 + '$. Same move on another example: ' + e.ex,
          worked: e.w };
      } }
    ],

    misconceptions: [
      { say: 'f″ is the same as (f′)².', fix: 'f″ is the derivative of f′, not its square.' },
      { say: 'The second derivative of e^(3x) is 3e^(3x).', fix: 'Each derivative multiplies by 3: 9e^(3x).' },
      { say: 'sin x repeats after 2 derivatives.', fix: 'sin, cos, −sin, −cos: it repeats after 4.' },
      { say: 'f″ > 0 means f is positive.', fix: 'It means the slope of f is increasing. f can be negative.' },
      { say: 'In y″ for an implicit curve, forgetting the new dy/dx from each y.', fix: 'Differentiate dy/dx with the chain rule, then substitute dy/dx.' }
    ]
    /* no pacing: the lesson has no clock, no trim, no skip and no end mark */
  };

  /* the figure for the notes: the cubic f(x) = x³/3 − x, its derivative x² − 1 and its second derivative 2x, three small graphs in a row */
  (function () {
    function line(fn, y0, y1, ox) { var p = [], i, x; for (i = 0; i <= 22; i++) { x = -2.2 + 4.4 * i / 22; p.push((ox + (x + 2.2) / 4.4 * 100).toFixed(1) + ',' + (105 - (fn(x) - y0) / (y1 - y0) * 100).toFixed(1)); } return p.join(' '); }
    function axes(y0, y1, ox) { return '<line x1="' + ox + '" y1="' + (105 - (0 - y0) / (y1 - y0) * 100).toFixed(1) + '" x2="' + (ox + 100) + '" y2="' + (105 - (0 - y0) / (y1 - y0) * 100).toFixed(1) + '" stroke="#7a8a99"/><line x1="' + (ox + 50) + '" y1="5" x2="' + (ox + 50) + '" y2="105" stroke="#7a8a99"/>'; }
    var P = [[function (x) { return x * x * x / 3 - x; }, -3, 3, 10], [function (x) { return x * x - 1; }, -2, 5, 130], [function (x) { return 2 * x; }, -5, 5, 250]], cols = ['#2b4fd9', '#1c7d4a', '#c26a00'], s = '<svg viewBox="0 0 360 140" role="img" aria-label="Three small graphs side by side: a cubic, a parabola and a straight line, marked 1, 2 and 3">';
    P.forEach(function (g, i) { s += '<rect x="' + g[3] + '" y="5" width="100" height="100" fill="none" stroke="#d5dde5"/>' + axes(g[1], g[2], g[3]) + '<polyline points="' + line(g[0], g[1], g[2], g[3]) + '" fill="none" stroke="' + cols[i] + '" stroke-width="3"/><circle cx="' + (g[3] + 50) + '" cy="125" r="10" fill="none" stroke="#142230"/><text x="' + (g[3] + 46) + '" y="130" font-size="13">' + (i + 1) + '</text>'; });
    SPEC.huddle.label.html = s + '</svg>';
  })();

  if (typeof module !== 'undefined' && module.exports) module.exports = SPEC; else (root.SPECS = root.SPECS || {})[SPEC.id] = SPEC;
})(typeof window !== 'undefined' ? window : globalThis);
