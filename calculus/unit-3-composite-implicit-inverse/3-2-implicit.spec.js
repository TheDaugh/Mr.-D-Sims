/* SPEC (calculus 3.2): the lesson page, the key PDFs and the unit tests all read this one file.
   Math is written the way qkit writes it: $x^2$ in prompts, and answers in mathcheck syntax. Huddle text is plain text (no $ math).
   Choice options are plain text and unicode (the engine does not render $ in skill options).
   Every skill item also carries the data its test needs, so tests/unit/implicit.test.js can check it without implicit differentiation:
     F  the curve as "left minus right" in mathcheck syntax, so the true slope is -Fx/Fy
     pt the point on the curve, T the term for the y-term skill. */
(function (root) {
  'use strict';
  var INT = function (r, a, b) { return a + Math.floor(r() * (b - a + 1)); };
  var pick = function (r, arr) { return arr[Math.floor(r() * arr.length)]; };
  var shuffle = function (r, arr) { var a = arr.slice(), i, j, t; for (i = a.length - 1; i > 0; i--) { j = Math.floor(r() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  var co = function (c) { return c === 1 ? '' : String(c); };                                  // coefficient, 1 left off
  var SUP = { 2: '²', 3: '³', 4: '⁴', 5: '⁵' };
  var vpow = function (v, k) { return k === 1 ? v : v + SUP[k]; };                              // plain-text power for options
  var gcd = function (a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a || 1; };
  var frac = function (p, q) { var g = gcd(p, q); p /= g; q /= g; if (q < 0) { p = -p; q = -q; } return { n: p, d: q, v: p / q, s: q === 1 ? '(' + p + ')' : '(' + p + '/' + q + ')' }; };
  var sub = function (x0) { return x0 < 0 ? '(x-(' + x0 + '))' : '(x-' + x0 + ')'; };        // mathcheck text of x - x0
  var terminates = function (d) { d = Math.abs(d); while (d % 2 === 0) d /= 2; while (d % 5 === 0) d /= 5; return d === 1; };
  var sgn = function (r) { return r() < 0.5 ? -1 : 1; };
  var ptTex = function (x0, y0) { return '(' + x0 + ',' + y0 + ')'; };

  /* the curve families, each with the true slope at a point: used by "point" and "tangent" */
  function circlePoint(r) { var p = pick(r, [[3, 4], [4, 3], [5, 12], [12, 5], [6, 8], [8, 6]]), x0 = p[0] * sgn(r), y0 = p[1] * sgn(r), k = p[0] * p[0] + p[1] * p[1];
    return { tex: 'x^{2}+y^{2}=' + k, F: 'x^2+y^2-' + k, x0: x0, y0: y0, m: frac(-x0, y0), form: 'x²+y²' }; }
  function ellipsePoint(r) { var a = pick(r, [2, 4, 5]), y0 = pick(r, [1, 2]) * sgn(r), x0 = INT(r, 1, 6) * sgn(r), k = x0 * x0 + a * y0 * y0;
    return { tex: 'x^{2}+' + a + 'y^{2}=' + k, F: 'x^2+' + a + '*y^2-' + k, x0: x0, y0: y0, m: frac(-x0, a * y0), form: 'x²+' + a + 'y²' }; }
  function tiltPoint(r) { var p = pick(r, [[1, 1], [2, 1], [1, 2], [3, 1], [2, 2], [4, 1], [3, -1], [4, -1]]), k = p[0] * p[0] + p[0] * p[1] + p[1] * p[1];
    return { tex: 'x^{2}+xy+y^{2}=' + k, F: 'x^2+x*y+y^2-' + k, x0: p[0], y0: p[1], m: frac(-(2 * p[0] + p[1]), p[0] + 2 * p[1]), form: 'x²+xy+y²' }; }
  function mixedPoint(r) {                                                                       // a·x·y = c + y², or x³ + y³ = a·x·y
    var a, c, x0, y0, den, p, m, tries = 0;
    if (r() < 0.5) { p = pick(r, [[2, 2, 4], [2, 4, 9], [4, 2, 9], [3, 3, 6], [1, 1, 2]]); x0 = p[0]; y0 = p[1]; a = p[2];
      return { tex: 'x^{3}+y^{3}=' + a + 'xy', F: 'x^3+y^3-' + a + '*x*y', x0: x0, y0: y0, m: frac(a * y0 - 3 * x0 * x0, 3 * y0 * y0 - a * x0), form: 'x³+y³=' + a + 'xy' }; }
    do { a = INT(r, 2, 6); x0 = INT(r, 1, 4); y0 = INT(r, 1, 4); den = 2 * y0 - a * x0; c = a * x0 * y0 - y0 * y0; m = den ? frac(a * y0, den) : null; tries++; }
    while ((!den || c <= 0 || !terminates(m.d)) && tries < 200);
    return { tex: a + 'xy=' + c + '+y^{2}', F: a + '*x*y-' + c + '-y^2', x0: x0, y0: y0, m: m, form: a + 'xy=' + c + '+y²' };
  }

  var SPEC = {
    id: '3-2-implicit', course: 'calc', unit: 'Unit 3 · Composite, Implicit and Inverse', title: '3.2 Implicit Differentiation',
    question: 'How do you find the slope of a curve that is not a function?',
    targets: ['I can differentiate both sides of an equation with x and y.', 'I can solve for dy/dx and find a slope at a point.', 'I can write the tangent line at a point on the curve.'],
    tabs: ['Warm-up', 'Predict', 'Explore', 'Huddle', 'Build', 'Practice', 'Check'],
    huddleTarget: 'I can find dy/dx implicitly and use it.',
    buildTarget: 'I can find dy/dx for an equation in x and y.',

    concepts: [
      { title: 'Implicit form', points: ['x and y are mixed in one equation.', 'Near a point, y still behaves as a function of x.'], eq: 'x² + y² = 25' },
      { title: 'The y-factor', points: ['y depends on x, so every y-term is a composite.', 'Differentiate it, then multiply by dy/dx.'], eq: 'd/dx (y²) = 2y · dy/dx' },
      { title: 'Products', points: ['A term with x and y needs the product rule.', 'Both parts give a piece.'], eq: 'd/dx (xy) = y + x · dy/dx' },
      { title: 'Collect, factor, divide', points: ['Move every dy/dx term to one side.', 'Factor out dy/dx, then divide.'], eq: 'dy/dx = −(2x) / (2y)' },
      { title: 'A slope needs a point', points: ['The answer has x and y in it.', 'Use both coordinates of the point on the curve.'], eq: 'y − b = (dy/dx)(x − a)' }
    ],

    huddle: {
      defs: [
        { term: 'Implicit form', text: 'An equation where x and y are [[mixed]] together.' },
        { term: 'The y-factor', text: 'Every y-term gets a factor of [[dy/dx]].' },
        { term: 'Solving', text: 'Collect the dy/dx terms, [[factor]] it out, then divide.' }
      ],
      example: { prompt: 'Find dy/dx for x² + y² = 25.',
        steps: ['Differentiate both sides: 2x + 2y·dy/dx = [[0]]', 'Isolate: 2y·dy/dx = [[−2x]]', 'Divide by 2y: dy/dx = [[−x/y]]'] },
      label: { title: 'Label the tangent',
        html: '<svg viewBox="0 0 330 160" role="img" aria-label="A circle with a tangent line at the point 3, 4"><circle cx="110" cy="85" r="60" fill="none" stroke="#2b4fd9" stroke-width="3"/><line x1="106" y1="7" x2="202" y2="79" stroke="#b3412e" stroke-width="2.5"/><circle cx="146" cy="37" r="5" fill="#142230"/><text x="214" y="40" font-size="15" fill="#142230">3² + 4² = 25</text><text x="214" y="62" font-size="15" fill="#142230">dy/dx = −x/y</text><circle cx="166" cy="26" r="9" fill="none" stroke="#142230"/><text x="162" y="31" font-size="12">1</text><circle cx="188" cy="48" r="9" fill="none" stroke="#142230"/><text x="184" y="53" font-size="12">2</text><circle cx="202" cy="94" r="9" fill="none" stroke="#142230"/><text x="198" y="99" font-size="12">3</text></svg>',
        tags: [{ n: 1, text: 'The point (3, 4) lies on the [[curve]].' }, { n: 2, text: 'The [[tangent line]] touches the curve at that point.' }, { n: 3, text: 'Its slope at (3, 4) is [[−3/4]].' }] }
    },

    predicts: [
      { id: 'P1', title: 'Two points, one x', prompt: 'The circle $x^2+y^2=25$ passes through $(3,4)$ and $(3,-4)$. The tangent slopes at those two points are…',
        options: ['the same', 'opposite in sign', 'both zero', 'both vertical'], answer: 1, why: 'The upper arc falls at $x=3$ and the lower arc rises there: the slopes are $-\\tfrac34$ and $+\\tfrac34$. One $x$ cannot name the slope.' },
      { id: 'P2', title: 'A hidden function', prompt: 'Suppose $y=x^3$. Then $y^2=x^6$, so $\\dfrac{d}{dx}(y^2)=6x^5$. Which expression gives $6x^5$?',
        options: ['$2y$', '$2y\\cdot\\dfrac{dy}{dx}$', '$y\\cdot\\dfrac{dy}{dx}$', '$2x$'], answer: 1, why: '$2y\\cdot\\frac{dy}{dx}=2x^3\\cdot3x^2=6x^5$. The chain rule puts $\\frac{dy}{dx}$ on every $y$-term.' }
    ],
    observe: [
      { id: 'O1', prompt: 'At $x=0$ both tangents are…', options: ['flat', 'vertical', 'tilted'], answer: 0 },
      { id: 'O2', prompt: 'At the same $x$, the upper and lower slopes are…', options: ['opposite numbers', 'equal', 'both zero'], answer: 0 }
    ],

    skills: [
      { id: 'dydx', title: 'Find dy/dx', gen: function (b, r) {
        var a, k, c, n, s;
        if (b <= 1) { a = INT(r, 2, 7);
          return { type: 'expr', F: 'y^2-' + a + '*x', prompt: 'Differentiate both sides, then solve for $\\frac{dy}{dx}$.', label: '$y^{2}=' + a + 'x,\\quad \\tfrac{dy}{dx}=$', answer: a + '/(2y)', vars: ['x', 'y'],
            hints: ['Differentiate both sides with respect to $x$.', 'The left side gives $2y\\,\\frac{dy}{dx}$. The right side gives ' + a + '.', 'Divide both sides by $2y$.'],
            traps: [{ expr: a + '/y', msg: 'The 2 from $y^{2}$ is missing: $\\frac{d}{dx}y^{2}=2y\\,\\frac{dy}{dx}$.' }, { expr: '2y/' + a, msg: 'That is $\\frac{dx}{dy}$, upside down.' }],
            worked: '$2y\\,\\dfrac{dy}{dx}=' + a + '$, so $\\dfrac{dy}{dx}=\\dfrac{' + a + '}{2y}$.' }; }
        if (b === 2) { a = INT(r, 2, 6); k = INT(r, 5, 40);
          return { type: 'expr', F: 'x^2+' + a + '*y^2-' + k, prompt: 'Differentiate both sides, then solve for $\\frac{dy}{dx}$.', label: '$x^{2}+' + a + 'y^{2}=' + k + ',\\quad \\tfrac{dy}{dx}=$', answer: '-x/(' + a + '*y)', vars: ['x', 'y'],
            hints: ['The constant ' + k + ' becomes 0.', '$2x+' + (2 * a) + 'y\\,\\frac{dy}{dx}=0$.', 'Move $2x$ across, then divide by $' + (2 * a) + 'y$.'],
            traps: [{ expr: 'x/(' + a + '*y)', msg: 'Check the sign: moving $2x$ to the other side makes it negative.' }, { expr: '-x/y', msg: 'The ' + a + ' multiplies: the $y^{2}$ term gives $' + (2 * a) + 'y\\,\\frac{dy}{dx}$.' }],
            worked: '$2x+' + (2 * a) + 'y\\,\\dfrac{dy}{dx}=0$, so $\\dfrac{dy}{dx}=\\dfrac{-2x}{' + (2 * a) + 'y}=-\\dfrac{x}{' + a + 'y}$.' }; }
        if (b === 3) { a = INT(r, 1, 3); c = INT(r, 2, 5); n = INT(r, 4, 5);
          return { type: 'expr', F: a + '*y^3+' + c + '*x^2-y-x^' + n, prompt: 'Differentiate both sides. Collect the $\\frac{dy}{dx}$ terms, factor, and divide.', label: '$' + co(a) + 'y^{3}+' + c + 'x^{2}-y=x^{' + n + '},\\quad \\tfrac{dy}{dx}=$',
            answer: '(' + n + '*x^' + (n - 1) + '-' + (2 * c) + '*x)/(' + (3 * a) + '*y^2-1)', vars: ['x', 'y'],
            hints: ['Left side: $' + (3 * a) + 'y^{2}\\frac{dy}{dx}+' + (2 * c) + 'x-\\frac{dy}{dx}$. Right side: $' + n + 'x^{' + (n - 1) + '}$.', 'Put the $\\frac{dy}{dx}$ terms on the left and the rest on the right.', 'Factor out $\\frac{dy}{dx}$ and divide.'],
            traps: [{ expr: '(' + n + '*x^' + (n - 1) + '-' + (2 * c) + '*x)/(' + (3 * a) + '*y^2)', msg: 'The $-y$ term also gives a $\\frac{dy}{dx}$: it stays in the bracket as $-1$.' }],
            worked: '$' + (3 * a) + 'y^{2}y\'+' + (2 * c) + 'x-y\'=' + n + 'x^{' + (n - 1) + '}$, so $y\'(' + (3 * a) + 'y^{2}-1)=' + n + 'x^{' + (n - 1) + '}-' + (2 * c) + 'x$.' }; }
        if (r() < 0.5) { a = INT(r, 2, 6); c = INT(r, 3, 12);
          return { type: 'expr', F: a + '*x*y-' + c + '-y^2', prompt: 'Differentiate both sides. The left side needs the product rule.', label: '$' + a + 'xy=' + c + '+y^{2},\\quad \\tfrac{dy}{dx}=$', answer: a + '*y/(2*y-' + a + '*x)', vars: ['x', 'y'],
            hints: ['Left side: $' + a + 'y+' + a + 'x\\,\\frac{dy}{dx}$. Right side: $2y\\,\\frac{dy}{dx}$.', 'Collect the $\\frac{dy}{dx}$ terms on one side.', 'Factor out $\\frac{dy}{dx}$, then divide.'],
            traps: [{ expr: a + '*y/(' + a + '*x-2*y)', msg: 'The sign is flipped. Recheck which side the $\\frac{dy}{dx}$ terms moved to.' }, { expr: a + '*y/(2*y)', msg: 'The $' + a + 'x\\,\\frac{dy}{dx}$ term was dropped. It also holds a $\\frac{dy}{dx}$.' }],
            worked: '$' + a + 'y+' + a + 'x\\,y\'=2y\\,y\'$, so $' + a + 'y=y\'(2y-' + a + 'x)$ and $y\'=\\dfrac{' + a + 'y}{2y-' + a + 'x}$.' }; }
        a = INT(r, 2, 6);
        return { type: 'expr', F: 'x^3+y^3-' + a + '*x*y', prompt: 'Differentiate both sides. The right side needs the product rule.', label: '$x^{3}+y^{3}=' + a + 'xy,\\quad \\tfrac{dy}{dx}=$', answer: '(' + a + '*y-3*x^2)/(3*y^2-' + a + '*x)', vars: ['x', 'y'],
          hints: ['Left side: $3x^{2}+3y^{2}\\frac{dy}{dx}$. Right side: $' + a + 'y+' + a + 'x\\,\\frac{dy}{dx}$.', 'Collect the $\\frac{dy}{dx}$ terms on the left.', 'Factor out $\\frac{dy}{dx}$, then divide.'],
          traps: [{ expr: '-x^2/y^2', msg: 'The right side $' + a + 'xy$ is a product: it gives $' + a + 'y+' + a + 'x\\,\\frac{dy}{dx}$.' }],
          worked: '$3x^{2}+3y^{2}y\'=' + a + 'y+' + a + 'x\\,y\'$, so $y\'(3y^{2}-' + a + 'x)=' + a + 'y-3x^{2}$.' };
      } },

      { id: 'term', title: 'Differentiate a y-term', gen: function (b, r) {
        var n, a, it, order, right, wrong, T, tex;
        function ask(tex, T, right, wrong, hint, worked) { order = shuffle(r, [right].concat(wrong)); return { type: 'choice', prompt: '$\\dfrac{d}{dx}\\left(' + tex + '\\right)$ equals…', T: T, options: order, answer: order.indexOf(right), hint: hint, worked: worked }; }
        if (b <= 1) { n = INT(r, 2, 5); right = n + vpow('y', n - 1) + ' · dy/dx';
          return ask('y^{' + n + '}', 'y^' + n, right, [n + vpow('y', n - 1), n + vpow('y', n - 1) + ' · dx/dy', n + vpow('x', n - 1)],
            'Treat $y$ as a function of $x$. Differentiate, then multiply by $\\frac{dy}{dx}$.', 'Power rule gives $' + n + 'y^{' + (n - 1) + '}$. The chain rule adds the factor $\\frac{dy}{dx}$.'); }
        if (b === 2) { n = INT(r, 2, 4); a = INT(r, 2, 6); right = (a * n) + vpow('y', n - 1) + ' · dy/dx';
          return ask(a + 'y^{' + n + '}', a + '*y^' + n, right, [(a * n) + vpow('y', n - 1), a + vpow('y', n - 1) + ' · dy/dx', (a * n) + vpow('x', n - 1)],
            'Multiply the ' + a + ' by the power, lower the power, then add the factor $\\frac{dy}{dx}$.', 'Coefficient: ' + a + ' times ' + n + ' is ' + (a * n) + '. Then the factor $\\frac{dy}{dx}$.'); }
        if (b === 3) { it = pick(r, [
          { tex: 'xy', T: 'x*y', right: 'y + x · dy/dx', wrong: ['y', 'x · dy/dx', 'dy/dx'] },
          { tex: 'x^{2}y', T: 'x^2*y', right: '2xy + x² · dy/dx', wrong: ['2xy', 'x² · dy/dx', '2x · dy/dx'] },
          { tex: 'xy^{2}', T: 'x*y^2', right: 'y² + 2xy · dy/dx', wrong: ['y²', '2xy · dy/dx', '2y · dy/dx'] },
          { tex: 'x^{3}y', T: 'x^3*y', right: '3x²y + x³ · dy/dx', wrong: ['3x²y', 'x³ · dy/dx', '3x² · dy/dx'] }]);
          return ask(it.tex, it.T, it.right, it.wrong, 'This is a product of an $x$-part and a $y$-part. Use the product rule.', 'Product rule: (derivative of the first)(second) + (first)(derivative of the second). The $y$ part brings $\\frac{dy}{dx}$.'); }
        it = pick(r, [
          { tex: '\\sin y', T: 'sin(y)', right: 'cos y · dy/dx', wrong: ['cos y', '−sin y · dy/dx', 'cos y · dx/dy'], w: 'The outside is sine, so cosine; the inside $y$ brings $\\frac{dy}{dx}$.' },
          { tex: 'e^{y}', T: 'e^y', right: 'e^y · dy/dx', wrong: ['e^y', 'y · e^(y−1)', 'e^y · dx/dy'], w: '$e^{u}$ stays $e^{u}$; the inside $y$ brings $\\frac{dy}{dx}$.' },
          { tex: '\\ln y', T: 'ln(y)', right: '(1/y) · dy/dx', wrong: ['1/y', 'y · dy/dx', '(1/x) · dy/dx'], w: '$\\ln u$ gives $1/u$; the inside $y$ brings $\\frac{dy}{dx}$.' },
          { tex: 'x^{2}e^{y}', T: 'x^2*e^y', right: '2x · e^y + x² · e^y · dy/dx', wrong: ['2x · e^y', 'x² · e^y · dy/dx', '2x · e^y · dy/dx'], w: 'Product rule: $2x\\,e^{y}$ plus $x^{2}e^{y}\\frac{dy}{dx}$.' }]);
        return ask(it.tex, it.T, it.right, it.wrong, 'Peel the layers: the outside function first, then the factor $\\frac{dy}{dx}$ from the inside $y$.', it.w);
      } },

      { id: 'point', title: 'Slope at a point', gen: function (b, r) {
        var q, tries = 0;                                                                  // the digit keypad has no fraction key: keep only slopes that are clean decimals
        do { q = b <= 1 ? circlePoint(r) : b === 2 ? ellipsePoint(r) : b === 3 ? tiltPoint(r) : mixedPoint(r); tries++; } while (!terminates(q.m.d) && tries < 80);
        return { type: 'num', F: q.F, pt: [q.x0, q.y0], prompt: 'The point $' + ptTex(q.x0, q.y0) + '$ is on the curve $' + q.tex + '$. Find $\\dfrac{dy}{dx}$ there.', answer: q.m.v,
          hint: b <= 1 ? 'Find $\\frac{dy}{dx}$ first. Then put in both $x=' + q.x0 + '$ and $y=' + q.y0 + '$.' : 'Differentiate implicitly, solve for $\\frac{dy}{dx}$, then put in both coordinates.',
          worked: 'Implicit differentiation gives a slope formula in $x$ and $y$. At $' + ptTex(q.x0, q.y0) + '$ it equals $' + (q.m.d === 1 ? q.m.n : '\\dfrac{' + q.m.n + '}{' + q.m.d + '}') + '$.' };
      } },

      { id: 'tangent', title: 'Tangent line', gen: function (b, r) {
        var q, m0, k, x0, y0s, sl, ans, s, hint;
        if (b <= 3) { q = b <= 1 ? circlePoint(r) : b === 2 ? ellipsePoint(r) : tiltPoint(r);
          ans = q.m.s + '*' + sub(q.x0) + '+(' + q.y0 + ')';
          return { type: 'expr', F: q.F, pt: [q.x0, q.y0], mval: q.m.v, prompt: 'Write the tangent line to the curve at the point.', label: '$' + q.tex + '\\text{ at }' + ptTex(q.x0, q.y0) + ',\\quad y=$', answer: ans, vars: ['x'],
            hints: ['Find $\\frac{dy}{dx}$ first, then put in the point to get the slope.', 'Point-slope form: $y-y_0=m(x-x_0)$.'],
            traps: [{ expr: frac(-q.m.n, q.m.d).s + '*' + sub(q.x0) + '+(' + q.y0 + ')', msg: 'Check the sign of the slope. Put both $x$ and $y$ of the point into $\\frac{dy}{dx}$.' }, { expr: q.m.s + '*' + sub(q.x0), msg: 'The line must pass through the point: add $y_0$ back on.' }],
            worked: 'Slope at the point: $' + (q.m.d === 1 ? q.m.n : '\\dfrac{' + q.m.n + '}{' + q.m.d + '}') + '$. Then $y=m(x-(' + q.x0 + '))+(' + q.y0 + ')$.' }; }
        k = pick(r, [2, 3, 5, 6, 7]); x0 = INT(r, 1, 3); s = sgn(r);
        y0s = (s < 0 ? '-' : '') + 'sqrt(' + k + ')'; sl = (s < 0 ? '' : '-') + x0 + '/sqrt(' + k + ')';
        return { type: 'expr', F: 'x^2+y^2-' + (x0 * x0 + k), pt: [x0, s * Math.sqrt(k)], mval: -x0 / (s * Math.sqrt(k)), prompt: 'Write the tangent line to the curve at the point. Keep the radicals exact.', label: '$x^{2}+y^{2}=' + (x0 * x0 + k) + '\\text{ at }(' + x0 + ',' + (s < 0 ? '-' : '') + '\\sqrt{' + k + '}),\\quad y=$',
          answer: '(' + sl + ')*(x-' + x0 + ')+(' + y0s + ')', vars: ['x'],
          hints: ['$\\frac{dy}{dx}=-\\frac{x}{y}$. Put in $x=' + x0 + '$ and $y=' + (s < 0 ? '-' : '') + '\\sqrt{' + k + '}$.', 'Point-slope form: $y-y_0=m(x-x_0)$.'],
          traps: [{ expr: '(' + (s < 0 ? '-' : '') + x0 + '/sqrt(' + k + '))*(x-' + x0 + ')+(' + y0s + ')', msg: 'Check the sign of the slope: $\\frac{dy}{dx}=-\\frac{x}{y}$, and $y$ has its own sign.' }],
          worked: 'Slope: $-\\dfrac{' + x0 + '}{' + (s < 0 ? '-' : '') + '\\sqrt{' + k + '}}$. Then $y=m(x-' + x0 + ')+(' + (s < 0 ? '-' : '') + '\\sqrt{' + k + '})$.' };
      } }
    ],

    misconceptions: [
      { say: 'd/dx (y²) = 2y.', fix: 'y depends on x. Multiply by dy/dx: 2y · dy/dx.' },
      { say: 'd/dx (xy) = y.', fix: 'It is a product: y + x · dy/dx.' },
      { say: 'Differentiate only the left side.', fix: 'Both sides. A constant on the right becomes 0.' },
      { say: 'The slope is −x/y, so plug in x only.', fix: 'The slope needs both coordinates of the point on the curve.' }
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
