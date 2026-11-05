/* SPEC (calculus 3.4): the lesson page, the key PDFs and the unit tests all read this one file.
   Self-paced (selfPaced: true), the same shape as 3.3: no clock, no trimming, no skipping, no end mark, no stamp. Progress saves on the device.
   Math is written the way qkit writes it: $x^2$ in prompts, and typed answers in mathcheck syntax. Huddle text is plain text (no $ math).
   Choice options are plain text and unicode.
   Every skill item carries data.js, the function in plain JavaScript (Math.asin(0.6*x*x)), so tests/unit/inverse-trig.test.js can check the answer
   against a numeric derivative of the function itself and never against the inverse-trig rules. */
(function (root) {
  'use strict';
  var INT = function (r, a, b) { return a + Math.floor(r() * (b - a + 1)); };
  var pick = function (r, arr) { return arr[Math.floor(r() * arr.length)]; };
  var shuffle = function (r, arr) { var a = arr.slice(), i, j, t; for (i = a.length - 1; i > 0; i--) { j = Math.floor(r() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  var rnd = function (v) { return +v.toFixed(6); };

  /* The inside function u(x). tex/txt: how the student reads it. sq: u² as text. du: u′ as text. m, dm: u and u′ in mathcheck.
     js: u in JavaScript. f, d: u and u′ as numbers (for the slope items). max: the largest x where |u| stays below 1 (for arcsin and arccos samples). */
  var X = { tex: 'x', txt: 'x', sq: 'x²', du: '1', m: 'x', dm: '1', js: 'x', f: function (x) { return x; }, d: function () { return 1; }, max: 0.9, id: true };
  var K = function (k) { return { tex: k + 'x', txt: k + 'x', sq: (k * k) + 'x²', du: String(k), m: k + '*x', dm: String(k), js: k + '*x', f: function (x) { return k * x; }, d: function () { return k; }, max: 0.9 / k }; };
  var P2 = { tex: 'x^{2}', txt: 'x²', sq: 'x⁴', du: '2x', m: 'x^2', dm: '2*x', js: 'x*x', f: function (x) { return x * x; }, d: function (x) { return 2 * x; }, max: 0.9 };
  var P3 = { tex: 'x^{3}', txt: 'x³', sq: 'x⁶', du: '3x²', m: 'x^3', dm: '3*x^2', js: 'x*x*x', f: function (x) { return x * x * x; }, d: function (x) { return 3 * x * x; }, max: 0.95 };
  var EX = { tex: 'e^{x}', txt: 'eˣ', sq: 'e²ˣ', du: 'eˣ', m: 'e^x', dm: 'e^x', js: 'Math.exp(x)', f: Math.exp, d: Math.exp, max: null };
  var SQ = { tex: '\\sqrt{x}', txt: '√x', sq: 'x', du: '1/(2√x)', m: 'sqrt(x)', dm: '1/(2*sqrt(x))', js: 'Math.sqrt(x)', f: Math.sqrt, d: function (x) { return 1 / (2 * Math.sqrt(x)); }, max: 0.9 };
  var RC = { tex: '\\dfrac1x', txt: '1/x', sq: '1/x²', du: '−1/x²', m: '1/x', dm: '-1/x^2', js: '1/x', f: function (x) { return 1 / x; }, d: function (x) { return -1 / (x * x); }, max: null };
  /* c times a base inside, for the slope and tangent items (c is 0.6 so that 1 − u² is a clean square) */
  var C = function (c, B) { return { tex: c + B.tex, txt: c + B.txt, m: c + '*' + B.m, js: c + '*(' + B.js + ')', f: function (x) { return c * B.f(x); }, d: function (x) { return c * B.d(x); } }; };

  /* the three functions: their TeX name, JavaScript, rule (as a mathcheck string), and the plain rule with no chain factor */
  var FN = {
    arcsin: { tex: '\\arcsin', js: 'Math.asin', rule: function (u) { return '(' + u.dm + ')/sqrt(1-(' + u.m + ')^2)'; }, at: function (u, a) { return u.d(a) / Math.sqrt(1 - Math.pow(u.f(a), 2)); }, plain: function (v) { return 1 / Math.sqrt(1 - v * v); } },
    arccos: { tex: '\\arccos', js: 'Math.acos', rule: function (u) { return '-(' + u.dm + ')/sqrt(1-(' + u.m + ')^2)'; }, at: function (u, a) { return -u.d(a) / Math.sqrt(1 - Math.pow(u.f(a), 2)); }, plain: function (v) { return -1 / Math.sqrt(1 - v * v); } },
    arctan: { tex: '\\arctan', js: 'Math.atan', rule: function (u) { return '(' + u.dm + ')/(1+(' + u.m + ')^2)'; }, at: function (u, a) { return u.d(a) / (1 + Math.pow(u.f(a), 2)); }, plain: function (v) { return 1 / (1 + v * v); } }
  };
  var NAMES = ['arcsin', 'arccos', 'arctan'];
  var fnTex = function (n, u) { return FN[n].tex + (u.id ? '\\,x' : '\\left(' + u.tex + '\\right)'); };
  var jsOf = function (n, u) { return FN[n].js + '(' + u.js + ')'; };
  var dom = function (n, u) { return n === 'arctan' ? undefined : { x: [0.1, u.max] }; };   // arcsin and arccos only exist where |u| < 1
  var TEXDU = { '1/(2√x)': '\\dfrac1{2\\sqrt{x}}', '−1/x²': '-\\dfrac1{x^2}', '2x': '2x', '3x²': '3x^{2}', 'eˣ': 'e^{x}' };
  var texOf = function (d) { return TEXDU[d] || d; };

  /* which inside appears at each band; simple = a u′ that reads as one short term (for the multiple-choice items) */
  function inner(b, n, r, simple) {
    if (b <= 1) return X;
    if (b === 2) return K(INT(r, 2, 5));
    var L = n === 'arctan' ? [P2, P3, EX, SQ, RC] : [P2, P3, SQ];
    if (simple) L = n === 'arctan' ? [P2, P3, EX] : [P2, P3];
    return pick(r, L);
  }

  /* the answer as text, for the choice items: { t: shown, m: mathcheck } */
  function form(kind, n, u, o) {
    o = o || {};
    var du = o.noChain ? '1' : u.du, dm = o.noChain ? '1' : u.dm, sq = o.noSquare ? u.txt : u.sq, mm = o.noSquare ? '(' + u.m + ')' : '(' + u.m + ')^2', neg = o.neg ? '−' : '';
    if (kind === 'arctan') return { t: du + ' / (1 + ' + sq + ')', m: '(' + dm + ')/(1+' + mm + ')' };
    if (kind === 'minus') return { t: du + ' / (1 − ' + sq + ')', m: '(' + dm + ')/(1-' + mm + ')' };
    if (kind === 'plus') return { t: du + ' / √(1 + ' + sq + ')', m: '(' + dm + ')/sqrt(1+' + mm + ')' };
    return { t: neg + du + ' / √(1 − ' + sq + ')', m: (o.neg ? '-' : '') + '(' + dm + ')/sqrt(1-' + mm + ')' };
  }
  var right = function (n, u) { return n === 'arctan' ? form('arctan', n, u) : n === 'arccos' ? form('root', n, u, { neg: true }) : form('root', n, u); };

  var SPEC = {
    id: '3-4-inverse-trig', course: 'calc', unit: 'Unit 3 · Composite, Implicit and Inverse', title: '3.4 Derivatives of Inverse Trigonometric Functions',
    selfPaced: true,
    question: 'How fast does an angle change when its sine, or its tangent, changes?',
    targets: ['I can say what arcsin, arccos and arctan mean.', 'I can find the derivative of an inverse trig function, with the chain rule.', 'I can find a slope or a tangent line for an inverse trig curve.'],
    tabs: ['Warm-up', 'Predict', 'Explore', 'Notes', 'Build', 'Practice', 'Check'],
    exploreTarget: 'I can see how the slope of an inverse trig curve behaves.',
    huddleTarget: 'I can write the three inverse trig rules and use the chain rule.',
    buildTarget: 'I can differentiate an inverse trig function.',

    concepts: [
      { title: 'What arcsin means', points: ['arcsin x is the angle whose sine is x.', 'sin⁻¹ x means arcsin x, not 1/sin x.'], eq: 'y = arcsin x  ⟺  sin y = x' },
      { title: 'The three rules', points: ['arcsin and arccos have a square root.', 'arctan has no root and a plus sign.'], eq: 'd/dx arcsin x = 1/√(1 − x²)      d/dx arctan x = 1/(1 + x²)' },
      { title: 'The sign pair', points: ['arccos has the opposite sign of arcsin.', 'Everything else is the same.'], eq: 'd/dx arccos x = −1/√(1 − x²)' },
      { title: 'With the chain rule', points: ['Put u in for x, then multiply by u′.', 'Square the whole inside: (3x)² = 9x².'], eq: 'd/dx arcsin u = u′ / √(1 − u²)' },
      { title: 'Where they come from', points: ['Write x = sin y and differentiate.', 'A right triangle with hypotenuse 1 turns cos y into √(1 − x²).'], eq: '1 = cos y · dy/dx' }
    ],

    huddle: {
      defs: [
        { term: 'arcsin x', text: 'The [[angle]] whose sine is x. It is not 1/sin x.' },
        { term: 'Inverse rule', text: 'If y = arcsin x, then sin y = [[x]]. Differentiate both sides to find dy/dx.' },
        { term: 'The three rules', text: 'arcsin: 1/√(1 − x²). arccos: [[−1]]/√(1 − x²). arctan: 1/(1 + [[x²]]).' },
        { term: 'Chain rule', text: 'Put u in for x, then multiply by [[u′]]. Square the [[whole inside]].' }
      ],
      example: { prompt: 'Differentiate y = arcsin(3x).',
        steps: ['The inside is u = [[3x]]', 'Its derivative is u′ = [[3]]', 'Square the whole inside: u² = [[9x²]]', 'So dy/dx = 3 / √(1 − 9x²)'] },
      label: { title: 'Label the triangle',
        html: '<svg viewBox="0 0 330 200" role="img" aria-label="A right triangle with hypotenuse 1, the angle y at the left, the side x opposite y, and the third side along the bottom"><polygon points="40,170 240,170 240,50" fill="#eef3fb" stroke="#142230" stroke-width="2"/><path d="M80 170 A40 40 0 0 0 74 150" fill="none" stroke="#b3412e" stroke-width="2"/><text x="86" y="162" font-size="15" fill="#b3412e">y</text><rect x="228" y="158" width="12" height="12" fill="none" stroke="#142230"/><circle cx="125" cy="95" r="10" fill="none" stroke="#142230"/><text x="121" y="100" font-size="13">1</text><circle cx="262" cy="110" r="10" fill="none" stroke="#142230"/><text x="258" y="115" font-size="13">2</text><circle cx="140" cy="192" r="10" fill="none" stroke="#142230"/><text x="136" y="197" font-size="13">3</text></svg>',
        tags: [{ n: 1, text: 'The longest side has length [[1]].' }, { n: 2, text: 'The side opposite y has length [[x]].' }, { n: 3, text: 'The third side has length [[√(1 − x²)]].' }] }
    },

    /* three easy review items from earlier lessons */
    review: [
      { id: 'R1', title: 'Review 1', prompt: 'The derivative of $\\sin(5x)$ is…', options: ['5cos(5x)', 'cos(5x)', '5sin(5x)', '−5cos(5x)'], answer: 0, why: 'Chain rule: the outside gives $\\cos(5x)$, and the inside $5x$ brings a factor 5.' },
      { id: 'R2', title: 'Review 2', prompt: 'If $\\sin y = x$, then differentiating both sides with respect to $x$ gives…', options: ['cos y · dy/dx = 1', 'cos y = 1', 'sin y · dy/dx = 1', 'cos y · dy/dx = x'], answer: 0, why: 'Every $y$ term gets a factor $\\tfrac{dy}{dx}$. The derivative of $\\sin y$ is $\\cos y\\cdot\\tfrac{dy}{dx}$, and the derivative of $x$ is 1.' },
      { id: 'R3', title: 'Review 3', prompt: 'A right triangle has hypotenuse 5 and one leg 3. The other leg is…', options: ['4', '2', '8', '√34'], answer: 0, why: 'Pythagorean theorem: $3^2+4^2=5^2$, so the other leg is 4.' }
    ],

    predicts: [
      { id: 'P1', title: 'The ends of arcsin', prompt: 'Sine has a flat tangent at its peak. Mirror that piece across $y=x$. At $x=1$, the arcsin curve has a tangent that is…',
        options: ['flat', 'vertical', 'a line with slope 1', 'gone'], answer: 1, why: 'Rise and run swap in a mirror. A flat tangent becomes a vertical tangent, so the slope of arcsin grows without bound near $x=1$.' },
      { id: 'P2', title: 'The tail of arctan', prompt: 'The graph of arctan levels off for large $x$. As $x$ gets larger, its slope gets…',
        options: ['closer to 0', 'larger and larger', 'closer to 1', 'negative'], answer: 0, why: 'A curve that levels off has a tangent that gets flatter and flatter, so the slope heads toward 0.' }
    ],
    observe: [
      { id: 'O1', prompt: 'In Station 3, the slope of arctan was largest at $x=$…', options: ['0', '1', '2', '4'], answer: 0, why: 'The slope was 1 at $x=0$ and got smaller as $x$ moved away.' },
      { id: 'O2', prompt: 'In Station 4, at the same $x$, the slope of arccos compared with the slope of arcsin was…', options: ['the same', 'the opposite sign and the same size', 'the reciprocal', 'always 0'], answer: 1, why: 'The two slopes were $1.25$ and $-1.25$, then $1.67$ and $-1.67$: same size, opposite sign.' }
    ],
    exploreIds: ['X1', 'X2', 'X3', 'X4'],

    /* the mid-lesson check: after the notes, before the problems */
    mid: [
      { id: 'M1', title: 'Check 1', prompt: 'For $y=\\arctan(4x)$, the derivative $y\'$ is…', options: ['4 / (1 + 16x²)', '1 / (1 + 16x²)', '4 / (1 + 4x²)', '4 / (1 + x²)'], answer: 0, why: 'Chain rule: $u=4x$, $u\'=4$, and $u^2=16x^2$. So $y\'=\\dfrac{4}{1+16x^2}$.' },
      { id: 'M2', title: 'Check 2', prompt: 'For $y=\\arcsin(2x)$, the expression under the square root is…', options: ['1 − 2x²', '1 − 4x²', '1 − 2x', '1 − x²'], answer: 1, why: 'Square the whole inside: $(2x)^2=4x^2$, not $2x^2$.' }
    ],

    skills: [
      /* deriv: typed. Band 1 the plain rule, band 2 a constant times x inside, band 3 a real inside function. */
      { id: 'deriv', title: 'Differentiate', gen: function (b, r) {
        b = Math.min(b, 3);
        var n = pick(r, NAMES), u = inner(b, n, r), ans = FN[n].rule(u), ex = n === 'arctan' ? 'arcsin' : 'arctan', sgn = n === 'arccos' ? '-' : '', traps = [], du = texOf(u.du);
        traps.push({ expr: form(n === 'arctan' ? 'arctan' : 'root', n, u, { noSquare: true, neg: n === 'arccos' }).m, msg: (n === 'arctan' ? 'The bottom is 1 plus' : 'Under the root you need 1 minus') + ' the SQUARE of the inside, $u^2$, not $u$.' });
        if (!u.id) traps.push({ expr: sgn + (n === 'arctan' ? '1/(1+(' + u.m + ')^2)' : '1/sqrt(1-(' + u.m + ')^2)'), msg: 'Multiply by the derivative of the inside, $u\'$.' });
        if (b === 2) traps.push({ expr: n === 'arctan' ? '(' + u.dm + ')/(1+' + u.dm + '*x^2)' : sgn + '(' + u.dm + ')/sqrt(1-' + u.dm + '*x^2)', msg: 'Square the whole inside: $(' + u.tex + ')^2=' + u.sq.replace('x²', 'x^{2}') + '$, not $' + u.dm + 'x^2$.' });
        if (n === 'arccos') traps.push({ expr: '(' + u.dm + ')/sqrt(1-(' + u.m + ')^2)', msg: 'arccos has the opposite sign of arcsin.' });
        if (n === 'arcsin') traps.push({ expr: '-(' + u.dm + ')/sqrt(1-(' + u.m + ')^2)', msg: 'That minus sign belongs to arccos. arcsin is positive.' });
        if (n === 'arctan') traps.push({ expr: '(' + u.dm + ')/(1-(' + u.m + ')^2)', msg: 'arctan has a PLUS sign: $1+u^2$.' });
        else traps.push({ expr: sgn + '(' + u.dm + ')/(1+(' + u.m + ')^2)', msg: 'That is the arctan rule. arcsin and arccos have a square root and a minus sign.' });
        var hints = u.id
          ? ['Step card: name the function, then use its own rule from the Concepts button.', 'First step: this is ' + n + ', so you need the ' + n + ' rule.', 'Same move on another example: $\\dfrac{d}{dx}\\,\\' + ex + '\\,x$ uses ' + (ex === 'arctan' ? '$\\dfrac1{1+x^2}$.' : '$\\dfrac1{\\sqrt{1-x^2}}$.')]
          : ['Step card: (1) name the inside $u$, (2) find $u\'$, (3) put them in the rule for your function.', 'First step: here $u=' + u.tex + '$, so $u\'=' + du + '$.', 'Same move on another example: for $y=\\' + ex + '(5x)$, $u=5x$ and $u\'=5$, so ' + (ex === 'arctan' ? '$y\'=\\dfrac{5}{1+25x^2}$.' : '$y\'=\\dfrac{5}{\\sqrt{1-25x^2}}$.')];
        return { type: 'expr', domain: dom(n, u), data: { fn: n, js: jsOf(n, u) }, prompt: 'Differentiate.', label: '$\\dfrac{d}{dx}\\,' + fnTex(n, u) + '=$', answer: ans, vars: ['x'], hints: hints, traps: traps,
          worked: u.id ? 'Use the ' + n + ' rule directly.' : 'The inside is $u=' + u.tex + '$ and $u\'=' + du + '$. Put them in the ' + n + ' rule.' };
      } },

      /* slope: the slope at a point, a clean decimal (the keypad has no fraction key) */
      { id: 'slope', title: 'Slope at a point', gen: function (b, r) {
        b = Math.min(b, 3);
        var n, u, a, k, c, L, e;
        if (b <= 1) { e = pick(r, [['arctan', 0], ['arctan', 1], ['arctan', 2], ['arctan', 3], ['arcsin', 0], ['arcsin', 0.6], ['arcsin', -0.6], ['arccos', 0], ['arccos', 0.6]]); n = e[0]; u = X; a = e[1]; }
        else if (b === 2) { n = pick(r, NAMES);
          if (n === 'arctan') { e = pick(r, [[2, 1], [4, 1], [5, 1], [5, 2], [10, 3], [3, 3]]); k = e[0]; a = rnd(e[1] / k); } else { k = INT(r, 2, 5); a = rnd(0.6 / k); }
          u = K(k); }
        else { L = [['arctan', P2, 1], ['arctan', P3, 1], ['arctan', EX, 0], ['arctan', SQ, 1], ['arctan', RC, 1], ['arctan', C(2, P2), 0.5], ['arcsin', C(0.6, P2), 1], ['arcsin', C(0.6, P3), 1], ['arccos', C(0.6, P2), 1], ['arcsin', C(0.6, EX), 0], ['arccos', C(0.6, EX), 0]];
          e = pick(r, L); n = e[0]; u = e[1]; a = e[2]; }
        var ans = rnd(FN[n].at(u, a)), tx = n === 'arctan' ? FN[n].tex + '\\left(' + u.tex + '\\right)' : FN[n].tex + '\\left(' + u.tex + '\\right)';
        if (u.id) tx = FN[n].tex + '\\,x';
        return { type: 'num', data: { fn: n, js: jsOf(n, u), a: a }, prompt: '$y=' + tx + '$. Find $\\dfrac{dy}{dx}$ at $x=' + a + '$.', answer: ans,
          hint: u.id ? 'Step card: use the rule for ' + n + ', then put in the $x$ value. First step: find $1-x^2$ or $1+x^2$ at $x=' + a + '$. Same move: for arctan at $x=1$, $\\dfrac1{1+1}=0.5$.'
            : 'Step card: (1) find $u$ and $u\'$ at $x=' + a + '$, (2) put them in the rule, (3) compute. First step: $u(' + a + ')=' + rnd(u.f(a)) + '$ and $u\'(' + a + ')=' + rnd(u.d(a)) + '$. Same move: for $\\arctan(2x)$ at $x=0.5$, $u=1$, $u\'=2$, so $\\dfrac{2}{1+1}=1$.',
          worked: '$u(' + a + ')=' + rnd(u.f(a)) + '$ and $u\'(' + a + ')=' + rnd(u.d(a)) + '$. Put them in the ' + n + ' rule: the slope is $' + ans + '$.' };
      } },

      /* inside: which expression is the derivative? The wrong options are the named mistakes. */
      { id: 'inside', title: 'Spot the right rule', gen: function (b, r) {
        b = Math.min(b, 3);
        var n = pick(r, NAMES), u = inner(b, n, r, true), good = right(n, u), pool = [], opts, order, seen = {};
        if (n === 'arctan') { pool = [form('arctan', n, u, { noSquare: true }), form('root', n, u), form('minus', n, u)]; if (!u.id) pool.unshift(form('arctan', n, u, { noChain: true })); }
        else { pool = [form('root', n, u, { noSquare: true, neg: n === 'arccos' }), form('arctan', n, u), n === 'arccos' ? form('root', n, u) : form('root', n, u, { neg: true })]; if (!u.id) pool.unshift(form('root', n, u, { noChain: true, neg: n === 'arccos' })); }
        pool.push(form('plus', n, u)); seen[good.t] = 1;
        pool = pool.filter(function (o) { if (seen[o.t]) return false; seen[o.t] = 1; return true; });
        opts = shuffle(r, pool.slice(0, 3)).concat([good]); order = shuffle(r, opts);
        return { type: 'choice', data: { js: jsOf(n, u), opts: order.map(function (o) { return o.m; }) }, prompt: 'Which expression is $\\dfrac{dy}{dx}$ for $y=' + fnTex(n, u) + '$?', options: order.map(function (o) { return o.t; }), answer: order.indexOf(good),
          hint: u.id ? 'Step card: each function has its own rule. Check the sign, then check whether it has a square root. Example: arctan has no root and a plus sign.'
            : 'Step card: (1) name $u$, (2) find $u\'$, (3) square the whole $u$. First step: here $u=' + u.tex + '$. Same move: for $\\arctan(3x)$, $u\'=3$ and $u^2=9x^2$, so $\\dfrac{3}{1+9x^2}$.',
          worked: 'The inside is $u=' + u.tex + '$, so $u\'=' + u.du.replace('eˣ', 'e^{x}').replace('x²', 'x^2').replace('x³', 'x^3') + '$ and $u^2=' + u.sq.replace('x²', 'x^2').replace('x⁴', 'x^4').replace('x⁶', 'x^6').replace('e²ˣ', 'e^{2x}') + '$. The ' + n + ' rule gives ' + good.t + '.' };
      } },

      /* tangent: the tangent line at a point where the angle is a nice multiple of π */
      { id: 'tangent', title: 'Tangent line', gen: function (b, r) {
        b = Math.min(b, 3);
        var e, n, u, a, y0, y0t, k;
        if (b <= 1) { e = pick(r, [['arcsin', X, 0, '0', '0'], ['arctan', X, 0, '0', '0'], ['arccos', X, 0, 'pi/2', '\\tfrac{\\pi}{2}'], ['arctan', X, 1, 'pi/4', '\\tfrac{\\pi}{4}']]); }
        else if (b === 2) { k = pick(r, [2, 3]); e = pick(r, [['arcsin', K(k), 0, '0', '0'], ['arccos', K(k), 0, 'pi/2', '\\tfrac{\\pi}{2}'], ['arctan', K(2), 0.5, 'pi/4', '\\tfrac{\\pi}{4}'], ['arctan', K(4), 0.25, 'pi/4', '\\tfrac{\\pi}{4}']]); }
        else e = pick(r, [['arctan', P2, 1, 'pi/4', '\\tfrac{\\pi}{4}'], ['arctan', P3, 1, 'pi/4', '\\tfrac{\\pi}{4}'], ['arctan', EX, 0, 'pi/4', '\\tfrac{\\pi}{4}'], ['arctan', SQ, 1, 'pi/4', '\\tfrac{\\pi}{4}'], ['arctan', RC, 1, 'pi/4', '\\tfrac{\\pi}{4}']]);
        n = e[0]; u = e[1]; a = e[2]; y0 = e[3]; y0t = e[4];
        var m = rnd(FN[n].at(u, a)), ans = '(' + m + ')*(x-(' + a + '))+(' + y0 + ')', traps = [], plain = rnd(FN[n].plain(u.f(a)));
        if (y0 !== '0') traps.push({ expr: '(' + m + ')*(x-(' + a + '))', msg: 'The line must pass through the point, so add the height $f(' + a + ')=' + y0t + '$.' });
        if (!u.id && plain !== m) traps.push({ expr: '(' + plain + ')*(x-(' + a + '))+(' + y0 + ')', msg: 'That slope forgot the chain rule: multiply the rule by $u\'$.' });
        traps.push({ expr: '(' + (-m) + ')*(x-(' + a + '))+(' + y0 + ')', msg: 'Check the sign of the slope.' }); if (m === 0) traps.pop();
        var ex = n === 'arcsin' ? '\\arctan(2x)\\text{ at }x=0.5' : '\\arcsin(2x)\\text{ at }x=0';
        return { type: 'expr', data: { fn: n, js: jsOf(n, u), a: a, y0: y0 }, prompt: 'Write the tangent line to $y=' + fnTex(n, u) + '$ at $x=' + a + '$.', label: '$y=$', answer: ans, vars: ['x'], traps: traps,
          hints: ['Step card: you need a point and a slope. The point is $(a,f(a))$. The slope is $f\'(a)$ from the rule.', 'First step: the point. At $x=' + a + '$ the height is $f(' + a + ')=' + y0t + '$.', 'Same move on another example: $' + ex + '$. ' + (n === 'arcsin' ? 'The point is $(0.5,\\tfrac{\\pi}{4})$ and the slope is 1, so $y=(x-0.5)+\\tfrac{\\pi}{4}$.' : 'The point is $(0,0)$ and the slope is 2, so $y=2x$.')],
          worked: 'The point is $(' + a + ',' + y0t + ')$ and the slope is $' + m + '$. So $y=' + m + '(x-' + a + ')+' + y0t + '$.' };
      } }
    ],

    misconceptions: [
      { say: 'sin⁻¹ x means 1 / sin x.', fix: 'It means the inverse function arcsin x. The notation looks like a power but is not one.' },
      { say: 'arcsin and arccos have the same derivative.', fix: 'They differ by a minus sign. arccos is the negative of arcsin.' },
      { say: 'The derivative of arctan x has a square root.', fix: 'Only arcsin and arccos do. arctan is 1 / (1 + x²).' },
      { say: 'Forgetting u′: d/dx arctan(4x) = 1/(1 + 16x²).', fix: 'Multiply by the derivative of the inside: 4 / (1 + 16x²).' },
      { say: 'Squaring only the x: (3x)² = 3x².', fix: 'Square the whole inside: (3x)² = 9x².' }
    ]
    /* no pacing: the lesson has no clock, no trim, no skip and no end mark */
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = SPEC; else (root.SPECS = root.SPECS || {})[SPEC.id] = SPEC;
})(typeof window !== 'undefined' ? window : globalThis);
